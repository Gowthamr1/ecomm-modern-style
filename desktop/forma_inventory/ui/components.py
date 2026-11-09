from __future__ import annotations

import tkinter as tk
from tkinter import ttk
from typing import Any, Callable, Iterable

import customtkinter as ctk

from .. import theme


def font(size: int = 12, weight: str = "normal", family: str = theme.BODY_FONT) -> ctk.CTkFont:
    return ctk.CTkFont(family=family, size=size, weight=weight)


def display_font(size: int = 28, weight: str = "normal") -> ctk.CTkFont:
    return ctk.CTkFont(family=theme.DISPLAY_FONT, size=size, weight=weight)


def initials(value: str | None) -> str:
    if not value:
        return "F"
    parts = str(value).strip().split()
    if not parts:
        return "F"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def body(
    master: tk.Misc,
    text: str,
    *,
    size: int = 12,
    color: str = theme.INK,
    weight: str = "normal",
    family: str = theme.BODY_FONT,
    **kwargs: Any,
) -> ctk.CTkLabel:
    return ctk.CTkLabel(
        master,
        text=text,
        text_color=color,
        font=font(size, weight, family),
        anchor="w",
        justify="left",
        **kwargs,
    )


def muted(
    master: tk.Misc,
    text: str,
    *,
    size: int = 11,
    **kwargs: Any,
) -> ctk.CTkLabel:
    return body(master, text, size=size, color=theme.MUTED, **kwargs)


def label_caps(master: tk.Misc, text: str, *, color: str = theme.MUTED) -> ctk.CTkLabel:
    return ctk.CTkLabel(
        master,
        text=text.upper(),
        text_color=color,
        font=font(9, "bold"),
        anchor="w",
    )


class Card(ctk.CTkFrame):
    def __init__(self, master: tk.Misc, **kwargs: Any) -> None:
        kwargs.setdefault("fg_color", theme.CARD)
        kwargs.setdefault("corner_radius", 16)
        kwargs.setdefault("border_width", 1)
        kwargs.setdefault("border_color", theme.LINE)
        super().__init__(master, **kwargs)


class KpiCard(Card):
    def __init__(
        self,
        master: tk.Misc,
        label: str,
        value: str = "—",
        sub: str = "",
        *,
        accent: str = theme.ACCENT,
    ) -> None:
        super().__init__(master)
        self.grid_columnconfigure(0, weight=1)
        top = ctk.CTkFrame(self, fg_color="transparent")
        top.grid(row=0, column=0, sticky="ew", padx=18, pady=(16, 0))
        top.grid_columnconfigure(0, weight=1)
        label_caps(top, label).grid(row=0, column=0, sticky="w")
        self._dot = ctk.CTkFrame(
            top, width=7, height=7, corner_radius=4, fg_color=accent
        )
        self._dot.grid(row=0, column=1, sticky="e", padx=(8, 0))
        self._value = ctk.CTkLabel(
            self,
            text=value,
            text_color=theme.INK,
            font=display_font(27),
            anchor="w",
        )
        self._value.grid(row=1, column=0, sticky="w", padx=18, pady=(5, 0))
        self._sub = ctk.CTkLabel(
            self,
            text=sub,
            text_color=theme.MUTED,
            font=font(10),
            anchor="w",
        )
        self._sub.grid(row=2, column=0, sticky="w", padx=18, pady=(2, 16))

    def update_value(
        self, value: str, sub: str | None = None, *, color: str = theme.INK
    ) -> None:
        self._value.configure(text=value, text_color=color)
        if sub is not None:
            self._sub.configure(text=sub)

    def update_sub(self, text: str, *, color: str = theme.MUTED) -> None:
        self._sub.configure(text=text, text_color=color)


class Pill(tk.Label):
    def __init__(
        self,
        master: tk.Misc,
        text: str,
        *,
        tone: tuple[str, str] | None = None,
        background: str | None = None,
        foreground: str | None = None,
    ) -> None:
        bg, fg = tone or (background or theme.PAPER_DEEP, foreground or theme.INK_SOFT)
        super().__init__(
            master,
            text=str(text).replace("_", " ").title(),
            background=bg,
            foreground=fg,
            font=(theme.BODY_FONT, 8, "bold"),
            padx=8,
            pady=3,
            bd=0,
            highlightthickness=0,
        )

    def set(self, text: str, tone: tuple[str, str] | None = None) -> None:
        self.configure(text=str(text).replace("_", " ").title())
        if tone:
            self.configure(background=tone[0], foreground=tone[1])


