# UI/UX Specification: SDF Studio 3D

> **Document Version:** 1.0.0  
> **Status:** Approved UI/UX Design System  
> **Aesthetic Reference:** Blender 4+, MagicaCSG, Linear  
> **Target Path:** `projects/sdf-editor/docs/UI_UX_SPEC.md`  

---

## 1. Aesthetic Thesis & Visual Philosophy

SDF Studio 3D adheres to the **Creative Director's Premium Aesthetic Guidelines**:
- **Anti-AI-Slop & Anti-Browser Defaults**: Custom high-density, precision styling with zero generic browser scrollbars or unstyled form elements.
- **DCC Precision & Tight Hierarchy**: Modeled after Blender 4 and high-end CAD suites—compact layouts, 1px hairline division borders, crisp spatial grouping, and high-contrast studio accenting.
- **Dual-Theme Engine (Studio Dark & Studio Light)**: Comprehensive theme system supporting both an immersive, low-fatigue **Studio Dark** mode and a crisp, high-clarity **Studio Light** (CAD / Maya workbench) mode with instant theme toggling.
- **Micro-Interactions & Tactile Feedback**: Physics-based, subtle spring animations (`cubic-bezier(0.16, 1, 0.3, 1)`) that deliver instantaneous visual feedback without impeding rapid workflow.
- **Typography Precision**: Sub-pixel antialiasing with strict differentiation between proportional UI text (Inter/Geist) and tabular numeric data (JetBrains Mono).

---

## 2. Design Tokens & Dual-Theme System

All components utilize semantic CSS Custom Properties (`var(--token)`), dynamically switched via the root `data-theme="dark"` or `data-theme="light"` attribute.

| Token Semantic | Studio Dark (Default) | Studio Light (CAD Workbench) | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| `--bg-app-base` | `#121212` | `#f4f4f6` | Root application background |
| `--bg-panel` | `#1e1e1e` | `#ffffff` | Floating window surfaces, sidebars |
| `--bg-panel-elevated` | `#282828` | `#e8e8ed` | Header title bars, hover states, active tabs |
| `--bg-input` | `#181818` | `#f0f0f3` | Numeric scrubbers, text inputs, dropdowns |
| `--border-subtle` | `#323232` | `#d4d4d8` | 1px panel boundaries & hairline dividers |
| `--border-focus` | `#ea7600` | `#ea7600` | Active input outline, selected node boundary |
| `--accent-primary` | `#ea7600` | `#d96b00` | Studio amber/orange (actions, active gizmo) |
| `--accent-hover` | `#ff9429` | `#e07300` | Interactive hover highlights |
| `--text-primary` | `#e2e8f0` | `#18181b` | Main labels, input values, headers |
| `--text-secondary` | `#94a3b8` | `#71717a` | Captions, dimension units (m, rad, px) |
| `--badge-union` | `#27ae60` | `#16a34a` | Green indicator for CSG Union ($\cup$) |
| `--badge-difference` | `#e74c3c` | `#dc2626` | Red indicator for CSG Difference ($\setminus$) |
| `--badge-intersection`| `#2980b9` | `#2563eb` | Blue indicator for CSG Intersection ($\cap$) |
| `--badge-smooth` | `#9b59b6` | `#9333ea` | Purple indicator for Smooth Booleans (`smin`) |
| `--dock-ghost` | `rgba(234, 118, 0, 0.22)`| `rgba(217, 107, 0, 0.18)` | Magnetic snap zone preview overlay |
| `--dock-tray-bg` | `rgba(24, 24, 24, 0.82)` | `rgba(255, 255, 255, 0.85)`| Glassmorphic bottom parking tray |
| `--viewport-grid` | `#262626` | `#e2e8f0` | 3D reference infinite grid lines |

---

## 3. Typography & Density Guidelines

