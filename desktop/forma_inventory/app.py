from __future__ import annotations

import ctypes
import queue
import sys
import threading
import traceback
from typing import Any, Callable

import customtkinter as ctk

from . import config, theme
from .api import AdminSession, ConvexClient
from .ui.login import LoginView
from .ui.shell import ShellView

APP_TITLE = "Forma Inventory"


class FormaApp(ctk.CTk):
    def __init__(self) -> None:
        super().__init__(fg_color=theme.PAPER)
        self.title(APP_TITLE)
        self.geometry("1240x780")
        self.minsize(1040, 660)
        self.configure(fg_color=theme.PAPER)
        self.protocol("WM_DELETE_WINDOW", self._on_close)
        self._jobs: queue.Queue[Callable[[], None]] = queue.Queue()
        self._closed = False
        theme.configure_ttk(self)
        self._set_icon()
        self.client = ConvexClient()
        self.login_view: LoginView | None = None
        self.shell: ShellView | None = None
        self.after(40, self._drain_jobs)
        self.show_login()
        self._center()

    # ------------------------------------------------------------------ screens
    def show_login(self) -> None:
        if self.shell is not None:
            self.shell.destroy()
            self.shell = None
        if self.login_view is not None:
            self.login_view.destroy()
        self.login_view = LoginView(self, app=self, on_success=self.show_shell)
        self.login_view.pack(fill="both", expand=True)
        self.title(APP_TITLE)

    def show_shell(self, session: AdminSession) -> None:
        if self.login_view is not None:
            self.login_view.destroy()
            self.login_view = None
        if self.shell is not None:
            self.shell.destroy()
        self.shell = ShellView(self, app=self, session=session)
        self.shell.pack(fill="both", expand=True)
        self.title(f"{APP_TITLE} — {session.display_name}")

    # ------------------------------------------------------------------ workers
    def run_async(
        self,
        fn: Callable[[], Any],
        *,
        on_success: Callable[[Any], None],
        on_error: Callable[[Exception], None],
    ) -> None:
        def worker() -> None:
            try:
                value = fn()
            except Exception as error:  # noqa: BLE001 - delivered to the UI
                self._jobs.put(lambda: on_error(error))
            else:
                self._jobs.put(lambda: on_success(value))

        threading.Thread(target=worker, daemon=True).start()

    def _drain_jobs(self) -> None:
        if self._closed:
            return
        try:
            while True:
                callback = self._jobs.get_nowait()
                try:
                    callback()
                except Exception:  # noqa: BLE001 - never kill the Tk loop
                    traceback.print_exc()
        except queue.Empty:
            pass
        self.after(40, self._drain_jobs)

    # ------------------------------------------------------------------ chrome
    def _set_icon(self) -> None:
        if sys.platform != "win32":
            return
        icon = config.resource_path("assets/forma.ico")
        try:
            if icon.exists():
                self.iconbitmap(str(icon))
        except Exception:  # noqa: BLE001 - icon is cosmetic
            pass

    def _center(self) -> None:
        self.update_idletasks()
        width = min(1240, max(1040, self.winfo_screenwidth() - 100))
        height = min(780, max(660, self.winfo_screenheight() - 110))
        x = max(0, (self.winfo_screenwidth() - width) // 2)
        y = max(0, (self.winfo_screenheight() - height) // 2)
        self.geometry(f"{width}x{height}+{x}+{y}")

    def _on_close(self) -> None:
        self._closed = True
        if self.shell is not None:
            try:
                threading.Thread(target=self.shell.session.sign_out, daemon=True).start()
            except Exception:  # noqa: BLE001
                pass
        self.destroy()


def enable_windows_dpi() -> None:
    if sys.platform != "win32":
        return
    try:
        ctypes.windll.shcore.SetProcessDpiAwareness(1)
    except Exception:  # noqa: BLE001
        try:
            ctypes.windll.user32.SetProcessDPIAware()
        except Exception:  # noqa: BLE001
            pass
