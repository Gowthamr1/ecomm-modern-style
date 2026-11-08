from __future__ import annotations

import unittest

from forma_inventory.analytics import (
    build_analytics,
    format_inr,
    format_inr_compact,
    parse_inr,
    product_payload,
)

NOW = 1_700_000_000_000
DAY = 86_400_000

PRODUCTS = [
    {
        "_id": "p1",
        "name": "Arc Headphones",
        "category": "Audio",
        "price": 100_000,
        "cost": 60_000,
        "stock": 2,
        "reorderLevel": 5,
        "featured": True,
    },
    {
        "_id": "p2",
        "name": "Field Watch",
        "category": "Wearables",
        "price": 50_000,
        "cost": 40_000,
        "stock": 20,
        "reorderLevel": 3,
        "featured": False,
    },
]

ORDERS = [
    {
        "_id": "o1",
        "number": "FRM-1",
        "status": "paid",
        "createdAt": NOW - DAY,
        "total": 118_000,
        "items": [{"productId": "p1", "name": "Arc Headphones", "price": 100_000, "quantity": 1}],
        "customer": {"name": "Asha"},
        "payment": {"status": "succeeded"},
    },
    {
        "_id": "o2",
        "number": "FRM-2",
        "status": "cancelled",
        "createdAt": NOW - 2 * DAY,
        "total": 59_000,
        "items": [{"productId": "p2", "name": "Field Watch", "price": 50_000, "quantity": 1}],
        "customer": {},
        "payment": {"status": "refunded"},
    },
    {
        "_id": "o3",
        "number": "FRM-3",
        "status": "paid",
        "createdAt": NOW - 40 * DAY,
        "total": 59_000,
        "items": [{"productId": "p2", "name": "Field Watch", "price": 50_000, "quantity": 1}],
        "customer": {"email": "old@example.com"},
        "payment": {"status": "succeeded"},
    },
]

PAYMENTS = [
    {"amount": 118_000, "status": "succeeded", "createdAt": NOW - DAY},
    {"amount": 59_000, "status": "refunded", "createdAt": NOW - 2 * DAY},
]

SNAPSHOT = {"products": PRODUCTS, "orders": ORDERS, "payments": PAYMENTS}


class AnalyticsTests(unittest.TestCase):
    def test_inr_formatting(self) -> None:
        self.assertEqual(format_inr(1_568_700), "₹15,687")
        self.assertEqual(format_inr(1_568_750), "₹15,687.50")
        self.assertEqual(format_inr_compact(1_568_700), "₹15.7k")
        self.assertEqual(format_inr_compact(12_000_000), "₹1.2L")
        self.assertEqual(parse_inr("₹15,687.50"), 1_568_750)
        self.assertEqual(parse_inr("199"), 19_900)
        with self.assertRaises(ValueError):
            parse_inr("-1")

    def test_period_metrics_exclude_cancelled_orders(self) -> None:
        data = build_analytics(SNAPSHOT, days=30, now_ms=NOW)
        self.assertEqual(data["kpis"]["revenue"], 118_000)
        self.assertEqual(data["kpis"]["orders"], 1)
        self.assertEqual(data["kpis"]["units"], 1)
        self.assertEqual(data["kpis"]["aov"], 118_000)
        self.assertEqual(data["kpis"]["gross_profit"], 40_000)
        self.assertEqual(data["kpis"]["margin_pct"], 40.0)
        self.assertEqual(data["kpis"]["refunds"], 59_000)
        self.assertEqual(data["kpis"]["net_revenue"], 59_000)
        self.assertEqual(len(data["revenue_series"]), 30)

    def test_product_recommendations(self) -> None:
        data = build_analytics(SNAPSHOT, days=30, now_ms=NOW)
        performance = {row["name"]: row for row in data["performance"]}
        self.assertEqual(performance["Arc Headphones"]["recommendation"], "Restock")
        self.assertEqual(performance["Field Watch"]["recommendation"], "Clear stock")
        self.assertEqual(data["top_products"][0]["name"], "Arc Headphones")
        self.assertEqual(data["category_revenue"][0]["label"], "Audio")

    def test_inventory_and_stock_alerts(self) -> None:
        data = build_analytics(SNAPSHOT, days=30, now_ms=NOW)
        kpis = data["kpis"]
        self.assertEqual(kpis["inventory_retail"], 1_200_000)
        self.assertEqual(kpis["inventory_cost"], 920_000)
        self.assertEqual(kpis["stock_units"], 22)
        self.assertEqual(kpis["low_stock"], 1)
        self.assertEqual(data["low_stock"][0]["name"], "Arc Headphones")

    def test_range_does_not_leak_prior_orders(self) -> None:
        data = build_analytics(SNAPSHOT, days=90, now_ms=NOW)
        self.assertEqual(data["kpis"]["orders"], 2)
        self.assertEqual(data["kpis"]["units"], 2)
        self.assertEqual(len(data["revenue_series"]), 90)

    def test_empty_snapshot(self) -> None:
        data = build_analytics(
            {"products": [], "orders": [], "payments": []}, days=30, now_ms=NOW
        )
        self.assertEqual(data["kpis"]["revenue"], 0)
        self.assertEqual(data["kpis"]["orders"], 0)
        self.assertEqual(data["top_products"], [])
        self.assertTrue(data["insights"])

    def test_product_payload_preserves_optional_compare_price(self) -> None:
        payload = product_payload(PRODUCTS[0])
        self.assertEqual(payload["price"], 100_000)
        self.assertEqual(payload["cost"], 60_000)
        self.assertEqual(payload["stock"], 2)
        self.assertNotIn("compareAtPrice", payload)
        product = dict(PRODUCTS[0], compareAtPrice=120_000)
        payload = product_payload(product, stock=9)
        self.assertEqual(payload["compareAtPrice"], 120_000)
        self.assertEqual(payload["stock"], 9)


if __name__ == "__main__":
    unittest.main()
