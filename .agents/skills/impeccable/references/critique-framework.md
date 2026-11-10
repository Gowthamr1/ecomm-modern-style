# Impeccable Critique Framework

Use this framework when critiquing any UI implementation.

## The 7 Heuristic Dimensions

### 1. Hierarchy & Focal Gravity
- **Score 1**: Competing visual elements everywhere; no clear hero; eye wanders aimlessly.
- **Score 3**: Decent heading, but secondary cards fight for attention.
- **Score 5**: Immediate clarity; dominant focal anchor; logical secondary and tertiary flow.

### 2. Spacing & Rhythm
- **Score 1**: Arbitrary margins (e.g. 13px, 27px); elements touch or feel cramped.
- **Score 3**: Mostly consistent margins, but awkward gaps around form fields.
- **Score 5**: Strict 4px/8px coordinate rhythm; intentional grouping and breathing room.

### 3. Typographic Craft
- **Score 1**: Default unstyled fonts; long unconstrained text blocks (>90 characters per line); loose leading.
- **Score 3**: Good font choices, but headings feel disconnected from body text.
- **Score 5**: Tightened headline kerning; optimal reading line lengths (50-75 chars); calibrated line heights.

### 4. Interactive Feedback & Affordance
- **Score 1**: Buttons look like static text; no hover, active, or focus states.
- **Score 3**: Standard hover color changes, but sluggish or jarring.
- **Score 5**: Clear affordance; tactile hover/active states; visible keyboard focus rings.

### 5. Color Economy
- **Score 1**: 6+ clashing colors; saturated rainbow accents.
- **Score 3**: Decent palette, but inconsistent tint usage across cards.
- **Score 5**: Cohesive 60-30-10 distribution; semantic meaning behind every color choice.

### 6. Empty & Edge States
- **Score 1**: Crashes or displays blank white screen when data is empty.
- **Score 3**: Displays plain text "No items found".
- **Score 5**: Helpful empty state illustration/icon, explanatory copy, and clear action button.

### 7. Accessibility
- **Score 1**: Fails basic contrast (<3:1); unlabeled icon buttons.
- **Score 3**: Meets AA contrast, but missing ARIA labels on custom dropdowns.
- **Score 5**: Fully WCAG AA compliant; semantic HTML; complete keyboard accessibility.
