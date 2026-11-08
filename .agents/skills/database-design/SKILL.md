---
name: database-design
description: Efficient schemas, query optimization, distributed consistency, zero-downtime migrations. Use for DB design, schema patterns, SQL, Prisma, distributed trade-offs.
version: 1.0.0
---

# Database Design Skill

> **Purpose**: Efficient, normalized, scalable DB architectures.

## When to Use

- Design, review, optimize database schema.
- Write SQL, Prisma schema, indexing strategies.
- Database migrations (ensure zero-downtime).
- Guide connection pooling setup.
- Distributed systems trade-offs (CAP, ACID vs BASE, consistency).

## Instructions

### Schema Design & Normalization
- **1NF**: Atomic values, no repeating groups.
- **2NF**: No partial dependencies.
- **3NF**: No transitive dependencies.

### Naming Conventions
- **Tables**: Plural, `snake_case` (e.g., `users`, `order_items`).
- **Columns**: Singular, `snake_case` (e.g., `user_id`, `created_at`).
- **Primary Keys**: `id` or `{table}_id`.
- **Foreign Keys**: `{referenced_table}_id`.

### Common Patterns (Prisma Example)

**User Entity & One-to-Many**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
}

model Order {
  id     String @id @default(uuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])
}
```

**Many-to-Many**
```prisma
model User {
  id    String @id @default(uuid())
  roles Role[]
}

model Role {
  id    String @id @default(uuid())
  users User[]
}
```

### Indexing Strategy
- **Primary lookup**: Primary Key.
- **Unique constraint**: Unique Index.
- **Frequent WHERE/ORDER BY**: B-tree Index.
- **Text search**: Full-text Index.
- **JSON fields**: GIN Index (Postgres).

```prisma
model User {
  id    String @id @default(uuid())
  email String @unique

  @@index([createdAt])
  @@index([isActive, role])
}
```

### Query Optimization
Avoid N+1 queries. Eager load or batch.
```typescript
// ❌ Bad: N+1 Problem
const users = await prisma.user.findMany();
for (const user of users) {
  const orders = await prisma.order.findMany({ where: { userId: user.id } });
}

// ✅ Good: Eager Loading
const users = await prisma.user.findMany({
  include: { orders: true },
});
```

### Distributed Systems (CAP Theorem)
Choose max two: Consistency (C), Availability (A), Partition Tolerance (P).
- **CP**: Consistency + Partition Tolerance. Strong consistency needed. E.g., MongoDB, Zookeeper.
- **AP**: Availability + Partition Tolerance. Eventual consistency OK. E.g., DynamoDB, Cassandra.
- **CA**: Consistency + Availability. Single-node RDBMS. E.g., Postgres.

### ACID vs BASE
- **ACID**: Strong consistency. Financials, billing.
- **BASE**: Eventual consistency. Analytics, IoT, social.

### Consistency Models
Choose weakest tolerable model for performance:
1. **Strict / Linearizable**: Distributed locks.
2. **Sequential**: Replicated state machines.
3. **Causal**: Chat apps.
4. **Read-your-writes**: Profile updates.
5. **Monotonic reads**: Reporting.
6. **Eventual**: Likes, caches.

### Zero-Downtime Migration Pattern
Expand/Migrate/Contract workflow:
1. **Expand**: Add new structure alongside old.
2. **Migrate**: Backfill data, dual-write to both.
3. **Contract**: Remove old after clients switch.

- **Safe ops**: Add nullable column, Add column with default (Postgres 11+).
- **Unsafe ops**: Drop column, Rename column, Change type, Add index (no CONCURRENTLY), Drop table.

### Connection Pooling
- **Serverless**: 1-2 connections per function (PgBouncer, Accelerate, Supavisor).
- **Production VM/Container**: 10-20 per instance.
- **Formula**: `max_pool_size = (db_max - reserved_superuser) / app_instances`

## Output Format

Propose schema/migration plan:

```markdown
### Database Architecture Proposal

**1. Entities & Schema**
- (Include Prisma or SQL snippets)

**2. Indexing Strategy**
- (List proposed indexes and rationale)

**3. Safety & Migration Plan**
- (Detail Expand/Migrate/Contract steps)

**4. Performance & Scalability Considerations**
- (CAP, Connection Pooling, N+1 avoidance)
```

## Examples

**Input:** "Rename `display_name` to `full_name` in `users` table without downtime."

**Expected Action:** Propose zero-downtime strategy using Expand/Migrate/Contract.

**Response:**

### Database Architecture Proposal

**1. Expand**
Add `full_name` as nullable:
```sql
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
```
Dual-write to both fields in application.

**2. Migrate**
Backfill:
```sql
UPDATE users SET full_name = display_name WHERE full_name IS NULL;
```
Switch reads to `full_name`.

**3. Contract**
Drop old column:
```sql
ALTER TABLE users DROP COLUMN display_name;
```

## Resources

### Quick Reference

| Pattern        | Usage               |
| :------------- | :------------------ |
| UUID           | Distributed systems |
| Auto-increment | Simple apps         |
| Soft Delete    | Audit requirements  |
| Timestamps     | Always include      |
| Indexes        | Frequent queries    |
| Constraints    | Data integrity      |
| CAP trade-off  | Distributed design  |
| ACID           | Transactional data  |
| BASE           | High-scale writes   |
| Migrations     | Zero-downtime       |
| Connection Pool| Right-size per env  |

- [Agent Skills Official Specification](https://agentskills.io)

## Related Skills

- **[api-patterns](../api-patterns/SKILL.md)**: Interface design interacting with DB.
- **[project-organization](../project-organization/SKILL.md)**: Migration scripts/seed data management.
- **[mysql](../mysql/SKILL.md)**: MySQL-specific optimization and ACID patterns.
- **[mongodb](../mongodb/SKILL.md)**: MongoDB-specific schema modeling and performance.
