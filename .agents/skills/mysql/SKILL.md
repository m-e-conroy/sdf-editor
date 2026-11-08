---
name: mysql
description: MySQL expert. SQL, Schema, Indexing, Performance, ACID, Migrations. Triggers: "mysql", "sql", "relational database", "database schema".
version: 1.0.0
---

# MySQL Database Engine

Expert MySQL, SQL optimization. ACID compliant persistence.

## 🎯 When to Use

Relational storage, complex JOINs, ACID integrity, performance tuning.

## 🏗️ Instructions

### 1. Connection & Setup
- Use `mysql2` / official drivers.
- Env vars for `HOST`, `USER`, `PASSWORD`, `DATABASE`.
- No hardcoded credentials.
- Connection Pooling for scale.

### 2. Schema Design
- `InnoDB` engine for ACID support.
- `utf8mb4` charset for emoji/intl support.
- Primary Keys on every table.
- Foreign Keys for database-level integrity.

### 3. Querying
- Prepared Statements always to prevent SQL Injection.
- No `SELECT *`. Explicit columns only.
- `EXPLAIN` to audit query plans.
- Optimize `WHERE` clauses with indexes.

### 4. Indexing
- B-Tree indexes for equality/range queries.
- Unique indexes for data integrity.
- Avoid over-indexing to keep write performance high.

### 5. Migrations
- Version-controlled migration files (Knex, Sequelize, raw SQL).
- Write clear forward/rollback logic.

## 📤 Output Format

- **SQL Schema**: `CREATE TABLE` scripts.
- **Queries**: Optimized SQL + explanation.
- **Migration**: Timestamped code block.

## 💡 Examples

### Create Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash CHAR(60) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Prepared Statement (Node.js)
```javascript
const [rows] = await connection.execute(
  'SELECT name FROM users WHERE email = ?',
  [email]
);
```

## 🚨 Red Flags

- **SQL Injection**: No template literals. Use `?` place holders.
- **N+1 Patterns**: Join data in query; no loops in app code.
- **Missing Indexes**: Full table scans on large datasets.
- **No Backups**: Ensure backup logic configured.

---

> **See Also:** [database-design](../database-design/SKILL.md), [nodejs-best-practices](../nodejs-best-practices/SKILL.md)
