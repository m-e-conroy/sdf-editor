import * as THREE from 'three';
import { SDFNode, PrimitiveType, SDFSceneDocument } from './types';

export class CSGTree {
  public root: SDFNode;

  constructor(root?: SDFNode) {
    this.root = root || CSGTree.createDefaultScene();
  }

  public static createDefaultNode(type: PrimitiveType = 'sphere', name?: string): SDFNode {
    const id = 'node_' + Math.random().toString(36).substring(2, 9);
    const nodeName = name || (type.charAt(0).toUpperCase() + type.slice(1));

    return {
      id,
      name: nodeName,
      kind: 'primitive',
      visible: true,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      primitive: {
        type,
        dimensions: {
          radius: 0.8,
          size: [0.7, 0.7, 0.7],
          height: 0.8,
          radiusMajor: 0.7,
          radiusMinor: 0.25,
          thickness: 0.08,
          radii: [0.8, 0.6, 0.5],
          arcAngle: Math.PI / 2,
          linkLength: 0.6,
          chamfer: 0.08,
          tipRadius: 0.25,
          innerRadius: 0.35,
          outerRadius: 0.75
        }
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
  }

  public static createDefaultScene(): SDFNode {
    const root = this.createDefaultNode('sphere', 'Root Union');
    root.kind = 'group';

    // Add a default shape: Box with a subtracted Sphere to demonstrate CSG
    const box = this.createDefaultNode('box', 'Base Box');
    box.transform.position = [0, 0, 0];
    box.primitive.dimensions.size = [0.75, 0.75, 0.75];

    const cutter = this.createDefaultNode('sphere', 'Cutter Sphere');
    cutter.transform.position = [0.35, 0.35, 0.35];
    cutter.primitive.dimensions.radius = 0.65;
    cutter.csg.operation = 'difference';
    cutter.csg.blendMode = 'smooth_polynomial';
    cutter.csg.blendRadius = 0.12;

    box.children.push(cutter);
    root.children.push(box);

    return root;
  }

  public findNode(id: string, current: SDFNode = this.root): SDFNode | null {
    if (current.id === id) return current;
    for (const child of current.children) {
      const found = this.findNode(id, child);
      if (found) return found;
    }
    return null;
  }

  public findParent(id: string, current: SDFNode = this.root): SDFNode | null {
    for (const child of current.children) {
      if (child.id === id) return current;
      const found = this.findParent(id, child);
      if (found) return found;
    }
    return null;
  }

  public addNode(node: SDFNode, parentId?: string): boolean {
    const parent = parentId ? this.findNode(parentId) : this.root;
    if (!parent) return false;
    parent.children.push(node);
    return true;
  }

  public duplicateNode(nodeId: string): SDFNode | null {
    if (this.root.id === nodeId) return null; // Cannot duplicate root
    const node = this.findNode(nodeId);
    const parent = this.findParent(nodeId);
    if (!node || !parent) return null;

    const cloned: SDFNode = JSON.parse(JSON.stringify(node));
    cloned.id = 'node_' + Math.random().toString(36).substring(2, 9);
    cloned.name = `${node.name} Copy`;
    cloned.transform.position = [
      node.transform.position[0] + 0.25,
      node.transform.position[1],
      node.transform.position[2] + 0.25
    ];

    const idx = parent.children.findIndex((c) => c.id === nodeId);
    if (idx !== -1) {
      parent.children.splice(idx + 1, 0, cloned);
    } else {
      parent.children.push(cloned);
    }
    return cloned;
  }

  public removeNode(id: string): boolean {
    if (this.root.id === id) return false; // Cannot remove root
    const parent = this.findParent(id);
    if (!parent) return false;
    const index = parent.children.findIndex((c) => c.id === id);
    if (index !== -1) {
      parent.children.splice(index, 1);
      return true;
    }
    return false;
  }

  public reparentNode(nodeId: string, newParentId: string, targetIndex?: number): boolean {
    if (nodeId === newParentId) return false;
    const node = this.findNode(nodeId);
    const newParent = this.findNode(newParentId);
    if (!node || !newParent) return false;

    // Check if newParent is a descendant of node to prevent cyclic parenting
    if (this.findNode(newParentId, node)) return false;

    this.removeNode(nodeId);
    if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= newParent.children.length) {
      newParent.children.splice(targetIndex, 0, node);
    } else {
      newParent.children.push(node);
    }
    return true;
  }

  /**
   * Flattens the tree in depth-first order and computes accumulated world transformations
   * and inverse transformation matrices for GPU raymarching evaluation.
   */
  public flattenWithTransforms(): Array<{
    node: SDFNode;
    worldMatrix: THREE.Matrix4;
    inverseWorldMatrix: THREE.Matrix4;
  }> {
    const list: Array<{
      node: SDFNode;
      worldMatrix: THREE.Matrix4;
      inverseWorldMatrix: THREE.Matrix4;
    }> = [];

    const traverse = (node: SDFNode, parentMatrix: THREE.Matrix4) => {
      if (!node.visible) return;

      const localMatrix = new THREE.Matrix4();
      const pos = new THREE.Vector3(...node.transform.position);
      const rot = new THREE.Euler(...node.transform.rotation, 'XYZ');
      const scale = new THREE.Vector3(...node.transform.scale);
      const quat = new THREE.Quaternion().setFromEuler(rot);

      localMatrix.compose(pos, quat, scale);
      const worldMatrix = new THREE.Matrix4().multiplyMatrices(parentMatrix, localMatrix);
      const inverseWorldMatrix = new THREE.Matrix4().copy(worldMatrix).invert();

      // Groups themselves don't evaluate geometry, but their children inherit the transform
      if (node.kind === 'primitive') {
        list.push({ node, worldMatrix, inverseWorldMatrix });
      }

      for (const child of node.children) {
        traverse(child, worldMatrix);
      }
    };

    traverse(this.root, new THREE.Matrix4().identity());
    return list;
  }

  public toJSON(): SDFSceneDocument {
    return {
      version: '1.0.0',
      metadata: {
        name: 'SDF Studio Scene',
        author: 'User',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        generator: 'SDF Studio 3D'
      },
      environment: {
        backgroundColor: '#121212',
        ambientLight: 0.25,
        shadows: true,
        ambientOcclusion: true,
        matcapPreset: 'clay'
      },
      rootNode: JSON.parse(JSON.stringify(this.root))
    };
  }

  public fromJSON(doc: SDFSceneDocument): void {
    if (doc.rootNode) {
      this.root = doc.rootNode;
    }
  }
}

