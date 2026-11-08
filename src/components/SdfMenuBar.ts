import { SceneStore } from '../store/SceneStore';
import { CSGTree } from '../tree/CSGTree';
import { PrimitiveType, SDFSceneDocument } from '../tree/types';
import { downloadBlob } from '../engine/MeshExporter';

export class SdfMenuBar extends HTMLElement {
  private sceneStore = SceneStore.getInstance();
  private onHistoryChangedBound: () => void = () => {};
  private isFileMenuOpen = false;

  connectedCallback() {
    this.render();

    this.onHistoryChangedBound = () => {
      this.updateHistoryButtons();
    };
    this.sceneStore.addEventListener('history-changed', this.onHistoryChangedBound);

    // Global click listener to close menu dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target as Node)) {
        this.closeFileMenu();
      }
    });
  }

  private closeFileMenu() {
    this.isFileMenuOpen = false;
    const dropdown = this.querySelector('#file-menu-dropdown');
    if (dropdown) dropdown.classList.remove('open');
  }

  private toggleFileMenu() {
    this.isFileMenuOpen = !this.isFileMenuOpen;
    const dropdown = this.querySelector('#file-menu-dropdown');
    if (dropdown) dropdown.classList.toggle('open', this.isFileMenuOpen);
  }

  private render() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    this.innerHTML = `
      <style>
        .menu-bar-container {
          height: 42px;
          background: var(--bg-panel);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          user-select: none;
          z-index: 100;
          position: relative;
        }
        .brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-logo {
          width: 24px;
          height: 24px;
          background: var(--accent-primary);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(234, 118, 0, 0.35);
        }
        .brand-title {
          font-weight: 600;
          font-size: 13px;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }
        .menu-dropdown-wrapper {
          position: relative;
          display: inline-block;
        }
        .menu-trigger-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-primary);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 120ms ease;
        }
        .menu-trigger-btn:hover {
          background: var(--bg-panel-elevated);
          border-color: var(--border-subtle);
        }
        .menu-dropdown {
          display: none;
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
          min-width: 210px;
          z-index: 200;
          padding: 4px 0;
          flex-direction: column;
        }
        .menu-dropdown.open {
          display: flex;
        }
        .menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 14px;
          font-size: 12px;
          color: var(--text-primary);
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background 100ms ease;
          width: 100%;
        }
        .menu-item:hover {
          background: var(--accent-primary);
          color: #ffffff;
        }
        .menu-item:hover .menu-shortcut {
          color: rgba(255, 255, 255, 0.8);
        }
        .menu-shortcut {
          font-size: 11px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }
        .menu-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 4px 0;
        }
        .history-controls {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: 8px;
        }
        .btn-icon {
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 120ms ease;
        }
        .btn-icon:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          border-color: var(--border-subtle);
        }
        .btn-icon:not(:disabled):hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
        .center-tools {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .add-select {
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          outline: none;
          cursor: pointer;
        }
        .add-select:focus {
          border-color: var(--border-focus);
        }
        .actions-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-export-quick {
          background: var(--accent-primary);
          color: #ffffff;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 120ms ease;
        }
        .btn-export-quick:hover {
          background: var(--accent-hover);
        }
        .theme-btn {
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 120ms ease;
        }
        .theme-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
      </style>

      <div class="menu-bar-container">
        <div class="brand-section">
          <div class="brand-logo">SDF</div>
          <span class="brand-title">SDF Studio 3D</span>
          
          <!-- File Dropdown -->
          <div class="menu-dropdown-wrapper">
            <button class="menu-trigger-btn" id="file-menu-btn">
              File <span style="font-size: 9px; opacity: 0.7;">▼</span>
            </button>
            <div class="menu-dropdown" id="file-menu-dropdown">
              <button class="menu-item" id="item-new-scene">
                <span>📄 New Scene</span>
                <span class="menu-shortcut">Ctrl+N</span>
              </button>
              <button class="menu-item" id="item-open-project">
                <span>📂 Open Project...</span>
                <span class="menu-shortcut">Ctrl+O</span>
              </button>
              <button class="menu-item" id="item-save-project">
                <span>💾 Save Project</span>
                <span class="menu-shortcut">Ctrl+S</span>
              </button>
              <div class="menu-divider"></div>
              <button class="menu-item" id="item-export-mesh">
                <span>💎 Export 3D Mesh (.OBJ/.GLB)...</span>
              </button>
              <button class="menu-item" id="item-export-shader">
                <span>⚡ Export Shader Code...</span>
              </button>
            </div>
          </div>

          <div class="history-controls">
            <button id="btn-undo" class="btn-icon" title="Undo (Ctrl+Z)" ${!this.sceneStore.canUndo() ? 'disabled' : ''}>↶ Undo</button>
            <button id="btn-redo" class="btn-icon" title="Redo (Ctrl+Y)" ${!this.sceneStore.canRedo() ? 'disabled' : ''}>↷ Redo</button>
          </div>
        </div>

        <div class="center-tools">
          <span style="color: var(--text-secondary); font-size: 12px;">+ Add Shape:</span>
          <select id="add-primitive-select" class="add-select">
            <option value="" disabled selected>Select Shape...</option>
            <optgroup label="Basic Euclidean">
              <option value="sphere">⚪ Sphere</option>
              <option value="box">📦 Box / Cube</option>
              <option value="cylinder">🥫 Cylinder</option>
              <option value="torus">🍩 Torus</option>
              <option value="capsule">💊 Capsule</option>
              <option value="cone">🔺 Cone</option>
            </optgroup>
            <optgroup label="Curved & Hollow">
              <option value="pipe">⭕ Pipe / Hollow Tube</option>
              <option value="hemisphere">🌓 Hemisphere</option>
              <option value="ellipsoid">🥚 Ellipsoid</option>
            </optgroup>
            <optgroup label="Polyhedra & Prisms">
              <option value="pyramid">▲ Square Pyramid</option>
              <option value="hexagonal_prism">🛑 Hexagonal Prism</option>
              <option value="triangular_prism">📐 Triangular Prism</option>
              <option value="tetrahedron">💠 Tetrahedron</option>
              <option value="octahedron">💎 Octahedron</option>
            </optgroup>
            <optgroup label="3D Fractals">
              <option value="mandelbulb">🌀 Mandelbulb Fractal</option>
            </optgroup>
          </select>

          <button id="btn-reset-demo" class="btn-icon" title="Reset to CSG Box-Minus-Sphere Demo">
            🔄 Reset Demo
          </button>
        </div>

        <div class="actions-section">
          <button id="btn-open-export" class="btn-export-quick" title="Export 3D Model or Shader Code">
            <span>📦</span> Export
          </button>

          <button id="theme-toggle-btn" class="theme-btn">
            ${isDark ? '☀️ Studio Light' : '🌙 Studio Dark'}
          </button>
        </div>

        <!-- Hidden input for file loading -->
        <input type="file" id="file-input-load" accept=".json,.sdf.json" style="display: none;" />
      </div>
    `;

    this.setupListeners();
  }

  private setupListeners() {
    // File Menu trigger
    const fileMenuBtn = this.querySelector('#file-menu-btn');
    fileMenuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFileMenu();
    });

    // File Menu Items
    this.querySelector('#item-new-scene')?.addEventListener('click', () => {
      this.closeFileMenu();
      this.sceneStore.tree.root = CSGTree.createDefaultScene();
      this.sceneStore.selectNode(this.sceneStore.tree.root.children[0]?.id || null);
      this.sceneStore.dispatchEvent(new CustomEvent('scene-changed', { detail: { tree: this.sceneStore.tree } }));
    });

    const fileInput = this.querySelector('#file-input-load') as HTMLInputElement;
    this.querySelector('#item-open-project')?.addEventListener('click', () => {
      this.closeFileMenu();
      fileInput?.click();
    });

    fileInput?.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const doc = JSON.parse(text) as SDFSceneDocument;
          this.sceneStore.loadFromJSON(doc);
        } catch (err) {
          alert('Failed to parse .sdf.json project file: ' + (err as Error).message);
        }
        fileInput.value = '';
      }
    });

    this.querySelector('#item-save-project')?.addEventListener('click', () => {
      this.closeFileMenu();
      const json = JSON.stringify(this.sceneStore.tree.toJSON(), null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      downloadBlob(blob, 'scene.sdf.json');
    });

    this.querySelector('#item-export-mesh')?.addEventListener('click', () => {
      this.closeFileMenu();
      window.dispatchEvent(new CustomEvent('open-export-modal', { detail: { tab: 'mesh' } }));
    });

    this.querySelector('#item-export-shader')?.addEventListener('click', () => {
      this.closeFileMenu();
      window.dispatchEvent(new CustomEvent('open-export-modal', { detail: { tab: 'shader' } }));
    });

    this.querySelector('#btn-open-export')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-export-modal', { detail: { tab: 'mesh' } }));
    });

    // Undo / Redo buttons
    const undoBtn = this.querySelector('#btn-undo') as HTMLButtonElement;
    undoBtn?.addEventListener('click', () => this.sceneStore.undo());

    const redoBtn = this.querySelector('#btn-redo') as HTMLButtonElement;
    redoBtn?.addEventListener('click', () => this.sceneStore.redo());

    // Add primitive select
    const addSelect = this.querySelector('#add-primitive-select') as HTMLSelectElement;
    addSelect?.addEventListener('change', () => {
      const type = addSelect.value as PrimitiveType;
      if (type) {
        const newNode = CSGTree.createDefaultNode(type);
        newNode.transform.position = [
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ];
        this.sceneStore.addNode(newNode);
        addSelect.selectedIndex = 0;
      }
    });

    // Reset demo
    const resetBtn = this.querySelector('#btn-reset-demo') as HTMLButtonElement;
    resetBtn?.addEventListener('click', () => {
      this.sceneStore.tree.root = CSGTree.createDefaultScene();
      this.sceneStore.selectNode(this.sceneStore.tree.root.children[0]?.id || null);
      this.sceneStore.dispatchEvent(new CustomEvent('scene-changed', { detail: { tree: this.sceneStore.tree } }));
    });

    // Theme toggle
    const themeBtn = this.querySelector('#theme-toggle-btn') as HTMLButtonElement;
    themeBtn?.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('sdf_theme', newTheme);
      this.render();
    });

    // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S, Ctrl+O, Ctrl+N)
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          this.sceneStore.undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          this.sceneStore.redo();
        } else if (e.key === 's') {
          e.preventDefault();
          const json = JSON.stringify(this.sceneStore.tree.toJSON(), null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          downloadBlob(blob, 'scene.sdf.json');
        } else if (e.key === 'o') {
          e.preventDefault();
          fileInput?.click();
        } else if (e.key === 'n') {
          e.preventDefault();
          this.sceneStore.tree.root = CSGTree.createDefaultScene();
          this.sceneStore.selectNode(this.sceneStore.tree.root.children[0]?.id || null);
          this.sceneStore.dispatchEvent(new CustomEvent('scene-changed', { detail: { tree: this.sceneStore.tree } }));
        }
      }
    });
  }

  private updateHistoryButtons() {
    const undoBtn = this.querySelector('#btn-undo') as HTMLButtonElement;
    const redoBtn = this.querySelector('#btn-redo') as HTMLButtonElement;
    if (undoBtn) undoBtn.disabled = !this.sceneStore.canUndo();
    if (redoBtn) redoBtn.disabled = !this.sceneStore.canRedo();
  }

  disconnectedCallback() {
    this.sceneStore.removeEventListener('history-changed', this.onHistoryChangedBound);
  }
}

customElements.define('sdf-menu-bar', SdfMenuBar);
