---
name: sdf-studio-bridge
description: Drive and automate SDF Studio 3D (sdf-editor) via its MCP server and WebSocket Agent Bridge. Construct CSG procedural models, apply smooth boolean blending (k), shell thickness, bend, twist, radial array, symmetry, and linear count modifiers, query spatial SDF distance, render snapshots, and export meshes. Triggers on "sdf-editor", "sdf studio", "sdf bridge", "sdf mcp", "sdf_apply_scene_recipe", "sdf_get_scene", "sdf procedural modeling", "signed distance field editor", "boolean blend smooth", "smooth minimum k", "smin", "shell thickness", "bend modifier", "twist modifier", "radial array", "radial repeat", "symmetry mirror", "linear count", "linear repetition", "round radius".
version: 1.1.0
---

# SDF Studio Bridge

## When to Use

Use this skill whenever an agent needs to programmatically inspect, author, modify, or export 3D scenes in **SDF Studio 3D** (`sdf-editor`) via the MCP server or the live WebSocket Agent Bridge.

Triggers on:
- "sdf-editor", "sdf studio", "sdf bridge", "sdf mcp"
- "sdf_apply_scene_recipe", "sdf_get_scene", "sdf procedural modeling"
- "signed distance field editor"
- "boolean blend smooth", "smooth minimum k", "smin", "blend radius"
- "shell thickness", "shell thick", "hollow shell"
- "bend modifier", "bend factor", "curved screen", "curved surface"
- "twist modifier", "twist factor", "spatial twist"
- "radial array", "radial repeat", "polar repetition"
- "symmetry mirror", "mirror axes", "bilateral symmetry"
- "linear count", "linear repetition", "linear spacing"
- "round radius", "fillet edges"

---

## Architecture & Connection

```
+-------------------------------------------------------------+
| AI Agent / Host                                            |
|   | (Stdio MCP Tools: sdf_*)                                |
|   v                                                         |
| MCP Server (`mcp-server/src/index.ts`)                     |
|   | (WebSocket Relay on ws://localhost:8765)                |
|   v                                                         |
| SDF Studio 3D Browser App (`src/bridge/AgentBridge.ts`)     |
|   | Dispatcher -> SceneGraph -> WebGL GLSL Raymarcher       |
+-------------------------------------------------------------+
```

- **Default Port**: `8765`
- **Default Pairing Token**: `sdf-studio-bridge` (Browser pairs automatically via URL hash `#bridge=sdf-studio-bridge`).
- **Transaction Safety**: All changes update a monotonic revision integer. Pass `expectedRevision` to prevent race conditions.
- **Single-Undo Guarantee**: High-level commands like `scene.applyRecipe` commit as a single undoable transaction.

---

## Instructions

### 1. Inspect Active Scene & Limits
1. Call `sdf_get_scene` to retrieve current scene hierarchy, active selection, and counts:
   ```json
   { "includeDimensions": true }
   ```
2. Note the `revision` number and check `counts.leaves`. Hard limit is **32 leaves** (`MAX_LEAF_COUNT = 32`).
3. Call `sdf_list_primitives` if looking up available geometry types or dimension parameter limits.

