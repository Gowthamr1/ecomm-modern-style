---
name: diagram-design
description: Clean, magazine-style, and editorial-quality technical diagrams as self-contained HTML and SVG. Use this skill when generating visual diagrams, workflow charts, system maps, timelines, matrix comparisons, and concept diagrams that demand publication-ready aesthetics and zero visual clutter.
---

# Diagram Design: Editorial Technical Diagrams

Diagram Design enforces publication-ready editorial standards for technical diagrams. It completely avoids "Mermaid slop", heavy drop shadows, neon cyan/purple glows on black, and clunky rounded boxes.

---

## 1. Editorial Core Principles

1. **"The highest-quality move is usually deletion."**
   - Strip unnecessary lines, boxes, borders, and decorations.
   - If an element does not convey meaning, remove it.
2. **Restrained Color Architecture**:
   - Use a neutral grayscale or warm slate foundation (`#0F172A`, `#334155`, `#F8FAFC`).
   - Limit accent colors to **one (maximum two)** intentional focal colors.
   - Never use random color coding without an explicit legend.
3. **Typography Standards**:
   - Clean editorial sans-serif (Inter, SF Pro, Geist, Helvetica Neue).
   - High typographic hierarchy: bold clear section titles, uppercase tracked metadata tags, compact legible node labels.
4. **Coordinate Precision**:
   - Everything snaps strictly to a **4px coordinate grid**.
   - No floating odd-pixel offsets (e.g. 13px or 27px).

---

## 2. Diagram Types Catalog (45 Core Types)

Consult [`references/diagram-catalog.md`](./references/diagram-catalog.md) for full diagram templates and structure.

Key categories supported:
- **System & Architecture**: Service topology, cloud boundary, VPC routing, caching tiers.
- **Process & Workflow**: Linear pipeline, branching decision flow, swimlane processes.
- **Strategic & Comparison**: 2x2 quadrant matrix, spider/radar chart, capability Venn.
- **Temporal & Progression**: Milestone roadmap, historical timeline, evolutionary tree.
- **Structural & Conceptual**: Flywheel, funnel, pyramid, concentric ring model.

---

## 3. Formatting & Output Standard

When asked to generate a diagram using this skill:
1. Generate a **clean, self-contained SVG or HTML file**.
2. Embed all CSS styles cleanly within `<style>` blocks.
3. Ensure crisp vector rendering at any scale with clean `viewBox` coordinates.
4. Verify contrast ratios (minimum 4.5:1 against the canvas).
