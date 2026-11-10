---
name: archify
description: Transform system designs, codebases, workflows, API sequences, data pipelines, and state lifecycles into interactive, self-contained HTML/SVG diagrams. Use this skill when the user asks for architecture diagrams, component graphs, sequence charts, data flow maps, or interactive visual system models.
---

# Archify: Live Interactive System Diagrams

Archify transforms natural-language prompts, architecture specs, and codebase logic into publication-grade, self-contained, interactive HTML/SVG diagrams.

---

## 1. Diagram Categories & Selection

When requested to create or update a diagram, route the system into one of five core categories:

| Category | Typical Elements | Primary Purpose |
| :--- | :--- | :--- |
| **Architecture** | Services, API gateways, databases, queues, caches, boundaries | Cloud topology, microservice dependencies, trust zones |
| **Workflow** | Steps, decision diamonds, user actions, automation gates | CI/CD pipelines, approval loops, operational runbooks |
| **Sequence** | Actors, lifelines, synchronous/async calls, responses | Authentication handshakes, webhook flows, payment processing |
| **Data Flow** | Sources, transformation streams, ingest pipelines, sinks | Real-time analytics, ETL/ELT pipelines, event sourcing |
| **Lifecycle** | States, triggers, guard conditions, failure/retry transitions | Order states, subscription states, job queue lifecycles |

---

## 2. Geometry & Layout Rules

To ensure clean diagrams without visual noise:
1. **No Overlapping Paths**: Connector lines must use orthogonal routing (horizontal and vertical segments with rounded 4px-8px corners). Diagonal lines across nodes are banned.
2. **Consistent Node Spacing**: Minimum 48px horizontal gap between sequential nodes, minimum 32px vertical gap between parallel tiers.
3. **Clear Boundary Enclosures**: Group nodes inside logical containers (e.g., "VPC", "Kubernetes Cluster", "Client Tier") using translucent background fills (`rgba(255,255,255,0.03)`) and dashed borders.
4. **Directional Flow**: Flow strictly from Left-to-Right (`LR`) or Top-to-Bottom (`TD`). Never mix flows in the same diagram.

---

## 3. Interactive Standalone HTML Specification

Every diagram produced by Archify should be output as a complete, self-contained HTML file (or embedded interactive SVG) with:
- **Pan & Zoom**: Smooth mouse drag and scroll wheel zoom via SVG transform matrix.
- **Theme Switching**: Dark mode (deep zinc/slate) and Light mode (crisp paper/neutral) support.
- **Interactive Tracing**: Hovering over a node highlights all connected upstream and downstream dependency edges while dimming unrelated nodes.
- **Export Control**: One-click download button for SVG or PNG.

---

## 4. Archify Output Template

When generating an Archify diagram, produce the self-contained HTML using the structure defined in [`templates/standalone-diagram.html`](./templates/standalone-diagram.html) or inline SVG blocks.
