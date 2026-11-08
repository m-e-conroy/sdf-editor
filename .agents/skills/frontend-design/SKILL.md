---
name: frontend-design
description: UI design thinking: components, layouts, colors, typography, aesthetic interfaces.
version: 0.1.0
---

# Frontend Design Skill

> **Philosophy**: Pixel purpose. Restraint = luxury. Psychology drives decisions. Think/Ask, do not memorize/assume.

## When to Use

Trigger when:
- Design/style new web app, component, or layout.
- Establish brand identity, palette, or typography scale.
- Improve aesthetics/UX of existing interface.
- Determine best visual layout for specific constraints.

## Instructions

1. **Ask Before Assuming (MANDATORY)**: Never default styles. Ask about:
   - **Colors**: Preferred palette (minimalist, high-contrast, neon, monochrome).
   - **Style**: Minimal, bold, retro, brutalist, futuristic, organic?
   - **Layout**: Single column, asymmetrical, full-width narrative?
   - **Audience**: Gen Z (bold/fast), B2B (professional/trust), Luxury (whitespace/restraint).
2. **Anti-Cliché Mandate**: Break AI defaults.
   - **"Safe Harbor" Ban**: No Bento Grids, Aurora Gradients, Glassmorphism, or Standard Hero Split (left text, right image).
   - **Purple Ban**: NO purple, violet, indigo, or magenta primary unless asked. Avoid "Fintech Blue".
   - **Geometry**: No 4-8px corners. Use extremes (0px sharp or 32px soft pill).
3. **UX Laws**:
   - **Hick's Law**: Limit options, progressive disclosure.
   - **Fitts' Law**: Size CTAs appropriately.
   - **Miller's Law**: Chunk content in ~7 groups.
   - **Von Restorff**: Distinct primary CTAs.
4. **Spacing/Proportions**:
   - **8-Point Grid**: Padding/margins in steps of 4/8/16/24/32/48/64.
   - **Golden Ratio (1.618)**: Typography scaling, asymmetric layout splits.
5. **Color Theory (60-30-10 Rule)**:
   - **60%**: Background (calm neutral base).
   - **30%**: Secondary (contrast/support).
   - **10%**: Accent (CTAs/highlights).
6. **Component Strategy**:
   - **Next.js 16+ Forms**: `next/form` for GET; `<form>` for POST.
   - Local state first; global only if necessary.
7. **Review & Reflect**:
   - Audience fit? Not standard SaaS template?
   - Check for lazy indicators: system fonts, inconsistent spacing, walls of text, bad contrast.

## Output Format

1. **Design Hypothesis**: Layout, palette, typography, emotional target.
2. **Constraints**: Audience/brand requirements addressed.
3. **Implementation**: Clean semantic code.
4. **Anti-Cliché Checklist**: How design avoids AI defaults (e.g. sharp edges vs cards).

## Examples

**Input:** "Design a landing page for a new luxury watch brand."
**Expected Action:**
1. No bento/purple.
2. Ask heritage vs modern aesthetic.
3. Hypothesis: "Luxury needs restraint, contrast, whitespace. 0px radius, black/cream palette, serif pairing."
4. Asymmetric split + 8-point grid code.
5. Decision/anti-cliché summary.

## Resources

### Local References

- [UX Psychology](references/ux-psychology.md): Hick's, Fitts', Miller's laws.
- [Decision Trees](references/decision-trees.md): Layout/styling guides.
- [Color Systems](references/color-systems.md): Theory, accessibility, generation.
- [Typography](references/typography.md): Scales, pairing, readability.
- [Animation Guide](references/animation-guide.md): Timing, easing, micro-interactions.
- [Visual Effects](references/visual-effects.md): CSS effects, shadows, gradients.
- [Motion Graphics](references/motion-graphics.md): SVG, particles, 3D.

### External Resources

- [Laws of UX](https://lawsofux.com/)
- [Refactoring UI](https://www.refactoringui.com/)

## Related Skills

- **[css-expert](../css-expert/SKILL.md)**: Robust CSS architectures.
- **[web-accessibility](../web-accessibility/SKILL.md)**: Contrast, target sizes, WCAG 2.2.
- **[gsap](../gsap/SKILL.md)**: Professional animations.
- **[svg-graphics](../svg-graphics/SKILL.md)**: Scalable interactive vectors.
