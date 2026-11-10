# Forma — Design System & Visual Specification

## 1. Aesthetic Direction: Editorial Monolith & Crafted Tactile
Forma blends the elegance of architectural monographs with the tactile warmth of handcrafted materials.

- **Primary Canvas**: Warm alabaster paper (`oklch(0.981 0.005 95)` / `#FAF8F4`).
- **Surface Elevation**: Pure porcelain white cards (`#FFFFFF`) with 1px hairline borders (`oklch(0.902 0.008 95)`).
- **Primary Ink**: Deep forest cypress (`oklch(0.315 0.034 175)` / `#20382F`) and charcoal slate (`oklch(0.235 0.013 250)`).
- **Warm Accents**: Sand dune (`oklch(0.929 0.024 84)`), terracotta bronze, and amber patina.

---

## 2. Typography Hierarchy

- **Display Serif**: `Instrument Serif`, `Iowan Old Style`, Georgia, serif
  - Purpose: High-impact editorial headings, product titles, emotional quotes.
  - Scale: `clamp(2.5rem, 6vw, 4.5rem)`, line-height `0.95`, tracking `-0.01em`.
- **Primary Sans**: `Inter`, system-ui, -apple-system, sans-serif
  - Purpose: Body copy, navigation links, pricing, button labels.
  - Scale: 11px (micro-caps) to 15px (body), line-height `1.5 - 1.6`.
- **Tabular Numerals**: For all currency amounts, order IDs, and stock counts (`tabular-nums font-mono` or `Inter font-feature-settings: 'tnum'`).

---

## 3. Platform-Specific Ergonomics

### A. Android App / Mobile
- **Bottom Navigation**: Fixed bar at bottom screen (`h-16`, backdrop blur, safe-area-inset-bottom).
- **Navigation Tabs**: Home (`/`), Shop (`/shop`), Cart with item counter badge (`/cart`), Orders (`/orders`), Profile (`/profile`).
- **Touch Targets**: All clickable chips and buttons >= 48px height.
- **Product Page**: Sticky bottom action drawer with price and full-width "Add to Bag" button.

### B. Responsive Website
- **Sticky Glass Header**: Clean brand wordmark, quick-links, dynamic cart indicator, search button.
- **Quick Search Palette**: Modal with live product filtering triggered by search icon or `Ctrl+K`.
- **Bento Grid**: Asymmetric product showcase with studio pick badges and discount calculations.

### C. Windows / Desktop Standalone App
- **Desktop Window Bar**: Window status, keyboard shortcut hints, breadcrumbs.
- **Density Toggles**: Switch between Editorial Grid (large photo cards) and Compact List (dense multi-column layout).
- **Keyboard Navigation**:
  - `Ctrl + K` or `/` -> Open instant product search
  - `G` then `S` -> Navigate to Shop
  - `G` then `C` -> Navigate to Cart
  - `Esc` -> Close modals / search / drawers

---

## 4. Forbidden Anti-Patterns
- ❌ No generic indigo/purple hero gradients.
- ❌ No unstyled browser inputs; all inputs must have custom focus rings and subtle borders.
- ❌ No low-contrast gray text (<4.5:1 ratio).
- ❌ No nested cards with triple borders.
- ❌ No jittery layout shift during image loading; all cards have predefined aspect ratios.
