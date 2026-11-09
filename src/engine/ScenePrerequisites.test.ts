// ========================================================================
// SDF Studio 3D - Phase 0 Engine Prerequisites Unit Tests
// ========================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { SceneStore } from '../store/SceneStore';
import { CSGTree } from '../tree/CSGTree';
import { validateSceneLimits } from './SceneLimits';
import { SdfEvaluator, sminPolynomial, smaxPolynomial } from './cpu/SdfEvaluator';
import { SceneQueries } from './SceneQueries';
import { generateGLBBuffer, exportOBJBuffer, computeAutoBounds } from './MeshExporter';

describe('Task 0.1 & 0.2: CompositeCommand, Transactions & Monotonic Revision Counter', () => {
  let store: SceneStore;

  beforeEach(() => {
    (SceneStore as any).instance = null;
    store = SceneStore.getInstance();
    store.tree.root = CSGTree.createDefaultScene();
  });

  it('increments monotonic revision counter on mutations, undo, and redo', () => {
    const initialRev = store.revision;
    const node = CSGTree.createDefaultNode('cylinder', 'Test Cylinder');

    store.addNode(node);
    expect(store.revision).toBe(initialRev + 1);

    store.updateNode(node.id, { transform: { position: [1, 2, 3], rotation: [0, 0, 0], scale: [1, 1, 1] } });
    expect(store.revision).toBe(initialRev + 2);

    store.undo();
    expect(store.revision).toBe(initialRev + 3);

    store.redo();
    expect(store.revision).toBe(initialRev + 4);
  });

  it('batches multiple mutations during store.transaction() into a single undo step', () => {
    const revBefore = store.revision;

    store.transaction('Batch Insert Three Primitives', () => {
      const s1 = CSGTree.createDefaultNode('sphere', 'Sphere 1');
      const s2 = CSGTree.createDefaultNode('box', 'Box 2');
      const s3 = CSGTree.createDefaultNode('cylinder', 'Cylinder 3');

      store.addNode(s1);
      store.addNode(s2);
      store.addNode(s3);
    });

    // Revision should increment by 1 for the transaction
    expect(store.revision).toBe(revBefore + 1);

    // Tree should now have 3 new children under root
    expect(store.tree.root.children.some((c) => c.name === 'Sphere 1')).toBe(true);
    expect(store.tree.root.children.some((c) => c.name === 'Box 2')).toBe(true);
    expect(store.tree.root.children.some((c) => c.name === 'Cylinder 3')).toBe(true);

    // Single undo should reverse all 3 operations at once
    const undoSuccess = store.undo();
    expect(undoSuccess).toBe(true);
    expect(store.tree.root.children.some((c) => c.name === 'Sphere 1')).toBe(false);
    expect(store.tree.root.children.some((c) => c.name === 'Box 2')).toBe(false);
    expect(store.tree.root.children.some((c) => c.name === 'Cylinder 3')).toBe(false);

    // Redo brings all 3 back
    store.redo();
    expect(store.tree.root.children.some((c) => c.name === 'Sphere 1')).toBe(true);
  });

  it('supports nested transactions seamlessly', () => {
    store.transaction('Outer Transaction', () => {
      const s1 = CSGTree.createDefaultNode('sphere', 'Nested 1');
      store.addNode(s1);

      store.transaction('Inner Transaction', () => {
        const s2 = CSGTree.createDefaultNode('box', 'Nested 2');
        store.addNode(s2);
      });
    });

    expect(store.tree.root.children.some((c) => c.name === 'Nested 1')).toBe(true);
    expect(store.tree.root.children.some((c) => c.name === 'Nested 2')).toBe(true);

    store.undo();
    expect(store.tree.root.children.some((c) => c.name === 'Nested 1')).toBe(false);
    expect(store.tree.root.children.some((c) => c.name === 'Nested 2')).toBe(false);
  });
});