class DataTable(ctk.CTkFrame):
    """A themed ttk table with selection and double-click callbacks."""

    def __init__(
        self,
        master: tk.Misc,
        columns: list[tuple[str, str, int, str]],
        *,
        on_select: Callable[[dict[str, str] | None], None] | None = None,
        on_double_click: Callable[[dict[str, str]], None] | None = None,
        empty_message: str = "Nothing here yet",
        height: int = 12,
    ) -> None:
        super().__init__(master, fg_color=theme.CARD, corner_radius=12)
        self._columns = columns
        self._keys = [column[0] for column in columns]
        self._on_select = on_select
        self._on_double_click = on_double_click
        self._empty_message = empty_message
        self._rows: list[dict[str, Any]] = []
        self._horizontal_scroll_visible = False

        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=1)

        keys = [column[0] for column in columns]
        self.tree = ttk.Treeview(
            self,
            columns=keys,
            show="headings",
            style="Forma.Treeview",
            selectmode="browse",
            height=height,
        )
        for key, heading, width, anchor in columns:
            self.tree.heading(key, text=heading, anchor=anchor)
            self.tree.column(
                key,
                width=width,
                minwidth=max(50, width // 2),
                anchor=anchor,
                stretch=(key == keys[0]),
            )
        self.tree.grid(row=0, column=0, sticky="nsew", padx=(6, 0), pady=6)

        scrollbar = ttk.Scrollbar(
            self,
            orient="vertical",
            command=self.tree.yview,
            style="Forma.Vertical.TScrollbar",
        )
        scrollbar.grid(row=0, column=1, sticky="ns", pady=6, padx=(0, 4))
        self._horizontal_scrollbar = ttk.Scrollbar(
            self,
            orient="horizontal",
            command=self.tree.xview,
            style="Forma.Horizontal.TScrollbar",
        )
        self._horizontal_scrollbar.grid(
            row=1, column=0, sticky="ew", padx=(6, 0), pady=(0, 4)
        )
        self._horizontal_scrollbar.grid_remove()
        self.tree.configure(
            yscrollcommand=scrollbar.set,
            xscrollcommand=self._horizontal_scrollbar.set,
        )
        self.tree.bind("<Configure>", self._sync_horizontal_scroll, add="+")

        self.tree.tag_configure("low", foreground=theme.AMBER)
        self.tree.tag_configure("out", foreground=theme.RED)
        self.tree.tag_configure("muted", foreground=theme.MUTED)
        self.tree.tag_configure("good", foreground=theme.GREEN)

        self.tree.bind("<<TreeviewSelect>>", self._selected)
        self.tree.bind("<Double-1>", self._double_clicked)

        self.empty_label = ctk.CTkLabel(
            self,
            text=empty_message,
            text_color=theme.MUTED,
            font=font(10),
        )
        self.empty_label.grid(row=0, column=0, sticky="nsew")
        self.empty_label.lift()

    def set_empty_message(self, text: str) -> None:
        self._empty_message = text
        if not self._rows:
            self.empty_label.configure(text=text)

    def set_rows(self, rows: Iterable[dict[str, Any]]) -> None:
        selected = self.selected_key()
        self._rows = list(rows)
        self.tree.delete(*self.tree.get_children())
        for row in self._rows:
            self.tree.insert(
                "",
                "end",
                iid=str(row["iid"]),
                values=row.get("values", []),
                tags=tuple(row.get("tags", ())),
            )
        if selected and self.tree.exists(selected):
            self.tree.selection_set(selected)
        self.empty_label.configure(
            text=self._empty_message if not self._rows else ""
        )
        if self._rows:
            self.empty_label.lower()
        else:
            self.empty_label.lift()

    def _sync_horizontal_scroll(self, _event: tk.Event | None = None) -> None:
        if not self.winfo_exists():
            return
        content_width = sum(
            int(self.tree.column(key, "width")) for key in self._keys
        )
        needs_scroll = content_width > self.tree.winfo_width() + 2
        if needs_scroll and not self._horizontal_scroll_visible:
            self._horizontal_scrollbar.grid()
            self._horizontal_scroll_visible = True
        elif not needs_scroll and self._horizontal_scroll_visible:
            self._horizontal_scrollbar.grid_remove()
            self._horizontal_scroll_visible = False

    def selected_key(self) -> str | None:
        selection = self.tree.selection()
        return str(selection[0]) if selection else None

    def selected(self) -> dict[str, str] | None:
        key = self.selected_key()
        if not key or not self.tree.exists(key):
            return None
        values = self.tree.item(key, "values")
        result = {"_iid": key}
        for (column_key, *_rest), value in zip(self._columns, values):
            result[column_key] = str(value)
        return result

    def clear_selection(self) -> None:
        self.tree.selection_remove(*self.tree.selection())

    def _selected(self, _event: tk.Event) -> None:
        if self._on_select:
            self._on_select(self.selected())

    def _double_clicked(self, _event: tk.Event) -> None:
        selected = self.selected()
        if selected and self._on_double_click:
            self._on_double_click(selected)


class EmptyState(ctk.CTkFrame):
    def __init__(self, master: tk.Misc, title: str, copy: str) -> None:
        super().__init__(master, fg_color="transparent")
        ctk.CTkLabel(
            self,
            text=title,
            text_color=theme.INK,
            font=display_font(19),
            anchor="w",
        ).pack(anchor="w")
        ctk.CTkLabel(
            self,
            text=copy,
            text_color=theme.MUTED,
            font=font(10),
            anchor="w",
            justify="left",
            wraplength=430,
        ).pack(anchor="w", pady=(4, 0))
