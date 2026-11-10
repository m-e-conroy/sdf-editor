// ========================================================================
// SDF Studio 3D - Scene Store with Command Pattern, Transactions & Revision
// ========================================================================

import * as THREE from 'three';
import { CSGTree } from '../tree/CSGTree';
import type { SDFNode, SDFSceneDocument } from '../tree/types';
import { validateSceneLimits, countLeaves, MAX_LEAVES } from '../engine/SceneLimits';

export interface Command {
  name: string;
  execute(): void;
  undo(): void;
  /** Absorbs an immediately following command so repeated edits collapse into one; returns false to keep both. */
  mergeWith?(next: Command): boolean;
}

export class CompositeCommand implements Command {
  public name: string;
  public commands: Command[];

  constructor(name: string, commands: Command[] = []) {
    this.name = name;
    this.commands = commands;
  }

  public add(command: Command): void {
    const last = this.commands[this.commands.length - 1];
    if (last?.mergeWith?.(command)) return;
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

class UpdateNodeCommand implements Command {
  constructor(
    public name: string,
    private node: SDFNode,
    private prev: Partial<SDFNode>,
    private next: Partial<SDFNode>
  ) {}

  public execute(): void {
    Object.assign(this.node, this.next);
  }

  public undo(): void {
    Object.assign(this.node, this.prev);
  }

  public mergeWith(command: Command): boolean {
    if (!(command instanceof UpdateNodeCommand) || command.node !== this.node) return false;
    this.next = { ...this.next, ...command.next };
    return true;
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

  // Open pointer gesture (gizmo drag, slider scrub) collecting edits into one undo step
  private activeGesture: CompositeCommand | null = null;

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

    // Keep external batches (e.g. agent recipes) out of the user's in-progress gesture
    const interruptedGesture = this.activeGesture?.name ?? null;
    if (interruptedGesture !== null) this.endGesture();

    const composite = new CompositeCommand(name);
    this.currentTransaction = composite;
    try {
      fn();
    } finally {
      this.currentTransaction = null;
    }

    if (composite.commands.length > 0) {
      this.pushHistory(composite);
      this.revision++;
      this.notifySceneChanged();
    }

    if (interruptedGesture !== null) this.beginGesture(interruptedGesture);
  }

  /**
   * Starts a continuous edit (gizmo drag, slider scrub). Every mutation until endGesture()
   * still applies and notifies immediately, but they are recorded as a single undo step.
   */
  public beginGesture(name: string): void {
    if (this.activeGesture) this.endGesture();
    this.activeGesture = new CompositeCommand(name);
  }

  public endGesture(): void {
    const gesture = this.activeGesture;
    if (!gesture) return;
    this.activeGesture = null;
    if (gesture.commands.length > 0) {
      this.pushHistory(gesture);
      this.saveToLocalStorage();
    }
  }

  public isGestureActive(): boolean {
    return this.activeGesture !== null;
  }

  private pushHistory(command: Command): void {
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo on new action
    this.notifyHistoryChanged();
  }

  public execute(command: Command): void {
    if (this.currentTransaction) {
      // Execute mutation immediately to maintain state during transaction
      command.execute();
      this.currentTransaction.add(command);
      return;
    }

    command.execute();
    if (this.activeGesture) {
      this.activeGesture.add(command);
    } else {
      this.pushHistory(command);
    }
    this.revision++;
    this.notifySceneChanged();
  }

  public undo(): boolean {
    this.endGesture();
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
    this.endGesture();
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

    // Snapshots exclude children so undo never swaps live child objects for stale copies
    const { children: _children, ...current } = node;
    const { children: _ignored, ...changes } = updates;
    const prevSnapshot: Partial<SDFNode> = JSON.parse(JSON.stringify(current));
    const newSnapshot: Partial<SDFNode> = { ...prevSnapshot, ...changes };

    this.execute(new UpdateNodeCommand(`Update ${node.name}`, node, prevSnapshot, newSnapshot));
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

  public createGroup(name: string = 'Group', parentId?: string, wrapNodeIds?: string[]): SDFNode {
    const pId = parentId || this.tree.root.id;
    const parent = this.tree.findNode(pId) || this.tree.root;

    const groupNode: SDFNode = {
      id: 'group_' + Math.random().toString(36).substring(2, 9),
      name,
      kind: 'group',
      visible: true,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      primitive: {
        type: 'sphere',
        dimensions: {}
      },
      csg: {
        operation: 'union',
        blendMode: 'hard',
        blendRadius: 0.0
      },
      material: {
        color: '#e2e8f0',
        roughness: 0.35,
        metalness: 0.1
      },
      children: []
    };

    if (wrapNodeIds && wrapNodeIds.length > 0) {
      this.transaction(`Group ${wrapNodeIds.length} Objects`, () => {
        const firstWrap = this.tree.findNode(wrapNodeIds[0]);
        const wrapParent = firstWrap ? this.tree.findParent(firstWrap.id) : parent;
        const targetParent = wrapParent || parent;
        const insertIdx = firstWrap ? targetParent.children.findIndex((c) => c.id === firstWrap.id) : targetParent.children.length;

        this.execute({
          name: `Create Group ${groupNode.name}`,
          execute: () => {
            targetParent.children.splice(insertIdx, 0, groupNode);
            this.selectedNodeId = groupNode.id;
          },
          undo: () => {
            const idx = targetParent.children.findIndex((c) => c.id === groupNode.id);
            if (idx !== -1) targetParent.children.splice(idx, 1);
          }
        });

        for (const nodeId of wrapNodeIds) {
          this.reparentNode(nodeId, groupNode.id);
        }

        this.selectedNodeId = groupNode.id;
      });
    } else {
      this.addNode(groupNode, pId);
    }

    return groupNode;
  }

  public ungroupNode(groupId: string): boolean {
    if (this.tree.root.id === groupId) return false;
    const group = this.tree.findNode(groupId);
    const parent = this.tree.findParent(groupId);
    if (!group || group.kind !== 'group' || !parent) return false;

    const savedGroup = JSON.parse(JSON.stringify(group)) as SDFNode;
    const gIdx = parent.children.findIndex((c) => c.id === groupId);

    const matG = new THREE.Matrix4().compose(
      new THREE.Vector3(...group.transform.position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...group.transform.rotation, 'XYZ')),
      new THREE.Vector3(...group.transform.scale)
    );

    const childrenWithTransforms: SDFNode[] = group.children.map((child) => {
      const cloned = JSON.parse(JSON.stringify(child)) as SDFNode;
      const matC = new THREE.Matrix4().compose(
        new THREE.Vector3(...child.transform.position),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...child.transform.rotation, 'XYZ')),
        new THREE.Vector3(...child.transform.scale)
      );
      const combined = new THREE.Matrix4().multiplyMatrices(matG, matC);
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      combined.decompose(pos, quat, scale);
      const euler = new THREE.Euler().setFromQuaternion(quat, 'XYZ');
      cloned.transform.position = [pos.x, pos.y, pos.z];
      cloned.transform.rotation = [euler.x, euler.y, euler.z];
      cloned.transform.scale = [scale.x, scale.y, scale.z];
      return cloned;
    });

    this.execute({
      name: `Ungroup ${group.name}`,
      execute: () => {
        const p = this.tree.findParent(groupId);
        if (!p) return;
        const curIdx = p.children.findIndex((c) => c.id === groupId);
        if (curIdx === -1) return;
        p.children.splice(curIdx, 1, ...childrenWithTransforms);
        this.selectedNodeId = childrenWithTransforms.length > 0 ? childrenWithTransforms[0].id : p.id;
      },
      undo: () => {
        const p = this.tree.findNode(parent.id);
        if (!p) return;
        p.children = p.children.filter((c) => !childrenWithTransforms.some((child) => child.id === c.id));
        p.children.splice(gIdx, 0, JSON.parse(JSON.stringify(savedGroup)));
        this.selectedNodeId = groupId;
      }
    });

    return true;
  }

