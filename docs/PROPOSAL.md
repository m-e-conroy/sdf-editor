# Project Proposal: SDF Studio 3D (Signed Distance Field Modeler)

> **Document Version:** 1.0.0  
> **Status:** Proposed  
> **Author:** Project Manager Agent  
> **Target Path:** `projects/sdf-editor/`  

---

## 1. Executive Summary & Vision

Traditional 3D modeling tools like Blender, Maya, and 3ds Max rely on polygonal meshes (vertices, edges, and faces). While powerful, polygonal modeling struggles with boolean operations (union, difference, intersection), non-manifold errors, topology destruction, and remeshing artifacts. 

**SDF Studio 3D** is a next-generation, browser-based, desktop-grade 3D implicit modeling application inspired by Blender, MagicaCSG, and Dreams (Media Molecule). In SDF Studio, geometry is defined mathematically via **Signed Distance Functions (SDFs)**. Users manipulate primitives (spheres, boxes, cylinders, tori, capsules) and combine them with Constructive Solid Geometry (CSG) booleans and continuous organic smooth blends (`smin`). The result is infinitely smooth surfaces, perfect fillets, non-destructive booleans, and instant zero-topology editing rendered in real time at 60 FPS using GPU sphere tracing (raymarching).

---

## 2. Problem Statement & Value Proposition

| Traditional Mesh Modeling Pain Points | SDF Studio 3D Solutions |
| :--- | :--- |
| **Destructive Booleans**: Cutting holes or welding cylinders causes terrible mesh non-manifolds and pinched normals. | **Infinite Precision Implicit Booleans**: Booleans are purely mathematical operations ($\min, \max$) evaluated per pixel at runtime with zero mesh artifacts. |
| **Complex Topology**: Quads, triangles, and edge flow require years of specialized retopology expertise. | **Topology-Free**: No vertices or polygons during the design phase. Model organically like digital clay. |
| **Heavy File Sizes**: High-poly organic sculpts produce gigabyte-sized OBJ/FBX files. | **Compact Mathematical Trees**: Complex models are stored as a lightweight JSON Abstract Syntax Tree (AST) (< 100 KB). |
| **Steep Tooling Overhead**: Dedicated DCC apps require massive installations and high learning curves. | **Web-First Studio**: Zero-install web app leveraging WebGL 2.0 / WebGPU, featuring a sleek, familiar Blender-style interface. |

---

## 3. Scope Boundaries

### In-Scope (MVP & V1)
1. **Real-Time Raymarching Viewport**:
   - 60 FPS sphere tracing in Three.js / WebGL 2 with adaptive pixel-ratio scaling during interaction.
   - Studio lighting: 3-point lights, environment HDRI reflection, SDF soft contact shadows, and Ambient Occlusion.
   - PBR and Matcap shading modes (Clay, Normal Map, Matcap Red Wax, Dark Studio, Chrome).
2. **Blender-Style Studio Interface**:
   - Outliner Tree: Hierarchical CSG tree with drag-and-drop parenting, visibility toggles, and operation badges.
   - Properties Panel: Transform coordinates, shape dimensions, bevel/rounding radius, and material attributes.
   - Tool Shelf: Select, Translate, Rotate, Scale, Add Primitive, CSG Combiner.
   - 3D Transform Gizmo: Custom visual manipulators with axis snapping and numeric input.
3. **Core Primitives & Operations**:
   - **Primitives**: Sphere, Box, Cylinder, Torus, Capsule, Cone, Plane, Ellipsoid.
   - **CSG Booleans**: Union ($\min$), Difference ($\max(a, -b)$), Intersection ($\max(a, b)$).
   - **Smooth Blends**: Polynomial Smooth Union (`smin`), Smooth Subtraction, Smooth Intersection with controllable radius $k$.
   - **Modifiers**: Rounding, Elongation, Hollow/Shell (Onion), Twist, Symmetrical Mirroring.
4. **Serialization & Asset Pipeline**:
   - Save and Load `.sdf.json` scene files.
   - Export to Polygons: Background Web Worker running **Marching Cubes** / Dual Contouring to generate `.OBJ` and `.GLTF` meshes.
   - Export to Shader: Standalone, single-file GLSL fragment shader compatible with Shadertoy or game engines.

### Out-of-Scope (Post-V1 / Future Phases)
- Skeletal rigging and skinning inside the SDF domain (rigging is handled after polygon export).
- Complex physics particle simulations (handled via external engines).
- Collaborative real-time multiplayer editing (planned for V2).

