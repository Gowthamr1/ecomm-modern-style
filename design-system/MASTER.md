# Forma Design System — Master Tokens

This file acts as the single source of truth for the Forma design system across Web, Android, and Windows.

## 1. Color Palette Tokens

```css
/* Color Tokens in OKLCH */
--canvas: oklch(0.981 0.005 95);      /* Warm Paper #FAF8F4 */
--surface: oklch(1 0 0);              /* Porcelain #FFFFFF */
--surface-elevated: oklch(0.96 0.006 95);
--border-hairline: oklch(0.902 0.008 95);
--ink-primary: oklch(0.235 0.013 250); /* Charcoal #18181B */
--ink-muted: oklch(0.515 0.013 250);   /* Warm Slate #71717A */
--brand-cypress: oklch(0.315 0.034 175); /* Forest Green #20382F */
--brand-sand: oklch(0.929 0.024 84);    /* Dune Sand */
--brand-sand-deep: oklch(0.815 0.042 80);
--feedback-emerald: oklch(0.65 0.18 150);
--feedback-crimson: oklch(0.552 0.19 27);
```

## 2. Spacing & Radius Rhythms

- **Base Rhythm**: 4px micro, 8px standard, 16px container padding, 24px card gap, 48px section gap, 96px hero padding.
- **Corner Radii**:
  - `sm`: 6px (Badges, tags)
  - `md`: 10px (Inputs, buttons)
  - `lg`: 16px (Product cards, drawers)
  - `xl`: 24px (Bento hero cards, modals)
  - `full`: 9999px (Pill buttons, floating navigation)

## 3. Motion & Animation Curves

- **Ease Out Tactile**: `cubic-bezier(0.22, 1, 0.36, 1)` (Duration: 250ms - 400ms)
- **Spring Feedback**: `type: "spring", stiffness: 350, damping: 28`
- **Fade Up**: `opacity: 0, y: 16` -> `opacity: 1, y: 0`

## 4. Breakpoint Grid Matrix

- **Mobile (Android / iOS)**: `< 768px` -> Single column / 2-column compact grid, bottom navigation bar active.
- **Tablet**: `768px - 1024px` -> 2-3 column grid, top navigation active.
- **Desktop (Web / Windows)**: `1024px - 1440px` -> 3-4 column grid, top navigation, sidebar filter option.
- **Ultra-Wide (Windows Desktop App)**: `> 1440px` -> Max container 1280px or fluid expansive layout with desktop utility tray.
