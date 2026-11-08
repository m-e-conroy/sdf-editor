---
name: "gsap"
description: Professional animation implementation using GSAP. Use for motion design, timeline sequences, interactive animations, staggered reveals, hover effects, landing pages. For scroll-driven animations, use gsap-scrolltrigger.
---

# GSAP Animation Skill

Professional, high-performance web animations using GreenSock.

## When to Use

Trigger when:
- Animations, motion design, interactive hover effects.
- Timeline sequences or complex staggered reveals.
- Page load animations or landing page orchestration.
- JavaScript animations in Vanilla JS, React, etc.
- GSAP setup, tweens (`gsap.to`, `gsap.from`), or staggers.

## Instructions

1. **Goal**: Purpose (micro-interaction, page reveal, timeline). Visual vs interactive.
2. **Patterns**: Check `references/patterns.md` for easing, timelines, staggering, React `useGSAP`.
3. **Setup**: Load GSAP via CDN. Register plugins (e.g., `gsap.registerPlugin(ScrollTrigger)`).
4. **Best Practices**:
    - GPU-accelerated: `x`, `y`, `rotation`, `scale`, `opacity`. Avoid layout props (`width`, `height`).
    - Easing: `power2.out` default. `back`/`elastic` for UI feedback. `power3/4` for drama.
    - `overwrite: "auto"` for conflict prevention.
    - Use `stagger` property for element groups.
5. **Accessibility (a11y)**: Respect `prefers-reduced-motion`. Provide fallback.
6. **Output**: HTML/CSS/JS or framework code.

## Output Format

Return implementation and brief explanation of structure, timeline, performance, and a11y.

Example:
```javascript
// Register plugins
gsap.registerPlugin(ScrollTrigger);

// Hero section reveal with GPU-accelerated properties
const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });

heroTL.from(".hero-bg", { scale: 1.2, duration: 1.5 })
  .from(".hero-title", { y: 100, opacity: 0, duration: 1 }, "-=1.5");
```

**Explanation:**
- Timeline for precise sequencing.
- GPU properties (`y`, `scale`, `opacity`) for smooth 60fps performance.

## Examples

**Input**: "Staggered reveal for card grid."
**Action**: Refer "Stagger" in `references/patterns.md`. Tween `.card` with `opacity: 0`, `y: 50`, `stagger: 0.1`.

**Input**: "GSAP in React."
**Action**: Refer "React Integration" in `references/patterns.md`. Use `@gsap/react` + `useGSAP` hook for cleanup.

## Resources

- [references/patterns.md](references/patterns.md) — Timelines, ScrollTrigger, React, and performance guide.

## Related Skills

- **[frontend-design](../frontend-design/SKILL.md)** — Motion design theory.
- **[css-expert](../css-expert/SKILL.md)** — Transitions when JS library is overkill.
- **[svg-graphics](../svg-graphics/SKILL.md)** — Animating SVG paths.
- **[p5js-creative-coding](../p5js-creative-coding/SKILL.md)** — Canvas property choreographing.
