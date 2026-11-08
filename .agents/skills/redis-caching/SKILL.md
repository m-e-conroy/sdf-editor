---
name: redis-caching
description: High-performance caching strategies, Pub/Sub, and distributed state using Redis. Triggers: "redis", "caching strategy", "cache-aside", "distributed lock", "pubsub".
version: 1.0.0
---

# Redis Caching Skill

## When to Use

- Reduce DB load by caching frequent queries.
- Manage distributed session state.
- Implement real-time messaging via Pub/Sub.
- Coordinate distributed locks to prevent race conditions.

## Instructions

### 1. Caching Patterns
- **Cache-Aside**: App checks cache. If miss, fetch from DB, write to cache with TTL.
- **Write-Through**: App writes to cache; cache writes to DB.
- **Read-Through**: Cache handles DB fetch automatically on miss.

### 2. TTL & Cache Stampede
- Always set TTL to prevent stale data.
- Add `jitter` (random variance) to TTL under high traffic to avoid simultaneous key expirations (cache stampede).

### 3. Data Structures
- **Strings**: Simple key-value.
- **Hashes**: Objects/records.
- **Sorted Sets**: Leaderboards, priority queues.
- **Streams**: Event logs.

### 4. Distributed Locks (Redlock)
- Use `SET NX PX` for atomic lock acquisition.
- Use unique IDs for lock holders to prevent accidental releases.

## Output Format

Propose Caching Strategy:

```markdown
### Redis Strategy: {Service}

**1. Pattern**
- (Cache-Aside / Write-Through)

**2. Key Schema**
- `prefix:entity:id` format

**3. TTL & Eviction**
- (e.g. 3600s + Jitter)

**4. Data Type**
- (String / Hash / Set)
```

## Related Skills

- **[database-design](../database-design/SKILL.md)**: Persistent storage sync.
- **[performance-sre](../../agents/performance-sre.md)**: Latency monitoring.
