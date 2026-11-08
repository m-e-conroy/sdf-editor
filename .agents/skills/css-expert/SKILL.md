---
name: css-expert
description: Expert-level CSS development covering modern layout, nesting, animations, and accessible styling. Use when the user asks to write, debug, or architect CSS, or implement layouts/animations.
version: 2.0.0
---

# CSS Expert

Write modern, performant, maintainable, accessible CSS. Deep knowledge of CSS spec, browser compatibility, WCAG, and visual craft.

## When to Use

Trigger when:
- Write, debug, or architect CSS.
- Implement layouts (flexbox, grid, subgrid, container queries).
- Create animations, transitions, transforms.
- Apply native nesting, modern pseudo-classes (`:has()`, `:is()`, `:where()`).
- Ensure WCAG-compliant styling.
- Implement fluid responsive design, design tokens.
- Create visual effects (gradients, glassmorphism, shadows).

## Instructions

Act as Senior Front-End Architect. Adhere to modern best practices:

### 1. Accessible by Default (WCAG AA)

Visual decisions must meet WCAG AA. Accessibility is a constraint, not afterthought.
- **Focus indicators**: Define `:focus-visible`. Never remove `outline` without replacement.
- **Motion safety**: Wrap animations in `@media (prefers-reduced-motion: no-preference)`. Provide `@media (prefers-reduced-motion: reduce)` fallback.
- **Forced colors**: Support `@media (forced-colors: active)` for Windows High Contrast.
- **Touch targets**: 44×44px minimum tap target.
- **Color independence**: Never rely on color alone for meaning. Supplement with icons/text.
- **Contrast ratios**: Normal text ≥ 4.5:1. Large text ≥ 3:1. UI elements ≥ 3:1.

### 2. Mobile-First Responsive Design

Start fluid mobile, progressively enhance.
- Relative units (`rem`, `em`, `dvh`, `cqi`) over fixed pixels.
- Use `clamp()` for fluid typography: `font-size: clamp(1rem, 0.5vw + 0.875rem, 1.125rem)`.
- `text-wrap: balance` on headings.
- `min()`, `max()`, `clamp()` for fluid spacing/sizing.

### 3. Cascade and Specificity Mastery

- Use `@layer` for priority (reset, base, components, utilities).
- `:where()` for zero specificity styles.
- `:is()` for grouping without specificity bloat.
- `:has()` for parent/sibling selection (avoid JS toggles).

### 4. Modern Native Nesting

Use native nesting to scope styles and reduce repetition.
- Use `&` selector:
  - Pseudo-classes: `&:hover`, `&:focus-visible`, `&:disabled`
  - Pseudo-elements: `&::before`, `&::after`
  - Modifiers: `&.is-active`
  - Child elements: `& .child-element`
- Nest `@media` and `@container` inside component blocks.
- Max 3 levels deep.

### 5. Modern Layout Systems

- Flexbox for 1D layouts (nav, toolbars).
- Grid for 2D layouts (page structure, dashboards).
- `subgrid` for nested alignment.
- `@container` for component-level responsiveness.
- Reference [assets/layout-templates.css](assets/layout-templates.css).

### 6. Design Tokens & Custom Properties

Use [assets/design-tokens.css](assets/design-tokens.css).
- Organize by category: colors, typography, spacing, shadows, etc.
- `oklch()` or `color-mix()` for uniform palettes.
- Named easing (`--ease-out`) and durations (`--duration-normal`).
- Light/dark themes via `[data-theme]` or `prefers-color-scheme`.

### 7. CSS Reset

Use [assets/reset.css](assets/reset.css). Covers:
- `box-sizing: border-box`.
- Responsive media defaults (max-width: 100%).
- Font inheritance for forms.
- Motion-safe smooth scrolling.

### 8. Performance-Driven Animations

- Animate `transform` and `opacity` only (60fps).
- `contain: layout style paint` on animated containers.
- `content-visibility: auto` for off-screen sections.
- `will-change` sparingly.
- Named easing tokens for natural motion.

### 9. Progressive Enhancement

- `@supports` for modern features with fallbacks.
- Feature queries for `backdrop-filter`, `subgrid`, `container queries`.

