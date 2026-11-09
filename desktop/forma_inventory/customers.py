from __future__ import annotations

import time
from datetime import datetime
from typing import Any

MS_PER_DAY = 86_400_000


def _int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _when(timestamp: int) -> str:
    if not timestamp:
        return "—"
    return datetime.fromtimestamp(timestamp / 1000).strftime("%d %b %Y")


def build_customers(
    snapshot: dict[str, Any],
    *,
    now_ms: int | None = None,
) -> list[dict[str, Any]]:
    """Group orders into customer profiles for the admin console.

    Cancelled orders are kept for the order count but excluded from lifetime
    spend. A customer is identified by their user id, falling back to email for
    older or guest-like records.
    """
    now = int(now_ms if now_ms is not None else time.time() * 1000)
    profiles: dict[str, dict[str, Any]] = {}

    for order in snapshot.get("orders") or []:
        customer = order.get("customer") or {}
        email = str(customer.get("email") or "").strip()
        name = str(customer.get("name") or "").strip()
        key = str(order.get("userId") or email.lower() or "guest")
        if key == "guest" and not email and not name:
            continue

        profile = profiles.setdefault(
            key,
            {
                "key": key,
                "name": name or email or "Guest",
                "email": email,
                "orders": 0,
                "cancelled": 0,
                "spend": 0,
                "last_order": 0,
                "recent_orders": [],
            },
        )
        if name:
            profile["name"] = name
        if email:
            profile["email"] = email
        profile["orders"] += 1
        created = _int(order.get("createdAt") or order.get("_creationTime"))
        status = str(order.get("status") or "paid")
        if status == "cancelled":
            profile["cancelled"] += 1
        else:
            profile["spend"] += _int(order.get("total"))
            profile["last_order"] = max(profile["last_order"], created)
            profile["recent_orders"].append(
                {
                    "number": order.get("number", "—"),
                    "created_at": created,
                    "total": _int(order.get("total")),
                    "status": status,
                }
            )

    customers = list(profiles.values())
    for profile in customers:
        paid_orders = profile["orders"] - profile["cancelled"]
        profile["paid_orders"] = paid_orders
        profile["average_order"] = (
            profile["spend"] / paid_orders if paid_orders else 0
        )
        profile["last_order_label"] = _when(profile["last_order"])
        profile["recent_orders"].sort(
            key=lambda order: order["created_at"], reverse=True
        )
        profile["recent_orders"] = profile["recent_orders"][:5]
        profile["days_since_order"] = (
            max(0, (now - profile["last_order"]) // MS_PER_DAY)
            if profile["last_order"]
            else None
        )
        if paid_orders == 0:
            segment = "Cancelled"
        elif profile["spend"] >= 2_000_000:
            segment = "VIP"
        elif profile["days_since_order"] is not None and profile["days_since_order"] > 90 and paid_orders >= 2:
            segment = "At risk"
        elif paid_orders >= 2:
            segment = "Repeat"
        else:
            segment = "New"
        profile["segment"] = segment

    customers.sort(
        key=lambda profile: (profile["spend"], profile["last_order"]),
        reverse=True,
    )
    return customers
