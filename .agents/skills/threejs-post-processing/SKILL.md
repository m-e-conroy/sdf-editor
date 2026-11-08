---
name: threejs-post-processing
description: Advanced skill for Three.js post-processing. Use for EffectComposer, bloom, depth of field, SSR, anti-aliasing (SMAA, FXAA), custom shader passes.
version: 1.0.0
---

# Three.js Post-Processing

Purpose: apply full-screen image effects using `EffectComposer`, standard passes (bloom, anti-aliasing), and custom shader passes.

## When to Use

Trigger:
- Implement visual effects: glowing lights (bloom), focal blur (depth of field), color grading, glitch effects, or outlines.

## Instructions

1. **EffectComposer**: Replaces standard `renderer.render(scene, camera)` with `composer.render()`.
2. **Basic Setup**: Initialize `RenderPass` first to draw base scene.
3. **Common Passes**:
   - `UnrealBloomPass`: For glow. Props: `threshold`, `strength`, `radius`.
   - `SMAAPass` / `FXAAPass`: Anti-aliasing (standard MSAA is disabled in post-processing).
   - `OutputPass`: Position at end of chain for correct sRGB color conversion.
4. **Custom ShaderPass**: Use `ShaderPass` with GLSL. Fragment shader must sample base scene via `tDiffuse` texture.
5. **Resizing**: Call `composer.setSize(width, height)` inside resize event handler.

## Output Format

1. **Composer Chain**: Order of passes (RenderPass → Effects → OutputPass).
2. **Code**: Initialization imports (`three/addons/postprocessing/...`) and setup.
3. **Update Loop**: Call `composer.render()` inside tick handler.

## Examples

**Input:** "How do I make my objects glow?"
**Expected Action:**
1. Recommend `EffectComposer` with `UnrealBloomPass`.
2. Provide imports for `EffectComposer`, `RenderPass`, `UnrealBloomPass`, `OutputPass`.
3. Provide code chaining the passes.
4. Adjust mesh material `emissive` color/intensity to trigger bloom. Run `composer.render()` in loop.

## Resources

- [Three.js Post-Processing Guide](https://threejs.org/docs/#manual/en/introduction/How-to-use-post-processing)
- [EffectComposer Source/Examples](https://github.com/mrdoob/three.js/tree/master/examples/jsm/postprocessing)

## Related Skills

- **[threejs](../threejs/SKILL.md)** — Core setup and render loop.
- **[threejs-materials](../threejs-materials/SKILL.md)** — Shaders for custom passes.
