---
name: auth-patterns
description: Auth/Authz patterns. JWT, OAuth2, RBAC, sessions, refresh tokens. Triggers: "auth", "jwt", "oauth", "login", "rbac", "permissions", "sessions", "authentication".
version: 1.0.0
---

# Auth Patterns Skill

> **Purpose**: Secure, scalable auth/authz systems.

## When to Use

- Implement user login/registration.
- Design API security (JWT, API Keys).
- Integrate 3rd-party login (Google, GitHub, OAuth2).
- Manage user roles/permissions (RBAC).
- Handle session persistence and token refresh logic.

## Instructions

### 1. Token-Based Auth (JWT)
SPAs and mobile apps.
- **Access Token**: Short-lived (15m), store in memory or secure cookie.
- **Refresh Token**: Long-lived (7d), store in `HttpOnly`, `SameSite=Strict` cookie.
- **Flow**: Client sends Access Token in `Authorization: Bearer` header. On expiry, call `/refresh` with Refresh Token.

### 2. Session-Based Auth
Monoliths or SSR.
- **Session Store**: Redis or DB.
- **Cookie**: Secure, HttpOnly cookie with `sessionId`.
- **Flow**: Server verifies `sessionId` against store every request.

### 3. OAuth2 & OpenID Connect (OIDC)
3rd-party integration/SSO.
- **Grant Types**: Use `Authorization Code Flow with PKCE` for SPAs.
- **Identity Provider**: Clerk, Auth0, Supabase Auth, or Kinde.

### 4. Authorization (RBAC / ABAC)
- **RBAC (Role-Based)**: `User` -> `Roles` -> `Permissions`. Standard.
- **ABAC (Attribute-Based)**: Logic based on context (e.g., "Can edit if Author"). Flexible.

### 5. Security Best Practices
- **Password Hashing**: Argon2 or bcrypt. No plain text.
- **CSRF Protection**: Required for session/cookie auth.
- **Rate Limiting**: Protect login/refresh from brute force.

## Output Format

Propose Auth Architecture:

```markdown
### Auth Specification: {Project Name}

**1. Strategy**
- (JWT + Cookies, Sessions, OAuth2)

**2. Storage**
- (HttpOnly Cookies, Secure Store, Redis)

**3. Permissions Model**
- (RBAC Roles, Middleware checks)

**4. Provider**
- (Custom, Auth0, Supabase, etc.)

**5. Security Headers**
- (CSP, HSTS, CSRF approach)
```

## Related Skills

- **[api-patterns](../api-patterns/SKILL.md)**: Securing endpoints/headers.
- **[database-design](../database-design/SKILL.md)**: User/role schemas.
- **[backend-developer](../agents/backend-developer.md)**: Auth middleware.
