---
name: message-queues
description: Background job processing, task scheduling, and async messaging (BullMQ, RabbitMQ). Triggers: "message queue", "background job", "bullmq", "worker", "async task", "rabbitmq".
version: 1.0.0
---

# Message Queues Skill

## When to Use

- Offload heavy computation (image processing, reporting).
- Handle webhooks with high concurrency.
- Decouple microservices.
- Schedule tasks (cron jobs).

## Instructions

### 1. Durability & Reliability
- **Persistence**: Ensure jobs persist to a backend (Redis/Disk) to survive worker crashes.
- **Idempotency**: Running a job multiple times must yield the same result.
- **Retries**: Configure exponential backoff for failed jobs.

### 2. Monitoring
- Use dashboards (BullBoard) to monitor active, completed, and failed jobs.
- Define Dead Letter Queues (DLQ) for repeatedly failing jobs.

### 3. Concurrency
- Limit concurrent workers based on CPU/Memory constraints.
- Use priority queues for time-sensitive tasks.

## Output Format

Propose Queue Architecture:

```markdown
### Queue Specification: {Task}

**1. Technology**
- (BullMQ / RabbitMQ / SQS)

**2. Job Schema**
- (Payload structure, type safety)

**3. Retry Policy**
- (Attempts, Backoff strategy)

**4. Worker Concurrency**
- (Parallelism limits)
```

## Related Skills

- **[redis-caching](../redis-caching/SKILL.md)**: Used as backend store for BullMQ.
- **[api-hardening](../api-hardening/SKILL.md)**: Protect webhook entry points.
