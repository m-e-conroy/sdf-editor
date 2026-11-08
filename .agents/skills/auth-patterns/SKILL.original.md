---
name: auth-patterns
description: Authentication and Authorization patterns. JWT, OAuth2, RBAC, sessions, refresh tokens. Triggers: "auth", "jwt", "oauth", "login", "rbac", "permissions", "sessions", "authentication".
version: 1.0.0
---

# Auth Patterns Skill

> **Purpose**: Implement secure, scalable authentication and authorization systems.

## When to Use

- Implementing user login/registration.
- Designing API security (JWT, API Keys).
- Integrating third-party login (Google, GitHub, OAuth2).
- Managing user roles and permissions (RBAC).
- Handling session persistence and token refresh logic.

## Instructions

Apply these security patterns based on architecture:

### 1. Token-Based Auth (JWT)
Best for stateless APIs and mobile/SPAs.
- **Access Token**: Short-lived (15m), stored in memory or secure cookie.
- **Refresh Token**: Long-lived (7d), stored in `HttpOnly`, `SameSite=Strict` cookie.
- **Flow**: Client sends Access Token in `Authorization: Bearer` header. On expiry, client calls `/refresh` endpoint with the Refresh Token to get a new pair.

### 2. Session-Based Auth
Best for monolithic web apps or Server-Side Rendering (SSR).
- **Session Store**: Redis or Database.
- **Cookie**: Secure, HttpOnly cookie containing `sessionId`.
- **Flow**: Server verifies `sessionId` against store on every request.

### 3. OAuth2 & OpenID Connect (OIDC)
Best for third-party integration and Single Sign-On (SSO).
- **Grant Types**: Use `Authorization Code Flow with PKCE` for SPAs and mobile apps.
- **Identity Provider**: Integration with Clerk, Auth0, Supabase Auth, or Kinde.

### 4. Authorization (RBAC / ABAC)
- **RBAC (Role-Based)**: `User` -> `Roles` (Admin, Editor, User) -> `Permissions`. Simple/standard.
- **ABAC (Attribute-Based)**: Logic based on context (e.g., "User can edit post IF User == Author"). Flexible/complex.

### 5. Security Best Practices
- **Password Hashing**: Use Argon2 or bcrypt. Never store plain text.
- **CSRF Protection**: Required for session/cookie auth.
- **Rate Limiting**: Protect login/refresh endpoints from brute force.

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
- (Custom implementation, Auth0, Supabase, etc.)

**5. Security Headers**
- (CSP, HSTS, CSRF approach)
```

## Related Skills

- **[api-patterns](../api-patterns/SKILL.md)**: Securing endpoints and headers.
- **[database-design](../database-design/SKILL.md)**: Schema for users, roles, and sessions.
- **[backend-developer](../agents/backend-developer.md)**: Implementation of auth middleware.
