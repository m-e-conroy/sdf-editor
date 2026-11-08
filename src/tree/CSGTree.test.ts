import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { CSGTree } from './CSGTree';

describe('CSGTree', () => {
  let tree: CSGTree;

  beforeEach(() => {
    // Arrange: Create fresh default scene
    tree = new CSGTree();
  });

  describe('createDefaultNode', () => {
    it('should create a default sphere node with expected initial properties', () => {
      // Act
      const node = CSGTree.createDefaultNode('sphere');

      // Assert
      expect(node.id).toMatch(/^node_[a-z0-9]+$/);
      expect(node.name).toBe('Sphere');
      expect(node.kind).toBe('primitive');
      expect(node.visible).toBe(true);
      expect(node.transform.position).toEqual([0, 0, 0]);
      expect(node.transform.rotation).toEqual([0, 0, 0]);
      expect(node.transform.scale).toEqual([1, 1, 1]);
      expect(node.primitive.type).toBe('sphere');
      expect(node.primitive.dimensions.radius).toBe(0.8);
      expect(node.csg.operation).toBe('union');
      expect(node.csg.blendMode).toBe('hard');
      expect(node.csg.blendRadius).toBe(0.0);
      expect(node.material.color).toBe('#e2e8f0');
      expect(node.children).toEqual([]);
    });

    it('should accept custom name and primitive type', () => {
      // Act
      const node = CSGTree.createDefaultNode('cylinder', 'My Cylinder');

      // Assert
      expect(node.name).toBe('My Cylinder');
      expect(node.primitive.type).toBe('cylinder');
    });
  });

  describe('createDefaultScene', () => {
    it('should build a root group with a Box and Cutter Sphere child', () => {
      // Act
      const root = CSGTree.createDefaultScene();

      // Assert
      expect(root.kind).toBe('group');
      expect(root.name).toBe('Root Union');
      expect(root.children).toHaveLength(1);

      const box = root.children[0];
      expect(box.name).toBe('Base Box');
      expect(box.primitive.type).toBe('box');
      expect(box.children).toHaveLength(1);

      const cutter = box.children[0];
      expect(cutter.name).toBe('Cutter Sphere');
      expect(cutter.primitive.type).toBe('sphere');
      expect(cutter.csg.operation).toBe('difference');
      expect(cutter.csg.blendMode).toBe('smooth_polynomial');
      expect(cutter.csg.blendRadius).toBe(0.12);
    });
  });

  describe('Tree Manipulation', () => {
    it('should find existing node by id at root or deep hierarchy', () => {
      // Arrange
      const rootId = tree.root.id;
      const box = tree.root.children[0];
      const cutter = box.children[0];

      // Act & Assert
      expect(tree.findNode(rootId)).toBe(tree.root);
      expect(tree.findNode(box.id)).toBe(box);
      expect(tree.findNode(cutter.id)).toBe(cutter);
      expect(tree.findNode('non_existent_id')).toBeNull();
    });

    it('should find parent node by child id', () => {
      // Arrange
      const box = tree.root.children[0];
      const cutter = box.children[0];

      // Act & Assert
      expect(tree.findParent(box.id)).toBe(tree.root);
      expect(tree.findParent(cutter.id)).toBe(box);
      expect(tree.findParent(tree.root.id)).toBeNull();
      expect(tree.findParent('non_existent_id')).toBeNull();
    });

    it('should add child node to root when parentId is not specified', () => {
      // Arrange
      const newNode = CSGTree.createDefaultNode('torus', 'New Torus');

      // Act
      const result = tree.addNode(newNode);

      // Assert
      expect(result).toBe(true);
      expect(tree.findNode(newNode.id)).toBe(newNode);
      expect(tree.root.children).toContain(newNode);
    });

    it('should add child node to specified parent id', () => {
      // Arrange
      const box = tree.root.children[0];
      const torus = CSGTree.createDefaultNode('torus', 'Torus in Box');

      // Act
      const result = tree.addNode(torus, box.id);

      // Assert
      expect(result).toBe(true);
      expect(box.children).toContain(torus);
    });

    it('should return false when adding to non-existent parent id', () => {
      // Arrange
      const newNode = CSGTree.createDefaultNode('plane');

      // Act
      const result = tree.addNode(newNode, 'invalid_parent_id');

      // Assert
      expect(result).toBe(false);
    });

    it('should remove node by id', () => {
      // Arrange
      const box = tree.root.children[0];
      const cutter = box.children[0];

      // Act
      const result = tree.removeNode(cutter.id);

      // Assert
      expect(result).toBe(true);
      expect(tree.findNode(cutter.id)).toBeNull();
      expect(box.children).not.toContain(cutter);
    });

    it('should return false when attempting to remove root node', () => {
      // Act
      const result = tree.removeNode(tree.root.id);

      // Assert
      expect(result).toBe(false);
      expect(tree.root).toBeDefined();
    });

    it('should return false when removing non-existent node', () => {
      // Act
      const result = tree.removeNode('ghost_node');

      // Assert
      expect(result).toBe(false);
    });

    it('should reparent node to another parent and maintain position', () => {
      // Arrange
      const box = tree.root.children[0];
      const cutter = box.children[0];

      // Act: Reparent cutter from box to root
      const result = tree.reparentNode(cutter.id, tree.root.id);

      // Assert
      expect(result).toBe(true);
      expect(box.children).not.toContain(cutter);
      expect(tree.root.children).toContain(cutter);
      expect(tree.findParent(cutter.id)).toBe(tree.root);
    });

    it('should reparent node at specific index', () => {
      // Arrange
      const box = tree.root.children[0];
      const nodeA = CSGTree.createDefaultNode('sphere', 'Node A');
      const nodeB = CSGTree.createDefaultNode('sphere', 'Node B');
      tree.addNode(nodeA, box.id);
      tree.addNode(nodeB, box.id);

      // Act: Reparent nodeB to root at index 0
      const result = tree.reparentNode(nodeB.id, tree.root.id, 0);

      // Assert
      expect(result).toBe(true);
      expect(tree.root.children[0]).toBe(nodeB);
    });

    it('should reject reparenting to itself or cycle parenting', () => {
      // Arrange
      const box = tree.root.children[0];
      const cutter = box.children[0];

      // Act & Assert
      expect(tree.reparentNode(box.id, box.id)).toBe(false);
      expect(tree.reparentNode(box.id, cutter.id)).toBe(false);
    });
  });

  describe('flattenWithTransforms', () => {
    it('should flatten tree in depth-first order, skipping group nodes', () => {
      // Act: default scene has root (group), box (primitive), cutter (primitive)
      const list = tree.flattenWithTransforms();

      // Assert: only box and cutter are primitives
      expect(list).toHaveLength(2);
      expect(list[0].node.name).toBe('Base Box');
      expect(list[1].node.name).toBe('Cutter Sphere');
    });

    it('should compute world matrix and inverse world matrix correctly', () => {
      // Arrange: Box at [1, 2, 3], scale [2, 2, 2]
      const box = tree.root.children[0];
      box.transform.position = [1, 2, 3];
      box.transform.scale = [2, 2, 2];

      // Act
      const list = tree.flattenWithTransforms();
      const boxItem = list[0];

      // Assert world matrix position translation
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(boxItem.worldMatrix);
      expect(position.x).toBeCloseTo(1);
      expect(position.y).toBeCloseTo(2);
      expect(position.z).toBeCloseTo(3);

      // Assert inverse matrix satisfies M * M^-1 = Identity
      const identityTest = new THREE.Matrix4().multiplyMatrices(
        boxItem.worldMatrix,
        boxItem.inverseWorldMatrix
      );
      const identity = new THREE.Matrix4().identity();
      for (let i = 0; i < 16; i++) {
        expect(identityTest.elements[i]).toBeCloseTo(identity.elements[i], 4);
      }
    });

    it('should accumulate hierarchical transforms from parent to child', () => {
      // Arrange: Box at [1, 0, 0], Cutter at [0, 2, 0] relative to box
      const box = tree.root.children[0];
      box.transform.position = [1, 0, 0];
      const cutter = box.children[0];
      cutter.transform.position = [0, 2, 0];

      // Act
      const list = tree.flattenWithTransforms();
      const cutterItem = list[1];

      // Assert: Cutter world position should be [1, 2, 0]
      const cutterPos = new THREE.Vector3();
      cutterPos.setFromMatrixPosition(cutterItem.worldMatrix);
      expect(cutterPos.x).toBeCloseTo(1);
      expect(cutterPos.y).toBeCloseTo(2);
      expect(cutterPos.z).toBeCloseTo(0);
    });

    it('should skip invisible nodes and their descendants', () => {
      // Arrange
      const box = tree.root.children[0];
      box.visible = false;

      // Act
      const list = tree.flattenWithTransforms();

      // Assert
      expect(list).toHaveLength(0);
    });
  });

  describe('Serialization and Deserialization (toJSON / fromJSON)', () => {
    it('should serialize tree to a valid SDFSceneDocument', () => {
      // Act
      const doc = tree.toJSON();

      // Assert
      expect(doc.version).toBe('1.0.0');
      expect(doc.metadata.name).toBe('SDF Studio Scene');
      expect(doc.metadata.generator).toBe('SDF Studio 3D');
      expect(doc.environment.backgroundColor).toBe('#121212');
      expect(doc.rootNode.id).toBe(tree.root.id);
      expect(doc.rootNode.children).toHaveLength(1);
    });

    it('should restore tree from SDFSceneDocument via fromJSON', () => {
      // Arrange
      const serialized = tree.toJSON();
      const newTree = new CSGTree(CSGTree.createDefaultNode('box', 'Empty Root'));

      // Act
      newTree.fromJSON(serialized);

      // Assert
      expect(newTree.root.id).toBe(tree.root.id);
      expect(newTree.root.name).toBe(tree.root.name);
      expect(newTree.root.children[0].name).toBe('Base Box');
      expect(newTree.root.children[0].children[0].name).toBe('Cutter Sphere');
    });

    it('should produce a deep clone in toJSON without shared references', () => {
      // Arrange
      const doc = tree.toJSON();

      // Act: modify original tree
      tree.root.name = 'Modified Name';

      // Assert: serialized document remains unchanged
      expect(doc.rootNode.name).toBe('Root Union');
    });
  });
});
