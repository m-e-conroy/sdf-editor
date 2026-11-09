// ========================================================================
// SDF Studio 3D - Recursive Scene Outliner Element
// ========================================================================

import { SceneStore } from '../store/SceneStore';
import { SDFNode, PrimitiveType, CSGOpType } from '../tree/types';

export class SdfOutliner extends HTMLElement {
  private sceneStore = SceneStore.getInstance();
  private onSceneChangedBound: () => void = () => {};
  private onSelectionChangedBound: () => void = () => {};
  private onKeyDownBound: (e: KeyboardEvent) => void = () => {};
  private draggedNodeId: string | null = null;
  private collapsedGroups: Set<string> = new Set();

  connectedCallback() {
    this.render();

    this.onSceneChangedBound = () => this.refreshTree();
    this.onSelectionChangedBound = () => this.refreshSelection();

    this.sceneStore.addEventListener('scene-changed', this.onSceneChangedBound);
    this.sceneStore.addEventListener('selection-changed', this.onSelectionChangedBound);

    this.onKeyDownBound = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        const selected = this.sceneStore.getSelectedNode();
        if (selected) {
          if (e.shiftKey) {
            // Ctrl+Shift+G: Ungroup
            if (selected.kind === 'group') {
              this.sceneStore.ungroupNode(selected.id);
            }
          } else {
            // Ctrl+G: Wrap in Group
            this.sceneStore.createGroup(`${selected.name} Group`, undefined, [selected.id]);
          }
        }
      }
    };
    window.addEventListener('keydown', this.onKeyDownBound);
  }

  disconnectedCallback() {
    this.sceneStore.removeEventListener('scene-changed', this.onSceneChangedBound);
    this.sceneStore.removeEventListener('selection-changed', this.onSelectionChangedBound);
    window.removeEventListener('keydown', this.onKeyDownBound);
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
          white-space: nowrap;
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
          gap: 4px;
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

        .btn-chevron {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 10px;
          width: 14px;
          padding: 0;
          text-align: center;
        }
        .btn-chevron:hover {
          color: var(--text-primary);
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

        .badge-count {
          font-size: 10px;
          font-weight: 600;
          padding: 0 4px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
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

        .btn-order, .btn-eye, .btn-del, .btn-dup {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 11px;
          padding: 2px 3px;
          border-radius: 3px;
        }

        .btn-order:hover, .btn-eye:hover, .btn-del:hover, .btn-dup:hover {
          color: var(--text-primary);
        }
        .btn-del:hover {
          color: #e74c3c;
        }
        .btn-dup:hover {
          color: var(--accent-primary);
        }

        .is-hidden {
          opacity: 0.45;
        }
      </style>

      <div class="outliner-container">
        <div class="outliner-toolbar">
          <input type="text" id="outliner-search" class="search-input" placeholder="Filter shapes..." />
          <button id="btn-add-group" class="btn-tree-action" title="Create Empty CSG Group">+ Group</button>
          <button id="btn-add-child" class="btn-tree-action" title="Add Primitive (Shift+A)">+ Add</button>
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

    const addGroupBtn = this.querySelector('#btn-add-group') as HTMLButtonElement;
    addGroupBtn?.addEventListener('click', () => {
      const selected = this.sceneStore.getSelectedNode();
      const parentId = selected && selected.kind === 'group' ? selected.id : undefined;
      const grp = this.sceneStore.createGroup('Group', parentId);
      this.sceneStore.selectNode(grp.id);
    });

    const addBtn = this.querySelector('#btn-add-child') as HTMLButtonElement;
    addBtn?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('toggle-shape-palette'));
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
    const isGroup = node.kind === 'group';
    const isRoot = node.id === this.sceneStore.tree.root.id;
    const isCollapsed = this.collapsedGroups.has(node.id);

    if (matches) {
      const row = document.createElement('div');
      row.className = `tree-node-row ${!node.visible ? 'is-hidden' : ''}`;
      row.setAttribute('data-node-id', node.id);
      row.style.paddingLeft = `${depth * 14 + 6}px`;
      row.draggable = !isRoot;

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

      const glyph = isGroup ? '📁' : this.getPrimitiveGlyph(node.primitive?.type ?? 'sphere');
      const chevronHtml = isGroup
        ? `<button class="btn-chevron" data-group-id="${node.id}">${isCollapsed ? '▶' : '▼'}</button>`
        : `<span style="width: 14px;"></span>`;
      const countBadge = isGroup ? `<span class="badge-count">${node.children.length}</span>` : '';

      row.innerHTML = `
        ${chevronHtml}
        <span class="node-icon">${glyph}</span>
        <span class="node-name" title="Double click to rename: ${node.name}">${node.name}</span>
        ${countBadge}
        ${!isRoot ? `<span class="badge-csg ${badgeClass}" title="CSG Mode (Click to cycle)">${badgeSymbol}</span>` : ''}
        ${!isRoot ? `<button class="btn-order btn-order-up" title="Move Up">↑</button>` : ''}
        ${!isRoot ? `<button class="btn-order btn-order-down" title="Move Down">↓</button>` : ''}
        ${!isRoot ? `<button class="btn-dup" title="Duplicate Node (Shift+D)">⧉</button>` : ''}
        <button class="btn-eye" title="Toggle Visibility">${node.visible ? '👁️' : '🕶️'}</button>
        ${!isRoot ? `<button class="btn-del" title="Delete Node">✕</button>` : ''}
      `;

      // Click to select
      row.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (
          target.closest('.btn-chevron') ||
          target.closest('.btn-eye') ||
          target.closest('.btn-del') ||
          target.closest('.btn-dup') ||
          target.closest('.btn-order') ||
          target.closest('.badge-csg')
        ) return;
        this.sceneStore.selectNode(node.id);
      });

      // Expand / Collapse Chevron
      if (isGroup) {
        const chevron = row.querySelector('.btn-chevron');
        chevron?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.collapsedGroups.has(node.id)) {
            this.collapsedGroups.delete(node.id);
          } else {
            this.collapsedGroups.add(node.id);
          }
          this.refreshTree(filter);
        });
      }

      // Inline Rename
      const nameSpan = row.querySelector('.node-name') as HTMLElement;
      nameSpan?.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const currentName = node.name;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'inline-rename-input';
        input.value = currentName;
        input.style.width = '100%';
        input.style.background = 'var(--bg-input)';
        input.style.color = 'var(--text-primary)';
        input.style.border = '1px solid var(--accent-primary)';
        input.style.borderRadius = '2px';
        input.style.padding = '1px 4px';
        input.style.fontSize = '11px';
        input.style.outline = 'none';

        const commitRename = () => {
          const newName = input.value.trim();
          if (newName && newName !== currentName) {
            this.sceneStore.updateNode(node.id, { name: newName });
          } else {
            this.refreshTree();
          }
        };

        input.addEventListener('keydown', (ke) => {
          if (ke.key === 'Enter') {
            commitRename();
          } else if (ke.key === 'Escape') {
            this.refreshTree();
          }
        });
        input.addEventListener('blur', commitRename);

        nameSpan.replaceWith(input);
        input.focus();
        input.select();
      });

      // Reorder buttons
      const upBtn = row.querySelector('.btn-order-up');
      upBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sceneStore.moveNodeOrder(node.id, 'up');
      });

      const downBtn = row.querySelector('.btn-order-down');
      downBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sceneStore.moveNodeOrder(node.id, 'down');
      });

      // Duplicate
      const dupBtn = row.querySelector('.btn-dup');
      dupBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sceneStore.duplicateNode(node.id);
      });

      // Visibility Toggle
      const eyeBtn = row.querySelector('.btn-eye');
      eyeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sceneStore.updateNode(node.id, { visible: !node.visible });
      });

      // Cycle CSG Operation
      const badge = row.querySelector('.badge-csg');
      badge?.addEventListener('click', (e) => {
        e.stopPropagation();
        const ops: CSGOpType[] = ['union', 'difference', 'intersection'];
        const nextOp = ops[(ops.indexOf(node.csg.operation) + 1) % ops.length];
        this.sceneStore.updateNode(node.id, {
          csg: { ...node.csg, operation: nextOp }
        });
      });

      // Delete Node
      const delBtn = row.querySelector('.btn-del');
      delBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sceneStore.removeNode(node.id);
      });

      // Drag and Drop Reparenting
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
          const targetParentId = isGroup ? node.id : (this.sceneStore.tree.findParent(node.id)?.id || this.sceneStore.tree.root.id);
          this.sceneStore.reparentNode(this.draggedNodeId, targetParentId);
        }
      });

      container.appendChild(row);
    }

    if (!isCollapsed && node.children && node.children.length > 0) {
      for (const child of node.children) {
        this.renderNodeRecursive(child, depth + 1, container, filter);
      }
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
      mandelbulb: '🌀',
      capped_torus: '📐',
      chain_link: '🔗',
      chamfer_cylinder: '⚙️',
      egg: '🥚',
      heart: '❤️',
      star_prism: '⭐'
    };
    return glyphs[type] || '🔹';
  }
}

customElements.define('sdf-outliner', SdfOutliner);
