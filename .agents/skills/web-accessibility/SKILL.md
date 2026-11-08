---
name: web-accessibility
description: Apply WCAG 2.2 guidelines for accessible web interfaces. Use for accessibility, ARIA, screen readers, WCAG compliance, or making UI accessible.
---

# Web Accessibility (WCAG 2.2) Skill

Build accessible, perceivable, operable, understandable, robust web apps adhering to WCAG 2.2.

## When to Use

Trigger when:
- Make app/component accessible or WCAG compliant.
- Add/audit ARIA attributes.
- Improve keyboard navigation and focus management.
- Ensure screen reader compatibility.
- Address WCAG 2.2 criteria (target size, focus states).

## Instructions

1. **Semantic HTML First**: Prefer native elements (`<button>`, `<nav>`, `<main>`, `<dialog>`) over custom ARIA. ARIA only when native fails.
2. **Keyboard Operability**: Interactive elements reachable/usable via keyboard (Tab, Shift+Tab, Enter, Space, Arrows). No keyboard traps.
3. **WCAG 2.2 Enhancements**:
   - **Focus Not Obscured (2.4.11/2.4.12)**: Elements not hidden by sticky headers/content.
   - **Focus Appearance (2.4.13)**: High contrast, thick visible focus indicators.
   - **Dragging Movements (2.5.7)**: Single-pointer clicking alternative.
   - **Target Size (2.5.8)**: Min 24x24 CSS pixels or spacing.
   - **Consistent Help (3.2.6)**: Same relative order across pages.
   - **Redundant Entry (3.3.7)**: Auto-fill previously entered info.
   - **Accessible Auth (3.3.8/3.3.9)**: No cognitive tests (puzzles/memory) without alternatives.
4. **Color & Contrast**: Text contrast ratio min 4.5:1 (AA) or 7:1 (AAA). Do not rely on color alone.
5. **Screen Reader Context**: Use `aria-label`, `aria-labelledby`, `aria-describedby` for missing visual context. Keep ARIA minimal.

## Output Format

Structure for accessibility fixes:
1. Code with semantic HTML + ARIA.
2. Explain accessibility features.
3. Note specific WCAG 2.2 criteria addressed.

## Examples

**Input:** "Accessible custom dropdown menu."
**Expected Action:**
1. Native `<button>` with `aria-haspopup="true"` and `aria-expanded`.
2. Wrap menu list in `role="menu"` with `role="menuitem"`.
3. Keyboard navigation (Arrows, Escape, Enter, Space) + focus management.
4. Target sizes min 24x24px.
5. Present code + explain patterns.

## Resources

- [WCAG 2.2 Official Guidelines](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Web Docs on Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Related Skills

- **[frontend-design](../frontend-design/SKILL.md)** — Inclusive design.
- **[css-expert](../css-expert/SKILL.md)** — Layouts, focus states, high-contrast.
- **[web-components](../webcomponents/SKILL.md)** — Accessible components via Shadow DOM/ARIA.
