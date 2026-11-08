import { SceneStore } from '../store/SceneStore';

export class SdfStatusBar extends HTMLElement {
  private timer: number | null = null;
  private sceneStore = SceneStore.getInstance();
  private onSceneChangedBound: () => void = () => {};

  connectedCallback() {
    this.render();
    this.timer = window.setInterval(() => this.updateTelemetry(), 500);

    this.onSceneChangedBound = () => this.updateTelemetry();
    this.sceneStore.addEventListener('scene-changed', this.onSceneChangedBound);
    this.sceneStore.addEventListener('selection-changed', this.onSceneChangedBound);
  }

  private render() {
    this.innerHTML = `
      <style>
        .status-bar-container {
          height: 28px;
          background: var(--bg-panel);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          font-size: 11px;
          color: var(--text-secondary);
          user-select: none;
          z-index: 100;
        }
        .status-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #27ae60;
        }
      </style>
      <div class="status-bar-container">
        <div class="status-group">
          <div class="status-pill">
            <span class="status-dot"></span>
            <span>CSG Engine: <strong>Dynamic AST Evaluator</strong></span>
          </div>
          <div class="status-pill font-mono">
            <span>FPS: <strong id="fps-counter" style="color: var(--accent-primary);">60</strong></span>
          </div>
          <div class="status-pill">
            <span>Active Nodes: <strong id="node-count" style="color: var(--text-primary);">0</strong> / 32</span>
          </div>
          <div class="status-pill">
            <span>Selected: <strong id="selected-node-name" style="color: var(--accent-primary);">None</strong></span>
          </div>
        </div>

        <div class="status-group">
          <span>Controls: <strong>Left-Drag</strong> Orbit | <strong>Middle/Right-Drag</strong> Pan | <strong>Wheel</strong> Zoom | <strong>Ctrl+Z/Y</strong> Undo/Redo</span>
        </div>
      </div>
    `;

    this.updateTelemetry();
  }

  private updateTelemetry() {
    const fpsElement = this.querySelector('#fps-counter');
    const viewport = document.querySelector('sdf-viewport') as any;
    if (fpsElement && viewport && typeof viewport.getFps === 'function') {
      fpsElement.textContent = String(viewport.getFps());
    }

    const nodeCountEl = this.querySelector('#node-count');
    if (nodeCountEl) {
      const flattened = this.sceneStore.tree.flattenWithTransforms();
      nodeCountEl.textContent = String(flattened.length);
    }

    const selectedNameEl = this.querySelector('#selected-node-name');
    if (selectedNameEl) {
      const selected = this.sceneStore.getSelectedNode();
      selectedNameEl.textContent = selected ? `${selected.name} (${selected.primitive.type})` : 'Root Scene';
    }
  }

  disconnectedCallback() {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
    this.sceneStore.removeEventListener('scene-changed', this.onSceneChangedBound);
    this.sceneStore.removeEventListener('selection-changed', this.onSceneChangedBound);
  }
}

customElements.define('sdf-status-bar', SdfStatusBar);
