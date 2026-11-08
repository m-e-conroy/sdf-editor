# Technical Architecture: SDF Studio 3D

> **Document Version:** 1.0.0  
> **Status:** Approved Architecture Draft  
> **Target Path:** `projects/sdf-editor/docs/ARCHITECTURE.md`  

---

## 1. System Overview

SDF Studio 3D is architected around an implicit geometric representation. Rather than manipulating polygon meshes in CPU memory, the application maintains a **Hierarchical Constructive Solid Geometry (CSG) Abstract Syntax Tree (AST)**. This AST is evaluated directly on the GPU via sphere-tracing (raymarching).

```
                      +-----------------------------+
                      |       User Interaction      |
                      |   (Mouse / Keyboard / Gizmo)|
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      |      Command Controller     |
                      |    (Undo / Redo History)    |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      |     Vanilla Scene Store     |
                      | (EventTarget / Signals AST) |
                      |    - Active CSG AST Tree    |
                      |    - Selection & Camera     |
                      |    - Viewport Render Flags  |
                      +-----------------------------+
                                     |
                +--------------------+--------------------+
                |                                         |
                v                                         v
  +---------------------------+             +---------------------------+
  | Native Web Component UI   |             |    GPU Rendering Engine   |
  | - <sdf-outliner>          |             | - Uniform Buffer Packager |
  | - <sdf-inspector>         |             | - Three.js Raymarch Quad  |
  | - <sdf-window> & Docking  |             | - Transform Gizmo Overlay |
  | - <sdf-dock-tray>         |             | - Depth & Normal Passes   |
  +---------------------------+             +---------------------------+
                                                          |
                                                          v
                                            +---------------------------+
                                            |   Mesh Extraction Worker  |
                                            | - Marching Cubes Worker   |
                                            | - OBJ / GLTF Generator    |
                                            +---------------------------+
```

---

## 2. Mathematical Foundations

An implicit surface is defined as the zero-crossing isosurface of a continuous scalar field:
$$\partial\Omega = \{\mathbf{p} \in \mathbb{R}^3 \mid f(\mathbf{p}) = 0\}$$

Where:
- $f(\mathbf{p}) < 0$: Interior of the shape
- $f(\mathbf{p}) > 0$: Exterior empty space
- $|f(\mathbf{p})|$: Minimum Euclidean distance to the nearest surface point ($\|\nabla f(\mathbf{p})\| = 1$)

### 2.1 Comprehensive Initial Primitive Catalogue

SDF Studio 3D provides a rich set of exact and bound 3D distance primitives:

| Category | Primitive | Mathematical Formula / Formulation | Primary Parameters |
| :--- | :--- | :--- | :--- |
| **Basic** | **Sphere** | $\|\mathbf{p}\| - r$ | $r$ (radius) |
| | **Box** | $\mathbf{q} = \|\mathbf{p}\| - \mathbf{b}; \quad \|\max(\mathbf{q}, \mathbf{0})\| + \min(\max(q_x, \max(q_y, q_z)), 0)$ | $\mathbf{b} = (h_x, h_y, h_z)$ |
| | **Cylinder** | $d = \|(p_x, p_z)\| - r; \quad \max(d, \|p_y\| - h)$ | $r$ (radius), $h$ (half-height) |
| | **Torus** | $q = (\|(p_x, p_z)\| - R,\, p_y); \quad \|q\| - r$ | $R$ (major), $r$ (minor) |
| | **Capsule** | $p_y' = p_y - \text{clamp}(p_y, -h, h); \quad \|(p_x, p_y', p_z)\| - r$ | $r$ (radius), $h$ (half-height) |
| | **Capped Cone** | Capped cone distance bound | $r_1$ (base), $r_2$ (top), $h$ |
| | **Plane** | $\mathbf{p} \cdot \mathbf{n} + h$ | $\mathbf{n}$ (unit normal), $h$ (offset) |
| **Curved & Hollow** | **Pipe / Tube** | $\max(|\|(p_x, p_z)\| - r| - t,\, \|p_y\| - h)$ | $r$ (mid-radius), $t$ (thickness), $h$ |
| | **Hemisphere** | $\max(\|\mathbf{p}\| - r,\, -p_y)$ | $r$ (radius) |
| | **Ellipsoid** | $k_0 = \|\mathbf{p}/\mathbf{r}\|, \, k_1 = \|\mathbf{p}/\mathbf{r}^2\|; \quad k_0(k_0 - 1)/k_1$ | $\mathbf{r} = (r_x, r_y, r_z)$ |
| | **Superellipsoid** | $(\|x/r_x\|^{2/e_2} + \|y/r_y\|^{2/e_2})^{e_2/e_1} + \|z/r_z\|^{2/e_1} - 1$ | $r_x, r_y, r_z, e_1, e_2$ (exponents) |
| **Polyhedra & Prisms**| **Square Pyramid** | IQ 4-face exact distance formulation | $h$ (height), $b$ (base width) |
| | **Pentagonal Pyramid** | Capped pentagonal pyramid distance estimator | $h$ (height), $r$ (base circumradius) |
| | **Wedge** | Slanted box with cutting plane: $\max(\mathbf{q}_{\text{box}}, \mathbf{p} \cdot \mathbf{n}_{\text{bevel}})$ | $\mathbf{b} = (w, h, d), \text{angle}$ |
| | **Cone Frustum** | Truncated cone with upper and lower radii | $r_1, r_2, h$ |
| | **Triangular Prism** | $q = |\mathbf{p}|; \max(q_z - h_y, \max(q_x \cdot 0.866 + p_y \cdot 0.5, -p_y) - h_x \cdot 0.5)$ | $h_x$ (width), $h_y$ (height) |
| | **Pentagonal Prism** | Symmetrical 5-sector fold prism | $r$ (circumradius), $h$ (height) |
| | **Hexagonal Prism** | $k = (-0.866, 0.5, 0.577); \quad \max(d_r, |p_z| - h)$ | $r$ (hex radius), $h$ (height) |
| | **Tetrahedron**| Regular 4-sided Platonic polyhedron: $\max(\pm p_x \pm p_y \pm p_z) - r$ | $r$ (edge radius) |
| | **Octahedron** | Regular 8-sided Platonic polyhedron: exact fold distance | $s$ (size) |
| **Fractals** | **Mandelbulb 3D** | Power-8 spherical coordinate iterative distance estimator | Iterations (4–8), Power (8), Bailout |

