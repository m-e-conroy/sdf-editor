# Vulnerabilities: Detection & Remediation

Per-attack playbook. For each: **what to look for** in code, then **how to fix**.

---

## 1. Injection (SQL / Command / Code)

**The threat:** Untrusted input processed as code → unauthorized DB access (SQLi), OS command execution, or RCE.

**Detection — look for:**
- String concatenation/interpolation building queries: `"SELECT * FROM users WHERE id = " + id`, template literals in raw SQL.
- `child_process.exec(userInput)`, `eval()`, `Function()`, dynamic `require()`.
- ORM "raw" escape hatches passing unparameterized strings.

**Fix:**
- **Parameterized statements / ORM.** Bind input as data, never concatenate.
  ```js
  // BAD
  db.query(`SELECT * FROM users WHERE email = '${email}'`);
  // GOOD — parameterized
  db.query('SELECT * FROM users WHERE email = $1', [email]);
  ```
- **Validate + sanitize** at the boundary. Allowlist expected shape/type; escape control chars.
- **Least privilege DB user.** App account gets only needed grants — deny `DROP`/DDL in normal runtime.
- For OS commands: avoid shells; use `execFile` with an argument array, never string interpolation.

---

## 2. Cross-Site Scripting (XSS)

**The threat:** Injected JS runs in a victim's browser → cookie theft, session hijack, data scrape. Variants: **Stored** (persisted in DB), **Reflected** (echoed from URL param), **DOM-based** (client writes untrusted data into DOM).

**Detection — look for:**
- `element.innerHTML = userData`, `document.write`, jQuery `.html(userData)`.
- React `dangerouslySetInnerHTML`, Vue `v-html`, Angular `[innerHTML]` with untrusted input.
- Reflecting query params into the page without escaping.

**Fix:**
- **Escape dynamic content** — encode HTML control chars (`< > & " '`) before render. Frameworks auto-escape `{{ }}`/`{}` bindings; keep data in those, avoid raw-HTML sinks.
- **Content Security Policy (CSP).** Strong header restricts script sources and blocks inline JS — heavily mitigates impact even if a sink is missed. See secure-defaults.md.
- Sanitize rich HTML with a vetted library (DOMPurify) when raw HTML is unavoidable.
- Prefer `textContent` over `innerHTML`.

---

## 3. Cross-Site Request Forgery (CSRF)

**The threat:** Attacker tricks an authenticated user into firing an unwanted state-changing request using their live session (transfer funds, change email).

**Detection — look for:**
- State-changing endpoints relying only on cookie auth, no anti-CSRF token.
- `GET` requests that mutate state.
- Cookies without a `SameSite` attribute.

**Fix:**
- **`SameSite=Strict` or `Lax`** on session cookies — browser withholds them on cross-site requests.
- **Anti-CSRF tokens** — unique, unpredictable, per-session/per-form; required on POST/PUT/PATCH/DELETE. Use framework middleware (`csurf`, Django/Rails built-ins).
- **RESTful discipline** — `GET` only reads; never changes server state.

---

## 4. Broken Access Control & Object-Level Authorization (BOLA / IDOR)

**The threat:** Manipulating an identifier (`/orders/100` → `/orders/101`) to read/modify another user's data.

**Detection — look for:**
- Handlers that fetch by ID from the URL with no ownership check.
- Authorization enforced only in the UI (hidden buttons, gated routes) with no server check.
- Sequential integer IDs exposed in URLs/APIs.

**Fix:**
- **Server-side ownership check** — verify the authenticated user (from a trusted back-end session) may access the resource, on every request.
  ```js
  const order = await Order.findById(id);
  if (!order || order.userId !== req.user.id) return res.sendStatus(404);
  ```
- Return **404 (not 403)** on unauthorized to avoid confirming the resource exists (enumeration).
- **Unpredictable IDs** — UUID/GUID instead of sequential integers (defense in depth, not a substitute for the check).

---

## 5. Authentication Failures & Session Hijacking

**The threat:** Weak login → brute force, credential stuffing, session/cookie theft (via XSS or MITM), account takeover.

**Detection — look for:**
- JWT/session tokens stored in `localStorage`/`sessionStorage`.
- No rate limiting on login/signup/reset endpoints.
- Plaintext or weakly-hashed (MD5/SHA1) passwords.
- Specific error messages ("email not found") enabling user enumeration.
- Cookies missing `HttpOnly`/`Secure`.

**Fix:**
- **Token storage:** `HttpOnly` + `Secure` cookies — JS can't read them, sent only over HTTPS. Never `localStorage`.
- **Rate limiting + bot protection** on login/signup/reset (Cloudflare Turnstile, CAPTCHA, per-IP/per-account throttles).
- **bcrypt (or argon2/scrypt) + salt** for password hashing.
- **MFA** enforced for sensitive accounts.
- **Generic errors** — "Incorrect username or password" for both cases; identical timing/responses on password reset.

---

## 6. Server-Side Request Forgery (SSRF)

**The threat:** App is coerced into making requests to internal systems, DBs, or cloud metadata endpoints — bypassing firewalls.

**Detection — look for:**
- Server fetching a user-supplied URL (webhooks, image proxies, "import from URL", PDF renderers).
- No validation on the target host/scheme.

**Fix:**
- **Allowlist** permitted domains/URLs; validate scheme (`https` only) and resolved IP. Block private/link-local ranges (`169.254.169.254`, `10.x`, `127.x`, `192.168.x`).
- **Network segmentation** — restrict the server's outbound access via firewall to only required external APIs.
- Disable following redirects to unvetted hosts.

---

## 7. Vulnerable Dependencies & Supply Chain

**The threat:** Outdated third-party libs with known CVEs; compromised CDNs serving tampered scripts.

**Detection — look for:**
- Stale `package-lock.json`; no automated audit in CI.
- External `<script>`/`<link>` without integrity hashes.
- No inventory of components.

**Fix:**
- **Subresource Integrity (SRI):** add `integrity="sha384-..."` + `crossorigin` to external `<script>`/`<link>` — browser rejects modified files.
- **SBOM + audit:** maintain a component inventory (OWASP Dependency-Track); run `npm audit` / `OWASP Dependency-Check` every build; patch routinely.
- Pin versions; review transitive deps.
