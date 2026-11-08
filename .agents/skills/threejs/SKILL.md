---
name: threejs
description: Core skill for Three.js. Use for scene setup, render loop, core concepts, or 3D web dev. Triggers on "threejs", "3D scene", "WebGL renderer", "scene graph", etc.
version: 1.0.0
---

# Three.js Core

Core setup + foundational concepts for browser 3D. Setup Scene, Camera, Renderer, Animation Loop.

For detailed needs, delegate:
- **[threejs-geometries](../threejs-geometries/SKILL.md)**: Custom shapes, model loading.
- **[threejs-materials](../threejs-materials/SKILL.md)**: Shaders, textures, PBR.
- **[threejs-lighting](../threejs-lighting/SKILL.md)**: Shadows, light types, environment maps.
- **[threejs-cameras](../threejs-cameras/SKILL.md)**: Orthographic/Perspective, OrbitControls, view math.
- **[threejs-animation](../threejs-animation/SKILL.md)**: Keyframes, skeletal systems, AnimationMixer.
- **[threejs-post-processing](../threejs-post-processing/SKILL.md)**: Bloom, DOF, custom passes.
- **[level-of-detail](../level-of-detail/SKILL.md)**: Mesh optimization (`THREE.LOD`).

## When to Use

Use when init Three.js project, setup boilerplate, understand scene graph (Scene, Object3D), resize, or write animation loop.

## Instructions

1. **Setup Boilerplate**: Instantiate triad: `THREE.Scene`, `THREE.PerspectiveCamera`, `THREE.WebGLRenderer`.
2. **Handle Resizing**: Update renderer size + camera aspect ratio on window `resize`.
3. **Animation Loop**: Use `renderer.setAnimationLoop()` (preferred) or standard `requestAnimationFrame`.
4. **Delegate**: For complex shading/geometry/post-processing, reference specific sub-skills.
5. **Modern ES Modules**: Import standard ES package (`import * as THREE from 'three';`).

## Output Format

1. **Concept Overview**: Brief explanation of pipeline.
2. **Boilerplate Code**: Runnable setup.
3. **Key Components**: Explanation of Scene, Camera, Renderer.

## Examples

**Input:** "How do I set up a basic Three.js scene?"

**Expected Action:**
1. HTML/JS with ES imports.
2. Create Scene, Camera, Renderer.
3. Add light + simple mesh (cube) for visual check.
4. Add render loop + resize handler.

## Related Skills

- **[threejs-geometries](../threejs-geometries/SKILL.md)**: Custom shapes, loading.
- **[threejs-materials](../threejs-materials/SKILL.md)**: Textures, shaders.
- **[threejs-lighting](../threejs-lighting/SKILL.md)**: Scene illumination.
- **[threejs-cameras](../threejs-cameras/SKILL.md)**: Cameras, controls.
- **[threejs-animation](../threejs-animation/SKILL.md)**: Keyframes, rigging.
- **[threejs-post-processing](../threejs-post-processing/SKILL.md)**: Compositing, shaders.
- **[level-of-detail](../level-of-detail/SKILL.md)**: LOD systems.
- **[game-math](../game-math/SKILL.md)**: Transform math.
- **[frontend-design](../frontend-design/SKILL.md)**: UI wrapper integration.

## Resources

- [Three.js Official Documentation](https://threejs.org/docs/)
- [Three.js Fundamentals](https://threejsfundamentals.org/)
- [Discover Three.js](https://discoverthreejs.com/)
