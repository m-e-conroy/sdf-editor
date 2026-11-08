---
name: threejs-lighting
description: Three.js lights, shadows, environment mapping. Use for DirectionalLight, PointLight, SpotLight, AmbientLight, shadow maps, PCFSoftShadowMap, HDR environments. Trigger: "threejs shadows", "lighting scene", "HDRI threejs", "soft shadows", "light casting".
---

# Three.js Lighting & Shadows

Purpose: control scene illumination, shadow mapping, and image-based lighting (IBL).

## When to Use

Trigger:
- Light scenes, configure shadows, use HDRI for PBR reflections and ambient lighting.

## Instructions

1. **Light Types**:
   - `AmbientLight` / `HemisphereLight`: Flat base illumination.
   - `DirectionalLight`: Sunlight, parallel rays.
   - `PointLight`: Bulbs, point emitters.
   - `SpotLight`: Flashlights, cone emitters.
2. **Shadows Setup**:
   - `renderer.shadowMap.enabled = true`.
   - `light.castShadow = true` (plus mapSize/frustum).
   - `mesh.castShadow = true`.
   - `mesh.receiveShadow = true`.
3. **Shadow Quality**: Use `renderer.shadowMap.type = THREE.PCFSoftShadowMap` for soft shadows. Raise `light.shadow.mapSize.width/height` (1024/2048) for sharpness.
4. **Environment Mapping (IBL)**: Load HDR via `RGBELoader` and assign to `scene.environment` and `scene.background`.

## Output Format

1. **Lighting Plan**: Explain light selection for aesthetic goals.
2. **Code**: Light setup, shadows configuration.
3. **Troubleshooting**: Use `CameraHelper` to trace shadow cutoffs.

## Examples

**Input:** "My shadows look pixelated and are cutting off at the edges of the screen."
**Expected Action:**
1. Identify low resolution + narrow shadow camera bounds.
2. Code: Raise `light.shadow.mapSize`, adjust `light.shadow.camera` limits.
3. Suggest `THREE.CameraHelper(light.shadow.camera)` to visualize frustum.

## Resources

- [Three.js Lights Docs](https://threejs.org/docs/#api/en/lights/Light)
- [ShadowMap Documentation](https://threejs.org/docs/#api/en/lights/shadows/LightShadow)

## Related Skills

- **[threejs](../threejs/SKILL.md)** — Core renderer configuration.
- **[threejs-materials](../threejs-materials/SKILL.md)** — PBR and env maps.
