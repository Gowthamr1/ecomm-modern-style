from __future__ import annotations

import tkinter as tk
from tkinter import messagebox
from typing import Any

import customtkinter as ctk

from .. import theme
from ..analytics import format_inr, product_payload
from .base import Page
from .components import DataTable, KpiCard, body, display_font, font, label_caps, muted


class InventoryPage(Page):
    def __init__(self, master: tk.Misc, app: Any) -> None:
        super().__init__(master, app)
        self._products: list[dict[str, Any]] = []
        self._performance: dict[str, dict[str, Any]] = {}
        self._selected: dict[str, Any] | None = None
        self._filter = tk.StringVar(value="All")
        self._build()

    def _build(self) -> None:
        top = ctk.CTkFrame(self, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(24, 0))
        top.grid_columnconfigure(0, weight=1)
        label_caps(top, "Inventory").grid(row=0, column=0, sticky="w")
        ctk.CTkLabel(
            top,
            text="Stock control.",
            text_color=theme.INK,
            font=display_font(30),
            anchor="w",
        ).grid(row=1, column=0, sticky="w", pady=(4, 0))
        self.subtitle = muted(top, "Loading inventory…", size=10)
        self.subtitle.grid(row=2, column=0, sticky="w", pady=(3, 0))

        kpis = ctk.CTkFrame(self, fg_color="transparent")
        kpis.pack(fill="x", padx=30, pady=(18, 0))
        for index in range(4):
            kpis.grid_columnconfigure(index, weight=1, uniform="stock-kpi")
        self.retail_card = KpiCard(kpis, "Stock value (retail)", "—")
        self.retail_card.grid(row=0, column=0, sticky="nsew", padx=(0, 7))
        self.cost_card = KpiCard(kpis, "Stock value (cost)", "—", accent=theme.PINE)
        self.cost_card.grid(row=0, column=1, sticky="nsew", padx=7)
        self.units_card = KpiCard(kpis, "Units on hand", "—", accent=theme.SAND_DEEP)
        self.units_card.grid(row=0, column=2, sticky="nsew", padx=7)
        self.low_card = KpiCard(kpis, "Reorder alerts", "—", accent=theme.AMBER)
        self.low_card.grid(row=0, column=3, sticky="nsew", padx=(7, 0))

        tools = ctk.CTkFrame(self, fg_color="transparent")
        tools.pack(fill="x", padx=30, pady=(16, 0))
        tools.grid_columnconfigure(0, weight=1)
        self.filter = ctk.CTkSegmentedButton(
            tools,
            values=["All", "Low stock", "Out of stock"],
            variable=self._filter,
            command=lambda _value: self._render(),
            selected_color=theme.PINE,
            selected_hover_color=theme.PINE_SOFT,
            unselected_color=theme.CARD,
            unselected_hover_color=theme.PAPER_DEEP,
            fg_color=theme.PAPER_DEEP,
            text_color=theme.INK_SOFT,
            font=font(10),
            height=34,
        )
        self.filter.grid(row=0, column=0, sticky="w")
        self.count_note = muted(tools, "", size=9)
        self.count_note.grid(row=0, column=1, sticky="e")

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
                ("name", "Product", 255, "w"),
                ("stock", "On hand", 80, "e"),
                ("reorder", "Reorder at", 85, "e"),
                ("cover", "Cover", 90, "e"),
                ("status", "Status", 110, "w"),
                ("retail", "Retail value", 120, "e"),
            ],
            on_select=self._on_select,
            empty_message="No stock matches this filter",
            height=10,
        )
        self.table.pack(fill="both", expand=True, padx=8, pady=8)

        actions = ctk.CTkFrame(self, fg_color="transparent")
        actions.pack(fill="x", padx=30, pady=(10, 26))
        self.selection_note = muted(actions, "Select a product to adjust stock.", size=9)
        self.selection_note.pack(side="left")
        self.set_button = self._button(
            actions, "Set stock", theme.PAPER_DEEP, theme.INK_SOFT, self.set_stock
        )
        self.set_button.pack(side="right", padx=(8, 0))
        self.plus10_button = self._button(
            actions, "+10", theme.GREEN_SOFT, theme.GREEN, lambda: self.restock(10)
        )
        self.plus10_button.pack(side="right", padx=(8, 0))
        self.plus5_button = self._button(
            actions, "+5", theme.GREEN_SOFT, theme.GREEN, lambda: self.restock(5)
        )
        self.plus5_button.pack(side="right")
        for button in (self.set_button, self.plus5_button, self.plus10_button):
            button.configure(state="disabled")

    def _button(
        self,
        master: tk.Misc,
        text: str,
        background: str,
        foreground: str,
        command: Any,
    ) -> ctk.CTkButton:
        return ctk.CTkButton(
            master,
            text=text,
            width=94,
            height=32,
            corner_radius=16,
            fg_color=background,
            hover_color=theme.SAND,
            text_color=foreground,
            font=font(9, "bold"),
            command=command,
        )

    def update_data(self, analytics: dict[str, Any], snapshot: dict[str, Any]) -> None:
        self._products = list(snapshot.get("products") or [])
        self._performance = {
            str(row["id"]): row for row in analytics.get("performance", [])
        }
        kpis = analytics["kpis"]
        self.retail_card.update_value(
            format_inr(kpis["inventory_retail"]), "At current selling prices"
        )
        self.cost_card.update_value(
            format_inr(kpis["inventory_cost"]), "Capital currently in stock"
        )
        self.units_card.update_value(
            str(kpis["stock_units"]), f"Across {len(self._products)} products"
        )
        self.low_card.update_value(
            str(kpis["low_stock"]),
            f"{kpis['out_of_stock']} out of stock",
            color=theme.RED if kpis["out_of_stock"] else theme.INK,
        )
        self.subtitle.configure(
            text=(
                f"{format_inr(kpis['inventory_retail'])} of stock at retail · "
                f"{format_inr(kpis['inventory_cost'])} at cost"
            )
        )
        self._render()

    def _render(self) -> None:
        mode = self._filter.get()
        rows = []
        for product in sorted(self._products, key=lambda item: str(item.get("name", ""))):
            stock = _int(product.get("stock"))
            reorder = _int(product.get("reorderLevel"), 5)
            if mode == "Low stock" and stock > reorder:
                continue
            if mode == "Out of stock" and stock != 0:
                continue
            price = _int(product.get("price"))
            perf = self._performance.get(str(product.get("_id")), {})
            cover = perf.get("cover_days")
            cover_text = f"{cover:.0f} days" if isinstance(cover, (int, float)) else "—"
            if stock == 0:
                status, tag = "Out of stock", "out"
            elif stock <= reorder:
                status, tag = "Low stock", "low"
            else:
                status, tag = "In stock", "good"
            rows.append(
                {
                    "iid": str(product.get("_id")),
                    "values": [
                        product.get("name", "Product"),
                        str(stock),
                        str(reorder),
                        cover_text,
                        status,
                        format_inr(stock * price),
                    ],
                    "tags": (tag,),
                }
            )
        self._rows_by_id = {
            str(product.get("_id")): product for product in self._products
        }
        self.table.set_rows(rows)
        self._selected = None
        self._update_actions()
        self.count_note.configure(text=f"{len(rows)} products shown")

    def _on_select(self, row: dict[str, str] | None) -> None:
        self._selected = self._rows_by_id.get(row["_iid"]) if row else None
        self._update_actions()

    def _update_actions(self) -> None:
        state = "normal" if self._selected else "disabled"
        for button in (self.set_button, self.plus5_button, self.plus10_button):
            button.configure(state=state)

    def restock(self, amount: int) -> None:
        product = self._selected
        if not product:
            return
        payload = product_payload(product, stock=max(0, _int(product.get("stock")) + amount))
        self.app.run_mutation(
            "products:update",
            payload,
            on_success=lambda _value: self.app.refresh(),
            on_error=self._action_error,
        )

    def set_stock(self) -> None:
        if not self._selected:
            return
        StockDialog(self, self.app, self._selected)

    def open_product(self, product_id: str) -> None:
        product = self._rows_by_id.get(str(product_id))
        if product:
            StockDialog(self, self.app, product)

    def _action_error(self, error: Exception) -> None:
        messagebox.showerror("Could not update stock", str(error), parent=self)


