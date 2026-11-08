---
name: threejs-geometries
description: Advanced skill for Three.js geometries, vertices, mesh data. Use for BufferGeometry, primitives, vertex manipulation, model loading (GLTF/OBJ).
version: 1.0.0
---

# Three.js Geometries & Models

Purpose: create, modify, and load 3D shapes. Standard primitives, `BufferGeometry`, vertex attributes, model loaders.

## When to Use

Trigger:
- Create standard shapes.
- Alter vertices (procedural terrain, displacement).
- Generate custom geometry.
- Load 3D models (GLTF/OBJ/FBX).

## Instructions

1. **Standard Geometries**: Default to `THREE.BoxGeometry`, `THREE.SphereGeometry`, `THREE.PlaneGeometry`.
2. **BufferGeometry**: For custom shapes, use `THREE.BufferGeometry`. Define `Float32Array` buffers for `position`, `normal`, `uv`. Bind via `THREE.BufferAttribute`.
3. **Vertex Manipulation**: To displace/animate vertices on CPU, modify `geometry.attributes.position.array` and set `needsUpdate = true`. (For speed, prefer vertex shaders in `threejs-materials`).
4. **Model Loading**: Use `GLTFLoader` for `.glb`/`.gltf`. Manage async loading and traverse model nodes to apply shadow settings/materials.
5. **Clean Memory**: Run `geometry.dispose()` on removal to prevent memory leaks.

## Output Format

1. **Geometry Strategy**: Standard vs `BufferGeometry` vs loaded model.
2. **Code**: Instantiate/load geometry + attach to `THREE.Mesh`.
3. **Attribute Management**: Accessing attributes and updating flags.

## Examples

**Input:** "How do I load a 3D model in Three.js?"
**Expected Action:**
1. Recommend GLTF + `GLTFLoader`.
2. Provide code: `import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'`.
3. Show `loader.load('model.glb', (gltf) => { scene.add(gltf.scene); })`.

## Resources

- [Three.js Geometry Docs](https://threejs.org/docs/#api/en/core/BufferGeometry)
- [GLTFLoader Documentation](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)

## Related Skills

- **[threejs](../threejs/SKILL.md)** — Core scene graph additions.
- **[threejs-materials](../threejs-materials/SKILL.md)** — Textures and shaders.
- **[level-of-detail](../level-of-detail/SKILL.md)** — Geometry complexity reduction.
