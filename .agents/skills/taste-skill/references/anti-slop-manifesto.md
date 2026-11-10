# Anti-Slop Manifesto

AI models generate statistical averages. The average website is bland, forgets contrast, uses generic purple badges, centers everything on mobile without thinking, and litters the page with cards that have no content hierarchy.

## Core Rules to Defeat Generic Design

1. **Hierarchy Through Scale & Weight, Not Card Enclosures**
   - Don't put every piece of information inside a bordered card.
   - Use bold size contrasts (e.g. 48px heading next to 14px caption) to create structure directly on the canvas.

2. **Intentional Color Restraint**
   - A great design typically relies on 1 dominant background, 1 primary text tone, 1 subtle border tone, and **exactly 1** focal accent color.
   - Rainbow buttons, multicolored badges, and arbitrary card border tints are forbidden.

3. **Spatial Rhythms**
   - Provide generous breathing room around focal elements.
   - Micro-elements (such as an icon next to text) should have tight 6px-8px spacing; macro-sections should have 64px-120px separation.

4. **Real Micro-Interactions**
   - Buttons must react to hover: slight brightness shift, smooth 1px translateY, subtle shadow expansion.
   - Modals and drawers must open with smooth spring curves (`cubic-bezier(0.16, 1, 0.3, 1)`), never linear snap animations.
