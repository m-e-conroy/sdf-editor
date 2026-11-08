---
name: game-audio
description: Interactive and spatial audio. Web Audio API, sound management, spatialization, dynamic music. Triggers: "game audio", "sfx", "spatial audio", "web audio api", "dynamic music".
version: 1.0.0
---

# Game Audio Skill

> **Purpose**: Implement immersive, reactive audio systems.

## When to Use

- Implement 3D/Spatial audio in web games.
- Manage sound effect (SFX) triggering and pooling.
- Create dynamic, layer-based music systems (Adaptive audio).
- Apply audio filters (Reverb, Low-pass, EQ) based on game state.

## Instructions

Apply audio engineering principles for games:

### 1. Web Audio API Basics
- **AudioContext**: The main graph.
- **BufferSource / MediaElement**: Audio sources.
- **GainNode**: Controls volume/envelope.
- **PannerNode**: Handles 3D spatialization.

### 2. Spatialization
- **Listener**: The player's position/orientation.
- **Panner**: The sound source's position.
- **Roll-off**: Volume decrease over distance (Linear, Exponential, Inverse).

### 3. Dynamic Music (Horizontal vs. Vertical)
- **Horizontal Re-sequencing**: Switch between musical segments based on game phase (e.g., Exploration -> Combat).
- **Vertical Re-layering**: Fade tracks (stems) in/out based on intensity (e.g., adding drums as health gets low).

### 4. Audio Management
- **Pooling**: Reuse audio nodes to prevent memory leaks and overhead.
- **Categorization**: Use Buses/Groups (Master, Music, SFX, UI) for global volume control.
- **Interrupts**: Logic for when a sound should stop or restart (e.g., only one "Sword Swing" at a time).

## Output Format

Propose Audio System:

```markdown
### Audio Architecture: {Project}

**1. Engine/API**
- (Web Audio API, Howler.js, FMOD/Wwise)

**2. Spatial Model**
- (3D vs 2D, Distance model, Occlusion strategy)

**3. Dynamic Logic**
- (Adaptive music triggers, stem management)

**4. Asset Management**
- (Preloading, formats, pooling limits)
```

## Related Skills

- **[game-math](../game-math/SKILL.md)**: Vector distance and dot product for spatial panning.
- **[threejs](../threejs/SKILL.md)**: Integrating audio with 3D scene objects (PositionalAudio).
