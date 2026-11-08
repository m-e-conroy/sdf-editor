---
name: websockets-realtime
description: Stateful real-time communication using Socket.io or native WebSockets. Triggers: "websockets", "socket.io", "real-time chat", "real-time sync", "rooms", "namespaces".
version: 1.0.0
---

# WebSockets Real-Time Skill

## When to Use

- Build chat applications.
- Create real-time collaborative tools (e.g., shared docs).
- Live dashboards and notifications.
- Multiplayer game synchronization.

## Instructions

### 1. Technology Selection
- **Socket.io**: Features auto-reconnection, rooms, fallbacks. High-level.
- **Native WS**: Low overhead, standard protocol. Requires manual heartbeats and reconnection handling.

### 2. Scaling (Redis Adapter)
- WebSockets are stateful. Use `Redis Adapter` to broadcast messages across multiple server instances.

### 3. Authentication
- Authenticate connection during `handshake` phase (JWT in query or headers).
- Immediately disconnect unauthorized clients.

### 4. Optimization
- Use `Rooms` and `Namespaces` to limit broadcast scope (e.g., `room:project_123`).
- Implement `Heartbeats` (ping/pong) to detect and prune dead connections.

## Output Format

Propose Real-Time Architecture:

```markdown
### WebSocket Spec: {Project}

**1. Library**
- (Socket.io / Native WS)

**2. Auth Strategy**
- (Handshake JWT verification)

**3. Event Schema**
- (e.g. `message:send`, `presence:update`)

**4. Scaling**
- (Redis Adapter config)
```

## Related Skills

- **[redis-caching](../redis-caching/SKILL.md)**: Used for scaling broadcasts.
- **[auth-patterns](../auth-patterns/SKILL.md)**: Connection security.
