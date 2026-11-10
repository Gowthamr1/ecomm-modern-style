---
name: ui-ux-pro-max
description: UI/UX design intelligence for web, mobile, SaaS, and e-commerce applications. Use this skill when designing, building, reviewing, or refactoring user interfaces, component systems, page layouts, design systems, typography scales, color palettes, and interactive elements.
---

# UI/UX Pro Max Design Intelligence

This skill provides an authoritative, production-grade design intelligence database and methodology. It ensures all interfaces built or modified adhere to cohesive design systems, modern aesthetic standards, strict accessibility rules, and delightful usability.

## Core Directives

1. **Design System First**: Never improvise random colors, arbitrary fonts, or disconnected spacings. Always establish or reference the project's design system tokens before writing UI code.
2. **Persistence & Hierarchy**:
   - Check if `design-system/<project>/MASTER.md` or `design-system/MASTER.md` exists.
   - Check if page-specific rules exist under `design-system/<project>/pages/<page>.md`.
   - Page-specific rules override global master rules for that scope.
   - If no design system exists, create one or establish explicit tokens at the root of the project.
3. **Execution Rigor**:
   - Apply the 60-30-10 color distribution rule (60% background/neutral, 30% structural/card/secondary, 10% intentional accent).
   - Maintain typographic hierarchy with modular scale ratios (1.200 to 1.333).
   - Use an 8px base spacing grid (with 4px for micro-adjustments).
   - Ensure WCAG AA compliance (minimum 4.5:1 text contrast, 3:1 for large text and UI controls).

---

## Design Styles Catalog

Consult [`references/styles.md`](./references/styles.md) for full style definitions, code tokens, and best practices.

### 1. Modern Minimalist (Clean Tech & SaaS)
- **Palette**: Deep slate/charcoal (#0F172A), crisp neutral surface (#FFFFFF / #F8FAFC), subtle borders (#E2E8F0), single vibrant accent (#2563EB or #4F46E5).
- **Typography**: Inter, Geist Sans, Plus Jakarta Sans, or SF Pro. High contrast headings, clean body copy.
- **Characteristics**: Generous whitespace, subtle hairline borders (`border border-slate-200/80`), gentle soft shadows (`shadow-sm`), rounded-lg (8px-12px) corners.

### 2. Dark Mode Luxury / Developer Elegance
- **Palette**: Deep void/zinc background (#09090B or #0D1117), elevated card surfaces (#18181B or #161B22), hairline borders (#27272A or #30363D), crisp high-contrast text (#F4F4F5), radiant focal accent (e.g. emerald #10B981, violet #8B5CF6, cyan #06B6D4).
- **Characteristics**: Subtle radial background gradients, low-opacity glow highlights, precise border contrast, monospaced metadata badges.

### 3. Bento Grid (Modular Modern)
- **Characteristics**: Asymmetric card layouts grouping related features into cohesive visual compartments. Varying card spans (`col-span-1`, `col-span-2`, `row-span-2`).
- **Details**: Rounded-2xl (16px-20px), subtle backdrop-blur or layered card elevation, dedicated visual anchor card with high density or interactive preview.

### 4. High-End E-Commerce & Retail
- **Palette**: Warm alabaster/neutral white (#FAFAFA, #FFFFFF), warm slate body (#1E293B), gold/terracotta/rich-navy accents.
- **Characteristics**: High-fidelity product card typography, elegant image aspect ratios (3:4 or 1:1), sticky filtering, seamless add-to-bag micro-interactions, clear price hierarchy with discount badges.

---

## Color Systems & Tokens

Consult [`references/colors.md`](./references/colors.md) for full palette profiles.

- **Primary**: Brand identity, primary CTA, active navigation indicators.
- **Secondary / Surface**: Card backgrounds, table rows, input fields, pill tags.
- **Muted / Neutral**: Borders, subtle dividers, secondary metadata, placeholders.
- **Feedback**:
  - Success: `#10B981` (Emerald / Mint)
  - Warning: `#F59E0B` (Amber)
  - Destructive / Error: `#EF4444` (Ruby / Crimson)
  - Info: `#3B82F6` (Sky Blue)

---

## Typography & Hierarchy

Consult [`references/typography.md`](./references/typography.md) for pairings and line-height formulas.

| Role | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Hero / Display** | 40px – 56px | 700 / 800 | 1.1 – 1.15 | -0.02em |
| **H1 Heading** | 30px – 36px | 700 | 1.2 – 1.25 | -0.015em |
| **H2 Heading** | 24px – 28px | 600 | 1.3 | -0.01em |
| **H3 Heading** | 18px – 20px | 600 | 1.4 | 0 |
| **Body Large** | 16px – 18px | 400 / 500 | 1.5 – 1.6 | 0 |
| **Body Regular** | 14px – 15px | 400 | 1.5 | 0 |
| **Caption / Metadata** | 12px – 13px | 500 | 1.4 | +0.01em |

---

## Anti-Patterns Checklist

Consult [`references/anti-patterns.md`](./references/anti-patterns.md) before finalizing code:
- ❌ **No low-contrast text**: Never use `#94A3B8` on `#FFFFFF` for readable content.
- ❌ **No unstyled form elements**: Inputs must have visible focus rings (`ring-2 ring-primary/20 border-primary`), hover states, error states, and clear placeholder contrast.
- ❌ **No nested card soup**: Avoid cards nested 3 levels deep with identical borders and shadows.
- ❌ **No floating unaligned elements**: Every element must snap to the 4px/8px coordinate rhythm.
- ❌ **No unresponsive grids**: Grids must gracefully collapse from 4 cols -> 2 cols -> 1 col on mobile viewports.

---

## Local Search Utility

You can query the design database locally using the Python search utility:
```bash
python scripts/search.py "<query>" [--category styles|colors|typography|guidelines] [--design-system]
```
