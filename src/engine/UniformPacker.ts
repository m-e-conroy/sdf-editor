import * as THREE from 'three';
import { CSGTree } from '../tree/CSGTree';
import { PrimitiveType } from '../tree/types';

export const MAX_GPU_NODES = 32;

export interface PackedUniformData {
  nodeCount: number;
  inverseMatrices: THREE.Matrix4[];
  types: number[];
  dimensions: THREE.Vector4[];
  csgConfig: THREE.Vector4[];
  modifiers: THREE.Vector4[];
  materials: THREE.Vector4[];
}

export class UniformPacker {
  private static primitiveTypeMap: Record<PrimitiveType, number> = {
    sphere: 0,
    box: 1,
    cylinder: 2,
    torus: 3,
    capsule: 4,
    cone: 5,
    pipe: 6,
    hemisphere: 7,
    ellipsoid: 8,
    superellipsoid: 9,
    pyramid: 10,
    hexagonal_prism: 11,
    triangular_prism: 12,
    tetrahedron: 13,
    octahedron: 14,
    mandelbulb: 15,
    pentagonal_pyramid: 16,
    wedge: 17,
    frustum: 18,
    pentagonal_prism: 19,
    plane: 20
  };

  public static pack(tree: CSGTree): PackedUniformData {
    const flattened = tree.flattenWithTransforms();
    const count = Math.min(flattened.length, MAX_GPU_NODES);

    const inverseMatrices: THREE.Matrix4[] = [];
    const types: number[] = [];
    const dimensions: THREE.Vector4[] = [];
    const csgConfig: THREE.Vector4[] = [];
    const modifiers: THREE.Vector4[] = [];
    const materials: THREE.Vector4[] = [];

    for (let i = 0; i < MAX_GPU_NODES; i++) {
      if (i < count) {
        const item = flattened[i];
        const node = item.node;

        // Inverse world matrix for coordinate mapping
        inverseMatrices.push(item.inverseWorldMatrix);

        // Primitive Type Index
        const typeIndex = this.primitiveTypeMap[node.primitive.type] ?? 0;
        types.push(typeIndex);

        // Dimensions packing
        const dims = node.primitive.dimensions;
        let dimVec = new THREE.Vector4(0.8, 0.8, 0.8, 0.0);

        if (node.primitive.type === 'sphere') {
          dimVec = new THREE.Vector4(dims.radius ?? 0.8, 0, 0, 0);
        } else if (node.primitive.type === 'box') {
          const s = dims.size ?? [0.7, 0.7, 0.7];
          dimVec = new THREE.Vector4(s[0], s[1], s[2], 0);
        } else if (node.primitive.type === 'cylinder') {
          dimVec = new THREE.Vector4(dims.height ?? 0.8, dims.radius ?? 0.5, 0, 0);
        } else if (node.primitive.type === 'torus') {
          dimVec = new THREE.Vector4(dims.radiusMajor ?? 0.7, dims.radiusMinor ?? 0.25, 0, 0);
        } else if (node.primitive.type === 'capsule') {
          dimVec = new THREE.Vector4(dims.height ?? 0.6, dims.radius ?? 0.35, 0, 0);
        } else if (node.primitive.type === 'pipe') {
          dimVec = new THREE.Vector4(dims.height ?? 0.8, dims.radius ?? 0.5, dims.thickness ?? 0.08, 0);
        } else if (node.primitive.type === 'pyramid') {
          dimVec = new THREE.Vector4(dims.height ?? 1.0, 0, 0, 0);
        } else if (node.primitive.type === 'hexagonal_prism' || node.primitive.type === 'triangular_prism') {
          dimVec = new THREE.Vector4(dims.radius ?? 0.6, dims.height ?? 0.7, 0, 0);
        } else if (node.primitive.type === 'ellipsoid' || node.primitive.type === 'superellipsoid') {
          const r = dims.radii ?? (dims.size as [number, number, number]) ?? [0.8, 0.6, 0.5];
          dimVec = new THREE.Vector4(r[0] || 0.8, r[1] || 0.6, r[2] || 0.5, 0);
        } else if (node.primitive.type === 'cone') {
          dimVec = new THREE.Vector4(dims.height ?? 0.8, dims.baseRadius ?? dims.radius ?? 0.6, dims.topRadius ?? 0.0, 0);
        } else if (node.primitive.type === 'hemisphere' || node.primitive.type === 'tetrahedron' || node.primitive.type === 'octahedron') {
          dimVec = new THREE.Vector4(dims.radius ?? 0.8, 0, 0, 0);
        } else {
          dimVec = new THREE.Vector4(dims.radius ?? 0.8, dims.height ?? 0.8, 0, 0);
        }
        dimensions.push(dimVec);

        // CSG Config: x = Op (0: Union, 1: Diff, 2: Intersect), y = BlendMode (0: Hard, 1: Smooth), z = k, w = roundRadius
        const opId = node.csg.operation === 'difference' ? 1 : node.csg.operation === 'intersection' ? 2 : 0;
        const blendId = node.csg.blendMode === 'smooth_polynomial' ? 1 : 0;
        const k = node.csg.blendRadius || 0.0;
        const roundRadius = node.modifiers?.roundRadius || 0.0;
        csgConfig.push(new THREE.Vector4(opId, blendId, k, roundRadius));

        // Modifiers Config: x = shellThickness, y = twist, z = symmetryAxis (0: none, 1: X, 2: Y, 3: Z), w = reserved
        const shellThickness = node.modifiers?.shellThickness || 0.0;
        const twist = node.modifiers?.twist ?? node.modifiers?.twistFactor ?? 0.0;
        let symAxis = 0.0;
        if (node.modifiers?.mirrorAxis === 'x') symAxis = 1.0;
        else if (node.modifiers?.mirrorAxis === 'y') symAxis = 2.0;
        else if (node.modifiers?.mirrorAxis === 'z') symAxis = 3.0;
        modifiers.push(new THREE.Vector4(shellThickness, twist, symAxis, 0.0));

        // Material Config: rgb, w = roughness
        const color = new THREE.Color(node.material.color || '#e2e8f0');
        materials.push(new THREE.Vector4(color.r, color.g, color.b, node.material.roughness ?? 0.4));
      } else {
        // Dummy padding entries
        inverseMatrices.push(new THREE.Matrix4().identity());
        types.push(0);
        dimensions.push(new THREE.Vector4(0, 0, 0, 0));
        csgConfig.push(new THREE.Vector4(0, 0, 0, 0));
        modifiers.push(new THREE.Vector4(0, 0, 0, 0));
        materials.push(new THREE.Vector4(0.8, 0.8, 0.8, 0.5));
      }
    }

    return {
      nodeCount: count,
      inverseMatrices,
      types,
      dimensions,
      csgConfig,
      modifiers,
      materials
    };
  }
}
