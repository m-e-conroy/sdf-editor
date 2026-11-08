import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SceneStore, type Command } from './SceneStore';
import { CSGTree } from '../tree/CSGTree';

describe('SceneStore', () => {
  let store: SceneStore;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    // Arrange mock localStorage
    mockStorage = {};
    const storageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        mockStorage[key] = String(val);
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
      length: 0,
      key: vi.fn(() => null)
    };
    vi.stubGlobal('localStorage', storageMock);

    // Reset singleton instance for isolated testing
    (SceneStore as any).instance = null;
    store = SceneStore.getInstance();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Singleton Pattern', () => {
    it('should always return the same instance', () => {
      // Act
      const instance1 = SceneStore.getInstance();
      const instance2 = SceneStore.getInstance();

      // Assert
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(store);
    });

    it('should initialize with default scene and select first child', () => {
      // Assert
      expect(store.tree).toBeInstanceOf(CSGTree);
      expect(store.tree.root.children.length).toBeGreaterThan(0);
      expect(store.selectedNodeId).toBe(store.tree.root.children[0].id);
    });
  });

  describe('Command Pattern: execute, undo, redo', () => {
    it('should execute command and push to undo stack', () => {
      // Arrange
      let state = 0;
      const command: Command = {
        name: 'Increment',
        execute: () => { state += 1; },
        undo: () => { state -= 1; }
      };

      // Act
      store.execute(command);

      // Assert
      expect(state).toBe(1);
      expect(store.canUndo()).toBe(true);
      expect(store.canRedo()).toBe(false);
    });

    it('should undo command and allow redo', () => {
      // Arrange
      let state = 10;
      const command: Command = {
        name: 'Add 5',
        execute: () => { state += 5; },
        undo: () => { state -= 5; }
      };
      store.execute(command);

      // Act: Undo
      const undoResult = store.undo();

      // Assert
      expect(undoResult).toBe(true);
      expect(state).toBe(10);
      expect(store.canUndo()).toBe(false);
      expect(store.canRedo()).toBe(true);

      // Act: Redo
      const redoResult = store.redo();

      // Assert
      expect(redoResult).toBe(true);
      expect(state).toBe(15);
      expect(store.canUndo()).toBe(true);
      expect(store.canRedo()).toBe(false);
    });

    it('should return false when undoing or redoing with empty stacks', () => {
      // Act & Assert
      expect(store.undo()).toBe(false);
      expect(store.redo()).toBe(false);
    });

    it('should clear redo stack when a new command is executed', () => {
      // Arrange
      let state = 0;
      const cmd1: Command = {
        name: 'Step 1',
        execute: () => { state = 1; },
        undo: () => { state = 0; }
      };
      const cmd2: Command = {
        name: 'Step 2',
        execute: () => { state = 2; },
        undo: () => { state = 1; }
      };
      store.execute(cmd1);
      store.undo();
      expect(store.canRedo()).toBe(true);

      // Act: Execute new command
      store.execute(cmd2);

      // Assert: Redo stack must be cleared
      expect(store.canRedo()).toBe(false);
      expect(state).toBe(2);
    });

    it('should truncate undo history at max limit (50 commands)', () => {
      // Arrange: execute 55 commands
      for (let i = 0; i < 55; i++) {
        store.execute({
          name: `Command ${i}`,
          execute: () => {},
          undo: () => {}
        });
      }

      // Assert: only 50 undos should be possible
      let undoCount = 0;
      while (store.canUndo()) {
        store.undo();
        undoCount++;
      }
      expect(undoCount).toBe(50);
    });
  });

  describe('Node Mutation Commands', () => {
    it('should add node with undo/redo capability and update selection', () => {
      // Arrange
      const torus = CSGTree.createDefaultNode('torus', 'Test Torus');

      // Act: Add node
      store.addNode(torus);

      // Assert
      expect(store.tree.findNode(torus.id)).toBe(torus);
      expect(store.selectedNodeId).toBe(torus.id);

      // Act: Undo
      store.undo();

      // Assert
      expect(store.tree.findNode(torus.id)).toBeNull();
      expect(store.selectedNodeId).toBe(store.tree.root.id);

      // Act: Redo
      store.redo();

      // Assert
      expect(store.tree.findNode(torus.id)).toBeDefined();
    });

    it('should remove node with undo/redo capability', () => {
      // Arrange
      const box = store.tree.root.children[0];
      const cutter = box.children[0];
      store.selectNode(cutter.id);

      // Act: Remove node
      store.removeNode(cutter.id);

      // Assert
      expect(store.tree.findNode(cutter.id)).toBeNull();
      expect(store.selectedNodeId).toBe(box.id);

      // Act: Undo
      store.undo();

      // Assert
      const restored = store.tree.findNode(cutter.id);
      expect(restored).not.toBeNull();
      expect(restored?.name).toBe('Cutter Sphere');
      expect(store.selectedNodeId).toBe(cutter.id);
    });

    it('should update node properties with undo/redo', () => {
      // Arrange
      const box = store.tree.root.children[0];
      const oldName = box.name;

      // Act: Update
      store.updateNode(box.id, { name: 'Renamed Box' });

      // Assert
      expect(box.name).toBe('Renamed Box');

      // Act: Undo
      store.undo();

      // Assert
      expect(box.name).toBe(oldName);

      // Act: Redo
      store.redo();
      expect(box.name).toBe('Renamed Box');
    });

    it('should reparent node with undo/redo preserving index', () => {
      // Arrange
      const box = store.tree.root.children[0];
      const cutter = box.children[0];

      // Act: Reparent cutter to root
      store.reparentNode(cutter.id, store.tree.root.id);

      // Assert
      expect(store.tree.findParent(cutter.id)).toBe(store.tree.root);

      // Act: Undo
      store.undo();

      // Assert
      expect(store.tree.findParent(cutter.id)).toBe(box);
    });
  });

  describe('Selection and Event Dispatching', () => {
    it('should dispatch scene-changed and history-changed events on execute and undo', () => {
      // Arrange
      const sceneChangedSpy = vi.fn();
      const historyChangedSpy = vi.fn();
      store.addEventListener('scene-changed', sceneChangedSpy);
      store.addEventListener('history-changed', historyChangedSpy);

      // Act: Execute command
      store.execute({
        name: 'Test Event',
        execute: () => {},
        undo: () => {}
      });

      // Assert
      expect(sceneChangedSpy).toHaveBeenCalledTimes(1);
      expect(historyChangedSpy).toHaveBeenCalledTimes(1);

      // Act: Undo
      store.undo();

      // Assert
      expect(sceneChangedSpy).toHaveBeenCalledTimes(2);
      expect(historyChangedSpy).toHaveBeenCalledTimes(2);
    });

    it('should dispatch selection-changed only when selectedNodeId changes', () => {
      // Arrange
      const selectionSpy = vi.fn();
      store.addEventListener('selection-changed', selectionSpy);
      const targetId = store.tree.root.id;

      // Act: Change selection
      store.selectNode(targetId);

      // Assert
      expect(selectionSpy).toHaveBeenCalledTimes(1);
      expect(store.selectedNodeId).toBe(targetId);
      expect(store.getSelectedNode()).toBe(store.tree.root);

      // Act: Select same node
      store.selectNode(targetId);

      // Assert: Should not fire event again
      expect(selectionSpy).toHaveBeenCalledTimes(1);
    });

    it('should save to localStorage and load from localStorage', () => {
      // Arrange
      const box = store.tree.root.children[0];
      box.name = 'Persisted Box';
      store.saveToLocalStorage();

      // Act
      (SceneStore as any).instance = null;
      const newStore = SceneStore.getInstance();
      const loaded = newStore.loadFromLocalStorage();

      // Assert
      expect(loaded).toBe(true);
      expect(newStore.tree.root.children[0].name).toBe('Persisted Box');
    });

    it('should load scene from SDFSceneDocument and reset history', () => {
      // Arrange
      const doc = store.tree.toJSON();
      store.execute({ name: 'Dummy', execute: () => {}, undo: () => {} });
      expect(store.canUndo()).toBe(true);

      // Act
      store.loadFromJSON(doc);

      // Assert
      expect(store.canUndo()).toBe(false);
      expect(store.canRedo()).toBe(false);
      expect(store.selectedNodeId).toBe(store.tree.root.children[0].id);
    });
  });
});

