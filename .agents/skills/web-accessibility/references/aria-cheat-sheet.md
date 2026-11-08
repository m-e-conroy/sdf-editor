# ARIA Role & Attribute Cheat Sheet

> **Rule #1**: If you can use a native HTML element (e.g. `<button>`), do NOT use ARIA.

## Common Interactive Roles

| Role | Purpose | Required Attributes |
| :--- | :--- | :--- |
| `button` | Actions | `aria-pressed` (if toggle), `aria-expanded` (if menu) |
| `checkbox` | State selection | `aria-checked` (true/false/mixed) |
| `dialog` | Modals | `aria-modal="true"`, `aria-labelledby` |
| `tablist` | Group of tabs | `aria-orientation` |
| `tab` | Specific tab | `aria-selected`, `aria-controls` (id of panel) |
| `tabpanel` | Tab content | `aria-labelledby` (id of tab) |

## Semantic Regions (Landmarks)

- `role="main"` (or `<main>`)
- `role="navigation"` (or `<nav>`)
- `role="banner"` (or `<header>`)
- `role="contentinfo"` (or `<footer>`)
- `role="search"`

## Live Regions (Dynamic Updates)

- `aria-live="polite"`: Screen reader waits until idle to announce. Best for non-urgent status.
- `aria-live="assertive"`: Immediate announcement. Use for critical alerts.
- `aria-atomic="true"`: Announce the whole element content when a part changes.
