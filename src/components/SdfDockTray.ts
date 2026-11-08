// ========================================================================
// SDF Studio 3D - Glassmorphic Bottom Parking Tray Element
// ========================================================================

import { WorkspaceStore, WorkspacePreset } from '../store/WorkspaceStore';

export class SdfDockTray extends HTMLElement {
  private workspaceStore = WorkspaceStore.getInstance();
  private onLayoutChangedBound: () => void = () => {};

  connectedCallback() {
    this.render();

    this.onLayoutChangedBound = () => this.updatePills();
    this.workspaceStore.addEventListener('layout-changed', this.onLayoutChangedBound);
  }

  disconnectedCallback() {
    this.workspaceStore.removeEventListener('layout-changed', this.onLayoutChangedBound);
  }

  private render() {
    this.innerHTML = `
      <style>
        .dock-tray-bar {
          position: fixed;
          bottom: 34px;
          left: 50%;
          transform: translateX(-50%);
          height: 38px;
          background: var(--dock-tray-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          display: flex;
          align-items: center;
          padding: 0 10px;
          gap: 6px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
          z-index: 90;
          user-select: none;
        }

        .tray-pills-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tray-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: 14px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 120ms ease;
        }

        .tray-pill:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          transform: translateY(-1px);
        }

        .tray-pill.is-minimized {
          opacity: 0.65;
          border-style: dashed;
        }

        .tray-pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-primary);
        }

        .tray-pill.is-minimized .tray-pill-dot {
          background: var(--text-muted);
        }

        .tray-separator {
          width: 1px;
          height: 18px;
          background: var(--border-subtle);
          margin: 0 4px;
        }

        .preset-select {
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          border-radius: 12px;
          padding: 3px 8px;
          font-size: 11px;
          cursor: pointer;
          outline: none;
        }

        .preset-select:focus {
          border-color: var(--border-focus);
          color: var(--text-primary);
        }
      </style>
      <div class="dock-tray-bar">
        <div class="tray-pills-group" id="pills-container"></div>
        <div class="tray-separator"></div>
        <select class="preset-select" id="workspace-preset-select" title="Switch Workspace Layout">
          <option value="Default">📐 Default Layout</option>
          <option value="Sculpting">🗿 Free Sculpting</option>
          <option value="Technical">⚙️ Technical Split</option>
        </select>
      </div>
    `;

    this.updatePills();

    const presetSelect = this.querySelector('#workspace-preset-select') as HTMLSelectElement;
    presetSelect?.addEventListener('change', () => {
      this.workspaceStore.applyPreset(presetSelect.value as WorkspacePreset);
    });
  }

  private updatePills() {
    const container = this.querySelector('#pills-container');
    if (!container) return;

    const panels = this.workspaceStore.getAllPanels();
    container.innerHTML = '';

    for (const p of panels) {
      const btn = document.createElement('button');
      btn.className = `tray-pill ${p.isMinimized ? 'is-minimized' : 'is-active'}`;
      btn.title = p.isMinimized ? `Restore ${p.title}` : `Minimize ${p.title}`;
      btn.innerHTML = `
        <span class="tray-pill-dot"></span>
        <span>${p.icon} ${p.title}</span>
      `;

      btn.addEventListener('click', () => {
        if (p.isMinimized) {
          this.workspaceStore.restorePanel(p.id);
        } else {
          this.workspaceStore.minimizePanel(p.id);
        }
      });

      container.appendChild(btn);
    }

    const presetSelect = this.querySelector('#workspace-preset-select') as HTMLSelectElement;
    if (presetSelect && presetSelect.value !== this.workspaceStore.activePreset) {
      presetSelect.value = this.workspaceStore.activePreset;
    }
  }
}

customElements.define('sdf-dock-tray', SdfDockTray);

