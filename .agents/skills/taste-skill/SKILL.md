---
name: taste-skill
description: Anti-slop frontend design system for landing pages, marketing sites, modern web applications, and redesigns. Use this skill when generating, restyling, or auditing frontend interfaces to prevent generic AI templates, enforce real art direction, inject curated typography, and ensure distinctive craftsmanship.
---

# Taste Skill: Anti-Slop Frontend Design System

Taste Skill rejects generic, mediocre AI templates. It enforces strict art direction, distinctive visual character, purposeful whitespace, and genuine production-grade craftsmanship.

---

## 1. The Design Read (Required First Step)

Before generating any frontend code or component, you must declare **The Design Read**:

```text
[DESIGN READ]
- Page Kind: (e.g. Modern E-commerce Storefront / B2B Developer Tool / Creative Portfolio)
- Target Audience: (e.g. Design-conscious online shoppers / Senior engineers / High-growth founders)
- Core Vibe: (e.g. Warm Editorial Luxury / Precise High-Density Cyber / Tactile Swiss Modern)
- Aesthetic Family: (Editorial Monolith / Industrial Cyber / Crafted Tactile / Kinetic Modern)
- Control Dials:
  * DESIGN_VARIANCE: 8 (1-10, willingness to break conventional templates)
  * MOTION_INTENSITY: 6 (1-10, subtle micro-interactions to bold choreographed physics)
  * VISUAL_DENSITY: 4 (1-10, 1=luxurious airy whitespace, 10=compact data grid)
```

---

## 2. The Anti-Slop Directives

### 🚫 Strictly Forbidden (AI Slop Clichés):
1. **Generic Centered Hero**: 48px Inter bold headline, 16px light gray paragraph, and two pill buttons floating in the center over a purple-blue gradient blob.
2. **Three-Card Feature Row**: Exactly three identical rounded-xl cards with generic Lucide icons inside pastel circles.
3. **Washed-out Gray Text**: `#9CA3AF` or `#6B7280` on pure white that requires squinting to read.
4. **Indiscriminate Border-Radii**: Mixing sharp corners (`rounded-none`), soft corners (`rounded-md`), and pill tags (`rounded-full`) without a cohesive spatial system.
5. **Placeholder Content Slop**: Using "Lorem ipsum", "John Doe", or generic stock buzzwords ("Empower your synergy with next-gen AI"). Use real, contextual copy.

---

## 3. Aesthetic Families

Consult [`references/aesthetic-families.md`](./references/aesthetic-families.md) for detailed guidelines.

### A. Editorial Monolith
- **Vibe**: High-fashion, luxury retail, architectural journals, premium goods.
- **Traits**: Refined serif headlines (e.g. Fraunces, Playfair, Cormorant) paired with razor-sharp geometric sans; deliberate asymmetric layouts; bold monochrome tones with warm paper/linen undertones; full-bleed high-res photography.

### B. Industrial Cyber / Developer Precision
- **Vibe**: Observability platforms, crypto protocols, performance engineering tools.
- **Traits**: Monospaced typography for all data points; hairline dark borders (`1px solid rgba(255,255,255,0.08)`); subtle amber, mint, or phosphor green telemetry indicators; tabbed code blocks with line-number accents.

### C. Crafted Tactile
- **Vibe**: Note-taking apps, studio tools, personal productivity, creative software.
- **Traits**: Warm off-white surfaces (`#FBFBF9`, `#F7F7F4`), subtle inset shadows, smooth warm-gray borders, humanistic typography, micro-textures.

### D. Kinetic Modern
- **Vibe**: Design agencies, cutting-edge consumer apps, next-gen hardware landing pages.
- **Traits**: High-energy spring physics, bold scale shifts on scroll, interactive drag elements, crisp dark canvas with singular glowing neon focal points.

---

## 4. Non-Negotiable Pre-Flight Inspection Checklist

Before delivering code to the user, verify every item:
- [ ] **Contrast**: All text meets WCAG AA standards (>= 4.5:1 for body copy).
- [ ] **Typography Rhythm**: At least 3 clear optical weights/sizes with optical kerning (`tracking-tight` for large headings).
- [ ] **Real Copy**: Realistic pricing, product titles, descriptions, and feature names instead of filler placeholders.
- [ ] **Interactive Feedback**: Buttons and interactive controls have active, focus-visible, and hover states with smooth transitions (`transition-all duration-200 ease-out`).
- [ ] **Spatial Consistency**: Spacing values follow an 8px grid (8px, 16px, 24px, 32px, 48px, 64px, 96px).
