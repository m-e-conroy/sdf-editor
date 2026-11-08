// ========================================================================
// SDF Studio 3D - Workspace & Window Management State Store
// ========================================================================

export type DockZone = 'floating' | 'dock-left' | 'dock-right' | 'parked';

export interface PanelWindowState {
  id: string;
  title: string;
  icon: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  dockZone: DockZone;
  isMinimized: boolean;
  zIndex: number;
  prevFloating?: {
    position: { x: number; y: number };
    size: { width: number; height: number };
  };
}

export type WorkspacePreset = 'Default' | 'Sculpting' | 'Technical';

const STORAGE_KEY = 'sdf_studio_workspace_v1';

export class WorkspaceStore extends EventTarget {
  private static instance: WorkspaceStore | null = null;
  private panels: Map<string, PanelWindowState> = new Map();
  private topZIndex = 20;
  public activePreset: WorkspacePreset = 'Default';

  private constructor() {
    super();
    this.initializeDefaultPanels();
    this.loadFromLocalStorage();
  }

  public static getInstance(): WorkspaceStore {
    if (!WorkspaceStore.instance) {
      WorkspaceStore.instance = new WorkspaceStore();
    }
    return WorkspaceStore.instance;
  }

  private initializeDefaultPanels(): void {
    const defaultPanels: PanelWindowState[] = [
      {
        id: 'panel-outliner',
        title: 'Outliner',
        icon: '📦',
        position: { x: Math.max(20, window.innerWidth - 340), y: 52 },
        size: { width: 320, height: 320 },
        dockZone: 'floating',
        isMinimized: false,
        zIndex: 21,
        prevFloating: {
          position: { x: Math.max(20, window.innerWidth - 340), y: 52 },
          size: { width: 320, height: 320 }
        }
      },
      {
        id: 'panel-inspector',
        title: 'Properties Inspector',
        icon: '⚙️',
        position: { x: Math.max(20, window.innerWidth - 340), y: 384 },
        size: { width: 320, height: 460 },
        dockZone: 'floating',
        isMinimized: false,
        zIndex: 22,
        prevFloating: {
          position: { x: Math.max(20, window.innerWidth - 340), y: 384 },
          size: { width: 320, height: 460 }
        }
      }
    ];

    for (const p of defaultPanels) {
      this.panels.set(p.id, p);
    }
  }

  public registerPanel(panel: PanelWindowState): void {
    if (!this.panels.has(panel.id)) {
      this.panels.set(panel.id, { ...panel });
      this.notifyLayoutChanged();
    }
  }

  public getPanel(id: string): PanelWindowState | undefined {
    return this.panels.get(id);
  }

  public getAllPanels(): PanelWindowState[] {
    return Array.from(this.panels.values());
  }

  public updatePanel(id: string, updates: Partial<PanelWindowState>): void {
    const existing = this.panels.get(id);
    if (!existing) return;

    if (existing.dockZone === 'floating' && updates.dockZone && updates.dockZone !== 'floating') {
      existing.prevFloating = {
        position: { ...existing.position },
        size: { ...existing.size }
      };
    }

    Object.assign(existing, updates);
    this.saveToLocalStorage();
    this.notifyLayoutChanged();
  }

  public bringToFront(id: string): void {
    const panel = this.panels.get(id);
    if (!panel) return;
    this.topZIndex += 1;
    panel.zIndex = this.topZIndex;
    this.notifyLayoutChanged();
  }

  public minimizePanel(id: string): void {
    const panel = this.panels.get(id);
    if (!panel) return;
    if (!panel.isMinimized) {
      if (panel.dockZone === 'floating') {
        panel.prevFloating = {
          position: { ...panel.position },
          size: { ...panel.size }
        };
      }
      panel.isMinimized = true;
      panel.dockZone = 'parked';
      this.saveToLocalStorage();
      this.notifyLayoutChanged();
    }
  }

  public restorePanel(id: string): void {
    const panel = this.panels.get(id);
    if (!panel) return;
    panel.isMinimized = false;
    panel.dockZone = 'floating';
    if (panel.prevFloating) {
      panel.position = { ...panel.prevFloating.position };
      panel.size = { ...panel.prevFloating.size };
    }
    this.bringToFront(id);
    this.saveToLocalStorage();
    this.notifyLayoutChanged();
  }

  public setDockZone(id: string, zone: DockZone): void {
    const panel = this.panels.get(id);
    if (!panel) return;
    this.updatePanel(id, { dockZone: zone, isMinimized: false });
  }

  public applyPreset(name: WorkspacePreset): void {
    this.activePreset = name;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (name === 'Default') {
      const outliner = this.panels.get('panel-outliner');
      if (outliner) {
        outliner.isMinimized = false;
        outliner.dockZone = 'dock-right';
        outliner.size = { width: 330, height: Math.floor((screenHeight - 80) * 0.45) };
        outliner.position = { x: screenWidth - 330, y: 44 };
      }
      const inspector = this.panels.get('panel-inspector');
      if (inspector) {
        inspector.isMinimized = false;
        inspector.dockZone = 'dock-right';
        inspector.size = { width: 330, height: Math.floor((screenHeight - 80) * 0.55) };
        inspector.position = { x: screenWidth - 330, y: 44 + Math.floor((screenHeight - 80) * 0.45) };
      }
    } else if (name === 'Sculpting') {
      for (const p of this.panels.values()) {
        p.isMinimized = true;
        p.dockZone = 'parked';
      }
    } else if (name === 'Technical') {
      const outliner = this.panels.get('panel-outliner');
      if (outliner) {
        outliner.isMinimized = false;
        outliner.dockZone = 'dock-left';
        outliner.size = { width: 320, height: screenHeight - 74 };
        outliner.position = { x: 0, y: 44 };
      }
      const inspector = this.panels.get('panel-inspector');
      if (inspector) {
        inspector.isMinimized = false;
        inspector.dockZone = 'dock-right';
        inspector.size = { width: 340, height: screenHeight - 74 };
        inspector.position = { x: screenWidth - 340, y: 44 };
      }
    }

    this.saveToLocalStorage();
    this.notifyLayoutChanged();
  }

  public saveToLocalStorage(): void {
    try {
      const data = {
        activePreset: this.activePreset,
        panels: Array.from(this.panels.entries())
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save workspace layout to localStorage', e);
    }
  }

  public loadFromLocalStorage(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.activePreset) this.activePreset = parsed.activePreset;
        if (Array.isArray(parsed.panels)) {
          for (const [id, state] of parsed.panels) {
            this.panels.set(id, state);
          }
          this.notifyLayoutChanged();
          return true;
        }
      }
    } catch (e) {
      console.warn('Failed to load workspace layout from localStorage', e);
    }
    return false;
  }

  private notifyLayoutChanged(): void {
    this.dispatchEvent(new CustomEvent('layout-changed', {
      detail: {
        panels: this.getAllPanels(),
        activePreset: this.activePreset
      }
    }));
  }
}

