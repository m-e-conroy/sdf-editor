# Repository Onboarding Playbook & Discovery Matrix

This guide provides rapid diagnostic heuristics for surveying codebases, identifying tech stacks, locating entry points, and assessing architectural patterns.

---

## 1. Ecosystem & Manifest Matrix

Locate root configuration manifests to determine primary runtime and dependencies:

| Ecosystem | Manifest File | Lockfile | Key Dependencies to Inspect |
|:---|:---|:---|:---|
| **Node.js / TS** | `package.json` | `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` | Framework (`react`, `next`, `vue`, `express`, `hono`), ORM (`prisma`, `drizzle`, `typeorm`), Bundler (`vite`, `webpack`) |
| **Python** | `pyproject.toml`, `requirements.txt`, `Pipfile` | `poetry.lock`, `Pipfile.lock` | Framework (`fastapi`, `django`, `flask`), ORM (`sqlalchemy`, `tortoise`), Testing (`pytest`) |
| **Rust** | `Cargo.toml` | `Cargo.lock` | Web (`axum`, `actix-web`), Async runtime (`tokio`), DB (`sqlx`, `diesel`) |
| **Go** | `go.mod` | `go.sum` | Web (`gin`, `fiber`, `echo`), DB (`gorm`, `pgx`) |
| **Java / Kotlin**| `pom.xml`, `build.gradle`, `build.gradle.kts` | Maven / Gradle wrapper | Framework (`spring-boot`, `micronaut`, `quarkus`) |
| **PHP** | `composer.json` | `composer.lock` | Framework (`laravel/framework`, `symfony`) |

---

## 2. Entry Point Identification Patterns

Search for execution root signatures depending on application type:

### Web Frontends
- **Vite / SPA**: `index.html` → `src/main.tsx` or `src/index.tsx`
- **Next.js (App Router)**: `app/layout.tsx` + `app/page.tsx`
- **Next.js (Pages Router)**: `pages/_app.tsx` + `pages/index.tsx`
- **Vue / Nuxt**: `src/main.ts` or `app.vue`

### Server & APIs
- **Node.js**: Look for `listen()`, `export default app`, `serve()` in `src/index.ts`, `src/server.ts`, or `src/app.ts`.
- **FastAPI / Flask**: `app = FastAPI()` or `app = Flask(__name__)` in `main.py` or `app.py`.
- **Go**: `func main()` in `cmd/server/main.go` or `main.go`.
- **Rust**: `fn main()` in `src/main.rs`.

---

## 3. Architecture Pattern Recognition

- **Clean / Hexagonal Architecture**: Presence of `domain/`, `application/`, `infrastructure/`, and `adapters/` or `ports/`.
- **Feature-First / Domain-Driven**: Code organized by feature modules (e.g. `features/auth/`, `features/billing/`), each with its own components, hooks, and services.
- **Layer-First (MVC)**: Code organized by technical concerns (e.g. `controllers/`, `models/`, `views/`, `routes/`, `services/`).
- **Monorepo**: Look for `pnpm-workspace.yaml`, `lerna.json`, `turbo.json`, `nx.json`, or top-level `packages/` / `apps/` folders.

---

## 4. Rapid Health & Gap Checklist

- [ ] Does a `.env.example` exist?
- [ ] Are test suites defined and runnable (`test` script in manifest)?
- [ ] Is there a CI/CD workflow defined in `.github/workflows/`?
- [ ] Are linters and typecheck scripts configured?
- [ ] Is there architectural documentation or an Architecture Decision Record (`ADR/`) directory?

