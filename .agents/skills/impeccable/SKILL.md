---
name: impeccable
description: Frontend design director, critique, audit, and polish skill. Use this skill when evaluating interfaces, running design audits, polishing styling details, structuring design documentation (PRODUCT.md, DESIGN.md), or improving UI clarity, accessibility, and visual hierarchy.
---

# Impeccable: Frontend Design Director & Polish System

Impeccable equips the agent with the critical eye of a senior design director. It replaces generic, statistical-average UI with intentional craftsmanship, documented design constraints, and rigorous heuristic audits.

---

## 1. Project Memory (`PRODUCT.md` & `DESIGN.md`)

When starting work on a project or major feature, Impeccable maintains two foundational memory files:

1. **`PRODUCT.md`**: Captures user personas, the core problem, jobs to be done, brand tone, and technical constraints.
2. **`DESIGN.md`**: Captures visual tokens, radius scale, elevation rules, typography choices, and forbidden patterns.

Before generating code, check if these files exist at the project root. If they do, strictly honor their guidelines. If not, suggest creating them or infer their principles from existing code.

---

## 2. Core Execution Modes & Commands

### `/impeccable shape`
- **When to use**: Before writing code for a new view or component.
- **Action**: Outline the information hierarchy, user mental model, component boundaries, and primary focal point. Never jump directly into HTML/CSS without shaping.

### `/impeccable critique`
- **When to use**: When evaluating existing UI or reviewing freshly generated components.
- **Criteria Evaluated**:
  1. **Visual Hierarchy**: Does the eye naturally travel to the most critical element first?
  2. **Information Density**: Is the screen cluttered, or is there adequate negative space?
  3. **Typography**: Are line lengths readable (45-75 characters per line)? Is tracking appropriate?
  4. **Affordance & Intent**: Are interactive controls unmistakably clickable?
  5. **Craft**: Are alignment, padding, and borders meticulously consistent?

### `/impeccable audit`
- **When to use**: Pre-merge or pre-flight quality check.
- **Checks**:
  - Color contrast ratios (WCAG AA/AAA).
  - Focus visible rings on all inputs, links, and buttons.
  - Responsive behavior across 375px (mobile), 768px (tablet), and 1280px (desktop).
  - Empty, error, and loading states accounted for.

### `/impeccable polish`
- **When to use**: Transforming good UI into production-grade, exceptional UI.
- **Tactics**:
  - Tighten micro-spacing (e.g. icon-to-label spacing, badge margins).
  - Optical alignment (e.g. centering play icons by visual center, not bounding box).
  - Micro-interactions (smooth button press scales, gentle card lift on hover).
  - Border and shadow refinement (subtle hairline borders instead of heavy black outlines).

### `/impeccable bolder` / `/impeccable quieter`
- **`bolder`**: If a design is timid, washed out, or lacks character, increase typographic scale, introduce high-contrast visual anchors, and amplify the primary accent.
- **`quieter`**: If a design feels loud, frantic, or over-stimulating, reduce saturated colors, expand whitespace, and tone down competing animations.

---

## 3. Heuristic Scoring Matrix

Consult [`references/critique-framework.md`](./references/critique-framework.md) for full scoring rubrics.
Score each dimension from 1 to 5. Any score below 4 requires immediate refactoring.
