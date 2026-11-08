import { RaymarchRenderer } from '../engine/RaymarchRenderer';
import { SceneStore } from '../store/SceneStore';

// Capability interface to ensure safe typing across renderer versions
interface LookdevRenderer extends RaymarchRenderer {
  setMatcapPreset(preset: number): void;
  setCameraView(view: 'front' | 'right' | 'top'): void;
  toggleShadows(enable?: boolean): void;
  toggleAO(enable?: boolean): void;
  toggleGrid(enable?: boolean): void;
  isShowGrid(): boolean;
  captureSnapshot(filename?: string): void;
  focusOnSelected(): void;
  setGizmoMode(mode: 'translate' | 'rotate' | 'scale'): void;
  getGizmoMode(): 'translate' | 'rotate' | 'scale';
}

export class SdfViewport extends HTMLElement {
  private renderer: LookdevRenderer | null = null;
  private canvasContainer: HTMLDivElement | null = null;
  private hudElement: HTMLDivElement | null = null;
  private sceneStore: SceneStore = SceneStore.getInstance();
  private onSceneChangedBound: () => void = () => {};
  private onKeyDownBound: (e: KeyboardEvent) => void = () => {};
  private onGizmoModeChangedBound: (e: Event) => void = () => {};

  // HUD state
  private shadowsActive = true;
  private aoActive = true;

  connectedCallback() {
    this.style.display = 'block';
    this.style.width = '100%';
    this.style.height = '100%';
    this.style.position = 'relative';
    this.style.overflow = 'hidden';

    // 1. Canvas Container
    this.canvasContainer = document.createElement('div');
    this.canvasContainer.style.width = '100%';
    this.canvasContainer.style.height = '100%';
    this.canvasContainer.style.position = 'absolute';
    this.canvasContainer.style.inset = '0';
    this.appendChild(this.canvasContainer);

    // 2. Initialize Raymarch Renderer
    this.renderer = new RaymarchRenderer(this.canvasContainer) as LookdevRenderer;
    this.renderer.setTree(this.sceneStore.tree);

    // 3. Connect reactive store updates
    this.onSceneChangedBound = () => {
      if (this.renderer) {
        this.renderer.syncUniforms();
      }
    };
    this.sceneStore.addEventListener('scene-changed', this.onSceneChangedBound);

    // 4. Mount Lookdev Glassmorphic HUD
    this.setupViewportHUD();

    // 5. Global NumPad & Camera View Shortcuts
    this.onKeyDownBound = (e: KeyboardEvent) => this.handleKeyDown(e);
    window.addEventListener('keydown', this.onKeyDownBound);

    // 6. Start Render Loop
    const getTheme = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    this.renderer.start(getTheme);
  }

