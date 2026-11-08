---
name: input-systems
description: Game input for keyboard, mouse, gamepad, touch. Action mapping, deadzones, buffering, rebindable controls. Triggers: "game input", "controller support", "gamepad logic", "input buffering", "input mapping".
version: 1.0.0
---

# Input Systems

Purpose: device-agnostic, responsive input handling (Keyboard, Mouse, Gamepad, Touch).

## When to Use

Trigger:
- Keyboard, mouse, or gamepad support.
- Action-based mapping ("Jump" vs "Spacebar").
- Analog deadzones and sensitivity.
- Input buffers for combos/responsiveness.
- Touch gestures (swipe, pinch, tap).
- Rebindable control systems.

## Instructions

### 1. Action-Based Mapping
Do not hardcode keys in gameplay logic.
- **Action**: High-level intent (`Jump`, `Move`).
- **Binding**: Physical input bound to Action (`Space` -> `Jump`).
- **Benefit**: Multi-device support, simple rebinding.

### 2. State Tracking
Track state per frame:
- **JustPressed**: Down this frame, up last.
- **Down**: Active/held.
- **JustReleased**: Up this frame, down last.
- **Up**: Inactive/released.

### 3. Analog sticks & Gamepads
- **Deadzones**: Ignore values below drift limit (e.g., < 0.15).
- **Normalization**: Map sticks to circular 0-1 range for uniform diagonals.
- **Response Curve**: Apply scaling curves (power/exponential) for feel.

### 4. Input Buffering
- **Early Input**: Cache triggers (e.g., jump 50ms before landing) to fire immediately on state entry.
- **Input Queue**: Store timestamped queue for combos (e.g., `Down`, `Right`, `Punch`).

### 5. Touch Gestures
- **Tap**: Instant touch release.
- **Swipe**: Drag vector over delta time.
- **Pinch**: Distance delta between two active pointers.

### 6. Event vs Polling
- **Event-Driven**: Menus, UI.
- **Polling**: Main update loop. Query states at tick start.

## Output Format

Summary:
```markdown
### Input Architecture: {Project Name}

**1. Action Map**
- (Actions and default bindings)

**2. Device Support**
- (Keyboard, Mouse, Gamepad, Touch)

**3. Abstraction Layer**
- (Polling details)

**4. Advanced Features**
- (Deadzones, Buffering, Rebinding)
```

## Examples

**Input:** "Gamepad support for platformer with Jump and Dash."
**Expected Action:**
1. Define actions: `Move` (Stick/WASD), `Jump` (A/Space), `Dash` (X/Shift).
2. Set deadzones: 0.15 circular limit.
3. Configure buffers: 100ms Coyote Time + pre-landing buffering.

## Resources

- [Game Programming Patterns: Input Buffer](https://gameprogrammingpatterns.com/input-handler.html)
- [W3C Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API)

## Related Skills

- **[game-math](../game-math/SKILL.md)**: Vectors, curves, normalization.
- **[game-ai-logic](../game-ai-logic/SKILL.md)**: Action passing to State Machines.
- **[p5js-creative-coding](../p5js-creative-coding/SKILL.md)**: Basic input bindings.
