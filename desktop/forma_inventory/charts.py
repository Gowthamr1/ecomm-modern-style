from __future__ import annotations

import math
import tkinter as tk
from typing import Callable, Iterable

from . import theme
from .analytics import format_inr, format_inr_compact


class BaseChart(tk.Canvas):
    def __init__(
        self,
        master: tk.Misc,
        *,
        height: int = 220,
        background: str = theme.CARD,
        empty_message: str = "No data yet",
    ) -> None:
        super().__init__(
            master,
            height=height,
            background=background,
            highlightthickness=0,
            bd=0,
        )
        self._background = background
        self._empty_message = empty_message
        self._redraw_job: str | None = None
        self.bind("<Configure>", self._schedule_redraw)

    def _schedule_redraw(self, _event: tk.Event | None = None) -> None:
        if self._redraw_job is not None:
            self.after_cancel(self._redraw_job)
        self._redraw_job = self.after(40, self._redraw)

    def _redraw(self) -> None:
        self._redraw_job = None
        self.delete("all")
        width = max(1, self.winfo_width())
        height = max(1, self.winfo_height())
        if width < 40 or height < 40:
            return
        self.draw(width, height)

    def draw(self, width: int, height: int) -> None:  # pragma: no cover - UI hook
        raise NotImplementedError

    def empty(self, width: int, height: int, message: str | None = None) -> None:
        self.create_text(
            width / 2,
            height / 2,
            text=message or self._empty_message,
            fill=theme.MUTED,
            font=(theme.BODY_FONT, 10),
        )


class LineChart(BaseChart):
    def __init__(
        self,
        master: tk.Misc,
        *,
        height: int = 230,
        color: str = theme.ACCENT,
        fill: str = theme.ACCENT_SOFT,
        value_formatter: Callable[[float], str] = format_inr,
        axis_formatter: Callable[[float], str] = format_inr_compact,
        empty_message: str = "No revenue in this period",
    ) -> None:
        super().__init__(master, height=height, empty_message=empty_message)
        self._points: list[tuple[str, float, str]] = []
        self._color = color
        self._fill = fill
        self._value_formatter = value_formatter
        self._axis_formatter = axis_formatter
        self._point_positions: list[tuple[float, float, int]] = []

    def set_points(
        self,
        points: Iterable[tuple[str, float, str]],
    ) -> None:
        self._points = list(points)
        self._schedule_redraw()

    def draw(self, width: int, height: int) -> None:
        self._point_positions = []
        if not self._points:
            self.empty(width, height)
            return
        values = [float(point[1]) for point in self._points]
        if max(values, default=0) <= 0:
            self.empty(width, height)
            return

        left, right, top, bottom = 58, 16, 18, 32
        plot_w = max(1, width - left - right)
        plot_h = max(1, height - top - bottom)
        maximum = _nice_max(max(values))
        ticks = 4

        for index in range(ticks + 1):
            value = maximum * index / ticks
            y = top + plot_h - (value / maximum) * plot_h
            self.create_line(
                left,
                y,
                width - right,
                y,
                fill=theme.LINE_SOFT,
                dash=(2, 4),
            )
            self.create_text(
                left - 8,
                y,
                text=self._axis_formatter(value),
                anchor="e",
                fill=theme.MUTED,
                font=(theme.BODY_FONT, 8),
            )

        count = len(values)
        def x_at(index: int) -> float:
            if count == 1:
                return left + plot_w / 2
            return left + (index / (count - 1)) * plot_w

        coords: list[float] = []
        for index, value in enumerate(values):
            x = x_at(index)
            y = top + plot_h - (value / maximum) * plot_h
            coords.extend([x, y])
            self._point_positions.append((x, y, index))

        if len(coords) >= 4:
            area = [left, top + plot_h, *coords, x_at(count - 1), top + plot_h]
            self.create_polygon(area, fill=self._fill, outline="", smooth=True)
            self.create_line(
                *coords,
                fill=self._color,
                width=2,
                smooth=count > 3,
                splinesteps=24,
            )

        if count <= 60:
            for x, y, _index in self._point_positions:
                self.create_oval(
                    x - 2.5,
                    y - 2.5,
                    x + 2.5,
                    y + 2.5,
                    fill=self._color,
                    outline=theme.CARD,
                    width=1,
                )

        label_every = max(1, math.ceil(count / 7))
        for index, (_label, _value, long_label) in enumerate(self._points):
            if index % label_every != 0 and index != count - 1:
                continue
            self.create_text(
                x_at(index),
                height - bottom + 15,
                text=_short_label(long_label),
                fill=theme.MUTED,
                font=(theme.BODY_FONT, 8),
            )

        self.bind("<Motion>", self._on_motion)
        self.bind("<Leave>", lambda _event: self.delete("tooltip"))

    def _on_motion(self, event: tk.Event) -> None:
        self.delete("tooltip")
        if not self._point_positions:
            return
        nearest = min(
            self._point_positions, key=lambda point: abs(point[0] - event.x)
        )
        if abs(nearest[0] - event.x) > 26:
            return
        _x, y, index = nearest
        label, value, long_label = self._points[index]
        text = f"{long_label}\n{self._value_formatter(value)}"
        self._tooltip(nearest[0], y, text)

    def _tooltip(self, x: float, y: float, text: str) -> None:
        width = self.winfo_width()
        padding = 8
        item = self.create_text(
            0,
            0,
            text=text,
            anchor="nw",
            fill=theme.PAPER,
            font=(theme.BODY_FONT, 9),
            tags="tooltip",
        )
        bbox = self.bbox(item)
        if bbox is None:
            return
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        box_x = min(max(8, x - text_w / 2 - padding), width - text_w - padding * 2 - 8)
        box_y = max(4, y - text_h - 26)
        self.create_rectangle(
            box_x,
            box_y,
            box_x + text_w + padding * 2,
            box_y + text_h + padding * 1.6,
            fill=theme.PINE,
            outline="",
            tags="tooltip",
        )
        self.coords(item, box_x + padding, box_y + padding * 0.8)
        self.tag_raise(item)


