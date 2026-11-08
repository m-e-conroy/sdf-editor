// ========================================================================
// SDF Studio 3D - Asset & Code Export Modal Component
// Blender 4 DCC styling: Slate/Charcoal palette, 1px subtle borders,
// JetBrains Mono tabular readouts, backdrop blur overlay.
// ========================================================================

import { SceneStore } from '../store/SceneStore';
import { ShaderExporter } from '../engine/ShaderExporter';
import { MeshExtractor } from '../engine/MeshExtractor';
import { exportOBJ, exportGLB, downloadBlob } from '../engine/MeshExporter';

export type ExportModalTab = 'mesh' | 'shader' | 'project';

export class SdfExportModal extends HTMLElement {
  private sceneStore = SceneStore.getInstance();
  private activeTab: ExportModalTab = 'mesh';
  private isOpen = false;

  // Mesh extraction state
  private isExtracting = false;
  private extractor = new MeshExtractor();

  connectedCallback() {
    this.render();
    this.setupListeners();

    // Listen for global open requests from menu bar
    window.addEventListener('open-export-modal', ((e: CustomEvent<{ tab?: ExportModalTab }>) => {
      this.open(e.detail?.tab || 'mesh');
    }) as EventListener);
  }

  public open(tab: ExportModalTab = 'mesh') {
    this.activeTab = tab;
    this.isOpen = true;
    this.style.display = 'flex';
    this.render();
    this.updateTabContent();
  }

  public close() {
    this.isOpen = false;
    this.style.display = 'none';
    this.extractor.terminate();
    this.isExtracting = false;
  }

