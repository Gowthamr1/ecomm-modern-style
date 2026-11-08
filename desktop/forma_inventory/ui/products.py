from __future__ import annotations

import tkinter as tk
from tkinter import messagebox
from typing import Any

import customtkinter as ctk

from .. import theme
from ..analytics import format_inr, product_payload
from .base import Page
from .components import DataTable, body, display_font, font, label_caps, muted
from .product_dialog import ProductDialog


class ProductsPage(Page):
    def __init__(self, master: tk.Misc, app: Any) -> None:
        super().__init__(master, app)
        self._products: list[dict[str, Any]] = []
        self._performance: dict[str, dict[str, Any]] = {}
        self._selected: dict[str, Any] | None = None
        self._query = tk.StringVar()
        self._category = tk.StringVar(value="All categories")
        self._build()

    def _build(self) -> None:
        top = ctk.CTkFrame(self, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=(24, 0))
        top.grid_columnconfigure(0, weight=1)
        label_caps(top, "Catalog").grid(row=0, column=0, sticky="w")
        ctk.CTkLabel(
            top,
            text="Products.",
            text_color=theme.INK,
            font=display_font(30),
            anchor="w",
        ).grid(row=1, column=0, sticky="w", pady=(4, 0))
        self.subtitle = muted(top, "Loading catalog…", size=10)
        self.subtitle.grid(row=2, column=0, sticky="w", pady=(3, 0))
        ctk.CTkButton(
            top,
            text="+  Add product",
            width=132,
            height=38,
            corner_radius=19,
            fg_color=theme.PINE,
            hover_color=theme.PINE_SOFT,
            text_color=theme.PAPER,
            font=font(10, "bold"),
            command=self.open_add,
        ).grid(row=0, column=1, rowspan=3, sticky="e")

        tools = ctk.CTkFrame(self, fg_color="transparent")
        tools.pack(fill="x", padx=30, pady=(18, 0))
        tools.grid_columnconfigure(0, weight=1)
        self.search = ctk.CTkEntry(
            tools,
            height=38,
            corner_radius=10,
            border_color=theme.LINE,
            fg_color=theme.CARD,
            placeholder_text="Search by name, category or material…",
            font=font(10),
            textvariable=self._query,
        )
        self.search.grid(row=0, column=0, sticky="ew", padx=(0, 10))
        self.search.bind("<KeyRelease>", lambda _event: self._render())
        self.category_menu = ctk.CTkOptionMenu(
            tools,
            values=["All categories"],
            variable=self._category,
            width=170,
            height=38,
            corner_radius=10,
            fg_color=theme.CARD,
            button_color=theme.PAPER_DEEP,
            button_hover_color=theme.SAND,
            text_color=theme.INK,
            dropdown_fg_color=theme.CARD,
            dropdown_text_color=theme.INK,
            dropdown_hover_color=theme.PAPER_DEEP,
            font=font(10),
            dropdown_font=font(10),
            command=lambda _value: self._render(),
        )
        self.category_menu.grid(row=0, column=1, sticky="e")

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
                ("name", "Product", 250, "w"),
                ("category", "Category", 110, "w"),
                ("price", "Price", 105, "e"),
                ("cost", "Cost", 100, "e"),
                ("margin", "Margin", 80, "e"),
                ("stock", "Stock", 65, "e"),
                ("status", "Status", 105, "w"),
            ],
            on_select=self._on_select,
            on_double_click=lambda _row: self.open_edit(),
            empty_message="No products match this search",
            height=11,
        )
        self.table.pack(fill="both", expand=True, padx=8, pady=8)

        actions = ctk.CTkFrame(self, fg_color="transparent")
        actions.pack(fill="x", padx=30, pady=(10, 26))
        self.selection_note = muted(actions, "Select a product to edit or restock.", size=9)
        self.selection_note.pack(side="left")
        self.delete_button = self._small_button(
            actions, "Delete", theme.RED_SOFT, theme.RED, self.delete_selected
        )
        self.delete_button.pack(side="right", padx=(8, 0))
        self.edit_button = self._small_button(
            actions, "Edit", theme.PAPER_DEEP, theme.INK_SOFT, self.open_edit
        )
        self.edit_button.pack(side="right", padx=(8, 0))
        self.restock_button = self._small_button(
            actions,
            "Restock +5",
            theme.GREEN_SOFT,
            theme.GREEN,
            self.restock_selected,
        )
        self.restock_button.pack(side="right")
        for button in (self.edit_button, self.delete_button, self.restock_button):
            button.configure(state="disabled")

    def _small_button(
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
            width=100,
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
        categories = sorted(
            {str(product.get("category", "Other")) for product in self._products}
        )
        self.category_menu.configure(values=["All categories", *categories])
        if self._category.get() not in ["All categories", *categories]:
            self._category.set("All categories")
        self.subtitle.configure(
            text=(
                f"{len(self._products)} products · "
                f"{format_inr(analytics['kpis']['inventory_retail'])} retail stock value"
            )
        )
        self._render()

    def _render(self) -> None:
        query = self._query.get().strip().lower()
        category = self._category.get()
        rows = []
        for product in sorted(
            self._products, key=lambda item: str(item.get("name", "")).lower()
        ):
            haystack = " ".join(
                str(product.get(key, ""))
                for key in ("name", "category", "material", "tagline")
            ).lower()
            if query and query not in haystack:
                continue
            if category != "All categories" and product.get("category") != category:
                continue
            price = _int(product.get("price"))
            cost = _int(product.get("cost"), int(price * 0.55))
            margin = ((price - cost) / price * 100) if price else 0
            stock = _int(product.get("stock"))
            reorder = _int(product.get("reorderLevel"), 5)
            if stock == 0:
                status, tag = "Out of stock", "out"
            elif stock <= reorder:
                status, tag = "Low stock", "low"
            else:
                status, tag = "In stock", "good"
            rows.append(
                {
                    "iid": str(product.get("_id")),
                    "product": product,
                    "values": [
                        product.get("name", "Product"),
                        product.get("category", "Other"),
                        format_inr(price),
                        format_inr(cost),
                        f"{margin:.0f}%",
                        str(stock),
                        status,
                    ],
                    "tags": (tag,),
                }
            )
        self._rows_by_id = {row["iid"]: row["product"] for row in rows}
        self.table.set_rows(
            [
                {
                    "iid": row["iid"],
                    "values": row["values"],
                    "tags": row["tags"],
                }
                for row in rows
            ]
        )
        self._selected = None
        self._update_actions()
        if not rows:
            self.selection_note.configure(text="No products match this search.")
        else:
            self.selection_note.configure(
                text=f"{len(rows)} shown · double-click a row to edit"
            )

    def _on_select(self, row: dict[str, str] | None) -> None:
        if not row:
            self._selected = None
        else:
            self._selected = self._rows_by_id.get(row["_iid"])
        self._update_actions()

    def _update_actions(self) -> None:
        state = "normal" if self._selected else "disabled"
        for button in (self.edit_button, self.delete_button, self.restock_button):
            button.configure(state=state)

    def open_add(self) -> None:
        ProductDialog(self, self.app, None)

    def open_edit(self) -> None:
        if not self._selected:
            return
        ProductDialog(self, self.app, self._selected)

    def delete_selected(self) -> None:
        product = self._selected
        if not product:
            return
        confirmed = messagebox.askyesno(
            "Remove product?",
            f"Remove “{product.get('name')}” from the storefront?\n\n"
            "Existing orders keep their line-item snapshot. This cannot be undone.",
            parent=self,
        )
        if not confirmed:
            return
        self.app.run_mutation(
            "products:remove",
            {"productId": product.get("_id")},
            on_success=lambda _value: self.app.refresh(),
            on_error=self._action_error,
        )

    def restock_selected(self) -> None:
        product = self._selected
        if not product:
            return
        payload = product_payload(product, stock=_int(product.get("stock")) + 5)
        self.app.run_mutation(
            "products:update",
            payload,
            on_success=lambda _value: self.app.refresh(),
            on_error=self._action_error,
        )

    def _action_error(self, error: Exception) -> None:
        messagebox.showerror("Could not update the catalog", str(error), parent=self)


def _int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback
