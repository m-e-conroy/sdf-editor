# Implementation Roadmap: SDF Studio 3D

> **Document Version:** 1.0.0  
> **Status:** All Milestones (1 through 5) Complete - Production Ready  
> **Target Path:** `projects/sdf-editor/docs/ROADMAP.md`  

---

## Milestone Overview

```
[M1: Core Raymarching Viewport] ✅ Complete
             │
             ▼
[M2: CSG Tree AST & Shader Compiler] ✅ Complete
             │
             ▼
[M3: Blender-Inspired Studio UI & Gizmos] ✅ Complete
             │
             ▼
[M4: Lookdev, Soft Shadows & Modifiers] ✅ Complete
             │
             ▼
[M5: File Serialization & Mesh/Shader Export] ✅ Complete
```

---

## Milestone 1: Core Raymarching Viewport & Foundation - ✅ Complete
**Primary Focus:** Graphics engine, Three.js fullscreen quad, GLSL sphere tracer, base primitives, camera controls.

- **Tasks**:
  - [x] **M1.1**: Initialize project repository structure (`package.json`, Vite, Vanilla TypeScript, Three.js, CSS custom properties / PostCSS).
  - [x] **M1.2**: Implement screen-space quad Three.js setup with custom `ShaderMaterial` and resolution handling.
  - [x] **M1.3**: Build core GLSL sphere tracing loop with adaptive step count and hit detection.
  - [x] **M1.4**: Implement comprehensive initial SDF primitives:
    - *Basic*: Sphere, Box, Cylinder, Torus, Capsule, Capped Cone, Plane.
    - *Curved & Hollow*: Pipe / Tube, Hemisphere, Ellipsoid, Superellipsoid.
    - *Polyhedra & Prisms*: Square Pyramid, Pentagonal Pyramid, Wedge, Frustum, Triangular Prism, Pentagonal Prism, Hexagonal Prism, Tetrahedron, Octahedron.
    - *Fractals*: Mandelbulb 3D fractal distance estimator.
  - [x] **M1.5**: Integrate analytical normal calculation (IQ 4-tap tetrahedron) and basic directional lighting.
  - [x] **M1.6**: Configure orbit camera with spherical coordinate damping and smooth zooming.
- **Verification Criteria**:
  - `pnpm dev` runs without console warnings.
  - Viewport renders a primitive at steady 60 FPS.
  - Rotating the orbit camera updates the view angle smoothly.

---

## Milestone 2: CSG Scene Graph & Dynamic Shader AST - ✅ Complete
**Primary Focus:** Hierarchical data structures, booleans, smooth minimum (`smin`), uniform buffer evaluator.

- **Tasks**:
  - [x] **M2.1**: Define TypeScript interfaces and types for `SDFNode`, `PrimitiveData`, `CSGOperation`, and `MaterialData`.
  - [x] **M2.2**: Implement CSG Boolean evaluation (Union, Difference, Intersection) in GLSL.
  - [x] **M2.3**: Implement polynomial smooth min (`smin`) and smooth difference (`smax_diff`) with customizable blending radius $k$.
  - [x] **M2.4**: Build the Uniform Buffer Array packager (flattening tree into GPU uniform buffers for real-time 0ms parameter updates).
  - [x] **M2.5**: Implement AST tree depth evaluation and coordinate space transformations (applying inverse model matrices).
  - [x] **M2.6**: Build framework-free Vanilla TypeScript reactive Scene Store (`EventTarget` / observable emitter) with history command hooks.
- **Verification Criteria**:
  - Modifying slider parameters (position, radius, blend $k$) updates the viewport instantly without shader recompilation stutter.
  - Subtracting a cylinder from a box creates a smooth hole with verified negative volume.

---

## Milestone 3: Studio UI, Floating/Dockable Palettes & Transform Gizmos - ✅ Complete
**Primary Focus:** Application layout, hybrid floating/docking window manager, bottom parking tray, Outliner tree, Property Inspector, Three.js TransformControls, selection raycasting.

