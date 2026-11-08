---
name: phaserjs
description: 2D game development using Phaser 3. Scenes, game objects, physics (Arcade/Matter), input, and asset management. Triggers: "phaser", "phaserjs", "2d game", "arcade physics", "game scene".
version: 1.0.0
---

# PhaserJS Skill

> **Purpose**: Build high-performance 2D web games using Phaser 3 framework.

## When to Use

- Create 2D arcade, platformer, or RPG games.
- Implement sprite animations and physics-based movement.
- Manage complex game states via Scenes.
- Handle multi-touch and keyboard input.

## Instructions

### 1. Scene Management
- **Lifecycle**: Implement `init()`, `preload()`, `create()`, and `update()`.
- **Modularity**: Split logic into distinct scenes (Boot, Preloader, MainMenu, Play).

### 2. Game Objects & Sprites
- **Groups**: Use `Group` or `PhysicsGroup` for batch operations and collisions.
- **Tweens**: Use `this.tweens.add()` for smooth UI and transition effects.
- **Animations**: Define animations globally; trigger playback on sprite instances.

### 3. Physics Engines
- **Arcade Physics**: Standard AABB collisions (extremely fast).
- **Matter.js**: Complex, realistic rigid bodies and constraint/joint mechanics.
- **Static vs Dynamic**: Configure stationary bodies as static (e.g. platforms).

### 4. Asset Pipeline
- **Loading**: Load resources exclusively during `preload()` phase.
- **Atlases**: Combine sprites into texture atlases to minimize WebGL draw calls.
- **Cleanup**: Dispose unused assets on scene transitions to free memory.

## Output Format

Propose Phaser Architecture:

```markdown
### Phaser Implementation: {Game Module}

**1. Scene Structure**
- (Boot, Preload, Play breakdown)

**2. Asset Strategy**
- (Spritesheets, Atlases, Audio preloading)

**3. Physics & Mechanics**
- (Physics type, collision layers, input mapping)

**4. UI & Overlay**
- (Scene-based UI vs HTML DOM overlay)
```

## Related Skills

- **[game-math](../game-math/SKILL.md)**: Vector movement.
- **[input-systems](../input-systems/SKILL.md)**: Action mapping.
- **[game-audio](../game-audio/SKILL.md)**: Sound effects.
