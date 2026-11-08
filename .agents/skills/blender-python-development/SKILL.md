---
name: blender-python-development
description: >
  Core skill for developing Blender 5.0 Python scripts, add-ons, and automation tools.
  Provides essential guidelines for safely manipulating Blender's internal data,
  managing context, and avoiding common crashes related to memory and undo systems.
---

# Blender Python Development

Foundational rules, best practices, crash-prevention for robust Blender Python scripts and add-ons.

## Core Philosophy

- **Avoid Direct Memory References**: Do not hold direct references to Blender objects, meshes, or data blocks when container is modified or undo/redo is triggered. Use names, indices, or property lookups.
- **Context is King**: Retrieve current context (`bpy.context`) dynamically. Do not store. State changes unpredictably in 3D application.
- **Strict Threading Limits**: Blender Python API is not thread-safe. Never modify Blender data from background threads. Use `bpy.app.timers` to execute thread queues on main thread.
- **Performance**: Batch API calls. Prefer low-level `bpy.data` manipulation over heavy `bpy.ops` operators unless UI updates are explicitly needed.

## Reference Documentation

Must use Markdown reference files in `references/` directory when building complex scripts. Contain official guidelines and pitfalls for Blender 5.0 Python:

1. **Best Practices**: `references/info_best_practice.md`
2. **Crashes & Error Prevention**: `references/info_gotchas_crashes.md`
3. **Internal Data & Python Objects**: `references/info_gotchas_internal_data_and_python_objects.md`
4. **Mesh Manipulation Gotchas**: `references/info_gotchas_meshes.md`
5. **Operator Nuances**: `references/info_gotchas_operators.md`
6. **Armatures & Bones**: `references/info_gotchas_armatures_and_bones.md`
7. **File Paths & Encoding**: `references/info_gotchas_file_paths_and_encoding.md`
8. **Threading Limits**: `references/info_gotchas_threading.md`
9. **Tips & Tricks**: `references/info_tips_and_tricks.md`
10. **Quickstart**: `references/info_quickstart.md`

## Instructions for Agent

1. **Verify State Before Action**: Confirm active object (`bpy.context.active_object`) and mode (`bpy.context.mode`) before running modal operators or context-sensitive scripts.
2. **Handle Errors Gracefully**: Catch exceptions. Watch for `ReferenceError` when accessing stale RNA properties.
3. **Register Add-ons**: Follow strict rules for `bl_info` dict. Use `bpy.utils.register_class()` for new UI elements.
4. **Data Cleanup**: Explicitly call `bpy.data.objects.remove(obj)` (and mesh/material equivalents). Do not rely on Python garbage collection.

## Execution Checklist

- [ ] Context operations validated against current mode (Object vs Edit).
- [ ] Direct data references avoided where modification occurs.
- [ ] `bpy.ops` overhead evaluated vs `bpy.data` native manipulation.
- [ ] No threading violations (all Blender API calls on main thread).
