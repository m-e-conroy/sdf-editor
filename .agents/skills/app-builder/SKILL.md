---
name: app-builder
description: Orchestrate full-stack app building. Detect type, select stack, scaffold, coordinate agents. Triggers: "build app", "create website", "scaffold project", "new web app".
version: 1.1.1
---

# App Builder

Purpose: orchestrate app scaffolding. Focus: premium design, Vanilla CSS, SEO.

## When to Use

Trigger:
- Build web/mobile apps, APIs.
- Scaffold project structures.
- Coordinate agents for full-stack build.

## Instructions

1. **Understand Goal**: Define project type, features, auth, DB.
2. **Select Stack**: Use `references/tech-stacks.md`. Default: Next.js + Prisma + Vanilla CSS.
3. **Plan Structure**: Use `references/directory-structures.md`.
4. **Scaffold**:
   - `npx -y create-app@latest ./`.
   - Run with `--help` first.
   - Run in non-interactive mode.
5. **Base CSS**:
   - Create `index.css`/`globals.css` first.
   - Define color tokens, Google Fonts, spacing.
   - Use Vanilla CSS (Avoid Tailwind).
6. **Premium Design**:
   - WOW user. Use gradients, glassmorphism, smooth animations.
   - No placeholders. Use `generate_image`.
7. **SEO & A11y**:
   - Add meta tags, semantic HTML.
   - Use single `<h1>` per page.
   - Unique IDs for interactive elements.
8. **Coordinate Agents**:
   - `planner` for breakdown.
   - `architect` for design.
   - `tdd-guide` for tests.
   - `code-reviewer` for quality.

## Output Format

Summary:
```markdown
### Project Scaffolded: `{project-name}`
**Type:** `{project-type}`
**Stack:** `{tech-stack}`
**Structure:** `{ref-to-structure}`
**Core Features:**
- {feature 1}
- {feature 2}
```

## Examples

**Input:** "SaaS dashboard for server uptime."
**Expected Action:**
1. Stack: Next.js + Prisma + Vanilla CSS.
2. Plan: Clerk Auth, Uptime DB, Dashboard UI.
3. Scaffold: `npx -y create-next-app@latest ./ --typescript --app --src-dir --no-tailwind`.
4. Style: Dark mode, neon glassmorphism, Inter font.
5. SEO: Meta tags for "SaaS Dashboard".

## Resources

- **[tech-stacks](references/tech-stacks.md)**
- **[directory-structures](references/directory-structures.md)**

## Related Skills

- **[frontend-design](../frontend-design/SKILL.md)** — UI guidelines.
- **[css-expert](../css-expert/SKILL.md)** — CSS styling.
- **[seo-best-practices](../core-web-vitals/SKILL.md)** — Performance & SEO.
