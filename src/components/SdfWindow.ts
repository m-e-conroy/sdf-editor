// ========================================================================
// SDF Studio 3D - Hybrid Floating/Dockable Window Frame Element
// ========================================================================

import { WorkspaceStore } from '../store/WorkspaceStore';

export class SdfWindow extends HTMLElement {
  private workspaceStore = WorkspaceStore.getInstance();
  private windowId: string = '';
  private isDragging = false;
  private isResizing = false;
  private activeResizeHandle: string | null = null;
  private dragStartPointer = { x: 0, y: 0 };
  private dragStartPos = { x: 0, y: 0 };
  private resizeStartSize = { width: 0, height: 0 };
  private resizeStartPos = { x: 0, y: 0 };
  private ghostOverlay: HTMLDivElement | null = null;
  private onLayoutChangedBound: () => void = () => {};

  static get observedAttributes() {
    return ['window-id', 'title', 'icon'];
  }

  connectedCallback() {
    this.windowId = this.getAttribute('window-id') || 'window_' + Math.random().toString(36).substring(2, 7);
    const initialTitle = this.getAttribute('title') || 'Panel';
    const initialIcon = this.getAttribute('icon') || '🪟';

    if (!this.workspaceStore.getPanel(this.windowId)) {
      this.workspaceStore.registerPanel({
        id: this.windowId,
        title: initialTitle,
        icon: initialIcon,
        position: { x: 100, y: 80 },
        size: { width: 320, height: 420 },
        dockZone: 'floating',
        isMinimized: false,
        zIndex: 20
      });
    }

    this.render();
    this.setupInteractions();

    this.onLayoutChangedBound = () => this.syncLayout();
    this.workspaceStore.addEventListener('layout-changed', this.onLayoutChangedBound);
    this.syncLayout();
  }

  disconnectedCallback() {
    this.workspaceStore.removeEventListener('layout-changed', this.onLayoutChangedBound);
    if (this.ghostOverlay && this.ghostOverlay.parentElement) {
      this.ghostOverlay.remove();
    }
  }

  private render() {
    const title = this.getAttribute('title') || 'Panel';
    const icon = this.getAttribute('icon') || '🪟';

    const existingChildren = Array.from(this.childNodes);

    this.innerHTML = `
      <style>
        sdf-window {
          position: absolute;
          display: flex;
          flex-direction: column;
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          box-shadow: var(--shadow-elevation);
          overflow: hidden;
          box-sizing: border-box;
          user-select: none;
          min-width: 240px;
          min-height: 160px;
          transition: transform 140ms cubic-bezier(0.16, 1, 0.3, 1), opacity 140ms ease;
        }

        sdf-window[data-docked="dock-left"] {
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-left: none;
          border-right: 1px solid var(--border-subtle);
          box-shadow: none;
        }

        sdf-window[data-docked="dock-right"] {
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-right: none;
          border-left: 1px solid var(--border-subtle);
          box-shadow: none;
        }

        .window-title-bar {
          height: 32px;
          background: var(--bg-panel-elevated);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          cursor: grab;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }

        .window-title-bar:active {
          cursor: grabbing;
        }

        .title-left {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .window-controls {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ctrl-btn {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          border-radius: 3px;
          font-size: 11px;
          cursor: pointer;
          transition: all 120ms ease;
        }

        .ctrl-btn:hover {
          background: var(--bg-input);
          color: var(--text-primary);
        }

        .ctrl-btn.close-btn:hover {
          background: #e74c3c;
          color: #ffffff;
        }

        .window-content-slot {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .resize-handle {
          position: absolute;
          z-index: 50;
        }
        .resize-n  { top: 0; left: 6px; right: 6px; height: 5px; cursor: n-resize; }
        .resize-s  { bottom: 0; left: 6px; right: 6px; height: 5px; cursor: s-resize; }
        .resize-e  { right: 0; top: 6px; bottom: 6px; width: 5px; cursor: e-resize; }
        .resize-w  { left: 0; top: 6px; bottom: 6px; width: 5px; cursor: w-resize; }
        .resize-ne { top: 0; right: 0; width: 8px; height: 8px; cursor: ne-resize; }
        .resize-nw { top: 0; left: 0; width: 8px; height: 8px; cursor: nw-resize; }
        .resize-se { bottom: 0; right: 0; width: 8px; height: 8px; cursor: se-resize; }
        .resize-sw { bottom: 0; left: 0; width: 8px; height: 8px; cursor: sw-resize; }
      </style>

      <div class="window-title-bar">
        <div class="title-left">
          <span>${icon}</span>
          <span class="window-title-label">${title}</span>
        </div>
        <div class="window-controls">
          <button class="ctrl-btn dock-btn" title="Toggle Dock / Float">⊞</button>
          <button class="ctrl-btn min-btn" title="Minimize / Park to Tray">—</button>
          <button class="ctrl-btn close-btn" title="Close Panel">✕</button>
        </div>
      </div>

      <div class="window-content-slot"></div>

      <div class="resize-handle resize-n" data-dir="n"></div>
      <div class="resize-handle resize-s" data-dir="s"></div>
      <div class="resize-handle resize-e" data-dir="e"></div>
      <div class="resize-handle resize-w" data-dir="w"></div>
      <div class="resize-handle resize-ne" data-dir="ne"></div>
      <div class="resize-handle resize-nw" data-dir="nw"></div>
      <div class="resize-handle resize-se" data-dir="se"></div>
      <div class="resize-handle resize-sw" data-dir="sw"></div>
    `;

    const slot = this.querySelector('.window-content-slot') as HTMLDivElement;
    for (const child of existingChildren) {
      slot.appendChild(child);
    }
  }

