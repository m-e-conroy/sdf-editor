---
name: ecs-architecture
description: High-performance Entity Component System. Data-oriented design, SoA vs AoS, systems, components, entities. Triggers: "ecs", "entity component system", "data-oriented design", "high performance entities".
version: 1.0.0
---

# ECS Architecture Skill

> **Purpose**: Implement high-performance data-oriented game architectures.

## When to Use

- Manage thousands of active entities (bullets, units, particles).
- Optimize for CPU cache locality and memory throughput.
- Decouple data from logic in complex game worlds.
- Build modular systems that scale without deep inheritance.

## Instructions

### 1. Core Pillars
- **Entity**: A unique ID (e.g. `uint32`). Contains no data or logic.
- **Component**: Pure data struct (e.g. `Position {x, y}`). No logic.
- **System**: Logic operating on Entities possessing specific Components (e.g. `MovementSystem` queries entities with `Position` AND `Velocity`).

### 2. Data Locality (SoA vs. AoS)
- **AoS (Array of Structures)**: `[{x, y}, {x, y}]`. Standard OOP array of objects.
- **SoA (Structure of Arrays)**: `{x: [0, 1], y: [0, 1]}`. Better for CPU cache during field-specific iterations.
- **Systematic Approach**: Keep component data in contiguous memory blocks to minimize cache misses.

### 3. Querying & Filtering
- Use **Bitmasks** or **Archetypes** to quickly resolve entities matching system queries.
- Avoid full entity iteration; query only the "Interest Set."

### 4. Lifecycle Management
- **Creation**: Pre-allocate entity/component pools (no mid-game garbage collection).
- **Deletion**: Mark entities; clean up at frame boundary.
- **Structural Changes**: Defer component adding/removing to frame boundaries to prevent iterator invalidation.

## Output Format

Propose ECS structure:

```markdown
### ECS Design: {System Name}

**1. Components**
- (List data structures)

**2. Systems**
- (Logic blocks and their component requirements)

**3. Data Layout**
- (Archetypes or SoA implementation)

**4. Performance**
- (Cache considerations, entity limits)
```

## Related Skills

- **[project-organization](../project-organization/SKILL.md)**: Managing system/component files.
- **[clean-code](../clean-code/SKILL.md)**: Readable data-oriented code.
- **[game-developer](../../agents/game-developer.md)**: Engine-level ECS integration.
