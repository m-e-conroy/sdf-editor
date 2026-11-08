import { RaymarchRenderer } from '../engine/RaymarchRenderer';
import { SceneStore } from '../store/SceneStore';

// Capability interface to ensure safe typing across renderer versions
interface LookdevRenderer extends RaymarchRenderer {
  setMatcapPreset(preset: number): void;
  setCameraView(view: 'front' | 'right' | 'top'): void;
  toggleShadows(enable?: boolean): void;
  toggleAO(enable?: boolean): void;
  focusOnSelected(): void;
}

export class SdfViewport extends HTMLElement {
  private renderer: LookdevRenderer | null = null;
  private canvasContainer: HTMLDivElement | null = null;
  private hudElement: HTMLDivElement | null = null;
  private sceneStore: SceneStore = SceneStore.getInstance();
  private onSceneChangedBound: () => void = () => {};
  private onKeyDownBound: (e: KeyboardEvent) => void = () => {};

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
          background: rgba(20, 22, 28, 0.76);
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

        .hud-divider {
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.12);
          margin: 0 2px;
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
      </style>

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
    `;

    this.appendChild(this.hudElement);
    this.wireHUDListeners();
  }

  private wireHUDListeners(): void {
    if (!this.hudElement) return;

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
    }
  }

  public getFps(): number {
    return this.renderer ? this.renderer.fps : 60;
  }

  disconnectedCallback() {
    this.sceneStore.removeEventListener('scene-changed', this.onSceneChangedBound);
    window.removeEventListener('keydown', this.onKeyDownBound);
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
  }
}

customElements.define('sdf-viewport', SdfViewport);
