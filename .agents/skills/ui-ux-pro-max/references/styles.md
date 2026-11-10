# UI Styles Reference

This reference catalogs production-ready design aesthetics, their signature tokens, visual rules, and when to apply them.

## 1. Modern Minimalist (Clean Tech & SaaS)
- **Best For**: B2B SaaS, developer tooling, documentation, productivity apps, cloud dashboards.
- **Key Characteristics**:
  - High whitespace ratio (40%+).
  - Fine 1px borders (`border-slate-200` light / `border-zinc-800` dark).
  - Subtle drop shadows (`0 1px 3px 0 rgb(0 0 0 / 0.05)`).
  - Monochromatic foundation with a single punchy accent (Indigo, Royal Blue, Emerald).
- **Tailwind Tokens**:
  - Background: `bg-slate-50 dark:bg-zinc-950`
  - Surface: `bg-white dark:bg-zinc-900`
  - Border: `border-slate-200 dark:border-zinc-800`
  - Accent: `bg-blue-600 hover:bg-blue-700 text-white`

## 2. Bento Grid
- **Best For**: Feature showcases, landing pages, analytical dashboards, product landing overviews.
- **Key Characteristics**:
  - Multi-column asymmetric grid (typically 3-4 columns on desktop).
  - Visual hierarchy: 1 hero card (span 2x2 or 2x1), 2 medium cards, 2 compact utility cards.
  - Interactive previews inside cards (mini charts, code snippets, toggle previews).
  - Consistent border radii (`rounded-2xl` or `rounded-3xl`).
- **Tailwind Tokens**:
  - Grid Container: `grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6`
  - Card: `p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between`

## 3. Dark Elegance / Cyber Minimal
- **Best For**: High-end crypto, AI tools, luxury tech products, creative portfolios.
- **Key Characteristics**:
  - Deep black or tinted black background (`#09090b` or `#0b0f19`).
  - Subtle radial gradient glow behind focal elements (`radial-gradient(circle at 50% 0%, rgba(120,119,198,0.15), transparent 70%)`).
  - High-contrast typography: Pure white `#FFFFFF` for primary text, `#A1A1AA` for body text.
  - Glass-like card surfaces with slight backdrop blur (`backdrop-blur-md bg-zinc-900/60`).

## 4. High-End E-Commerce & Retail
- **Best For**: Luxury goods, apparel, furniture, curated marketplaces.
- **Key Characteristics**:
  - Clean generous gutters, editorial typography (refined serif display + geometric sans body).
  - Edge-to-edge product photography with consistent aspect ratios (`aspect-square` or `aspect-[3/4]`).
  - Tactile micro-interactions on hover (slight image scale `hover:scale-105 transition-transform duration-300`).
  - Prominent sticky checkout bar and accessible color/size variation chips.