### 2. Plan Geometry Under Budget & Sculpt with Modifiers
1. **Deconstruct Subject**: Break model into logical CSG groups (`head`, `chassis`, `limbs`, `controls`, `pedestal`).
2. **Budget Constraint**: Ensure total leaf primitives across all groups $\le 32$.
3. **Master SDF Modifiers & CSG Blends**:

   #### A. Smooth Boolean Blending (`blend.radius` / $k$)
   - **Syntax**: `blend: { mode: "smooth_polynomial", radius: k }` on union, difference, or intersection.
   - **Math**: Evaluates Inigo Quilez quadratic polynomial smooth minimum `smin(a, b, k)` or smooth difference `smaxPolynomial(a, -b, k)`.
   - **Material Interpolation**: Blended regions seamlessly mix colors, roughness, and metalness across the transition zone.
   - **Practical $k$ Regimes**:
     - **$k = 0.03 - 0.08$**: Mechanical welds, machined metal fillets, soft panel seams, car body joints.
     - **$k = 0.12 - 0.25$**: Organic anatomy, neck-to-torso, deltoid-to-arm, stem-to-leaf, thigh-to-hip connections.
     - **$k \ge 0.30$**: Viscous fluids, melting wax, organic blob merges.
     - **$k = 0.0$ (`mode: "hard"`)**: Clean mechanical cuts, panel gaps, glass inserts, discrete fasteners.

   #### B. Shell Thickness (`modifiers.shellThickness`)
   - **Syntax**: `modifiers: { shellThickness: t }` (where $t > 0$).
   - **Math**: Evaluates $d_{\text{shell}} = |d| - t$. Hallows out any solid shape into an open or enclosed hollow hull of wall thickness $t$.
   - **Primitive Saver**: Replaces a 2-leaf outer-minus-inner CSG subtraction with **1 single leaf**.
   - **Use Cases**: Helmets, lampshades, pipes, architectural domes, bowls, vases, car body shells, hollow armor. Combine with a CSG difference cutter to create open cockpits, windows, or entrance apertures.

   #### C. Coordinate Bending & Depth Mapping (`modifiers.bendFactor`)
   - **Syntax**: `modifiers: { bendFactor: k }` (typically $k \in [-1.5, 1.5]$).
   - **Math**: Rotates local $p.xy$ by angle $k \cdot p.x$.
   - **The Depth Mapping Trick**: In local space, `bendFactor` bends $X$ into $Y$. When modeling a front-facing subject (like a curved CRT television tube or windshield), rotate the node by `rotationDeg: [-90, 0, 0]`. This maps local $Y$ to world $Z$ (depth), allowing horizontal width ($X$) to bend smoothly backward into depth ($Z$) without distorting height!
   - **Use Cases**: Curved CRT television tubes, curved automotive windshields, aerodynamic spoilers, curved shields, horns, claws, banana boots, expressive arched eyebrows.

   #### D. Spatial Twisting (`modifiers.twistFactor` or `twist`)
   - **Syntax**: `modifiers: { twistFactor: k }` (typically $k \in [-2.0, 2.0]$).
   - **Math**: Rotates local $p.xz$ progressively around the vertical $Y$ axis by angle $k \cdot p.y$.
   - **Use Cases**: Drills, screws, candy canes, rope cords, stylized anime/manga hair spirals, tornado funnels, helical architectural columns.

   #### E. Radial Array / Polar Repetition (`modifiers.radialRepeat`)
   - **Syntax**: `modifiers: { radialRepeat: N }` ($N \in [2, 24]$).
   - **Math**: Folds the $XZ$ domain into $N$ equal angular sectors around local $Y = 0$.
   - **Origin Behavior**: Repeats space relative to local $(x=0, z=0)$. Geometry extending off-axis radiates symmetrically around the origin for **1 single leaf cost**!
   - **Use Cases**: Gear cogs, turbine blades, wheel spokes, studded collars, spiked bracelets, radial bolt rings, spiky hair crowns.
   - *Note on Organic Micro-variations*: When distinct organic jitter, individual tilt/droop, or asymmetric coloring is required (such as daisy petals), author explicit leaves within the 32-leaf budget.

   #### F. Coordinate Symmetry Mirroring (`modifiers.mirrorAxes` or `mirrorAxis`)
   - **Syntax**: `modifiers: { mirrorAxes: [true, false, false] }` or `modifiers: { mirrorAxis: "x" }`.
   - **Math**: Folds coordinate space via $|p.x|, |p.y|, |p.z|$.
   - **Primitive Saver**: Instantly duplicates geometry across the origin plane for **1 leaf cost**.
   - **Multi-Axis Symmetry**: `mirrorAxes: [true, false, true]` creates 4 symmetric legs, wheels, or corner pillars in a single primitive!
   - **Use Cases**: Bilateral character limbs, eyes, ears, wings, jet thrusters, vehicle side mirrors, 4-corner table legs.

   #### G. Bounded Linear Count & Spacing (`modifiers.linearCount` & `linearSpacing`)
   - **Syntax**: `modifiers: { linearCount: N, linearSpacing: S }` ($N \in [1, 16]$, $S > 0$).
   - **Math**: Replicates space along the local $X$ axis within bounded limits $[-S(N-1)/2, +S(N-1)/2]$.
   - **Bilateral Symmetry Trick (`linearCount: 3`)**: Spacing at $-S, 0, +S$. The center instance ($x=0$) is hidden inside the torso or hull, producing two clean symmetric outer appendages at $\pm S$ for **1 leaf cost**!
   - **Use Cases**: Radiator cooling fins, stair steps, ladder rungs, rack gear teeth, ribcages, tank tread links.

   #### H. Round Radius (`modifiers.roundRadius`)
   - **Syntax**: `modifiers: { roundRadius: R }` ($R > 0$).
   - **Math**: Evaluates $d - R$. Bevels and fillets sharp geometric edges on `box`, `pyramid`, `hexagonal_prism`, `cone`.
   - **Use Cases**: Upholstered cushions, leather pads, electronic chassis bezels, chamfered metal blocks.

