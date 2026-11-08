# Floating Geometric Shape Palette Plan

> **Feature:** Interactive Floating Shape Palette with 3D Rendered Icons  
> **Status:** Proposed Architecture & Execution Plan  
> **Target:** Replace `<select id="add-primitive-select">` with a high-end 3D DCC Asset Shelf  

---

## 1. Executive Summary & Problem Context

In the current interface, adding geometric primitives is constrained to an unstyled OS `<select>` dropdown menu in the top navigation bar.

### Limitations of Current Implementation:
- **Zero Spatial/Visual Context:** Users only see text labels and emojis (`⚪`, `📦`, `🥫`), which fail to show the curvature, proportions, and geometric nuances of SDF shapes (e.g. Torus minor vs major radius, Hollow Pipe thickness, Mandelbulb iterations).
- **Poor DCC Ergonomics:** Professional 3D suites (Blender, Cinema4D, Houdini, Spline) utilize visual asset shelves and quick-add floating popovers rather than buried form dropdowns.
- **No Quick Discovery:** Users cannot visually compare primitives at a glance or discover shapes by geometry category.

---

## 2. Creative Director: Visual & UX Specification

### 2.1 Aesthetic Thesis & Spatial Form Factor
The new **Floating Geometric Shape Palette** (`<sdf-shape-palette>`) is designed as a glassmorphic floating popover with responsive positioning:
- **Anchoring:** Aligned dynamically beneath the new **`+ Add Shape`** trigger button in the menu bar, with auto-centering fallback on smaller displays.
- **Card Grid Layout:** A responsive 4-column visual grid of tactile primitive cards.
- **Dimensions:** Width of `460px`, height capped at `540px` with a custom slender scrollbar.
- **Glassmorphism & Depth:**
  - **Dark Mode:** `background: rgba(22, 24, 30, 0.88)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255, 255, 255, 0.08)`, `box-shadow: 0 16px 48px rgba(0, 0, 0, 0.55), 0 0 1px rgba(255, 255, 255, 0.1)`.
  - **Studio Light Mode:** `background: rgba(255, 255, 255, 0.94)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(0, 0, 0, 0.12)`, `box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)`.

### 2.2 "Rendered" 3D Iconography Specification
To ensure **instantaneous loading**, **zero GPU pipeline stalls**, and **flawless pixel rendering across standard and 4K Retina displays**, each geometric primitive will feature a bespoke **3D isometric vector rendering**:
- **Projection:** Isometric $30^\circ / 45^\circ$ axonometric view.
- **Lighting Model:** Three-point studio illumination:
  - *Key Light:* Top-left specular directional gradient ($45^\circ$, warm white `#ffffff` to `#ffedd5`).
  - *Fill Light:* Ambient bottom-right diffuse gradient (`#64748b` in dark mode, `#94a3b8` in light mode).
  - *Rim / Fresnel:* Crisp highlight stroke tracing edge silhouettes.
  - *Simulated Ambient Occlusion:* Subtle ground contact shadow beneath each primitive.
- **Matcap Color Palette:** Studio clay finish with subtle ambient curvature shading.

#### Shape Inventory (15 Core Primitives):
| Category | Primitives | Visual Characteristic |
| :--- | :--- | :--- |
| **Basic Euclidean** | Sphere, Box / Cube, Cylinder, Torus, Capsule, Cone | Smooth clay finish, crisp bevels, realistic specular highlights |
| **Curved & Hollow** | Pipe / Hollow Tube, Hemisphere, Ellipsoid | Cutaway thickness, inner wall shading, non-uniform ellipsoid curvature |
| **Polyhedra & Prisms**| Square Pyramid, Hexagonal Prism, Triangular Prism, Tetrahedron, Octahedron | Faceted flat-shading with edge lighting and vertex highlights |
| **3D Fractals** | Mandelbulb Fractal | Detailed iterative multi-lobe fractal ray-traced silhouette |