class BarChart(BaseChart):
    def __init__(
        self,
        master: tk.Misc,
        *,
        height: int = 230,
        horizontal: bool = True,
        value_formatter: Callable[[float], str] = format_inr,
        empty_message: str = "Nothing to compare yet",
    ) -> None:
        super().__init__(master, height=height, empty_message=empty_message)
        self._items: list[tuple[str, float]] = []
        self._horizontal = horizontal
        self._value_formatter = value_formatter

    def set_items(self, items: Iterable[tuple[str, float]]) -> None:
        self._items = [(str(label), float(value)) for label, value in items]
        self._schedule_redraw()

    def draw(self, width: int, height: int) -> None:
        items = [item for item in self._items if item[1] > 0][:7]
        if not items:
            self.empty(width, height)
            return
        maximum = max(value for _label, value in items)
        if self._horizontal:
            self._draw_horizontal(items, width, height, maximum)
        else:
            self._draw_vertical(items, width, height, maximum)

    def _draw_horizontal(
        self,
        items: list[tuple[str, float]],
        width: int,
        height: int,
        maximum: float,
    ) -> None:
        left = 142
        right = 78
        top = 8
        row_height = min(34, max(24, (height - top - 6) / len(items)))
        bar_width = max(20, width - left - right)
        for index, (label, value) in enumerate(items):
            y = top + index * row_height + row_height / 2
            length = (value / maximum) * bar_width
            self.create_text(
                left - 10,
                y,
                text=theme.truncate(label, 22),
                anchor="e",
                fill=theme.INK_SOFT,
                font=(theme.BODY_FONT, 9),
            )
            self.create_rectangle(
                left,
                y - 7,
                left + bar_width,
                y + 7,
                fill=theme.LINE_SOFT,
                outline="",
            )
            self.create_rectangle(
                left,
                y - 7,
                left + max(3, length),
                y + 7,
                fill=theme.CHART_COLORS[index % len(theme.CHART_COLORS)],
                outline="",
            )
            self.create_text(
                left + bar_width + 8,
                y,
                text=self._value_formatter(value),
                anchor="w",
                fill=theme.INK_SOFT,
                font=(theme.BODY_FONT, 9, "bold"),
            )

    def _draw_vertical(
        self,
        items: list[tuple[str, float]],
        width: int,
        height: int,
        maximum: float,
    ) -> None:
        left, right, top, bottom = 44, 12, 14, 34
        plot_w = width - left - right
        plot_h = height - top - bottom
        gap = 12
        bar_w = max(6, (plot_w - gap * (len(items) + 1)) / len(items))
        for index, (label, value) in enumerate(items):
            x = left + gap + index * (bar_w + gap)
            bar_h = (value / maximum) * plot_h
            self.create_rectangle(
                x,
                top + plot_h - bar_h,
                x + bar_w,
                top + plot_h,
                fill=theme.CHART_COLORS[index % len(theme.CHART_COLORS)],
                outline="",
            )
            self.create_text(
                x + bar_w / 2,
                height - bottom + 17,
                text=label,
                fill=theme.MUTED,
                font=(theme.BODY_FONT, 8),
            )


