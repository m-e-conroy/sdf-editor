---
name: blender-modeling-expert
description: Professional modeling techniques in Blender, including meshes, topology, modifiers, and Geometry Nodes. Use for "model a character", "build environment", "retopologize mesh", "geometry nodes setup", "hard surface modeling", "create mesh", "add modifier", "boolean operation", "subdivision surface", "sculpt base mesh", "edge flow", "loop cut", "bevel edges", or any request to create or edit 3D geometry in Blender.
version: 1.0.0
---

# Blender Modeling Expert

## When to Use

Model objects, build meshes, apply modifiers, setup Geometry Nodes, retopologize, or create any 3D geometry in Blender.

## Instructions

1. **Identify Workflow**:
   - **Hard-surface**: Machinery, weapons, architecture. Use sharp edges, bevels, non-destructive booleans.
   - **Organic**: Characters, terrain, foliage. Use subdivision surface, smooth shading, fluid edge flow.
   - **Procedural**: Scatter systems, parametric objects. Use Geometry Nodes or procedural modifier stacks.

2. **Primitive Selection**: Start from simplest primitive. See [mesh_primitives_and_structure.md](references/mesh_primitives_and_structure.md).
   - Cube: buildings, boxes. Cylinder: pipes, limbs. Sphere: organic heads.
   - Plane: terrains, plates. Circle: holes, caps.

3. **Core Edit Operations**: Shape meshes using standard tools. See references:
   - [mesh_editing_core.md](references/mesh_editing_core.md) — Extrude, merge, delete, knife, bisect, normals, cleanup.
   - [mesh_editing_edges.md](references/mesh_editing_edges.md) — Loop cut, bevel edges, bridge edge loops, subdivide.
   - [mesh_editing_faces.md](references/mesh_editing_faces.md) — Inset, extrude faces, fill, grid fill, booleans.

4. **Topology Guidelines**:
   - Keep mesh in quads for curved forms. N-gons OK on flat surfaces only.
   - Edge loops should follow underlying muscle/form flows (organic models).
   - Merge double vertices (`Merge by Distance`) to keep mesh clean.
   - Retopology guide: [retopology.md](references/retopology.md).

5. **Non-Destructive Modifiers**: Leverage stack before applying. See references:
   - [modifiers_generate.md](references/modifiers_generate.md) — Subdivision Surface, Mirror, Array, Bevel, Boolean, Solidify, Screw, Skin, Remesh, Decimate, Wireframe, Multiresolution.
   - [modifiers_deform.md](references/modifiers_deform.md) — Simple Deform, Lattice, Shrinkwrap, Curve, Displace, Cast, Smooth, Wave.

6. **Standard Modifier Stacks**:
   - **Hard-surface**: Mirror → Solidify → Bevel → Subdivision Surface.
   - **Organic**: Mirror → Subdivision Surface.
   - **Architecture**: Array → Boolean → Bevel.
   - **Quick volume**: Skin → Subdivision Surface.

7. **Procedural Systems**: Scatter, instancing, parametric geometry. Use Geometry Nodes. See [geometry_nodes_overview.md](references/geometry_nodes_overview.md).

8. **Pre-delivery Validation**:
   - Check face orientation (normals). Recalculate if flipped (`Shift+N`).
   - Remove duplicate vertices (`M` → By Distance).
   - Apply transforms (specifically scale, `Ctrl+A`) before stacking modifiers.
   - Test subdivision rendering level.

## Output Format

Return Blender Python script (follow `blender-python-development` guidelines) or detailed step-by-step UI actions with exact pathways and shortcuts.

## Resources

- [mesh_primitives_and_structure.md](references/mesh_primitives_and_structure.md)
- [mesh_editing_core.md](references/mesh_editing_core.md)
- [mesh_editing_edges.md](references/mesh_editing_edges.md)
- [mesh_editing_faces.md](references/mesh_editing_faces.md)
- [modifiers_generate.md](references/modifiers_generate.md)
- [modifiers_deform.md](references/modifiers_deform.md)
- [retopology.md](references/retopology.md)
- [geometry_nodes_overview.md](references/geometry_nodes_overview.md)

## Related Skills

- **[blender-python-development](../blender-python-development/SKILL.md)** — Scripting automation.
- **[blender-scene-artist](../blender-scene-artist/SKILL.md)** — Lighting, materials, shading.
