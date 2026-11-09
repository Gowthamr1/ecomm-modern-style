from __future__ import annotations

import tkinter as tk
from datetime import datetime
from typing import Any

import customtkinter as ctk

from .. import theme
from ..analytics import format_inr
from ..customers import build_customers
from .base import Page
from .components import DataTable, KpiCard, Pill, body, display_font, font, label_caps, muted

SEGMENT_TONES = {
    "VIP": (theme.AMBER_SOFT, theme.AMBER),
    "Repeat": (theme.GREEN_SOFT, theme.GREEN),
    "At risk": (theme.RED_SOFT, theme.RED),
    "New": (theme.PAPER_DEEP, theme.INK_SOFT),
    "Cancelled": (theme.RED_SOFT, theme.RED),
}


class CustomersPage(Page):
    def __init__(self, master: tk.Misc, app: Any) -> None:
        super().__init__(master, app)
        self._customers: list[dict[str, Any]] = []
        self._profiles: dict[str, dict[str, Any]] = {}
        self._selected: dict[str, Any] | None = None
        self._query = tk.StringVar()
        self._build()

    def _build(self) -> None:
        top = ctk.CTkFrame(self, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(24, 0))
        top.grid_columnconfigure(0, weight=1)
        label_caps(top, "Relationships").grid(row=0, column=0, sticky="w")
        ctk.CTkLabel(
            top,
            text="Customers.",
            text_color=theme.INK,
            font=display_font(30),
            anchor="w",
        ).grid(row=1, column=0, sticky="w", pady=(4, 0))
        self.subtitle = muted(top, "Loading customer history…", size=10)
        self.subtitle.grid(row=2, column=0, sticky="w", pady=(3, 0))

        kpis = ctk.CTkFrame(self, fg_color="transparent")
        kpis.pack(fill="x", padx=30, pady=(18, 0))
        for index in range(4):
            kpis.grid_columnconfigure(index, weight=1, uniform="customer-kpi")
        self.total_card = KpiCard(kpis, "Customers", "—")
        self.total_card.grid(row=0, column=0, sticky="nsew", padx=(0, 7))
        self.repeat_card = KpiCard(
            kpis, "Repeat customers", "—", accent=theme.GREEN
        )
        self.repeat_card.grid(row=0, column=1, sticky="nsew", padx=7)
        self.revenue_card = KpiCard(
            kpis, "Lifetime revenue", "—", accent=theme.ACCENT
        )
        self.revenue_card.grid(row=0, column=2, sticky="nsew", padx=7)
        self.value_card = KpiCard(
            kpis, "Average customer", "—", accent=theme.SAND_DEEP
        )
        self.value_card.grid(row=0, column=3, sticky="nsew", padx=(7, 0))

        tools = ctk.CTkFrame(self, fg_color="transparent")
        tools.pack(fill="x", padx=30, pady=(16, 0))
        tools.grid_columnconfigure(0, weight=1)
        self.search = ctk.CTkEntry(
            tools,
            height=38,
            corner_radius=10,
            border_color=theme.LINE,
            fg_color=theme.CARD,
            placeholder_text="Search by customer name or email…",
            font=font(10),
            textvariable=self._query,
        )
        self.search.grid(row=0, column=0, sticky="ew")
        self.search.bind("<KeyRelease>", lambda _event: self._render())
        self.count_note = muted(tools, "", size=9)
        self.count_note.grid(row=0, column=1, sticky="e", padx=(12, 0))

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
                ("name", "Customer", 190, "w"),
                ("email", "Email", 220, "w"),
                ("orders", "Orders", 65, "e"),
                ("spend", "Lifetime spend", 120, "e"),
                ("last", "Last order", 105, "w"),
                ("segment", "Segment", 95, "w"),
            ],
            on_select=self._on_select,
            empty_message="No customers match this search",
            height=8,
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

    def update_data(self, analytics: dict[str, Any], snapshot: dict[str, Any]) -> None:
        self._customers = build_customers(snapshot)
        total = len(self._customers)
        repeat = sum(1 for customer in self._customers if customer["paid_orders"] >= 2)
        revenue = sum(customer["spend"] for customer in self._customers)
        average = revenue / total if total else 0
        self.total_card.update_value(str(total), "With at least one order")
        self.repeat_card.update_value(str(repeat), "Two or more paid orders")
        self.revenue_card.update_value(format_inr(revenue), "Excludes cancelled orders")
        self.value_card.update_value(format_inr(average), "Average lifetime spend")
        self.subtitle.configure(
            text=(
                f"{total} customers · {repeat} repeat customers · "
                f"{format_inr(revenue)} lifetime revenue"
            )
        )
        self._render()

    def _render(self) -> None:
        query = self._query.get().strip().lower()
        rows = []
        for customer in self._customers:
            haystack = f"{customer['name']} {customer['email']}".lower()
            if query and query not in haystack:
                continue
            tag = (
                "out"
                if customer["segment"] in {"At risk", "Cancelled"}
                else "good"
                if customer["segment"] in {"VIP", "Repeat"}
                else "muted"
                if customer["segment"] == "New"
                else ""
            )
            rows.append(
                {
                    "iid": customer["key"],
                    "values": [
                        customer["name"],
                        customer["email"] or "—",
                        str(customer["orders"]),
                        format_inr(customer["spend"]),
                        customer["last_order_label"],
                        customer["segment"],
                    ],
                    "tags": (tag,) if tag else (),
                }
            )
        self._profiles = {customer["key"]: customer for customer in self._customers}
        self.table.set_rows(rows)
        self._selected = None
        self._empty_detail()
        self.count_note.configure(text=f"{len(rows)} of {len(self._customers)} shown")

    def _on_select(self, row: dict[str, str] | None) -> None:
        profile = self._profiles.get(row["_iid"]) if row else None
        self._selected = profile
        if profile:
            self._render_detail(profile)
        else:
            self._empty_detail()

    def _empty_detail(self) -> None:
        for child in self.detail.winfo_children():
            child.destroy()
        muted(
            self.detail,
            "Select a customer to see lifetime value and recent orders.",
            size=10,
        ).pack(anchor="w", padx=20, pady=24)

    def _render_detail(self, customer: dict[str, Any]) -> None:
        for child in self.detail.winfo_children():
            child.destroy()
        self.detail.grid_columnconfigure(0, weight=3)
        self.detail.grid_columnconfigure(1, weight=2)

        left = ctk.CTkFrame(self.detail, fg_color="transparent")
        left.grid(row=0, column=0, sticky="nsew", padx=(20, 10), pady=18)
        head = ctk.CTkFrame(left, fg_color="transparent")
        head.pack(fill="x")
        body(head, customer["name"], size=14, weight="bold").pack(side="left")
        Pill(
            head,
            customer["segment"],
            tone=SEGMENT_TONES.get(customer["segment"], (theme.PAPER_DEEP, theme.INK_SOFT)),
        ).pack(side="left", padx=(8, 0))
        muted(left, customer["email"] or "No email on file", size=9).pack(
            anchor="w", pady=(2, 10)
        )

        body(left, "Recent orders", size=10, weight="bold").pack(anchor="w", pady=(2, 4))
        recent = customer["recent_orders"]
        if not recent:
            muted(left, "No completed orders yet.", size=9).pack(anchor="w", pady=4)
        else:
            for order in recent:
                row = ctk.CTkFrame(left, fg_color=theme.CARD_ALT, corner_radius=8)
                row.pack(fill="x", pady=3)
                body(
                    row,
                    f"{order['number']} · {_when(order['created_at'])}",
                    size=9,
                    color=theme.INK_SOFT,
                    weight="bold",
                ).pack(side="left", padx=10, pady=7)
                ctk.CTkLabel(
                    row,
                    text=format_inr(order["total"]),
                    text_color=theme.INK,
                    font=font(9, "bold"),
                ).pack(side="right", padx=(8, 10))

        right = ctk.CTkFrame(self.detail, fg_color=theme.CARD_ALT, corner_radius=12)
        right.grid(row=0, column=1, sticky="nsew", padx=(10, 20), pady=18)
        label_caps(right, "Customer value").pack(anchor="w", padx=16, pady=(14, 0))
        body(
            right,
            format_inr(customer["spend"]),
            size=22,
            family=theme.DISPLAY_FONT,
        ).pack(anchor="w", padx=16, pady=(2, 0))
        muted(right, "Lifetime spend", size=8).pack(anchor="w", padx=16)

        stats = ctk.CTkFrame(right, fg_color="transparent")
        stats.pack(fill="x", padx=16, pady=(12, 16))
        for label, value in (
            ("Orders", str(customer["orders"])),
            ("Average order", format_inr(customer["average_order"])),
            ("Last order", customer["last_order_label"]),
        ):
            line = ctk.CTkFrame(stats, fg_color="transparent")
            line.pack(fill="x", pady=2)
            muted(line, label, size=9).pack(side="left")
            ctk.CTkLabel(
                line,
                text=value,
                text_color=theme.INK_SOFT,
                font=font(9, "bold"),
            ).pack(side="right")


def _when(timestamp: int) -> str:
    if not timestamp:
        return "—"
    return datetime.fromtimestamp(timestamp / 1000).strftime("%d %b %Y")
