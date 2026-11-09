// ========================================================================
// SDF Studio 3D - Scene Store with Command Pattern, Transactions & Revision
// ========================================================================

import { CSGTree } from '../tree/CSGTree';
import type { SDFNode, SDFSceneDocument } from '../tree/types';
import { validateSceneLimits, countLeaves, MAX_LEAVES } from '../engine/SceneLimits';

export interface Command {
  name: string;
  execute(): void;
  undo(): void;
}

export class CompositeCommand implements Command {
  public name: string;
  public commands: Command[];

  constructor(name: string, commands: Command[] = []) {
    this.name = name;
    this.commands = commands;
  }

  public add(command: Command): void {
    this.commands.push(command);
  }

  public execute(): void {
    for (let i = 0; i < this.commands.length; i++) {
      this.commands[i].execute();
    }
  }

  public undo(): void {
    // Reverse order for proper undo stack semantics
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}

export class SceneStore extends EventTarget {
  private static instance: SceneStore | null = null;
  public tree: CSGTree;
  public selectedNodeId: string | null = null;

  // Monotonic revision counter: increments on every scene mutation, undo, or redo
  public revision: number = 0;

  // Command Pattern History Stack
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistory = 50;

  // Active transaction container
  private currentTransaction: CompositeCommand | null = null;

  private constructor() {
    super();
    this.tree = new CSGTree();
    // Default selection to first child if available
    if (this.tree.root.children.length > 0) {
      this.selectedNodeId = this.tree.root.children[0].id;
    }
  }

  public static getInstance(): SceneStore {
    if (!SceneStore.instance) {
      SceneStore.instance = new SceneStore();
    }
    return SceneStore.instance;
  }

  /**
   * Batches multiple mutations during fn() into a single CompositeCommand.
   * Ensures N atomic edits = 1 undo step and 1 revision increment.
   */
  public transaction(name: string, fn: () => void): void {
    if (this.currentTransaction) {
      // Nested transaction: participate in the existing parent transaction
      fn();
      return;
    }

    const composite = new CompositeCommand(name);
    this.currentTransaction = composite;
    try {
      fn();
    } finally {
      this.currentTransaction = null;
    }

    if (composite.commands.length > 0) {
      this.undoStack.push(composite);
      if (this.undoStack.length > this.maxHistory) {
        this.undoStack.shift();
      }
      this.redoStack = []; // Clear redo on new action
      this.revision++;
      this.notifySceneChanged();
      this.notifyHistoryChanged();
    }
  }

  public execute(command: Command): void {
    if (this.currentTransaction) {
      // Execute mutation immediately to maintain state during transaction
      command.execute();
      this.currentTransaction.add(command);
      return;
    }

    command.execute();
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo on new action
    this.revision++;
    this.notifySceneChanged();
    this.notifyHistoryChanged();
  }

  public undo(): boolean {
    const command = this.undoStack.pop();
    if (!command) return false;
    command.undo();
    this.redoStack.push(command);
    this.revision++;
    this.notifySceneChanged();
    this.notifyHistoryChanged();
    return true;
  }