### 3.1 Font Families
- **UI & Interface Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif.
  - Weight: `400` (Regular for labels), `500` (Medium for active items & tabs), `600` (Semi-bold for panel headers).
  - Letter Spacing: `-0.01em` for tight, professional density.
  - Antialiasing: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`
- **Numeric & Data Font**: `JetBrains Mono`, `Fira Code`, `ui-monospace`, monospace.
  - Strict Tabular Numbers: `font-variant-numeric: tabular-nums;` (ensures coordinate numbers do not jitter during dragging).
  - Size: `11px` / `12px` for compact properties inspector fields.

---

## 4. Micro-Interactions & Feedback Animation Suite

Animations in SDF Studio are purposeful and snappy ($\le 180\text{ ms}$), engineered with fluid spring easing (`cubic-bezier(0.16, 1, 0.3, 1)`):

1. **Window Docking & Magnetic Snap**:
   - Approaching a dock edge snaps the amber ghost preview instantly with a 120ms fade-and-scale ($0.98 \to 1.0$).
   - Releasing the mouse transitions the panel into the docked column with zero layout jumps.
2. **Bottom Tray Parking & Unparking**:
   - Clicking `[-]` smoothly interpolates the window geometry downward into the bottom tray pill over 160ms (`transform: translateY(12px) scale(0.92)` with `opacity: 0`).
   - Clicking a parked pill pops the window back into its saved coordinate space with a subtle spring overshoot.
3. **Numeric Scrubber Drag Feedback**:
   - Hovering over a numeric input displays the horizontal drag cursor (`cursor: ew-resize`).
   - On mousedown drag, the input background gains a soft amber glow and a tiny floating tooltip pill shows the incremental $\pm \Delta$ offset.
4. **Outliner Drag-and-Drop & Drop Lines**:
   - Reordering shapes displays a high-contrast 2px horizontal drop line with an arrow badge indicating parent vs. child vs. sibling insertion.
   - Dropping a node triggers a brief 100ms flash on the target boolean operation badge.
5. **CSG Boolean Fusion Pulse**:
   - Executing a boolean combination (e.g. subtracting a cylinder from a box) briefly flashes the affected boundary in the 3D viewport, confirming the topological change.

---

## 5. Hybrid Floating & Dockable Windowing Architecture

SDF Studio 3D employs an agile **Hybrid Floating & Dockable Window System**:
- **All Panels are Free-Floating by Default**: Every functional panel (Outliner, Properties, Tool Shelf, Matcap Lookdev, History Stack) is an independent, draggable floating window.
- **Magnetic Edge Docking Zones**: Dragging any floating panel near the left, right, top, or bottom edges of the viewport activates a magnetic snap zone with a translucent amber drop ghost (`dock-ghost`), seamlessly docking the panel into fixed side columns or tabbed containers.
- **Bottom Shelf Parking Tray**: Minimizing any floating or docked panel parks it down into an elegant, glassmorphic bottom tray as a compact icon badge. Clicking any parked pill smoothly springs the panel back into its saved screen position.
- **Workspace Presets & Layout Persistence**: The exact coordinates, sizes, docked states, and minimized states persist in `localStorage` and can be switched via quick presets.

```
+--------------------------------------------------------------------------------------------------+
| Top Menu Bar: [File] [Edit] [Add] [View] [Render] [Workspaces ▾]   [Theme: ☀️/🌙] [Export OBJ] [⚙] |
+--------------------------------------------------------------------------------------------------+
|                                        3D Viewport                                               |
|  +--------------------+                                         +-----------------------------+  |
|  | 🪟 Tool Shelf  [-][X]|                                         | 🪟 Outliner           [-][X]|  |
|  | [Select] [Move]    |                                         |  ▾ 📦 Robot (Smooth ∪)      |  |
|  | [Rotate] [Scale]   |                                         |    ├─ ⚪ Head (Sphere)       |  |
|  | [Add Shape]        |                                         |    └─ 📦 Torso (Box)        |  |
|  +--------------------+                                         +-----------------------------+  |
|                                [ 3D Gizmo ]                                                      |
|                                     (•)                         +-----------------------------+  |
|                                                                 | 🪟 Properties         [-][X]|  |
|  +--------------------+                                         |   Transform: [0] [1] [0]    |  |
|  | 🪟 Lookdev    [-][X]|                                         |   Primitive: Box            |  |
|  | Matcap: Clay       |                                         |   Smooth Min k: [0.15]      |  |
|  +--------------------+                                         +-----------------------------+  |
|                                                                                                  |
| [ Dock Zone: Left ]                     [ Center Canvas ]                  [ Dock Zone: Right ]  |
+--------------------------------------------------------------------------------------------------+
| Bottom Dock Tray: [📦 Outliner] [⚙️ Properties] [🎨 Shading] [📜 History] | Steps: 64 | 60 FPS      |
+--------------------------------------------------------------------------------------------------+
```

### 5.1 Floating Window Anatomical Specs
Each floating palette includes:
- **Title Bar**: Drag handle for moving across screen space with double-click to collapse/uncollapse.
- **Dock/Pin Toggle Button**: Quick toggle to snap to the nearest edge dock or release into free floating.
- **Minimize Button (`[-]`)**: Instantly animates and parks the panel into the **Bottom Dock Tray**.
- **Close Button (`[X]`)**: Hides the panel (re-openable from the Top Menu or hotkeys).
- **8-Direction Resize Borders**: Resize handles on all four borders and corners.
- **Z-Index Layer Management**: Clicking or dragging any panel elevates it to the highest active z-index.

### 5.2 Bottom Dock Parking Tray
- Positioned along the bottom edge of the screen, floating slightly above the canvas with backdrop blur (`backdrop-blur-md`).
- Contains interactive **Panel Pills**:
  - Icon + Short Label (e.g., `[📦 Outliner]`, `[⚙️ Properties]`, `[📜 History]`).
  - Active / Open indicator dot.
  - Hover tooltip with panel preview and hotkey.
  - Clicking a parked pill animates the window back into its previous floating or docked geometry.

### 5.3 Docking Zones & Drop Ghosts
When dragging a window near the viewport boundaries (within 40px threshold):
- **Left Dock**: Vertically stacked panel column (ideal for Tool Shelf and Primitives).
- **Right Dock**: Split vertical panels (ideal for Outliner on top, Properties below).
- **Tabbed Stacking**: Dropping one panel directly on top of another docks them together into a single tabbed floating palette.
- **Drop Ghost Preview**: A translucent amber highlight (`rgba(234, 118, 0, 0.2)`) displays the exact target dimension before releasing the mouse button.

### 5.4 Workspace Presets
Users can switch between tailored panel configurations in the Top Menu:
1. **Default Studio**: Outliner & Properties docked to the right; Tool Shelf docked to the left; Viewport maximized.
2. **Free-Form Sculpting**: All panels minimized into the Bottom Dock Tray; 100% borderless canvas with hotkeys only.
3. **Dual-Panel Modeling**: Outliner and Properties floating side-by-side over the right canvas quadrant.
4. **Custom**: Saved per user in browser `localStorage`.

---

## 6. Screen Layout & Panel Details

### 6.1 Top Menu Bar
- **File Menu**: New Project, Open `.sdf.json`, Save Project, Recent Files.
- **Edit Menu**: Undo (`Ctrl+Z`), Redo (`Ctrl+Y`), Duplicate (`Shift+D`), Delete (`X`), Preferences.
- **Add Menu**: Add Primitive (categorized dropdown with all 20+ shapes).
- **View Menu**: Shading Mode (Clay, Normals, Wireframe Bounds, PBR Studio, Matcap Wax), Reset Camera.
- **Theme Switcher**: Instant toggle button between **Studio Dark** and **Studio Light**.
- **Export Menu**: Export `.OBJ` Mesh, Export `.GLTF`, Export GLSL Fragment Shader, Export JSON.

### 6.2 Tool Shelf
- **Select (W)**: Click and marquee select objects.
- **Move (G)**: Activate Three.js translation gizmo or grab mode.
- **Rotate (R)**: Activate Three.js rotation rings.
- **Scale (S)**: Activate uniform or axial scale gizmo.
- **CSG Quick Combiner**: Select two shapes and press shortcut to combine with union, difference, or smooth blend.

### 6.3 3D Viewport
- **Infinite Reference Grid**: Custom antialiased grid shader adapted dynamically to theme (`#262626` in Dark, `#e2e8f0` in Light) with major (1m) and minor (0.1m) gridlines.
- **Orientation Compass**: Top-right interactive axes gizmo (X, Y, Z) for clicking into Orthographic Front/Top/Right views.
- **Floating Viewport HUD**:
  - Projection Toggle (Perspective / Orthographic).
  - Shading Presets dropdown (Dark Clay, Sunset Studio, Normal Map, Matcap Red Wax, Metallic).
  - Shadow & Ambient Occlusion toggle switch.

