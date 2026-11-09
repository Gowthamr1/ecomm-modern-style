from __future__ import annotations

import tkinter as tk
from tkinter import ttk

PAPER = "#F7F3EC"
PAPER_DEEP = "#EFE8DC"
CARD = "#FFFCF7"
CARD_ALT = "#FBF7F0"
PINE = "#20382F"
PINE_SOFT = "#2B473C"
PINE_MUTED = "#5E7568"
SAND = "#E8DFD1"
SAND_DEEP = "#C9B79E"
ACCENT = "#B5654A"
ACCENT_DARK = "#98513A"
ACCENT_SOFT = "#F0E0D8"
INK = "#1F2A24"
INK_SOFT = "#48554D"
MUTED = "#7C857E"
LINE = "#E4DBCE"
LINE_SOFT = "#EEE7DB"
WHITE = "#FFFFFF"
GREEN = "#3F6B55"
GREEN_SOFT = "#E4EEE7"
AMBER = "#B77B32"
AMBER_SOFT = "#F6EAD7"
RED = "#A94F45"
RED_SOFT = "#F5E3E1"
BLUE = "#4A6C7A"

CHART_COLORS = [
    ACCENT,
    PINE,
    SAND_DEEP,
    "#7A8F7D",
    "#C58A3D",
    "#4A6C7A",
    "#9B7A6A",
]

DISPLAY_FONT = "Georgia"
BODY_FONT = "Segoe UI"
MONO_FONT = "Consolas"

STATUS_TONES = {
    "paid": (GREEN_SOFT, GREEN),
    "shipped": ("#E7EEF1", BLUE),
    "delivered": (GREEN_SOFT, GREEN),
    "cancelled": (RED_SOFT, RED),
    "succeeded": (GREEN_SOFT, GREEN),
    "refunded": (RED_SOFT, RED),
    "in stock": (GREEN_SOFT, GREEN),
    "low stock": (AMBER_SOFT, AMBER),
    "out of stock": (RED_SOFT, RED),
    "star": (GREEN_SOFT, GREEN),
    "restock": (AMBER_SOFT, AMBER),
    "restock now": (RED_SOFT, RED),
    "slow mover": (PAPER_DEEP, INK_SOFT),
    "clear stock": (RED_SOFT, RED),
    "thin margin": (AMBER_SOFT, AMBER),
    "steady": (GREEN_SOFT, GREEN),
    "watch": (PAPER_DEEP, INK_SOFT),
}


def configure_ttk(root: tk.Misc) -> None:
    style = ttk.Style(root)
    try:
        style.theme_use("clam")
    except tk.TclError:
        pass
    style.configure(
        "Forma.Treeview",
        background=CARD,
        fieldbackground=CARD,
        foreground=INK,
        borderwidth=0,
        relief="flat",
        rowheight=38,
        font=(BODY_FONT, 10),
    )
    style.configure(
        "Forma.Treeview.Heading",
        background=SAND,
        foreground=INK_SOFT,
        borderwidth=0,
        relief="flat",
        padding=(8, 9),
        font=(BODY_FONT, 9, "bold"),
    )
    style.map(
        "Forma.Treeview",
        background=[("selected", PINE)],
        foreground=[("selected", PAPER)],
    )
    style.map(
        "Forma.Treeview.Heading",
        background=[("active", SAND_DEEP)],
    )
    style.configure(
        "Forma.Vertical.TScrollbar",
        background=SAND,
        troughcolor=CARD,
        bordercolor=CARD,
        arrowcolor=MUTED,
        relief="flat",
        width=10,
    )
    style.configure(
        "Forma.Horizontal.TScrollbar",
        background=SAND,
        troughcolor=CARD,
        bordercolor=CARD,
        arrowcolor=MUTED,
        relief="flat",
        width=10,
    )


def truncate(value: str, length: int) -> str:
    text = str(value)
    return text if len(text) <= length else text[: max(0, length - 1)].rstrip() + "…"