  public redo(): boolean {
    const command = this.redoStack.pop();
    if (!command) return false;
    command.execute();
    this.undoStack.push(command);
    this.revision++;
    this.notifySceneChanged();
    this.notifyHistoryChanged();
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  // Node Mutations wrapped in Commands
  public addNode(node: SDFNode, parentId?: string): void {
    const pId = parentId || this.tree.root.id;
    const currentLimits = validateSceneLimits(this.tree);
    const leavesToAdd = countLeaves(node);

    if (currentLimits.leafCount + leavesToAdd > MAX_LEAVES) {
      throw new Error(
        `Scene limit exceeded: Cannot add ${leavesToAdd} primitive(s). Current: ${currentLimits.leafCount}/${MAX_LEAVES} max leaf primitives.`
      );
    }

    this.execute({
      name: `Add ${node.name}`,
      execute: () => {
        this.tree.addNode(node, pId);
        this.selectedNodeId = node.id;
      },
      undo: () => {
        this.tree.removeNode(node.id);
        this.selectedNodeId = pId;
      }
    });
  }

  public removeNode(id: string): void {
    const node = this.tree.findNode(id);
    const parent = this.tree.findParent(id);
    if (!node || !parent) return;

    const parentId = parent.id;
    const cloned = JSON.parse(JSON.stringify(node)) as SDFNode;

    this.execute({
      name: `Delete ${node.name}`,
      execute: () => {
        this.tree.removeNode(id);
        if (this.selectedNodeId === id) {
          this.selectedNodeId = parentId;
        }
      },
      undo: () => {
        this.tree.addNode(cloned, parentId);
        this.selectedNodeId = cloned.id;
      }
    });
  }

  public duplicateNode(nodeId: string): SDFNode | null {
    const node = this.tree.findNode(nodeId);
    const parent = this.tree.findParent(nodeId);
    if (!node || !parent) return null;

    const currentLimits = validateSceneLimits(this.tree);
    const leavesToAdd = countLeaves(node);
    if (currentLimits.leafCount + leavesToAdd > MAX_LEAVES) {
      throw new Error(
        `Scene limit exceeded: Duplication requires ${leavesToAdd} leaf primitive(s) (${currentLimits.leafCount + leavesToAdd}/${MAX_LEAVES} max).`
      );
    }

    let duplicatedNode: SDFNode | null = null;

    this.execute({
      name: `Duplicate ${node.name}`,
      execute: () => {
        duplicatedNode = this.tree.duplicateNode(nodeId);
        if (duplicatedNode) {
          this.selectedNodeId = (duplicatedNode as SDFNode).id;
        }
      },
      undo: () => {
        if (duplicatedNode) {
          this.tree.removeNode((duplicatedNode as SDFNode).id);
          this.selectedNodeId = nodeId;
        }
      }
    });

    return duplicatedNode;
  }

  public updateNode(id: string, updates: Partial<SDFNode>): void {
    const node = this.tree.findNode(id);
    if (!node) return;

    const prevSnapshot = JSON.parse(JSON.stringify(node));
    const newSnapshot = { ...prevSnapshot, ...updates };

    this.execute({
      name: `Update ${node.name}`,
      execute: () => {
        Object.assign(node, newSnapshot);
      },
      undo: () => {
        Object.assign(node, prevSnapshot);
      }
    });
  }

  public reparentNode(nodeId: string, newParentId: string, targetIndex?: number): void {
    const node = this.tree.findNode(nodeId);
    const oldParent = this.tree.findParent(nodeId);
    if (!node || !oldParent) return;

    const oldParentId = oldParent.id;
    const oldIndex = oldParent.children.findIndex((c) => c.id === nodeId);

    this.execute({
      name: `Reparent ${node.name}`,
      execute: () => {
        this.tree.reparentNode(nodeId, newParentId, targetIndex);
      },
      undo: () => {
        this.tree.reparentNode(nodeId, oldParentId, oldIndex);
      }
    });
  }

  public selectNode(id: string | null): void {
    if (this.selectedNodeId !== id) {
      this.selectedNodeId = id;
      this.dispatchEvent(new CustomEvent('selection-changed', { detail: { selectedId: id } }));
    }
  }

  public getSelectedNode(): SDFNode | null {
    return this.selectedNodeId ? this.tree.findNode(this.selectedNodeId) : null;
  }

  private notifySceneChanged(): void {
    this.dispatchEvent(
      new CustomEvent('scene-changed', {
        detail: { tree: this.tree, revision: this.revision }
      })
    );
    this.saveToLocalStorage();
  }

  private notifyHistoryChanged(): void {
    this.dispatchEvent(
      new CustomEvent('history-changed', {
        detail: { canUndo: this.canUndo(), canRedo: this.canRedo(), revision: this.revision }
      })
    );
  }

  public saveToLocalStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const json = JSON.stringify(this.tree.toJSON());
        localStorage.setItem('sdf_studio_active_scene', json);
      }
    } catch (e) {
      console.warn('Failed to save scene to localStorage', e);
    }
  }

  public loadFromLocalStorage(): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('sdf_studio_active_scene');
        if (saved) {
          const doc = JSON.parse(saved);
          this.tree.fromJSON(doc);
          this.revision++;
          this.notifySceneChanged();
          return true;
        }
      }
    } catch (e) {
      console.warn('Failed to load scene from localStorage', e);
    }
    return false;
  }

  public loadFromJSON(doc: SDFSceneDocument): void {
    if (doc && doc.rootNode) {
      this.tree.fromJSON(doc);
      this.undoStack = [];
      this.redoStack = [];
      this.revision++;
      if (this.tree.root.children.length > 0) {
        this.selectedNodeId = this.tree.root.children[0].id;
      } else {
        this.selectedNodeId = this.tree.root.id;
      }
      this.notifySceneChanged();
      this.notifyHistoryChanged();
    }
  }
}