### 6.4 Scene Outliner
- Displays full hierarchical CSG tree.
- Drag-and-drop parenting: Dropping node B onto node A configures B as a child boolean operand.
- Each node features:
  - Eye icon: Toggle visibility.
  - Shape icon: Specific vector glyph per primitive type.
  - Operation pill: Colored badge displaying `∪`, `∖`, `∩`, or `~∪` (smooth union).
  - Lock icon: Prevent accidental transforms.

### 6.5 Properties Panel
- **Transform Section**: Scrubbable numeric sliders for X, Y, Z position, Euler rotation, and Scale with tabular font formatting.
- **SDF Geometry Section**: Dynamic inputs tailored to the active primitive.
- **Modifiers Section**: Rounding, Shell, Elongation, Symmetry Mirroring.
- **CSG & Blending**: Operator select and blend radius $k$.
- **Material Section**: Color picker, Roughness, Metalness, Emission.

---

## 7. Keybinding Matrix (Blender DCC Standard)

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `G` | **Grab / Move** | Enter interactive translation mode |
| `R` | **Rotate** | Enter interactive rotation mode |
| `S` | **Scale** | Enter interactive scale mode |
| `X` / `Delete` | **Delete Node** | Remove selected object from scene tree |
| `Shift + A` | **Add Primitive** | Open radial or popup menu to insert shapes |
| `Shift + D` | **Duplicate** | Clone active node with identical properties |
| `Ctrl + Z` | **Undo** | Revert last action in history stack |
| `Ctrl + Shift + Z` / `Ctrl + Y` | **Redo** | Replay undone action |
| `NumPad 1` | **Front View** | Set camera to front orthographic |
| `NumPad 3` | **Side View** | Set camera to right orthographic |
| `NumPad 7` | **Top View** | Set camera to top orthographic |
| `NumPad 5` | **Persp / Ortho**| Toggle camera projection mode |
| `F` or `.` | **Focus** | Frame camera onto selected node |
| `Spacebar` | **Quick Search** | Search all commands, primitives, and tools |

