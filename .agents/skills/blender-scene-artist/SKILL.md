---
name: blender-scene-artist
description: Professional scene layout, lighting, materials, compositing, rendering techniques in Blender. Use for "light a scene", "create materials", "setup Cycles", "setup Eevee", "render settings", "HDRI lighting", "Principled BSDF", "camera setup", "depth of field", "compositing", "color grading", "render output", "PBR textures", "world environment", or setup/light/shade/render scenes in Blender.
version: 1.0.0
---

# Blender Scene Artist

## When to Use

Use when user asks to light scenes, create materials/shaders, configure render engines (Cycles/Eevee), set up cameras, compose shots, or produce final renders in Blender.

## Instructions

1. **Analyze Scene Goals**: Determine target regime:
   - **Photorealistic**: Cycles, HDRI, PBR materials, high sample count.
   - **Stylized**: Eevee or Cycles, custom shaders, toon shading.
   - **Architectural**: Sun lighting, clean procedural/PBR materials, high-res.
   - **Product**: Studio lighting (3-point), seamless backdrop, shallow depth of field.

2. **Scene Layout**: Group objects into collections. Establish world units. See [scene_layout.md](references/scene_layout.md).

3. **Lighting Setup**: See [lighting.md](references/lighting.md) and [cycles_world_and_lights.md](references/cycles_world_and_lights.md).
   - **3-Point Lighting**: Key (strong, 45° angle), Fill (soft, opposite key), Rim (behind subject).
   - **HDRI**: Connect Environment Texture node to World shader. PolyHaven for HDRIs.
   - **Sun Light**: Architectural/outdoor. Strength ~1000 W/m² for clear sky.
   - **Area Light**: Rectangle for window portals, disk for studio highlights.
   - **Light Power Reference**:
     - Candle: 0.05W (Point)
     - LED bulb 800lm: 2.1W (Point)
     - Fluorescent tube: 4.5W (Area Rectangle)
     - Car headlight: 22W (Spot 125°)

4. **Materials & Shaders**: See [shader_nodes_key.md](references/shader_nodes_key.md) and [materials.md](references/materials.md).
   - **Principled BSDF**: Default shader. Tweak Base Color, Roughness, Metallic.
   - **PBR Map Setup**: Connect Albedo → Base Color, Normal Map → Normal, Roughness → Roughness.
   - **Glass**: Use Glass BSDF or Principled with Transmission = 1.0.
   - **Metals**: Set Metallic = 1.0, low Roughness. Use color for metal tint.
   - **Subsurface Scattering**: Skin, wax, marble. Adjust Subsurface Weight + Radius.
   - **Emission**: Glowing elements. Adjust Emission Color + Strength.

5. **Camera Setup**: See [cameras.md](references/cameras.md).
   - **Focal Length**: 35mm general, 50mm portrait, 85mm+ telephoto, 24mm wide angle.
   - **Depth of Field**: Enable on camera. Set focus target + lower F-Stop for more blur.
   - **Composition**: Rule of thirds. Enable composition guides in viewport settings.
   - **Clipping**: Clip Start/End to encompass scene without z-fighting.

6. **Render Engine Configuration**:
   - **Cycles**: See [cycles_render.md](references/cycles_render.md). Enable GPU rendering. Use OpenImageDenoise. Samples: 128-512 for draft, 1024-4096 for final.
   - **Eevee**: See [eevee_render.md](references/eevee_render.md). Real-time. Enable screen space reflections, ambient occlusion, bloom.

7. **Color Management**: See [color_management.md](references/color_management.md).
   - View Transform: Use `AgX` for realistic highlight handling (replaces Filmic).
   - Exposure: Adjust in Render properties under Film.

8. **Compositing**: See [compositing.md](references/compositing.md).
   - Leverage Render Layers pipeline.
   - Common nodes: Glare (bloom), Color Balance, Lens Distortion, Vignette.

9. **Output Settings**: See [render_output.md](references/render_output.md).
   - **Still**: PNG (lossless) or EXR (float data).
   - **Animation**: Render as image sequence (never video file directly) for crash recovery.
   - **Resolution**: 1920×1080 standard, 3840×2160 for 4K.

## Output Format

Return Blender Python script (follow `blender-python-development` guidelines) or detailed UI actions with shortcuts and property panels.

## Resources

- [lighting.md](references/lighting.md)
- [cameras.md](references/cameras.md)
- [shader_nodes_key.md](references/shader_nodes_key.md)
- [materials.md](references/materials.md)
- [cycles_render.md](references/cycles_render.md)
- [eevee_render.md](references/eevee_render.md)
- [cycles_world_and_lights.md](references/cycles_world_and_lights.md)
- [color_management.md](references/color_management.md)
- [scene_layout.md](references/scene_layout.md)
- [compositing.md](references/compositing.md)
- [render_output.md](references/render_output.md)

## Related Skills

- **[blender-python-development](../blender-python-development/SKILL.md)** — Python scripting automation.
- **[blender-modeling-expert](../blender-modeling-expert/SKILL.md)** — Geometry and modifier systems.
