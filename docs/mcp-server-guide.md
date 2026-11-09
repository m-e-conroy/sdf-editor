# SDF Studio 3D — MCP Server & Live Agent Bridge Guide

Welcome to the **SDF Studio 3D Model Context Protocol (MCP)** integration. This bridge gives AI agents (in Claude Desktop, Cursor, Antigravity, or custom agents) direct **hands, eyes, and numeric sensing** inside the running SDF Studio 3D web application.

---

## 🚀 Quick Start

### 1. Build and Run the MCP Server

Ensure project dependencies are installed, then build and start the MCP server:

```bash
# Navigate to the mcp-server directory
cd mcp-server
npm install
npm run build

# Start the MCP stdio server
npm start
```

Or from the workspace root:
```bash
npm run mcp:start
```

The MCP server starts a local WebSocket Hub on `ws://127.0.0.1:8765`.

---

## 🔌 Connecting Host Applications

### Claude Desktop Configuration

Add the following to your `claude_desktop_config.json`:

#### Windows:
`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sdf-studio": {
      "command": "node",
      "args": [
        "f:/Programming Projects/sdf-editor/mcp-server/dist/index.js"
      ],
      "env": {
        "SDF_BRIDGE_PORT": "8765",
        "SDF_EXPORT_DIR": "f:/Programming Projects/sdf-editor/exports"
      }
    }
  }
}
```

#### macOS / Linux:
`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sdf-studio": {
      "command": "node",
      "args": [
        "/path/to/sdf-editor/mcp-server/dist/index.js"
      ],
      "env": {
        "SDF_BRIDGE_PORT": "8765"
      }
    }
  }
}
```

---

## 🖥️ Live Studio Pairing & HUD Status

1. Launch SDF Studio 3D in your browser:
   ```bash
   npm run dev
   ```
2. Look at the top-left **Lookdev HUD toolbar**. You will see the **MCP Status Pill**:
   - `MCP: OFF` — Bridge disabled.
   - `MCP: LISTEN` (Amber) — Waiting for MCP server hub on `127.0.0.1:8765`.
   - `MCP: LIVE` (Emerald) — Connected and actively listening to agent tool calls.
   - `MCP: PARKED` (Sky Blue) — Connected, but another browser tab currently has control.
3. Click the status pill to open the **Pairing Popover**:
   - View or copy the active pairing token.
   - Click **Take Control** if the tab is parked.
   - Click **📋 Copy MCP Client JSON Config** for instant pasting into your MCP host configuration.

---

## 🛠️ Complete MCP Tool Catalog (19 Tools)

### 1. Hands (Scene Mutation & Construction)

| Tool | Description | Single Undo |
| :--- | :--- | :---: |
| `sdf_get_scene` | Reads the full CSG tree JSON, statistics (leaves, groups, depth), and current selection. | Read-only |
| `sdf_add_primitive` | Spawns one of 22 supported primitives (box, sphere, torus, pipe elbow, star prism, etc.) with rotation in **degrees**. | ✅ Yes |
| `sdf_create_group` | Creates a nested CSG group `(A - B) ∪ (C - D)` and hoists child nodes. | ✅ Yes |
| `sdf_update_node` | Patches node position, rotation, dimensions, CSG op, material, or modifier settings. | ✅ Yes |
| `sdf_delete_node` | Deletes a node or entire group hierarchy. | ✅ Yes |
| `sdf_duplicate_node`| Clones a node or subtree with optional 3D translation offset. | ✅ Yes |
| `sdf_move_node` | Reparents a node under another group or reorders siblings. | ✅ Yes |
| `sdf_ungroup` | Dissolves a group and hoists children preserving world coordinates. | ✅ Yes |
| `sdf_clear_scene` | Clears all nodes or resets to the default studio scene. | ✅ Yes |
| `sdf_apply_scene_recipe` | **Declarative high-speed builder**: Instantiates full multi-node models in one atomic call. Supports `dryRun: true` for zero-mutation validation. | ✅ Yes |
| `sdf_undo` / `sdf_redo` | Navigates the studio history stack. | ✅ Yes |

### 2. Camera & Viewport Navigation

| Tool | Description |
| :--- | :--- |
| `sdf_select_node` | Changes viewport and outliner selection highlight in the user's browser. |
| `sdf_set_camera` | Sets camera perspective presets (`front`, `right`, `top`, `isometric`, `perspective`) or custom eye/target coordinates. |

### 3. Eyes & Numeric Sensing (Sensory Tools)

| Tool | Description | Return Format |
| :--- | :--- | :---: |
| `sdf_take_snapshot` | Captures a high-resolution, gizmo-free viewport render from any preset or custom angle. | Native MCP Image (`image/png` base64) |
| `sdf_get_contact_sheet` | Generates a 2×2 quad-view composite render (Perspective, Front, Right, Top) labeled with dimensions. | Native MCP Image (`image/png` base64) |
| `sdf_get_bounds` | Computes exact AABB bounding box and center for the scene or a specific subtree. | JSON `{ min, max, size, center }` |
| `sdf_sample_distance` | Evaluates CPU distance field at up to 256 sample points to check fit, gaps, or intersections. | JSON `{ samples: [{ point, distance, inside }] }` |
| `sdf_estimate_volume` | Monte Carlo volume calculation and bounding-box fill ratio. | JSON `{ volume, fillRatio, samples }` |

### 4. File Delivery & Export

| Tool | Description | Sandbox Path |
| :--- | :--- | :---: |
| `sdf_export_mesh` | Runs Marching Cubes mesh extraction and writes watertight `.glb` or `.obj` files to disk. | `exports/*.glb`, `exports/*.obj` |
| `sdf_export_shader` | Compiles full CSG hierarchy into self-contained Shadertoy GLSL fragment code. | `exports/*.glsl` |

---

## 📚 MCP Resources & Prompts

### Resources
- `sdf://scene` — Live JSON representation of the current studio scene.
- `sdf://primitives` — Full catalog of 22 primitives with dimension names and default ranges.
- `sdf://conventions` — Best practices for coordinate spaces (+Y up, units in meters), degree rotations, and CSG tree hierarchy.
- `sdf://recipes/examples` — Declarative reference recipes (Mug, Bolt, Bracket, Table).

### Prompts
- `model_object` — Guided modeling prompt taking user description and executing iterative CSG construction.
- `refine_model` — Sensory feedback refinement prompt (takes snapshot, assesses proportions, and adjusts node parameters).

---

## 🔒 Security & Concurrency Architecture

1. **Sandboxed File Exports**: All disk operations via `SafeFileWriter` strictly enforce paths inside `SDF_EXPORT_DIR`, preventing directory traversal (`../`).
2. **Optimistic Revision Locking**: Mutating tools accept `expectedRevision`. If human edits happen concurrently, the tool halts safely with `REVISION_CONFLICT` rather than overwriting human work.
3. **Single Undo per Agent Tool**: Multi-node additions and recipes are encapsulated in `store.transaction()`, ensuring human users can revert agent actions with a single <kbd>Ctrl+Z</kbd>.
4. **Relay Multiplexing**: If multiple agents or MCP clients connect simultaneously, the second server acts as a Relay, preventing port collisions on `8765`.