  private setupViewportHUD(): void {
    this.hudElement = document.createElement('div');
    this.hudElement.className = 'viewport-hud';

    this.hudElement.innerHTML = `
      <style>
        .viewport-hud {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(20, 22, 28, 0.78);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 4px 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: 11px;
          color: #e2e8f0;
          pointer-events: auto;
          user-select: none;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }

        [data-theme="light"] .viewport-hud {
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(0, 0, 0, 0.12);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04);
          color: #18181b;
        }

        .gizmo-mode-group {
          display: inline-flex;
          align-items: center;
          background: rgba(12, 14, 18, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 5px;
          padding: 2px;
          gap: 2px;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        [data-theme="light"] .gizmo-mode-group {
          background: rgba(230, 232, 238, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.09);
        }

        .gizmo-btn {
          appearance: none;
          border: 1px solid transparent;
          background: transparent;
          color: #94a3b8;
          border-radius: 3.5px;
          padding: 3px 6px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.14s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }

        .gizmo-btn .gizmo-icon {
          flex-shrink: 0;
          stroke: currentColor;
          transition: transform 0.15s ease;
        }

        .gizmo-btn .gizmo-label {
          font-size: 11px;
          letter-spacing: -0.01em;
        }

        .gizmo-btn .gizmo-kbd {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 600;
          padding: 1px 3.5px;
          background: rgba(255, 255, 255, 0.08);
          color: #64748b;
          border-radius: 2px;
          line-height: 1;
          transition: all 0.14s ease;
        }

        .gizmo-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.07);
          color: #f1f5f9;
          border-color: rgba(255, 255, 255, 0.06);
        }

        .gizmo-btn:hover:not(.active) .gizmo-kbd {
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.12);
        }

        [data-theme="light"] .gizmo-btn {
          color: #475569;
        }

        [data-theme="light"] .gizmo-btn:hover:not(.active) {
          background: rgba(0, 0, 0, 0.06);
          color: #0f172a;
          border-color: rgba(0, 0, 0, 0.06);
        }

        [data-theme="light"] .gizmo-btn .gizmo-kbd {
          background: rgba(0, 0, 0, 0.07);
          color: #475569;
        }

        [data-theme="light"] .gizmo-btn:hover:not(.active) .gizmo-kbd {
          background: rgba(0, 0, 0, 0.12);
          color: #0f172a;
        }

        .gizmo-btn.active {
          background: linear-gradient(180deg, #ea7600 0%, #cf6300 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 185, 95, 0.45);
          box-shadow: 0 0 10px rgba(234, 118, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.28);
        }

        .gizmo-btn.active .gizmo-icon {
          stroke: #ffffff;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
          transform: scale(1.05);
        }

        .gizmo-btn.active .gizmo-kbd {
          background: rgba(0, 0, 0, 0.32);
          color: #fed7aa;
        }

        .gizmo-btn:active {
          transform: scale(0.96);
        }

        .hud-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .hud-select {
          background: rgba(36, 40, 50, 0.85);
          color: #f1f5f9;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          padding: 3px 6px;
          font-size: 11px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .hud-select:hover {
          background: rgba(48, 54, 66, 0.95);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .hud-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }

        .hud-select option {
          background: #1e222b;
          color: #f1f5f9;
        }

        [data-theme="light"] .hud-select {
          background: rgba(240, 240, 244, 0.95);
          color: #18181b;
          border: 1px solid rgba(0, 0, 0, 0.14);
        }

        [data-theme="light"] .hud-select:hover {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.25);
        }

        [data-theme="light"] .hud-select option {
          background: #ffffff;
          color: #18181b;
        }

        .hud-divider {
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.12);
          margin: 0 2px;
          transition: background 0.2s ease;
        }

        [data-theme="light"] .hud-divider {
          background: rgba(0, 0, 0, 0.12);
        }

        .hud-btn, .hud-toggle {
          background: rgba(36, 40, 50, 0.8);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 3px 7px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.12s ease;
          white-space: nowrap;
        }

        .hud-btn:hover {
          background: rgba(54, 61, 75, 0.9);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.22);
        }

        .hud-btn:active {
          transform: translateY(1px);
        }

        .hud-toggle.active {
          background: rgba(59, 130, 246, 0.22);
          color: #93c5fd;
          border-color: rgba(59, 130, 246, 0.55);
        }

        .hud-toggle.active:hover {
          background: rgba(59, 130, 246, 0.32);
          color: #ffffff;
        }

        [data-theme="light"] .hud-btn,
        [data-theme="light"] .hud-toggle {
          background: rgba(240, 240, 244, 0.9);
          color: #334155;
          border: 1px solid rgba(0, 0, 0, 0.12);
        }

        [data-theme="light"] .hud-btn:hover {
          background: #ffffff;
          color: #0f172a;
          border-color: rgba(0, 0, 0, 0.24);
        }

        [data-theme="light"] .hud-toggle:hover:not(.active) {
          background: #ffffff;
          color: #0f172a;
          border-color: rgba(0, 0, 0, 0.24);
        }

        [data-theme="light"] .hud-toggle.active {
          background: rgba(37, 99, 235, 0.12);
          color: #1d4ed8;
          border-color: rgba(37, 99, 235, 0.45);
        }

        [data-theme="light"] .hud-toggle.active:hover {
          background: rgba(37, 99, 235, 0.2);
          color: #1e40af;
          border-color: rgba(37, 99, 235, 0.6);
        }
      </style>

      <!-- 3D Transform Gizmo Mode Switcher -->
      <div class="hud-group gizmo-mode-group" role="radiogroup" aria-label="Transform Gizmo Mode">
        <button id="gizmo-mode-translate" class="gizmo-btn active" data-mode="translate" title="Translate / Move (G or W)">
          <svg class="gizmo-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 1v14M1 8h14"/>
            <path d="M5.5 3.5L8 1l2.5 2.5"/>
            <path d="M5.5 12.5L8 15l2.5-2.5"/>
            <path d="M3.5 5.5L1 8l2.5 2.5"/>
            <path d="M12.5 5.5L15 8l-2.5 2.5"/>
          </svg>
          <span class="gizmo-label">Move</span>
          <span class="gizmo-kbd">G</span>
        </button>

        <button id="gizmo-mode-rotate" class="gizmo-btn" data-mode="rotate" title="Rotate (R or E)">
          <svg class="gizmo-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13.5 8a5.5 5.5 0 0 1-9.3 4M2.5 8a5.5 5.5 0 0 1 9.3-4"/>
            <polyline points="14 4 14 8 10 8"/>
            <polyline points="2 12 2 8 6 8"/>
          </svg>
          <span class="gizmo-label">Rotate</span>
          <span class="gizmo-kbd">R</span>
        </button>

        <button id="gizmo-mode-scale" class="gizmo-btn" data-mode="scale" title="Scale (S)">
          <svg class="gizmo-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" fill-opacity="0.25"/>
            <rect x="9" y="2" width="5" height="5" rx="1"/>
            <path d="M6 10L10 6"/>
            <path d="M7 6h3v3"/>
          </svg>
          <span class="gizmo-label">Scale</span>
          <span class="gizmo-kbd">S</span>
        </button>
      </div>

      <div class="hud-divider"></div>

      <!-- Lookdev Shading Preset Switcher -->
      <div class=\"hud-group\">
        <select id=\"hud-shading-select\" class=\"hud-select\" title=\"Shading & Lookdev Preset\">
          <option value=\"0\">🎨 Dark Clay</option>
          <option value=\"1\">🕯️ Red Wax</option>
          <option value=\"2\">🌈 Normal Map</option>
          <option value=\"3\">🪞 Chrome Mirror</option>
          <option value=\"4\">🌅 Sunset Horizon</option>
        </select>
      </div>

      <div class=\"hud-divider\"></div>

      <!-- Feature Toggles -->
      <div class=\"hud-group\">
        <button id=\"hud-toggle-grid\" class=\"hud-toggle active\" title=\"Toggle CAD Floor Grid\">
          <span>🌐 Grid</span>
        </button>
        <button id=\"hud-toggle-shadows\" class=\"hud-toggle active\" title=\"Toggle Soft Shadows\">
          <span>☀️ Shadows</span>
        </button>
        <button id=\"hud-toggle-ao\" class=\"hud-toggle active\" title=\"Toggle Ambient Occlusion\">
          <span>🌑 AO</span>
        </button>
      </div>

      <div class=\"hud-divider\"></div>

      <!-- View Angle Shortcuts -->
      <div class=\"hud-group\">
        <button id=\"hud-cam-front\" class=\"hud-btn\" title=\"Front View (Numpad 1)\">Front (1)</button>
        <button id=\"hud-cam-right\" class=\"hud-btn\" title=\"Right View (Numpad 3)\">Right (3)</button>
        <button id=\"hud-cam-top\" class=\"hud-btn\" title=\"Top View (Numpad 7)\">Top (7)</button>
        <button id=\"hud-cam-focus\" class=\"hud-btn\" title=\"Frame Selected Object (F)\">Focus (F)</button>
      </div>

      <div class=\"hud-divider\"></div>

      <!-- Snapshot Capture -->
      <div class=\"hud-group\">
        <button id=\"hud-btn-snapshot\" class=\"hud-btn\" title=\"Capture Clean PNG Snapshot\">
          <span>📷 Snapshot</span>
        </button>
      </div>
    `;

    this.appendChild(this.hudElement);
    this.wireHUDListeners();
  }

