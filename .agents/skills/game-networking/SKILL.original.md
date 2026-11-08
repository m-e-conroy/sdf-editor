---
name: game-networking
description: Real-time multiplayer networking. Prediction, interpolation, reconciliation, lag compensation. Triggers: "multiplayer", "game networking", "state sync", "lag compensation", "websockets game".
version: 1.0.0
---

# Game Networking Skill

> **Purpose**: Synchronize fast-paced game states over unreliable networks.

## When to Use

- Implement real-time multiplayer (Action, Sports, FPS).
- Handle latency and packet loss.
- Synchronize physics and entity states between server/clients.
- Build authoritative server logic with client-side prediction.

## Instructions

Apply multiplayer synchronization patterns:

### 1. Authority Models
- **Authoritative Server**: Server runs the "truth"; clients send inputs. Prevents cheating.
- **Peer-to-Peer**: Clients send states to each other. Prone to desync and cheats. Use for simple Co-op.

### 2. Latency Mitigation
- **Client-Side Prediction**: Client moves immediately upon input without waiting for server ACK.
- **Server Reconciliation**: If server position differs from client's predicted position, "snap" or lerp client to server truth + re-simulate pending inputs.
- **Interpolation (Lerp)**: Render entities slightly in the past (e.g., 100ms) to smooth out jitter.

### 3. Lag Compensation
- **Backwards Reconciliation**: For hit detection, the server "rewinds" entities to where they were on the client's screen at the time of the shot to verify the hit.

### 4. State Synchronization
- **Snapshot Interpolation**: Server sends full/partial world state at intervals.
- **Delta Compression**: Only send what changed since the last ACK'd packet.
- **RPC (Remote Procedure Call)**: Trigger one-off events (e.g., `PlaySound`, `ShowVFX`).

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

- **[api-patterns](../api-patterns/SKILL.md)**: Data transfer formats (Protobuf, JSON).
- **[game-math](../game-math/SKILL.md)**: Vector interpolation (lerp).
- **[physics](../physics/SKILL.md)**: Deterministic physics simulation.
