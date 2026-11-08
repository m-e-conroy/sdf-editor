// ========================================================================
// SDF Studio 3D - Recursive Scene Outliner Element
// ========================================================================

import { SceneStore } from '../store/SceneStore';
import { SDFNode, PrimitiveType, CSGOpType } from '../tree/types';
import { CSGTree } from '../tree/CSGTree';

export class SdfOutliner extends HTMLElement {
  private sceneStore = SceneStore.getInstance();
  private onSceneChangedBound: () => void = () => {};
  private onSelectionChangedBound: () => void = () => {};
  private draggedNodeId: string | null = null;

  connectedCallback() {
    this.render();

    this.onSceneChangedBound = () => this.refreshTree();
    this.onSelectionChangedBound = () => this.refreshSelection();

    this.sceneStore.addEventListener('scene-changed', this.onSceneChangedBound);
    this.sceneStore.addEventListener('selection-changed', this.onSelectionChangedBound);
  }

  disconnectedCallback() {
    this.sceneStore.removeEventListener('scene-changed', this.onSceneChangedBound);
    this.sceneStore.removeEventListener('selection-changed', this.onSelectionChangedBound);
  }

  private render() {
    this.innerHTML = `
      <style>
        .outliner-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-panel);
          color: var(--text-primary);
          font-size: 12px;
          user-select: none;
        }

        .outliner-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-panel-elevated);
          gap: 6px;
        }

        .search-input {
          flex: 1;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 3px;
          padding: 3px 8px;
          font-size: 11px;
          color: var(--text-primary);
          outline: none;
        }
        .search-input:focus {
          border-color: var(--border-focus);
        }

        .btn-tree-action {
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          border-radius: 3px;
          padding: 3px 6px;
          font-size: 11px;
          cursor: pointer;
        }
        .btn-tree-action:hover {
          border-color: var(--accent-primary);
        }

        .tree-scroll-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 4px 0;
        }

        .tree-node-row {
          display: flex;
          align-items: center;
          height: 26px;
          padding: 0 8px;
          cursor: pointer;
          gap: 6px;
          border-left: 2px solid transparent;
          transition: background 80ms ease;
        }

        .tree-node-row:hover {
          background: var(--bg-panel-elevated);
        }

        .tree-node-row.is-selected {
          background: var(--bg-panel-elevated);
          border-left-color: var(--accent-primary);
          font-weight: 500;
        }

        .tree-node-row.drag-over {
          background: var(--dock-ghost);
          border-bottom: 2px solid var(--accent-primary);
        }

        .node-icon {
          font-size: 12px;
          width: 16px;
          text-align: center;
        }

        .node-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .badge-csg {
          font-size: 10px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 3px;
          cursor: pointer;
        }
        .badge-union { background: rgba(39, 174, 96, 0.2); color: var(--badge-union); border: 1px solid var(--badge-union); }
        .badge-difference { background: rgba(231, 76, 60, 0.2); color: var(--badge-difference); border: 1px solid var(--badge-difference); }
        .badge-intersection { background: rgba(41, 128, 185, 0.2); color: var(--badge-intersection); border: 1px solid var(--badge-intersection); }
        .badge-smooth { background: rgba(155, 89, 182, 0.2); color: var(--badge-smooth); border: 1px solid var(--badge-smooth); }

        .btn-eye, .btn-del {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 12px;
          padding: 2px 4px;
          border-radius: 3px;
        }

        .btn-eye:hover, .btn-del:hover {
          color: var(--text-primary);
        }
        .btn-del:hover {
          color: #e74c3c;
        }

        .is-hidden {
          opacity: 0.45;
        }
      </style>

      <div class="outliner-container">
        <div class="outliner-toolbar">
          <input type="text" id="outliner-search" class="search-input" placeholder="Filter shapes..." />
          <button id="btn-add-child" class="btn-tree-action" title="Add Child Primitive">+ Add</button>
        </div>
        <div class="tree-scroll-container" id="tree-container"></div>
      </div>
    `;

    this.setupListeners();
    this.refreshTree();
  }

  private setupListeners() {
    const searchInput = this.querySelector('#outliner-search') as HTMLInputElement;
    searchInput?.addEventListener('input', () => this.refreshTree(searchInput.value.trim().toLowerCase()));

    const addBtn = this.querySelector('#btn-add-child') as HTMLButtonElement;
    addBtn?.addEventListener('click', () => {
      const selected = this.sceneStore.getSelectedNode();
      const parentId = selected ? selected.id : this.sceneStore.tree.root.id;
      const newNode = CSGTree.createDefaultNode('box', 'New Box');
      this.sceneStore.addNode(newNode, parentId);
    });
  }

