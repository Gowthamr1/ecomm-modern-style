from __future__ import annotations

import tkinter as tk
from typing import Any

import customtkinter as ctk

from .. import theme
from ..analytics import format_inr, format_pct
from ..charts import BarChart, DonutChart, LineChart
from .base import Page
from .components import DataTable, KpiCard, body, display_font, font, label_caps, muted


class AnalyticsPage(Page):
    def __init__(self, master: tk.Misc, app: Any) -> None:
        super().__init__(master, app)
        self._build()

    def _build(self) -> None:
        top = ctk.CTkFrame(self, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(24, 0))
        top.grid_columnconfigure(0, weight=1)
        label_caps(top, "Intelligence").grid(row=0, column=0, sticky="w")
        ctk.CTkLabel(
            top,
            text="What is worth selling.",
            text_color=theme.INK,
            font=display_font(30),
            anchor="w",
        ).grid(row=1, column=0, sticky="w", pady=(4, 0))
        self.subtitle = muted(
            top,
            "Revenue, margin and stock signals from the live store.",
            size=10,
        )
        self.subtitle.grid(row=2, column=0, sticky="w", pady=(3, 0))

        self.range = ctk.CTkSegmentedButton(
            top,
            values=["30 days", "90 days", "365 days"],
            command=self._set_range,
            selected_color=theme.PINE,
            selected_hover_color=theme.PINE_SOFT,
            unselected_color=theme.CARD,
            unselected_hover_color=theme.PAPER_DEEP,
            fg_color=theme.PAPER_DEEP,
            text_color=theme.INK_SOFT,
            font=font(9),
            height=34,
            width=260,
        )
        self.range.grid(row=0, column=1, rowspan=3, sticky="e")

        kpis = ctk.CTkFrame(self, fg_color="transparent")
        kpis.pack(fill="x", padx=30, pady=(18, 0))
        for index in range(4):
            kpis.grid_columnconfigure(index, weight=1, uniform="analytics-kpi")
        self.revenue_card = KpiCard(kpis, "Revenue", "—")
        self.revenue_card.grid(row=0, column=0, sticky="nsew", padx=(0, 7))
        self.profit_card = KpiCard(kpis, "Gross profit", "—", accent=theme.GREEN)
        self.profit_card.grid(row=0, column=1, sticky="nsew", padx=7)
        self.units_card = KpiCard(kpis, "Units sold", "—", accent=theme.PINE)
        self.units_card.grid(row=0, column=2, sticky="nsew", padx=7)
        self.margin_card = KpiCard(kpis, "Gross margin", "—", accent=theme.SAND_DEEP)
        self.margin_card.grid(row=0, column=3, sticky="nsew", padx=(7, 0))

        trend_card = self._card()
        trend_card.pack(fill="x", padx=30, pady=(14, 0))
        head = ctk.CTkFrame(trend_card, fg_color="transparent")
        head.pack(fill="x", padx=18, pady=(16, 0))
        body(head, "Revenue & orders", size=13, weight="bold").pack(side="left")
        self.trend_note = muted(head, "", size=9)
        self.trend_note.pack(side="right")
        self.revenue_chart = LineChart(trend_card, height=250)
        self.revenue_chart.pack(fill="both", expand=True, padx=10, pady=(10, 10))

        grid = ctk.CTkFrame(self, fg_color="transparent")
        grid.pack(fill="x", padx=30, pady=(14, 0))
        grid.grid_columnconfigure(0, weight=1, uniform="charts")
        grid.grid_columnconfigure(1, weight=1, uniform="charts")

        categories = self._chart_card(
            grid, "Revenue by category", "Where the money comes from"
        )
        categories.grid(row=0, column=0, sticky="nsew", padx=(0, 7))
        self.category_chart = DonutChart(categories, height=240)
        self.category_chart.pack(fill="both", expand=True, padx=10, pady=(0, 10))

        top_products = self._chart_card(
            grid, "Top products", "Highest revenue in this period"
        )
        top_products.grid(row=0, column=1, sticky="nsew", padx=(7, 0))
        self.top_chart = BarChart(top_products, height=240)
        self.top_chart.pack(fill="both", expand=True, padx=10, pady=(0, 10))

        weekday = self._chart_card(
            grid, "Sales by weekday", "When customers buy"
        )
        weekday.grid(row=1, column=0, sticky="nsew", padx=(0, 7), pady=(14, 0))
        self.weekday_chart = BarChart(
            weekday, height=210, horizontal=False, empty_message="No weekday sales yet"
        )
        self.weekday_chart.pack(fill="both", expand=True, padx=10, pady=(0, 10))

        stock = self._chart_card(
            grid, "Stock value by category", "Retail value sitting on the shelf"
        )
        stock.grid(row=1, column=1, sticky="nsew", padx=(7, 0), pady=(14, 0))
        self.stock_chart = BarChart(stock, height=210)
        self.stock_chart.pack(fill="both", expand=True, padx=10, pady=(0, 10))

        insight_card = self._card()
        insight_card.pack(fill="x", padx=30, pady=(14, 0))
        head = ctk.CTkFrame(insight_card, fg_color="transparent")
        head.pack(fill="x", padx=18, pady=(16, 0))
        body(head, "What the numbers are saying", size=13, weight="bold").pack(
            side="left"
        )
        self.insight_host = ctk.CTkFrame(insight_card, fg_color="transparent")
        self.insight_host.pack(fill="x", padx=18, pady=(8, 16))

        table_card = self._card()
        table_card.pack(fill="x", padx=30, pady=(14, 28))
        head = ctk.CTkFrame(table_card, fg_color="transparent")
        head.pack(fill="x", padx=18, pady=(16, 0))
        body(head, "Product scorecard", size=13, weight="bold").pack(side="left")
        self.table_note = muted(head, "", size=9)
        self.table_note.pack(side="right")
        self.table = DataTable(
            table_card,
            [
                ("name", "Product", 220, "w"),
                ("units", "Units", 60, "e"),
                ("revenue", "Revenue", 110, "e"),
                ("margin", "Margin", 75, "e"),
                ("stock", "Stock", 60, "e"),
                ("through", "Sell-through", 95, "e"),
                ("call", "Recommendation", 125, "w"),
            ],
            height=10,
            empty_message="No product data yet",
        )
        self.table.pack(fill="x", padx=8, pady=(8, 12))

    def _card(self) -> ctk.CTkFrame:
        return ctk.CTkFrame(
            self,
            fg_color=theme.CARD,
            corner_radius=16,
            border_width=1,
            border_color=theme.LINE,
        )

    def _chart_card(
        self, master: tk.Misc, title: str, subtitle: str
    ) -> ctk.CTkFrame:
        card = ctk.CTkFrame(
            master,
            fg_color=theme.CARD,
            corner_radius=16,
            border_width=1,
            border_color=theme.LINE,
        )
        head = ctk.CTkFrame(card, fg_color="transparent")
        head.pack(fill="x", padx=18, pady=(14, 0))
        copy = ctk.CTkFrame(head, fg_color="transparent")
        copy.pack(side="left")
        body(copy, title, size=12, weight="bold").pack(anchor="w")
        muted(copy, subtitle, size=8).pack(anchor="w", pady=(1, 0))
        return card

    def _set_range(self, value: str) -> None:
        days = int(value.split()[0])
        self.app.set_range(days)

    def _sync_range(self, days: int) -> None:
        label = f"{days} days"
        if label in ("30 days", "90 days", "365 days"):
            self.range.set(label)

    def update_data(self, analytics: dict[str, Any], snapshot: dict[str, Any]) -> None:
        kpis = analytics["kpis"]
        days = analytics["days"]
        self._sync_range(days)
        self.subtitle.configure(
            text=f"Last {days} days · revenue, margin and stock signals from the live store."
        )
        self.revenue_card.update_value(
            format_inr(kpis["revenue"]),
            f"Net {format_inr(kpis['net_revenue'])} after refunds",
        )
        self.profit_card.update_value(
            format_inr(kpis["gross_profit"]),
            f"COGS {format_inr(kpis['cogs'])}",
        )
        self.units_card.update_value(
            str(kpis["units"]),
            f"AOV {format_inr(kpis['aov'])}",
        )
        self.margin_card.update_value(
            format_pct(kpis["margin_pct"]),
            f"Sell-through {format_pct(kpis['sell_through'])}",
        )

        self.revenue_chart.set_points(
            [
                (point["label"], point["revenue"], point["long_label"])
                for point in analytics["revenue_series"]
            ]
        )
        order_total = sum(point["orders"] for point in analytics["revenue_series"])
        self.trend_note.configure(
            text=f"{format_inr(kpis['revenue'])} · {order_total} orders"
        )
        self.category_chart.set_items(
            [(item["label"], item["revenue"]) for item in analytics["category_revenue"]]
        )
        self.top_chart.set_items(
            [(row["name"], row["revenue"]) for row in analytics["top_products"]]
        )
        self.weekday_chart.set_items(
            [(item["label"], item["revenue"]) for item in analytics["weekday_revenue"]]
        )
        self.stock_chart.set_items(
            [(item["label"], item["value"]) for item in analytics["stock_by_category"]]
        )

        for child in self.insight_host.winfo_children():
            child.destroy()
        for insight in analytics["insights"]:
            row = ctk.CTkFrame(self.insight_host, fg_color="transparent")
            row.pack(fill="x", pady=3)
            ctk.CTkLabel(
                row,
                text="—",
                text_color=theme.ACCENT,
                font=font(10, "bold"),
                width=18,
            ).pack(side="left", anchor="n")
            ctk.CTkLabel(
                row,
                text=insight,
                text_color=theme.INK_SOFT,
                font=font(10),
                anchor="w",
                justify="left",
                wraplength=880,
            ).pack(side="left", fill="x", expand=True)

        rows = []
        for row in analytics["performance"]:
            tag = (
                "low"
                if row["recommendation"].lower() in {"restock now", "clear stock"}
                else "out"
                if row["recommendation"].lower() == "restock now"
                else "muted"
                if row["units"] == 0
                else "good"
                if row["recommendation"] in {"Star", "Steady"}
                else ()
            )
            rows.append(
                {
                    "iid": str(row["id"]),
                    "values": [
                        row["name"],
                        str(row["units"]),
                        format_inr(row["revenue"]),
                        format_pct(row["margin_pct"], 0),
                        str(row["stock"]),
                        format_pct(row["sell_through"], 0),
                        row["recommendation"],
                    ],
                    "tags": (tag,) if isinstance(tag, str) else (),
                }
            )
        self.table.set_rows(rows)
        self.table_note.configure(
            text=f"{len(rows)} products · sorted by revenue"
        )
