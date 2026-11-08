---
name: repo-onboarding
description: Rapidly map codebase structure, tech stack, entry points, and architecture. Trigger: "onboard to this repo", "summarize project structure", "how does this work", "repo onboarding".
version: 1.0.0
---

# Repository Onboarding

Map repository structure, tech stack, entry points, and architectural patterns for fast context acquisition.

## When to Use

Trigger when:
- Entering a new repository or major sub-project for the first time.
- User says "onboard to this repo", "summarize project structure", "how does this work?", "repo onboarding".
- Architecture mapping and codebase orientation needed prior to executing large tasks.

## Instructions

1. **Root Survey** (`documentation-writer`): Inspect root directory contents. Identify configuration manifests (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `docker-compose.yml`) using **[Onboarding Playbook](references/onboarding-playbook.md)**.
2. **Tech Stack Identification** (`software-architect`): Read primary manifests. Identify programming languages, runtime versions, major frameworks, database drivers, and build tooling.
3. **Source Code Mapping** (`software-architect`): Inspect core source directories (`src/`, `app/`, `lib/`, `packages/`). Map internal folder structure and organizational hierarchy.
4. **Entry Point Identification** (`debugger`): Search for execution roots:
   - Client: `main.tsx`, `index.tsx`, `app/layout.tsx`, or `index.html`.
   - Server: `listen()`, `export default app`, `serve()`, `main()`.
5. **Data Flow & Logic Analysis** (`debugger`): Read 1-2 core files (central router, state management store, main service) to trace request lifecycle and state flow.
6. **Gap & Health Analysis** (`planner`): Identify missing documentation, test suite gaps, unpinned dependencies, or environment configuration omissions.
7. **Summary Generation** (`documentation-writer`): Synthesize findings into the standard Output Format.

## Output Format

### Repository Overview: {Repo Name}

**Tech Stack**
- **Core Runtime & Language**: {e.g. Node.js 20, TypeScript 5.4}
- **Framework**: {e.g. Next.js 14 (App Router) / Express}
- **Database & Persistence**: {e.g. PostgreSQL with Prisma ORM}
- **State & UI**: {e.g. Tailwind CSS, Zustand, React Query}
- **Testing**: {e.g. Vitest, Playwright}

**Directory Structure**
```text
{Visual representation of directory tree}
```

**Entry Points**
- **Frontend**: `{Path to main client entry}`
- **Backend / API**: `{Path to main server entry}`

**Developer Context & Scripts**
- **Development**: `{Command, e.g. npm run dev}`
- **Test**: `{Command, e.g. npm test}`
- **Build**: `{Command, e.g. npm run build}`
- **Architecture Pattern**: {e.g. Feature-based modular, Hexagonal, MVC}

**Next Steps & Recommended Focus**
- [ ] Review environment variables in `.env.example`
- [ ] Run test suite to verify baseline stability
- [ ] Address identified documentation or architecture gaps

## Examples

**Input:** "Onboard to this repo and explain the architecture."
**Expected Action:**
1. List root directory files to identify manifest (`package.json`, `pnpm-workspace.yaml`).
2. Read `package.json` to extract dependencies (React, Vite, Tailwind).
3. Inspect `src/` to map directories (`components/`, `hooks/`, `services/`).
4. Locate entry points in `src/main.tsx` and `src/App.tsx`.
5. Trace global state setup in `src/stores/`.
6. Output structured overview table, directory tree, and developer context.

## Resources

- [Onboarding Playbook](references/onboarding-playbook.md) — Ecosystem manifest matrix, entry point heuristics, and architecture diagnostics.

## Related Skills

- **[project-organization](../project-organization/SKILL.md)** — Folder structures and architectural conventions.
- **[clean-code](../clean-code/SKILL.md)** — Codebase quality and readability review.
- **[plan-writing](../plan-writing/SKILL.md)** — Task planning for discovered gaps and technical debt.