  private wireHUDListeners(): void {
    if (!this.hudElement) return;

    // Floor Grid Toggle
    const gridBtn = this.hudElement.querySelector('#hud-toggle-grid') as HTMLButtonElement;
    gridBtn?.addEventListener('click', () => {
      this.renderer?.toggleGrid();
      gridBtn.classList.toggle('active', this.renderer?.isShowGrid() ?? true);
    });

    // Clean Snapshot Capture
    const snapshotBtn = this.hudElement.querySelector('#hud-btn-snapshot') as HTMLButtonElement;
    snapshotBtn?.addEventListener('click', () => {
      this.renderer?.captureSnapshot();
    });

    // Shading Preset
    const shadingSelect = this.hudElement.querySelector('#hud-shading-select') as HTMLSelectElement;
    shadingSelect?.addEventListener('change', () => {
      const preset = parseInt(shadingSelect.value, 10);
      this.renderer?.setMatcapPreset(preset);
    });

    // Shadows Toggle
    const shadowsBtn = this.hudElement.querySelector('#hud-toggle-shadows') as HTMLButtonElement;
    shadowsBtn?.addEventListener('click', () => {
      this.shadowsActive = !this.shadowsActive;
      shadowsBtn.classList.toggle('active', this.shadowsActive);
      this.renderer?.toggleShadows(this.shadowsActive);
    });

    // AO Toggle
    const aoBtn = this.hudElement.querySelector('#hud-toggle-ao') as HTMLButtonElement;
    aoBtn?.addEventListener('click', () => {
      this.aoActive = !this.aoActive;
      aoBtn.classList.toggle('active', this.aoActive);
      this.renderer?.toggleAO(this.aoActive);
    });

    // Camera Views
    const btnFront = this.hudElement.querySelector('#hud-cam-front') as HTMLButtonElement;
    btnFront?.addEventListener('click', () => {
      this.renderer?.setCameraView('front');
    });

    const btnRight = this.hudElement.querySelector('#hud-cam-right') as HTMLButtonElement;
    btnRight?.addEventListener('click', () => {
      this.renderer?.setCameraView('right');
    });

    const btnTop = this.hudElement.querySelector('#hud-cam-top') as HTMLButtonElement;
    btnTop?.addEventListener('click', () => {
      this.renderer?.setCameraView('top');
    });

    const btnFocus = this.hudElement.querySelector('#hud-cam-focus') as HTMLButtonElement;
    btnFocus?.addEventListener('click', () => {
      this.renderer?.focusOnSelected();
    });

    // 3D Transform Gizmo Mode Switcher
    const gizmoBtns = this.hudElement.querySelectorAll('.gizmo-btn');
    gizmoBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = (btn as HTMLElement).dataset.mode as 'translate' | 'rotate' | 'scale';
        if (mode) {
          this.renderer?.setGizmoMode(mode);
        }
      });
    });

    const updateActiveGizmoBtn = (mode: string) => {
      gizmoBtns.forEach((btn) => {
        btn.classList.toggle('active', (btn as HTMLElement).dataset.mode === mode);
      });
    };

    this.onGizmoModeChangedBound = ((e: CustomEvent<{ mode: string }>) => {
      if (e.detail?.mode) {
        updateActiveGizmoBtn(e.detail.mode);
      }
    }) as EventListener;
    window.addEventListener('gizmo-mode-changed', this.onGizmoModeChangedBound);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Prevent overriding when user is actively editing text inputs or sliders
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return;
    }

    if (e.key === '1' || e.code === 'Numpad1') {
      e.preventDefault();
      this.renderer?.setCameraView('front');
    } else if (e.key === '3' || e.code === 'Numpad3') {
      e.preventDefault();
      this.renderer?.setCameraView('right');
    } else if (e.key === '7' || e.code === 'Numpad7') {
      e.preventDefault();
      this.renderer?.setCameraView('top');
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      this.renderer?.focusOnSelected();
    } else if ((e.key === 'd' || e.key === 'D') && (e.shiftKey || e.ctrlKey || e.metaKey)) {
      // Duplicate selected node (Shift+D or Ctrl+D)
      e.preventDefault();
      const selected = this.sceneStore.getSelectedNode();
      if (selected && selected.id !== this.sceneStore.tree.root.id) {
        this.sceneStore.duplicateNode(selected.id);
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      // Delete selected node
      e.preventDefault();
      const selected = this.sceneStore.getSelectedNode();
      if (selected && selected.id !== this.sceneStore.tree.root.id) {
        this.sceneStore.removeNode(selected.id);
      }
    } else if (e.key === 'Escape') {
      // Deselect
      this.sceneStore.selectNode(null);
    }
  }

  public getFps(): number {
    return this.renderer ? this.renderer.fps : 60;
  }

  disconnectedCallback() {
    this.sceneStore.removeEventListener('scene-changed', this.onSceneChangedBound);
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('gizmo-mode-changed', this.onGizmoModeChangedBound);
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
  }
}

customElements.define('sdf-viewport', SdfViewport);