  private render() {
    this.innerHTML = `
      <style>
        :host {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(10, 10, 12, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          align-items: center;
          justify-content: center;
          user-select: none;
        }

        .modal-dialog {
          width: 680px;
          max-width: 92vw;
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.65);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modalPop 160ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalPop {
          0% { opacity: 0; transform: scale(0.96) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: var(--bg-panel-elevated);
          border-bottom: 1px solid var(--border-subtle);
        }

        .modal-title {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 16px;
          padding: 4px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 120ms ease, color 120ms ease;
        }

        .modal-close-btn:hover {
          background: var(--border-subtle);
          color: var(--text-primary);
        }

        .modal-tabs {
          display: flex;
          background: var(--bg-input);
          border-bottom: 1px solid var(--border-subtle);
          padding: 0 16px;
          gap: 6px;
        }

        .tab-btn {
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 120ms ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--accent-primary);
          border-bottom-color: var(--accent-primary);
        }

        .modal-body {
          padding: 20px;
          min-height: 280px;
          display: flex;
          flex-direction: column;
        }

        .tab-pane {
          display: none;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }

        .tab-pane.active {
          display: flex;
        }

        .form-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-select, .form-input {
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          outline: none;
          font-family: inherit;
        }

        .form-select:focus, .form-input:focus {
          border-color: var(--accent-primary);
        }

        .radio-group {
          display: flex;
          gap: 16px;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-primary);
          cursor: pointer;
        }

        .radio-label input[type="radio"] {
          accent-color: var(--accent-primary);
        }

        .progress-container {
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          height: 18px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .progress-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0%;
          background: var(--accent-primary);
          transition: width 120ms ease;
        }

        .progress-text {
          position: relative;
          width: 100%;
          text-align: center;
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          color: var(--text-primary);
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
        }

        .code-preview-box {
          background: var(--bg-app-base);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          padding: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          line-height: 1.5;
          color: var(--text-primary);
          height: 220px;
          overflow-y: auto;
          white-space: pre;
          user-select: text;
        }

        .action-btn-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 14px;
        }

        .btn-primary {
          background: var(--accent-primary);
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 120ms ease;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--bg-panel-elevated);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          padding: 8px 14px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 120ms ease;
        }

        .btn-secondary:hover {
          background: var(--border-subtle);
        }

        .info-card {
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          padding: 12px 14px;
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      </style>

      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title">
            <span>📦</span> Export Asset & Scene Code
          </div>
          <button class="modal-close-btn" id="btn-close-modal" title="Close (Esc)">✕</button>
        </div>

        <div class="modal-tabs">
          <button class="tab-btn active" data-tab="mesh">💎 3D Mesh (.OBJ / .GLB)</button>
          <button class="tab-btn" data-tab="shader">⚡ GLSL Shader (Shadertoy)</button>
          <button class="tab-btn" data-tab="project">📄 Project (.sdf.json)</button>
        </div>

        <div class="modal-body">
          <!-- MESH TAB -->
          <div class="tab-pane active" id="pane-mesh">
            <div class="form-row">
              <label class="form-label">Mesh Extraction Resolution</label>
              <select class="form-select" id="select-resolution">
                <option value="32">Draft (32³ Grid - Instant)</option>
                <option value="64" selected>Standard (64³ Grid - Balanced, Recommended)</option>
                <option value="128">High (128³ Grid - Fine Edges & Creases)</option>
              </select>
            </div>

            <div class="form-row">
              <label class="form-label">Export Format</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="mesh-format" value="obj" checked />
                  <span>Wavefront .OBJ (Standard ASCII)</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="mesh-format" value="glb" />
                  <span>Binary glTF .GLB (Embedded Materials)</span>
                </label>
              </div>
            </div>

            <div class="form-row">
              <label class="form-label" id="progress-status-label">Extraction Status: Ready</label>
              <div class="progress-container">
                <div class="progress-bar" id="mesh-progress-bar"></div>
                <div class="progress-text" id="mesh-progress-text">0%</div>
              </div>
            </div>

            <div class="action-btn-row">
              <button class="btn-secondary" id="btn-cancel-mesh">Cancel</button>
              <button class="btn-primary" id="btn-extract-mesh">
                <span>⚡</span> Generate & Download Mesh
              </button>
            </div>
          </div>

          <!-- SHADER TAB -->
          <div class="tab-pane" id="pane-shader">
            <div class="info-card">
              Self-contained Shadertoy fragment shader with raymarching loop, smooth polynomial CSG booleans, and camera controls.
            </div>

            <div class="code-preview-box" id="shader-code-preview">// Generating shader code...</div>

            <div class="action-btn-row">
              <button class="btn-secondary" id="btn-copy-shader">📋 Copy to Clipboard</button>
              <button class="btn-primary" id="btn-download-shader">
                <span>💾</span> Download .glsl File
              </button>
            </div>
          </div>

          <!-- PROJECT JSON TAB -->
          <div class="tab-pane" id="pane-project">
            <div class="info-card">
              Save the complete procedural CSG AST scene, hierarchy, transforms, materials, and modifier configs into a standard <code>.sdf.json</code> document.
            </div>

            <div class="code-preview-box" id="project-json-preview">// Loading JSON document...</div>

            <div class="action-btn-row">
              <button class="btn-secondary" id="btn-copy-json">📋 Copy JSON</button>
              <button class="btn-primary" id="btn-download-json">
                <span>💾</span> Save Project (.sdf.json)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private setupListeners() {
    // Backdrop click dismisses
    this.addEventListener('click', (e) => {
      if (e.target === this) this.close();
    });

    // Close button
    this.querySelector('#btn-close-modal')?.addEventListener('click', () => this.close());
    this.querySelector('#btn-cancel-mesh')?.addEventListener('click', () => this.close());

    // Global Esc listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Tab buttons
    this.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab as ExportModalTab;
        if (tab) {
          this.activeTab = tab;
          this.updateTabContent();
        }
      });
    });

    // Mesh extraction
    this.querySelector('#btn-extract-mesh')?.addEventListener('click', () => this.startMeshExtraction());

    // Shader copy & download
    this.querySelector('#btn-copy-shader')?.addEventListener('click', () => this.copyShaderToClipboard());
    this.querySelector('#btn-download-shader')?.addEventListener('click', () => this.downloadShaderFile());

    // Project JSON copy & download
    this.querySelector('#btn-copy-json')?.addEventListener('click', () => this.copyProjectJson());
    this.querySelector('#btn-download-json')?.addEventListener('click', () => this.downloadProjectJson());
  }

  private updateTabContent() {
    // Update active tab buttons
    this.querySelectorAll('.tab-btn').forEach((btn) => {
      const tab = (btn as HTMLElement).dataset.tab;
      btn.classList.toggle('active', tab === this.activeTab);
    });

    // Update active pane
    this.querySelectorAll('.tab-pane').forEach((pane) => {
      pane.classList.toggle('active', pane.id === `pane-${this.activeTab}`);
    });

    if (this.activeTab === 'shader') {
      const preview = this.querySelector('#shader-code-preview');
      if (preview) {
        preview.textContent = ShaderExporter.exportShadertoy(this.sceneStore.tree);
      }
    } else if (this.activeTab === 'project') {
      const preview = this.querySelector('#project-json-preview');
      if (preview) {
        preview.textContent = JSON.stringify(this.sceneStore.tree.toJSON(), null, 2);
      }
    }
  }

  private async startMeshExtraction() {
    if (this.isExtracting) return;

    const selectRes = this.querySelector('#select-resolution') as HTMLSelectElement;
    const resolution = parseInt(selectRes?.value || '64', 10);
    const formatRadio = this.querySelector('input[name="mesh-format"]:checked') as HTMLInputElement;
    const format = formatRadio?.value || 'obj';

    const extractBtn = this.querySelector('#btn-extract-mesh') as HTMLButtonElement;
    const progressBar = this.querySelector('#mesh-progress-bar') as HTMLElement;
    const progressText = this.querySelector('#mesh-progress-text') as HTMLElement;
    const statusLabel = this.querySelector('#progress-status-label') as HTMLElement;

    this.isExtracting = true;
    if (extractBtn) extractBtn.disabled = true;

    try {
      if (statusLabel) statusLabel.textContent = `Polygonizing volume at ${resolution}³ grid...`;

      const result = await this.extractor.extract(this.sceneStore.tree, resolution, (p) => {
        const percent = Math.round(p * 100);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${percent}%`;
      });

      if (statusLabel) statusLabel.textContent = `Formatting ${format.toUpperCase()} (${(result.positions.length / 9).toLocaleString()} triangles)...`;

      if (format === 'glb') {
        const rootColor = this.sceneStore.tree.root.material?.color || '#e2e8f0';
        const blob = await exportGLB(result.positions, result.normals, rootColor);
        downloadBlob(blob, `sdf_studio_model_${resolution}res.glb`);
      } else {
        const objText = exportOBJ(result.positions, result.normals, 'SDF_Model');
        const blob = new Blob([objText], { type: 'text/plain' });
        downloadBlob(blob, `sdf_studio_model_${resolution}res.obj`);
      }

      if (statusLabel) statusLabel.textContent = `✅ Export Complete! File downloaded.`;
    } catch (err) {
      console.error('Mesh extraction failed:', err);
      if (statusLabel) statusLabel.textContent = `❌ Extraction Error: ${(err as Error).message}`;
    } finally {
      this.isExtracting = false;
      if (extractBtn) extractBtn.disabled = false;
    }
  }

  private copyShaderToClipboard() {
    const code = ShaderExporter.exportShadertoy(this.sceneStore.tree);
    navigator.clipboard.writeText(code).then(() => {
      const btn = this.querySelector('#btn-copy-shader');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => (btn.textContent = orig), 1500);
      }
    });
  }

  private downloadShaderFile() {
    const code = ShaderExporter.exportShadertoy(this.sceneStore.tree);
    const blob = new Blob([code], { type: 'text/plain' });
    downloadBlob(blob, 'sdf_scene_shadertoy.glsl');
  }

  private copyProjectJson() {
    const json = JSON.stringify(this.sceneStore.tree.toJSON(), null, 2);
    navigator.clipboard.writeText(json).then(() => {
      const btn = this.querySelector('#btn-copy-json');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => (btn.textContent = orig), 1500);
      }
    });
  }

  private downloadProjectJson() {
    const json = JSON.stringify(this.sceneStore.tree.toJSON(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, 'scene.sdf.json');
  }
}

customElements.define('sdf-export-modal', SdfExportModal);
