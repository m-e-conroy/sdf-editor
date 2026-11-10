import { describe, it, expect } from 'vitest';
import { CSGTree } from './CSGTree';
import { SDFSceneDocument } from './types';
import { SdfEvaluator } from '../engine/cpu/SdfEvaluator';

describe('Migration v1 to v2', () => {
  it('migrates legacy v1 scene documents by hoisting primitive children into siblings', () => {
    // Construct legacy v1 document where Box has a child Sphere
    const v1Doc: SDFSceneDocument = {
      version: '1.0.0',
      metadata: {
        name: 'Legacy v1 Scene',
        author: 'User',
        createdAt: '2026-01-01T00:00:00.000Z',
        modifiedAt: '2026-01-01T00:00:00.000Z',
        generator: 'SDF Studio 3D'
      },
      environment: {
        backgroundColor: '#121212',
        ambientLight: 0.25,
        shadows: true,
        ambientOcclusion: true,
        matcapPreset: 'clay'
      },
      rootNode: {
        id: 'root',
        name: 'Root Union',
        kind: 'group',
        visible: true,
        transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        csg: { operation: 'union', blendMode: 'hard', blendRadius: 0 },
        material: { color: '#ffffff', roughness: 0.5, metalness: 0 },
        children: [
          {
            id: 'box_1',
            name: 'Base Box',
            kind: 'primitive',
            visible: true,
            transform: { position: [0.5, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
            primitive: { type: 'box', dimensions: { size: [0.5, 0.5, 0.5] } },
            csg: { operation: 'union', blendMode: 'hard', blendRadius: 0 },
            material: { color: '#e2e8f0', roughness: 0.35, metalness: 0.1 },
            children: [
              {
                id: 'sphere_cutter',
                name: 'Cutter Sphere',
                kind: 'primitive',
                visible: true,
                transform: { position: [0.2, 0.2, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                primitive: { type: 'sphere', dimensions: { radius: 0.4 } },
                csg: { operation: 'difference', blendMode: 'smooth_polynomial', blendRadius: 0.1 },
                material: { color: '#ff0000', roughness: 0.5, metalness: 0 },
                children: []
              }
            ]
          }
        ]
      }
    };

    const v2Doc = CSGTree.migrateV1toV2(v1Doc);
    expect(v2Doc.version).toBe('2.0.0');

    const rootChildren = v2Doc.rootNode.children;
    // The child 'sphere_cutter' should be hoisted to be a sibling of 'box_1' under root
    expect(rootChildren.length).toBe(2);
    expect(rootChildren[0].id).toBe('box_1');
    expect(rootChildren[0].children.length).toBe(0); // primitive leaves have no children in v2

    expect(rootChildren[1].id).toBe('sphere_cutter');
    // Its position was [0.2, 0.2, 0] local to box at [0.5, 0, 0] -> world [0.7, 0.2, 0]
    expect(rootChildren[1].transform.position[0]).toBeCloseTo(0.7, 4);
    expect(rootChildren[1].transform.position[1]).toBeCloseTo(0.2, 4);
    expect(rootChildren[1].transform.position[2]).toBeCloseTo(0.0, 4);
  });

  it('guarantees distance evaluation equivalence across 50 sample points between v1 and v2', () => {
    // Create a tree with nested v1 hierarchy
    const treeV1 = new CSGTree();
    treeV1.root.children = [];

    const parentBox = CSGTree.createDefaultNode('box', 'BoxParent');
    parentBox.transform.position = [0.4, 0.2, -0.1];
    parentBox.transform.rotation = [0.1, 0.2, 0.0];
    if (parentBox.primitive) parentBox.primitive.dimensions.size = [0.6, 0.6, 0.6];

    const childSphere = CSGTree.createDefaultNode('sphere', 'SphereChild');
    childSphere.transform.position = [0.1, 0.3, 0.2];
    childSphere.csg.operation = 'difference';
    childSphere.csg.blendMode = 'smooth_polynomial';
    childSphere.csg.blendRadius = 0.08;
    if (childSphere.primitive) childSphere.primitive.dimensions.radius = 0.45;

    parentBox.children.push(childSphere);
    treeV1.root.children.push(parentBox);

    // Get v1 document and migrate it to v2
    const v1Doc = treeV1.toJSON();
    v1Doc.version = '1.0.0';
    const v2Doc = CSGTree.migrateV1toV2(v1Doc);

    const treeV2 = new CSGTree();
    treeV2.fromJSON(v2Doc);

    // The v2 evaluator ignores primitive children, so express v1 semantics
    // (child in parent's local frame) as a group carrying the parent transform.
    const reference = new CSGTree();
    const frame = CSGTree.createGroupNode('BoxFrame');
    frame.transform = parentBox.transform;
    parentBox.transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
    parentBox.children = [];
    frame.children = [parentBox, childSphere];
    reference.root.children = [frame];

    // Verify distance evaluations match at 50 pseudo-random sample points
    for (let i = 0; i < 50; i++) {
      const px = ((i * 17) % 100) / 50.0 - 1.0;
      const py = ((i * 31) % 100) / 50.0 - 1.0;
      const pz = ((i * 43) % 100) / 50.0 - 1.0;
      const p: [number, number, number] = [px, py, pz];

      const d1 = SdfEvaluator.evalSceneDistance(p, reference);
      const d2 = SdfEvaluator.evalSceneDistance(p, treeV2);
      expect(Math.abs(d1 - d2)).toBeLessThan(0.0001);
    }
  });
});
