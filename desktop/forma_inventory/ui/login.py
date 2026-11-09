from __future__ import annotations

import re
import tkinter as tk
from typing import Any, Callable

import customtkinter as ctk

from .. import config, theme
from ..api import AdminRequired, AdminSession, ConvexError
from .components import display_font, font


EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class LoginView(ctk.CTkFrame):
    def __init__(
        self,
        master: tk.Misc,
        *,
        app: Any,
        on_success: Callable[[AdminSession], None],
    ) -> None:
        super().__init__(master, fg_color=theme.PAPER, corner_radius=0)
        self.app = app
        self.on_success = on_success
        self.step = "email"
        self.email = config.last_email()
        self._busy = False

        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)

        self._build_editorial()
        self._build_form()

    # ------------------------------------------------------------------ left
    def _build_editorial(self) -> None:
        panel = ctk.CTkFrame(
            self,
            width=470,
            corner_radius=0,
            fg_color=theme.PINE,
        )
        panel.grid(row=0, column=0, sticky="nsw")
        panel.grid_propagate(False)
        panel.grid_rowconfigure(0, weight=1)
        panel.grid_rowconfigure(2, weight=1)
        panel.grid_columnconfigure(0, weight=1)

        content = ctk.CTkFrame(panel, fg_color="transparent")
        content.grid(row=1, column=0, sticky="ew", padx=48)

        brand = ctk.CTkFrame(content, fg_color="transparent")
        brand.pack(anchor="w")
        ctk.CTkLabel(
            brand,
            text="Forma",
            text_color=theme.PAPER,
            font=ctk.CTkFont(family=theme.DISPLAY_FONT, size=34),
        ).pack(side="left")
        ctk.CTkLabel(
            brand,
            text="●",
            text_color=theme.SAND_DEEP,
            font=font(11),
        ).pack(side="left", padx=(3, 0), pady=(2, 0))

        ctk.CTkLabel(
            content,
            text="INVENTORY & INTELLIGENCE",
            text_color=theme.PINE_MUTED,
            font=font(9, "bold"),
        ).pack(anchor="w", pady=(38, 0))
        ctk.CTkLabel(
            content,
            text="Know what sells.\nStock what matters.",
            text_color=theme.PAPER,
            font=display_font(37),
            justify="left",
            anchor="w",
        ).pack(anchor="w", pady=(13, 0))
        ctk.CTkLabel(
            content,
            text=(
                "The private back room for the Forma storefront. Manage the "
                "catalog, watch stock, and see exactly which products earn "
                "their shelf space."
            ),
            text_color="#C8D2C9",
            font=font(11),
            justify="left",
            anchor="w",
            wraplength=350,
        ).pack(anchor="w", pady=(18, 0))

        features = ctk.CTkFrame(content, fg_color="transparent")
        features.pack(anchor="w", fill="x", pady=(30, 0))
        for title in (
            "Add, edit and retire products",
            "Stock alerts and reorder levels",
            "Revenue, margin and product intelligence",
        ):
            row = ctk.CTkFrame(features, fg_color="transparent")
            row.pack(anchor="w", fill="x", pady=5)
            ctk.CTkLabel(
                row,
                text="—",
                text_color=theme.SAND_DEEP,
                font=font(10, "bold"),
                width=18,
            ).pack(side="left")
            ctk.CTkLabel(
                row,
                text=title,
                text_color="#DDE5DC",
                font=font(10),
                anchor="w",
            ).pack(side="left")

        ctk.CTkLabel(
            panel,
            text="PRIVATE CONSOLE · ADMIN ONLY",
            text_color=theme.PINE_MUTED,
            font=font(8, "bold"),
        ).grid(row=2, column=0, sticky="sw", padx=48, pady=30)

    # ------------------------------------------------------------------ right
    def _build_form(self) -> None:
        self.form_host = ctk.CTkFrame(self, fg_color=theme.PAPER)
        self.form_host.grid(row=0, column=1, sticky="nsew")
        self.form_host.grid_rowconfigure(0, weight=1)
        self.form_host.grid_columnconfigure(0, weight=1)

        self.form = ctk.CTkFrame(self.form_host, fg_color="transparent", width=380)
        self.form.grid(row=0, column=0)
        self.form.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            self.form,
            text="STORE ADMIN",
            text_color=theme.MUTED,
            font=font(9, "bold"),
            anchor="w",
        ).grid(row=0, column=0, sticky="w")
        self.title = ctk.CTkLabel(
            self.form,
            text="Sign in to the back room",
            text_color=theme.INK,
            font=display_font(30),
            anchor="w",
        )
        self.title.grid(row=1, column=0, sticky="w", pady=(6, 0))
        self.copy = ctk.CTkLabel(
            self.form,
            text=(
                "Enter the email that owns the store administrator role. "
                "We'll send a six-digit code — there is no password."
            ),
            text_color=theme.MUTED,
            font=font(10),
            anchor="w",
            justify="left",
            wraplength=370,
        )
        self.copy.grid(row=2, column=0, sticky="w", pady=(8, 0))

        self.fields = ctk.CTkFrame(self.form, fg_color="transparent")
        self.fields.grid(row=3, column=0, sticky="ew", pady=(24, 0))
        self.fields.grid_columnconfigure(0, weight=1)

        self.email_label = ctk.CTkLabel(
            self.fields,
            text="ADMIN EMAIL",
            text_color=theme.INK_SOFT,
            font=font(8, "bold"),
            anchor="w",
        )
        self.email_label.grid(row=0, column=0, sticky="w")
        self.email_entry = ctk.CTkEntry(
            self.fields,
            height=44,
            corner_radius=10,
            border_color=theme.LINE,
            fg_color=theme.CARD,
            text_color=theme.INK,
            placeholder_text="you@example.com",
            font=font(11),
        )
        self.email_entry.grid(row=1, column=0, sticky="ew", pady=(5, 0))
        if self.email:
            self.email_entry.insert(0, self.email)
        self.email_entry.bind("<Return>", lambda _event: self.send_code())

        self.code_label = ctk.CTkLabel(
            self.fields,
            text="SIX-DIGIT CODE",
            text_color=theme.INK_SOFT,
            font=font(8, "bold"),
            anchor="w",
        )
        self.code_entry = ctk.CTkEntry(
            self.fields,
            height=44,
            corner_radius=10,
            border_color=theme.LINE,
            fg_color=theme.CARD,
            text_color=theme.INK,
            placeholder_text="000000",
            font=font(15, "bold"),
            justify="center",
        )
        self.code_entry.bind("<Return>", lambda _event: self.verify())

        self.error = ctk.CTkLabel(
            self.fields,
            text="",
            text_color=theme.RED,
            fg_color=theme.RED_SOFT,
            corner_radius=8,
            font=font(9),
            anchor="w",
            justify="left",
            wraplength=350,
            height=40,
        )

        self.primary = ctk.CTkButton(
            self.fields,
            text="Send my code",
            height=44,
            corner_radius=22,
            fg_color=theme.PINE,
            hover_color=theme.PINE_SOFT,
            text_color=theme.PAPER,
            font=font(11, "bold"),
            command=self.send_code,
        )
        self.primary.grid(row=4, column=0, sticky="ew", pady=(16, 0))

        self.secondary = ctk.CTkButton(
            self.fields,
            text="Use a different email",
            height=34,
            fg_color="transparent",
            hover_color=theme.PAPER_DEEP,
            text_color=theme.MUTED,
            font=font(9),
            command=self.back_to_email,
        )

        self.status = ctk.CTkLabel(
            self.fields,
            text="Sessions stay in memory and end when you close the app.",
            text_color=theme.MUTED,
            font=font(8),
            anchor="w",
            wraplength=360,
            justify="left",
        )
        self.status.grid(row=6, column=0, sticky="w", pady=(18, 0))
        self._show_email_step()

    # ------------------------------------------------------------------ flow
    def _show_error(self, message: str) -> None:
        self.error.configure(text=message)
        self.error.grid(row=6, column=0, sticky="ew", pady=(12, 0))
        self.status.grid_remove()

    def _clear_error(self) -> None:
        self.error.grid_remove()
        self.error.configure(text="")
        self.status.grid()

    def _set_busy(self, busy: bool) -> None:
        self._busy = busy
        state = "disabled" if busy else "normal"
        self.primary.configure(state=state)
        self.email_entry.configure(state=state)
        self.code_entry.configure(state=state)
        self.secondary.configure(state=state)

    def _show_email_step(self) -> None:
        self.step = "email"
        self.title.configure(text="Sign in to the back room")
        self.copy.configure(
            text=(
                "Enter the email that owns the store administrator role. "
                "We'll send a six-digit code — there is no password."
            )
        )
        self.email_label.grid(row=0, column=0, sticky="w")
        self.email_entry.grid(row=1, column=0, sticky="ew", pady=(5, 0))
        self.code_label.grid_remove()
        self.code_entry.grid_remove()
        self.primary.configure(text="Send my code", command=self.send_code)
        self.secondary.grid_remove()
        self.status.configure(text="Sessions stay in memory and end when you close the app.")
        self._clear_error()
        self.email_entry.focus_set()

    def _show_code_step(self) -> None:
        self.step = "code"
        self.title.configure(text="Check your inbox")
        self.copy.configure(
            text=f"We sent a six-digit code to {self.email}. It expires in 15 minutes."
        )
        self.email_label.grid_remove()
        self.email_entry.grid_remove()
        self.code_label.grid(row=2, column=0, sticky="w", pady=(4, 0))
        self.code_entry.grid(row=3, column=0, sticky="ew", pady=(5, 0))
        self.primary.configure(text="Verify & open console", command=self.verify)
        self.secondary.grid(row=5, column=0, sticky="w", pady=(6, 0))
        self.status.configure(text="Didn't get it? Go back and resend the code.")
        self._clear_error()
        self.code_entry.focus_set()

    def back_to_email(self) -> None:
        if self._busy:
            return
        self.code_entry.delete(0, "end")
        self._show_email_step()

    def send_code(self) -> None:
        if self._busy:
            return
        email = self.email_entry.get().strip()
        if not EMAIL_RE.match(email):
            self._show_error("Enter a valid email address.")
            return
        self.email = email
        self._clear_error()
        self._set_busy(True)
        self.primary.configure(text="Sending…")

        def done(_value: Any) -> None:
            if not self.winfo_exists():
                return
            self._set_busy(False)
            config.remember_email(email)
            self._show_code_step()

        def failed(error: Exception) -> None:
            if not self.winfo_exists():
                return
            self._set_busy(False)
            self.primary.configure(text="Send my code")
            self._show_error(self._message(error))

        self.app.run_async(
            lambda: self.app.client.request_code(email),
            on_success=done,
            on_error=failed,
        )

    def verify(self) -> None:
        if self._busy:
            return
        code = self.code_entry.get().strip()
        if len(code) != 6 or not code.isdigit():
            self._show_error("Enter the six-digit code from the email.")
            return
        self._clear_error()
        self._set_busy(True)
        self.primary.configure(text="Verifying…")

        def done(session: AdminSession) -> None:
            if not self.winfo_exists():
                return
            self._set_busy(False)
            config.remember_email(self.email)
            self.on_success(session)

        def failed(error: Exception) -> None:
            if not self.winfo_exists():
                return
            self._set_busy(False)
            self.primary.configure(text="Verify & open console")
            self._show_error(self._message(error))
            self.code_entry.delete(0, "end")
            self.code_entry.focus_set()

        self.app.run_async(
            lambda: AdminSession.login(self.app.client, self.email, code),
            on_success=done,
            on_error=failed,
        )

    @staticmethod
    def _message(error: Exception) -> str:
        if isinstance(error, AdminRequired):
            return (
                "This account is not an administrator. Use the email that owns "
                "the store's admin role."
            )
        if isinstance(error, ConvexError):
            return str(error)
        return str(error) or "Something went wrong. Please try again."
