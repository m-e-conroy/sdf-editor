# Project Organization Reference

Structure projects for predictability, discoverability, scalability. Convention over configuration.

---

## Core Principles

| Principle | Why it matters |
|-----------|---------------|
| **Colocation** | Keep related files (styles, tests, types) together. |
| **Flat until painful** | Nest only when folder exceeds ~10–15 files. |
| **Predictable naming** | Guess path from feature name. |
| **Separation of concerns** | Distinguish source, config, build, docs, tests. |
| **Single responsibility** | Folder has one clear purpose. |

---

## Universal Project Root

Standard anatomy:

```text
project-root/
├── .agents/              # AI agents, skills, and personas
├── .github/              # CI/CD, PR templates
│   └── workflows/        # Actions YAML
├── .vscode/              # Shared team settings
├── docs/                 # Documentation, ADRs
├── public/               # Static assets (favicon, robots.txt)
├── src/                  # Source code
├── tests/                # Integration & e2e (unit colocate)
├── scripts/              # Build scripts, migrations
├── .gitignore
├── .editorconfig
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
└── CHANGELOG.md
```

### What Goes Where

| Content | Location | Rationale |
|---------|----------|-----------|
| Logic | `src/` | Separation from config. |
| AI Agents & Skills | `.agents/` | Local library of agentic personas and skills |
| Static | `public/` | Served as-is. |
| Env | Root | Never commit. |
| CI/CD | `.github/workflows/` | Standard. |
| Tooling | Root | `.vscode/`, `.editorconfig`. |
| Docs | `docs/` | Separate from source. |
| Build | `dist/`, `build/` | Gitignored. |

---

## Source Code Organization (`src/`)

### Pattern 1: Feature-Based (Recommended for Most Projects)

Group by domain. Self-contained features:

```text
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts          # Barrel file
│   └── ...
├── shared/                    # Cross-feature code
│   ├── components/            # UI primitives
│   ├── hooks/                 # Generic
│   ├── utils/                 # Pure functions
│   └── ...
├── layouts/                   # Shells
├── pages/                     # Entry points
├── styles/                    # Global tokens
├── lib/                       # SDK wrappers
├── config/                    # App-level config
├── App.tsx
└── main.ts
```

### Pattern 2: Type-Based (Layer-Based)

Group by technical role:

```text
src/
├── components/
├── hooks/
├── services/
├── utils/
├── types/
├── pages/
├── App.tsx
└── main.ts
```
Use for small projects/libraries.

---

### Hybrid Approach

Many real projects blend both — shared utilities are type-based, while business logic is feature-based:

```text
src/
├── features/          # Feature-based (business logic)
├── components/        # Type-based (shared UI primitives)
├── hooks/             # Type-based (shared hooks)
├── utils/             # Type-based (shared utilities)
└── ...
```

---

## File Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Component folders | PascalCase | `UserProfile/index.tsx` |
| Utilities | camelCase/kebab-case | `formatDate.ts` |
| Constants | camelCase file, UPPER_SNAKE values | `apiEndpoints.ts` |
| Types | camelCase/PascalCase | `auth.types.ts` |
| Tests | Mirror + suffix | `UserProfile.test.tsx` |
| Styles | Mirror + module suffix | `UserProfile.module.css` |
| Routes | kebab-case | `user-settings.tsx` |

### File Suffixes by Role

| Suffix | Meaning | Example |
|--------|---------|---------|
| `.test.ts` / `.spec.ts` | Unit/integration test | `auth.service.test.ts` |
| `.e2e.ts` | End-to-end test | `checkout.e2e.ts` |
| `.stories.tsx` | Storybook | `Button.stories.tsx` |
| `.module.css` | Scoped CSS | `Card.module.css` |
| `.types.ts` | Type definitions | `user.types.ts` |
| `.service.ts` | Data/API layer | `auth.service.ts` |
| `.hook.ts` | Custom hook | `useAuth.hook.ts` |
| `.util.ts` | Utility | `date.util.ts` |
| `.schema.ts` | Validation | `login.schema.ts` |

---

## Module Organization

### Barrel Files (`index.ts`)

Define public API per folder:
```ts
export { LoginForm } from "./components/LoginForm";
export { useAuth } from "./hooks/useAuth";
```
Consumer: `import { LoginForm } from "@/features/auth"`.

### Path Aliases

Avoid relative imports:
```json
"@features/*": ["src/features/*"],
"@shared/*": ["src/shared/*"]
```

### Circular Dependency Prevention
- Features must not import from each other.
- Extract shared logic to `shared/`.

---

## Config Files

### Root Config Files

