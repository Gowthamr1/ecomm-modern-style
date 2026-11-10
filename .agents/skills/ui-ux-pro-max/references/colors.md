# Color Palettes & Systems Reference

This guide details deliberate, industry-calibrated color schemes and systematic color token architectures.

## The 60-30-10 Rule
- **60% Dominant Base**: Canvas/background and primary surfaces (e.g., #FFFFFF, #F8FAFC, #09090B).
- **30% Structural Neutral**: Cards, sidebar, modal backgrounds, borders, inactive states, secondary text.
- **10% Intentional Accent**: Primary CTA, active tabs, notification badges, progress indicators.

---

## Industry Color Profiles

### 1. Modern E-Commerce & Retail
- **Canvas**: `#FAFAFA` (Soft Pearl)
- **Surface**: `#FFFFFF` (Pure White)
- **Primary Text**: `#18181B` (Zinc 900)
- **Muted Text**: `#71717A` (Zinc 500)
- **Primary Accent**: `#0F172A` (Deep Slate / Obsidian) or `#D97706` (Amber Gold)
- **Success / In-Stock**: `#15803D` (Emerald 700)
- **Urgency / Discount**: `#DC2626` (Red 600)

### 2. High-Trust Fintech & Payments
- **Canvas**: `#F8FAFC` (Slate 50)
- **Surface**: `#FFFFFF`
- **Primary Text**: `#0F172A` (Slate 900)
- **Accent Primary**: `#0284C7` (Sky Blue) or `#2563EB` (Royal Blue)
- **Security / Positive**: `#059669` (Emerald 600)
- **Secondary Accent**: `#4F46E5` (Indigo 600)

### 3. Developer Tools & Terminal Dark
- **Canvas**: `#09090B` (Zinc 950)
- **Surface / Card**: `#18181B` (Zinc 900)
- **Border**: `#27272A` (Zinc 800)
- **Primary Text**: `#F4F4F5` (Zinc 100)
- **Accent**: `#10B981` (Emerald 500) or `#A855F7` (Purple 500)
- **Muted**: `#71717A` (Zinc 500)

---

## Semantic Color Token Architecture
Always map raw hex values to semantic CSS variables or Tailwind tokens:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
}
```
