from __future__ import annotations

import logging
import sys
import traceback
from pathlib import Path
from tkinter import messagebox

import customtkinter as ctk

from forma_inventory import config
from forma_inventory.app import FormaApp, enable_windows_dpi


def _log_path() -> Path:
    directory = config.app_data_dir()
    directory.mkdir(parents=True, exist_ok=True)
    return directory / "forma-inventory.log"


def main() -> None:
    enable_windows_dpi()
    ctk.set_appearance_mode("light")
    ctk.set_default_color_theme("blue")
    logging.basicConfig(
        filename=_log_path(),
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )
    try:
        app = FormaApp()

        def report_callback_exception(exc_type, exc_value, exc_tb):  # type: ignore[no-untyped-def]
            text = "".join(traceback.format_exception(exc_type, exc_value, exc_tb))
            logging.error("Unhandled UI exception:\n%s", text)
            messagebox.showerror(
                "Forma Inventory",
                "Something went wrong. The details were written to:\n\n"
                f"{_log_path()}",
                parent=app,
            )

        app.report_callback_exception = report_callback_exception  # type: ignore[method-assign]
        app.mainloop()
    except Exception:  # noqa: BLE001 - last-chance startup guard
        text = traceback.format_exc()
        logging.error("Startup failed:\n%s", text)
        try:
            messagebox.showerror(
                "Forma Inventory could not start",
                "The app hit an unexpected error on startup.\n\n"
                f"{text[-1200:]}",
            )
        except Exception:  # noqa: BLE001
            print(text, file=sys.stderr)
        raise


if __name__ == "__main__":
    main()
