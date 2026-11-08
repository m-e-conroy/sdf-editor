# Mechanical CAD & Organic Shapes Implementation Plan

> **Feature:** Tier 1 Mechanical/CAD & Stylized/Organic SDF Primitives  
> **Status:** Proposed Implementation Plan  
> **Target Scope:** 6 High-Impact Shapes with Advanced Interactive Parameters  

---

## 1. Goal

Expand SDF Studio 3D's primitive library with **6 advanced Mechanical/CAD and Stylized/Organic shapes**, providing exact/bound GPU raymarch shaders, bespoke 3D rendered isometric icons, CPU mesh extraction, and advanced multi-parameter Inspector controls.

---

## 2. Selected Shape Portfolio & Advanced Parameters

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                SELECTED NEW PRIMITIVES                                 │
├────────────────────────────────────────┬───────────────────────────────────────────────┤
│ 🛠️ Category A: Mechanical & Hard-Surface│ 🌿 Category C: Stylized & Organic            │
├────────────────────────────────────────┼───────────────────────────────────────────────┤
│ 1. Pipe Elbow / Capped Torus           │ 4. Asymmetric Egg / Ovoid                     │
│    • Major Radius (R)                  │    • Length / Height (h)                      │
│    • Minor Tube Radius (r)             │    • Base Radius (r1)                         │
│    • Arc Sweep Angle (30°–180°)        │    • Tip Radius / Taper (r2)                  │
├────────────────────────────────────────┼───────────────────────────────────────────────┤
│ 2. Chain Link                          │ 5. 3D Heart                                   │
│    • Elongation Separation (L)         │    • Width / Radius                           │
│    • Ring Radius (R)                   │    • Depth / Thickness                        │
│    • Wire Thickness (r)                │                                               │
├────────────────────────────────────────┼───────────────────────────────────────────────┤
│ 3. Chamfered / Beveled Cylinder        │ 6. Star Prism (5-Pointed)                     │
│    • Cylinder Radius (r)               │    • Outer Radius (R)                         │
│    • Column Height (h)                 │    • Inner Radius (r)                         │
│    • 45° Chamfer Bevel Width (c)       │    • Extrusion Height (h)                     │
└────────────────────────────────────────┴───────────────────────────────────────────────┘
```

---

## 3. Mathematical & Architectural Specifications

### 3.1 Mathematical Formulations (GLSL & CPU)
1. **Pipe Elbow / Capped Torus (`capped_torus`)**:
   $$p.x = |p.x|; \quad \text{clamp along angle } \theta; \quad d = \|( \|p.xy\| - R, p.z )\| - r$$
2. **Chain Link (`chain_link`)**:
   $$p.y = |p.y| - L/2; \quad d = \|(\max(0, \|p.xy\| - R), p.z)\| - r$$
3. **Chamfer Cylinder (`chamfer_cylinder`)**:
   Capped cylinder with $45^\circ$ planar chamfer cut along top and bottom perimeter rings.
4. **Asymmetric Egg (`egg`)**:
   Quadric/spherical blend with varying circular cross-sections along the vertical axis ($z$-taper).
5. **3D Heart (`heart`)**:
   Cardioid-extrude with vertical pinching and smooth rounded lobes.
6. **5-Point Star Prism (`star_prism`)**:
   Extruded 10-sided polygon with alternating outer radius $R$ and inner radius $r$.

---

## 4. Tasks & Implementation Steps

- [ ] **Task 1: Type Definitions & AST Updates**
  - Files: [`src/tree/types.ts`](file:///f:/Programming%20Projects/sdf-editor/src/tree/types.ts), [`src/tree/CSGTree.ts`](file:///f:/Programming%20Projects/sdf-editor/src/tree/CSGTree.ts)
  - Add `'capped_torus' | 'chain_link' | 'chamfer_cylinder' | 'egg' | 'heart' | 'star_prism'` to `PrimitiveType`.
  - Add dimensions: `arcAngle`, `linkLength`, `chamfer`, `tipRadius`, `innerRadius`, `outerRadius`.
  - Define sensible defaults in `CSGTree.createDefaultNode`.
  - *Verify:* Run `npm run typecheck` to confirm 0 type errors.

- [ ] **Task 2: GLSL Raymarching Shader & Uniform Packer**
  - Files: [`src/engine/shaders/primitives.glsl`](file:///f:/Programming%20Projects/sdf-editor/src/engine/shaders/primitives.glsl), [`src/engine/shaders/raymarch.frag.glsl`](file:///f:/Programming%20Projects/sdf-editor/src/engine/shaders/raymarch.frag.glsl), [`src/engine/UniformPacker.ts`](file:///f:/Programming%20Projects/sdf-editor/src/engine/UniformPacker.ts)
  - Implement GLSL distance estimators for each shape with division-by-zero protection.
  - Map new primitive types (IDs 21–26) in `UniformPacker` and pack advanced dimensions into `vec4`.
  - *Verify:* Vitest unit tests in `UniformPacker.test.ts` pass for all new primitive types.

- [ ] **Task 3: CPU Mesh Extraction (Marching Cubes) & Shader Exporter**
  - Files: [`src/workers/marchingCubes.worker.ts`](file:///f:/Programming%20Projects/sdf-editor/src/workers/marchingCubes.worker.ts), [`src/engine/ShaderExporter.ts`](file:///f:/Programming%20Projects/sdf-editor/src/engine/ShaderExporter.ts)
  - Port distance formulas to TypeScript/Worker for `.OBJ` and `.GLB` export.
  - Add Shadertoy export branches in `ShaderExporter.ts`.
  - *Verify:* Exporting `.OBJ`, `.GLB`, and `.GLSL` succeeds for the new primitives.

- [ ] **Task 4: Bespoke 3D Rendered Isometric Clay SVG Icons**
  - File: [`src/icons/shapeIcons.ts`](file:///f:/Programming%20Projects/sdf-editor/src/icons/shapeIcons.ts)
  - Design 6 custom 3D isometric vector SVGs featuring three-point studio lighting, specular rim lighting, and contact drop shadows.
  - Append to `SHAPE_CATALOG` with category assignments (`euclidean`, `curved`, `polyhedra`).
  - *Verify:* Icons render cleanly in the Shape Palette grid.

- [ ] **Task 5: Advanced Properties Inspector Controls**
  - File: [`src/components/SdfInspector.ts`](file:///f:/Programming%20Projects/sdf-editor/src/components/SdfInspector.ts)
  - Add specialized UI controls for:
    - *Pipe Elbow:* Arc Angle slider ($30^\circ$–$180^\circ$), Major Radius, Tube Radius.
    - *Chain Link:* Link Length, Ring Radius, Thickness.
    - *Chamfer Cylinder:* Height, Radius, Chamfer Bevel Width.
    - *Egg:* Height, Base Radius, Tip Radius.
    - *Heart:* Size, Depth/Thickness.
    - *Star Prism:* Outer Radius, Inner Radius, Extrusion Height.
  - Wire reactive change listeners in `setupListeners()`.
  - *Verify:* Manipulating sliders in inspector dynamically updates the 3D raymarching viewport.

- [ ] **Task 6: Comprehensive Test Suite & Quality Gate**
  - Files: [`src/components/SdfShapePalette.test.ts`](file:///f:/Programming%20Projects/sdf-editor/src/components/SdfShapePalette.test.ts), [`src/engine/UniformPacker.test.ts`](file:///f:/Programming%20Projects/sdf-editor/src/engine/UniformPacker.test.ts)
  - Verify all 21 shapes (15 existing + 6 new) in `SHAPE_CATALOG`, CSGTree node creation, uniform packing, and category partitioning.
  - Run verification: `npm test`, `npm run typecheck`, `npm run build`.

---

## 5. Done When
1. 6 new shapes appear in the Floating Shape Palette with custom 3D rendered isometric clay icons.
2. Clicking any new shape spawns it immediately in the 3D viewport and outliner.
3. The Properties Inspector exposes advanced multi-parameter sliders for each new shape.
4. Exporting to `.OBJ`, `.GLB`, and Shadertoy `.GLSL` includes all new primitives.
5. All automated unit tests (77+ tests), TypeScript compilation, and production builds pass with 0 errors.