  private refreshTree(filterQuery: string = '') {
    const container = this.querySelector<HTMLElement>('#tree-container');
    if (!container) return;
    container.innerHTML = '';

    const root = this.sceneStore.tree.root;
    this.renderNodeRecursive(root, 0, container, filterQuery);
    this.refreshSelection();
  }

  private renderNodeRecursive(node: SDFNode, depth: number, container: HTMLElement, filter: string) {
    const matches = !filter || node.name.toLowerCase().includes(filter);

    if (matches) {
      const row = document.createElement('div');
      row.className = `tree-node-row ${!node.visible ? 'is-hidden' : ''}`;
      row.setAttribute('data-node-id', node.id);
      row.style.paddingLeft = `${depth * 14 + 8}px`;
      row.draggable = node.id !== this.sceneStore.tree.root.id;

      let badgeSymbol = '∪';
      let badgeClass = 'badge-union';
      if (node.csg.blendMode === 'smooth_polynomial') {
        badgeSymbol = '~∪';
        badgeClass = 'badge-smooth';
      } else if (node.csg.operation === 'difference') {
        badgeSymbol = '∖';
        badgeClass = 'badge-difference';
      } else if (node.csg.operation === 'intersection') {
        badgeSymbol = '∩';
        badgeClass = 'badge-intersection';
      }

      const glyph = this.getPrimitiveGlyph(node.primitive.type);

      row.innerHTML = `
        <span class="node-icon">${glyph}</span>
        <span class="node-name" title="${node.name}">${node.name}</span>
        ${node.id !== this.sceneStore.tree.root.id ? `<span class="badge-csg ${badgeClass}" title="CSG Mode (Click to cycle)">${badgeSymbol}</span>` : ''}
        <button class="btn-eye" title="Toggle Visibility">${node.visible ? '👁️' : '🕶️'}</button>
        ${node.id !== this.sceneStore.tree.root.id ? `<button class="btn-del" title="Delete Node">✕</button>` : ''}
      `;

      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-eye') || (e.target as HTMLElement).closest('.btn-del') || (e.target as HTMLElement).closest('.badge-csg')) return;
        this.sceneStore.selectNode(node.id);
      });

      const eyeBtn = row.querySelector('.btn-eye');
      eyeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sceneStore.updateNode(node.id, { visible: !node.visible });
      });

      const badge = row.querySelector('.badge-csg');
      badge?.addEventListener('click', (e) => {
        e.stopPropagation();
        const ops: CSGOpType[] = ['union', 'difference', 'intersection'];
        const nextOp = ops[(ops.indexOf(node.csg.operation) + 1) % ops.length];
        this.sceneStore.updateNode(node.id, {
          csg: { ...node.csg, operation: nextOp }
        });
      });

      const delBtn = row.querySelector('.btn-del');
      delBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sceneStore.removeNode(node.id);
      });

      row.addEventListener('dragstart', (e) => {
        this.draggedNodeId = node.id;
        e.dataTransfer?.setData('text/plain', node.id);
        row.style.opacity = '0.5';
      });

      row.addEventListener('dragend', () => {
        this.draggedNodeId = null;
        row.style.opacity = '1';
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (this.draggedNodeId && this.draggedNodeId !== node.id) {
          row.classList.add('drag-over');
        }
      });

      row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over');
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');
        if (this.draggedNodeId && this.draggedNodeId !== node.id) {
          this.sceneStore.reparentNode(this.draggedNodeId, node.id);
        }
      });

      container.appendChild(row);
    }

    for (const child of node.children) {
      this.renderNodeRecursive(child, depth + 1, container, filter);
    }
  }

  private refreshSelection() {
    const selectedId = this.sceneStore.selectedNodeId;
    const rows = this.querySelectorAll('.tree-node-row');
    rows.forEach((r) => {
      const id = r.getAttribute('data-node-id');
      if (id === selectedId) {
        r.classList.add('is-selected');
      } else {
        r.classList.remove('is-selected');
      }
    });
  }

  private getPrimitiveGlyph(type: PrimitiveType): string {
    const glyphs: Record<string, string> = {
      sphere: '⚪',
      box: '📦',
      cylinder: '🥫',
      torus: '🍩',
      capsule: '💊',
      cone: '🔺',
      pipe: '⭕',
      hemisphere: '🌓',
      ellipsoid: '🥚',
      pyramid: '▲',
      triangular_prism: '📐',
      hexagonal_prism: '🛑',
      tetrahedron: '💠',
      octahedron: '💎',
      mandelbulb: '🌀'
    };
    return glyphs[type] || '🔹';
  }
}

customElements.define('sdf-outliner', SdfOutliner);