  public moveNodeOrder(nodeId: string, direction: 'up' | 'down'): boolean {
    if (this.tree.root.id === nodeId) return false;
    const parent = this.tree.findParent(nodeId);
    if (!parent) return false;

    const idx = parent.children.findIndex((c) => c.id === nodeId);
    if (idx === -1) return false;
    if (direction === 'up' && idx <= 0) return false;
    if (direction === 'down' && idx >= parent.children.length - 1) return false;

    this.execute({
      name: `Move ${direction === 'up' ? 'Up' : 'Down'}`,
      execute: () => {
        const p = this.tree.findParent(nodeId);
        if (!p) return;
        const curIdx = p.children.findIndex((c) => c.id === nodeId);
        if (curIdx === -1) return;
        const tIdx = direction === 'up' ? curIdx - 1 : curIdx + 1;
        if (tIdx < 0 || tIdx >= p.children.length) return;
        const temp = p.children[curIdx];
        p.children[curIdx] = p.children[tIdx];
        p.children[tIdx] = temp;
        this.selectedNodeId = nodeId;
      },
      undo: () => {
        const p = this.tree.findParent(nodeId);
        if (!p) return;
        const curIdx = p.children.findIndex((c) => c.id === nodeId);
        if (curIdx === -1) return;
        const tIdx = direction === 'up' ? curIdx + 1 : curIdx - 1;
        if (tIdx < 0 || tIdx >= p.children.length) return;
        const temp = p.children[curIdx];
        p.children[curIdx] = p.children[tIdx];
        p.children[tIdx] = temp;
        this.selectedNodeId = nodeId;
      }
    });

    return true;
  }

  public wrapSelectedInGroup(): SDFNode | null {
    const selected = this.getSelectedNode();
    if (!selected || selected.id === this.tree.root.id) {
      return this.createGroup('Group', this.tree.root.id);
    }
    return this.createGroup('Group', undefined, [selected.id]);
  }

  public ungroupSelected(): boolean {
    const selected = this.getSelectedNode();
    if (!selected || selected.kind !== 'group' || selected.id === this.tree.root.id) {
      return false;
    }
    return this.ungroupNode(selected.id);
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
    // Persisting the whole scene on every pointer tick is wasted work; endGesture() saves once
    if (!this.activeGesture) this.saveToLocalStorage();
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
      this.activeGesture = null;
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
