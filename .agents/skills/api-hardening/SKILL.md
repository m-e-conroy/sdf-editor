---
name: api-hardening
description: Proactive API security, rate limiting, sanitization, and OWASP hardening. Triggers: "harden api", "rate limiting", "cors setup", "sanitize input", "helmet headers", "security audit".
version: 1.0.0
---

# API Hardening Skill

## When to Use

- Secure a public-facing API.
- Implement defense-in-depth for backend services.
- Pass security audits and penetration tests.

## Instructions

### 1. Headers (Helmet)
- Use `Helmet` to set security HTTP headers (CSP, HSTS, X-Frame-Options).
- Disable `X-Powered-By` header to hide tech stack.

### 2. Rate Limiting
- Apply `express-rate-limit` to sensitive endpoints (Login, Register, Password Reset).
- Use Redis-backed store for distributed rate limiting.

### 3. Input Validation & Sanitization
- Use `Zod` or `Joi` for strict schema validation.
- Sanitize HTML inputs to prevent XSS.
- Use parameterized queries (ORM/Prepared Statements) to prevent SQLi.

### 4. CORS
- Whitelist specific origins. Avoid wildcard `origin: '*'`.
- Configure `allowedHeaders` and `credentials: true` only when necessary.

## Output Format

Propose Hardening Plan:

```markdown
### Security Hardening: {API}

**1. Headers**
- (Helmet configuration details)

**2. Rate Limiting**
- (Limits per window, Redis setup)

**3. Validation**
- (Zod schema strategy)

**4. CORS Policy**
- (Whitelisted origins)
```

## Related Skills

- **[auth-patterns](../auth-patterns/SKILL.md)**: Token and session security.
- **[redis-caching](../redis-caching/SKILL.md)**: Store for rate limiters.
