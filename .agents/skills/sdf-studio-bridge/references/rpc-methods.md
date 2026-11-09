# SDF Studio 3D - RPC Methods & MCP Tools Reference

SDF Studio 3D provides 19 Remote Procedure Call (RPC) methods dispatched across the WebSocket Agent Bridge (default port `8765`, token `sdf-studio-bridge`). Each method is mirrored as an MCP tool prefixed with `sdf_`.

---

## Tool & Method Directory

| MCP Tool Name | Underlying RPC Method | Description |
| :--- | :--- | :--- |
| `sdf_get_scene` | `scene.getScene` | Retrieve CSG scene graph, active selection, leaf limits, and revision counter. |
| `sdf_list_primitives` | `scene.listPrimitives` | Query all 22 analytical SDF primitives and their parameter schemas. |
| `sdf_add_primitive` | `scene.addPrimitive` | Add a single primitive shape node with transform, CSG, and material properties. |
| `sdf_create_group` | `scene.createGroup` | Create an interior CSG branch group (union, diff, intersect) or wrap existing nodes. |
| `sdf_update_node` | `scene.updateNode` | Mutate transforms, dimensions, CSG blend, materials, or modifiers. |
| `sdf_delete_node` | `scene.deleteNode` | Remove a leaf or branch group from the CSG scene tree. |
| `sdf_duplicate_node` | `scene.duplicateNode` | Clone an existing node or subtree with optional positional offset. |
| `sdf_move_node` | `scene.moveNode` | Reparent and reorder nodes within the CSG evaluation hierarchy. |
| `sdf_ungroup` | `scene.ungroup` | Dissolve a group node and release its children to the parent level. |
| `sdf_clear_scene` | `scene.clearScene` | Wipe current scene back to empty canvas or default starter sphere. |
| `sdf_apply_scene_recipe` | `scene.applyRecipe` | Atomic batch synthesis of entire models or subtrees with single-step undo. |
| `sdf_history` | `scene.history` | Step forward or backward through transaction undo/redo history. |
| `sdf_select_node` | `ui.selectNode` | Set active selection in the editor viewport and inspector tree. |
| `sdf_set_camera` | `ui.setCamera` | Position camera perspective (`front`, `right`, `top`, `perspective`, azimuth, elevation, distance). |
| `sdf_take_snapshot` | `sense.takeSnapshot` | Capture base64 render views (`current`, `front`, `top`, `isometric`, `contact_sheet`). |
| `sdf_get_bounds` | `sense.getBounds` | Measure analytical/sampled bounding box `[min, max, size, center]` and volume. |
| `sdf_sample_distance` | `sense.sampleDistance`| Query true signed distance values and nearest nodes for arbitrary 3D test points. |
| `sdf_project` | `file.project` | Save or load complete `.sdf.json` workspace project files to disk. |
| `sdf_export_mesh` | `file.exportMesh` | Extract polygonal mesh (`glb`, `obj`) or standalone GLSL shader code. |

---

## Core Method Specifications

### 1. `scene.getScene` (`sdf_get_scene`)
- **Inputs**:
  - `includeDimensions` (boolean, optional): Include full primitive dimension objects.
- **Returns**:
  ```json
  {
    "scene": { "id": "root", "type": "group", "children": [...] },
    "revision": 4,
    "selection": "node-12",
    "counts": {
      "leaves": 18,
      "instructions": 36,
      "groups": 6,
      "depth": 3
    }
  }
  ```

### 2. `scene.applyRecipe` (`sdf_apply_scene_recipe`)
- **Inputs**:
  - `recipe`: Object containing:
    - `mode` (`"replace"` | `"append"`): Replace root scene or append as subtree.
    - `dryRun` (boolean): Validate without mutating scene state.
    - `nodes`: Array of `SceneRecipeNode` (nested primitives and groups).
  - `expectedRevision` (number, optional): Optimistic lock against concurrent edits.
- **Returns**:
  ```json
  {
    "revision": 5,
    "refs": {
      "torso": "node-101",
      "head": "node-102"
    },
    "counts": {
      "leaves": 28,
      "instructions": 52,
      "depth": 4
    },
    "warnings": []
  }
  ```

### 3. `sense.takeSnapshot` (`sdf_take_snapshot`)
- **Inputs**:
  - `views`: Array of `"current" | "front" | "right" | "top" | "isometric" | "contact_sheet"` (default: `["current"]`).
  - `width`: Number between 64 and 1024 (default: `512`).
  - `height`: Number between 64 and 1024 (default: `512`).
  - `format`: `"png" | "jpeg" | "webp"` (default: `"png"`).
  - `showGrid`: boolean (default: `false`).
  - `highlightNodeId`: string (optional, highlights node outline).
- **Returns**:
  ```json
  {
    "images": [
      {
        "view": "isometric",
        "dataUrl": "data:image/png;base64,...",
        "width": 512,
        "height": 512,
        "mimeType": "image/png"
      }
    ]
  }
  ```

### 4. `sense.sampleDistance` (`sdf_sample_distance`)
- **Inputs**:
  - `points`: Array of `[x, y, z]` coordinates (up to 256 points).
  - `nodeId`: Optional node ID to sample local distance rather than global scene.
- **Returns**:
  ```json
  {
    "samples": [
      { "point": [0.0, 1.2, 0.0], "distance": -0.045, "nearestNodeId": "node-head" },
      { "point": [0.0, 3.0, 0.0], "distance": 0.82, "nearestNodeId": "node-hair" }
    ]
  }
  ```
  *(Negative distance indicates point inside geometry; positive indicates exterior surface clearance).*

### 5. `file.exportMesh` (`sdf_export_mesh`)
- **Inputs**:
  - `format`: `"glb" | "obj" | "glsl"`.
  - `resolution`: `32 | 64 | 128` (Marching Cubes resolution).
  - `filename`: string (e.g. `exports/hero_model.glb`).
  - `overwrite`: boolean (default: `false`).
- **Returns**:
  ```json
  {
    "filename": "exports/hero_model.glb",
    "bytes": 284920,
    "format": "glb"
  }
  ```

---

## Error Codes & Fault Handling

| Error Code | Cause | Recommended Action |
| :--- | :--- | :--- |
| `REVISION_CONFLICT` | Stale revision passed to `expectedRevision`. | Call `sdf_get_scene` to fetch latest revision counter, rebase edits, and retry. |
| `MAX_LEAVES_EXCEEDED` | Attempted to load or add more than 32 leaf nodes. | Combine duplicate shapes, leverage `radialRepeat`/`linearCount`, or cull minor details. |
| `MAX_INSTRUCTIONS_EXCEEDED` | CSG instruction count exceeds 64. | Flatten deeply nested groups or convert multiple unions into a single root group. |
| `STACK_OVERFLOW` | CSG nesting depth exceeds 8 levels. | Flatten hierarchy; branch groups should rarely exceed 3–4 nesting levels. |
| `DISCONNECTED` | Browser client disconnected or bridge paused. | Verify SDF Studio web app is open and token is paired (`#bridge=sdf-studio-bridge`). |
| `INVALID_DIMENSIONS` | Out-of-bounds parameter on primitive shape. | Check `primitives-reference.md` for parameter minimum and maximum bounds. |