---

## 4. Technical & Visual Strategy

```
+---------------------------------------------------------------------------------+
|                       SDF Studio Native Web UI Layer                            |
|     (Vanilla TypeScript + Native Web Components + Tailwind / CSS Custom Props)  |
|  <sdf-app> ──┬── <sdf-menu-bar>                                                 |
|              ├── <sdf-viewport> (Three.js Screen-Space Raymarcher)              |
|              ├── <sdf-window> (Floating / Dockable Panels)                      |
|              └── <sdf-dock-tray> (Bottom Shelf Minimized Panel Pills)           |
+---------------------------------------------------------------------------------+
             |                                                |
             v                                                v
+-------------------------------+              +--------------------------------+
|     Vanilla Scene Store       |              |       Web Component Panels     |
| (EventTarget / Signals AST)   |              |  - <sdf-outliner>              |
|    - Undo / Redo Command      |              |  - <sdf-inspector>             |
+-------------------------------+              |  - <sdf-tool-shelf>            |
             |                                 +--------------------------------+
             +--------------------+
             |                    |
             v                    v
+-----------------------+   +---------------------------------------------------+
|  CSG AST & Compiler   |   |           Three.js Raymarching Viewport           |
| (AST -> GLSL / Uniform|   |  - Fullscreen Quad / Raymarch Shader Material     |
|   Buffer Generation)  |-->|  - Custom OrbitControls & Transform Gizmos        |
+-----------------------+   |  - Depth Buffer Reconstruction & Object Picking   |
             |              +---------------------------------------------------+
             v                                    |
+-----------------------+                         v
| Polygon Mesh Exporter |              +----------------------------------------+
| (Worker Marching Cubes|              |             Export Pipeline            |
| -> GLTF / OBJ / GLSL) |              |  - .sdf.json  - .obj / .glb  - .glsl   |
+-----------------------+              +----------------------------------------+
```

- **Aesthetic**: Blender 4+ dark theme (`#181818`, `#242424`, `#2d2d2d`) with studio orange highlights (`#e67e22`), high-density typography (Inter/JetBrains Mono), crisp 1px borders (`#383838`), and floating viewport toolbars.
- **Frontend Core**: Standard Web Technologies — Native **Web Components** (Custom Elements, Shadow DOM, Custom Events, HTML Templates), Vanilla TypeScript, Vite bundler. Zero heavy UI framework runtime overhead.
- **Graphics & Raymarching**: Three.js (r170+), custom GLSL sphere-tracing shaders, Screen-Space Quad, Ray-marched depth picking.
- **Initial Primitive Set**: Comprehensive library (Sphere, Box, Cylinder, Torus, Capsule, Capped Cone, Plane, Pipe/Tube, Hemisphere, Ellipsoid, Superellipsoid, Square Pyramid, Pentagonal Pyramid, Triangular Prism, Pentagonal Prism, Hexagonal Prism, Wedge, Frustum, Tetrahedron, Octahedron, and Mandelbulb 3D fractal).

---

## 5. High-Level Roadmap & Milestones

| Milestone | Phase Title | Focus | Target Deliverables |
| :--- | :--- | :--- | :--- |
| **M1** | Foundation & Viewport Engine | Raymarching Core | Three.js fullscreen quad, sphere tracing loop, primary primitives, orbital camera. |
| **M2** | CSG Hierarchy & Dynamic Shader AST | Mathematical Engine | CSG boolean evaluator ($\min, \max, \text{smin}$), AST-to-GLSL compiler, fast uniform buffer pipeline. |
| **M3** | Blender-Inspired Studio UI | Workspace & Tooling | Outliner tree, properties inspector, tool shelf, interactive transform gizmo, object selection. |
| **M4** | Modifiers, Shading & Lighting | Artistry & Lookdev | Soft shadows, AO, matcaps/PBR, modifiers (twist, round, onion, mirror), undo/redo history. |
| **M5** | Serialization & Mesh Export | Pipeline & Release | `.sdf.json` format, Web Worker Marching Cubes polygon export (OBJ/GLB), GLSL shader exporter. |

---

## 6. Next Steps

1. Review and approve the detailed architectural documents in `projects/sdf-editor/docs/`.
2. Inspect the agent delegation plan in `docs/AGENT_DELEGATION.md`.
3. Proceed with project scaffolding and development kickoff.