| File | Purpose |
|------|---------|
| `package.json` | Deps, scripts, metadata. |
| `tsconfig.json` | TS options. |
| `vite.config.ts` | Build tool. |
| `.eslintrc.js` | Linting. |
| `.prettierrc` | Formatting. |
| `.env` | Env vars (ignored). |
| `Dockerfile` | Container. |

---

### When There Are Too Many Configs

If the root is cluttered, some teams consolidate into a `config/` folder — but only for custom configs. Tooling dotfiles (`.eslintrc`, `.prettierrc`) typically must stay at the root for auto-discovery.

---

## Test Organization

### Colocated Unit Tests (Recommended)
```text
src/features/auth/
├── services/
│   ├── auth.service.ts
│   └── auth.service.test.ts
```

### Separate Test Directory for Integration & E2E
```text
tests/
├── integration/
├── e2e/
└── fixtures/
```

---

### Test Utilities

```text
src/
└── test-utils/                 # Custom render functions, providers, mocks
    ├── render.tsx              # Wrapped render with providers
    ├── mocks/
    │   └── handlers.ts         # MSW request handlers
    └── factories/
        └── user.factory.ts     # Test data factories
```

---

## Documentation Structure

```text
docs/
├── README.md
├── getting-started.md
├── architecture.md
├── adr/                        # Architecture Decision Records
└── guides/
```

### Architecture Decision Records (ADRs)
Capture *why* of structural changes:
```markdown
# ADR-001: Use feature-based structure
## Status: Accepted
## Context: Project growing, navigation difficult.
## Decision: Organize by domain.
```

---

## Monorepo Structure

```text
monorepo-root/
├── apps/
│   ├── web/
│   └── admin/
├── packages/
│   ├── ui/
│   ├── utils/
│   └── config/
├── package.json
└── turbo.json
```

---

## Common Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Deep nest (5+ levels) | Hard navigation | Flatten. |
| `utils/` junk drawer | No focus | Split into `date-utils`, etc. |
| Huge `components/` | No discovery | Group by feature/domain. |
| No barrels | Deep internal imports | Use `index.ts`. |
| Committing env files | Leaked secrets | Use `.env.example`. |

---

## Quick Decision Guide

| Question | Answer |
|----------|--------|
| New component? | Feature → `features/`. Shared → `shared/components/`. |
| New utility? | Feature specific → feature folder. Broad → `shared/utils/`. |
| New API? | `features/<feature>/services/`. |
| Types? | Colocated. Shared → `shared/types/`. |
| Tests? | Unit → next to source. Integration → `tests/`. |
| Subfolder? | Folder > 15 files. |

---

## Framework-Specific Layouts

Detailed folder structures for popular frameworks. Read the section that matches the user's stack.

## React (Vite / CRA)
```text
src/
├── features/
├── shared/
├── pages/
├── layouts/
├── router/
├── styles/
├── lib/
├── App.tsx
└── main.tsx
```

### React Component Folder
```text
Button/
├── Button.tsx
├── Button.test.tsx
├── Button.module.css
└── index.ts
```

## Next.js (App Router)
```text
app/                           # File-system routing
├── layout.tsx
├── page.tsx
├── loading.tsx
├── (marketing)/               # Route group
│   └── about/page.tsx
└── api/                       # API routes
components/                    # Shared UI
lib/                           # Server utils
hooks/                         # Client hooks
```

### Key Next.js Conventions

| File | Purpose |
|------|---------|
| `page.tsx` | Makes a route publicly accessible |
| `layout.tsx` | Shared UI wrapper |
| `loading.tsx` | Suspense fallback |
| `error.tsx` | Error boundary |
| `route.ts` | API endpoint |
| `(groupName)/` | Route group |
| `[param]/` | Dynamic segment |
| `[...slug]/` | Catch-all |

---

## Vue 3
```text
src/
├── features/
├── shared/
├── views/
├── layouts/
├── router/
├── stores/                    # Pinia
├── plugins/
├── App.vue
└── main.ts
```

### Vue Component File

Single-file components (`.vue`) keep template, script, and style together:

```text
UserCard/
├── UserCard.vue
├── UserCard.test.ts
└── index.ts
```

---

## Svelte / SvelteKit
```text
src/
├── routes/                    # File-based
│   ├── +layout.svelte
│   ├── +page.svelte
│   └── api/
├── lib/                       # Shared ($lib)
├── params/                    # Matchers
└── hooks.server.ts            # Middleware
```

## Node.js / Express API
```text
src/
├── modules/                   # Feature-based
│   └── auth/
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       └── auth.routes.ts
├── shared/
│   ├── middleware/
│   └── database/
├── config/
├── app.ts
└── server.ts
```
