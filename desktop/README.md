# Forma Inventory — Windows desktop console

A private Python desktop app for running the Forma store. The storefront website and Android app are customer-facing; **this console is the only admin surface**.

It connects to the same Convex deployment as the web and mobile apps, so product, stock, order and payment changes go live immediately.

## What it does

- **Admin sign-in** with the same email OTP used by the storefront. Only an account with the `admin` role can enter.
- **Dashboard** with revenue, orders, average order value, gross margin, a revenue trend, category mix, top sellers, low-stock alerts and recent orders.
- **Products** — add, edit, delete, change prices, costs, categories, imagery, descriptions, stock and featured placement.
- **Inventory** — reorder levels, stock value at retail and cost, low/out-of-stock filters, quick `+5`/`+10` restocks and an exact stock editor.
- **Orders** — filter by status, inspect line items and delivery address, mark shipped/delivered, cancel and refund (items return to stock automatically).
- **Analytics** — 30/90/365-day revenue, category and weekday breakdowns, top-product revenue, stock value by category, gross profit, sell-through and a per-product recommendation (`Star`, `Restock`, `Slow mover`, `Thin margin`, `Clear stock`).
- **INR pricing** throughout: prices and costs are entered in rupees, stored server-side as paise. Checkout uses ₹6,250 free-shipping threshold, ₹199 flat shipping and 18% GST.

No tokens are written to disk. The session lives in memory and ends when the app closes.

## Run from source

Requirements: Windows 10/11, Python 3.10+ (with the standard Tcl/Tk component), and internet access.

```bat
cd desktop
py -3 -m venv .venv
call .venv\Scripts\activate
python -m pip install -r requirements.txt
python main.py
```

Sign in with the email address that owns the store's admin role. A six-digit code is emailed; there is no password.

The Convex deployment URL defaults to the project's development deployment. Override it without editing code:

```bat
set FORMA_CONVEX_URL=https://your-deployment.convex.cloud
python main.py
```

## Build an EXE with PyInstaller

The quickest route:

```bat
cd desktop
build_windows.bat
```

The script creates `.venv`, installs `customtkinter` and PyInstaller, then runs `FormaInventory.spec`.

Output:

```text
dist\Forma Inventory\Forma Inventory.exe
```

Share the whole `dist\Forma Inventory` folder, not just the `.exe` — PyInstaller's one-folder build needs the bundled runtime next to the executable. The app is unsigned, so Windows SmartScreen may ask you to confirm the first launch.

Manual equivalent:

```bat
pyinstaller --noconfirm --clean FormaInventory.spec
```

## Admin provisioning

Only users whose `role` is `"admin"` can use this console, and the role is enforced by every Convex admin function.

To grant the role to another account, open the deployment in the Convex dashboard, find the user in `users`, and set `role` to `admin`. There is deliberately no self-service admin claim in the storefront or mobile app.

## Tests

The analytics and money helpers are pure Python and run without a display or network:

```bat
cd desktop
python -m unittest discover -s tests -t .
```

## Project layout

```text
desktop/
  main.py                       entry point
  forma_inventory/
    api.py                      Convex HTTP client, email OTP, admin session
    analytics.py                INR helpers, revenue/margin/stock analysis
    charts.py                   dependency-free canvas charts
    config.py                   Convex URL + local preferences
    theme.py                    Forma palette and ttk table styling
    ui/
      login.py                  two-step email-code sign-in
      shell.py                  navigation, refresh, mutations
      dashboard.py              overview
      products.py               catalog table + CRUD triggers
      product_dialog.py         add/edit product modal
      inventory.py              stock control + stock dialog
      orders.py                 fulfilment and refunds
      analytics_view.py         deep analytics + recommendations
  FormaInventory.spec           PyInstaller configuration
  build_windows.bat             Windows build script
```

## Notes and troubleshooting

- **“This account is not an administrator”** — sign in with the email that owns the admin role, or grant the role in the Convex dashboard.
- **“Cannot reach the store server”** — check the internet connection, proxy/VPN and `FORMA_CONVEX_URL`.
- **Sign-in email doesn’t arrive** — check spam; codes expire after 15 minutes. The code is sent by the same Convex Auth gateway used by the web store.
- **Charts look empty** — the selected period may have no orders. The catalog and stock screens still work.
- **Build fails on `tkinter`** — reinstall Python from python.org and enable the optional Tcl/Tk feature.
- Logs are written to `%APPDATA%\FormaInventory\forma-inventory.log`. Non-sensitive preferences (Convex URL and last email) live in `%APPDATA%\FormaInventory\config.json`.
