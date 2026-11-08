// ========================================================================
// SDF Studio 3D - Root Application Layout Coordinator
// ========================================================================

export class SdfApp extends HTMLElement {
  connectedCallback() {
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    this.style.width = '100vw';
    this.style.height = '100vh';
    this.style.overflow = 'hidden';
    this.style.position = 'relative';

    this.innerHTML = `
      <!-- Top Menu Bar -->
      <sdf-menu-bar></sdf-menu-bar>

      <!-- Center Viewport & Floating Windows Workspace -->
      <div id="workspace-viewport" style="flex: 1; position: relative; width: 100%; height: 100%; overflow: hidden;">
        <!-- 3D Raymarching Canvas -->
        <sdf-viewport></sdf-viewport>

        <!-- Floating & Dockable Window: Outliner -->
        <sdf-window window-id="panel-outliner" title="Outliner" icon="📦">
          <sdf-outliner></sdf-outliner>
        </sdf-window>

        <!-- Floating & Dockable Window: Properties Inspector -->
        <sdf-window window-id="panel-inspector" title="Properties Inspector" icon="⚙️">
          <sdf-inspector></sdf-inspector>
        </sdf-window>

        <!-- Glassmorphic Bottom Shelf Parking Tray for Minimized Panels -->
        <sdf-dock-tray></sdf-dock-tray>
      </div>

      <!-- Bottom Status Bar -->
      <sdf-status-bar></sdf-status-bar>

      <!-- Asset, Mesh & Shader Export Modal -->
      <sdf-export-modal></sdf-export-modal>
    `;
  }
}

customElements.define('sdf-app', SdfApp);