class DonutChart(BaseChart):
    def __init__(
        self,
        master: tk.Misc,
        *,
        height: int = 230,
        empty_message: str = "No category sales yet",
        center_label: str = "Revenue",
    ) -> None:
        super().__init__(master, height=height, empty_message=empty_message)
        self._items: list[tuple[str, float]] = []
        self._center_label = center_label

    def set_items(self, items: Iterable[tuple[str, float]]) -> None:
        grouped: list[tuple[str, float]] = []
        for label, value in items:
            if value > 0:
                grouped.append((str(label), float(value)))
        grouped.sort(key=lambda item: item[1], reverse=True)
        if len(grouped) > 5:
            other = sum(value for _label, value in grouped[5:])
            grouped = grouped[:5] + [("Other", other)]
        self._items = grouped
        self._schedule_redraw()

    def draw(self, width: int, height: int) -> None:
        if not self._items:
            self.empty(width, height)
            return
        total = sum(value for _label, value in self._items)
        if total <= 0:
            self.empty(width, height)
            return

        size = min(height - 30, max(120, width * 0.42))
        left = 18
        top = (height - size) / 2
        start = 90.0
        for index, (_label, value) in enumerate(self._items):
            extent = -(value / total) * 359.9
            self.create_arc(
                left,
                top,
                left + size,
                top + size,
                start=start,
                extent=extent,
                fill=theme.CHART_COLORS[index % len(theme.CHART_COLORS)],
                outline=theme.CARD,
                width=3,
                style=tk.PIESLICE,
            )
            start += extent
        hole = size * 0.58
        offset = (size - hole) / 2
        self.create_oval(
            left + offset,
            top + offset,
            left + offset + hole,
            top + offset + hole,
            fill=theme.CARD,
            outline="",
        )
        self.create_text(
            left + size / 2,
            top + size / 2 - 8,
            text=format_inr_compact(total),
            fill=theme.INK,
            font=(theme.DISPLAY_FONT, 16),
        )
        self.create_text(
            left + size / 2,
            top + size / 2 + 13,
            text=self._center_label,
            fill=theme.MUTED,
            font=(theme.BODY_FONT, 8),
        )

        legend_x = left + size + 20
        legend_y = max(14, (height - len(self._items) * 28) / 2)
        available = max(90, width - legend_x - 8)
        for index, (label, value) in enumerate(self._items):
            y = legend_y + index * 28
            self.create_oval(
                legend_x,
                y + 4,
                legend_x + 8,
                y + 12,
                fill=theme.CHART_COLORS[index % len(theme.CHART_COLORS)],
                outline="",
            )
            self.create_text(
                legend_x + 15,
                y + 2,
                text=theme.truncate(label, max(10, int(available / 6.2))),
                anchor="nw",
                fill=theme.INK_SOFT,
                font=(theme.BODY_FONT, 9),
            )
            self.create_text(
                legend_x + 15,
                y + 14,
                text=f"{format_inr_compact(value)} · {value / total * 100:.0f}%",
                anchor="nw",
                fill=theme.MUTED,
                font=(theme.BODY_FONT, 8),
            )


def _nice_max(value: float) -> float:
    if value <= 0:
        return 1
    magnitude = 10 ** math.floor(math.log10(value))
    for step in (1, 2, 2.5, 5, 10):
        candidate = step * magnitude
        if value <= candidate:
            return candidate
    return value


def _short_label(label: str) -> str:
    parts = str(label).split()
    if len(parts) >= 2:
        return f"{parts[0]} {parts[1][:3]}"
    return str(label)[:6]
