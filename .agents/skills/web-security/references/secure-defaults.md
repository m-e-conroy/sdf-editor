# Secure Defaults

Baseline hardening every web app should ship with, independent of specific attacks.

---

## Transport: TLS / HTTPS / HSTS

- Serve **all** active and passive resources over HTTPS — mixed content breaks the trust chain.
- Enforce with **HTTP Strict Transport Security (HSTS)**:
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  ```
- Redirect HTTP → HTTPS at the edge. Consider HSTS preload list submission.

---

## Content Security Policy (CSP)

Restricts where resources load from; the strongest structural XSS mitigation.

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';           /* no 'unsafe-inline' — blocks inline JS */
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';      /* clickjacking defense */
```

- Avoid `'unsafe-inline'` / `'unsafe-eval'`. Use nonces or hashes for required inline scripts.
- Roll out with `Content-Security-Policy-Report-Only` + a report endpoint first, then enforce.

---

## Cookies

For session/auth cookies, always:

```
Set-Cookie: session=...; HttpOnly; Secure; SameSite=Strict; Path=/
```

- `HttpOnly` — JS cannot read it (defeats XSS token theft).
- `Secure` — sent only over HTTPS.
- `SameSite=Strict` (or `Lax` if cross-site top-level navigation needed) — CSRF mitigation.
- **Never** store JWTs/session tokens in `localStorage`/`sessionStorage`.

---

## Secrets Management

- **Never hardcode** DB passwords, private API keys, or JWT secrets — and never put them in front-end env vars (`NEXT_PUBLIC_*`, bundled config). The bundle ships to every user.
- Front-end holds only **public** keys. Sensitive secrets stay on the back-end (env vars injected at runtime, secret managers: Vault, AWS/GCP Secrets Manager).
- Rotate on suspicion of exposure. Scan git history for leaked secrets.

---

## JWT Security

- **Fully validate** signature **and** `iss` (issuer) **and** `aud` (audience) **and** `exp`.
- JWTs are **encoded, not encrypted** — never put sensitive business data in the payload.
- Prefer **asymmetric** signing (RS256/ES256); keep private keys centrally managed. Reject `alg: none` and algorithm-confusion.
- Short-lived access tokens + rotating refresh tokens.

---

## Prevent Information Leaks

- Strip telltale headers: `Server`, `X-Powered-By`.
- Disable verbose error output / stack traces in production — return generic errors to clients, log details server-side.
- Add `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and a restrictive `Permissions-Policy`.

---

## Quick Header Set (recommended)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; object-src 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

Use `helmet` (Express) or your framework's equivalent — see [../scripts/security-headers.js](../scripts/security-headers.js).