describe('Task 0.3: SceneLimits Validator', () => {
  it('validates scene limits and leaf counts', () => {
    const tree = new CSGTree();
    tree.root.children = [];

    for (let i = 0; i < 10; i++) {
      tree.root.children.push(CSGTree.createDefaultNode('sphere', `Sphere ${i}`));
    }

    const limits = validateSceneLimits(tree);
    expect(limits.valid).toBe(true);
    expect(limits.leafCount).toBe(10);
    expect(limits.depth).toBe(2);
    expect(limits.instructionCount).toBe(19);
  });

  it('rejects scenes exceeding MAX_LEAVES (32)', () => {
    const tree = new CSGTree();
    tree.root.children = [];

    for (let i = 0; i < 33; i++) {
      tree.root.children.push(CSGTree.createDefaultNode('sphere', `Sphere ${i}`));
    }

    const limits = validateSceneLimits(tree);
    expect(limits.valid).toBe(false);
    expect(limits.error).toContain('maximum leaf limit');
  });

  it('throws descriptive error in SceneStore when adding beyond MAX_LEAVES', () => {
    (SceneStore as any).instance = null;
    const store = SceneStore.getInstance();
    store.tree.root.children = [];

    for (let i = 0; i < 32; i++) {
      store.addNode(CSGTree.createDefaultNode('sphere', `Sphere ${i}`));
    }

    expect(() => {
      store.addNode(CSGTree.createDefaultNode('box', 'Overflow Node'));
    }).toThrow('Scene limit exceeded: Cannot add 1 primitive(s)');
  });
});

describe('Task 0.5: Unified CPU SdfEvaluator', () => {
  it('evaluates exact distance for canonical sphere', () => {
    const dims = { radius: 1.0 };
    // Origin is -radius
    expect(SdfEvaluator.evalPrimitive('sphere', 0, 0, 0, dims)).toBeCloseTo(-1.0, 5);
    // Point on surface is 0
    expect(SdfEvaluator.evalPrimitive('sphere', 1.0, 0, 0, dims)).toBeCloseTo(0.0, 5);
    // Point outside at distance 2.5 is +1.5
    expect(SdfEvaluator.evalPrimitive('sphere', 0, 2.5, 0, dims)).toBeCloseTo(1.5, 5);
  });

  it('evaluates exact distance for box', () => {
    const dims = { size: [1.0, 1.0, 1.0] as [number, number, number] };
    // Inside center is -1.0
    expect(SdfEvaluator.evalPrimitive('box', 0, 0, 0, dims)).toBeCloseTo(-1.0, 5);
    // On face (1, 0, 0) is 0
    expect(SdfEvaluator.evalPrimitive('box', 1.0, 0, 0, dims)).toBeCloseTo(0.0, 5);
    // Outside corner (2, 2, 2) is hypot(1, 1, 1) = sqrt(3) ~ 1.732
    expect(SdfEvaluator.evalPrimitive('box', 2.0, 2.0, 2.0, dims)).toBeCloseTo(Math.sqrt(3), 4);
  });

  it('evaluates polynomial smooth booleans sminPolynomial and smaxPolynomial', () => {
    const k = 0.2;
    const d1 = 0.0;
    const d2 = 0.0;
    // When d1 = d2, smooth minimum is d1 - k/4
    expect(sminPolynomial(d1, d2, k)).toBeCloseTo(-0.05, 4);

    // Difference smooth operator
    expect(smaxPolynomial(d1, d2, k)).toBeCloseTo(0.05, 4);
  });

  it('evaluates modifiers: rounding and shell thickness', () => {
    const node = CSGTree.createDefaultNode('box', 'Rounded Hollow Box');
    node.primitive.dimensions.size = [1.0, 1.0, 1.0];
    node.modifiers = {
      roundRadius: 0.1,
      shellThickness: 0.05
    };

    const invMat = new THREE.Matrix4().identity();
    const d = SdfEvaluator.evalNodeDistance([0, 0, 0], node, invMat);
    // Box center inside is -1.0, roundRadius subtracts 0.1 => -1.1.
    // Shell thickness evaluates abs(-1.1) - 0.05 = 1.05.
    expect(d).toBeCloseTo(1.05, 3);
  });
});

