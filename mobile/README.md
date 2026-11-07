# Forma — React Native / Android

The mobile companion to the Forma web storefront. It shares the same Convex deployment, catalog, orders, payments and role rules as the web app.

## Run it

```bash
cd mobile
bun install
bun start
```

Then press `a` (or scan the QR code with Expo Go on Android).

To compile and run the native Android app on a connected device or emulator (requires Android Studio / the Android SDK):

```bash
bun run android:native
```

## Build an APK / Play Store bundle

The app is Expo-managed (no checked-in `android/` folder), so EAS produces the native project in the cloud:

```bash
cd mobile
bunx eas-cli build -p android --profile preview   # APK
bunx eas-cli build -p android --profile production # AAB
```

Sign in to an Expo account when prompted. You can also run `bunx expo prebuild -p android` and build locally with Android Studio.

## Backend configuration

The shared Convex URL lives in `app.json` under `expo.extra.convexUrl`. Override it without editing tracked config by setting `EXPO_PUBLIC_CONVEX_URL` in the environment used to start Expo. Never put Convex admin keys or other secrets in the app — only the public deployment URL is safe on a device.

Sign-in uses the same Convex Auth deployment as the web app:

- **Guest** creates an anonymous session stored in Android SecureStore.
- **Email** sends a six-digit code through the same gateway as the web app.
- The **first account to claim admin** in Profile unlocks the admin dashboard. Admin checks run server-side too.

## What's included

- Home edit with featured products and categories
- Searchable, filterable shop and product detail pages
- Persisted bag with quantity controls and free-shipping progress
- Demo checkout with shipping address and test card (4242 4242 4242 4242)
- Order history, payment receipts, profile editing, guest/email auth
- Mobile admin: order status, cancellation/refund, payment refunds and stock adjustment

Full product creation/editing is still done in the web admin. Card payments are demo-only; no processor is connected.
