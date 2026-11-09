from __future__ import annotations

import tkinter as tk
from datetime import datetime
from tkinter import messagebox
from typing import Any

import customtkinter as ctk

from .. import theme
from ..analytics import format_inr
from .base import Page
from .components import DataTable, Pill, body, display_font, font, label_caps, muted


class OrdersPage(Page):
    def __init__(self, master: tk.Misc, app: Any) -> None:
        super().__init__(master, app)
        self._orders: list[dict[str, Any]] = []
        self._selected: dict[str, Any] | None = None
        self._filter = tk.StringVar(value="All")
        self._query = tk.StringVar()
        self._build()

    def _build(self) -> None:
        top = ctk.CTkFrame(self, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(24, 0))
        top.grid_columnconfigure(0, weight=1)
        label_caps(top, "Fulfilment").grid(row=0, column=0, sticky="w")
        ctk.CTkLabel(
            top,
            text="Orders.",
            text_color=theme.INK,
            font=display_font(30),
            anchor="w",
        ).grid(row=1, column=0, sticky="w", pady=(4, 0))
        self.subtitle = muted(top, "Loading orders…", size=10)
        self.subtitle.grid(row=2, column=0, sticky="w", pady=(3, 0))

        tools = ctk.CTkFrame(self, fg_color="transparent")
        tools.pack(fill="x", padx=30, pady=(18, 0))
        tools.grid_columnconfigure(0, weight=1)
        self.search = ctk.CTkEntry(
            tools,
            height=38,
            corner_radius=10,
            border_color=theme.LINE,
            fg_color=theme.CARD,
            placeholder_text="Search order number, customer or email…",
            font=font(10),
            textvariable=self._query,
        )
        self.search.grid(row=0, column=0, sticky="ew", padx=(0, 10))
        self.search.bind("<KeyRelease>", lambda _event: self._render())
        self.filter = ctk.CTkSegmentedButton(
            tools,
            values=["All", "Paid", "Shipped", "Delivered", "Cancelled"],
            variable=self._filter,
            command=lambda _value: self._render(),
            selected_color=theme.PINE,
            selected_hover_color=theme.PINE_SOFT,
            unselected_color=theme.CARD,
            unselected_hover_color=theme.PAPER_DEEP,
            fg_color=theme.PAPER_DEEP,
            text_color=theme.INK_SOFT,
            font=font(9),
            height=34,
        )
        self.filter.grid(row=0, column=1, sticky="e")
        self.count_note = muted(tools, "", size=9)
        self.count_note.grid(row=0, column=2, sticky="e", padx=(12, 0))

        table_card = ctk.CTkFrame(
            self,
            fg_color=theme.CARD,
            corner_radius=16,
            border_width=1,
            border_color=theme.LINE,
        )
        table_card.pack(fill="both", expand=True, padx=30, pady=(12, 0))
        self.table = DataTable(
            table_card,
            [
                ("number", "Order", 120, "w"),
                ("placed", "Placed", 125, "w"),
                ("customer", "Customer", 200, "w"),
                ("items", "Items", 60, "e"),
                ("total", "Total", 115, "e"),
                ("status", "Order status", 105, "w"),
                ("payment", "Payment", 105, "w"),
            ],
            on_select=self._on_select,
            empty_message="No orders match this filter",
            height=9,
        )
        self.table.pack(fill="both", expand=True, padx=8, pady=8)

        self.detail = ctk.CTkFrame(
            self,
            fg_color=theme.CARD,
            corner_radius=16,
            border_width=1,
            border_color=theme.LINE,
        )
        self.detail.pack(fill="x", padx=30, pady=(14, 26))
        self._empty_detail()

    def _empty_detail(self) -> None:
        for child in self.detail.winfo_children():
            child.destroy()
        muted(
            self.detail,
            "Select an order to see its line items, delivery address and actions.",
            size=10,
        ).pack(anchor="w", padx=20, pady=24)

    def update_data(self, analytics: dict[str, Any], snapshot: dict[str, Any]) -> None:
        self._orders = list(snapshot.get("orders") or [])
        self.subtitle.configure(
            text=(
                f"{len(self._orders)} orders all time · "
                f"{format_inr(analytics['kpis']['revenue'])} in the selected period"
            )
        )
        self._render()

    def _render(self) -> None:
        mode = self._filter.get().lower()
        query = self._query.get().strip().lower()
        rows = []
        for order in self._orders:
            status = str(order.get("status", "paid"))
            if mode != "all" and status != mode:
                continue
            payment = order.get("payment") or {}
            customer = order.get("customer") or {}
            address = order.get("shippingAddress") or {}
            haystack = " ".join(
                str(value or "")
                for value in (
                    order.get("number"),
                    customer.get("name"),
                    customer.get("email"),
                    address.get("city"),
                    address.get("region"),
                )
            ).lower()
            if query and query not in haystack:
                continue
            created = _int(order.get("createdAt"))
            tag = (
                "low"
                if status == "cancelled"
                else "good"
                if status == "delivered"
                else ""
            )
            rows.append(
                {
                    "iid": str(order.get("_id")),
                    "values": [
                        order.get("number", "—"),
                        _when(created),
                        customer.get("name")
                        or customer.get("email")
                        or "Guest",
                        str(len(order.get("items") or [])),
                        format_inr(_int(order.get("total"))),
                        status.title(),
                        str(payment.get("status", "—")).title(),
                    ],
                    "tags": (tag,) if tag else (),
                }
            )
        self._order_map = {str(order.get("_id")): order for order in self._orders}
        self.table.set_rows(rows)
        self._selected = None
        self._empty_detail()
        suffix = f" of {len(self._orders)}" if self._orders else ""
        self.count_note.configure(text=f"{len(rows)}{suffix} orders shown")

    def _on_select(self, row: dict[str, str] | None) -> None:
        order = self._order_map.get(row["_iid"]) if row else None
        self._selected = order
        if order:
            self._render_detail(order)
        else:
            self._empty_detail()

    def _render_detail(self, order: dict[str, Any]) -> None:
        for child in self.detail.winfo_children():
            child.destroy()
        self.detail.grid_columnconfigure(0, weight=3)
        self.detail.grid_columnconfigure(1, weight=2)

        left = ctk.CTkFrame(self.detail, fg_color="transparent")
        left.grid(row=0, column=0, sticky="nsew", padx=(20, 10), pady=18)
        head = ctk.CTkFrame(left, fg_color="transparent")
        head.pack(fill="x")
        body(head, f"Order {order.get('number')}", size=14, weight="bold").pack(side="left")
        status = str(order.get("status", "paid"))
        tone = theme.STATUS_TONES.get(
            status, (theme.PAPER_DEEP, theme.INK_SOFT)
        )
        pill = Pill(head, status, tone=tone)
        pill.pack(side="left", padx=(8, 0))

        items = order.get("items") or []
        body(
            left,
            f"{len(items)} line item{'s' if len(items) != 1 else ''}",
            size=9,
            color=theme.MUTED,
        ).pack(anchor="w", pady=(2, 8))
        for item in items:
            row = ctk.CTkFrame(left, fg_color=theme.CARD_ALT, corner_radius=9)
            row.pack(fill="x", pady=3)
            row.grid_columnconfigure(0, weight=1)
            body(
                row,
                f"{item.get('name', 'Product')}",
                size=10,
                weight="bold",
            ).grid(row=0, column=0, sticky="w", padx=12, pady=(8, 0))
            muted(
                row,
                f"{item.get('quantity', 1)} × {format_inr(_int(item.get('price')))}",
                size=9,
            ).grid(row=1, column=0, sticky="w", padx=12, pady=(1, 8))
            ctk.CTkLabel(
                row,
                text=format_inr(_int(item.get("price")) * _int(item.get("quantity"), 1)),
                text_color=theme.INK,
                font=font(10, "bold"),
            ).grid(row=0, column=1, rowspan=2, sticky="e", padx=12)

        address = order.get("shippingAddress") or {}
        body(left, "Delivery address", size=10, weight="bold").pack(
            anchor="w", pady=(14, 3)
        )
        for line in (
            address.get("fullName"),
            address.get("line1"),
            ", ".join(
                part
                for part in (
                    address.get("city"),
                    address.get("region"),
                    address.get("postalCode"),
                )
                if part
            ),
            address.get("country"),
        ):
            if line:
                muted(left, str(line), size=9).pack(anchor="w")

        right = ctk.CTkFrame(self.detail, fg_color=theme.CARD_ALT, corner_radius=12)
        right.grid(row=0, column=1, sticky="nsew", padx=(10, 20), pady=18)
        label_caps(right, "Payment").pack(anchor="w", padx=16, pady=(14, 0))
        payment = order.get("payment") or {}
        body(
            right,
            f"{format_inr(_int(order.get('total')))}",
            size=20,
            family=theme.DISPLAY_FONT,
        ).pack(anchor="w", padx=16, pady=(3, 0))
        muted(
            right,
            f"{payment.get('brand', 'Demo card')} ···· {payment.get('last4', '----')}",
            size=9,
        ).pack(anchor="w", padx=16, pady=(2, 0))
        pay_tone = theme.STATUS_TONES.get(
            str(payment.get("status", "")), (theme.PAPER_DEEP, theme.INK_SOFT)
        )
        Pill(right, str(payment.get("status", "—")), tone=pay_tone).pack(
            anchor="w", padx=16, pady=(5, 0)
        )

        breakdown = ctk.CTkFrame(right, fg_color="transparent")
        breakdown.pack(fill="x", padx=16, pady=(12, 0))
        for label, value in (
            ("Subtotal", order.get("subtotal")),
            ("Shipping", order.get("shipping")),
            ("GST", order.get("tax")),
        ):
            row = ctk.CTkFrame(breakdown, fg_color="transparent")
            row.pack(fill="x", pady=1)
            muted(row, label, size=9).pack(side="left")
            ctk.CTkLabel(
                row,
                text=format_inr(_int(value)),
                text_color=theme.INK_SOFT,
                font=font(9),
            ).pack(side="right")

        actions = ctk.CTkFrame(right, fg_color="transparent")
        actions.pack(fill="x", padx=16, pady=(14, 16))
        status = str(order.get("status", "paid"))
        if status == "paid":
            self._action_button(
                actions, "Mark shipped", lambda: self._set_status(order, "shipped")
            ).pack(fill="x", pady=(0, 5))
        if status in {"paid", "shipped"}:
            self._action_button(
                actions, "Mark delivered", lambda: self._set_status(order, "delivered")
            ).pack(fill="x", pady=(0, 5))
        if status != "cancelled":
            self._action_button(
                actions,
                "Cancel & refund",
                lambda: self._set_status(order, "cancelled"),
                danger=True,
            ).pack(fill="x")
        else:
            muted(
                actions,
                "This order was cancelled, restocked and its demo payment refunded.",
                size=8,
            ).pack(anchor="w")

    def _action_button(
        self,
        master: tk.Misc,
        text: str,
        command: Any,
        *,
        danger: bool = False,
    ) -> ctk.CTkButton:
        return ctk.CTkButton(
            master,
            text=text,
            height=34,
            corner_radius=17,
            fg_color=theme.RED_SOFT if danger else theme.PINE,
            hover_color=theme.SAND if danger else theme.PINE_SOFT,
            text_color=theme.RED if danger else theme.PAPER,
            font=font(9, "bold"),
            command=command,
        )

    def _set_status(self, order: dict[str, Any], status: str) -> None:
        if status == "cancelled":
            confirmed = messagebox.askyesno(
                "Cancel and refund?",
                f"Cancel {order.get('number')}?\n\n"
                "Items return to stock and the demo payment is marked refunded. "
                "This cannot be undone.",
                parent=self,
            )
            if not confirmed:
                return
        self.app.run_mutation(
            "orders:updateStatus",
            {"orderId": order.get("_id"), "status": status},
            on_success=lambda _value: self.app.refresh(),
            on_error=lambda error: messagebox.showerror(
                "Could not update order", str(error), parent=self
            ),
        )


def _int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _when(timestamp: int) -> str:
    if not timestamp:
        return "—"
    return datetime.fromtimestamp(timestamp / 1000).strftime("%d %b, %H:%M")
