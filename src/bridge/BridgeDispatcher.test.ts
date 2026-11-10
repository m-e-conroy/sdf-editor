import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BridgeDispatcher } from './BridgeDispatcher';
import { AgentBridge } from './AgentBridge';
import { SceneStore } from '../store/SceneStore';
import { CSGTree } from '../tree/CSGTree';
import { ERROR_CODES, createRequestEnvelope } from '../../shared/protocol/envelope';
import type { RequestEnvelope, ResponseEnvelope } from '../../shared/protocol/envelope';

describe('BridgeDispatcher (MCP RPC Method Dispatcher)', () => {
  let bridge: AgentBridge;
  // Widen per-method result payloads to `any` for assertions
  let dispatcher: { dispatch(request: RequestEnvelope): Promise<ResponseEnvelope<any>> };
  let store: SceneStore;
  let sentResponses: any[] = [];

  beforeEach(() => {
    sentResponses = [];

    // Reset SceneStore singleton
    (SceneStore as any).instance = null;
    store = SceneStore.getInstance();
    store.tree.root = CSGTree.createDefaultScene();

    // Mock Bridge
    bridge = new AgentBridge();
    vi.spyOn(bridge, 'sendResponse').mockImplementation((res: any) => {
      sentResponses.push(res);
    });

    dispatcher = new BridgeDispatcher(bridge, store, null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return scene tree and metadata for scene.get', async () => {
    const req = createRequestEnvelope('r1', 'scene.get');
    const res = await dispatcher.dispatch(req);

    expect(res.ok).toBe(true);
    expect(res.result).toBeDefined();
    expect(res.result.revision).toBe(store.revision);
    expect(res.result.counts.leaves).toBeGreaterThan(0);
    expect(res.result.scene).toBeDefined();
  });

  it('should reject request with REVISION_CONFLICT if expectedRevision does not match', async () => {
    const currentRev = store.revision;
    const req = createRequestEnvelope('r2', 'scene.addPrimitive', { type: 'sphere' }, currentRev + 5);
    const res = await dispatcher.dispatch(req);

    expect(res.ok).toBe(false);
    expect(res.error?.code).toBe(ERROR_CODES.REVISION_CONFLICT);
    expect(res.error?.message).toContain('Revision conflict');
  });

  it('should add primitive, convert rotationDeg to radians, and increment revision', async () => {
    const initialRev = store.revision;
    const req = createRequestEnvelope('r3', 'scene.addPrimitive', {
      type: 'box',
      name: 'Test Box',
      position: [1, 2, 3],
      rotationDeg: [90, 0, 0]
    });

    const res = await dispatcher.dispatch(req);

    expect(res.ok).toBe(true);
    expect(res.result.nodeId).toBeDefined();
    expect(store.revision).toBe(initialRev + 1);

    const addedNode = store.tree.findNode(res.result.nodeId);
    expect(addedNode).toBeDefined();
    expect(addedNode?.name).toBe('Test Box');
    expect(addedNode?.transform.position).toEqual([1, 2, 3]);
    // 90 deg ~ PI/2
    expect(addedNode?.transform.rotation[0]).toBeCloseTo(Math.PI / 2, 4);
  });

  it('should create group and reparent wrapped nodes atomically', async () => {
    // Add two primitives first
    const p1 = CSGTree.createDefaultNode('sphere', 'Sphere 1');
    const p2 = CSGTree.createDefaultNode('box', 'Box 1');
    store.addNode(p1);
    store.addNode(p2);

    const req = createRequestEnvelope('r4', 'scene.createGroup', {
      name: 'Combined Group',
      wrapNodeIds: [p1.id, p2.id]
    });

    const res = await dispatcher.dispatch(req);

    expect(res.ok).toBe(true);
    expect(res.result.groupId).toBeDefined();

    const group = store.tree.findNode(res.result.groupId);
    expect(group).toBeDefined();
    expect(group?.kind).toBe('group');
    expect(group?.children.length).toBe(2);
    expect(group?.children[0].id).toBe(p1.id);
    expect(group?.children[1].id).toBe(p2.id);
  });

  it('should update node properties cleanly', async () => {
    const p = CSGTree.createDefaultNode('cylinder', 'Test Cylinder');
    store.addNode(p);

    const req = createRequestEnvelope('r5', 'scene.updateNode', {
      nodeId: p.id,
      name: 'Renamed Cylinder',
      position: [5, 5, 5],
      operation: 'difference'
    });

    const res = await dispatcher.dispatch(req);
    expect(res.ok).toBe(true);

    const updated = store.tree.findNode(p.id);
    expect(updated?.name).toBe('Renamed Cylinder');
    expect(updated?.transform.position).toEqual([5, 5, 5]);
    expect(updated?.csg.operation).toBe('difference');
  });

  it('should delete node and increment revision', async () => {
    const p = CSGTree.createDefaultNode('torus', 'To Delete');
    store.addNode(p);

    const req = createRequestEnvelope('r6', 'scene.deleteNode', { nodeId: p.id });
    const res = await dispatcher.dispatch(req);

    expect(res.ok).toBe(true);
    expect(res.result.deletedId).toBe(p.id);
    expect(store.tree.findNode(p.id)).toBeNull();
  });

  it('should duplicate node with optional offset', async () => {
    const p = CSGTree.createDefaultNode('capsule', 'To Duplicate');
    p.transform.position = [0, 1, 0];
    store.addNode(p);

    const req = createRequestEnvelope('r7', 'scene.duplicateNode', {
      nodeId: p.id,
      offset: [2, 0, 0]
    });

    const res = await dispatcher.dispatch(req);
    expect(res.ok).toBe(true);

    const duplicated = store.tree.findNode(res.result.newNodeId);
    expect(duplicated).toBeDefined();
    expect(duplicated?.id).not.toBe(p.id);
    expect(duplicated?.transform.position[0]).toBeCloseTo(2, 4);
    expect(duplicated?.transform.position[1]).toBeCloseTo(1, 4);
    expect(duplicated?.transform.position[2]).toBeCloseTo(0, 4);
  });

  it('should support undo / redo via scene.history', async () => {
    const p = CSGTree.createDefaultNode('sphere', 'Undoable Sphere');
    store.addNode(p);
    expect(store.tree.findNode(p.id)).toBeDefined();

    // Undo
    const undoReq = createRequestEnvelope('r8', 'scene.history', { action: 'undo', steps: 1 });
    const undoRes = await dispatcher.dispatch(undoReq);
    expect(undoRes.ok).toBe(true);
    expect(store.tree.findNode(p.id)).toBeNull();

    // Redo
    const redoReq = createRequestEnvelope('r9', 'scene.history', { action: 'redo', steps: 1 });
    const redoRes = await dispatcher.dispatch(redoReq);
    expect(redoRes.ok).toBe(true);
    expect(store.tree.findNode(p.id)).toBeDefined();
  });

  it('should query geometric bounds via query.bounds', async () => {
    const req = createRequestEnvelope('r10', 'query.bounds', { tight: false });
    const res = await dispatcher.dispatch(req);

    expect(res.ok).toBe(true);
    expect(res.result.min).toBeDefined();
    expect(res.result.max).toBeDefined();
    expect(res.result.size).toBeDefined();
    expect(res.result.center).toBeDefined();
  });

  it('should query signed distance samples via query.sampleDistance', async () => {
    const req = createRequestEnvelope('r11', 'query.sampleDistance', {
      points: [
        [0, 0, 0],
        [10, 10, 10]
      ]
    });
    const res = await dispatcher.dispatch(req);

    expect(res.ok).toBe(true);
    expect(res.result.samples.length).toBe(2);
    expect(typeof res.result.samples[0].distance).toBe('number');
  });

  it('should export shader code via export.shader', async () => {
    const req = createRequestEnvelope('r12', 'export.shader');
    const res = await dispatcher.dispatch(req);

    expect(res.ok).toBe(true);
    expect(res.result.format).toBe('glsl');
    expect(res.result.data).toContain('float map(');
  });

  it('should return error for unknown method', async () => {
    const req = createRequestEnvelope('r13', 'unknown.invalidMethod');
    const res = await dispatcher.dispatch(req);

    expect(res.ok).toBe(false);
    expect(res.error?.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});
