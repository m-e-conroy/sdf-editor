// ========================================================================
// SDF Studio 3D - Property Inspector Element with Live Scrubbers & Modifiers
// ========================================================================

import { SceneStore } from '../store/SceneStore';
import { CSGOpType, BlendMode } from '../tree/types';

export class SdfInspector extends HTMLElement {
  private sceneStore = SceneStore.getInstance();
  private onSelectionChangedBound: () => void = () => {};
  private onSceneChangedBound: () => void = () => {};
  private onGizmoModeChangedBound: (e: Event) => void = () => {};
  private activeGizmoMode: 'translate' | 'rotate' | 'scale' = 'translate';

  connectedCallback() {
    this.render();

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
    const shellThick = node.modifiers?.shellThickness ?? 0.0;
    const twistVal = node.modifiers?.twistFactor ?? node.modifiers?.twist ?? 0.0;
    const mirrorAxis = node.modifiers?.mirrorAxis ?? 'none';
    const roundRadius = node.modifiers?.roundRadius ?? 0.0;

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
            <input type="text" id="prop-name" class="text-input" value="${node.name}" />
          </div>
          <div class="field-row">
            <span class="field-label">Shape Type:</span>
            <span style="font-weight: 600; color: var(--accent-primary); font-size: 11px;">${node.primitive.type.toUpperCase()}</span>
          </div>
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
        <div class="prop-section">
          <div class="section-header">Primitive Parameters</div>
          ${this.renderDimensionFields(node)}
        </div>

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
              <input type="range" id="prop-csg-k" class="range-slider" min="0" max="0.5" step="0.01" value="${node.csg.blendRadius || 0}" />
              <span id="label-csg-k" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(node.csg.blendRadius || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Modifiers Section (SDF Deformations) -->
        <div class="prop-section">
          <div class="section-header">
            <span>Modifiers</span>
            <span style="font-size: 10px; color: var(--accent-primary); font-weight: 500;">Deform</span>
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
            <span class="field-label" title="Rotational twist factor along Y-axis">Twist Factor:</span>
            <div class="slider-row">
              <input type="range" id="mod-twist" class="range-slider" min="-2.0" max="2.0" step="0.05" value="${twistVal}" />
              <span id="label-mod-twist" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${twistVal.toFixed(2)}</span>
            </div>
          </div>

          <!-- Symmetry Mirror -->
          <div class="field-row">
            <span class="field-label" title="Mirror shape across coordinate planes">Symmetry:</span>
            <select id="mod-mirror" class="select-field">
              <option value="none" ${mirrorAxis === 'none' ? 'selected' : ''}>None</option>
              <option value="x" ${mirrorAxis === 'x' ? 'selected' : ''}>X-Axis</option>
              <option value="y" ${mirrorAxis === 'y' ? 'selected' : ''}>Y-Axis</option>
              <option value="z" ${mirrorAxis === 'z' ? 'selected' : ''}>Z-Axis</option>
            </select>
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
              <input type="color" id="prop-color" class="color-picker" value="${node.material.color || '#e2e8f0'}" />
              <span class="tabular-nums font-mono" style="font-size: 11px;">${node.material.color}</span>
            </div>
          </div>
          <div class="field-row">
            <span class="field-label">Roughness:</span>
            <div class="slider-row">
              <input type="range" id="prop-roughness" class="range-slider" min="0" max="1" step="0.02" value="${node.material.roughness ?? 0.35}" />
              <span id="label-roughness" class="tabular-nums" style="width: 36px; text-align: right; font-size: 11px;">${(node.material.roughness ?? 0.35).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupListeners(node);
  }

  private renderDimensionFields(node: any): string {
    const dims = node.primitive.dimensions;
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

    // 3. Symmetry Mirror
    const mirrorSelect = this.querySelector('#mod-mirror') as HTMLSelectElement;
    mirrorSelect?.addEventListener('change', () => {
      const val = mirrorSelect.value as 'none' | 'x' | 'y' | 'z';
      this.sceneStore.updateNode(node.id, {
        modifiers: { ...node.modifiers, mirrorAxis: val }
      });
    });

    // 4. Round Edge
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
