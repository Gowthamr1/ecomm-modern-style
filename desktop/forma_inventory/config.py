from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

APP_NAME = "FormaInventory"
DEFAULT_CONVEX_URL = "https://secret-capybara-607.convex.cloud"


def app_data_dir() -> Path:
    base = os.environ.get("APPDATA")
    if base:
        root = Path(base)
    else:
        root = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config"))
    return root / APP_NAME


def resource_path(relative: str) -> Path:
    """Resolve bundled assets both in development and inside PyInstaller."""
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parents[1]))
    return base / relative


def load_config() -> dict[str, Any]:
    path = app_data_dir() / "config.json"
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def save_config(config: dict[str, Any]) -> None:
    try:
        directory = app_data_dir()
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "config.json").write_text(
            json.dumps(config, indent=2), encoding="utf-8"
        )
    except OSError:
        # Preferences are a convenience; never block sign-in over them.
        pass


def convex_url() -> str:
    configured = os.environ.get("FORMA_CONVEX_URL") or load_config().get("convex_url")
    return str(configured or DEFAULT_CONVEX_URL).rstrip("/")


def last_email() -> str:
    return str(load_config().get("last_email") or "")


def remember_email(email: str) -> None:
    config = load_config()
    config["last_email"] = email.strip()
    save_config(config)
