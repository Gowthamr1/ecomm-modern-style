from __future__ import annotations

import tkinter as tk
from typing import Any

import customtkinter as ctk

from .. import theme
from ..analytics import format_inr, format_inr_compact, format_pct
from ..charts import DonutChart, LineChart
from .base import Page
from .components import DataTable, KpiCard, body, display_font, font, label_caps, muted


class DashboardPage(Page):
    def __init__(self, master: tk.Misc, app: Any) -> None:
        super().__init__(master, app)
        self._data: dict[str, Any] | None = None
        self._build()

    def _build(self) -> None:
        top = ctk.CTkFrame(self, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(24, 0))
        top.grid_columnconfigure(0, weight=1)
        label_caps(top, "Store overview").grid(row=0, column=0, sticky="w")
        ctk.CTkLabel(
            top,
            text="The store, at a glance.",
            text_color=theme.INK,
            font=display_font(30),
            anchor="w",
        ).grid(row=1, column=0, sticky="w", pady=(4, 0))
        self.period_note = muted(top, "Loading the latest numbers…", size=10)
        self.period_note.grid(row=2, column=0, sticky="w", pady=(3, 0))

        self.kpis = ctk.CTkFrame(self, fg_color="transparent")
        self.kpis.pack(fill="x", padx=30, pady=(18, 0))
        for index in range(4):
            self.kpis.grid_columnconfigure(index, weight=1, uniform="kpi")
        self.revenue_card = KpiCard(
            self.kpis, "Revenue", "—", accent=theme.ACCENT
        )
        self.revenue_card.grid(row=0, column=0, sticky="nsew", padx=(0, 7))
        self.orders_card = KpiCard(
            self.kpis, "Orders", "—", accent=theme.PINE
        )
        self.orders_card.grid(row=0, column=1, sticky="nsew", padx=7)
        self.aov_card = KpiCard(
            self.kpis, "Average order", "—", accent=theme.SAND_DEEP
        )
        self.aov_card.grid(row=0, column=2, sticky="nsew", padx=7)
        self.margin_card = KpiCard(
            self.kpis, "Gross margin", "—", accent=theme.GREEN
        )
        self.margin_card.grid(row=0, column=3, sticky="nsew", padx=(7, 0))

        chart_row = ctk.CTkFrame(self, fg_color="transparent")
        chart_row.pack(fill="x", padx=30, pady=(14, 0))
        chart_row.grid_columnconfigure(0, weight=3)
        chart_row.grid_columnconfigure(1, weight=2)

        revenue_card = ctk.CTkFrame(
            chart_row,
            fg_color=theme.CARD,
            corner_radius=16,
            border_width=1,
            border_color=theme.LINE,
        )
        revenue_card.grid(row=0, column=0, sticky="nsew", padx=(0, 7))
        head = ctk.CTkFrame(revenue_card, fg_color="transparent")
        head.pack(fill="x", padx=18, pady=(16, 0))
        body(head, "Revenue trend", size=13, weight="bold").pack(side="left")
        self.revenue_total = muted(head, "", size=9)
        self.revenue_total.pack(side="right")
        self.revenue_chart = LineChart(revenue_card, height=220)
        self.revenue_chart.pack(fill="both", expand=True, padx=10, pady=(10, 10))

        category_card = ctk.CTkFrame(
            chart_row,
            fg_color=theme.CARD,
            corner_radius=16,
            border_width=1,
            border_color=theme.LINE,
        )
        category_card.grid(row=0, column=1, sticky="nsew", padx=(7, 0))
        head = ctk.CTkFrame(category_card, fg_color="transparent")
        head.pack(fill="x", padx=18, pady=(16, 0))
        body(head, "Category mix", size=13, weight="bold").pack(side="left")
        self.category_count = muted(head, "", size=9)
        self.category_count.pack(side="right")
        self.category_chart = DonutChart(category_card, height=220)
        self.category_chart.pack(fill="both", expand=True, padx=10, pady=(10, 10))

        lower = ctk.CTkFrame(self, fg_color="transparent")
        lower.pack(fill="x", padx=30, pady=(14, 0))
        lower.grid_columnconfigure(0, weight=3)
        lower.grid_columnconfigure(1, weight=2)

        sellers_card = ctk.CTkFrame(
            lower,
            fg_color=theme.CARD,
            corner_radius=16,
            border_width=1,
            border_color=theme.LINE,
        )
        sellers_card.grid(row=0, column=0, sticky="nsew", padx=(0, 7))
        head = ctk.CTkFrame(sellers_card, fg_color="transparent")
        head.pack(fill="x", padx=18, pady=(16, 0))
        body(head, "Top sellers", size=13, weight="bold").pack(side="left")
        self.sellers_note = muted(head, "", size=9)
        self.sellers_note.pack(side="right")
        self.sellers_host = ctk.CTkFrame(sellers_card, fg_color="transparent")
        self.sellers_host.pack(fill="x", padx=18, pady=(10, 16))

        alerts_card = ctk.CTkFrame(
            lower,
            fg_color=theme.CARD,
            corner_radius=16,
            border_width=1,
            border_color=theme.LINE,
        )
        alerts_card.grid(row=0, column=1, sticky="nsew", padx=(7, 0))
        head = ctk.CTkFrame(alerts_card, fg_color="transparent")
        head.pack(fill="x", padx=18, pady=(16, 0))
        body(head, "Needs attention", size=13, weight="bold").pack(side="left")
        self.alert_count = muted(head, "", size=9)
        self.alert_count.pack(side="right")
        self.alerts_host = ctk.CTkFrame(alerts_card, fg_color="transparent")
        self.alerts_host.pack(fill="x", padx=18, pady=(10, 16))

        orders_card = ctk.CTkFrame(
            self,
            fg_color=theme.CARD,
            corner_radius=16,
            border_width=1,
            border_color=theme.LINE,
        )
        orders_card.pack(fill="x", padx=30, pady=(14, 28))
        head = ctk.CTkFrame(orders_card, fg_color="transparent")
        head.pack(fill="x", padx=18, pady=(16, 0))
        body(head, "Recent orders", size=13, weight="bold").pack(side="left")
        self.orders_note = muted(head, "", size=9)
        self.orders_note.pack(side="right")
        self.recent_table = DataTable(
            orders_card,
            [
                ("number", "Order", 130, "w"),
                ("customer", "Customer", 220, "w"),
                ("total", "Total", 120, "e"),
                ("status", "Status", 110, "w"),
                ("date", "Placed", 120, "w"),
            ],
            height=4,
            empty_message="No orders yet",
        )
        self.recent_table.pack(fill="x", padx=8, pady=(8, 12))

    def update_data(self, analytics: dict[str, Any], snapshot: dict[str, Any]) -> None:
        self._data = analytics
        kpis = analytics["kpis"]
        days = analytics["days"]
        self.period_note.configure(
            text=f"Last {days} days · {analytics['product_count']} products in the catalog"
        )
        revenue_delta = kpis.get("revenue_delta")
        if revenue_delta is None:
            revenue_sub = "No previous-period sales"
        else:
            arrow = "↑" if revenue_delta >= 0 else "↓"
            revenue_sub = f"{arrow} {abs(revenue_delta):.1f}% vs previous {days} days"
        self.revenue_card.update_value(
            format_inr(kpis["revenue"]), revenue_sub
        )
        orders_delta = kpis.get("orders_delta")
        if orders_delta is None:
            orders_sub = "First orders in this window"
        else:
            arrow = "↑" if orders_delta >= 0 else "↓"
            orders_sub = f"{arrow} {abs(orders_delta):.1f}% vs previous {days} days"
        self.orders_card.update_value(str(kpis["orders"]), orders_sub)
        self.aov_card.update_value(
            format_inr(kpis["aov"]),
            f"{kpis['units']} units sold",
        )
        self.margin_card.update_value(
            format_pct(kpis["margin_pct"]),
            f"{format_inr(kpis['gross_profit'])} gross profit",
        )

        points = [
            (point["label"], point["revenue"], point["long_label"])
            for point in analytics["revenue_series"]
        ]
        self.revenue_chart.set_points(points)
        self.revenue_total.configure(
            text=f"{format_inr(kpis['revenue'])} gross"
        )

        self.category_chart.set_items(
            [(item["label"], item["revenue"]) for item in analytics["category_revenue"]]
        )
        self.category_count.configure(
            text=f"{len(analytics['category_revenue'])} categories"
        )

        self._render_sellers(analytics)
        self._render_alerts(analytics)
        self._render_recent(analytics)

    def _render_sellers(self, analytics: dict[str, Any]) -> None:
        for child in self.sellers_host.winfo_children():
            child.destroy()
        top = analytics["top_products"][:5]
        self.sellers_note.configure(text=f"By revenue · last {analytics['days']} days")
        if not top:
            muted(self.sellers_host, "No product sales in this period yet.", size=10).pack(
                anchor="w", pady=10
            )
            return
        maximum = max(row["revenue"] for row in top)
        for index, row in enumerate(top, start=1):
            line = ctk.CTkFrame(self.sellers_host, fg_color="transparent")
            line.pack(fill="x", pady=5)
            ctk.CTkLabel(
                line,
                text=f"{index:02d}",
                text_color=theme.SAND_DEEP,
                font=font(9, "bold"),
                width=24,
            ).pack(side="left")
            copy = ctk.CTkFrame(line, fg_color="transparent")
            copy.pack(side="left", fill="x", expand=True)
            body(copy, row["name"], size=10, weight="bold").pack(anchor="w")
            bar = ctk.CTkFrame(
                copy, height=4, corner_radius=2, fg_color=theme.LINE_SOFT
            )
            bar.pack(fill="x", pady=(4, 0))
            bar.pack_propagate(False)
            fill = ctk.CTkFrame(bar, corner_radius=2, fg_color=theme.ACCENT)
            fill.place(relwidth=max(0.04, row["revenue"] / maximum), relheight=1)
            ctk.CTkLabel(
                line,
                text=format_inr(row["revenue"]),
                text_color=theme.INK,
                font=font(10, "bold"),
                width=92,
                anchor="e",
            ).pack(side="right", padx=(8, 0))

    def _render_alerts(self, analytics: dict[str, Any]) -> None:
        for child in self.alerts_host.winfo_children():
            child.destroy()
        alerts = analytics["low_stock"][:5]
        self.alert_count.configure(
            text=f"{analytics['kpis']['low_stock']} need attention"
        )
        if not alerts:
            muted(self.alerts_host, "Stock levels look healthy.", size=10).pack(
                anchor="w", pady=10
            )
            return
        for product in alerts:
            row = ctk.CTkFrame(self.alerts_host, fg_color="transparent")
            row.pack(fill="x", pady=4)
            dot = ctk.CTkFrame(
                row,
                width=7,
                height=7,
                corner_radius=4,
                fg_color=theme.RED if product["stock"] == 0 else theme.AMBER,
            )
            dot.pack(side="left", padx=(0, 8), pady=(5, 0))
            copy = ctk.CTkFrame(row, fg_color="transparent")
            copy.pack(side="left", fill="x", expand=True)
            body(copy, product["name"], size=10, weight="bold").pack(anchor="w")
            muted(
                copy,
                "Out of stock"
                if product["stock"] == 0
                else f"{product['stock']} left · reorder at {product['reorder']}",
                size=8,
            ).pack(anchor="w")
            ctk.CTkButton(
                row,
                text="Restock",
                width=64,
                height=24,
                corner_radius=12,
                fg_color=theme.PAPER_DEEP,
                hover_color=theme.SAND,
                text_color=theme.INK_SOFT,
                font=font(8, "bold"),
                command=lambda pid=product["id"]: self.app.open_stock_dialog(pid),
            ).pack(side="right", padx=(8, 0))

    def _render_recent(self, analytics: dict[str, Any]) -> None:
        rows = []
        for order in analytics["recent_orders"]:
            when = ""
            if order.get("created_at"):
                from datetime import datetime

                when = datetime.fromtimestamp(order["created_at"] / 1000).strftime(
                    "%d %b, %H:%M"
                )
            tag = (
                "low"
                if order["status"] == "cancelled"
                else "good"
                if order["status"] == "delivered"
                else ""
            )
            rows.append(
                {
                    "iid": str(order.get("id") or order["number"]),
                    "values": [
                        order["number"],
                        order["customer"],
                        format_inr(order["total"]),
                        str(order["status"]).title(),
                        when,
                    ],
                    "tags": (tag,) if tag else (),
                }
            )
        self.recent_table.set_rows(rows)
        self.orders_note.configure(text=f"{analytics['order_count']} orders all time")