### 2.3 Micro-Interactions & State Transitions
- **Trigger Button:** Sleek rounded button with an active indicator badge and `<kbd>Shift+A</kbd>` hotkey hint.
- **Card Hover:** `transform: translateY(-2px) scale(1.02)`, card background deepens with border highlighting in `--accent-primary` (`#ea7600`).
- **Card Active / Press:** `transform: scale(0.97)` for tactile button feel.
- **Entrance Animation:** Fast spring pop-in (`scale(0.96) -> scale(1.0)`, `opacity 0 -> 1` over `140ms`).
- **Dismissal:** Instant smooth fade-out on `Escape`, clicking outside, or selecting a shape.

---

## 3. Frontend Architecture & Component Design

### 3.1 Component Structure
```text
src/
├── components/
│   ├── SdfShapePalette.ts      <-- New: Floating Shape Palette Component
│   ├── SdfMenuBar.ts            <-- Modified: Replaces <select> with + Add Shape trigger
│   └── SdfViewport.ts           <-- Modified: Shift+A global hotkey listener
├── icons/
│   └── shapeIcons.ts            <-- New: 15 bespoke 3D rendered SVG icons
└── styles/
    └── tokens.css               <-- Verified: Dark and Light theme tokens
```

---

## 4. Step-by-Step Implementation Tasks

- [x] **Task 1: Design & Implement 3D Rendered SVG Shape Icons**
  - File: [`src/icons/shapeIcons.ts`](file:///f:/Programming%20Projects/sdf-editor/src/icons/shapeIcons.ts)
  - Create 15 high-fidelity isometric rendered SVG templates with linear/radial lighting gradients, bevels, and specular highlights.
  - Verify: Load icons in Vitest and verify valid SVG markup and dimensions.

- [x] **Task 2: Build `SdfShapePalette` Web Component**
  - File: [`src/components/SdfShapePalette.ts`](file:///f:/Programming%20Projects/sdf-editor/src/components/SdfShapePalette.ts)
  - Implement `<sdf-shape-palette>` with 4-column grid, search input, category filtering pills, and click handlers.
  - Integrate click-outside detection and `Escape` key dismissal.
  - Apply dual-theme glassmorphism styling (`[data-theme="light"]` and dark).
  - Verify: Palette mounts, filters accurately by category and search text, and dispatches selection events.

- [x] **Task 3: Refactor Menu Bar & Wire Hotkey**
  - Files: [`src/components/SdfMenuBar.ts`](file:///f:/Programming%20Projects/sdf-editor/src/components/SdfMenuBar.ts), [`src/styles/studio.css`](file:///f:/Programming%20Projects/sdf-editor/src/styles/studio.css)
  - Replace `<select id="add-primitive-select">` with the new `#btn-open-shapes` trigger.
  - Wire global <kbd>Shift</kbd>+<kbd>A</kbd> keyboard shortcut to toggle the shape palette.
  - Verify: Clicking button or pressing `Shift+A` toggles palette open/closed.

- [x] **Task 4: Connect Store Dispatch & Scene Integration**
  - When any shape card is clicked:
    1. Call `CSGTree.createDefaultNode(shapeType)`.
    2. Add randomized jitter to initial position so repeated shapes don't directly overlap.
    3. Dispatch `SceneStore.getInstance().addNode()`.
    4. Select the new node so the transform gizmo immediately attaches in the viewport.
  - Verify: Clicking any shape card spawns the shape in the viewport and outliner with immediate selection.

- [x] **Task 5: Unit Testing & Quality Gate Verification**
  - Create test suite: `src/components/SdfShapePalette.test.ts`
  - Verify all 15 shapes exist and have matching `PrimitiveType` entries in `UniformPacker` and `CSGTree`.
  - Run verification commands: `npm test`, `npm run typecheck`, `npm run build`.

---

## 5. Definition of Done
1. The clunky `<select>` dropdown in the top header is completely replaced with a modern, high-end "Add Shape" trigger button with a `Shift+A` hotkey indicator.
2. Clicking the button or pressing `Shift+A` opens the floating glassmorphic palette displaying all 15 geometric shapes.
3. Every shape displays a beautifully shaded 3D isometric rendered vector icon.
4. Clicking a shape immediately adds it to the CSG tree, selects it, and updates both the 3D raymarching viewport and the outliner.
5. Search filtering and category tabs allow instantaneous narrowing of shapes.
6. The palette adapts seamlessly to both **Studio Dark** and **Studio Light** themes.
7. 100% of unit tests pass, 0 TypeScript errors, and production build succeeds.