class StockDialog(ctk.CTkToplevel):
    def __init__(self, master: tk.Misc, app: Any, product: dict[str, Any]) -> None:
        super().__init__(master)
        self.app = app
        self.product = product
        self._saving = False
        self.title("Set stock")
        self.configure(fg_color=theme.PAPER)
        self.geometry("390x270")
        self.resizable(False, False)
        self.transient(master.winfo_toplevel())
        self._build()
        self.after(20, self._center)

    def _build(self) -> None:
        wrap = ctk.CTkFrame(
            self,
            fg_color=theme.CARD,
            corner_radius=16,
            border_width=1,
            border_color=theme.LINE,
        )
        wrap.pack(fill="both", expand=True, padx=18, pady=18)
        wrap.grid_columnconfigure(0, weight=1)
        label_caps(wrap, "Inventory").grid(
            row=0, column=0, sticky="w", padx=18, pady=(16, 0)
        )
        body(
            wrap,
            f"Set stock for {self.product.get('name', 'this product')}",
            size=13,
            weight="bold",
        ).grid(row=1, column=0, sticky="w", padx=18, pady=(4, 0))
        muted(
            wrap,
            f"Currently {_int(self.product.get('stock'))} on hand · reorder at "
            f"{_int(self.product.get('reorderLevel'), 5)}",
            size=9,
        ).grid(row=2, column=0, sticky="w", padx=18, pady=(3, 0))
        self.entry = ctk.CTkEntry(
            wrap,
            height=40,
            corner_radius=9,
            border_color=theme.LINE,
            fg_color=theme.CARD_ALT,
            font=font(13, "bold"),
        )
        self.entry.grid(row=3, column=0, sticky="ew", padx=18, pady=(14, 0))
        self.entry.insert(0, str(_int(self.product.get("stock"))))
        self.entry.bind("<Return>", lambda _event: self.save())
        self.error = ctk.CTkLabel(
            wrap,
            text="",
            text_color=theme.RED,
            font=font(9),
            anchor="w",
        )
        self.error.grid(row=4, column=0, sticky="w", padx=18, pady=(4, 0))
        buttons = ctk.CTkFrame(wrap, fg_color="transparent")
        buttons.grid(row=5, column=0, sticky="e", padx=18, pady=(8, 14))
        ctk.CTkButton(
            buttons,
            text="Cancel",
            width=74,
            height=32,
            corner_radius=16,
            fg_color=theme.PAPER_DEEP,
            hover_color=theme.SAND,
            text_color=theme.INK_SOFT,
            font=font(9, "bold"),
            command=self.destroy,
        ).pack(side="left", padx=(0, 8))
        self.save_button = ctk.CTkButton(
            buttons,
            text="Save stock",
            width=96,
            height=32,
            corner_radius=16,
            fg_color=theme.PINE,
            hover_color=theme.PINE_SOFT,
            text_color=theme.PAPER,
            font=font(9, "bold"),
            command=self.save,
        )
        self.save_button.pack(side="left")

    def save(self) -> None:
        if self._saving:
            return
        try:
            stock = int(self.entry.get().strip())
            if stock < 0:
                raise ValueError
        except ValueError:
            self.error.configure(text="Enter a whole number, zero or higher.")
            return
        self._saving = True
        self.save_button.configure(state="disabled", text="Saving…")
        payload = product_payload(self.product, stock=stock)

        def done(_value: Any) -> None:
            if self.winfo_exists():
                self.grab_release()
                self.destroy()
                self.app.refresh()

        def failed(error: Exception) -> None:
            if self.winfo_exists():
                self._saving = False
                self.save_button.configure(state="normal", text="Save stock")
                self.error.configure(text=str(error))

        self.app.run_mutation("products:update", payload, on_success=done, on_error=failed)

    def _center(self) -> None:
        if not self.winfo_exists():
            return
        self.update_idletasks()
        root = self.master.winfo_toplevel()
        x = root.winfo_rootx() + (root.winfo_width() - self.winfo_width()) // 2
        y = root.winfo_rooty() + (root.winfo_height() - self.winfo_height()) // 2
        self.geometry(f"+{max(0, x)}+{max(0, y)}")
        self.grab_set()


def _int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback
