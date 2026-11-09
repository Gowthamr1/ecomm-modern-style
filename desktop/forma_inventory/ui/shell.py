from __future__ import annotations

import tkinter as tk
from datetime import date, datetime
from tkinter import filedialog, messagebox
from typing import Any, Callable

import customtkinter as ctk

from .. import theme
from ..analytics import build_analytics
from ..api import AdminRequired, AdminSession, ConvexError
from ..export import export_customers, export_inventory, export_orders, export_products
from .analytics_view import AnalyticsPage
from .components import body, display_font, font, initials, muted
from .customers import CustomersPage
from .dashboard import DashboardPage
from .inventory import InventoryPage, StockDialog
from .orders import OrdersPage
from .products import ProductsPage

NAV = [
    ("dashboard", "Overview", "01"),
    ("products", "Products", "02"),
    ("inventory", "Inventory", "03"),
    ("orders", "Orders", "04"),
    ("customers", "Customers", "05"),
    ("analytics", "Analytics", "06"),
]


class ShellView(ctk.CTkFrame):
    def __init__(
        self,
        master: tk.Misc,
        *,
        app: Any,
        session: AdminSession,
    ) -> None:
        super().__init__(master, fg_color=theme.PAPER, corner_radius=0)
        self.app = app
        self.session = session
        self.snapshot: dict[str, Any] | None = None
        self.analytics: dict[str, Any] | None = None
        self.days = 30
        self._refreshing = False
        self._auto_job: str | None = None
        self._nav_buttons: dict[str, ctk.CTkButton] = {}
        self._page_types: dict[str, Any] = {}
        self._pages: dict[str, Any] = {}
        self._dirty_pages: set[str] = set()
        self._active = "dashboard"

        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)
        self._build_sidebar()
        self._build_content()
        self._build_pages()
        self.show_page("dashboard")
        self.after(60, self.refresh)

    # ------------------------------------------------------------------ sidebar
    def _build_sidebar(self) -> None:
        sidebar = ctk.CTkFrame(
            self,
            width=232,
            corner_radius=0,
            fg_color=theme.PINE,
        )
        sidebar.grid(row=0, column=0, sticky="ns")
        sidebar.grid_propagate(False)
        sidebar.grid_rowconfigure(2, weight=1)
        sidebar.grid_columnconfigure(0, weight=1)

        brand = ctk.CTkFrame(sidebar, fg_color="transparent")
        brand.grid(row=0, column=0, sticky="ew", padx=22, pady=(26, 0))
        ctk.CTkLabel(
            brand,
            text="Forma",
            text_color=theme.PAPER,
            font=ctk.CTkFont(family=theme.DISPLAY_FONT, size=28),
        ).pack(side="left")
        ctk.CTkLabel(
            brand,
            text="●",
            text_color=theme.SAND_DEEP,
            font=font(9),
        ).pack(side="left", padx=(2, 0), pady=(2, 0))
        ctk.CTkLabel(
            sidebar,
            text="INVENTORY CONSOLE",
            text_color=theme.PINE_MUTED,
            font=font(8, "bold"),
        ).grid(row=1, column=0, sticky="w", padx=24, pady=(1, 20))

        nav = ctk.CTkFrame(sidebar, fg_color="transparent")
        nav.grid(row=2, column=0, sticky="new", padx=12)
        nav.grid_columnconfigure(0, weight=1)
        for index, (key, label, number) in enumerate(NAV):
            button = ctk.CTkButton(
                nav,
                text=f"  {label}",
                anchor="w",
                height=40,
                corner_radius=9,
                fg_color="transparent",
                hover_color=theme.PINE_SOFT,
                text_color="#B7C6BA",
                font=font(10, "bold"),
                command=lambda page=key: self.show_page(page),
            )
            button.grid(row=index, column=0, sticky="ew", pady=2)
            self._nav_buttons[key] = button
            number_label = ctk.CTkLabel(
                nav,
                text=number,
                text_color=theme.PINE_MUTED,
                font=font(8),
                width=22,
            )
            number_label.grid(row=index, column=1, sticky="e", padx=(0, 6))

        bottom = ctk.CTkFrame(sidebar, fg_color="transparent")
        bottom.grid(row=3, column=0, sticky="sew", padx=16, pady=18)
        account = ctk.CTkFrame(
            bottom,
            fg_color=theme.PINE_SOFT,
            corner_radius=12,
        )
        account.pack(fill="x")
        top = ctk.CTkFrame(account, fg_color="transparent")
        top.pack(fill="x", padx=12, pady=(12, 0))
        ctk.CTkLabel(
            top,
            text=initials(self.session.display_name),
            width=30,
            height=30,
            corner_radius=15,
            fg_color=theme.SAND,
            text_color=theme.PINE,
            font=font(9, "bold"),
        ).pack(side="left")
        copy = ctk.CTkFrame(top, fg_color="transparent")
        copy.pack(side="left", fill="x", expand=True, padx=(8, 0))
        ctk.CTkLabel(
            copy,
            text=self.session.display_name,
            text_color=theme.PAPER,
            font=font(9, "bold"),
            anchor="w",
        ).pack(anchor="w")
        ctk.CTkLabel(
            copy,
            text="Administrator",
            text_color="#A9BBAF",
            font=font(8),
            anchor="w",
        ).pack(anchor="w")
        ctk.CTkButton(
            account,
            text="Sign out",
            height=28,
            corner_radius=8,
            fg_color="transparent",
            hover_color="#385146",
            text_color="#C9D4CA",
            font=font(8, "bold"),
            command=self._sign_out,
        ).pack(fill="x", padx=10, pady=(8, 10))
        ctk.CTkLabel(
            bottom,
            text="Forma Studio · admin console",
            text_color=theme.PINE_MUTED,
            font=font(7),
        ).pack(anchor="w", padx=4, pady=(10, 0))

    # ------------------------------------------------------------------ content
    def _build_content(self) -> None:
        content = ctk.CTkFrame(self, fg_color=theme.PAPER, corner_radius=0)
        content.grid(row=0, column=1, sticky="nsew")
        content.grid_rowconfigure(1, weight=1)
        content.grid_columnconfigure(0, weight=1)

        topbar = ctk.CTkFrame(
            content,
            height=62,
            fg_color=theme.PAPER,
            corner_radius=0,
        )
        topbar.grid(row=0, column=0, sticky="ew", padx=30)
        topbar.grid_columnconfigure(1, weight=1)
        topbar.grid_propagate(False)
        self.page_title = ctk.CTkLabel(
            topbar,
            text="Overview",
            text_color=theme.INK_SOFT,
            font=font(10, "bold"),
        )
        self.page_title.grid(row=0, column=0, sticky="w")
        self.refresh_state = muted(topbar, "Connecting…", size=9)
        self.refresh_state.grid(row=0, column=1, sticky="e", padx=(0, 12))
        self.export_button = ctk.CTkButton(
            topbar,
            text="Export CSV",
            width=94,
            height=30,
            corner_radius=15,
            fg_color=theme.PAPER_DEEP,
            border_width=1,
            border_color=theme.LINE,
            hover_color=theme.SAND,
            text_color=theme.INK_SOFT,
            font=font(8, "bold"),
            command=self.export_active,
            state="disabled",
        )
        self.export_button.grid(row=0, column=2, sticky="e", padx=(0, 8))
        self.refresh_button = ctk.CTkButton(
            topbar,
            text="Refresh",
            width=78,
            height=30,
            corner_radius=15,
            fg_color=theme.CARD,
            border_width=1,
            border_color=theme.LINE,
            hover_color=theme.PAPER_DEEP,
            text_color=theme.INK_SOFT,
            font=font(8, "bold"),
            command=self.refresh,
        )
        self.refresh_button.grid(row=0, column=3, sticky="e")

        self.page_host = ctk.CTkFrame(content, fg_color=theme.PAPER, corner_radius=0)
        self.page_host.grid(row=1, column=0, sticky="nsew")
        self.page_host.grid_rowconfigure(0, weight=1)
        self.page_host.grid_columnconfigure(0, weight=1)

    def _build_pages(self) -> None:
        self._page_types = {
            "dashboard": DashboardPage,
            "products": ProductsPage,
            "inventory": InventoryPage,
            "orders": OrdersPage,
            "customers": CustomersPage,
            "analytics": AnalyticsPage,
        }

    def _ensure_page(self, key: str) -> Any | None:
        page = self._pages.get(key)
        if page is not None:
            return page
        page_type = self._page_types.get(key)
        if page_type is None:
            return None
        page = page_type(self.page_host, self)
        page.grid(row=0, column=0, sticky="nsew")
        self._pages[key] = page
        if self.analytics is not None:
            self._dirty_pages.add(key)
        return page

    # ------------------------------------------------------------------ nav
    def show_page(self, key: str) -> None:
        page = self._ensure_page(key)
        if page is None:
            return
        self._active = key
        if key in self._dirty_pages:
            self._render_active_page()
        page.raise_page()
        page.on_show()
        self.page_title.configure(text=dict((item[0], item[1]) for item in NAV).get(key, key))
        for name, button in self._nav_buttons.items():
            active = name == key
            button.configure(
                fg_color=theme.PINE_SOFT if active else "transparent",
                text_color=theme.PAPER if active else "#B7C6BA",
            )

    # ------------------------------------------------------------------ data
    def refresh(self) -> None:
        if self._refreshing:
            return
        self._refreshing = True
        self.refresh_button.configure(state="disabled", text="Loading…")
        self.refresh_state.configure(text="Refreshing store data…", text_color=theme.MUTED)

        def done(snapshot: dict[str, Any]) -> None:
            self._refreshing = False
            if not self.winfo_exists():
                return
            self.snapshot = snapshot
            self.analytics = build_analytics(snapshot, self.days)
            self._dirty_pages.update(self._page_types)
            self._render_active_page()
            self.export_button.configure(state="normal")
            self.refresh_button.configure(state="normal", text="Refresh")
            self.refresh_state.configure(
                text=f"Updated {datetime.now().strftime('%H:%M')}",
                text_color=theme.GREEN,
            )
            self._schedule_auto_refresh()

        def failed(error: Exception) -> None:
            self._refreshing = False
            if not self.winfo_exists():
                return
            self.refresh_button.configure(state="normal", text="Refresh")
            self.refresh_state.configure(text="Could not refresh", text_color=theme.RED)
            if isinstance(error, AdminRequired) or _looks_like_auth(error):
                messagebox.showerror(
                    "Admin session ended",
                    "Your admin session is no longer valid. Please sign in again.",
                    parent=self,
                )
                self._sign_out(skip_confirm=True)
            else:
                self.refresh_state.configure(
                    text=f"Offline — {_short(error)}", text_color=theme.RED
                )

        self.app.run_async(self.session.snapshot, on_success=done, on_error=failed)

    def _render_active_page(self) -> None:
        page = self._pages.get(self._active)
        if page is None or self.analytics is None or self.snapshot is None:
            return
        page.update_data(self.analytics, self.snapshot)
        self._dirty_pages.discard(self._active)

    def _schedule_auto_refresh(self) -> None:
        if self._auto_job is not None:
            try:
                self.after_cancel(self._auto_job)
            except tk.TclError:
                pass
        self._auto_job = self.after(180_000, self.refresh)

    def set_range(self, days: int) -> None:
        self.days = days
        if self.snapshot:
            self.analytics = build_analytics(self.snapshot, days)
            self._dirty_pages.update(self._page_types)
            self._render_active_page()
        else:
            self.refresh()

    # ------------------------------------------------------------------ export
    def export_active(self) -> None:
        if not self.snapshot or not self.analytics:
            messagebox.showinfo(
                "Nothing to export yet",
                "Let the store data load, then try again.",
                parent=self,
            )
            return

        kind = (
            self._active
            if self._active in {"products", "inventory", "orders", "customers"}
            else "orders"
        )
        labels = {
            "products": "Products",
            "inventory": "Inventory",
            "orders": "Orders",
            "customers": "Customers",
        }
        filename = filedialog.asksaveasfilename(
            parent=self,
            title=f"Export {labels[kind].lower()} as CSV",
            initialfile=f"forma-{kind}-{date.today().isoformat()}.csv",
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")],
        )
        if not filename:
            return
        writers = {
            "products": export_products,
            "inventory": export_inventory,
            "orders": export_orders,
            "customers": export_customers,
        }
        try:
            writers[kind](filename, self.snapshot, self.analytics)
        except OSError as error:
            messagebox.showerror(
                "Could not export",
                f"The CSV could not be written.\n\n{error}",
                parent=self,
            )
            return
        self.refresh_state.configure(
            text=f"Exported {labels[kind].lower()} CSV",
            text_color=theme.GREEN,
        )

    # ------------------------------------------------------------------ actions
    def run_mutation(
        self,
        path: str,
        args: dict[str, Any],
        *,
        on_success: Callable[[Any], None],
        on_error: Callable[[Exception], None],
    ) -> None:
        self.app.run_async(
            lambda: self.session.call("mutation", path, args),
            on_success=on_success,
            on_error=self._wrap_error(on_error),
        )

    def run_async(
        self,
        fn: Callable[[], Any],
        on_success: Callable[[Any], None],
        on_error: Callable[[Exception], None],
    ) -> None:
        self.app.run_async(fn, on_success=on_success, on_error=self._wrap_error(on_error))

    def _wrap_error(
        self, handler: Callable[[Exception], None]
    ) -> Callable[[Exception], None]:
        def wrapped(error: Exception) -> None:
            if isinstance(error, AdminRequired) or _looks_like_auth(error):
                handler(error)
                messagebox.showerror(
                    "Admin session ended",
                    "Please sign in again to continue.",
                    parent=self,
                )
                self._sign_out(skip_confirm=True)
                return
            handler(error)

        return wrapped

    def open_stock_dialog(self, product_id: str) -> None:
        if not self.snapshot:
            return
        product = next(
            (
                item
                for item in self.snapshot.get("products", [])
                if str(item.get("_id")) == str(product_id)
            ),
            None,
        )
        if product:
            StockDialog(self, self, product)

    def _sign_out(self, skip_confirm: bool = False) -> None:
        if not skip_confirm and not messagebox.askyesno(
            "Sign out?",
            "Close this admin session and return to the sign-in screen?",
            parent=self,
        ):
            return
        if self._auto_job is not None:
            try:
                self.after_cancel(self._auto_job)
            except tk.TclError:
                pass
        self.app.run_async(
            self.session.sign_out,
            on_success=lambda _value: self.app.show_login(),
            on_error=lambda _error: self.app.show_login(),
        )


def _looks_like_auth(error: Exception) -> bool:
    text = str(error).lower()
    return "sign in" in text or "admin access" in text or "token" in text and "expired" in text


def _short(error: Exception) -> str:
    text = str(error).strip().replace("\n", " ")
    return text[:90] + ("…" if len(text) > 90 else "")
