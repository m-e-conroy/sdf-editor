# Web Security Audit Checklist

Copy into a PR/issue and check off. Grouped by concern.

## Input & Injection
- [ ] All DB queries parameterized / via ORM — no string concatenation
- [ ] User input validated against an allowlist at every boundary
- [ ] No `eval`/`Function`/dynamic `require`; OS commands use arg arrays, not shells
- [ ] DB user runs with least privilege (no DDL in runtime)

## Output & XSS
- [ ] Dynamic content auto-escaped; no unguarded `innerHTML`/`dangerouslySetInnerHTML`/`v-html`
- [ ] Rich HTML sanitized with a vetted lib (DOMPurify)
- [ ] Strict CSP set, inline JS disabled

## CSRF
- [ ] Session cookies use `SameSite=Strict`/`Lax`
- [ ] Anti-CSRF tokens on all state-changing requests
- [ ] `GET` requests never mutate state

## Access Control
- [ ] Server-side ownership check on every object access (no BOLA/IDOR)
- [ ] Authorization enforced back-end, not just UI
- [ ] Resource IDs are UUIDs, not sequential integers
- [ ] Unauthorized access returns 404 (no enumeration)

## Authentication & Sessions
- [ ] Tokens in `HttpOnly`+`Secure` cookies, never `localStorage`
- [ ] Rate limiting + bot protection on login/signup/reset
- [ ] Passwords hashed with bcrypt/argon2 + salt
- [ ] MFA available/enforced for sensitive accounts
- [ ] Generic auth errors — no user enumeration

## SSRF & Outbound
- [ ] User-supplied URLs validated against an allowlist
- [ ] Private/metadata IP ranges blocked
- [ ] Outbound network access segmented by firewall

## Dependencies & Supply Chain
- [ ] `npm audit` / Dependency-Check runs each build, blocks on CVE
- [ ] External scripts use SRI hashes
- [ ] SBOM maintained; deps updated routinely

## Transport & Headers
- [ ] HTTPS everywhere; HSTS enabled
- [ ] `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` set
- [ ] `Server`/`X-Powered-By` stripped
- [ ] Stack traces disabled in production

## Secrets & JWT
- [ ] No secrets hardcoded or in front-end env vars
- [ ] JWT signature + `iss` + `aud` + `exp` fully validated; asymmetric keys
- [ ] No sensitive data in JWT payload

## Pipeline
- [ ] SAST in CI, DAST against staging
- [ ] Threat model documented (ASVS)
- [ ] Security logging + alerting in production