```css
.grid {
  display: flex;
  flex-wrap: wrap;
}

@supports (display: grid) {
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}
```

### 10. Visual Design Techniques

- Layered `box-shadow` tokens for depth.
- `backdrop-filter: blur()` (with `@supports`).
- `oklch` gradients for uniform stops.
- `background-clip: text` for gradient text.

### 11. Lookup Documentation with `context7`

Use `context7` for props, syntax, compatibility.
```
context7 "CSS container queries browser support"
context7 "CSS :has() selector syntax"
context7 "CSS oklch color function"
```

## Anti-Patterns & Safety

| Anti-pattern | Problem | Do Instead |
| :--- | :--- | :--- |
| `!important` on arbitrary rules | Breaks cascade; specificity debt | Use `@layer` |
| Fixed heights on text containers | Text overflows on zoom | Use `min-height` |
| `:focus { outline: none; }` | Removes keyboard visibility | Style `:focus-visible` |
| Animating `width`, `height`, `top`, `left` | Triggers layout recalculation | Animate `transform`, `opacity` |
| Deep descendant selectors | Slow matching; coupled to HTML | Single class selectors |
| Heavy `backdrop-filter` on mobile | Expensive repaint; kills 60fps | Limit blurred area size |
| Relying on `:visited` for layout | Privacy restrictions | Only color changes |

## Output Format

- Use [reset](assets/reset.css) and [design tokens](assets/design-tokens.css).
- Group via native nesting.
- Organize cascade via `@layer`.
- Brief comments for complex logic.
- No conversational filler.

## Workflow

1. **Lookup**: Use `context7`.
2. **Accessibility first**: Focus, contrast, motion safety.
3. **Mobile-first**: Base mobile, enhance with `@media`.
4. **Tokens**: Use custom properties.
5. **Nest**: Scope to components; co-locate queries.
6. **Animate deliberately**: `transform`/`opacity`; respect `prefers-reduced-motion`.
7. **Progressive enhancement**: `@supports`.
8. **Validate**: WCAG contrast, keyboard, screen reader.

## Examples

### Example 1: Responsive Card with Container Queries

Card using `@container` to switch vertical → horizontal layout > 400px.

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-fast) var(--ease-out),
              transform var(--duration-fast) var(--ease-out);

  & .card__image {
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }

  & .card__content {
    padding: var(--space-4);
  }

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }

  &:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  @container card (min-width: 400px) {
    display: grid;
    grid-template-columns: 180px 1fr;

    & .card__image {
      aspect-ratio: 1;
    }
  }
}
```

### Example 2: Button with Nested States and Motion Safety

Accessible button, motion-safe transitions.

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  min-height: 44px; /* Touch target */
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--color-primary-dark);
  }

  &:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: no-preference) {
    transition: background var(--duration-fast) var(--ease-out),
                transform var(--duration-instant) var(--ease-out);
  }
}

@media (forced-colors: active) {
  .button {
    border: 2px solid ButtonText;
  }
}
```

### Example 3: Accessible Entrance Animation

Subtle animation, only if no reduced motion preference.

```css
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  opacity: 1; /* Base state — no animation by default */

  @media (prefers-reduced-motion: no-preference) {
    opacity: 0;
    animation: fadeSlideIn 0.5s var(--ease-out) both;
  }
}
```

## Resources

- [MDN Web Docs: CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [MDN: CSS Nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting)
- [web.dev: Learn CSS](https://web.dev/learn/css/)
- [web.dev: Container Queries](https://web.dev/blog/cq-stable)
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [Can I use... (Browser support)](https://caniuse.com/)
- [CSS DB — Spec Proposal Tracker](https://cssdb.org)
- [assets/reset.css](assets/reset.css)
- [assets/design-tokens.css](assets/design-tokens.css)
- [assets/layout-templates.css](assets/layout-templates.css)

## Related Skills

- **[frontend-design](../frontend-design/SKILL.md)**: Design principles/UX theory.
- **[gsap](../gsap/SKILL.md)**: Complex timeline animations.
- **[svg-graphics](../svg-graphics/SKILL.md)**: Styling/animating vector graphics.
