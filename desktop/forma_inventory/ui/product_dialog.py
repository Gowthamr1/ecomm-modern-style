from __future__ import annotations

import tkinter as tk
from typing import Any, Callable

import customtkinter as ctk

from .. import theme
from ..analytics import format_inr, parse_inr
from .components import body, display_font, font, label_caps, muted

FALLBACK_IMAGE = (
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36"
    "?auto=format&fit=crop&w=1200&q=80"
)


class ProductDialog(ctk.CTkToplevel):
    def __init__(
        self,
        master: tk.Misc,
        app: Any,
        product: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(master)
        self.app = app
        self.product = product
        self._saving = False
        self.title("Edit product" if product else "New product")
        self.configure(fg_color=theme.PAPER)
        screen_h = self.winfo_screenheight()
        dialog_h = min(760, max(620, screen_h - 100))
        self.geometry(f"820x{dialog_h}")
        self.minsize(740, 620)
        self.resizable(True, True)
        self.transient(master.winfo_toplevel())
        self.protocol("WM_DELETE_WINDOW", self._close)
        self.bind("<Escape>", lambda _event: self._close())

        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=1)
        self._build_header()
        self._build_form()
        self._build_footer()
        self.after(20, self._center)

    # ------------------------------------------------------------------ chrome
    def _build_header(self) -> None:
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, sticky="ew", padx=28, pady=(22, 8))
        header.grid_columnconfigure(0, weight=1)
        label_caps(header, "Catalog").grid(row=0, column=0, sticky="w")
        ctk.CTkLabel(
            header,
            text="Edit product" if self.product else "Add a product",
            text_color=theme.INK,
            font=display_font(25),
            anchor="w",
        ).grid(row=1, column=0, sticky="w", pady=(3, 0))
        self.subtitle = muted(
            header,
            "Changes go live on the web store and Android app immediately."
            if self.product
            else "A new piece for the storefront. Slug and timestamps are generated automatically.",
            size=10,
        )
        self.subtitle.grid(row=2, column=0, sticky="w", pady=(3, 0))
        ctk.CTkButton(
            header,
            text="✕",
            width=30,
            height=30,
            corner_radius=15,
            fg_color=theme.PAPER_DEEP,
            hover_color=theme.SAND,
            text_color=theme.INK_SOFT,
            font=font(11),
            command=self._close,
        ).grid(row=0, column=1, rowspan=3, sticky="ne")

    def _build_form(self) -> None:
        form = ctk.CTkScrollableFrame(
            self,
            fg_color=theme.CARD,
            corner_radius=16,
            border_width=1,
            border_color=theme.LINE,
            scrollbar_button_color=theme.SAND,
            scrollbar_button_hover_color=theme.SAND_DEEP,
        )
        form.grid(row=1, column=0, sticky="nsew", padx=28, pady=(4, 8))
        form.grid_columnconfigure(0, weight=1, uniform="field")
        form.grid_columnconfigure(1, weight=1, uniform="field")

        self.fields: dict[str, ctk.CTkEntry] = {}
        self._entry(form, 0, 0, "Product name", "name", colspan=2)
        self._entry(form, 1, 0, "Category", "category")
        self._entry(form, 1, 1, "Material", "material")
        self._entry(form, 2, 0, "Price (₹)", "price")
        self._entry(form, 2, 1, "Compare at (₹)", "compare")
        self._entry(form, 3, 0, "Unit cost (₹)", "cost")
        self._entry(form, 3, 1, "Stock", "stock")
        self._entry(form, 4, 0, "Reorder level", "reorder")
        self._entry(form, 4, 1, "Tagline", "tagline")
        self._entry(form, 5, 0, "Image URL", "image", colspan=2)

        feats = ctk.CTkFrame(form, fg_color="transparent")
        feats.grid(row=6, column=0, columnspan=2, sticky="ew", padx=16, pady=(13, 4))
        feats.grid_columnconfigure(0, weight=1)
        label_caps(feats, "Storefront placement").grid(row=0, column=0, sticky="w")
        self.featured_var = tk.BooleanVar(
            value=bool(self.product.get("featured")) if self.product else False
        )
        ctk.CTkSwitch(
            feats,
            text="Feature on the home page",
            variable=self.featured_var,
            onvalue=True,
            offvalue=False,
            progress_color=theme.PINE,
            button_color=theme.CARD,
            button_hover_color=theme.PAPER,
            text_color=theme.INK_SOFT,
            font=font(10),
        ).grid(row=1, column=0, sticky="w", pady=(6, 0))

        self.margin_label = ctk.CTkLabel(
            form,
            text="",
            text_color=theme.MUTED,
            font=font(9),
            anchor="w",
        )
        self.margin_label.grid(row=7, column=0, columnspan=2, sticky="w", padx=18, pady=(4, 6))

        desc_wrap = ctk.CTkFrame(form, fg_color="transparent")
        desc_wrap.grid(row=8, column=0, columnspan=2, sticky="ew", padx=16, pady=(4, 16))
        desc_wrap.grid_columnconfigure(0, weight=1)
        label_caps(desc_wrap, "Description").grid(row=0, column=0, sticky="w")
        self.description = ctk.CTkTextbox(
            desc_wrap,
            height=96,
            corner_radius=9,
            border_width=1,
            border_color=theme.LINE,
            fg_color=theme.CARD_ALT,
            text_color=theme.INK,
            font=font(10),
            wrap="word",
        )
        self.description.grid(row=1, column=0, sticky="ew", pady=(5, 0))
        if self.product:
            self.description.insert("1.0", self.product.get("description", ""))

        self.error = ctk.CTkLabel(
            form,
            text="",
            text_color=theme.RED,
            fg_color=theme.RED_SOFT,
            corner_radius=8,
            height=36,
            font=font(9),
            anchor="w",
            wraplength=700,
        )
        self.error.grid(row=9, column=0, columnspan=2, sticky="ew", padx=16, pady=(0, 14))
        self.error.grid_remove()

        self.fields["price"].bind("<KeyRelease>", self._update_margin)
        self.fields["cost"].bind("<KeyRelease>", self._update_margin)
        self._prefill()
        self._update_margin()

    def _entry(
        self,
        parent: tk.Misc,
        row: int,
        column: int,
        label: str,
        key: str,
        *,
        colspan: int = 1,
    ) -> ctk.CTkEntry:
        wrap = ctk.CTkFrame(parent, fg_color="transparent")
        wrap.grid(
            row=row,
            column=column,
            columnspan=colspan,
            sticky="ew",
            padx=16,
            pady=(10, 2),
        )
        wrap.grid_columnconfigure(0, weight=1)
        label_caps(wrap, label).grid(row=0, column=0, sticky="w")
        entry = ctk.CTkEntry(
            wrap,
            height=38,
            corner_radius=9,
            border_color=theme.LINE,
            fg_color=theme.CARD_ALT,
            text_color=theme.INK,
            font=font(10),
        )
        entry.grid(row=1, column=0, sticky="ew", pady=(4, 0))
        self.fields[key] = entry
        return entry

    def _prefill(self) -> None:
        product = self.product or {}
        values = {
            "name": product.get("name", ""),
            "category": product.get("category", ""),
            "material": product.get("material", ""),
            "price": _rupees(product.get("price")),
            "compare": _rupees(product.get("compareAtPrice")),
            "cost": (
                _rupees(product.get("cost"), blank_zero=False)
                if product.get("cost") is not None
                else _rupees(int(product.get("price", 0) * 0.55))
            ),
            "stock": str(product.get("stock", 0)),
            "reorder": str(product.get("reorderLevel", 5)),
            "tagline": product.get("tagline", ""),
            "image": product.get("image", ""),
        }
        for key, value in values.items():
            entry = self.fields[key]
            entry.delete(0, "end")
            if value:
                entry.insert(0, str(value))
        self.fields["name"].focus_set()

    def _build_footer(self) -> None:
        footer = ctk.CTkFrame(self, fg_color="transparent")
        footer.grid(row=2, column=0, sticky="ew", padx=28, pady=(4, 22))
        footer.grid_columnconfigure(0, weight=1)
        muted(
            footer,
            "Prices are entered in rupees and stored by the server in paise.",
            size=9,
        ).grid(row=0, column=0, sticky="w")
        ctk.CTkButton(
            footer,
            text="Cancel",
            width=90,
            height=38,
            corner_radius=19,
            fg_color=theme.PAPER_DEEP,
            hover_color=theme.SAND,
            text_color=theme.INK_SOFT,
            font=font(10, "bold"),
            command=self._close,
        ).grid(row=0, column=1, padx=(10, 8))
        self.save_button = ctk.CTkButton(
            footer,
            text="Save product" if self.product else "Add product",
            width=132,
            height=38,
            corner_radius=19,
            fg_color=theme.PINE,
            hover_color=theme.PINE_SOFT,
            text_color=theme.PAPER,
            font=font(10, "bold"),
            command=self.save,
        )
        self.save_button.grid(row=0, column=2)

    # ------------------------------------------------------------------ actions
    def _update_margin(self, _event: tk.Event | None = None) -> None:
        try:
            price = parse_inr(self.fields["price"].get())
            cost_text = self.fields["cost"].get().strip()
            cost = parse_inr(cost_text) if cost_text else int(price * 0.55)
        except ValueError:
            self.margin_label.configure(text="Enter a price to preview the margin.")
            return
        if price <= 0:
            self.margin_label.configure(text="Price must be greater than zero.")
            return
        margin = (price - cost) / price * 100
        self.margin_label.configure(
            text=(
                f"Selling at {format_inr(price)} · unit cost {format_inr(cost)} · "
                f"{margin:.0f}% gross margin"
            )
        )

    def save(self) -> None:
        if self._saving:
            return
        self.error.grid_remove()
        try:
            payload = self._payload()
        except ValueError as error:
            self._show_error(str(error))
            return
        self._saving = True
        self.save_button.configure(state="disabled", text="Saving…")
        if self.product:
            path = "products:update"
            payload["productId"] = self.product.get("_id")
        else:
            path = "products:create"

        def done(_value: Any) -> None:
            if not self.winfo_exists():
                return
            self._saving = False
            try:
                self.grab_release()
            except tk.TclError:
                pass
            self.destroy()
            self.app.refresh()

        def failed(error: Exception) -> None:
            if not self.winfo_exists():
                return
            self._saving = False
            self.save_button.configure(
                state="normal", text="Save product" if self.product else "Add product"
            )
            self._show_error(str(error))

        self.app.run_mutation(path, payload, on_success=done, on_error=failed)

    def _payload(self) -> dict[str, Any]:
        name = self.fields["name"].get().strip()
        if not name:
            raise ValueError("Give the product a name.")
        price = parse_inr(self.fields["price"].get())
        if price <= 0:
            raise ValueError("Price must be greater than zero.")
        compare_text = self.fields["compare"].get().strip()
        compare = parse_inr(compare_text) if compare_text else None
        if compare is not None and compare < 0:
            raise ValueError("Compare-at price cannot be negative.")
        cost_text = self.fields["cost"].get().strip()
        cost = parse_inr(cost_text) if cost_text else int(price * 0.55)
        if cost < 0:
            raise ValueError("Unit cost cannot be negative.")
        stock = _non_negative_int(self.fields["stock"].get(), "Stock")
        reorder = _non_negative_int(self.fields["reorder"].get(), "Reorder level")
        image = self.fields["image"].get().strip() or FALLBACK_IMAGE
        payload: dict[str, Any] = {
            "name": name,
            "category": self.fields["category"].get().strip() or "General",
            "tagline": self.fields["tagline"].get().strip() or "A considered everyday object",
            "description": self.description.get("1.0", "end").strip()
            or "A considered everyday object from the Forma collection.",
            "price": price,
            "cost": cost,
            "reorderLevel": reorder,
            "image": image,
            "material": self.fields["material"].get().strip() or "—",
            "stock": stock,
            "featured": bool(self.featured_var.get()),
        }
        if compare is not None:
            payload["compareAtPrice"] = compare
        elif self.product:
            payload["clearCompareAtPrice"] = True
        return payload

    def _show_error(self, message: str) -> None:
        self.error.configure(text=message)
        self.error.grid()

    def _close(self) -> None:
        if self._saving:
            return
        try:
            self.grab_release()
        except tk.TclError:
            pass
        self.destroy()

    def _center(self) -> None:
        if not self.winfo_exists():
            return
        self.update_idletasks()
        root = self.master.winfo_toplevel()
        try:
            x = root.winfo_rootx() + (root.winfo_width() - self.winfo_width()) // 2
            y = root.winfo_rooty() + (root.winfo_height() - self.winfo_height()) // 2
            self.geometry(f"+{max(0, x)}+{max(0, y)}")
            self.grab_set()
        except tk.TclError:
            pass


def _rupees(paise: Any, *, blank_zero: bool = True) -> str:
    try:
        value = int(paise or 0) / 100
    except (TypeError, ValueError):
        return ""
    if value == 0 and blank_zero:
        return ""
    text = f"{value:.2f}"
    return text.rstrip("0").rstrip(".")


def _non_negative_int(value: str, label: str) -> int:
    text = value.strip()
    if not text:
        return 0
    try:
        number = int(text)
    except ValueError as error:
        raise ValueError(f"{label} must be a whole number.") from error
    if number < 0:
        raise ValueError(f"{label} cannot be negative.")
    return number
