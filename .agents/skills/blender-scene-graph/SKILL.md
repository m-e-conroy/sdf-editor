---
name: blender-scene-graph
description: Expert-level Blender scene organization. Handles collections, object parenting, grouping, and naming conventions. Triggers: "organize blender", "create collection", "parent objects", "group blender objects", "clean up scene".
version: 1.0.0
---

# Blender Scene Graph Organization Skill

## When to Use

- Organize complex Blender scenes into logical hierarchies.
- Manage collections for visibility and rendering optimization.
- Set up parent-child relationships for animation or transformation inheritance.
- Implement naming conventions for large projects.

## Instructions

### 1. Collection Management
- **Create Collections**: Group related objects (e.g. "Lights", "Environment", "Characters").
- **Move to Collection**: Keep Outliner clean; move objects out of root "Scene Collection".
- **Nesting**: Use sub-collections for granular control (e.g. "Environment" > "Vegetation").

### 2. Parenting & Hierarchies
- **Set Parent**: Use parenting to establish hierarchy. Parent transforms affect children.
- **Clear Parent**: Break parent-child links when objects must act independently.
- **Origin Points**: Align origins correctly before parenting to avoid transformation offsets.

### 3. Naming Conventions
- Always rename objects descriptively.
- Use prefixes for object types (e.g. `LGT_` for lights, `CAM_` for cameras, `MESH_` for geometry).
- Capitalize and keep collection names concise.

### 4. Visibility & Render Control
- Use collections to toggle visibility in viewport and render outputs.
- Key for maintaining performance in heavy scenes.

## Output Format

Propose Scene Graph hierarchy:

```markdown
### Scene Organized: {Summary}
**New Collections:**
- {Collection Name} ({Object Count})
**Parenting Relationships:**
- {Parent} -> {Child 1, Child 2}
**Naming Updates:**
- {Old Name} -> {New Name}
```

## Related Skills

- **[blender-modeling-expert](../blender-modeling-expert/SKILL.md)**: Creating the geometry to be organized.
- **[blender-scene-artist](../blender-scene-artist/SKILL.md)**: Lighting and rendering the organized scene.
- **[blender-python-development](../blender-python-development/SKILL.md)**: Automating organization via scripts.
