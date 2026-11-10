# Editorial Design Principles for Diagrams

Technical diagrams are communication artifacts. They should look at home in the New York Times, The Economist, or Stripe's documentation.

## Rules of Craft

### 1. Line Weights & Hierarchy
- **Primary Connectors**: 1.5px solid stroke with subtle arrowheads (`stroke-width: 1.5`).
- **Secondary / Optional Paths**: 1px dashed stroke (`stroke-dasharray: 4 4`).
- **Container Boundaries**: 1px hairline stroke with low-opacity fill (`fill: rgba(0,0,0,0.02)` light / `rgba(255,255,255,0.02)` dark).

### 2. Node Geometries
- Cards should have subtle 6px-8px corner radii.
- Avoid bulky colored fills for entire containers; use white/surface cards with crisp 1px borders.
- Keep node padding comfortable: 12px horizontal, 8px-10px vertical.

### 3. Connector Routing
- Prefer straight lines and orthogonal 90-degree bends with small 4px corner radii.
- Never let connectors cross directly through the body of another node.
- Route parallel lines with at least 12px clearance.
