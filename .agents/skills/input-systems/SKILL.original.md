---
name: input-systems
description: Handling game input for keyboard, mouse, gamepad, and touch. Action-based mapping, deadzones, buffering, and rebindable controls. Triggers: "game input", "controller support", "gamepad logic", "input buffering", "input mapping".
version: 1.0.0
---

# Input Systems Skill

> **Purpose**: Implement robust, device-agnostic input handling for games and interactive applications.

## When to Use

- Implementing keyboard, mouse, or gamepad support.
- Creating action-based input mapping (e.g., "Jump" vs "Spacebar").
- Handling analog stick deadzones and sensitivity.
- Building input buffers for fighting games or precise action logic.
- Implementing touch gestures (swipe, pinch, tap).
- Making controls rebindable by users.

## Instructions

Apply these input patterns for scalability and feel:

### 1. Action-Based Mapping
Do not check for specific keys in gameplay logic. Use an abstraction layer.
- **Action**: A high-level intent (e.g., `Jump`, `Fire`, `Move`).
- **Binding**: A physical key/button mapped to an Action (e.g., `Space` -> `Jump`).
- **Benefit**: Allows easy rebinding and multi-device support without changing gameplay code.

### 2. Input State Management
Track the "state" of inputs across frames:
- **JustPressed**: Input was down this frame but up last frame.
- **Down**: Input is currently held.
- **JustReleased**: Input was up this frame but down last frame.
- **Up**: Input is currently released.

### 3. Controller & Analog Stick Handling
- **Deadzones**: Ignore small analog stick values (e.g., < 0.1) to prevent "stick drift."
- **Normalization**: Map stick values to a circular range (magnitude 0 to 1) for consistent diagonal movement.
- **Sensitivity**: Apply curves (Linear, Power, Log) to analog values for better aim/control feel.

### 4. Input Buffering
Essential for "game feel" and precision:
- **Early Input**: If a player presses "Jump" 50ms before landing, cache it and trigger jump upon landing.
- **Input Queue**: For combos, store a timestamped list of recent inputs (e.g., `Down`, `Down-Right`, `Right` + `Punch`).

### 5. Touch & Gestures
- **Tap**: Short duration touch.
- **Swipe**: Delta movement over time.
- **Pinch/Zoom**: Distance change between two touch points.

### 6. Event vs. Polling
- **Event-Driven**: Good for UI and menus (e.g., `onKeyDown`).
- **Polling**: Required for game loops. Read input state at the start of every `update` call.

## Output Format

Proposing Input System architecture:

```markdown
### Input Architecture: {Project Name}

**1. Action Map**
- (List major actions and default bindings)

**2. Device Support**
- (Keyboard/Mouse, Gamepad, Touch)

**3. Abstraction Layer**
- (Details on how Actions are polled in code)

**4. Advanced Features**
- (Deadzones, Input Buffering, Rebinding)

**5. Performance/Latency**
- (Polling frequency, event handling strategy)
```

## Examples

**Input:** "I need gamepad support for my platformer with a 'Jump' and 'Dash' action."

**Expected Action:** Define action-based mapping with deadzones.

**Response:**
### Input Architecture: Platformer X
- **Actions**:
    - `Move`: Left Stick (Analog) / WASD.
    - `Jump`: Button South (A) / Space.
    - `Dash`: Button West (X) / Left Shift.
- **Deadzones**: 0.15 axial deadzone for `Move`.
- **Buffering**: 100ms "Coyote Time" and 100ms pre-land jump buffering.

## Resources

- [Game Programming Patterns: Input Buffer](https://gameprogrammingpatterns.com/input-handler.html)
- [W3C Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API)
- [Unity Input System Docs](https://docs.unity3d.com/Packages/com.unity.inputsystem@1.0/manual/index.html)

## Related Skills

- **[game-math](../game-math/SKILL.md)**: Normalizing stick vectors and applying sensitivity curves.
- **[game-ai-logic](../game-ai-logic/SKILL.md)**: Passing input actions to State Machines.
- **[p5js-creative-coding](../p5js-creative-coding/SKILL.md)**: Basic keyboard/mouse event handling.
