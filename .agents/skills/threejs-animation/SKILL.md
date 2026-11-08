---
name: threejs-animation
description: Advanced Three.js animation systems. Use for AnimationMixer, skeletal animation, GLTF animations, KeyframeTrack, morph targets, property animation.
---

# Three.js Animation

Purpose: animate meshes using `AnimationMixer`, keyframe tracks, skeletal/bone animation, and morph targets.

## When to Use

Trigger:
- Play imported animations (GLTF/FBX models).
- Build keyframe tracks dynamically.
- Animate morph targets (shape keys).
- *Note: For basic math-based animations, use `game-math` or basic update loops instead.*

## Instructions

1. **AnimationMixer**: Setup mixer per object. Run `mixer.update(deltaTime)` in render loop.
2. **GLTF Animations**: Load clips from `gltf.animations`. Play using:
   ```javascript
   const action = mixer.clipAction(gltf.animations[0]);
   action.play();
   ```
3. **Delta Time**: Use `THREE.Clock` for delta calculations.
4. **Blending/Transitions**: Transition between animations via `action.crossFadeTo(newAction, duration)`.
5. **Morph Targets**: Displace shape weights via `mesh.morphTargetInfluences` array.

## Output Format

1. **Animation Strategy**: Connect mixer, clips, and actions.
2. **Code**: Initialize mixer, play clip, update in tick handler.
3. **Performance**: Warn about heavy bone counts and skeletal overhead.

## Examples

**Input:** "Loaded GLTF but animation not playing."
**Expected Action:**
1. Setup `AnimationMixer(model)`.
2. Select clip from `gltf.animations` and trigger `clipAction(clip).play()`.
3. Add `mixer.update(clock.getDelta())` inside loop.

## Resources

- [Three.js Animation System](https://threejs.org/docs/#manual/en/introduction/Animation-system)
- [AnimationMixer Docs](https://threejs.org/docs/#api/en/animation/AnimationMixer)

## Related Skills

- **[threejs](../threejs/SKILL.md)** — Main update loop hooks.
- **[game-math](../game-math/SKILL.md)** — Procedural movement/kinematics.
- **[gsap](../gsap/SKILL.md)** — Timeline tweening.
