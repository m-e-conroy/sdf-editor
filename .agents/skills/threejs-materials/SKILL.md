---
name: threejs-materials
description: Three.js materials, textures, shading. Use for MeshStandardMaterial, MeshPhysicalMaterial, ShaderMaterial, texture mapping, normal/roughness/metalness maps, HDR env maps, custom GLSL. Trigger: "PBR material", "threejs textures", "ShaderMaterial", "custom shader threejs", "bump map".
---

# Three.js Materials & Textures

Purpose: control Three.js surface appearance. Materials, PBR, texture loading, env maps, custom GLSL.

## When to Use

Trigger:
- Customize object appearance (shiny, matte, glass, glow, texture).
- Write custom GLSL shaders (`ShaderMaterial`, `RawShaderMaterial`).

## Instructions

1. **Choose Material**:
   - `MeshBasicMaterial`: Unlit, flat colors.
   - `MeshStandardMaterial`: Standard PBR (roughness/metalness).
   - `MeshPhysicalMaterial`: Advanced PBR (clearcoat, glass, iridescence, transmission).
   - `ShaderMaterial`: Custom GLSL.
2. **Texture Loading**: Use `THREE.TextureLoader`. Assign to maps (`map`, `normalMap`, `roughnessMap`, `metalnessMap`).
3. **Color Space**: Set `texture.colorSpace = THREE.SRGBColorSpace` for diffuse/emissive color maps. Keep data maps (normals, roughness) linear.
4. **Environment Maps**: PBR needs `envMap` (`RGBELoader`, `CubeTextureLoader`) for realistic reflections.
5. **Custom Shaders**: Use `ShaderMaterial`. Provide `vertexShader` + `fragmentShader` strings. Declare `uniforms`.

## Output Format

1. **Material Selection**: Best material choice.
2. **Code**: Instantiate material + apply textures.
3. **PBR/Shader Gotchas**: Color spaces, lighting requirements, uniform management.

## Examples

**Input:** "How do I make realistic glass in Three.js?"
**Expected Action:**
1. Recommend `MeshPhysicalMaterial`.
2. Provide code: `transmission: 1`, `opacity: 1`, `roughness: 0`, `ior: 1.5`, `thickness: 1`.
3. Note: Glass requires environment map (`envMap`).

## Resources

- [Three.js Material Docs](https://threejs.org/docs/#api/en/materials/Material)
- [The Book of Shaders](https://thebookofshaders.com/)

## Related Skills

- **[threejs](../threejs/SKILL.md)** — Core mesh setup.
- **[threejs-lighting](../threejs-lighting/SKILL.md)** — Env mapping, IBL setup.
- **[threejs-geometries](../threejs-geometries/SKILL.md)** — Custom vertex attributes.
