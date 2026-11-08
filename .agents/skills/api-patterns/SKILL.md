---
name: api-patterns
description: Professional RESTful API design principles. Use for API design, endpoints, architecture, HTTP methods, response structures, status codes.
version: 1.0.0
---

# API Patterns Skill

> **Purpose**: Professional RESTful API design.

## When to Use

- Design, build, review RESTful API.
- Create backend endpoints (naming, methods).
- Design response structures, error formats, pagination.
- Choose HTTP status codes.

## Instructions

### 1. Resource-Oriented Design

- **Nouns** for resources: `/users`, `/orders`, `/products`.
- **HTTP verbs** for actions: GET, POST, PUT, PATCH, DELETE.
- **No verbs** in URLs: ❌ `/getUsers` → ✅ `/users`.

### 2. Consistent Naming

Standard REST mapping:
- `GET    /api/v1/users`          # List users
- `POST   /api/v1/users`          # Create user
- `GET    /api/v1/users/:id`      # Get user
- `PATCH  /api/v1/users/:id`      # Update user
- `DELETE /api/v1/users/:id`      # Delete user

### 3. Versioning

- URL versioning: `/api/v1/`, `/api/v2/`.
- Header versioning: `Accept: application/vnd.api+json;version=1`.

### 4. Status Codes

- **200 OK**: Success.
- **201 Created**: Resource created.
- **204 No Content**: Success, no body.
- **400 Bad Request**: Malformed request.
- **401 Unauthorized**: Missing/invalid auth.
- **403 Forbidden**: No permissions.
- **404 Not Found**: Resource missing.
- **409 Conflict**: State conflict (duplicate).
- **422 Unprocessable Entity**: Validation errors.
- **500 Internal Server Error**: Server failure.

## Output Format

Enforce JSON structures for design/docs:

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-02-06T00:00:00Z",
    "requestId": "uuid"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [{ "field": "email", "issue": "required" }]
  }
}
```

### Pagination

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Examples

**Input:** "Design API endpoint to update user email."

**Expected Action:** `PATCH` to user resource. Return success response or 422 for invalid email.

```markdown
**Endpoint**: `PATCH /api/v1/users/:id`

**Request Body**:
\`\`\`json
{
  "email": "new.email@example.com"
}
\`\`\`

**Success Response (200 OK)**:
\`\`\`json
{
  "data": {
    "id": "123",
    "email": "new.email@example.com",
    "updatedAt": "2026-05-03T10:00:00Z"
  },
  "meta": {
    "timestamp": "2026-05-03T10:00:00Z",
    "requestId": "req-12345"
  }
}
\`\`\`

**Error Response (422 Unprocessable Entity)**:
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [{ "field": "email", "issue": "invalid_format" }]
  }
}
\`\`\`
```

## Resources

### Quick Reference

| Pattern | Example                      |
| :------ | :--------------------------- |
| List    | `GET /users`                 |
| Create  | `POST /users`                |
| Get     | `GET /users/123`             |
| Update  | `PATCH /users/123`           |
| Delete  | `DELETE /users/123`          |
| Nested  | `GET /users/123/orders`      |
| Filter  | `GET /users?status=active`   |
| Search  | `GET /users?q=john`          |
| Sort    | `GET /users?sort=-createdAt` |

- [Agent Skills Official Specification](https://agentskills.io)

## Related Skills

- **[clean-code](../clean-code/SKILL.md)**: Maintainable API handlers.
- **[database-design](../database-design/SKILL.md)**: Underlying data structures.
- **[nodejs-best-practices](../nodejs-best-practices/SKILL.md)**: Modern Node.js standards.
- **[testing-patterns](../testing-patterns/SKILL.md)**: Integration/E2E tests.
