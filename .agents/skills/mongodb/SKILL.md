---
name: mongodb
description: MongoDB dev patterns: schema, CRUD, aggregation, indexing, performance. Use for: schema design, queries, aggregation pipelines, index optimization, transactions, Node.js/Python integration. Triggers: "mongodb", "mongo", "mongoose", "mongosh", "aggregation pipeline", "BSON", "Atlas", "replica set", "sharding", "change streams", "vector search MongoDB".
version: 0.1.1
---

# MongoDB Development Patterns

> Build with MongoDB: schema design, queries, aggregation, indexing, and performance optimization for document databases.

## When to Use
Use for:
- MongoDB schema design & modeling (embed vs reference).
- CRUD ops & complex queries.
- Aggregation pipelines ($match, $group, $lookup, $unwind).
- Index optimization (compound, multikey, text, Atlas Search).
- Multi-doc ACID transactions.
- Real-time data change streams.
- Atlas Vector Search for AI/RAG.
- Performance tuning (explain(), index strategy).
- Atlas vs self-managed deployment choices.

## Instructions

### 1. Schema Design
1. **Model for access patterns**: Design schemas around queries.
2. **Embed vs Reference**:
   - **Embed**: Data read together, 1:1/1:few, bounded growth.
   - **Reference**: Many:many, shared data, documents > 16MB.
3. **No unbounded arrays**: Prevents lag. Use bucket/reference patterns.
4. **Validation**: Use `$jsonSchema` on collections.

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name"],
      properties: {
        email: { bsonType: "string", description: "must be a string" },
        name: { bsonType: "string" },
        age: { bsonType: "int", minimum: 0 }
      }
    }
  }
});
```

5. **Common patterns**:
   - **Polymorphic**: Entities in one collection with `type` discriminator.
   - **Bucket**: Group time-series/logs into fixed-size docs.
   - **Computed**: Pre-compute aggregations in summary docs.
   - **Subset**: Embed frequent subset, reference full data.
   - **Extended Reference**: Duplicate key fields to avoid `$lookup`.

### 2. CRUD Operations
1. `insertOne` / `insertMany` for creates.
2. `find` + projection for reads.
3. `updateOne` / `updateMany` + atomic operators (`$set`, `$inc`, `$push`, `$pull`, `$addToSet`).
4. `bulkWrite` for batches.
5. `findOneAndUpdate` / `findOneAndDelete` for atomic read-modify-write.

```javascript
// Atomic update with multiple operators
db.orders.updateOne(
  { _id: orderId, status: "pending" },
  {
    $set: { status: "shipped", shippedAt: new Date() },
    $inc: { version: 1 },
    $push: { history: { action: "shipped", at: new Date() } }
  }
);
```

### 3. Aggregation Pipeline
Build pipelines stage by stage. `$match` and `$project` early.
Stages:
- `$match` — Filter docs (uses indexes).
- `$group` — Group by key, apply accumulators (`$sum`, `$avg`, `$push`, `$first`).
- `$lookup` — Left outer join.
- `$unwind` — Deconstruct arrays.
- `$project` / `$addFields` — Reshape docs.
- `$sort`, `$limit`, `$skip` — Order/paginate.
- `$facet` — Parallel pipelines on same input.
- `$merge` / `$out` — Write results to collection.

```javascript
db.orders.aggregate([
  { $match: { status: "completed", createdAt: { $gte: ISODate("2025-01-01") } } },
  { $unwind: "$items" },
  { $group: {
      _id: "$items.productId",
      totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      orderCount: { $sum: 1 }
  }},
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 }
]);
```

### 4. Indexing Strategy
1. **Support queries**: Verify with `explain("executionStats")`.
2. **Compound indexes**: ESR rule — **Equality**, **Sort**, **Range** field order.
3. **Covered queries**: Index fields match projection → skip document fetch.
4. **Avoid**: Low-cardinality indexes, over-indexing (write penalty).
5. **Index types**: Single, Compound, Multikey, Text, Wildcard, TTL, Partial.

```javascript
// Compound index following ESR rule
db.orders.createIndex(
  { status: 1, createdAt: -1, totalAmount: 1 },
  { name: "status_date_amount" }
);

// Partial index — only index active users
db.users.createIndex(
  { email: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
```

### 5. Transactions
1. Multi-doc only if atomicity required.
2. Keep short to avoid lock contention.
3. Work on replica sets/shards (4.2+).
4. Retry `TransientTransactionError` and `UnknownTransactionCommitResult`.

```javascript
const session = client.startSession();
try {
  session.startTransaction();
  await accounts.updateOne(
    { _id: fromId }, { $inc: { balance: -amount } }, { session }
  );
  await accounts.updateOne(
    { _id: toId }, { $inc: { balance: amount } }, { session }
  );
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

### 6. Performance
1. **Use `explain()`**: Check `winningPlan`, `docsExamined` vs `nReturned`.
2. **Pool**: Reuse `MongoClient`. Set `maxPoolSize`.
3. **Concerns**: `majority` for consistency, `local` for speed.
4. **Preference**: `primary` (strong), `secondaryPreferred` (scale), `nearest` (latency).
5. **Avoid**: Unbounded `find()`, `$regex` without anchored prefix, `$where` / `$expr` if simpler ops exist.

### 7. Node.js Driver Integration
1. Official `mongodb` driver or Mongoose.
2. Reuse one `MongoClient` instance.
3. Conn string: `retryWrites=true&w=majority`.
4. Handle `MongoServerError`, `MongoNetworkError`, code 11000.

```javascript
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  retryWrites: true,
  w: "majority"
});

async function run() {
  try {
    await client.connect();
    const db = client.db("myapp");
    const users = db.collection("users");
  } finally {
    await client.close();
  }
}
```

## Output Format
1. **Schema Rationale**: Explain embed/reference & access patterns.
2. **Query/Pipeline**: Complete, runnable code.
3. **Index Recommendation**: `createIndex()` commands + ESR reasoning.
4. **Performance Notes**: Flag bottlenecks, suggest `explain()` checks.

## Examples
**Input:** "Design blog schema: posts, comments, users."
**Expected Action**:
1. Access: read post + comments together, user profile separate.
2. Embed comments in posts (if bounded), reference users.
3. Provide schema with `$jsonSchema`.
4. Index: `{ authorId: 1, createdAt: -1 }`.
5. Aggregation for "top posts by comment count."

**Input:** "MongoDB query slow, fix it."
**Expected Action**:
1. Get query + collection size.
2. `explain("executionStats")` check.
3. Identify `COLLSCAN` or high `docsExamined:nReturned`.
4. ESR compound index.
5. Before/after `explain()` comparison.

## Resources
- [MongoDB Server Docs](https://www.mongodb.com/docs/manual/)
- [CRUD Operations](https://www.mongodb.com/docs/current/crud/)
- [Aggregation](https://www.mongodb.com/docs/current/aggregation/)
- [Indexes](https://www.mongodb.com/docs/current/indexes/)
- [Modeling](https://www.mongodb.com/docs/current/data-modeling/)
- [Transactions](https://www.mongodb.com/docs/current/core/transactions/)
- [Vector Search](https://www.mongodb.com/docs/vector-search/)
- [Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Dev Checklist](https://www.mongodb.com/docs/current/administration/production-checklist-development/)

## Related Skills
- **[database-design](../database-design/SKILL.md)** — DB design, distributed consistency.
- **[api-patterns](../api-patterns/SKILL.md)** — REST/GraphQL connecting to MongoDB backends.
- **[nodejs-best-practices](../nodejs-best-practices/SKILL.md)** — Node.js architecture.
