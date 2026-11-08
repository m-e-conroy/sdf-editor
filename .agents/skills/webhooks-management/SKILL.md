---
name: webhooks-management
description: Securely receiving and processing events from 3rd-party services (Stripe, GitHub). Triggers: "webhooks", "webhook signature", "idempotency", "stripe webhook", "github webhook".
version: 1.0.0
---

# Webhooks Management Skill

## When to Use

- Process payment events (Stripe, PayPal).
- Handle source control events (GitHub, GitLab).
- Integrate with external CI/CD or notification systems.

## Instructions

### 1. Security (Signature Verification)
- **Never** trust payload directly.
- Verify request signature using provider SDK and secret key.
- Verify timestamp to prevent replay attacks.

### 2. Idempotency
- Ensure processing same webhook twice has no side effects (e.g. double charging).
- Store processed `webhook_id` in database or Redis with a TTL.

### 3. Async Processing
- Return `200 OK` response immediately.
- Offload work to background queue (BullMQ) to prevent provider timeouts.

## Output Format

Propose Webhook Architecture:

```markdown
### Webhook Integration: {Provider}

**1. Endpoint Security**
- (SDK verification method, secret management)

**2. Idempotency Strategy**
- (DB/Redis check for event ID)

**3. Processing Flow**
- (Queue integration, retry logic)

**4. Error Handling**
- (Logging, monitoring, manual intervention flow)
```

## Related Skills

- **[message-queues](../message-queues/SKILL.md)**: Async processing of events.
- **[api-hardening](../api-hardening/SKILL.md)**: Endpoint protection.
