---
name: web-security
description: Secure modern web apps against OWASP Top 10 — injection, XSS, CSRF, broken access control, auth failures, SSRF, vulnerable dependencies. Covers front-end vs back-end responsibility, secure defaults (TLS/HSTS, CSP, HttpOnly cookies, JWT), and DevSecOps scanning (SAST/DAST, dependency audit, threat modeling, pen testing). Triggers: "web security", "secure my app", "OWASP", "XSS", "SQL injection", "CSRF", "SSRF", "broken access control", "BOLA", "session hijacking", "CSP header", "secure cookies", "harden web app", "security scan", "vulnerability scan".
version: 1.0.0
---

# Web Security Skill

## When to Use

- Harden a web application against common attacks (OWASP Top 10).
- Review front-end or back-end code for security vulnerabilities.
- Fix a specific class of attack: XSS, SQLi, CSRF, SSRF, broken access control, auth failure.
- Set up secure defaults: TLS/HSTS, CSP, cookie flags, secrets management, JWT validation.
- Design or audit a DevSecOps scanning pipeline (SAST, DAST, dependency audit).

## Core Principle

**Front-end guides the user. Back-end protects the business.** UI can hide admin buttons or gate routes for UX, but attackers bypass the UI — modify local storage, replay requests, call APIs directly via Postman/curl. Therefore **all validation, authorization, and business-logic enforcement lives on the back-end.** Never trust the client.

## Instructions

1. **Classify the request.** Match to attack class (§ below) or to a defense layer (secure defaults, scanning). Ask user for stack (framework, DB, auth method) if unknown — remediation is stack-specific.
2. **Locate untrusted boundaries.** Identify where external input enters: request bodies, query params, headers, cookies, uploaded files, third-party responses. Every boundary needs validation + authorization.
3. **Diagnose the specific vuln.** Read the relevant code. Confirm the flaw exists before changing it — do not blindly apply mitigations. Reference [references/vulnerabilities.md](references/vulnerabilities.md) for per-attack detection + fix.
4. **Apply the fix at the correct layer.** Prefer framework-native, well-audited primitives (ORM parameterization, framework CSRF middleware, `helmet`) over hand-rolled crypto or escaping.
5. **Enforce secure defaults.** Verify TLS/HSTS, CSP, `HttpOnly`/`Secure`/`SameSite` cookies, no secrets in front-end, correct JWT validation. See [references/secure-defaults.md](references/secure-defaults.md).
6. **Add server-side authorization checks.** For every object access, verify the authenticated user owns/may access that resource (defeats BOLA/IDOR). Do not rely on unguessable IDs alone.
7. **Wire up scanning.** Recommend SAST in CI, DAST against staging, dependency audit per build, centralized security logging. See [references/scanning-devsecops.md](references/scanning-devsecops.md).
8. **Verify.** Re-check the fix against the attack it defends. Note residual risk. Never claim "secure" — claim "mitigates X".

## Key Attack Classes

| # | Attack | One-line defense |
|---|--------|------------------|
| 1 | Injection (SQL/Command/Code) | Parameterized statements/ORM; validate input; least-privilege DB user |
| 2 | XSS (Stored/Reflected/DOM) | Escape dynamic content; strict CSP; avoid `dangerouslySetInnerHTML`/`innerHTML` |
| 3 | CSRF | `SameSite` cookies + anti-CSRF tokens; `GET` never mutates state |
| 4 | Broken Access Control / BOLA | Server-side ownership checks; random UUIDs, not sequential IDs |
| 5 | Auth failure / session hijack | `HttpOnly`+`Secure` cookies (not `localStorage`); rate limit; bcrypt+salt; MFA; generic errors |
| 6 | SSRF | Input allowlist for outbound URLs; network segmentation |
| 7 | Vulnerable dependencies / supply chain | SRI hashes for external scripts; SBOM + `npm audit`; routine updates |

Full detection + remediation per class: [references/vulnerabilities.md](references/vulnerabilities.md).

## Output Format

Present findings as:

```
### Security Review: {target}

**Attack surface:** {boundaries identified}

**Findings:**
1. [SEVERITY] {vuln class} — {file:line}
   - Risk: {what attacker gains}
   - Fix: {specific remediation}

**Secure defaults status:**
- [ ] TLS/HSTS   [ ] CSP   [ ] Cookie flags   [ ] Secrets off client   [ ] JWT validated

**Residual risk:** {what remains after fixes}
```

For a single-vuln fix, skip the table and state: vuln → risk → fix (code) → what it mitigates.

## Examples

**Input:** "My Express route `/orders/:id` returns any order by ID. Is that safe?"

**Expected Action:**
1. Classify → Broken Access Control / BOLA (attack #4).
2. Read the handler; confirm no ownership check exists.
3. Report:
```
### Security Review: GET /orders/:id

**Findings:**
1. [HIGH] BOLA — routes/orders.js:24
   - Risk: any authenticated user reads any order by incrementing id (/orders/101).
   - Fix: after fetch, verify `order.userId === req.user.id`; 404 (not 403) on mismatch to avoid enumeration. Switch order IDs to UUIDs.

**Residual risk:** admin override path still needs its own role check.
```

**Input:** "Add security headers to my app."

**Expected Action:** Recommend `helmet` (Express) or equivalent; enable HSTS, a strict CSP disabling inline JS, `X-Content-Type-Options`, referrer policy; strip `Server`/`X-Powered-By`. Point to [references/secure-defaults.md](references/secure-defaults.md) for config.

## Resources

- [references/vulnerabilities.md](references/vulnerabilities.md) — Per-attack detection + remediation.
- [references/secure-defaults.md](references/secure-defaults.md) — TLS/HSTS, CSP, cookies, secrets, JWT.
- [references/scanning-devsecops.md](references/scanning-devsecops.md) — SAST/DAST, dependency audit, threat modeling, logging, pen testing.
- [assets/security-checklist.md](assets/security-checklist.md) — Copy-paste audit checklist.
- [scripts/security-headers.js](scripts/security-headers.js) — Express `helmet` + CSP starter.
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Related Skills

- **[api-hardening](../api-hardening/SKILL.md)** — API-layer rate limiting, CORS, sanitization, helmet headers.
- **[auth-patterns](../auth-patterns/SKILL.md)** — JWT, OAuth2, RBAC, sessions, refresh tokens.
- **[api-patterns](../api-patterns/SKILL.md)** — RESTful design; keeps `GET` side-effect-free (CSRF-relevant).
- **[deployment-ops](../deployment-ops/SKILL.md)** — CI/CD hooks for SAST/DAST, monitoring, secrets in prod.