describe('Task 0.6: SceneQueries', () => {
  it('computes accurate bounds for scene primitives', () => {
    const tree = new CSGTree();
    const sphere = CSGTree.createDefaultNode('sphere');
    sphere.primitive.dimensions.radius = 1.5;
    sphere.transform.position = [2.0, 0, 0];
    tree.root.children = [sphere];

    const bounds = SceneQueries.getBounds(tree);
    expect(bounds.min[0]).toBeCloseTo(0.5, 3);
    expect(bounds.max[0]).toBeCloseTo(3.5, 3);
    expect(bounds.center[0]).toBeCloseTo(2.0, 3);
    expect(bounds.size[0]).toBeCloseTo(3.0, 3);
  });

  it('samples signed distance at multiple points', () => {
    const tree = new CSGTree();
    const sphere = CSGTree.createDefaultNode('sphere');
    sphere.primitive.dimensions.radius = 1.0;
    sphere.transform.position = [0, 0, 0];
    tree.root.children = [sphere];

    const result = SceneQueries.sampleDistance(tree, [
      [0, 0, 0],
      [1, 0, 0],
      [3, 0, 0]
    ]);

    expect(result.distances.length).toBe(3);
    expect(result.distances[0]).toBeCloseTo(-1.0, 4);
    expect(result.distances[1]).toBeCloseTo(0.0, 4);
    expect(result.distances[2]).toBeCloseTo(2.0, 4);
    expect(result.nearestNodeId).toBe(sphere.id);
  });

  it('estimates volume for a unit sphere (~4.188)', () => {
    const tree = new CSGTree();
    const sphere = CSGTree.createDefaultNode('sphere');
    sphere.primitive.dimensions.radius = 1.0;
    sphere.transform.position = [0, 0, 0];
    tree.root.children = [sphere];

    const vol = SceneQueries.estimateVolume(tree);
    const analyticSphereVol = (4.0 / 3.0) * Math.PI * Math.pow(1.0, 3); // ~4.188
    expect(vol.volume).toBeGreaterThan(3.5);
    expect(vol.volume).toBeLessThan(4.8);
    expect(vol.volume).toBeCloseTo(analyticSphereVol, 0);
    expect(vol.boundingBoxVolume).toBeCloseTo(8.0, 2);
  });
});

describe('Task 0.8: MeshExporter ArrayBuffer & Dynamic Auto Bounds', () => {
  it('generates a valid binary glTF (GLB) ArrayBuffer', () => {
    const pos = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const norm = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);

    const buffer = generateGLBBuffer(pos, norm, '#3b82f6');
    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBeGreaterThan(100);

    const dataView = new DataView(buffer);
    const magic = dataView.getUint32(0, true);
    expect(magic).toBe(0x46546c67); // 'glTF'
  });

  it('generates an OBJ ArrayBuffer', () => {
    const pos = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const norm = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);

    const buffer = exportOBJBuffer(pos, norm, 'Custom_Object');
    expect(buffer).toBeInstanceOf(ArrayBuffer);

    const text = new TextDecoder().decode(buffer);
    expect(text).toContain('o Custom_Object');
    expect(text).toContain('v 0.00000 0.00000 0.00000');
  });

  it('computes dynamic marching cubes bounds with 10% padding margin', () => {
    const tree = new CSGTree();
    const box = CSGTree.createDefaultNode('box');
    box.primitive.dimensions.size = [1.0, 1.0, 1.0]; // Extents [-1, 1]
    box.transform.position = [0, 0, 0];
    tree.root.children = [box];

    const autoBounds = computeAutoBounds(tree, 0.1);
    expect(autoBounds.min[0]).toBeCloseTo(-1.2, 2);
    expect(autoBounds.max[0]).toBeCloseTo(1.2, 2);
  });
});
