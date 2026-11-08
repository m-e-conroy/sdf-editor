---
name: game-networking
description: Real-time multiplayer networking. Prediction, interpolation, reconciliation, lag compensation. Triggers: "multiplayer", "game networking", "state sync", "lag compensation", "websockets game".
version: 1.0.0
---

# Game Networking Skill

> **Purpose**: Synchronize fast-paced game states over unreliable networks.

## When to Use

- Implement real-time multiplayer systems.
- Mitigate network latency and packet loss.
- Synchronize physics and entity states between clients and server.
- Build authoritative server logic with client-side prediction.

## Instructions

Apply multiplayer synchronization patterns:

### 1. Authority Models
- **Authoritative Server**: Server computes state truth; clients send inputs. Prevents cheating.
- **Peer-to-Peer**: Clients send state to peers. High risk of desync/cheats; use for simple co-op.

### 2. Latency Mitigation
- **Client-Side Prediction**: Client moves immediately upon input, anticipating server confirmation.
- **Server Reconciliation**: If server state differs from predicted state, snap client to server position + re-simulate pending input queue.
- **Entity Interpolation**: Render other entities slightly in the past (e.g. 100ms lag buffer) to smooth over packet jitter.

### 3. Lag Compensation
- **Backwards Reconciliation**: Server rewinds entities to historical positions corresponding to client's latency when verifying hit-scans.

### 4. State Sync & Bandwidth
- **Snapshot Interpolation**: Broadcast global/local game state at regular tick rates.
- **Delta Compression**: Broadcast only changes since the client's last acknowledged state index.
- **RPCs (Remote Procedure Calls)**: Trigger one-off non-continuous events (e.g. play sound, spawn particle).

## Output Format

Propose Networking architecture:

```markdown
### Networking Spec: {Project Name}

**1. Protocol**
- (WebSockets, WebRTC DataChannels, UDP)

**2. Sync Strategy**
- (Snapshots, Client Prediction frequency)

**3. Mitigation**
- (Interpolation delay, Reconciliation logic)

**4. Bandwidth Optimization**
- (Delta compression, Interest Management)
```

## Related Skills

- **[api-patterns](../api-patterns/SKILL.md)**: Data serialization protocols (Protobuf, JSON).
- **[game-math](../game-math/SKILL.md)**: Vector interpolation (lerp).
- **[physics](../physics/SKILL.md)**: Deterministic physics implementation.
