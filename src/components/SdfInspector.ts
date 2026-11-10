// ========================================================================
// SDF Studio 3D - Property Inspector Element with Live Scrubbers & Modifiers
// ========================================================================

import { SceneStore } from '../store/SceneStore';
import { CSGOpType, BlendMode } from '../tree/types';
import { escapeHtml } from '../utils/escapeHtml';

// Scene data can come from imported files or agents, so only finite numbers reach the HTML
const num = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export class SdfInspector extends HTMLElement {
  private sceneStore = SceneStore.getInstance();
  private onSelectionChangedBound: () => void = () => {};
  private onSceneChangedBound: () => void = () => {};
  private onGizmoModeChangedBound: (e: Event) => void = () => {};
  private activeGizmoMode: 'translate' | 'rotate' | 'scale' = 'translate';
  private sliderGestureOpen = false;

  // Range and color inputs fire 'input' on every pointer move; one drag becomes one undo step
  private readonly onControlInput = (e: Event): void => {
    const target = e.target;
    if (this.sliderGestureOpen || !(target instanceof HTMLInputElement)) return;
    if (target.type !== 'range' && target.type !== 'color') return;
    this.sliderGestureOpen = true;
    this.sceneStore.beginGesture(`Adjust ${this.sceneStore.getSelectedNode()?.name ?? 'Object'}`);
  };

  private readonly endSliderGesture = (): void => {
    if (!this.sliderGestureOpen) return;
    this.sliderGestureOpen = false;
    this.sceneStore.endGesture();
  };

  connectedCallback() {
    this.render();

    this.addEventListener('input', this.onControlInput, true);
    this.addEventListener('change', this.endSliderGesture, true);
    this.addEventListener('focusout', this.endSliderGesture, true);
    window.addEventListener('pointerup', this.endSliderGesture);

    this.onSelectionChangedBound = () => this.render();
    this.onSceneChangedBound = () => this.syncValues();
    this.onGizmoModeChangedBound = ((e: CustomEvent<{ mode: 'translate' | 'rotate' | 'scale' }>) => {
      if (e.detail?.mode) {
        this.activeGizmoMode = e.detail.mode;
        this.querySelectorAll('.insp-pill').forEach((pill) => {
          pill.classList.toggle('active', (pill as HTMLElement).dataset.mode === e.detail.mode);
        });
      }
    }) as EventListener;

    this.sceneStore.addEventListener('selection-changed', this.onSelectionChangedBound);
    this.sceneStore.addEventListener('scene-changed', this.onSceneChangedBound);
    window.addEventListener('gizmo-mode-changed', this.onGizmoModeChangedBound);
  }

  disconnectedCallback() {
    this.endSliderGesture();
    this.removeEventListener('input', this.onControlInput, true);
    this.removeEventListener('change', this.endSliderGesture, true);
    this.removeEventListener('focusout', this.endSliderGesture, true);
    window.removeEventListener('pointerup', this.endSliderGesture);
    this.sceneStore.removeEventListener('selection-changed', this.onSelectionChangedBound);
    this.sceneStore.removeEventListener('scene-changed', this.onSceneChangedBound);
    window.removeEventListener('gizmo-mode-changed', this.onGizmoModeChangedBound);
  }

  private render() {
    const node = this.sceneStore.getSelectedNode();

    if (!node) {
      this.innerHTML = `
        <div style="padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <div style="font-size: 28px; margin-bottom: 8px;">🎯</div>
          <div>No Object Selected</div>
          <div style="font-size: 11px; margin-top: 4px;">Click any shape in the Viewport or Outliner.</div>
        </div>
      `;
      return;
    }

    const radToDeg = (r: number) => ((r * 180) / Math.PI).toFixed(1);
    const isRoot = node.id === this.sceneStore.tree.root.id;

    // Modifiers state defaults
    const shellThick = num(node.modifiers?.shellThickness, 0.0);
    const twistVal = num(node.modifiers?.twistFactor ?? (node.modifiers as any)?.twist, 0.0);
    const bendVal = num(node.modifiers?.bendFactor, 0.0);
    const mirrorAxes = node.modifiers?.mirrorAxes ?? [
      node.modifiers?.mirrorAxis === 'x',
      node.modifiers?.mirrorAxis === 'y',
      node.modifiers?.mirrorAxis === 'z'
    ];
    const symX = mirrorAxes[0];
    const symY = mirrorAxes[1];
    const symZ = mirrorAxes[2];
    const radialVal = num(node.modifiers?.radialRepeat, 1);
    const linearCountVal = num(node.modifiers?.linearCount, 1);
    const linearSpacingVal = num(node.modifiers?.linearSpacing, 1.0);
    const roundRadius = num(node.modifiers?.roundRadius, 0.0);
    const metalnessVal = num(node.material.metalness, 0.0);
    const roughnessVal = num(node.material.roughness, 0.35);
    const blendRadiusVal = num(node.csg.blendRadius, 0);
    const colorVal = escapeHtml(node.material.color || '#e2e8f0');

    this.innerHTML = `
      <style>
        .inspector-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
          background: var(--bg-panel);
          color: var(--text-primary);
          font-size: 12px;
          user-select: none;
        }

        .prop-section {
          border-bottom: 1px solid var(--border-subtle);
          padding: 8px 10px;
        }

        .section-header {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .inspector-gizmo-pills {
          display: flex;
          gap: 2px;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          padding: 1px;
        }

        .insp-pill {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          border-radius: 3px;
          font-size: 10px;
          font-weight: 500;
          padding: 2px 6px;
          cursor: pointer;
          transition: all 120ms ease;
          line-height: 1.2;
        }

        .insp-pill:hover:not(.active) {
          color: var(--text-primary);
          background: var(--bg-panel-elevated);
        }

        .insp-pill.active {
          background: var(--accent-primary);
          color: #ffffff;
          font-weight: 600;
        }

        .field-row {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          gap: 6px;
        }

        .field-label {
          width: 78px;
          font-size: 11px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .vector-group {
          flex: 1;
          display: flex;
          gap: 4px;
        }

        .scrubber-box {
          flex: 1;
          display: flex;
          align-items: center;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 3px;
          overflow: hidden;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
        }

        .scrubber-tag {
          padding: 2px 4px;
          font-size: 10px;
          font-weight: 700;
          cursor: ew-resize;
        }
        .tag-x { color: #e74c3c; background: rgba(231, 76, 60, 0.15); }
        .tag-y { color: #2ecc71; background: rgba(46, 204, 113, 0.15); }
        .tag-z { color: #3498db; background: rgba(52, 152, 219, 0.15); }

        .scrubber-input {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 11px;
          padding: 3px 4px;
          outline: none;
          text-align: right;
        }

        .scrubber-input:focus {
          background: var(--bg-panel-elevated);
        }

        .select-field, .text-input {
          flex: 1;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          border-radius: 3px;
          padding: 3px 6px;
          font-size: 11px;
          outline: none;
        }

        .select-field:focus, .text-input:focus {
          border-color: var(--border-focus);
        }

        .color-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .color-picker {
          -webkit-appearance: none;
          border: 1px solid var(--border-subtle);
          width: 28px;
          height: 22px;
          border-radius: 3px;
          cursor: pointer;
          background: none;
          padding: 0;
        }
        .color-picker::-webkit-color-swatch-wrapper { padding: 0; }
        .color-picker::-webkit-color-swatch { border: none; border-radius: 2px; }

        .slider-row {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .range-slider {
          flex: 1;
          accent-color: var(--accent-primary);
          height: 4px;
          cursor: pointer;
        }

        .tabular-nums {
          font-variant-numeric: tabular-nums;
          font-family: 'JetBrains Mono', monospace;
        }
      </style>

      <div class="inspector-container">
        <!-- Node Identity -->
        <div class="prop-section">
          <div class="section-header">Node Identity</div>
          <div class="field-row">
            <span class="field-label">Name:</span>
            <input type="text" id="prop-name" class="text-input" value="${escapeHtml(node.name)}" />
          </div>
          <div class="field-row">
            <span class="field-label">Type:</span>
            <span style="font-weight: 600; color: var(--accent-primary); font-size: 11px;">
              ${node.kind === 'group' ? 'CSG GROUP' : escapeHtml(node.primitive?.type.toUpperCase() ?? 'PRIMITIVE')}
            </span>
          </div>
          ${node.kind === 'group' ? `
          <div class="field-row">
            <span class="field-label">Children:</span>
            <span style="font-weight: 500; font-size: 11px; color: var(--text-secondary);">${node.children.length} node(s)</span>
          </div>
          ` : ''}
        </div>

        <!-- Transform -->
        <div class="prop-section">
          <div class="section-header">
            <span>Transform</span>
            <div class="inspector-gizmo-pills" role="radiogroup" aria-label="Gizmo Mode">
              <button type="button" class="insp-pill ${this.activeGizmoMode === 'translate' ? 'active' : ''}" data-mode="translate" title="Translate / Move (G or W)">Move</button>
              <button type="button" class="insp-pill ${this.activeGizmoMode === 'rotate' ? 'active' : ''}" data-mode="rotate" title="Rotate (R or E)">Rotate</button>
              <button type="button" class="insp-pill ${this.activeGizmoMode === 'scale' ? 'active' : ''}" data-mode="scale" title="Scale (S)">Scale</button>
            </div>
          </div>
          
          <!-- Position -->
          <div class="field-row">
            <span class="field-label">Position:</span>
            <div class="vector-group">
              <div class="scrubber-box">
                <span class="scrubber-tag tag-x">X</span>
                <input class="scrubber-input" id="pos-x" value="${node.transform.position[0].toFixed(2)}" />
              </div>
              <div class="scrubber-box">
                <span class="scrubber-tag tag-y">Y</span>
                <input class="scrubber-input" id="pos-y" value="${node.transform.position[1].toFixed(2)}" />
              </div>
              <div class="scrubber-box">
                <span class="scrubber-tag tag-z">Z</span>
                <input class="scrubber-input" id="pos-z" value="${node.transform.position[2].toFixed(2)}" />
              </div>
            </div>
          </div>

          <!-- Rotation (Deg) -->
          <div class="field-row">
            <span class="field-label">Rotation:</span>
            <div class="vector-group">
              <div class="scrubber-box">
                <span class="scrubber-tag tag-x">X°</span>
                <input class="scrubber-input" id="rot-x" value="${radToDeg(node.transform.rotation[0])}" />
              </div>
              <div class="scrubber-box">
                <span class="scrubber-tag tag-y">Y°</span>
                <input class="scrubber-input" id="rot-y" value="${radToDeg(node.transform.rotation[1])}" />
              </div>
              <div class="scrubber-box">
                <span class="scrubber-tag tag-z">Z°</span>
                <input class="scrubber-input" id="rot-z" value="${radToDeg(node.transform.rotation[2])}" />
              </div>
            </div>
          </div>

          <!-- Scale -->
          <div class="field-row">
            <span class="field-label">Scale:</span>
            <div class="vector-group">
              <div class="scrubber-box">
                <span class="scrubber-tag tag-x">X</span>
                <input class="scrubber-input" id="scale-x" value="${node.transform.scale[0].toFixed(2)}" />
              </div>
              <div class="scrubber-box">
                <span class="scrubber-tag tag-y">Y</span>
                <input class="scrubber-input" id="scale-y" value="${node.transform.scale[1].toFixed(2)}" />
              </div>
              <div class="scrubber-box">
                <span class="scrubber-tag tag-z">Z</span>
                <input class="scrubber-input" id="scale-z" value="${node.transform.scale[2].toFixed(2)}" />
              </div>
            </div>
          </div>
        </div>

        <!-- Primitive Dimensions -->
        ${node.kind === 'primitive' && node.primitive ? `
        <div class="prop-section">
          <div class="section-header">Primitive Parameters</div>
          ${this.renderDimensionFields(node)}
        </div>
        ` : ''}

        <!-- CSG & Blending (Hidden for Root) -->
        ${!isRoot ? `
        <div class="prop-section">
          <div class="section-header">CSG Boolean & Blend</div>
          <div class="field-row">
            <span class="field-label">Operation:</span>
            <select id="prop-csg-op" class="select-field">
              <option value="union" ${node.csg.operation === 'union' ? 'selected' : ''}>Union (∪)</option>
              <option value="difference" ${node.csg.operation === 'difference' ? 'selected' : ''}>Difference (∖)</option>
              <option value="intersection" ${node.csg.operation === 'intersection' ? 'selected' : ''}>Intersection (∩)</option>
            </select>
          </div>
          <div class="field-row">
            <span class="field-label">Blend Mode:</span>
            <select id="prop-csg-mode" class="select-field">
              <option value="hard" ${node.csg.blendMode === 'hard' ? 'selected' : ''}>Hard Boolean</option>
              <option value="smooth_polynomial" ${node.csg.blendMode === 'smooth_polynomial' ? 'selected' : ''}>Smooth Fillet (smin)</option>
            </select>
          </div>
          <div class="field-row">
            <span class="field-label">Smooth (k):</span>
            <div class="slider-row">
              <input type="range" id="prop-csg-k" class="range-slider" min="0" max="0.5" step="0.01" value="${blendRadiusVal}" />
              <span id="label-csg-k" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${blendRadiusVal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Modifiers Section (SDF Deformations & Arrays) -->
        <div class="prop-section">
          <div class="section-header">
            <span>Modifiers</span>
            <span style="font-size: 10px; color: var(--accent-primary); font-weight: 500;">Deform & Array</span>
          </div>

          <!-- Shell / Onion Thickness -->
          <div class="field-row">
            <span class="field-label" title="Hollow onion skin thickness">Shell Thick:</span>
            <div class="slider-row">
              <input type="range" id="mod-shell" class="range-slider" min="0" max="0.3" step="0.005" value="${shellThick}" />
              <span id="label-mod-shell" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${shellThick.toFixed(3)}</span>
            </div>
          </div>

          <!-- Twist Factor -->
          <div class="field-row">
            <span class="field-label" title="Rotational twist factor along Y-axis">Twist:</span>
            <div class="slider-row">
              <input type="range" id="mod-twist" class="range-slider" min="-2.0" max="2.0" step="0.05" value="${twistVal}" />
              <span id="label-mod-twist" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${twistVal.toFixed(2)}</span>
            </div>
          </div>

          <!-- Bend Factor -->
          <div class="field-row">
            <span class="field-label" title="Curvature bend factor in XY-plane">Bend:</span>
            <div class="slider-row">
              <input type="range" id="mod-bend" class="range-slider" min="-2.0" max="2.0" step="0.05" value="${bendVal}" />
              <span id="label-mod-bend" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${bendVal.toFixed(2)}</span>
            </div>
          </div>

          <!-- Symmetry Mirror (Multi-axis X, Y, Z pills) -->
          <div class="field-row">
            <span class="field-label" title="Mirror shape across coordinate planes">Symmetry:</span>
            <div class="symmetry-pills" style="display: flex; gap: 4px;">
              <button type="button" class="insp-pill mod-sym-pill ${symX ? 'active' : ''}" data-axis="x">X</button>
              <button type="button" class="insp-pill mod-sym-pill ${symY ? 'active' : ''}" data-axis="y">Y</button>
              <button type="button" class="insp-pill mod-sym-pill ${symZ ? 'active' : ''}" data-axis="z">Z</button>
            </div>
          </div>

          <!-- Radial Array (Polar Repetition) -->
          <div class="field-row">
            <span class="field-label" title="Circular polar repetition count around Y-axis">Radial Array:</span>
            <div class="slider-row">
              <input type="range" id="mod-radial" class="range-slider" min="1" max="24" step="1" value="${radialVal}" />
              <span id="label-mod-radial" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${radialVal}×</span>
            </div>
          </div>

          <!-- Linear Array Count & Spacing -->
          <div class="field-row">
            <span class="field-label" title="Bounded linear repetition count along X-axis">Linear Count:</span>
            <div class="slider-row">
              <input type="range" id="mod-linear-count" class="range-slider" min="1" max="16" step="1" value="${linearCountVal}" />
              <span id="label-mod-linear-count" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${linearCountVal}×</span>
            </div>
          </div>
          <div class="field-row">
            <span class="field-label" title="Spacing between linear array instances">Linear Spacing:</span>
            <div class="slider-row">
              <input type="range" id="mod-linear-spacing" class="range-slider" min="0.2" max="4.0" step="0.05" value="${linearSpacingVal}" />
              <span id="label-mod-linear-spacing" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${linearSpacingVal.toFixed(2)}</span>
            </div>
          </div>

          <!-- Round Edge -->
          <div class="field-row">
            <span class="field-label" title="Round edge radius">Round Edge:</span>
            <div class="slider-row">
              <input type="range" id="prop-round" class="range-slider" min="0" max="0.2" step="0.005" value="${roundRadius}" />
              <span id="label-round" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${roundRadius.toFixed(3)}</span>
            </div>
          </div>
        </div>

        <!-- Material Properties -->
        <div class="prop-section">
          <div class="section-header">Material</div>
          <div class="field-row">
            <span class="field-label">Color:</span>
            <div class="color-row">
              <input type="color" id="prop-color" class="color-picker" value="${colorVal}" />
              <span class="tabular-nums font-mono" style="font-size: 11px;">${colorVal}</span>
            </div>
          </div>
          <div class="field-row">
            <span class="field-label">Roughness:</span>
            <div class="slider-row">
              <input type="range" id="prop-roughness" class="range-slider" min="0" max="1" step="0.02" value="${roughnessVal}" />
              <span id="label-roughness" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${roughnessVal.toFixed(2)}</span>
            </div>
          </div>
          <div class="field-row">
            <span class="field-label">Metalness:</span>
            <div class="slider-row">
              <input type="range" id="prop-metalness" class="range-slider" min="0" max="1" step="0.02" value="${metalnessVal}" />
              <span id="label-metalness" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${metalnessVal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupListeners(node);
  }

  private renderDimensionFields(node: any): string {
    if (!node.primitive) return '';
    // Keep only finite numbers / numeric arrays so missing or malformed values fall back to defaults
    const dims: Record<string, any> = {};
    for (const [key, value] of Object.entries(node.primitive.dimensions || {})) {
      if (typeof value === 'number' ? Number.isFinite(value) : Array.isArray(value) && value.every((v) => Number.isFinite(v))) {
        dims[key] = value;
      }
    }
    const type = node.primitive.type;

    if (type === 'sphere') {
      return `
        <div class="field-row">
          <span class="field-label">Radius:</span>
          <div class="slider-row">
            <input type="range" id="dim-radius" class="range-slider" min="0.1" max="3" step="0.05" value="${dims.radius ?? 0.8}" />
            <span class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.radius ?? 0.8).toFixed(2)}</span>
          </div>
        </div>
      `;
    } else if (type === 'box') {
      const s = dims.size ?? [0.7, 0.7, 0.7];
      return `
        <div class="field-row">
          <span class="field-label">Size (X/Y/Z):</span>
          <div class="vector-group">
            <div class="scrubber-box"><input class="scrubber-input" id="dim-box-x" value="${s[0].toFixed(2)}" /></div>
            <div class="scrubber-box"><input class="scrubber-input" id="dim-box-y" value="${s[1].toFixed(2)}" /></div>
            <div class="scrubber-box"><input class="scrubber-input" id="dim-box-z" value="${s[2].toFixed(2)}" /></div>
          </div>
        </div>
      `;
    } else if (type === 'cylinder' || type === 'capsule') {
      return `
        <div class="field-row">
          <span class="field-label">Radius:</span>
          <div class="slider-row">
            <input type="range" id="dim-radius" class="range-slider" min="0.1" max="2" step="0.05" value="${dims.radius ?? 0.5}" />
            <span class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.radius ?? 0.5).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Height:</span>
          <div class="slider-row">
            <input type="range" id="dim-height" class="range-slider" min="0.1" max="3" step="0.05" value="${dims.height ?? 0.8}" />
            <span class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.height ?? 0.8).toFixed(2)}</span>
          </div>
        </div>
      `;
    } else if (type === 'torus') {
      return `
        <div class="field-row">
          <span class="field-label">Major Radius:</span>
          <input type="range" id="dim-torus-R" class="range-slider" min="0.2" max="2" step="0.05" value="${dims.radiusMajor ?? 0.7}" />
        </div>
        <div class="field-row">
          <span class="field-label">Minor Radius:</span>
          <input type="range" id="dim-torus-r" class="range-slider" min="0.05" max="0.8" step="0.02" value="${dims.radiusMinor ?? 0.25}" />
        </div>
      `;
    } else if (type === 'ellipsoid' || type === 'superellipsoid') {
      const r = dims.radii ?? (dims.size as [number, number, number]) ?? [0.8, 0.6, 0.5];
      return `
        <div class="field-row">
          <span class="field-label">Radii (X/Y/Z):</span>
          <div class="vector-group">
            <div class="scrubber-box"><input class="scrubber-input" id="dim-radii-x" value="${r[0].toFixed(2)}" /></div>
            <div class="scrubber-box"><input class="scrubber-input" id="dim-radii-y" value="${r[1].toFixed(2)}" /></div>
            <div class="scrubber-box"><input class="scrubber-input" id="dim-radii-z" value="${r[2].toFixed(2)}" /></div>
          </div>
        </div>
      `;
    } else if (type === 'cone') {
      return `
        <div class="field-row">
          <span class="field-label">Base Radius:</span>
          <div class="slider-row">
            <input type="range" id="dim-base-radius" class="range-slider" min="0.1" max="2" step="0.05" value="${dims.baseRadius ?? dims.radius ?? 0.6}" />
            <span class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.baseRadius ?? dims.radius ?? 0.6).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Height:</span>
          <div class="slider-row">
            <input type="range" id="dim-height" class="range-slider" min="0.1" max="3" step="0.05" value="${dims.height ?? 0.8}" />
            <span class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.height ?? 0.8).toFixed(2)}</span>
          </div>
        </div>
      `;
    } else if (type === 'pipe') {
      return `
        <div class="field-row">
          <span class="field-label">Radius:</span>
          <input type="range" id="dim-radius" class="range-slider" min="0.2" max="2" step="0.05" value="${dims.radius ?? 0.5}" />
        </div>
        <div class="field-row">
          <span class="field-label">Height:</span>
          <input type="range" id="dim-height" class="range-slider" min="0.2" max="3" step="0.05" value="${dims.height ?? 0.8}" />
        </div>
        <div class="field-row">
          <span class="field-label">Wall Thick:</span>
          <input type="range" id="dim-thick" class="range-slider" min="0.01" max="0.3" step="0.01" value="${dims.thickness ?? 0.08}" />
        </div>
      `;
    } else if (type === 'capped_torus') {
      const deg = Math.round(((dims.arcAngle ?? (Math.PI / 2)) * 180) / Math.PI);
      return `
        <div class="field-row">
          <span class="field-label">Major Radius:</span>
          <div class="slider-row">
            <input type="range" id="dim-capped-R" class="range-slider" min="0.2" max="2.5" step="0.05" value="${dims.radiusMajor ?? 0.7}" />
            <span id="label-capped-R" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.radiusMajor ?? 0.7).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Tube Radius:</span>
          <div class="slider-row">
            <input type="range" id="dim-capped-r" class="range-slider" min="0.05" max="0.8" step="0.02" value="${dims.radiusMinor ?? 0.25}" />
            <span id="label-capped-r" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.radiusMinor ?? 0.25).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Arc Sweep:</span>
          <div class="slider-row">
            <input type="range" id="dim-capped-arc" class="range-slider" min="30" max="360" step="5" value="${deg}" />
            <span id="label-capped-arc" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${deg}°</span>
          </div>
        </div>
      `;
    } else if (type === 'chain_link') {
      return `
        <div class="field-row">
          <span class="field-label">Link Length:</span>
          <div class="slider-row">
            <input type="range" id="dim-link-len" class="range-slider" min="0.1" max="2.5" step="0.05" value="${dims.linkLength ?? 0.6}" />
            <span id="label-link-len" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.linkLength ?? 0.6).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Ring Radius:</span>
          <div class="slider-row">
            <input type="range" id="dim-link-R" class="range-slider" min="0.2" max="2.0" step="0.05" value="${dims.radiusMajor ?? 0.5}" />
            <span id="label-link-R" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.radiusMajor ?? 0.5).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Thickness:</span>
          <div class="slider-row">
            <input type="range" id="dim-link-thick" class="range-slider" min="0.02" max="0.5" step="0.02" value="${dims.thickness ?? 0.15}" />
            <span id="label-link-thick" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.thickness ?? 0.15).toFixed(2)}</span>
          </div>
        </div>
      `;
    } else if (type === 'chamfer_cylinder') {
      return `
        <div class="field-row">
          <span class="field-label">Height:</span>
          <div class="slider-row">
            <input type="range" id="dim-chamfer-h" class="range-slider" min="0.2" max="3.0" step="0.05" value="${dims.height ?? 0.8}" />
            <span id="label-chamfer-h" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.height ?? 0.8).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Radius:</span>
          <div class="slider-row">
            <input type="range" id="dim-chamfer-r" class="range-slider" min="0.1" max="2.0" step="0.05" value="${dims.radius ?? 0.5}" />
            <span id="label-chamfer-r" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.radius ?? 0.5).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Chamfer:</span>
          <div class="slider-row">
            <input type="range" id="dim-chamfer-c" class="range-slider" min="0.01" max="0.3" step="0.01" value="${dims.chamfer ?? 0.08}" />
            <span id="label-chamfer-c" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.chamfer ?? 0.08).toFixed(2)}</span>
          </div>
        </div>
      `;
    } else if (type === 'egg') {
      return `
        <div class="field-row">
          <span class="field-label">Height:</span>
          <div class="slider-row">
            <input type="range" id="dim-egg-h" class="range-slider" min="0.3" max="3.0" step="0.05" value="${dims.height ?? 1.2}" />
            <span id="label-egg-h" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.height ?? 1.2).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Base Radius:</span>
          <div class="slider-row">
            <input type="range" id="dim-egg-base" class="range-slider" min="0.2" max="2.0" step="0.05" value="${dims.baseRadius ?? 0.5}" />
            <span id="label-egg-base" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.baseRadius ?? 0.5).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Tip Radius:</span>
          <div class="slider-row">
            <input type="range" id="dim-egg-tip" class="range-slider" min="0.05" max="1.5" step="0.05" value="${dims.tipRadius ?? 0.25}" />
            <span id="label-egg-tip" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.tipRadius ?? 0.25).toFixed(2)}</span>
          </div>
        </div>
      `;
    } else if (type === 'heart') {
      return `
        <div class="field-row">
          <span class="field-label">Scale/Size:</span>
          <div class="slider-row">
            <input type="range" id="dim-heart-s" class="range-slider" min="0.2" max="3.0" step="0.05" value="${dims.radius ?? 0.8}" />
            <span id="label-heart-s" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.radius ?? 0.8).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Thickness:</span>
          <div class="slider-row">
            <input type="range" id="dim-heart-th" class="range-slider" min="0.05" max="1.5" step="0.02" value="${dims.height ?? 0.3}" />
            <span id="label-heart-th" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.height ?? 0.3).toFixed(2)}</span>
          </div>
        </div>
      `;
    } else if (type === 'star_prism') {
      return `
        <div class="field-row">
          <span class="field-label">Outer Radius:</span>
          <div class="slider-row">
            <input type="range" id="dim-star-outer" class="range-slider" min="0.2" max="3.0" step="0.05" value="${dims.outerRadius ?? 0.75}" />
            <span id="label-star-outer" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.outerRadius ?? 0.75).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Inner Radius:</span>
          <div class="slider-row">
            <input type="range" id="dim-star-inner" class="range-slider" min="0.1" max="2.0" step="0.05" value="${dims.innerRadius ?? 0.35}" />
            <span id="label-star-inner" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.innerRadius ?? 0.35).toFixed(2)}</span>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">Height:</span>
          <div class="slider-row">
            <input type="range" id="dim-star-h" class="range-slider" min="0.1" max="3.0" step="0.05" value="${dims.height ?? 0.4}" />
            <span id="label-star-h" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(dims.height ?? 0.4).toFixed(2)}</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="field-row">
          <span class="field-label">Height/Size:</span>
          <input type="range" id="dim-generic" class="range-slider" min="0.2" max="2.5" step="0.05" value="${dims.height || dims.radius || 1.0}" />
        </div>
      `;
    }
  }

  private setupListeners(node: any) {
    // Inspector Gizmo Mode Pills
    const inspPills = this.querySelectorAll('.insp-pill');
    inspPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const mode = (pill as HTMLElement).dataset.mode as 'translate' | 'rotate' | 'scale';
        if (mode) {
          this.activeGizmoMode = mode;
          inspPills.forEach((p) => p.classList.toggle('active', (p as HTMLElement).dataset.mode === mode));
          window.dispatchEvent(new CustomEvent('set-gizmo-mode', { detail: { mode } }));
        }
      });
    });

    const nameInput = this.querySelector('#prop-name') as HTMLInputElement;
    nameInput?.addEventListener('change', () => {
      this.sceneStore.updateNode(node.id, { name: nameInput.value });
    });

    // Position inputs
    const posX = this.querySelector('#pos-x') as HTMLInputElement;
    const posY = this.querySelector('#pos-y') as HTMLInputElement;
    const posZ = this.querySelector('#pos-z') as HTMLInputElement;

    const updatePos = () => {
      const pos: [number, number, number] = [
        parseFloat(posX.value) || 0,
        parseFloat(posY.value) || 0,
        parseFloat(posZ.value) || 0
      ];
      this.sceneStore.updateNode(node.id, {
        transform: { ...node.transform, position: pos }
      });
    };
    [posX, posY, posZ].forEach((input) => input?.addEventListener('change', updatePos));

    // Rotation inputs
    const rotX = this.querySelector('#rot-x') as HTMLInputElement;
    const rotY = this.querySelector('#rot-y') as HTMLInputElement;
    const rotZ = this.querySelector('#rot-z') as HTMLInputElement;

    const updateRot = () => {
      const degToRad = (d: number) => (d * Math.PI) / 180;
      const rot: [number, number, number] = [
        degToRad(parseFloat(rotX.value) || 0),
        degToRad(parseFloat(rotY.value) || 0),
        degToRad(parseFloat(rotZ.value) || 0)
      ];
      this.sceneStore.updateNode(node.id, {
        transform: { ...node.transform, rotation: rot }
      });
    };
    [rotX, rotY, rotZ].forEach((input) => input?.addEventListener('change', updateRot));

    // Scale inputs
    const scaleX = this.querySelector('#scale-x') as HTMLInputElement;
    const scaleY = this.querySelector('#scale-y') as HTMLInputElement;
    const scaleZ = this.querySelector('#scale-z') as HTMLInputElement;

    const updateScale = () => {
      const sc: [number, number, number] = [
        parseFloat(scaleX.value) || 1,
        parseFloat(scaleY.value) || 1,
        parseFloat(scaleZ.value) || 1
      ];
      this.sceneStore.updateNode(node.id, {
        transform: { ...node.transform, scale: sc }
      });
    };
    [scaleX, scaleY, scaleZ].forEach((input) => input?.addEventListener('change', updateScale));

    // CSG Controls
    const csgOp = this.querySelector('#prop-csg-op') as HTMLSelectElement;
    csgOp?.addEventListener('change', () => {
      this.sceneStore.updateNode(node.id, {
        csg: { ...node.csg, operation: csgOp.value as CSGOpType }
      });
    });

    const csgMode = this.querySelector('#prop-csg-mode') as HTMLSelectElement;
    csgMode?.addEventListener('change', () => {
      this.sceneStore.updateNode(node.id, {
        csg: { ...node.csg, blendMode: csgMode.value as BlendMode }
      });
    });

    const csgK = this.querySelector('#prop-csg-k') as HTMLInputElement;
    const labelK = this.querySelector('#label-csg-k');
    csgK?.addEventListener('input', () => {
      const val = parseFloat(csgK.value);
      if (labelK) labelK.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        csg: { ...node.csg, blendRadius: val }
      });
    });

    // Modifiers Controls
    // 1. Shell / Onion Thickness
    const shellSlider = this.querySelector('#mod-shell') as HTMLInputElement;
    const labelShell = this.querySelector('#label-mod-shell');
    shellSlider?.addEventListener('input', () => {
      const val = parseFloat(shellSlider.value);
      if (labelShell) labelShell.textContent = val.toFixed(3);
      this.sceneStore.updateNode(node.id, {
        modifiers: { ...node.modifiers, shellThickness: val }
      });
    });

    // 2. Twist Factor
    const twistSlider = this.querySelector('#mod-twist') as HTMLInputElement;
    const labelTwist = this.querySelector('#label-mod-twist');
    twistSlider?.addEventListener('input', () => {
      const val = parseFloat(twistSlider.value);
      if (labelTwist) labelTwist.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        modifiers: { ...node.modifiers, twist: val, twistFactor: val }
      });
    });

    // 3. Bend Factor
    const bendSlider = this.querySelector('#mod-bend') as HTMLInputElement;
    const labelBend = this.querySelector('#label-mod-bend');
    bendSlider?.addEventListener('input', () => {
      const val = parseFloat(bendSlider.value);
      if (labelBend) labelBend.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        modifiers: { ...node.modifiers, bendFactor: val }
      });
    });

    // 4. Symmetry Mirror (Multi-axis pills)
    const symPills = this.querySelectorAll<HTMLButtonElement>('.mod-sym-pill');
    symPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const axis = pill.dataset.axis;
        const currentAxes: [boolean, boolean, boolean] = [
          node.modifiers?.mirrorAxes?.[0] ?? (node.modifiers?.mirrorAxis === 'x'),
          node.modifiers?.mirrorAxes?.[1] ?? (node.modifiers?.mirrorAxis === 'y'),
          node.modifiers?.mirrorAxes?.[2] ?? (node.modifiers?.mirrorAxis === 'z')
        ];
        if (axis === 'x') currentAxes[0] = !currentAxes[0];
        if (axis === 'y') currentAxes[1] = !currentAxes[1];
        if (axis === 'z') currentAxes[2] = !currentAxes[2];

        pill.classList.toggle('active', axis === 'x' ? currentAxes[0] : (axis === 'y' ? currentAxes[1] : currentAxes[2]));
        this.sceneStore.updateNode(node.id, {
          modifiers: {
            ...node.modifiers,
            mirrorAxes: currentAxes,
            mirrorAxis: 'none'
          }
        });
      });
    });

    // 5. Radial Array
    const radialSlider = this.querySelector('#mod-radial') as HTMLInputElement;
    const labelRadial = this.querySelector('#label-mod-radial');
    radialSlider?.addEventListener('input', () => {
      const val = parseInt(radialSlider.value, 10);
      if (labelRadial) labelRadial.textContent = `${val}×`;
      this.sceneStore.updateNode(node.id, {
        modifiers: { ...node.modifiers, radialRepeat: val }
      });
    });

    // 6. Linear Array Count & Spacing
    const linearCountSlider = this.querySelector('#mod-linear-count') as HTMLInputElement;
    const labelLinearCount = this.querySelector('#label-mod-linear-count');
    linearCountSlider?.addEventListener('input', () => {
      const val = parseInt(linearCountSlider.value, 10);
      if (labelLinearCount) labelLinearCount.textContent = `${val}×`;
      this.sceneStore.updateNode(node.id, {
        modifiers: { ...node.modifiers, linearCount: val }
      });
    });

    const linearSpacingSlider = this.querySelector('#mod-linear-spacing') as HTMLInputElement;
    const labelLinearSpacing = this.querySelector('#label-mod-linear-spacing');
    linearSpacingSlider?.addEventListener('input', () => {
      const val = parseFloat(linearSpacingSlider.value);
      if (labelLinearSpacing) labelLinearSpacing.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        modifiers: { ...node.modifiers, linearSpacing: val }
      });
    });

    // 7. Round Edge
    const roundSlider = this.querySelector('#prop-round') as HTMLInputElement;
    const labelRound = this.querySelector('#label-round');
    roundSlider?.addEventListener('input', () => {
      const val = parseFloat(roundSlider.value);
      if (labelRound) labelRound.textContent = val.toFixed(3);
      this.sceneStore.updateNode(node.id, {
        modifiers: { ...node.modifiers, roundRadius: val }
      });
    });

    // Material controls
    const colorPicker = this.querySelector('#prop-color') as HTMLInputElement;
    colorPicker?.addEventListener('input', () => {
      this.sceneStore.updateNode(node.id, {
        material: { ...node.material, color: colorPicker.value }
      });
    });

    const roughnessSlider = this.querySelector('#prop-roughness') as HTMLInputElement;
    const labelRough = this.querySelector('#label-roughness');
    roughnessSlider?.addEventListener('input', () => {
      const val = parseFloat(roughnessSlider.value);
      if (labelRough) labelRough.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        material: { ...node.material, roughness: val }
      });
    });

    const metalnessSlider = this.querySelector('#prop-metalness') as HTMLInputElement;
    const labelMetalness = this.querySelector('#label-metalness');
    metalnessSlider?.addEventListener('input', () => {
      const val = parseFloat(metalnessSlider.value);
      if (labelMetalness) labelMetalness.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        material: { ...node.material, metalness: val }
      });
    });

    // Dynamic dimension listeners
    const dimRadius = this.querySelector('#dim-radius') as HTMLInputElement;
    dimRadius?.addEventListener('input', () => {
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, radius: parseFloat(dimRadius.value) }
        }
      });
    });

    const dimHeight = this.querySelector('#dim-height') as HTMLInputElement;
    dimHeight?.addEventListener('input', () => {
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, height: parseFloat(dimHeight.value) }
        }
      });
    });

    const dimThick = this.querySelector('#dim-thick') as HTMLInputElement;
    dimThick?.addEventListener('input', () => {
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, thickness: parseFloat(dimThick.value) }
        }
      });
    });

    // Radii (X/Y/Z) for Ellipsoid / Superellipsoid
    const radiiX = this.querySelector('#dim-radii-x') as HTMLInputElement;
    const radiiY = this.querySelector('#dim-radii-y') as HTMLInputElement;
    const radiiZ = this.querySelector('#dim-radii-z') as HTMLInputElement;
    if (radiiX && radiiY && radiiZ) {
      const updateRadii = () => {
        const rx = Math.max(0.01, parseFloat(radiiX.value) || 0.8);
        const ry = Math.max(0.01, parseFloat(radiiY.value) || 0.6);
        const rz = Math.max(0.01, parseFloat(radiiZ.value) || 0.5);
        this.sceneStore.updateNode(node.id, {
          primitive: {
            ...node.primitive,
            dimensions: { ...node.primitive.dimensions, radii: [rx, ry, rz] }
          }
        });
      };
      [radiiX, radiiY, radiiZ].forEach((input) => input.addEventListener('change', updateRadii));
    }

    // Box Size (X/Y/Z)
    const boxX = this.querySelector('#dim-box-x') as HTMLInputElement;
    const boxY = this.querySelector('#dim-box-y') as HTMLInputElement;
    const boxZ = this.querySelector('#dim-box-z') as HTMLInputElement;
    if (boxX && boxY && boxZ) {
      const updateBoxSize = () => {
        const sx = Math.max(0.01, parseFloat(boxX.value) || 0.7);
        const sy = Math.max(0.01, parseFloat(boxY.value) || 0.7);
        const sz = Math.max(0.01, parseFloat(boxZ.value) || 0.7);
        this.sceneStore.updateNode(node.id, {
          primitive: {
            ...node.primitive,
            dimensions: { ...node.primitive.dimensions, size: [sx, sy, sz] }
          }
        });
      };
      [boxX, boxY, boxZ].forEach((input) => input.addEventListener('change', updateBoxSize));
    }

    // Torus Major / Minor Radii
    const torusR = this.querySelector('#dim-torus-R') as HTMLInputElement;
    torusR?.addEventListener('input', () => {
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, radiusMajor: parseFloat(torusR.value) }
        }
      });
    });

    const torusr = this.querySelector('#dim-torus-r') as HTMLInputElement;
    torusr?.addEventListener('input', () => {
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, radiusMinor: parseFloat(torusr.value) }
        }
      });
    });

    // Cone Base Radius
    const dimBaseRadius = this.querySelector('#dim-base-radius') as HTMLInputElement;
    dimBaseRadius?.addEventListener('input', () => {
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, baseRadius: parseFloat(dimBaseRadius.value) }
        }
      });
    });

    // Generic Height / Radius slider
    const dimGeneric = this.querySelector('#dim-generic') as HTMLInputElement;
    dimGeneric?.addEventListener('input', () => {
      const val = parseFloat(dimGeneric.value);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, height: val, radius: val }
        }
      });
    });

    // Capped Torus Listeners
    const cappedR = this.querySelector('#dim-capped-R') as HTMLInputElement;
    const labelCappedR = this.querySelector('#label-capped-R');
    cappedR?.addEventListener('input', () => {
      const val = parseFloat(cappedR.value);
      if (labelCappedR) labelCappedR.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, radiusMajor: val }
        }
      });
    });

    const cappedr = this.querySelector('#dim-capped-r') as HTMLInputElement;
    const labelCappedr = this.querySelector('#label-capped-r');
    cappedr?.addEventListener('input', () => {
      const val = parseFloat(cappedr.value);
      if (labelCappedr) labelCappedr.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, radiusMinor: val }
        }
      });
    });

    const cappedArc = this.querySelector('#dim-capped-arc') as HTMLInputElement;
    const labelCappedArc = this.querySelector('#label-capped-arc');
    cappedArc?.addEventListener('input', () => {
      const deg = parseFloat(cappedArc.value);
      if (labelCappedArc) labelCappedArc.textContent = `${deg}°`;
      const rad = (deg * Math.PI) / 180;
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, arcAngle: rad }
        }
      });
    });

    // Chain Link Listeners
    const linkLen = this.querySelector('#dim-link-len') as HTMLInputElement;
    const labelLinkLen = this.querySelector('#label-link-len');
    linkLen?.addEventListener('input', () => {
      const val = parseFloat(linkLen.value);
      if (labelLinkLen) labelLinkLen.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, linkLength: val }
        }
      });
    });

    const linkR = this.querySelector('#dim-link-R') as HTMLInputElement;
    const labelLinkR = this.querySelector('#label-link-R');
    linkR?.addEventListener('input', () => {
      const val = parseFloat(linkR.value);
      if (labelLinkR) labelLinkR.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, radiusMajor: val }
        }
      });
    });

    const linkThick = this.querySelector('#dim-link-thick') as HTMLInputElement;
    const labelLinkThick = this.querySelector('#label-link-thick');
    linkThick?.addEventListener('input', () => {
      const val = parseFloat(linkThick.value);
      if (labelLinkThick) labelLinkThick.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, thickness: val }
        }
      });
    });

    // Chamfer Cylinder Listeners
    const chamferH = this.querySelector('#dim-chamfer-h') as HTMLInputElement;
    const labelChamferH = this.querySelector('#label-chamfer-h');
    chamferH?.addEventListener('input', () => {
      const val = parseFloat(chamferH.value);
      if (labelChamferH) labelChamferH.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, height: val }
        }
      });
    });

    const chamferR = this.querySelector('#dim-chamfer-r') as HTMLInputElement;
    const labelChamferR = this.querySelector('#label-chamfer-r');
    chamferR?.addEventListener('input', () => {
      const val = parseFloat(chamferR.value);
      if (labelChamferR) labelChamferR.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, radius: val }
        }
      });
    });

    const chamferC = this.querySelector('#dim-chamfer-c') as HTMLInputElement;
    const labelChamferC = this.querySelector('#label-chamfer-c');
    chamferC?.addEventListener('input', () => {
      const val = parseFloat(chamferC.value);
      if (labelChamferC) labelChamferC.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, chamfer: val }
        }
      });
    });

    // Egg Listeners
    const eggH = this.querySelector('#dim-egg-h') as HTMLInputElement;
    const labelEggH = this.querySelector('#label-egg-h');
    eggH?.addEventListener('input', () => {
      const val = parseFloat(eggH.value);
      if (labelEggH) labelEggH.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, height: val }
        }
      });
    });

    const eggBase = this.querySelector('#dim-egg-base') as HTMLInputElement;
    const labelEggBase = this.querySelector('#label-egg-base');
    eggBase?.addEventListener('input', () => {
      const val = parseFloat(eggBase.value);
      if (labelEggBase) labelEggBase.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, baseRadius: val }
        }
      });
    });

    const eggTip = this.querySelector('#dim-egg-tip') as HTMLInputElement;
    const labelEggTip = this.querySelector('#label-egg-tip');
    eggTip?.addEventListener('input', () => {
      const val = parseFloat(eggTip.value);
      if (labelEggTip) labelEggTip.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, tipRadius: val }
        }
      });
    });

    // Heart Listeners
    const heartS = this.querySelector('#dim-heart-s') as HTMLInputElement;
    const labelHeartS = this.querySelector('#label-heart-s');
    heartS?.addEventListener('input', () => {
      const val = parseFloat(heartS.value);
      if (labelHeartS) labelHeartS.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, radius: val }
        }
      });
    });

    const heartTh = this.querySelector('#dim-heart-th') as HTMLInputElement;
    const labelHeartTh = this.querySelector('#label-heart-th');
    heartTh?.addEventListener('input', () => {
      const val = parseFloat(heartTh.value);
      if (labelHeartTh) labelHeartTh.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, height: val, thickness: val }
        }
      });
    });

    // Star Prism Listeners
    const starOuter = this.querySelector('#dim-star-outer') as HTMLInputElement;
    const labelStarOuter = this.querySelector('#label-star-outer');
    starOuter?.addEventListener('input', () => {
      const val = parseFloat(starOuter.value);
      if (labelStarOuter) labelStarOuter.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, outerRadius: val }
        }
      });
    });

    const starInner = this.querySelector('#dim-star-inner') as HTMLInputElement;
    const labelStarInner = this.querySelector('#label-star-inner');
    starInner?.addEventListener('input', () => {
      const val = parseFloat(starInner.value);
      if (labelStarInner) labelStarInner.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, innerRadius: val }
        }
      });
    });

    const starH = this.querySelector('#dim-star-h') as HTMLInputElement;
    const labelStarH = this.querySelector('#label-star-h');
    starH?.addEventListener('input', () => {
      const val = parseFloat(starH.value);
      if (labelStarH) labelStarH.textContent = val.toFixed(2);
      this.sceneStore.updateNode(node.id, {
        primitive: {
          ...node.primitive,
          dimensions: { ...node.primitive.dimensions, height: val }
        }
      });
    });
  }

  private syncValues() {
    const node = this.sceneStore.getSelectedNode();
    if (!node) return;

    // Position
    const posX = this.querySelector('#pos-x') as HTMLInputElement;
    const posY = this.querySelector('#pos-y') as HTMLInputElement;
    const posZ = this.querySelector('#pos-z') as HTMLInputElement;
    if (
      posX &&
      posY &&
      posZ &&
      document.activeElement !== posX &&
      document.activeElement !== posY &&
      document.activeElement !== posZ
    ) {
      posX.value = node.transform.position[0].toFixed(2);
      posY.value = node.transform.position[1].toFixed(2);
      posZ.value = node.transform.position[2].toFixed(2);
    }

    // Modifiers Sync
    const shellSlider = this.querySelector('#mod-shell') as HTMLInputElement;
    const labelShell = this.querySelector('#label-mod-shell');
    if (shellSlider && document.activeElement !== shellSlider) {
      const val = node.modifiers?.shellThickness ?? 0.0;
      shellSlider.value = val.toString();
      if (labelShell) labelShell.textContent = val.toFixed(3);
    }

    const twistSlider = this.querySelector('#mod-twist') as HTMLInputElement;
    const labelTwist = this.querySelector('#label-mod-twist');
    if (twistSlider && document.activeElement !== twistSlider) {
      const val = node.modifiers?.twistFactor ?? node.modifiers?.twist ?? 0.0;
      twistSlider.value = val.toString();
      if (labelTwist) labelTwist.textContent = val.toFixed(2);
    }

    const mirrorSelect = this.querySelector('#mod-mirror') as HTMLSelectElement;
    if (mirrorSelect && document.activeElement !== mirrorSelect) {
      mirrorSelect.value = node.modifiers?.mirrorAxis ?? 'none';
    }

    const roundSlider = this.querySelector('#prop-round') as HTMLInputElement;
    const labelRound = this.querySelector('#label-round');
    if (roundSlider && document.activeElement !== roundSlider) {
      const val = node.modifiers?.roundRadius ?? 0.0;
      roundSlider.value = val.toString();
      if (labelRound) labelRound.textContent = val.toFixed(3);
    }
  }
}

customElements.define('sdf-inspector', SdfInspector);