---

### 3. Synthesize via Scene Recipe (`sdf_apply_scene_recipe`)
1. Structure payload with `mode: "replace"` (or `"append"`) and named `ref` tags:
   ```json
   {
     "recipe": {
       "mode": "replace",
       "nodes": [
         {
           "ref": "root_model",
           "name": "SciFi Speeder",
           "type": "group",
           "operation": "union",
           "children": [...]
         }
       ]
     }
   }
   ```
2. If testing validity before committing, set `"dryRun": true`.
3. Check response `counts.leaves` ($\le 32$) and note the returned `refs` mapping for subsequent surgical edits.

### 4. Surgical Incremental Updates (`sdf_update_node`)
1. When tuning colors, scales, or positions, avoid re-sending the whole tree.
2. Use the `nodeId` returned in `refs`:
   ```json
   {
     "nodeId": "node-head-ref",
     "material": { "color": "#f87171", "roughness": 0.4 },
     "position": [0.0, 1.5, 0.0]
   }
   ```

### 5. Verify & Sense the Model
1. Call `sdf_set_camera` to frame the subject:
   ```json
   { "view": "perspective", "distance": 4.5, "target": [0.0, 0.0, 0.0] }
   ```
2. Call `sdf_take_snapshot` to capture visual evidence for aesthetic review:
   ```json
   { "views": ["perspective", "front", "right", "top", "contact_sheet"], "width": 512, "height": 512 }
   ```
   *(Note: The supported named views are `perspective`, `front`, `right`, `top`, and `contact_sheet`.)*
3. Call `sdf_get_bounds` to verify physical dimensions:
   ```json
   { "tight": true, "includeVolume": true }
   ```
4. Call `sdf_sample_distance` to verify clearance or surface penetration:
   ```json
   { "points": [[0, 0, 0], [0, 1.2, 0]] }
   ```

### 6. Export Deliverables (`sdf_export`)
1. Export polygonal geometry or shader code to the project workspace:
   - For 3D meshes:
     ```json
     { "format": "glb", "resolution": 64, "filename": "exports/model.glb", "overwrite": true }
     ```
   - For standalone WebGL shaders:
     ```json
     { "format": "glsl", "filename": "exports/model.frag" }
     ```

---

## Technical Constraints & Safety Rules

- **Strict Primitive Cap**: `MAX_LEAF_COUNT = 32`. Never exceed 32 leaf shapes.
- **Max Instructions**: `MAX_INSTRUCTIONS = 64`.
- **Max Tree Depth**: `MAX_STACK_DEPTH = 8`. Keep branch nesting to 3–4 levels.
- **Atomic Undo**: When generating complex models, always use `sdf_apply_scene_recipe`. Do not spam 30 sequential `sdf_add_primitive` calls, as that pollutes the undo history.
- **Handling Revision Conflicts**: If an operation fails with `REVISION_CONFLICT`, re-call `sdf_get_scene` to fetch the fresh revision integer and retry.

---

## Output Format

When creating or modifying an SDF scene for the user, report:
1. **Model Summary**: Name, structural theme, and total primitive leaf count ($\le 32$).
2. **Key Parameters**: CSG operations, modifier choices (symmetry, repeats, blends).
3. **Verification**: Bounds, snapshot status, and mesh export paths.

---

## Examples

