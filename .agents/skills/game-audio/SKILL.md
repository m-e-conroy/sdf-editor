---
name: game-audio
description: Interactive and spatial audio. Web Audio API, sound management, spatialization, dynamic music. Triggers: "game audio", "sfx", "spatial audio", "web audio api", "dynamic music".
version: 1.0.0
---

# Game Audio Skill

> **Purpose**: Implement immersive, reactive audio systems.

## When to Use

- Implement 3D/Spatial audio in WebGL or 2D games.
- Manage sound effect (SFX) triggering and asset pooling.
- Create dynamic, stem-based music systems (Adaptive audio).
- Apply real-time filters (Reverb, Low-pass, EQ) based on game state.

## Instructions

Apply audio engineering principles for games:

### 1. Web Audio API Basics
- **AudioContext**: Core audio graph.
- **BufferSource / MediaElement**: Inputs/Audio sources.
- **GainNode**: Controls volume envelope.
- **PannerNode**: Manages 3D spatialization.

### 2. Spatialization
- **Listener**: Player position and orientation vector.
- **Panner**: Audio source spatial coordinates.
- **Roll-off**: Distance attenuation models (Linear, Exponential, Inverse).

### 3. Dynamic Music (Horizontal vs. Vertical)
- **Horizontal Re-sequencing**: Switch between musical segments based on game states (e.g. Exploration to Combat transition).
- **Vertical Re-layering**: Fade stem tracks in/out dynamically based on game intensity (e.g. adding drums at low health).

### 4. Audio Architecture
- **Node Pooling**: Re-use audio nodes to prevent memory leaks and garbage collection stutters.
- **Routing Buses**: Direct outputs to specific buses (Master, Music, SFX, UI) for global volume control.
- **Interrupts**: Logic governing simultaneous sounds (e.g. limit "Sword Swing" overlap).

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

- **[game-math](../game-math/SKILL.md)**: Vector distance and dot product calculations.
- **[threejs](../threejs/SKILL.md)**: Attaching audio to 3D scene nodes (`PositionalAudio`).