### 2.2 Constructive Solid Geometry (CSG) & Smooth Blends

1. **Union ($A \cup B$)**:
   $$f_{A \cup B}(\mathbf{p}) = \min(f_A(\mathbf{p}),\, f_B(\mathbf{p}))$$

2. **Intersection ($A \cap B$)**:
   $$f_{A \cap B}(\mathbf{p}) = \max(f_A(\mathbf{p}),\, f_B(\mathbf{p}))$$

3. **Difference ($A \setminus B$)**:
   $$f_{A \setminus B}(\mathbf{p}) = \max(f_A(\mathbf{p}),\, -f_B(\mathbf{p}))$$

4. **Smooth Union (`smin`)**:
   $$h = \text{clamp}\left(0.5 + 0.5\frac{f_B - f_A}{k},\, 0.0,\, 1.0\right)$$
   $$f_{\text{smin}}(\mathbf{p}) = \text{mix}(f_B, f_A, h) - k \cdot h \cdot (1.0 - h)$$
   *(Provides adjustable fillet radius $k$ without mesh creasing)*

5. **Smooth Subtraction (`smax_diff`)**:
   $$h = \text{clamp}\left(0.5 - 0.5\frac{f_A + f_B}{k},\, 0.0,\, 1.0\right)$$
   $$\text{mix}(f_A, -f_B, h) + k \cdot h \cdot (1.0 - h)$$

---

## 3. GPU Raymarching Pipeline

### 3.1 Dual Shader Execution Strategy
To guarantee 60 FPS without stuttering when users tweak sliders or move objects, SDF Studio uses a **hybrid shader pipeline**:

1. **Interactive Uniform Buffer Evaluator (Default Editing Mode)**:
   - Evaluates a flattened array of shape descriptors stored in uniform buffers/textures.
   - Allows changing transforms, colors, blend radii, and primitive sizes **with zero shader recompilation lag** ($0\text{ ms}$ overhead).
   - Handles up to 128 nodes dynamically.

2. **JIT GLSL Shader Compiler (Optimized / Export Mode)**:
   - Generates an unrolled, highly optimized GLSL function directly matching the AST hierarchy.
   - Eliminates loop overhead and array lookups; computes compile-time constant folding.
   - Used for high-fidelity presentation, offline rendering, and code export.

### 3.2 Raymarching Algorithm
```glsl
bool raymarch(vec3 ro, vec3 rd, out float tHit, out int hitId) {
    float t = 0.01;
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * t;
        HitResult res = sceneMap(p);
        if (res.dist < SURF_EPSILON) {
            tHit = t;
            hitId = res.id;
            return true;
        }
        if (t > MAX_DIST) break;
        t += res.dist * 0.95; // 0.95 relaxation factor prevents overstepping
    }
    return false;
}
```

### 3.3 Normal Calculation (IQ 4-Tap Tetrahedron)
Normals are computed analytically without finite differencing along 6 Cartesian axes, saving 33% ALU overhead:
```glsl
vec3 calcNormal(vec3 p) {
    const float h = 0.0005;
    const vec2 k = vec2(1.0, -1.0);
    return normalize(
        k.xyy * sceneMap(p + k.xyy * h).dist +
        k.yyx * sceneMap(p + k.yyx * h).dist +
        k.yxy * sceneMap(p + k.yxy * h).dist +
        k.xxx * sceneMap(p + k.xxx * h).dist
    );
}
```

