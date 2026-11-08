---
name: graphql-architecture
description: Schema design, resolvers, and optimization (Dataloader) for GraphQL APIs. Triggers: "graphql", "apollo server", "resolvers", "sdl", "dataloader", "n+1 graphql".
version: 1.0.0
---

# GraphQL Architecture

Purpose: build robust, scalable GraphQL APIs.

## When to Use

Trigger:
- Build flexible, client-driven APIs.
- Aggregate multiple data sources into single graph.
- Reduce over-fetching and under-fetching.

## Instructions

### 1. Schema-First vs Code-First
- **Schema-First (SDL)**: Define `.graphql` files first. Better for communication.
- **Code-First**: Generate schema from code/decorators. Better for type-safety (Pothos, TypeGraphQL).

### 2. N+1 Problem (DataLoader)
- Use `DataLoader` to batch + cache database/API queries within single execution cycle.
- Essential for nested relational fields to prevent performance collapse.

### 3. Mutations & Error Handling
- Use consistent `Result` type pattern for mutations (e.g., `user: User, errors: [Error!]`).
- Separate system errors from business logic validation errors.

### 4. Scalars & Directives
- Use custom scalars (e.g. `Date`, `JSON`) for non-standard types.
- Use schema directives (e.g. `@auth`) for cross-cutting logic.

## Output Format

GraphQL Design Strategy:
```markdown
### GraphQL Design: {Feature}

**1. Schema Snippet (SDL)**
- (Types, Queries, Mutations)

**2. Resolver Logic**
- (Delegation, Dataloader usage)

**3. Performance Strategy**
- (Batching, caching, complexity limits)

**4. Authorization**
- (Directive or middleware approach)
```

## Related Skills

- **[api-patterns](../api-patterns/SKILL.md)**: API design foundations.
- **[database-design](../database-design/SKILL.md)**: Data sources and relational mapping.