### Example: Sci-Fi Speeder Bike with Complete Modifier Suite
```json
{
  "recipe": {
    "mode": "replace",
    "nodes": [
      {
        ref: "speeder_root",
        name: "Hover Speeder",
        type: "group",
        operation: "union",
        children: [
          // 1. Chassis: Rounded Box with Smooth Nose Blend
          {
            ref: "chassis_core",
            name: "Main Fuselage",
            type: "box",
            dimensions: { size: [0.45, 0.35, 1.40] },
            position: [0.0, 0.40, 0.0],
            modifiers: { roundRadius: 0.08 },
            material: { color: "#334155", roughness: 0.35, metalness: 0.70 }
          },
          // 2. Windshield: Bent Box curved backward into depth (Depth Mapping Trick)
          {
            ref: "canopy_windshield",
            name: "Curved Windshield",
            type: "box",
            dimensions: { size: [0.38, 0.04, 0.32] },
            position: [0.0, 0.82, 0.25],
            rotationDeg: [-90, 0, 0],
            modifiers: { bendFactor: -0.22, roundRadius: 0.04 },
            material: { color: "#38bdf8", roughness: 0.10, metalness: 0.20 }
          },
          // 3. Cockpit Tub: Shelled Hollow Cavity (1 leaf!)
          {
            ref: "cockpit_hollow",
            name: "Hollow Cockpit Tub",
            type: "box",
            dimensions: { size: [0.32, 0.24, 0.55] },
            position: [0.0, 0.58, -0.15],
            modifiers: { shellThickness: 0.035, roundRadius: 0.04 },
            material: { color: "#1e293b", roughness: 0.85, metalness: 0.05 }
          },
          // 4. Paired Twin Turbo Thrusters via Bilateral Symmetry (1 leaf!)
          {
            ref: "thrusters_pair",
            name: "Twin Thrusters (Symmetric)",
            type: "pipe",
            dimensions: { radius: 0.22, thickness: 0.04, height: 0.45 },
            position: [0.55, 0.45, -1.20],
            modifiers: { mirrorAxes: [true, false, false] },
            material: { color: "#0f172a", roughness: 0.40, metalness: 0.85 }
          },
          // 5. Turbine Exhaust Blades via Radial Array (1 leaf!)
          {
            ref: "turbine_blades",
            name: "Turbine Blades Ring",
            type: "cone",
            dimensions: { radius: 0.08, height: 0.18 },
            position: [0.55, 0.45, -1.55],
            rotationDeg: [90, 0, 0],
            modifiers: { radialRepeat: 6, mirrorAxes: [true, false, false] },
            material: { color: "#f59e0b", roughness: 0.20, metalness: 0.90 }
          },
          // 6. Engine Cooling Vents via Linear Repetition (1 leaf!)
          {
            ref: "cooling_vents",
            name: "Radiator Vent Slats",
            type: "box",
            dimensions: { size: [0.015, 0.12, 0.04] },
            position: [0.0, 0.65, 0.80],
            modifiers: { linearCount: 5, linearSpacing: 0.14 },
            material: { color: "#0284c7", roughness: 0.50, metalness: 0.60 }
          },
          // 7. Steering Handles with Smooth Polynomial Fillet Joint
          {
            ref: "steering_handle",
            name: "Handlebars",
            type: "capsule",
            dimensions: { radius: 0.035, height: 0.42 },
            position: [0.0, 0.90, 0.10],
            rotationDeg: [0, 0, 90],
            operation: "union",
            blend: { mode: "smooth_polynomial", radius: 0.08 },
            material: { color: "#f8fafc", roughness: 0.20, metalness: 0.90 }
          }
        ]
      }
    ]
  }
}
```

---

## Resources

- [Primitives Reference](references/primitives-reference.md) — All 22 primitive types, dimension fields, and defaults.
- [RPC Methods Reference](references/rpc-methods.md) — Full schema of all 19 bridge tools and methods.
- [Limits & Techniques](references/limits-and-best-practices.md) — Comprehensive guide on GPU limits, CSG blend mathematics ($k$), and the full modifier suite (`shellThickness`, `bendFactor`, `twistFactor`, `radialRepeat`, `mirrorAxes`, `linearCount`, `roundRadius`).
- [Recipe Validator Script](scripts/validate-recipe.ts) — Node/TS utility to test recipes against constraints and modifiers.
- [Sample Companion Robot Asset](assets/sample-recipe.json) — Validated complete CSG recipe JSON.

## Related Skills

- **[signed-distance-fields](../signed-distance-fields/SKILL.md)** — Mathematical foundations and GLSL formulas for SDFs.
- **[threejs](../threejs/SKILL.md)** — WebGL viewport integration and rendering.
- **[blender-workflow-recipes](../blender-workflow-recipes/SKILL.md)** — Importing exported GLB models into Blender.
