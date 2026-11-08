---
name: "svg-graphics"
description: Create scalable, accessible, theme-aware SVG graphics and animations for the web — icons, banners, diagrams, illustrations, badges, and interactive visuals. Use this skill when building SVG files, animating SVG with CSS or SMIL, doing path morphing, motion path tracking, creating interactive SVG that responds to clicks without JavaScript, drawing real-world subjects (animals, people, objects) as vector illustrations, or producing documentation diagrams. Also triggers on "SVG animation", "animate SVG", "SMIL", "path morph", "animateMotion", "SVG icon", "SVG banner", "SVG diagram", "script-free SVG interaction", "CSS SVG", or any request to produce a self-contained scalable graphic.
---

# SVG Graphics Skill

Scalable, accessible, theme-aware visuals.

## When to Use

Trigger when:
- SVG icons, banners, diagrams, badges.
- Animations via CSS or SMIL (path morphing, motion paths).
- Interactive SVGs (hover, click) without JS.
- Real-world subject illustrations (animals, people).
- Responsive, theme-aware graphics.

## Instructions

1. **Understand Requirements**: Type of SVG, style, color, animation.
2. **Consult Best Practices**: Check `references/patterns.md`.
    - Real-world subjects: Read "Snowman Problem" + "Feature Differentiation Table". Use path-first workflow.
    - Animation: CSS for simple, SMIL for complex/event-driven.
3. **Structure SVG**:
    - Use `viewBox` for scaling.
    - Group via `<g>`. Use `<defs>` for reuse (gradients, paths).
    - Theme compatibility via `prefers-color-scheme`.
4. **Accessibility (a11y)**:
    - `role="img"` on `<svg>` if meaningful.
    - `<title>` and `<desc>` for screen readers.
    - `aria-hidden="true"` if decorative.
5. **Optimize**: Reasonable decimal precision. Keep `viewBox` and `<title>`.
6. **Output**: SVG code in XML block.

## Output Format

SVG code + brief explanation.

Example:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-labelledby="svg-title svg-desc">
  <title id="svg-title">Simple Graphic</title>
  <desc id="svg-desc">A brief description for accessibility.</desc>
  <!-- Content here -->
</svg>
```

**Explanation:**
- `<title>` and `<desc>` for a11y.
- SMIL for click animation.

## Examples

**Input**: "Create an SVG banner that says 'Project Alpha' with a delayed fade-in animation."
**Expected Action**: SVG with `<animate>`, `begin="0.5s"`, `fill="freeze"`.

**Input**: "Draw a side-profile of a dog in SVG."
**Expected Action**: Follow "Snowman Problem" rules. Snout, side ears, 1:2.5 head:body ratio, 4 legs. Single `<path>` silhouette.

## Resources

- [references/patterns.md](references/patterns.md) — Patterns, animations, layout, path-first drawing.

## Related Skills

- **[frontend-design](../frontend-design/SKILL.md)** — Visual design principles.
- **[gsap](../gsap/SKILL.md)** — Advanced animation/morphing.
- **[css-expert](../css-expert/SKILL.md)** — Styling/animating via CSS.
