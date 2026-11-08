// ========================================================================
// SDF Studio 3D - Floating Geometric Shape Palette Component
// Interactive asset shelf featuring 3D rendered isometric icons, search & category filtering
// ========================================================================

import { CSGTree } from '../tree/CSGTree';
import { SceneStore } from '../store/SceneStore';
import { SHAPE_CATALOG, ShapeDefinition } from '../icons/shapeIcons';

export class SdfShapePalette extends HTMLElement {
  private isOpen = false;
  private currentCategory: 'all' | 'euclidean' | 'curved' | 'polyhedra' | 'fractal' = 'all';
  private searchQuery = '';
  private sceneStore = SceneStore.getInstance();
  private onKeyDownBound: (e: KeyboardEvent) => void = () => {};
  private onOpenPaletteBound: () => void = () => {};
  private onTogglePaletteBound: () => void = () => {};
  private onClosePaletteBound: () => void = () => {};

  connectedCallback() {
    this.render();
    this.setupListeners();

    this.onOpenPaletteBound = () => this.open();
    this.onTogglePaletteBound = () => this.toggle();
    this.onClosePaletteBound = () => this.close();
    window.addEventListener('open-shape-palette', this.onOpenPaletteBound);
    window.addEventListener('toggle-shape-palette', this.onTogglePaletteBound);
    window.addEventListener('close-shape-palette', this.onClosePaletteBound);

    // Global keyboard listener for Esc and Shift+A
    this.onKeyDownBound = (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside text inputs, except Escape
      const target = e.target as HTMLElement | null;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
        return;
      }

      if ((e.key === 'a' || e.key === 'A') && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && !isInput) {
        e.preventDefault();
        this.toggle();
      }
    };
    window.addEventListener('keydown', this.onKeyDownBound);
  }

  disconnectedCallback() {
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('open-shape-palette', this.onOpenPaletteBound);
    window.removeEventListener('toggle-shape-palette', this.onTogglePaletteBound);
    window.removeEventListener('close-shape-palette', this.onClosePaletteBound);
  }

  public open(): void {
    this.isOpen = true;
    this.style.display = 'flex';
    this.searchQuery = '';
    const searchInput = this.querySelector('#palette-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
      setTimeout(() => searchInput.focus(), 50);
    }
    this.updateGrid();
  }

  public close(): void {
    this.isOpen = false;
    this.style.display = 'none';
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private render(): void {
    this.style.display = 'none';
    this.style.position = 'fixed';
    this.style.inset = '0';
    this.style.zIndex = '9999';
    this.style.alignItems = 'center';
    this.style.justifyContent = 'center';
    this.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';
    this.style.backdropFilter = 'blur(6px)';
    this.style.setProperty('-webkit-backdrop-filter', 'blur(6px)');

    this.innerHTML = `
      <style>
        .shape-palette-dialog {
          width: 520px;
          max-width: 92vw;
          max-height: 84vh;
          background: rgba(22, 24, 30, 0.94);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #e2e8f0;
          user-select: none;
          animation: palette-pop 0.16s cubic-bezier(0.16, 1, 0.3, 1);
        }

        [data-theme="light"] .shape-palette-dialog {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(0, 0, 0, 0.14);
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.05);
          color: #18181b;
        }

        @keyframes palette-pop {
          from { opacity: 0; transform: scale(0.95) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .palette-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        [data-theme="light"] .palette-header {
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .palette-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .palette-title {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .palette-hotkey-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 2px 5px;
          border-radius: 3px;
        }

        [data-theme="light"] .palette-hotkey-hint {
          background: rgba(0, 0, 0, 0.07);
          color: #64748b;
        }

        .palette-btn-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 16px;
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s ease;
        }

        .palette-btn-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        [data-theme="light"] .palette-btn-close:hover {
          background: rgba(0, 0, 0, 0.07);
          color: #0f172a;
        }

        .palette-controls-bar {
          padding: 10px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(0, 0, 0, 0.15);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        [data-theme="light"] .palette-controls-bar {
          background: rgba(0, 0, 0, 0.03);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .palette-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .palette-search-icon {
          position: absolute;
          left: 10px;
          pointer-events: none;
          color: #64748b;
        }

        .palette-search-input {
          width: 100%;
          background: rgba(14, 16, 20, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 7px 10px 7px 32px;
          font-size: 12px;
          color: #f1f5f9;
          outline: none;
          transition: border-color 0.14s ease, box-shadow 0.14s ease;
        }

        [data-theme="light"] .palette-search-input {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.15);
          color: #18181b;
        }

        .palette-search-input:focus {
          border-color: #ea7600;
          box-shadow: 0 0 0 1px #ea7600;
        }

        .palette-category-tabs {
          display: flex;
          align-items: center;
          gap: 5px;
          overflow-x: auto;
        }

        .category-tab {
          appearance: none;
          background: transparent;
          border: 1px solid transparent;
          color: #94a3b8;
          border-radius: 4px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.12s ease;
        }

        .category-tab:hover {
          color: #f1f5f9;
          background: rgba(255, 255, 255, 0.06);
        }

        [data-theme="light"] .category-tab {
          color: #64748b;
        }

        [data-theme="light"] .category-tab:hover {
          color: #0f172a;
          background: rgba(0, 0, 0, 0.05);
        }

        .category-tab.active {
          background: #ea7600;
          color: #ffffff;
          font-weight: 600;
        }

        .palette-grid-container {
          flex: 1;
          overflow-y: auto;
          padding: 14px 18px 18px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        @media (max-width: 480px) {
          .palette-grid-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .shape-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(30, 34, 44, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 10px 6px 8px;
          cursor: pointer;
          transition: all 0.14s cubic-bezier(0.2, 0, 0, 1);
          text-align: center;
          position: relative;
        }

        [data-theme="light"] .shape-card {
          background: rgba(240, 240, 246, 0.85);
          border-color: rgba(0, 0, 0, 0.08);
        }

        .shape-card:hover {
          transform: translateY(-2px);
          background: rgba(42, 48, 62, 0.9);
          border-color: rgba(234, 118, 0, 0.55);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35), 0 0 12px rgba(234, 118, 0, 0.2);
        }

        [data-theme="light"] .shape-card:hover {
          background: #ffffff;
          border-color: rgba(234, 118, 0, 0.65);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), 0 0 10px rgba(234, 118, 0, 0.15);
        }

        .shape-card:active {
          transform: scale(0.96);
        }

        .shape-icon-box {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
          transition: transform 0.14s ease;
        }

        .shape-card:hover .shape-icon-box {
          transform: scale(1.06);
        }

        .shape-card-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        [data-theme="light"] .shape-card-title {
          color: #18181b;
        }

        .shape-card-badge {
          font-size: 9px;
          font-weight: 500;
          color: #94a3b8;
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        [data-theme="light"] .shape-card-badge {
          color: #71717a;
        }

        .palette-empty-msg {
          grid-column: 1 / -1;
          text-align: center;
          padding: 36px 0;
          color: #64748b;
          font-size: 12px;
        }
      </style>

      <div class="shape-palette-dialog" id="palette-dialog-box">
        <!-- Header -->
        <div class="palette-header">
          <div class="palette-title-group">
            <span class="palette-title">Add 3D Geometric Shape</span>
            <span class="palette-hotkey-hint">Shift+A</span>
          </div>
          <button class="palette-btn-close" id="btn-palette-close" title="Close (Esc)">✕</button>
        </div>

        <!-- Controls: Search & Category Tabs -->
        <div class="palette-controls-bar">
          <div class="palette-search-wrapper">
            <svg class="palette-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="7" cy="7" r="4.5"/>
              <path d="M10.5 10.5L14 14"/>
            </svg>
            <input type="text" class="palette-search-input" id="palette-search-input" placeholder="Search shapes... (e.g. torus, cube, prism)" />
          </div>

          <div class="palette-category-tabs" id="palette-tabs">
            <button class="category-tab active" data-cat="all">All (${SHAPE_CATALOG.length})</button>
            <button class="category-tab" data-cat="euclidean">Euclidean</button>
            <button class="category-tab" data-cat="curved">Curved & Hollow</button>
            <button class="category-tab" data-cat="polyhedra">Polyhedra</button>
            <button class="category-tab" data-cat="fractal">3D Fractals</button>
          </div>
        </div>

        <!-- Shape Cards Grid -->
        <div class="palette-grid-container" id="palette-grid">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;

    this.updateGrid();
  }

  private setupListeners(): void {
    // Backdrop click to close
    this.addEventListener('click', (e) => {
      const dialogBox = this.querySelector('#palette-dialog-box');
      if (dialogBox && !dialogBox.contains(e.target as Node)) {
        this.close();
      }
    });

    // Close button
    this.querySelector('#btn-palette-close')?.addEventListener('click', () => {
      this.close();
    });

    // Search input
    const searchInput = this.querySelector('#palette-search-input') as HTMLInputElement;
    searchInput?.addEventListener('input', () => {
      this.searchQuery = searchInput.value.trim().toLowerCase();
      this.updateGrid();
    });

    // Category Tabs
    const tabs = this.querySelectorAll('.category-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentCategory = (tab as HTMLElement).dataset.cat as any;
        this.updateGrid();
      });
    });
  }

  private updateGrid(): void {
    const grid = this.querySelector('#palette-grid');
    if (!grid) return;

    const filtered = SHAPE_CATALOG.filter((shape) => {
      const matchesCat = this.currentCategory === 'all' || shape.category === this.currentCategory;
      const matchesSearch =
        this.searchQuery === '' ||
        shape.name.toLowerCase().includes(this.searchQuery) ||
        shape.type.toLowerCase().includes(this.searchQuery) ||
        shape.description.toLowerCase().includes(this.searchQuery);
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="palette-empty-msg">No shapes found matching "${this.searchQuery}".</div>`;
      return;
    }

    grid.innerHTML = filtered
      .map(
        (shape) => `
        <div class="shape-card" data-type="${shape.type}" title="${shape.description}">
          <div class="shape-icon-box">
            ${shape.iconSvg}
          </div>
          <span class="shape-card-title">${shape.name}</span>
          <span class="shape-card-badge">${shape.badge}</span>
        </div>
      `
      )
      .join('');

    // Wire clicks to add shape
    grid.querySelectorAll('.shape-card').forEach((card) => {
      card.addEventListener('click', () => {
        const type = (card as HTMLElement).dataset.type;
        if (type) {
          this.handleAddShape(type as any);
        }
      });
    });
  }

  private handleAddShape(type: ShapeDefinition['type']): void {
    const newNode = CSGTree.createDefaultNode(type);
    // Subtle jitter so repeated shapes don't exactly occlude each other
    newNode.transform.position = [
      (Math.random() - 0.5) * 0.4,
      (Math.random() - 0.5) * 0.4,
      (Math.random() - 0.5) * 0.4
    ];

    this.sceneStore.addNode(newNode);
    this.sceneStore.selectNode(newNode.id);
    this.close();
  }
}

customElements.define('sdf-shape-palette', SdfShapePalette);
