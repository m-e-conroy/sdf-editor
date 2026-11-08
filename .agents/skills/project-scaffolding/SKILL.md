---
name: project-scaffolding
description: Step-by-step project initialization and boilerplate generation. Trigger: "start a new project", "scaffold an app", "create a website from scratch", "project scaffolding".
version: 1.0.0
---

# Project Scaffolding

Initialize new projects with standardized directory structures, tech stacks, and premium boilerplate.

## When to Use

Trigger when:
- User says "start a new project", "scaffold an app", "create a website from scratch", "project scaffolding".
- Initializing a new repository or sub-module.
- A structured foundation is needed for a new feature set.

## Instructions

1. **Socratic Discovery** (`planner`): **STOP.** Do not create files yet. Gather requirements via **[brainstorming](../brainstorming/SKILL.md)**. Ask about Project Type, Tech Stack, and Scope.
2. **Project Proposal** (`planner`): Formulate proposal and roadmap via **[project-proposal](../project-proposal/SKILL.md)**. Define Scope and Milestones. Save formal proposal to `docs/PROPOSALS/{project-name}-proposal.md`.
3. **Creative Vision** (`creative-director`): Establish visual identity (mood, palette, typography). Define design tokens for `frontend-developer`.
4. **Stack Selection** (`project-manager`): Select stack and directory structure using **[Scaffold Cheatsheet](references/scaffold-cheatsheet.md)** and **[app-builder](../app-builder/SKILL.md)**.
5. **Repository Initialization** (`project-manager`):
   - Initialize git repository: `git init`.
   - Configure `.gitignore` via **[git-management](../git-management/SKILL.md)**.
   - Run non-interactive scaffolding command (e.g. `npx -y create-vite@latest <name> --template react-ts`).
6. **Boilerplate Implementation** (`frontend-developer`):
   - Create `index.css` or `globals.css` with color tokens, Google Fonts, and base resets from creative vision.
   - Create core application entry points (`index.html`, `App.tsx`, `server.ts`).
   - Remove generic boilerplate placeholder logos and demo counters.
7. **Quality Control** (`qa-engineer`):
   - Verify directory layout.
   - Run dev build or typecheck to confirm zero setup errors.
8. **Documentation** (`documentation-writer`): Document architecture in `README.md` and initialize documentation.

## Output Format

### Project Scaffolding: {Project Name}

**Project Setup**
- **Type**: {e.g., Vite React SPA}
- **Stack**: {e.g., React + TypeScript + Vanilla CSS}
- **Status**: {✅ Initialized / 🔄 Configuring}

**Directory Structure**
```text
{Tree view}
```

**Next Steps**
1. [ ] Implement {Feature 1}
2. [ ] Setup {DB/Auth}
3. [ ] Run `npm run dev`

## Examples

**Input:** "Build a simple portfolio for a photographer."
**Expected Action:**
1. Ask about gallery features, layout preferences, and brand palette via `brainstorming`.
2. Select Vite + React + GSAP stack.
3. Run `npx -y create-vite@latest ./ --template react-ts`.
4. Replace default styles in `index.css` with dark mode tokens and typography.
5. Report status and directory structure.

## Resources

- [Scaffold Cheatsheet](references/scaffold-cheatsheet.md) — Non-interactive CLI commands and repository setup checklist.
- [App Builder Skill](../app-builder/SKILL.md) — Fullstack architecture and stack selection.
- [Git Management Skill](../git-management/SKILL.md) — Repository hygiene and ignore rules.

## Related Skills

- **[ui-ux-pro-max](../ui-ux-pro-max/SKILL.md)** — Design system intelligence.
- **[app-builder](../app-builder/SKILL.md)** — Core orchestration.
- **[project-proposal](../project-proposal/SKILL.md)** — Strategic planning and discovery.
- **[plan-writing](../plan-writing/SKILL.md)** — Structured task breakdowns.
- **[brainstorming](../brainstorming/SKILL.md)** — Requirement gathering.
- **[art-theory](../art-theory/SKILL.md)** — Visual identity guidance.
- **[css-expert](../css-expert/SKILL.md)** — Base styling.
- **[project-organization](../project-organization/SKILL.md)** — Folder standards.
- **[git-management](../git-management/SKILL.md)** — Repository setup and hygiene.