### 3.4 Soft Shadows & Ambient Occlusion
- **SDF Cone Tracing Shadows**:
  $$k_{\text{shadow}} = \min_{t}\left(k_{\text{shadow}},\, \frac{k \cdot f(\mathbf{p} + t\mathbf{l})}{t}\right)$$
- **Volumetric Ambient Occlusion**:
  Evaluated by taking 4 stepped distance probes along the normal $\mathbf{n}$.

---

## 4. Selection, Gizmos & Depth Integration

A common challenge in raymarched environments is integrating standard Three.js overlay tools (`TransformControls`, grid helper, camera frustums) with purely implicit geometry.

SDF Studio solves this with **Hybrid Depth Reconstruction**:
1. The raymarching fragment shader writes the computed hit depth into `gl_FragDepth`:
   $$\text{gl\_FragDepth} = \frac{1/z_{\text{hit}} - 1/z_{\text{near}}}{1/z_{\text{far}} - 1/z_{\text{near}}}$$
2. Standard Three.js objects (Gizmos, 3D grids, bounding wireframes) are rendered in a second pass with normal depth testing enabled (`depthTest: true`).
3. This allows the 3D transform gizmo to naturally occlude and clip against the SDF surface exactly as it would with standard polygon meshes.

### 4.1 Object Picking
When the user clicks in the viewport:
- The raymarching shader encodes the active node ID into an offscreen render target (G-Buffer `r` channel).
- On click, `readPixels(mouseX, mouseY, 1, 1)` retrieves the hovered/clicked Node ID with sub-millisecond latency.
- The UI instantly highlights the selected node in the Outliner and attaches the transform gizmo to the object's origin.

---

## 5. Polygonization (Marching Cubes Worker)

To export models into game engines (Unreal, Unity, Godot) or 3D printers, SDF Studio incorporates a multi-threaded **Marching Cubes Web Worker**:
1. The CSG AST is serialized and transferred to the worker thread.
2. The worker computes a bounding box enclosing the implicit volume.
3. A 3D grid voxel lattice (e.g., $128^3$ or $256^3$) samples $f(\mathbf{p})$ at each corner.
4. Triangles are extracted using standard Marching Cubes edge lookup tables, with Hermite vertex interpolation:
   $$\mathbf{v} = \mathbf{p}_1 + \frac{-\phi_1}{\phi_2 - \phi_1} (\mathbf{p}_2 - \mathbf{p}_1)$$
5. An `.obj` or binary `.glb` file is compiled and made available for instant download.

---

## 6. State Architecture & Command Pattern

To support reliable **Undo / Redo (Ctrl+Z / Ctrl+Y)** matching Blender's stability:
- All mutations to the scene graph are executed as transactional commands:
  - `AddNodeCommand`
  - `DeleteNodeCommand`
  - `TransformNodeCommand`
  - `ChangePropertyCommand`
  - `ReparentNodeCommand`
- Commands store `execute()` and `undo()` inverse operations.
- The scene state is managed by a lightweight, framework-free Vanilla TypeScript reactive Store (`SceneStore` subclassing `EventTarget` or using observable micro-signals) with zero runtime dependencies and local storage auto-save.

---

## 7. Floating Windowing & Docking Subsystem

To deliver a clutter-free, spatial 3D editing experience, SDF Studio implements a modular **Floating Window & Docking Engine**:

### 7.1 Panel Data Structure
```typescript
export type DockZone = 'floating' | 'dock-left' | 'dock-right' | 'dock-top' | 'parked';

export interface PanelWindowState {
  id: string;                      // e.g., 'outliner', 'properties', 'tool-shelf'
  title: string;
  icon: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  dockZone: DockZone;
  isMinimized: boolean;            // true when parked in the bottom tray
  zIndex: number;
  isPinned: boolean;
  minSize: { width: number; height: number };
}
```

### 7.2 Magnetic Snapping & Docking Physics
1. When a user drags a panel by its header, pointer motion updates `(x, y)` coordinates.
2. During drag, screen edge proximities are checked against a snapping threshold (40px).
3. If near a boundary, an amber ghost preview rectangle renders with matching dimensions.
4. On mouse release inside a threshold, `dockZone` shifts to `'dock-left'` or `'dock-right'`, causing the layout container to re-render in a flex column layout.
5. Dragging out of a docked column returns the panel to `'floating'` at the cursor coordinate.

### 7.3 Bottom Dock Parking Tray
- When `isMinimized` is set to `true`, the window collapses and mounts into the **Bottom Dock Tray** as an interactive pill.
- Clicking a parked pill toggles `isMinimized: false` and restores the panel to its recorded `(x, y)` screen position.

### 7.4 Workspace Layout Store & Persistence
- Layout changes are debounced and saved to `localStorage` under `sdf_studio_workspace_v1`.
- Built-in workspace presets (Default, Sculpting Minimalist, Dual-Panel, Technical CSG) swap the entire `PanelWindowState[]` array atomically.

