from __future__ import annotations

import base64
import binascii
import json
import threading
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Any

from . import config


class ConvexError(RuntimeError):
    """A server, network or validation error returned by Convex."""

    def __init__(self, message: str, status: int | None = None) -> None:
        super().__init__(message)
        self.status = status


class AdminRequired(ConvexError):
    """The signed-in account exists but does not hold the admin role."""


def clean_error(message: str) -> str:
    """Turn Convex's diagnostic blob into one readable sentence."""
    text = message.strip()
    if "Server Error" in text:
        text = text.split("Server Error", 1)[1]
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("[Request ID:"):
            continue
        if line.startswith("at ") or line.startswith("at async "):
            continue
        if line.startswith("Path:") or line.startswith("Value:") or line.startswith(
            "Validator:"
        ):
            continue
        return line
    return text or "The store server returned an error."


def _jwt_expiry(token: str) -> float | None:
    try:
        payload = token.split(".")[1]
        payload += "=" * (-len(payload) % 4)
        data = json.loads(base64.urlsafe_b64decode(payload.encode("ascii")))
        exp = data.get("exp")
        return float(exp) if exp is not None else None
    except (IndexError, ValueError, TypeError, binascii.Error):
        return None


@dataclass
class SessionTokens:
    token: str
    refresh_token: str


@dataclass
class AdminSession:
    client: "ConvexClient"
    email: str
    tokens: SessionTokens
    user: dict[str, Any]
    _refresh_lock: threading.Lock = field(
        default_factory=threading.Lock, repr=False, compare=False
    )
    last_user: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def login(cls, client: "ConvexClient", email: str, code: str) -> "AdminSession":
        result = client.verify_code(email, code)
        tokens = result.get("tokens") if isinstance(result, dict) else None
        if not tokens or not tokens.get("token") or not tokens.get("refreshToken"):
            raise ConvexError("That code did not sign you in. Request a new code and try again.")
        session = cls(
            client=client,
            email=email.strip(),
            tokens=SessionTokens(tokens["token"], tokens["refreshToken"]),
            user={},
        )
        session.user = session.call("query", "users:currentUser", {}) or {}
        if session.user.get("role") != "admin":
            try:
                session.logout()
            finally:
                raise AdminRequired(
                    "This account is not an administrator. Sign in with the email that owns the store admin role."
                )
        return session

    @property
    def display_name(self) -> str:
        return (
            self.user.get("name")
            or self.user.get("email")
            or self.email
            or "Administrator"
        )

    def still_fresh(self) -> bool:
        exp = _jwt_expiry(self.tokens.token)
        return exp is None or exp > time.time() + 90

    def refresh(self) -> None:
        # Auto-refresh and a user action can both hit an expired token at the
        # same time. Serialize the refresh so a rotated refresh token is never
        # consumed twice.
        with self._refresh_lock:
            result = self.client.refresh(self.tokens.refresh_token)
            tokens = result.get("tokens") if isinstance(result, dict) else None
            if not tokens or not tokens.get("token") or not tokens.get("refreshToken"):
                raise ConvexError("Your admin session expired. Please sign in again.")
            self.tokens = SessionTokens(tokens["token"], tokens["refreshToken"])

    def call(
        self,
        kind: str,
        path: str,
        args: dict[str, Any] | None = None,
        retry: bool = True,
    ) -> Any:
        if not self.still_fresh():
            self.refresh()
        try:
            return self.client.call(kind, path, args or {}, self.tokens.token)
        except ConvexError as error:
            message = str(error).lower()
            auth_failure = error.status == 401 or (
                "token" in message
                and (
                    "expired" in message
                    or "verify" in message
                    or "invalid" in message
                )
            )
            if retry and auth_failure:
                self.refresh()
                return self.call(kind, path, args, retry=False)
            raise

    def snapshot(self) -> dict[str, Any]:
        return self.call("query", "admin:snapshot", {})

    def sign_out(self) -> None:
        try:
            self.client.sign_out(self.tokens.token)
        except ConvexError:
            pass

    # Backwards-friendly alias used by the UI.
    logout = sign_out


class ConvexClient:
    def __init__(self, url: str | None = None, timeout: float = 25.0) -> None:
        self.url = (url or config.convex_url()).rstrip("/")
        self.timeout = timeout

    def _post(
        self,
        kind: str,
        path: str,
        args: dict[str, Any],
        token: str | None = None,
    ) -> Any:
        body = json.dumps(
            {"path": path, "args": args, "format": "json", "version": 1}
        ).encode("utf-8")
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        request = urllib.request.Request(
            f"{self.url}/api/{kind}",
            data=body,
            headers=headers,
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                raw = response.read().decode("utf-8")
        except urllib.error.HTTPError as error:
            status = error.code
            raw = error.read().decode("utf-8", errors="replace")
            try:
                payload = json.loads(raw)
                message = payload.get("errorMessage") or payload.get("error") or raw
            except ValueError:
                message = raw or error.reason
            raise ConvexError(clean_error(str(message)), status) from error
        except urllib.error.URLError as error:
            raise ConvexError(
                "Cannot reach the store server. Check your internet connection and try again."
            ) from error
        except TimeoutError as error:
            raise ConvexError("The store server took too long to respond.") from error

        try:
            payload = json.loads(raw)
        except ValueError as error:
            raise ConvexError("The store server returned an unreadable response.") from error
        if payload.get("status") != "success":
            raise ConvexError(clean_error(str(payload.get("errorMessage") or payload)))
        return payload.get("value")

    def call(
        self,
        kind: str,
        path: str,
        args: dict[str, Any] | None = None,
        token: str | None = None,
    ) -> Any:
        if kind not in {"query", "mutation", "action"}:
            raise ValueError(f"Unsupported Convex call type: {kind}")
        return self._post(kind, path, args or {}, token)

    def request_code(self, email: str) -> None:
        self.call(
            "action",
            "auth:signIn",
            {"provider": "email-otp", "params": {"email": email.strip()}},
        )

    def verify_code(self, email: str, code: str) -> dict[str, Any]:
        return self.call(
            "action",
            "auth:signIn",
            {
                "provider": "email-otp",
                "params": {"email": email.strip(), "code": code.strip()},
            },
        )

    def refresh(self, refresh_token: str) -> dict[str, Any]:
        return self.call("action", "auth:signIn", {"refreshToken": refresh_token})

    def sign_out(self, token: str) -> None:
        self.call("action", "auth:signOut", {}, token)
