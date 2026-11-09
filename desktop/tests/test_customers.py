from __future__ import annotations

import csv
import os
import tempfile
import unittest

from forma_inventory.analytics import build_analytics
from forma_inventory.customers import build_customers
from forma_inventory.export import (
    export_customers,
    export_inventory,
    export_orders,
    export_products,
)

NOW = 1_700_000_000_000
DAY = 86_400_000

PRODUCTS = [
    {
        "_id": "p1",
        "name": "Arc Headphones",
        "slug": "arc-headphones",
        "category": "Audio",
        "tagline": "Quiet",
        "description": "Test",
        "price": 100_000,
        "cost": 60_000,
        "stock": 2,
        "reorderLevel": 5,
        "featured": True,
        "material": "Steel",
        "image": "https://example.com/arc.jpg",
    },
    {
        "_id": "p2",
        "name": "Field Watch",
        "slug": "field-watch",
        "category": "Wearables",
        "tagline": "Time",
        "description": "Test",
        "price": 50_000,
        "cost": 40_000,
        "stock": 20,
        "reorderLevel": 3,
        "featured": False,
        "material": "Steel",
        "image": "https://example.com/watch.jpg",
    },
]


def order(
    order_id: str,
    user_id: str,
    number: str,
    status: str,
    total: int,
    when: int,
    name: str = "",
    email: str = "",
) -> dict:
    return {
        "_id": order_id,
        "userId": user_id,
        "number": number,
        "status": status,
        "createdAt": when,
        "total": total,
        "items": [
            {
                "productId": "p1",
                "name": "Arc Headphones",
                "slug": "arc-headphones",
                "price": 100_000,
                "quantity": 1,
            }
        ],
        "shippingAddress": {
            "fullName": name,
            "line1": "1 Road",
            "city": "Pune",
            "region": "MH",
            "postalCode": "411001",
            "country": "India",
        },
        "customer": {"name": name, "email": email} if name or email else None,
        "payment": {"status": "refunded" if status == "cancelled" else "succeeded"},
    }


ORDERS = [
    order("o1", "u1", "FRM-1", "paid", 100_000, NOW - DAY, "Asha Rao", "asha@example.com"),
    order("o2", "u1", "FRM-2", "paid", 50_000, NOW - 2 * DAY, "Asha Rao", "asha@example.com"),
    order("o3", "u2", "FRM-3", "delivered", 2_500_000, NOW - 3 * DAY, "Vikram Shah", "vikram@example.com"),
    order("o4", "u3", "FRM-4", "cancelled", 100_000, NOW - 4 * DAY, "Neha Gupta", "neha@example.com"),
    order("o5", "", "FRM-5", "paid", 50_000, NOW - 5 * DAY, "", "guest@example.com"),
]

SNAPSHOT = {"products": PRODUCTS, "orders": ORDERS, "payments": []}


class CustomerTests(unittest.TestCase):
    def test_groups_orders_and_excludes_cancelled_spend(self) -> None:
        customers = build_customers(SNAPSHOT, now_ms=NOW)
        by_email = {customer["email"]: customer for customer in customers}

        asha = by_email["asha@example.com"]
        self.assertEqual(asha["orders"], 2)
        self.assertEqual(asha["spend"], 150_000)
        self.assertEqual(asha["average_order"], 75_000)
        self.assertEqual(asha["segment"], "Repeat")

        vikram = by_email["vikram@example.com"]
        self.assertEqual(vikram["segment"], "VIP")

        neha = by_email["neha@example.com"]
        self.assertEqual(neha["spend"], 0)
        self.assertEqual(neha["segment"], "Cancelled")

        guest = by_email["guest@example.com"]
        self.assertEqual(guest["segment"], "New")

    def test_recent_orders_newest_first(self) -> None:
        customers = build_customers(SNAPSHOT, now_ms=NOW)
        asha = next(customer for customer in customers if customer["email"] == "asha@example.com")
        self.assertEqual([item["number"] for item in asha["recent_orders"]], ["FRM-1", "FRM-2"])

    def test_csv_exports_write_headers_and_rows(self) -> None:
        analytics = build_analytics(SNAPSHOT, days=30, now_ms=NOW)
        with tempfile.TemporaryDirectory() as directory:
            paths = {
                name: os.path.join(directory, f"{name}.csv")
                for name in ("products", "inventory", "orders", "customers")
            }
            export_products(paths["products"], SNAPSHOT, analytics)
            export_inventory(paths["inventory"], SNAPSHOT, analytics)
            export_orders(paths["orders"], SNAPSHOT, analytics)
            export_customers(paths["customers"], SNAPSHOT, analytics)

            with open(paths["products"], encoding="utf-8-sig", newline="") as handle:
                rows = list(csv.reader(handle))
            self.assertEqual(rows[0][0], "Product")
            self.assertEqual(len(rows), 3)

            with open(paths["orders"], encoding="utf-8-sig", newline="") as handle:
                rows = list(csv.reader(handle))
            self.assertEqual(rows[0][0], "Order")
            self.assertEqual(len(rows), 6)

            with open(paths["customers"], encoding="utf-8-sig", newline="") as handle:
                rows = list(csv.reader(handle))
            self.assertEqual(rows[0][0], "Customer")
            self.assertEqual(len(rows), 5)


if __name__ == "__main__":
    unittest.main()
