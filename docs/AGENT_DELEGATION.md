# Multi-Agent Delegation Plan: SDF Studio 3D

> **Document Version:** 1.0.0  
> **Status:** Active Fleet Delegation  
> **Coordinator:** Project Manager Agent  
> **Target Path:** `projects/sdf-editor/docs/AGENT_DELEGATION.md`  

---

## 1. Fleet Architecture & Responsibilities

In accordance with the **Antigravity Agent Registry**, tasks are modularized and assigned to specialized domain experts:

```
                               +----------------------------+
                               |      Project Manager       |
                               | (High-Level Orchestration) |
                               +----------------------------+
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      ▼                  ▼                   ▼                   ▼                  ▼
+───────────+      +───────────+       +───────────+       +───────────+      +───────────+
| Software  |      | Creative  |       | Frontend  |       |   Game    |      |    QA/    |
| Architect |      | Director  |       | Developer |       | Developer |      | Test Eng  |
+───────────+      +───────────+       +───────────+       +───────────+      +───────────+
```

---

## 2. Agent Assignment Matrix

| Subagent Role | Primary Focus Area | Assigned Modules & Deliverables | Skills Leveraged |
| :--- | :--- | :--- | :--- |
| **`software-architect`** | Core System Design & Math | - CSG Tree AST Schema & Type Definitions<br>- Uniform Buffer Array packing strategy<br>- Command Pattern History Architecture | `database-design`, `clean-code` |
| **`game-developer`** | Shader & Graphics Pipeline | - Three.js Screen-Space Quad & Raymarching loop<br>- Complete GLSL Primitives catalogue (20+ shapes: Prisms, Pyramids, Mandelbulb, Pipes, Superellipsoid)<br>- Soft shadows & Volumetric AO passes<br>- `gl_FragDepth` hybrid depth integration | `signed-distance-fields`, `threejs`, `threejs-materials`, `game-math` |
| **`creative-director`** | Visual Identity & UX Metaphor | - Blender 4+ studio design tokens & CSS custom properties<br>- Iconography, layout geometry & negative space<br>- Matcap preset curation (Clay, Wax, Studio, Chrome)<br>- Pre-delivery aesthetic quality audit ("Vibe Check") | `ui-ux-pro-max`, `art-theory`, `css-expert` |
| **`frontend-developer`** | Client Application & Web Components | - Native Web Components (`<sdf-app>`, `<sdf-window>`, `<sdf-outliner>`, `<sdf-inspector>`, `<sdf-dock-tray>`)<br>- Framework-free Vanilla TypeScript Reactive Store (`EventTarget` / Signals)<br>- 8-way window resizing, magnetic docking & drag-and-drop hierarchy<br>- Keyboard shortcut listeners and hotkey manager | `web-components`, `browser-apis`, `web-accessibility` |
| **`debugger`** | Shader Diagnostics & Optimization | - GLSL compiler error parsing & line highlighting<br>- Raymarching step count profiling & GPU bottleneck triage<br>- Memory leak prevention during viewport resizing | `performance-profiling`, `clean-code` |
| **`qa-engineer`** | Automated Verification & E2E | - Vitest unit tests for CSG Tree AST math<br>- Playwright E2E tests for node creation and gizmo drags<br>- Serialization / Deserialization schema validation tests | `test-driven-development`, `testing-patterns` |
| **`documentation-writer`** | User Guide & Ecosystem Docs | - Quick-start modeling tutorial<br>- Complete keyboard shortcut reference cheat-sheet<br>- Architecture Decision Records (ADRs) | `clean-code` |

---

## 3. Delegation Work Packages & Subagent Prompts

### Work Package 1: Graphics & Raymarching Engine
- **Assigned Subagent:** `game-developer`
- **Objective:** Construct the Three.js screen-space raymarching engine with exact primitives, normal evaluation, and depth writing.
- **Invocation Prompt Template:**
  ```markdown
  Role: Game Developer & Graphics Specialist
  Task: Build the Three.js GLSL Raymarching Viewport for SDF Studio 3D.
  Requirements:
  1. Set up a Three.js scene with a full-screen quad using custom ShaderMaterial.
  2. Implement sphere tracing with adaptive step counts in GLSL.
  3. Include exact primitives: Sphere, Box, Cylinder, Torus, Capsule.
  4. Implement IQ 4-tap tetrahedron analytical normal calculation.
  5. Write ray hit depth into gl_FragDepth so Three.js gizmos can intersect seamlessly.
  Reference: Read projects/sdf-editor/docs/ARCHITECTURE.md and the signed-distance-fields skill.
  ```