  private setupInteractions() {
    const titleBar = this.querySelector('.window-title-bar') as HTMLDivElement;
    const minBtn = this.querySelector('.min-btn') as HTMLButtonElement;
    const closeBtn = this.querySelector('.close-btn') as HTMLButtonElement;
    const dockBtn = this.querySelector('.dock-btn') as HTMLButtonElement;

    this.addEventListener('pointerdown', () => {
      this.workspaceStore.bringToFront(this.windowId);
    });

    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.workspaceStore.minimizePanel(this.windowId);
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.workspaceStore.minimizePanel(this.windowId);
    });

    dockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const p = this.workspaceStore.getPanel(this.windowId);
      if (!p) return;
      if (p.dockZone === 'floating') {
        const isRight = p.position.x > window.innerWidth / 2;
        this.workspaceStore.setDockZone(this.windowId, isRight ? 'dock-right' : 'dock-left');
      } else {
        this.workspaceStore.setDockZone(this.windowId, 'floating');
      }
    });

    titleBar.addEventListener('pointerdown', (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.ctrl-btn')) return;
      this.isDragging = true;
      titleBar.setPointerCapture(e.pointerId);

      const panel = this.workspaceStore.getPanel(this.windowId);
      const rect = this.getBoundingClientRect();
      this.dragStartPointer = { x: e.clientX, y: e.clientY };
      this.dragStartPos = { x: rect.left, y: rect.top };

      if (panel && panel.dockZone !== 'floating') {
        this.workspaceStore.updatePanel(this.windowId, {
          dockZone: 'floating',
          position: { x: rect.left, y: rect.top },
          size: { width: rect.width, height: rect.height }
        });
      }

      this.createGhostOverlay();
    });

    titleBar.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartPointer.x;
      const dy = e.clientY - this.dragStartPointer.y;
      const newX = Math.max(0, Math.min(window.innerWidth - 60, this.dragStartPos.x + dx));
      const newY = Math.max(42, Math.min(window.innerHeight - 60, this.dragStartPos.y + dy));

      this.style.left = `${newX}px`;
      this.style.top = `${newY}px`;

      const SNAP_THRESHOLD = 45;
      if (e.clientX <= SNAP_THRESHOLD) {
        this.showGhost('dock-left');
      } else if (e.clientX >= window.innerWidth - SNAP_THRESHOLD) {
        this.showGhost('dock-right');
      } else {
        this.hideGhost();
      }
    });

    const endDrag = (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      try {
        titleBar.releasePointerCapture(e.pointerId);
      } catch (_) {}

      const SNAP_THRESHOLD = 45;
      if (e.clientX <= SNAP_THRESHOLD) {
        this.workspaceStore.updatePanel(this.windowId, { dockZone: 'dock-left' });
      } else if (e.clientX >= window.innerWidth - SNAP_THRESHOLD) {
        this.workspaceStore.updatePanel(this.windowId, { dockZone: 'dock-right' });
      } else {
        const rect = this.getBoundingClientRect();
        this.workspaceStore.updatePanel(this.windowId, {
          dockZone: 'floating',
          position: { x: rect.left, y: rect.top }
        });
      }
      this.hideGhost();
    };

    titleBar.addEventListener('pointerup', endDrag);
    titleBar.addEventListener('pointercancel', endDrag);

    // 8-way Resize handles
    const handles = this.querySelectorAll('.resize-handle');
    handles.forEach((h) => {
      const handle = h as HTMLDivElement;
      handle.addEventListener('pointerdown', (e: PointerEvent) => {
        e.stopPropagation();
        this.isResizing = true;
        this.activeResizeHandle = handle.getAttribute('data-dir');
        handle.setPointerCapture(e.pointerId);

        const rect = this.getBoundingClientRect();
        this.dragStartPointer = { x: e.clientX, y: e.clientY };
        this.resizeStartSize = { width: rect.width, height: rect.height };
        this.resizeStartPos = { x: rect.left, y: rect.top };
      });

      handle.addEventListener('pointermove', (e: PointerEvent) => {
        if (!this.isResizing || !this.activeResizeHandle) return;
        const dx = e.clientX - this.dragStartPointer.x;
        const dy = e.clientY - this.dragStartPointer.y;

        let w = this.resizeStartSize.width;
        let h = this.resizeStartSize.height;
        let x = this.resizeStartPos.x;
        let y = this.resizeStartPos.y;

        const dir = this.activeResizeHandle;
        if (dir.includes('e')) w += dx;
        if (dir.includes('s')) h += dy;
        if (dir.includes('w')) {
          w -= dx;
          x += dx;
        }
        if (dir.includes('n')) {
          h -= dy;
          y += dy;
        }

        w = Math.max(240, w);
        h = Math.max(160, h);

        this.style.width = `${w}px`;
        this.style.height = `${h}px`;
        if (dir.includes('w')) this.style.left = `${x}px`;
        if (dir.includes('n')) this.style.top = `${y}px`;
      });

      const endResize = (e: PointerEvent) => {
        if (!this.isResizing) return;
        this.isResizing = false;
        this.activeResizeHandle = null;
        try {
          handle.releasePointerCapture(e.pointerId);
        } catch (_) {}

        const rect = this.getBoundingClientRect();
        this.workspaceStore.updatePanel(this.windowId, {
          size: { width: rect.width, height: rect.height },
          position: { x: rect.left, y: rect.top }
        });
      };

      handle.addEventListener('pointerup', endResize);
      handle.addEventListener('pointercancel', endResize);
    });
  }

  private createGhostOverlay() {
    if (!this.ghostOverlay) {
      this.ghostOverlay = document.createElement('div');
      this.ghostOverlay.className = 'dock-ghost-overlay';
      this.ghostOverlay.style.cssText = `
        position: fixed;
        pointer-events: none;
        background: var(--dock-ghost);
        border: 2px dashed var(--accent-primary);
        z-index: 9999;
        transition: all 120ms ease;
        display: none;
      `;
      document.body.appendChild(this.ghostOverlay);
    }
  }

  private showGhost(zone: 'dock-left' | 'dock-right') {
    if (!this.ghostOverlay) this.createGhostOverlay();
    if (!this.ghostOverlay) return;
    this.ghostOverlay.style.display = 'block';
    this.ghostOverlay.style.top = '42px';
    this.ghostOverlay.style.height = `${window.innerHeight - 70}px`;
    this.ghostOverlay.style.width = '320px';

    if (zone === 'dock-left') {
      this.ghostOverlay.style.left = '0';
      this.ghostOverlay.style.right = 'auto';
    } else {
      this.ghostOverlay.style.left = 'auto';
      this.ghostOverlay.style.right = '0';
    }
  }

  private hideGhost() {
    if (this.ghostOverlay) {
      this.ghostOverlay.style.display = 'none';
    }
  }

  private syncLayout() {
    const p = this.workspaceStore.getPanel(this.windowId);
    if (!p) return;

    if (p.isMinimized) {
      this.style.display = 'none';
      return;
    }
    this.style.display = 'flex';
    this.style.zIndex = String(p.zIndex);
    this.setAttribute('data-docked', p.dockZone);

    const resizeHandles = this.querySelectorAll('.resize-handle');

    if (p.dockZone === 'dock-left') {
      this.style.left = '0px';
      this.style.top = '42px';
      this.style.width = `${p.size.width}px`;
      this.style.height = `${window.innerHeight - 70}px`;
      resizeHandles.forEach((h) => ((h as HTMLElement).style.display = 'none'));
    } else if (p.dockZone === 'dock-right') {
      this.style.right = '0px';
      this.style.left = 'auto';
      this.style.top = `${p.position.y}px`;
      this.style.width = `${p.size.width}px`;
      this.style.height = `${p.size.height}px`;
      resizeHandles.forEach((h) => ((h as HTMLElement).style.display = 'none'));
    } else {
      this.style.right = 'auto';
      this.style.left = `${p.position.x}px`;
      this.style.top = `${p.position.y}px`;
      this.style.width = `${p.size.width}px`;
      this.style.height = `${p.size.height}px`;
      resizeHandles.forEach((h) => ((h as HTMLElement).style.display = 'block'));
    }
  }
}

customElements.define('sdf-window', SdfWindow);

