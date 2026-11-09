from __future__ import annotations

import csv
from datetime import datetime
from typing import Any, Iterable

from .customers import build_customers

CsvRow = list[Any]


def _money(paise: Any) -> str:
    try:
        return f"{int(paise or 0) / 100:.2f}"
    except (TypeError, ValueError):
        return "0.00"


def _date(timestamp: Any) -> str:
    try:
        value = int(timestamp or 0)
    except (TypeError, ValueError):
        return ""
    if not value:
        return ""
    return datetime.fromtimestamp(value / 1000).strftime("%Y-%m-%d %H:%M")


def _int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _write_csv(
    path: str,
    headers: list[str],
    rows: Iterable[CsvRow],
) -> None:
    with open(path, "w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.writer(handle)
        writer.writerow(headers)
        writer.writerows(rows)


def _performance(analytics: dict[str, Any] | None) -> dict[str, dict[str, Any]]:
    if not analytics:
        return {}
    return {str(row.get("id")): row for row in analytics.get("performance", [])}


def export_products(
    path: str,
    snapshot: dict[str, Any],
    analytics: dict[str, Any] | None = None,
) -> None:
    rows: list[CsvRow] = []
    for product in sorted(
        snapshot.get("products") or [],
        key=lambda item: str(item.get("name", "")).lower(),
    ):
        price = _int(product.get("price"))
        cost = _int(product.get("cost"), price * 55 // 100)
        margin = ((price - cost) / price * 100) if price else 0
        rows.append(
            [
                product.get("name", ""),
                product.get("slug", ""),
                product.get("category", ""),
                _money(price),
                _money(product.get("compareAtPrice")) if product.get("compareAtPrice") else "",
                _money(cost),
                f"{margin:.1f}",
                _int(product.get("stock")),
                _int(product.get("reorderLevel"), 5),
                "yes" if product.get("featured") else "no",
                product.get("material", ""),
                product.get("tagline", ""),
                product.get("image", ""),
            ]
        )
    _write_csv(
        path,
        [
            "Product",
            "Slug",
            "Category",
            "Price (INR)",
            "Compare at (INR)",
            "Unit cost (INR)",
            "Margin (%)",
            "Stock",
            "Reorder level",
            "Featured",
            "Material",
            "Tagline",
            "Image URL",
        ],
        rows,
    )


def export_inventory(
    path: str,
    snapshot: dict[str, Any],
    analytics: dict[str, Any] | None = None,
) -> None:
    performance = _performance(analytics)
    rows: list[CsvRow] = []
    for product in sorted(
        snapshot.get("products") or [],
        key=lambda item: str(item.get("name", "")).lower(),
    ):
        product_id = str(product.get("_id"))
        stock = _int(product.get("stock"))
        reorder = _int(product.get("reorderLevel"), 5)
        price = _int(product.get("price"))
        cost = _int(product.get("cost"), price * 55 // 100)
        status = "Out of stock" if stock == 0 else "Low stock" if stock <= reorder else "In stock"
        cover = performance.get(product_id, {}).get("cover_days")
        rows.append(
            [
                product.get("name", ""),
                product.get("category", ""),
                stock,
                reorder,
                status,
                _money(cost),
                _money(stock * cost),
                _money(stock * price),
                f"{cover:.1f}" if isinstance(cover, (int, float)) else "",
            ]
        )
    _write_csv(
        path,
        [
            "Product",
            "Category",
            "On hand",
            "Reorder level",
            "Status",
            "Unit cost (INR)",
            "Stock value at cost (INR)",
            "Stock value at retail (INR)",
            "Cover (days)",
        ],
        rows,
    )


def export_orders(
    path: str,
    snapshot: dict[str, Any],
    analytics: dict[str, Any] | None = None,
) -> None:
    rows: list[CsvRow] = []
    for order in sorted(
        snapshot.get("orders") or [],
        key=lambda item: _int(item.get("createdAt") or item.get("_creationTime")),
        reverse=True,
    ):
        customer = order.get("customer") or {}
        payment = order.get("payment") or {}
        address = order.get("shippingAddress") or {}
        items = order.get("items") or []
        summary = "; ".join(
            f"{_int(item.get('quantity'), 1)}x {item.get('name', 'Product')}"
            for item in items
        )
        rows.append(
            [
                order.get("number", ""),
                _date(order.get("createdAt") or order.get("_creationTime")),
                order.get("status", ""),
                payment.get("status", ""),
                customer.get("name", ""),
                customer.get("email", ""),
                len(items),
                summary,
                _money(order.get("subtotal")),
                _money(order.get("shipping")),
                _money(order.get("tax")),
                _money(order.get("total")),
                address.get("city", ""),
                address.get("region", ""),
                address.get("postalCode", ""),
                address.get("country", ""),
            ]
        )
    _write_csv(
        path,
        [
            "Order",
            "Placed",
            "Order status",
            "Payment status",
            "Customer",
            "Email",
            "Items",
            "Item summary",
            "Subtotal (INR)",
            "Shipping (INR)",
            "GST (INR)",
            "Total (INR)",
            "City",
            "State",
            "PIN code",
            "Country",
        ],
        rows,
    )


def export_customers(
    path: str,
    snapshot: dict[str, Any],
    analytics: dict[str, Any] | None = None,
) -> None:
    rows: list[CsvRow] = []
    for customer in build_customers(snapshot):
        rows.append(
            [
                customer["name"],
                customer["email"],
                customer["segment"],
                customer["orders"],
                customer["cancelled"],
                _money(customer["spend"]),
                _money(customer["average_order"]),
                customer["last_order_label"],
            ]
        )
    _write_csv(
        path,
        [
            "Customer",
            "Email",
            "Segment",
            "Orders",
            "Cancelled",
            "Lifetime spend (INR)",
            "Average order (INR)",
            "Last order",
        ],
        rows,
    )
