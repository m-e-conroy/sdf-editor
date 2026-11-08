import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { UniformPacker, MAX_GPU_NODES } from './UniformPacker';
import { CSGTree } from '../tree/CSGTree';
import type { PrimitiveType, SDFNode } from '../tree/types';

describe('UniformPacker', () => {
  let tree: CSGTree;

  beforeEach(() => {
    // Arrange: Create a clean tree with a group root
    const root = CSGTree.createDefaultNode('sphere', 'Root');
    root.kind = 'group';
    root.children = [];
    tree = new CSGTree(root);
  });

  describe('Primitive Type Mapping', () => {
    const allPrimitiveTypes: Array<{ type: PrimitiveType; expectedId: number }> = [
      { type: 'sphere', expectedId: 0 },
      { type: 'box', expectedId: 1 },
      { type: 'cylinder', expectedId: 2 },
      { type: 'torus', expectedId: 3 },
      { type: 'capsule', expectedId: 4 },
      { type: 'cone', expectedId: 5 },
      { type: 'pipe', expectedId: 6 },
      { type: 'hemisphere', expectedId: 7 },
      { type: 'ellipsoid', expectedId: 8 },
      { type: 'superellipsoid', expectedId: 9 },
      { type: 'pyramid', expectedId: 10 },
      { type: 'hexagonal_prism', expectedId: 11 },
      { type: 'triangular_prism', expectedId: 12 },
      { type: 'tetrahedron', expectedId: 13 },
      { type: 'octahedron', expectedId: 14 },
      { type: 'mandelbulb', expectedId: 15 },
      { type: 'pentagonal_pyramid', expectedId: 16 },
      { type: 'wedge', expectedId: 17 },
      { type: 'frustum', expectedId: 18 },
      { type: 'pentagonal_prism', expectedId: 19 },
      { type: 'plane', expectedId: 20 }
    ];

    it('should map every primitive type to its specific integer index', () => {
      allPrimitiveTypes.forEach(({ type, expectedId }) => {
        // Arrange
        const testTree = new CSGTree(CSGTree.createDefaultNode('sphere', 'Root'));
        testTree.root.kind = 'group';
        const node = CSGTree.createDefaultNode(type);
        testTree.root.children = [node];

        // Act
        const packed = UniformPacker.pack(testTree);

        // Assert
        expect(packed.nodeCount).toBe(1);
        expect(packed.types[0]).toBe(expectedId);
      });
    });
  });

  describe('CSG Configuration Packing', () => {
    it('should pack CSG operations correctly: union(0), difference(1), intersection(2)', () => {
      const ops = [
        { op: 'union', expected: 0 },
        { op: 'difference', expected: 1 },
        { op: 'intersection', expected: 2 }
      ] as const;

      ops.forEach(({ op, expected }) => {
        // Arrange
        const node = CSGTree.createDefaultNode('sphere');
        node.csg.operation = op;
        tree.root.children = [node];

        // Act
        const packed = UniformPacker.pack(tree);

        // Assert: csgConfig.x stores operation index
        expect(packed.csgConfig[0].x).toBe(expected);
      });
    });

    it('should pack blend modes correctly: hard(0), smooth_polynomial(1)', () => {
      // Arrange: Hard blend
      const nodeHard = CSGTree.createDefaultNode('box');
      nodeHard.csg.blendMode = 'hard';
      tree.root.children = [nodeHard];

      // Act
      let packed = UniformPacker.pack(tree);

      // Assert
      expect(packed.csgConfig[0].y).toBe(0);

      // Arrange: Smooth blend
      nodeHard.csg.blendMode = 'smooth_polynomial';
      nodeHard.csg.blendRadius = 0.25;

      // Act
      packed = UniformPacker.pack(tree);

      // Assert
      expect(packed.csgConfig[0].y).toBe(1);
      expect(packed.csgConfig[0].z).toBeCloseTo(0.25);
    });

    it('should pack roundRadius modifier into csgConfig.w', () => {
      // Arrange
      const node = CSGTree.createDefaultNode('box');
      node.modifiers = { roundRadius: 0.15 };
      tree.root.children = [node];

      // Act
      const packed = UniformPacker.pack(tree);

      // Assert
      expect(packed.csgConfig[0].w).toBeCloseTo(0.15);
    });
  });

  describe('Modifiers Packing', () => {
    it('should pack shellThickness into modifiers.x', () => {
      // Arrange
      const node = CSGTree.createDefaultNode('sphere');
      node.modifiers = { shellThickness: 0.05 };
      tree.root.children = [node];

      // Act
      const packed = UniformPacker.pack(tree);

      // Assert
      expect(packed.modifiers[0].x).toBeCloseTo(0.05);
    });

    it('should pack twist / twistFactor into modifiers.y', () => {
      // Arrange
      const node = CSGTree.createDefaultNode('cylinder');
      node.modifiers = { twist: 1.5 };
      tree.root.children = [node];

      // Act
      const packed = UniformPacker.pack(tree);

      // Assert
      expect(packed.modifiers[0].y).toBeCloseTo(1.5);
    });

    it('should pack mirrorAxis into modifiers.z: none(0), x(1), y(2), z(3)', () => {
      const axes = [
        { axis: 'none', expected: 0.0 },
        { axis: 'x', expected: 1.0 },
        { axis: 'y', expected: 2.0 },
        { axis: 'z', expected: 3.0 }
      ] as const;

      axes.forEach(({ axis, expected }) => {
        // Arrange
        const node = CSGTree.createDefaultNode('torus');
        node.modifiers = { mirrorAxis: axis };
        tree.root.children = [node];

        // Act
        const packed = UniformPacker.pack(tree);

        // Assert
        expect(packed.modifiers[0].z).toBe(expected);
      });
    });
  });

  describe('Primitive Dimensions Packing', () => {
    it('should pack sphere radius into dimensions.x', () => {
      const node = CSGTree.createDefaultNode('sphere');
      node.primitive.dimensions.radius = 1.25;
      tree.root.children = [node];

      const packed = UniformPacker.pack(tree);
      expect(packed.dimensions[0].x).toBeCloseTo(1.25);
    });

    it('should pack box size into dimensions.xyz', () => {
      const node = CSGTree.createDefaultNode('box');
      node.primitive.dimensions.size = [0.4, 0.5, 0.6];
      tree.root.children = [node];

      const packed = UniformPacker.pack(tree);
      expect(packed.dimensions[0].x).toBeCloseTo(0.4);
      expect(packed.dimensions[0].y).toBeCloseTo(0.5);
      expect(packed.dimensions[0].z).toBeCloseTo(0.6);
    });

    it('should pack cylinder height and radius into dimensions.xy', () => {
      const node = CSGTree.createDefaultNode('cylinder');
      node.primitive.dimensions.height = 1.1;
      node.primitive.dimensions.radius = 0.45;
      tree.root.children = [node];

      const packed = UniformPacker.pack(tree);
      expect(packed.dimensions[0].x).toBeCloseTo(1.1);
      expect(packed.dimensions[0].y).toBeCloseTo(0.45);
    });

    it('should pack torus radiusMajor and radiusMinor into dimensions.xy', () => {
      const node = CSGTree.createDefaultNode('torus');
      node.primitive.dimensions.radiusMajor = 0.9;
      node.primitive.dimensions.radiusMinor = 0.3;
      tree.root.children = [node];

      const packed = UniformPacker.pack(tree);
      expect(packed.dimensions[0].x).toBeCloseTo(0.9);
      expect(packed.dimensions[0].y).toBeCloseTo(0.3);
    });

    it('should pack pipe height, radius, thickness into dimensions.xyz', () => {
      const node = CSGTree.createDefaultNode('pipe');
      node.primitive.dimensions.height = 1.0;
      node.primitive.dimensions.radius = 0.6;
      node.primitive.dimensions.thickness = 0.12;
      tree.root.children = [node];

      const packed = UniformPacker.pack(tree);
      expect(packed.dimensions[0].x).toBeCloseTo(1.0);
      expect(packed.dimensions[0].y).toBeCloseTo(0.6);
      expect(packed.dimensions[0].z).toBeCloseTo(0.12);
    });
  });

  describe('Materials Packing', () => {
    it('should convert hex color to normalized RGB and pack roughness', () => {
      const node = CSGTree.createDefaultNode('sphere');
      node.material.color = '#ff8000';
      node.material.roughness = 0.65;
      tree.root.children = [node];

      const packed = UniformPacker.pack(tree);
      const color = new THREE.Color('#ff8000');

      expect(packed.materials[0].x).toBeCloseTo(color.r);
      expect(packed.materials[0].y).toBeCloseTo(color.g);
      expect(packed.materials[0].z).toBeCloseTo(color.b);
      expect(packed.materials[0].w).toBeCloseTo(0.65);
    });
  });

  describe('Array Bounds and Clamping at MAX_GPU_NODES (32)', () => {
    it('should always return uniform arrays with fixed length of 32', () => {
      // Arrange: 1 node in tree
      tree.root.children = [CSGTree.createDefaultNode('sphere')];

      // Act
      const packed = UniformPacker.pack(tree);

      // Assert
      expect(packed.nodeCount).toBe(1);
      expect(packed.inverseMatrices).toHaveLength(MAX_GPU_NODES);
      expect(packed.types).toHaveLength(MAX_GPU_NODES);
      expect(packed.dimensions).toHaveLength(MAX_GPU_NODES);
      expect(packed.csgConfig).toHaveLength(MAX_GPU_NODES);
      expect(packed.modifiers).toHaveLength(MAX_GPU_NODES);
      expect(packed.materials).toHaveLength(MAX_GPU_NODES);
    });

    it('should fill unused slots beyond nodeCount with default padding', () => {
      // Arrange: Empty scene (0 primitive nodes)
      tree.root.children = [];

      // Act
      const packed = UniformPacker.pack(tree);

      // Assert
      expect(packed.nodeCount).toBe(0);
      expect(packed.types[0]).toBe(0);
      expect(packed.dimensions[0].equals(new THREE.Vector4(0, 0, 0, 0))).toBe(true);
      expect(packed.csgConfig[0].equals(new THREE.Vector4(0, 0, 0, 0))).toBe(true);
      expect(packed.modifiers[0].equals(new THREE.Vector4(0, 0, 0, 0))).toBe(true);
      expect(packed.materials[0].equals(new THREE.Vector4(0.8, 0.8, 0.8, 0.5))).toBe(true);
      expect(packed.inverseMatrices[0].equals(new THREE.Matrix4().identity())).toBe(true);
    });

    it('should clamp nodeCount at MAX_GPU_NODES (32) when tree exceeds 32 nodes', () => {
      // Arrange: Create 40 nodes
      const nodes: SDFNode[] = [];
      for (let i = 0; i < 40; i++) {
        nodes.push(CSGTree.createDefaultNode('sphere', `Sphere ${i}`));
      }
      tree.root.children = nodes;

      // Act
      const packed = UniformPacker.pack(tree);

      // Assert
      expect(packed.nodeCount).toBe(MAX_GPU_NODES);
      expect(packed.types).toHaveLength(MAX_GPU_NODES);
      expect(packed.inverseMatrices).toHaveLength(MAX_GPU_NODES);
    });
  });
});

