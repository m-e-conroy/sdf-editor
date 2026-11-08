---
name: edge-serverless
description: Edge computing and serverless architecture. Middleware, Cloudflare Workers, Vercel Edge, Lambda, cold-start optimization. Triggers: "edge computing", "serverless", "lambda", "cloudflare workers", "edge runtime", "middleware", "cold start", "hono".
version: 1.0.0
---

# Edge & Serverless Skill

> **Purpose**: Architect globally distributed, scalable, cost-effective backend systems.

## When to Use

- Deploy APIs with ultra-low latency across global regions (Edge).
- Build event-driven backends without server management (Serverless).
- Implement middleware for auth, geofencing, or A/B testing at edge.
- Optimize for unpredictable traffic spikes.
- Integrate with serverless databases (Neon, Turso, Supabase).

## Instructions

### 1. Edge Runtimes (WinterCG)
Edge runtimes (Cloudflare, Vercel) are not full Node.js; they run a subset of Web APIs.
- **Constraints**: No `fs` module, no native C++ modules, strict memory limits (typically 128MB).
- **Frameworks**: Use Hono (lightweight, ultra-fast) or Next.js Edge runtime.
- **WinterCG**: Ensure code uses `Fetch API`, `Streams`, and `Web Crypto` rather than Node-specific modules.

### 2. Cold Start Optimization
Serverless functions sleep when idle. First request after idle incurs delay (cold start).
- **Strategy**: Keep bundle size small. Minimize imports. Avoid heavy initialization logic outside handler.
- **Edge Advantage**: Edge functions (V8 Isolates) have near-zero cold starts compared to traditional containers (AWS Lambda).

### 3. Middleware Patterns
Execute logic *before* hitting primary origin.
- **Auth**: Verify JWTs at the edge to reject invalid requests early.
- **Geofencing**: Redirect users or block traffic using `cf-ipcountry` or similar headers.
- **Personalization**: Rewrite URLs for A/B testing without DB round-trips.

### 4. Database Interaction
TCP connections (Postgres/MySQL) are too heavy for serverless models.
- **HTTP/WebSockets**: Use HTTP-based drivers (Neon Serverless, Turso) to bypass connection pooling issues.
- **Connection Limits**: Architecture must handle thousands of concurrent short-lived connections.

### 5. Deployment & Environment
- **Env Vars**: Use platform secret management (Vercel Env, Cloudflare Secrets).
- **Versioning**: Leverage Preview Deployments for safe integration testing.

## Output Format

Propose Edge/Serverless Design:

```markdown
### Infrastructure Design: {Project}

**1. Platform & Runtime**
- (Cloudflare Workers, Vercel Edge, AWS Lambda)

**2. Architecture Pattern**
- (Middleware, API-only, Event-driven)

**3. Data Layer**
- (Serverless Postgre, SQLite at Edge, Redis/Upstash)

**4. Performance Strategy**
- (Cold-start mitigation, global caching)

**5. Scaling Limits**
- (Concurrency, memory, execution timeouts)
```

## Related Skills

- **[backend-developer](../agents/backend-developer.md)**: Logic implementation.
- **[api-patterns](../api-patterns/SKILL.md)**: Designing for statelessness.
- **[database-design](../database-design/SKILL.md)**: Serverless-friendly schemas.
- **[browser-apis](../browser-apis/SKILL.md)**: Web APIs shared by Edge runtimes.
