---
name: prisma-orm-mastery
description: Advanced Prisma patterns, migrations, transactions, and relational modeling. Triggers: "prisma", "orm", "database migration", "prisma transaction", "schema design prisma".
version: 1.0.0
---

# Prisma ORM Mastery Skill

## When to Use

- Model complex relational data.
- Manage database migrations and version control.
- Implement safe, atomic multi-record updates (Transactions).
- Optimize queries with `include`, `select`, and raw SQL.

## Instructions

### 1. Schema Design
- Use `enums` for fixed states.
- Define explicit relations (1:1, 1:n, n:m).
- Use `@@index` and `@@unique` for performance and integrity.

### 2. Transactions
- Use `$transaction` for all-or-nothing operations.
- Use Interactive Transactions for complex logic with dynamic checks.

### 3. Middleware & Extensions
- Implement soft-deletes or logging via Prisma Middleware or Client Extensions.

### 4. Performance
- Prevent `N+1` queries using `include`.
- Use `select` to fetch necessary fields only.
- Use `prisma.$queryRaw` only when standard API is insufficient.

## Output Format

Propose Prisma Schema/Strategy:

```markdown
### Prisma Implementation: {Entity}

**1. Schema Definition**
- (Model structure, relations, indexes)

**2. Query Pattern**
- (Example fetch with include/select)

**3. Transaction Logic**
- (Atomic update flow)

**4. Performance Checklist**
- (Indexes, select filtering)
```

## Related Skills

- **[database-design](../database-design/SKILL.md)**: Foundation of relational theory.
- **[typescript](../typescript/SKILL.md)**: Ensuring type safety in generated client.