- **Tasks**:
  - [x] **M3.1**: Implement Blender 4 dark theme layout using Custom Elements (`<sdf-app>`, `<sdf-viewport>`) and floating panels.
  - [x] **M3.2**: Build `<sdf-window>` component (free dragging, z-index stacking, 8-way resizing, magnetic edge-snap zones with amber ghost previews).
  - [x] **M3.3**: Build `<sdf-dock-tray>` component (parks minimized panels as interactive icon pills, click to restore, tooltips).
  - [x] **M3.4**: Build `<sdf-outliner>` component with recursive node rendering, visibility toggles, and boolean badges.
  - [x] **M3.5**: Implement drag-and-drop hierarchy reordering and parenting in the Outliner.
  - [x] **M3.6**: Build `<sdf-inspector>` component with numeric drag inputs for Position, Rotation, Scale, Dimensions, and Blending.
  - [x] **M3.7**: Integrate Three.js `TransformControls` with custom depth reconstruction (`gl_FragDepth`) so gizmo occludes correctly.
  - [x] **M3.8**: Implement offscreen ID-buffer picking to select shapes by clicking directly in the 3D viewport.
  - [x] **M3.9**: Add Workspace Presets (Default Studio, Free-Form Sculpting, Dual-Panel, Technical CSG) and `localStorage` layout persistence.
  - [x] **M3.10**: Wire keyboard shortcuts (`G` for grab, `R` for rotate, `S` for scale, `X` for delete, `Shift+A` for add primitive).
- **Verification Criteria**:
  - Panels can be freely dragged anywhere on the canvas or docked into left/right edge columns.
  - Minimizing any panel parks it into the bottom dock tray; clicking the pill unparks it to its exact prior location.
  - Clicking on a shape in the viewport highlights it in the Outliner and attaches the 3D gizmo.
  - Moving the 3D gizmo translates the SDF shape in real time.
  - Switching workspace presets rearranges panels instantaneously.

---

## Milestone 4: Modifiers, Lookdev, Lighting & History Stack - ✅ Complete
**Primary Focus:** Visual polish, PBR matcaps, soft shadows, ambient occlusion, undo/redo command pattern.

- **Tasks**:
  - [x] **M4.1**: Implement geometric modifiers: Rounding, Elongation, Shell (Onion), Twist, Mirroring.
  - [x] **M4.2**: Implement SDF Cone-Traced Soft Shadows with penumbra softness parameter.
  - [x] **M4.3**: Implement Volumetric Ambient Occlusion probe pass.
  - [x] **M4.4**: Implement Matcap shader library (Clay, Normal Map, Matcap Red Wax, Dark Studio, Chrome).
  - [x] **M4.5**: Implement Command Pattern history manager for full `Ctrl+Z` (Undo) and `Ctrl+Y` (Redo) transactional support.
  - [x] **M4.6**: Add infinite reference ground grid shader and camera orientation cube indicator.
- **Verification Criteria**:
  - Activating soft shadows produces physically convincing contact penumbras.
  - Switching Matcap styles instantly changes the viewport presentation without artifacts.
  - Pressing `Ctrl+Z` successfully reverts transformations and node additions.

---

## Milestone 5: Serialization, Mesh Extraction & Export Pipelines - ✅ Complete
**Primary Focus:** `.sdf.json` persistence, Web Worker Marching Cubes polygonization, GLSL code export.

- **Tasks**:
  - [x] **M5.1**: Implement `.sdf.json` serializer and parser with schema validation and auto-save.
  - [x] **M5.2**: Build Web Worker for Marching Cubes polygon extraction across bounding lattices.
  - [x] **M5.3**: Add `.OBJ` and `.GLTF` / `.GLB` file exporter with vertex normals and materials.
  - [x] **M5.4**: Implement standalone GLSL Fragment Shader generator (exporting clean, self-contained Shadertoy-compatible code).
  - [x] **M5.5**: Add export progress bar and resolution selector ($32^3, 64^3, 128^3$).
  - [x] **M5.6**: Write comprehensive user documentation and quick-start tutorials.
- **Verification Criteria**:
  - Saving a model to `.sdf.json` and reloading it restores identical geometry, transforms, and materials.
  - Exported `.obj` and `.glb` files open cleanly in Blender with correct scale and watertight normals.
  - Exported GLSL code runs on Shadertoy without compilation errors.
