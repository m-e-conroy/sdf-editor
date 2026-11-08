---
name: project-organization
description: Organize web projects with clear folder structures, naming conventions, and module patterns. Use for questions on layout, file placement, scaffolding, restructuring, or project architecture.
---

# Project Organization

## When to Use

Use when user asks about project structure, folder layout, file placement, naming, scaffolding, or restructuring.

## Instructions

1. **Patterns**: Refer `references/patterns.md` for specific framework layouts and principles.
2. **Framework**: Identify target framework (React, Next.js, Node.js) for conventions (e.g. App Router).
3. **Universal Root**: Keep `.agents/`, `src/`, `public/`, `tests/`, `docs/`, `.github/` separate. Configs at root or `config/` folder.
4. **Source Pattern**:
   - **Feature-Based**: Group by domain (e.g. `src/features/auth/`). Colocate code. (Recommended).
   - **Type-Based**: Group by technical role (e.g. `src/components/`). For simple sites.
5. **Naming**:
   - **Components**: `PascalCase` (e.g. `UserProfile.tsx`).
   - **Utils**: `camelCase` or `kebab-case`.
   - **Suffixes**: Append role (`.test.ts`, `.service.ts`, `.module.css`).
6. **Colocate**: Unit tests + scoped CSS next to source. Use `tests/` for integration/e2e.
7. **Modules**: Use `index.ts` barrels for public API. Extract shared code to `src/shared/`.
8. **ADRs**: Suggest Architecture Decision Records in `docs/adr/` for structural changes.

## Output Format

Use Markdown file trees. Predictability, colocation, separation of concerns.

Example structure:
```text
src/
├── features/
│   └── auth/
│       ├── components/
│       │   ├── LoginForm.tsx
│       │   └── LoginForm.test.tsx
│       └── index.ts
└── shared/
```

## Examples

**Input**: "Where should I put a utility function for formatting dates in user profile?"

**Action**:
1. Check if specific to profile or general.
2. Recommend `src/shared/utils/date.util.ts` (general) or `src/features/user-profile/utils/formatDate.util.ts` (localized).
3. Provide tree + colocation rationale.

## Resources

- [references/patterns.md](references/patterns.md) — Directory structures, frameworks, naming, monorepos.
- **documentation-standards** (Skill) — For ADRs and guides.

## Related Skills

- **[nodejs-best-practices](../nodejs-best-practices/SKILL.md)** — Node.js modularity.
- **[clean-code](../clean-code/SKILL.md)** — Clean naming.
- **[api-patterns](../api-patterns/SKILL.md)** — Resource/handler structure.