---

### Work Package 2: Studio Design System & Visuals
- **Assigned Subagent:** `creative-director`
- **Objective:** Define the studio theme tokens, styling, and visual aesthetics following the Blender 4 DCC standard.
- **Invocation Prompt Template:**
  ```markdown
  Role: Creative Director & Aesthetic Lead
  Task: Create the design system and UI theme for SDF Studio 3D.
  Requirements:
  1. Formulate the color tokens in CSS variables: dark charcoal surfaces (#121212, #1e1e1e, #282828), 1px subtle borders (#323232), and studio amber accents (#ea7600).
  2. Define typography scales using Inter / JetBrains Mono.
  3. Design the layout specs for Top Bar, Left Tool Shelf, Viewport HUD, and Right Outliner/Properties panels.
  4. Ensure zero browser defaults and premium DCC feel.
  Reference: Read projects/sdf-editor/docs/UI_UX_SPEC.md.
  ```

---

### Work Package 3: Window Manager, Outliner & Property Inspector Components
- **Assigned Subagent:** `frontend-developer`
- **Objective:** Build the hybrid floating/docking window manager, bottom parking tray, and interactive React panels connected to the Zustand scene store.
- **Invocation Prompt Template:**
  ```markdown
  Role: Frontend Developer
  Task: Implement the Window Manager, Outliner, and Properties Inspector components for SDF Studio 3D.
  Requirements:
  1. Build a Floating Window & Docking Subsystem supporting free dragging across the canvas, 8-way resizing, z-index management, and magnetic snap docking zones (left, right, top) with translucent amber ghost previews.
  2. Implement the Bottom Dock Parking Tray: when any window is minimized (`[-]`), it smoothly parks into a glassmorphic pill bar at the bottom screen edge; clicking unparks it to its exact prior position.
  3. Build a recursive Outliner Tree showing parent/child CSG relationships, visibility eyes, and boolean operation badges (Union, Diff, Smooth).
  4. Implement drag-and-drop hierarchy reordering in the Outliner.
  5. Build the Properties Inspector with numeric drag scrubbers for Position, Rotation, Scale, Dimensions, and Smooth Fillet radius k.
  6. Add Workspace Preset switcher and `localStorage` layout persistence.
  Reference: Read projects/sdf-editor/docs/ARCHITECTURE.md section 7 and UI_UX_SPEC.md section 3.
  ```

---

### Work Package 4: Marching Cubes Mesh Exporter Worker
- **Assigned Subagent:** `software-architect` / `game-developer`
- **Objective:** Develop the multi-threaded Web Worker that evaluates the implicit field and extracts `.OBJ` / `.GLTF` meshes.
- **Invocation Prompt Template:**
  ```markdown
  Role: Software Architect & Systems Developer
  Task: Build the Web Worker Marching Cubes polygonization pipeline for SDF Studio 3D.
  Requirements:
  1. Implement a Web Worker that receives the serialized CSG AST.
  2. Sample the scalar distance field across a bounding 3D lattice.
  3. Extract watertight triangle geometry using Marching Cubes lookup tables with Hermite interpolation.
  4. Format the vertices and normals into downloadable .OBJ and binary .GLB buffers.
  Reference: Read projects/sdf-editor/docs/ARCHITECTURE.md section 5.
  ```

---

### Work Package 5: Automated Verification Suite
- **Assigned Subagent:** `qa-engineer`
- **Objective:** Write test suites covering AST mutations, CSG math, and serialization.
- **Invocation Prompt Template:**
  ```markdown
  Role: QA Automation Engineer
  Task: Build the test suite for SDF Studio 3D.
  Requirements:
  1. Unit tests in Vitest validating CSG boolean math, bounding box calculations, and transformation inversions.
  2. Schema validation tests ensuring exported .sdf.json strictly matches projects/sdf-editor/docs/SDF_SCHEMA.md.
  3. History stack tests verifying undo and redo integrity.
  ```

---

## 4. Quality Gates & Completion Protocol

Before declaring any milestone or phase complete:
1. **Clean Code & Build Gate:** Code must pass TypeScript typechecking (`pnpm tsc --noEmit`) and linting without errors.
2. **Performance Gate:** Viewport must sustain 60 FPS under normal editing conditions.
3. **Aesthetic Audit ("Vibe Check"):** `creative-director` must sign off on layout balance, contrast, typography, and motion feel.
4. **Git Stewardship:** Commits must adhere to Conventional Commits (e.g., `feat(engine): add smooth min boolean to raymarcher`).

