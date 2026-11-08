from __future__ import annotations

import tkinter as tk
from typing import Any

import customtkinter as ctk

from .. import theme


class Page(ctk.CTkScrollableFrame):
    def __init__(self, master: tk.Misc, app: Any) -> None:
        super().__init__(
            master,
            fg_color=theme.PAPER,
            corner_radius=0,
            scrollbar_button_color=theme.SAND,
            scrollbar_button_hover_color=theme.SAND_DEEP,
        )
        self.app = app

    def update_data(self, analytics: dict[str, Any], snapshot: dict[str, Any]) -> None:
        """Refresh the view. Called on the Tk main thread."""

    def on_show(self) -> None:
        """Called when the page becomes visible."""
