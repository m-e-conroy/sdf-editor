---
name: openapi-contracts
description: Generating and maintaining OpenAPI (Swagger) specifications for type-safe API contracts. Triggers: "openapi", "swagger", "api contract", "swagger-ui", "redoc".
version: 1.0.0
---

# OpenAPI Contracts Skill

## When to Use

- Define stable interfaces between Frontend and Backend teams/agents.
- Generate client-side SDKs or types from backend specification.
- Provide interactive API documentation for consumers.

## Instructions

### 1. Specification (YAML/JSON)
- Use OpenAPI 3.x.
- Define `components/schemas` for reusable data structures.
- Use `tags` to group endpoints logically.

### 2. Auto-Generation
- **Code-to-Spec**: Generate OpenAPI from code (e.g., `tsoa` for Node, `fastapi` for Python).
- **Spec-to-Code**: Generate client types/hooks from spec file using `openapi-typescript` or `swagger-codegen`.

### 3. Documentation
- Host interactive docs using `Swagger UI` or `Redoc`.
- Populated `description` and `example` fields for every parameter/schema.

## Output Format

Propose API Contract:

```markdown
### API Contract: {Endpoint}

**1. Method & Path**
- `POST /v1/users`

**2. Request Schema**
- (Zod/OpenAPI object definition)

**3. Success Response (200/201)**
- (Response body structure)

**4. Error Responses (400/401/500)**
- (Error codes and messages)
```

## Related Skills

- **[api-patterns](../api-patterns/SKILL.md)**: Design principles for the endpoints.
- **[typescript](../typescript/SKILL.md)**: Type generation from the contract.
