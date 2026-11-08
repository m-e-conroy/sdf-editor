---
name: game-ai-logic
description: NPC/agent logic. FSM, Behavior Trees, A* Pathfinding, steering, sensory systems. Triggers: "game ai", "npc logic", "pathfinding", "state machine", "behavior tree", "steering behaviors".
version: 1.0.0
---

# Game AI Logic Skill

> **Purpose**: Architect and implement intelligent agent behaviors.

## When to Use

- Design NPC decision-making systems.
- Implement pathfinding (A*, Dijkstra).
- Create reactive motion (Steering, flocking/Boids).
- Manage character states (Combat, idle, patrol).
- Build sensory systems (Line of sight, hearing thresholds).

## Instructions

Apply AI patterns based on system complexity:

### 1. Finite State Machines (FSM)
Discrete behaviors (e.g. "Patrol" -> "Chase" -> "Attack").
- **State**: Encapsulates behavior (Enter, Update, Exit).
- **Transition**: Trigger condition.
- **Pattern**: Centralize state transitions in a `StateMachine` manager to avoid spaghetti.

### 2. Behavior Trees (BT)
Complex, nested decision trees.
- **Composites**:
    - **Sequence**: Run children until one fails (AND logic).
    - **Selector**: Run children until one succeeds (OR logic).
- **Decorators**: Modify results (Inverter, Repeater, Cooldown).
- **Leaves**: Tasks (Action) or Checks (Condition).
- **Tick**: Tick the root node at fixed intervals.

### 3. Navigation & Pathfinding
- **A* (A-Star)**: Node-based pathfinding.
    - `f(n) = g(n) + h(n)`
    - `g(n)`: start-to-node cost. `h(n)`: heuristic estimate to goal (Manhattan/Euclidean).
- **Navigation Mesh (NavMesh)**: walkthrough polygons in 3D to reduce query space.

### 4. Steering Behaviors
Reactive kinematic movement:
- **Seek / Flee**: Dynamic acceleration towards/away from target.
- **Arrival**: De-accelerate when entering arrival radius.
- **Obstacle Avoidance**: Raycast probes to detect bounds; apply lateral counter-force.
- **Boids (Flocking)**: Cohesion (grouping), Separation (avoid crowding), Alignment (match heading).

### 5. Utility AI
Dynamic need-based choices (e.g. Sims-like actions).
- Score actions through utility curves (Linear, Exponential, Logarithmic).
- Select action returning highest score.

### 6. Sensory Systems
- **Line of Sight (LOS)**: Distance check + Dot Product (FOV angle) + Raycast (geometry check).
- **Hearing**: Distance check + sound amplitude threshold.

## Output Format

Propose AI architecture:

```markdown
### Game AI Architecture: {Agent Type}

**1. Primary Pattern**
- (FSM, Behavior Tree, Utility AI)

**2. State/Node Breakdown**
- (List major states/tree structure)

**3. Navigation & Movement**
- (A*, NavMesh, Steering)

**4. Sensory Implementation**
- (FOV, Raycast freq, sound detection)

**5. Performance**
- (Tick rate, spatial partitioning)
```

## Examples

**Input:** "Create guard that patrols points, chases player if seen."

**Action:** FSM with Patrol, Chase, Return states.

**Response:**
### Game AI Architecture: Sentry Guard
- **Pattern**: FSM
- **States**: 
    - `Patrol`: Move A to B via A*.
    - `Chase`: Player in FOV? Trigger Raycast. If clear, move to Player.
- **Transitions**:
    - `Patrol -> Chase`: `PlayerSeen == true`
    - `Chase -> Patrol`: `DistToPlayer > MaxDist`

## Resources

- [Game AI Pro](http://www.gameaipro.com/)
- [A* Pathfinding Project](https://arongranberg.com/astar/)
- [Nature of Code (Steering)](https://natureofcode.com/steering-behaviors/)

## Related Skills

- **[game-math](../game-math/SKILL.md)**: Vectors/Dot Products.
- **[physics](../physics/SKILL.md)**: Raycasting/collision.
- **[geometry](../geometry/SKILL.md)**: Spatial queries.
- **[threejs](../threejs/SKILL.md)**: Visualizing AI paths.
