from __future__ import annotations

import time
from collections import defaultdict
from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Any, Iterable

MS_PER_DAY = 86_400_000


# ---------------------------------------------------------------------------
# Money helpers (all amounts are integer paise)


def parse_inr(text: str) -> int:
    cleaned = (
        str(text)
        .replace("₹", "")
        .replace(",", "")
        .replace(" ", "")
        .strip()
    )
    if not cleaned:
        raise ValueError("Enter an amount.")
    try:
        value = Decimal(cleaned)
    except InvalidOperation as error:
        raise ValueError("Enter a valid amount.") from error
    if value < 0:
        raise ValueError("Amount cannot be negative.")
    return int((value * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def indian_grouping(integer: int) -> str:
    sign = "-" if integer < 0 else ""
    digits = str(abs(int(integer)))
    if len(digits) <= 3:
        return sign + digits
    tail = digits[-3:]
    head = digits[:-3]
    groups: list[str] = []
    while len(head) > 2:
        groups.insert(0, head[-2:])
        head = head[:-2]
    if head:
        groups.insert(0, head)
    return sign + ",".join(groups + [tail])


def format_inr(paise: float | int, decimals: bool | None = None) -> str:
    value = int(round(paise))
    negative = value < 0
    value = abs(value)
    rupees, fraction = divmod(value, 100)
    show_fraction = fraction != 0 if decimals is None else decimals
    text = f"₹{indian_grouping(rupees)}"
    if show_fraction:
        text += f".{fraction:02d}"
    return ("-" if negative else "") + text


def format_inr_compact(paise: float | int) -> str:
    rupees = abs(float(paise)) / 100
    sign = "-" if paise < 0 else ""
    if rupees >= 10_000_000:
        return f"{sign}₹{rupees / 10_000_000:.2f}Cr"
    if rupees >= 100_000:
        return f"{sign}₹{rupees / 100_000:.1f}L"
    if rupees >= 1_000:
        return f"{sign}₹{rupees / 1_000:.1f}k"
    return f"{sign}₹{rupees:,.0f}"


def format_pct(value: float | None, digits: int = 1) -> str:
    if value is None:
        return "—"
    return f"{value:.{digits}f}%"


def _safe_int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _product_cost(product: dict[str, Any] | None, item_price: int) -> int:
    if product:
        cost = product.get("cost")
        if cost is not None:
            return max(0, _safe_int(cost))
    return int(round(item_price * 0.55))


def _reorder_level(product: dict[str, Any]) -> int:
    return max(0, _safe_int(product.get("reorderLevel"), 5))


def _pct_change(current: float, previous: float) -> float | None:
    if previous == 0:
        return None if current == 0 else 100.0
    return (current - previous) / previous * 100


def _date_label(day: date, long: bool = False) -> str:
    return day.strftime("%d %b %Y" if long else "%d %b")


def _aggregate(
    orders: Iterable[dict[str, Any]],
    products_by_id: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    revenue = 0
    units = 0
    cogs = 0
    order_count = 0
    product_stats: dict[str, dict[str, Any]] = defaultdict(
        lambda: {"units": 0, "revenue": 0, "profit": 0, "name": ""}
    )
    category_revenue: dict[str, int] = defaultdict(int)
    weekday_revenue = [0] * 7

    for order in orders:
        if order.get("status") == "cancelled":
            continue
        order_count += 1
        revenue += _safe_int(order.get("total"))
        created = _safe_int(order.get("createdAt"))
        if created:
            weekday_revenue[datetime.fromtimestamp(created / 1000).weekday()] += _safe_int(
                order.get("total")
            )
        for item in order.get("items") or []:
            quantity = max(0, _safe_int(item.get("quantity")))
            price = max(0, _safe_int(item.get("price")))
            product_id = str(item.get("productId") or item.get("slug") or item.get("name"))
            product = products_by_id.get(str(item.get("productId")))
            cost = _product_cost(product, price)
            line_revenue = price * quantity
            line_profit = (price - cost) * quantity
            units += quantity
            cogs += cost * quantity
            stats = product_stats[product_id]
            stats["name"] = product.get("name") if product else item.get("name", "Product")
            stats["units"] += quantity
            stats["revenue"] += line_revenue
            stats["profit"] += line_profit
            category = product.get("category", "Other") if product else "Other"
            category_revenue[str(category)] += line_revenue

    merch_revenue = sum(stats["revenue"] for stats in product_stats.values())
    gross_profit = merch_revenue - cogs
    margin = (gross_profit / merch_revenue * 100) if merch_revenue else 0.0
    return {
        "revenue": revenue,
        "merch_revenue": merch_revenue,
        "orders": order_count,
        "units": units,
        "cogs": cogs,
        "gross_profit": gross_profit,
        "margin_pct": margin,
        "aov": (revenue / order_count) if order_count else 0,
        "product_stats": dict(product_stats),
        "category_revenue": dict(category_revenue),
        "weekday_revenue": weekday_revenue,
    }


def _recommendation(
    *,
    units: int,
    revenue: int,
    margin: float,
    stock: int,
    reorder: int,
    revenue_rank: int,
    product_count: int,
    score: float,
) -> str:
    if stock == 0 and units > 0:
        return "Restock now"
    if stock <= reorder and units > 0:
        return "Restock"
    if units == 0 and stock > max(reorder * 2, 8):
        return "Clear stock"
    if units == 0:
        return "Slow mover"
    if margin < 22:
        return "Thin margin"
    if revenue_rank <= max(1, product_count // 4) and score >= 55:
        return "Star"
    if score >= 35:
        return "Steady"
    return "Watch"


def build_analytics(
    snapshot: dict[str, Any],
    days: int = 30,
    *,
    now_ms: int | None = None,
) -> dict[str, Any]:
    """Return a single analytics payload used by every desktop screen."""
    days = max(1, int(days))
    now = int(now_ms if now_ms is not None else time.time() * 1000)
    cutoff = now - (days - 1) * MS_PER_DAY
    previous_cutoff = cutoff - days * MS_PER_DAY

    products = list(snapshot.get("products") or [])
    products_by_id = {str(product.get("_id")): product for product in products}
    orders = list(snapshot.get("orders") or [])
    payments = list(snapshot.get("payments") or [])

    current_orders = [
        order for order in orders if _safe_int(order.get("createdAt")) >= cutoff
    ]
    previous_orders = [
        order
        for order in orders
        if previous_cutoff
        <= _safe_int(order.get("createdAt"))
        < cutoff
    ]

    current = _aggregate(current_orders, products_by_id)
    previous = _aggregate(previous_orders, products_by_id)

    refunds = sum(
        _safe_int(payment.get("amount"))
        for payment in payments
        if payment.get("status") == "refunded"
        and _safe_int(payment.get("createdAt")) >= cutoff
    )
    refunded_count = sum(
        1
        for payment in payments
        if payment.get("status") == "refunded"
        and _safe_int(payment.get("createdAt")) >= cutoff
    )

    inventory_retail = 0
    inventory_cost = 0
    total_stock = 0
    low_stock: list[dict[str, Any]] = []
    stock_by_category: dict[str, int] = defaultdict(int)
    for product in products:
        stock = max(0, _safe_int(product.get("stock")))
        price = max(0, _safe_int(product.get("price")))
        cost = _product_cost(product, price)
        inventory_retail += stock * price
        inventory_cost += stock * cost
        total_stock += stock
        stock_by_category[str(product.get("category", "Other"))] += stock * price
        if stock <= _reorder_level(product):
            low_stock.append(
                {
                    "id": product.get("_id"),
                    "name": product.get("name", "Product"),
                    "stock": stock,
                    "reorder": _reorder_level(product),
                    "value": stock * price,
                }
            )
    low_stock.sort(key=lambda item: (item["stock"] - item["reorder"], item["name"]))
    out_of_stock = sum(1 for item in low_stock if item["stock"] == 0)

    # Daily revenue series, always covering the selected window.
    start_day = datetime.fromtimestamp(cutoff / 1000).date()
    end_day = datetime.fromtimestamp(now / 1000).date()
    bucket: dict[date, dict[str, int]] = {}
    day = start_day
    while day <= end_day:
        bucket[day] = {"revenue": 0, "orders": 0}
        day += timedelta(days=1)
    for order in current_orders:
        if order.get("status") == "cancelled":
            continue
        created = _safe_int(order.get("createdAt"))
        if not created:
            continue
        day = datetime.fromtimestamp(created / 1000).date()
        if day in bucket:
            bucket[day]["revenue"] += _safe_int(order.get("total"))
            bucket[day]["orders"] += 1
    revenue_series = [
        {
            "date": day.isoformat(),
            "label": _date_label(day),
            "long_label": _date_label(day, long=True),
            "revenue": values["revenue"],
            "orders": values["orders"],
        }
        for day, values in sorted(bucket.items())
    ]

    sold = current["product_stats"]
    revenue_values = [stats["revenue"] for stats in sold.values()]
    unit_values = [stats["units"] for stats in sold.values()]
    max_revenue = max(revenue_values, default=0)
    max_units = max(unit_values, default=0)

    performance: list[dict[str, Any]] = []
    for product in products:
        pid = str(product.get("_id"))
        stats = sold.get(pid, {"units": 0, "revenue": 0, "profit": 0, "name": ""})
        stock = max(0, _safe_int(product.get("stock")))
        price = max(0, _safe_int(product.get("price")))
        units = stats["units"]
        revenue = stats["revenue"]
        margin = (stats["profit"] / revenue * 100) if revenue else 0.0
        sell_through = (units / (units + stock) * 100) if (units + stock) else 0.0
        velocity = units / days
        cover_days = (stock / velocity) if velocity > 0 else None
        revenue_norm = (revenue / max_revenue) if max_revenue else 0.0
        unit_norm = (units / max_units) if max_units else 0.0
        margin_norm = min(max(margin, 0), 60) / 60
        score = (revenue_norm * 55) + (unit_norm * 25) + (margin_norm * 20)
        performance.append(
            {
                "id": product.get("_id"),
                "name": product.get("name", "Product"),
                "category": product.get("category", "Other"),
                "price": price,
                "cost": _product_cost(product, price),
                "stock": stock,
                "reorder": _reorder_level(product),
                "units": units,
                "revenue": revenue,
                "profit": stats["profit"],
                "margin_pct": margin,
                "sell_through": sell_through,
                "cover_days": cover_days,
                "score": score,
                "featured": bool(product.get("featured")),
            }
        )

    performance.sort(key=lambda row: row["revenue"], reverse=True)
    for rank, row in enumerate(performance, start=1):
        row["revenue_rank"] = rank
        row["recommendation"] = _recommendation(
            units=row["units"],
            revenue=row["revenue"],
            margin=row["margin_pct"],
            stock=row["stock"],
            reorder=row["reorder"],
            revenue_rank=rank,
            product_count=len(performance),
            score=row["score"],
        )

    top_products = [row for row in performance if row["revenue"] > 0][:8]
    category_revenue = sorted(
        current["category_revenue"].items(), key=lambda item: item[1], reverse=True
    )
    weekday_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekday_revenue = [
        {"label": label, "revenue": value}
        for label, value in zip(weekday_labels, current["weekday_revenue"])
    ]
    stock_categories = sorted(
        stock_by_category.items(), key=lambda item: item[1], reverse=True
    )

    recent_orders = []
    for order in sorted(orders, key=lambda item: _safe_int(item.get("createdAt")), reverse=True)[
        :6
    ]:
        payment = order.get("payment") or {}
        customer = order.get("customer") or {}
        recent_orders.append(
            {
                "id": order.get("_id"),
                "number": order.get("number", "—"),
                "created_at": _safe_int(order.get("createdAt")),
                "customer": customer.get("name") or customer.get("email") or "Guest",
                "total": _safe_int(order.get("total")),
                "status": order.get("status", "paid"),
                "payment_status": payment.get("status", "—"),
            }
        )

    revenue = current["revenue"]
    refund_rate = (refunds / revenue * 100) if revenue else 0.0
    insights: list[str] = []
    if current["orders"] == 0:
        insights.append(
            "No sales in this period yet. Product and revenue trends will appear as orders arrive."
        )
    else:
        if performance and performance[0]["revenue"] > 0:
            leader = performance[0]
            share = leader["revenue"] / revenue * 100 if revenue else 0
            insights.append(
                f"{leader['name']} leads with {format_inr(leader['revenue'])} in revenue "
                f"({share:.0f}% of the period)."
            )
        best_margin = max(
            (row for row in performance if row["units"] > 0),
            key=lambda row: row["margin_pct"],
            default=None,
        )
        if best_margin:
            insights.append(
                f"Best margin: {best_margin['name']} at {best_margin['margin_pct']:.0f}% "
                f"gross margin."
            )
        if low_stock:
            first = low_stock[0]
            insights.append(
                f"{len(low_stock)} product{'s' if len(low_stock) != 1 else ''} at or below "
                f"reorder level. Start with {first['name']} ({first['stock']} left)."
            )
        slow = next(
            (
                row
                for row in sorted(
                    performance, key=lambda row: row["stock"], reverse=True
                )
                if row["units"] == 0 and row["stock"] > 0
            ),
            None,
        )
        if slow:
            insights.append(
                f"{slow['name']} has {slow['stock']} units and no sales this period — "
                f"{format_inr(slow['stock'] * slow['price'])} tied up in stock."
            )
        if refunds:
            insights.append(
                f"{refunded_count} refund{'s' if refunded_count != 1 else ''} worth "
                f"{format_inr(refunds)} in this period ({refund_rate:.1f}% of revenue)."
            )

    return {
        "days": days,
        "generated_at": now,
        "kpis": {
            "revenue": revenue,
            "net_revenue": max(revenue - refunds, 0),
            "orders": current["orders"],
            "units": current["units"],
            "aov": current["aov"],
            "gross_profit": current["gross_profit"],
            "margin_pct": current["margin_pct"],
            "cogs": current["cogs"],
            "refunds": refunds,
            "refund_rate": refund_rate,
            "inventory_retail": inventory_retail,
            "inventory_cost": inventory_cost,
            "stock_units": total_stock,
            "low_stock": len(low_stock),
            "out_of_stock": out_of_stock,
            "sell_through": (
                current["units"] / (current["units"] + total_stock) * 100
                if (current["units"] + total_stock)
                else 0.0
            ),
            "revenue_delta": _pct_change(revenue, previous["revenue"]),
            "orders_delta": _pct_change(current["orders"], previous["orders"]),
            "previous_revenue": previous["revenue"],
        },
        "revenue_series": revenue_series,
        "orders_series": [
            {"label": point["label"], "orders": point["orders"]}
            for point in revenue_series
        ],
        "category_revenue": [
            {"label": label, "revenue": value} for label, value in category_revenue
        ],
        "top_products": top_products,
        "performance": performance,
        "low_stock": low_stock,
        "stock_by_category": [
            {"label": label, "value": value} for label, value in stock_categories
        ],
        "weekday_revenue": weekday_revenue,
        "recent_orders": recent_orders,
        "insights": insights,
        "product_count": len(products),
        "order_count": len(orders),
        "payment_count": len(payments),
    }


def product_payload(product: dict[str, Any], **overrides: Any) -> dict[str, Any]:
    """Build a full products:update payload from a stored product document."""
    payload: dict[str, Any] = {
        "productId": product.get("_id"),
        "name": product.get("name", ""),
        "category": product.get("category", ""),
        "tagline": product.get("tagline", ""),
        "description": product.get("description", ""),
        "price": _safe_int(product.get("price")),
        "image": product.get("image", ""),
        "material": product.get("material", ""),
        "stock": _safe_int(product.get("stock")),
        "featured": bool(product.get("featured")),
        "cost": _safe_int(product.get("cost"), _safe_int(product.get("price")) * 55 // 100),
        "reorderLevel": _safe_int(product.get("reorderLevel"), 5),
    }
    if product.get("compareAtPrice") is not None:
        payload["compareAtPrice"] = _safe_int(product.get("compareAtPrice"))
    payload.update(overrides)
    return payload
