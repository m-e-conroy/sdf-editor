---
name: nodejs-best-practices
description: Node.js development principles, framework selection, async patterns, security, and architecture. Use this skill when the user asks to build a Node.js application, select a backend framework, structure a Node API, or improve Node.js performance/security.
---

# Node.js Best Practices

Purpose: informed, modern decisions for Node.js development.

## When to Use

Trigger:
- Select frameworks (Hono, Fastify, NestJS).
- Structure backends/APIs.
- Error handling, validation, security.
- Async optimization (CPU/IO-bound).
- Testing strategy/organization.

## Instructions

1. **Framework Choice**: Avoid Express default. Use Hono (Edge/Serverless), Fastify (High-perf API), NestJS (Enterprise). Use Express for legacy only.
2. **Modern Runtime**: Default to ESM (`import`/`export`). Native TS (`--experimental-strip-types`). Consider Bun (perf) or Deno (security).
3. **Layered Architecture**: Split into Controller (HTTP/Validation), Service (Biz logic), Repository (Data). Simplify only for scripts.
4. **Centralized Error Handling**: Custom classes. Top-level middleware catch. Sanitized responses. Local stack traces.
5. **Async Mastery**: `async/await` (seq), `Promise.all` (parallel), `Promise.allSettled` (partial fail). No sync methods in prod. Worker threads for CPU work.
6. **Boundary Validation**: Use Zod, Valibot, ArkType early. Never trust external input.
7. **Security**: Param queries, password hashing (argon2), JWT verification, rate limiting, Helmet, secure env vars.
8. **Test Strategy**: Critical paths + edge cases. `node:test` (unit), Supertest (integration), Playwright (E2E).
9. **Anti-Patterns**: No Express on Edge. No biz logic in controllers. Do not block the event loop.

## Output Format

1. **Rationale**: Why framework/structure chosen.
2. **Security/Validation**: Note Zod usage/security steps.
3. **Code**: Modern code with layered architecture.
4. **Anti-Pattern Check**: Mistake avoided (e.g. "used Hono not Express for cold starts").

## Examples

**Input:** "Create an endpoint to register a new user."
**Expected Action**:
1. Choose Fastify.
2. Zod schema for email/password.
3. Controller for HTTP/Validation.
4. Service for argon2 hashing.
5. Repository for parameterized DB save.
6. Return code with layered separation notes.

## Resources

- [Node.js Official Docs](https://nodejs.org/docs/latest/api/)
- [Node.js Best Practices Repo](https://github.com/goldbergyoni/nodebestpractices)
- [The Node.js Way](https://thenodeway.io/)

## Related Skills

- **[project-organization](../project-organization/SKILL.md)**: Structure and modules.
- **[testing-patterns](../testing-patterns/SKILL.md)**: Backend test suites.
