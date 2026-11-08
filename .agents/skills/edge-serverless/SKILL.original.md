---
name: edge-serverless
description: Edge computing and serverless architecture. Middleware, Cloudflare Workers, Vercel Edge, Lambda, cold-start optimization. Triggers: "edge computing", "serverless", "lambda", "cloudflare workers", "edge runtime", "middleware", "cold start", "hono".
version: 1.0.0
---

# Edge & Serverless Skill

> **Purpose**: Architect globally distributed, scalable, and cost-effective backend systems.

## When to Use

- Deploying APIs with low latency across global regions (Edge).
- Building event-driven backends without server management (Serverless).
- Implementing middleware for auth, geofencing, or A/B testing at the edge.
- Optimizing for unpredictable traffic spikes.
- Integrating with serverless databases (Neon, Turso, Supabase).

## Instructions

Apply distributed computing principles:

### 1. Edge Runtimes (WinterCG)
Edge runtimes (Cloudflare, Vercel) are NOT full Node.js. They use a subset of Web APIs.
- **Constraints**: No `fs` module, no native C++ modules, strict memory limits (128MB).
- **Frameworks**: Use Hono (lightweight, fast) or Next.js Edge runtime.
- **WinterCG**: Ensure code uses `Fetch API`, `Streams`, and `Web Crypto` rather than Node-specific modules.

### 2. Cold Start Optimization
Serverless functions "sleep" when idle. The first request after a gap incurs a delay (cold start).
- **Strategy**: Keep bundle size small. Minimize imports. Avoid heavy initialization logic outside the handler.
- **Edge Advantage**: Edge functions (V8 Isolates) have near-zero cold starts compared to traditional containers (Lambda).

### 3. Middleware Patterns
Execute logic *before* reaching the main origin.
- **Auth**: Verify JWTs at the edge to reject invalid requests early.
- **Geofencing**: Redirect users or block traffic based on `cf-ipcountry` or similar headers.
- **Personalization**: Rewrite URLs for A/B tests without a round-trip to the DB.

### 4. Database Interaction
Traditional TCP connections (PostgreSQL/MySQL) are heavy for serverless.
- **HTTP/WebSockets**: Use HTTP-based drivers (Neon Serverless, Turso) to avoid connection pooling issues.
- **Connection Limits**: Ensure the architecture handles thousands of concurrent short-lived connections.

### 5. Deployment & Environment
- **Env Vars**: Use platform-specific secrets management (Vercel Env, Cloudflare Secrets).
- **Versioning**: Leverage "Preview Deployments" for safe testing.

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
- **[api-patterns](../skills/api-patterns/SKILL.md)**: Designing for statelessness.
- **[database-design](../skills/database-design/SKILL.md)**: Serverless-friendly schemas.
- **[browser-apis](../skills/browser-apis/SKILL.md)**: Using Web APIs shared by Edge runtimes.
