import * as THREE from 'three';
import { CSGTree } from '../tree/CSGTree';
import { PrimitiveType, SDFNode } from '../tree/types';
import {
  CSGCompiler,
  MAX_GROUP_SKIPS,
  MAX_INSTRUCTIONS,
  MAX_LEAF_COUNT,
  type CompiledGroupSkip,
  type CompiledLeaf
} from './csg/CSGCompiler';

export const MAX_GPU_NODES = MAX_LEAF_COUNT;

// Distance beyond which a leaf may be replaced by its bounding sphere, before blend/round/shell allowances
export const BASE_CULL_MARGIN = 0.02;

export interface PackedUniformData {
  nodeCount: number;
  inverseMatrices: THREE.Matrix4[];
  types: number[];
  dimensions: THREE.Vector4[];
  csgConfig: THREE.Vector4[];
  modifiers: THREE.Vector4[];
  arrayModifiers: THREE.Vector4[];
  materials: THREE.Vector4[];
  cullMargin: number;
  /** World-space bounding spheres (xyz center, w radius) for GROUP_SKIP slots. */
  groupBounds: THREE.Vector4[];
  instructions: THREE.Vector4[];
  instructionCount: number;
  selectedRange: THREE.Vector2;
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
    plane: 20,
    capped_torus: 21,
    chain_link: 22,
    chamfer_cylinder: 23,
    egg: 24,
    heart: 25,
    star_prism: 26
  };

  /**
   * Local-space radius enclosing the shader primitive for a packed type/dimension pair.
   * Must follow the conventions of evalPrimitive() in raymarch.frag.glsl, not the node schema.
   */
  public static primitiveBoundRadius(typeIndex: number, d: THREE.Vector4): number {
    switch (typeIndex) {
      case 0: // sphere
      case 7: // hemisphere
      case 14: // octahedron
        return d.x;
      case 1: // box half-extents
        return Math.hypot(d.x, d.y, d.z);
      case 2: // capped cylinder (half-height, radius)
      case 23: // chamfer cylinder
        return Math.hypot(d.x, d.y);
      case 3: // torus
      case 4: // capsule
      case 21: // capped torus
        return d.x + d.y;
      case 5: // capped cone
        return Math.hypot(d.x, Math.max(d.y, d.z));
      case 6: // pipe
        return Math.hypot(d.x, d.y + d.z);
      case 8: // ellipsoid
      case 9: // superellipsoid
        return Math.max(d.x, d.y, d.z);
      case 10: // pyramid: unit base square at y=0, apex at y=h
        return Math.sqrt(0.5 + d.x * d.x);
      case 11: // hex prism: apothem -> circumradius, half-length on z
        return Math.hypot((d.x * 2) / Math.sqrt(3), d.y);
      case 12: // tri prism
        return Math.hypot(d.x, d.y);
      case 13: // tetrahedron vertices at (r, r, r)
        return d.x * Math.sqrt(3);
      case 15: // mandelbulb evaluated at p * 0.8
        return 1.5;
      case 22: // chain link
        return d.x + d.y + d.z;
      case 24: {
        // egg: q.y = p.y / sc, mirrors sdEgg()
        const ra = Math.max(d.x, 0.001);
        const rb = Math.max(d.y, 0.001);
        const h = d.z;
        const k = Math.sqrt(3);
        const r = ra - rb;
        const sc = Math.max(Math.abs(r) > 0.001 ? h / (k * Math.abs(r)) : 1, 0.001);
        const yTop = (r > 0.001 ? k * r + rb : h + ra) * sc;
        return Math.hypot(Math.max(ra, rb), Math.max(yTop, ra * sc));
      }
      case 25: {
        // heart: lobes reach 0.61 * size in x and y, extruded by half-thickness on z
        const s = Math.max(d.x, 0.001);
        return Math.hypot(0.61 * s, 0.61 * s, Math.max(d.y, 0.001));
      }
      case 26: // star prism (outer radius, half-height)
        return Math.hypot(d.x, d.z);
      default: // unimplemented types fall back to sdSphere(p, 0.8)
        return 0.8;
    }
  }

  /**
   * How far below its true value an ancestor chain can pull a leaf's distance
   * (smooth blends, group rounding, group shells). Culling within this band could create false hits.
   */
  public static computeCullMargin(root: SDFNode): number {
    return BASE_CULL_MARGIN + (root.visible ? this.subtreeAllowance(root) : 0);
  }

  /** Largest blend/round/shell allowance along any path inside a node's subtree, including its own level. */
  private static subtreeAllowance(node: SDFNode): number {
    if (node.kind === 'primitive') return 0;
    const visible = node.children.filter((c) => c.visible);
    let maxK = 0;
    for (let i = 1; i < visible.length; i++) {
      const csg = visible[i].csg;
      if (csg.blendMode === 'smooth_polynomial') maxK = Math.max(maxK, csg.blendRadius || 0);
    }
    const level = 1.5 * maxK + (node.modifiers?.roundRadius || 0) + (node.modifiers?.shellThickness || 0);
    let deepest = 0;
    for (const child of visible) deepest = Math.max(deepest, this.subtreeAllowance(child));
    return level + deepest;
  }

  /** Upper bound on how much a matrix can stretch a vector (exact for rotation * scale). */
  private static maxStretch(m: THREE.Matrix4): number {
    const e = m.elements;
    const cols = [0, 4, 8].map((o) => new THREE.Vector3(e[o], e[o + 1], e[o + 2]));
    const lens = cols.map((c) => c.length());
    const orthogonal =
      Math.abs(cols[0].dot(cols[1])) <= 1e-6 * lens[0] * lens[1] &&
      Math.abs(cols[0].dot(cols[2])) <= 1e-6 * lens[0] * lens[2] &&
      Math.abs(cols[1].dot(cols[2])) <= 1e-6 * lens[1] * lens[2];
    // Sheared frames (non-uniform parent scale + child rotation) fall back to the Frobenius norm
    return orthogonal ? Math.max(...lens) : Math.hypot(...lens);
  }

  /**
   * World-space sphere around each skippable group: encloses its leaves' bounding spheres,
   * widened by the blends, rounding and shells applied inside the group.
   */
  private static computeGroupBounds(
    groupSkips: CompiledGroupSkip[],
    leaves: CompiledLeaf[],
    dimensions: THREE.Vector4[]
  ): THREE.Vector4[] {
    const spheres = leaves.map((leaf, i) => ({
      center: new THREE.Vector3().setFromMatrixPosition(leaf.worldMatrix),
      radius: dimensions[i].w * this.maxStretch(leaf.worldMatrix)
    }));

    const bounds: THREE.Vector4[] = [];
    for (let slot = 0; slot < MAX_GROUP_SKIPS; slot++) {
      const group = groupSkips[slot];
      if (!group || group.leafRange[0] < 0) {
        // Unused slots never skip
        bounds.push(new THREE.Vector4(0, 0, 0, 1e9));
        continue;
      }
      const members = spheres.slice(group.leafRange[0], group.leafRange[1] + 1);
      const box = new THREE.Box3();
      for (const s of members) {
        box.expandByPoint(s.center.clone().addScalar(s.radius));
        box.expandByPoint(s.center.clone().addScalar(-s.radius));
      }
      const center = box.getCenter(new THREE.Vector3());
      let radius = 0;
      for (const s of members) radius = Math.max(radius, s.center.distanceTo(center) + s.radius);
      bounds.push(new THREE.Vector4(center.x, center.y, center.z, radius + this.subtreeAllowance(group.node)));
    }
    return bounds;
  }

  public static pack(tree: CSGTree, selectedNodeId?: string | null): PackedUniformData {
    const compiled = CSGCompiler.compile(tree, { groupSkips: true });
    const leaves = compiled.leaves;
    const count = Math.min(leaves.length, MAX_GPU_NODES);

    const inverseMatrices: THREE.Matrix4[] = [];
    const types: number[] = [];
    const dimensions: THREE.Vector4[] = [];
    const csgConfig: THREE.Vector4[] = [];
    const modifiers: THREE.Vector4[] = [];
    const arrayModifiers: THREE.Vector4[] = [];
    const materials: THREE.Vector4[] = [];

    for (let i = 0; i < MAX_GPU_NODES; i++) {
      if (i < count) {
        const item = leaves[i];
        const node = item.node;

        // Inverse world matrix for coordinate mapping
        inverseMatrices.push(item.inverseWorldMatrix);

        // Primitive Type Index
        const primType = node.primitive?.type ?? 'sphere';
        const typeIndex = this.primitiveTypeMap[primType] ?? 0;
        types.push(typeIndex);

        // Dimensions packing
        const dims = node.primitive?.dimensions || {};
        let dimVec = new THREE.Vector4(0.8, 0.8, 0.8, 0.0);

        if (primType === 'sphere') {
          dimVec = new THREE.Vector4(dims.radius ?? 0.8, 0, 0, 0);
        } else if (primType === 'box') {
          const s = dims.size ?? [0.7, 0.7, 0.7];
          dimVec = new THREE.Vector4(s[0], s[1], s[2], 0);
        } else if (primType === 'cylinder') {
          dimVec = new THREE.Vector4(dims.height ?? 0.8, dims.radius ?? 0.5, 0, 0);
        } else if (primType === 'torus') {
          dimVec = new THREE.Vector4(dims.radiusMajor ?? 0.7, dims.radiusMinor ?? 0.25, 0, 0);
        } else if (primType === 'capsule') {
          dimVec = new THREE.Vector4(dims.height ?? 0.6, dims.radius ?? 0.35, 0, 0);
        } else if (primType === 'pipe') {
          dimVec = new THREE.Vector4(dims.height ?? 0.8, dims.radius ?? 0.5, dims.thickness ?? 0.08, 0);
        } else if (primType === 'pyramid') {
          dimVec = new THREE.Vector4(dims.height ?? 1.0, 0, 0, 0);
        } else if (primType === 'hexagonal_prism' || primType === 'triangular_prism') {
          dimVec = new THREE.Vector4(dims.radius ?? 0.6, dims.height ?? 0.7, 0, 0);
        } else if (primType === 'ellipsoid' || primType === 'superellipsoid') {
          const r = dims.radii ?? (dims.size as [number, number, number]) ?? [0.8, 0.6, 0.5];
          dimVec = new THREE.Vector4(r[0] || 0.8, r[1] || 0.6, r[2] || 0.5, 0);
        } else if (primType === 'cone') {
          dimVec = new THREE.Vector4(dims.height ?? 0.8, dims.baseRadius ?? dims.radius ?? 0.6, dims.topRadius ?? 0.0, 0);
        } else if (primType === 'hemisphere' || primType === 'tetrahedron' || primType === 'octahedron') {
          dimVec = new THREE.Vector4(dims.radius ?? 0.8, 0, 0, 0);
        } else if (primType === 'capped_torus') {
          dimVec = new THREE.Vector4(
            dims.radiusMajor ?? dims.radius ?? dims.outerRadius ?? 0.7,
            dims.radiusMinor ?? dims.thickness ?? 0.25,
            dims.arcAngle ?? Math.PI / 2,
            0
          );
        } else if (primType === 'chain_link') {
          dimVec = new THREE.Vector4(
            (dims.linkLength ?? 0.6) * 0.5,
            dims.radiusMajor ?? dims.radius ?? dims.outerRadius ?? 0.7,
            dims.radiusMinor ?? dims.thickness ?? 0.25,
            0
          );
        } else if (primType === 'chamfer_cylinder') {
          dimVec = new THREE.Vector4(
            (dims.height ?? 0.8) * 0.5,
            dims.radius ?? 0.5,
            dims.chamfer ?? 0.08,
            0
          );
        } else if (primType === 'egg') {
          dimVec = new THREE.Vector4(
            dims.baseRadius ?? dims.radius ?? 0.6,
            dims.tipRadius ?? 0.25,
            dims.height ?? 0.8,
            0
          );
        } else if (primType === 'heart') {
          dimVec = new THREE.Vector4(
            dims.radius ?? dims.outerRadius ?? 0.75,
            dims.thickness ?? (dims.height ? dims.height * 0.5 : 0.25),
            0,
            0
          );
        } else if (primType === 'star_prism') {
          dimVec = new THREE.Vector4(
            dims.outerRadius ?? dims.radius ?? 0.75,
            dims.innerRadius ?? 0.35,
            (dims.height ?? 0.8) * 0.5,
            0
          );
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

        // Modifiers Config: x = shellThickness, y = twist, z = symmetryMask (1: X, 2: Y, 4: Z), w = bendFactor
        const shellThickness = node.modifiers?.shellThickness || 0.0;
        const twist = node.modifiers?.twist ?? node.modifiers?.twistFactor ?? 0.0;
        const bend = node.modifiers?.bendFactor ?? 0.0;
        let symMask = 0;
        if (node.modifiers?.mirrorAxes) {
          if (node.modifiers.mirrorAxes[0]) symMask |= 1;
          if (node.modifiers.mirrorAxes[1]) symMask |= 2;
          if (node.modifiers.mirrorAxes[2]) symMask |= 4;
        } else if (node.modifiers?.mirrorAxis === 'x') {
          symMask = 1;
        } else if (node.modifiers?.mirrorAxis === 'y') {
          symMask = 2;
        } else if (node.modifiers?.mirrorAxis === 'z') {
          symMask = 4;
        }
        modifiers.push(new THREE.Vector4(shellThickness, twist, symMask, bend));

        // Array Modifiers Config: x = radialRepeat, y = linearCount, z = linearSpacing, w = metalness
        const radialRepeat = node.modifiers?.radialRepeat ?? 1.0;
        const linearCount = node.modifiers?.linearCount ?? 1.0;
        const linearSpacing = node.modifiers?.linearSpacing ?? 0.8;
        const metalness = node.material.metalness ?? 0.0;
        arrayModifiers.push(new THREE.Vector4(radialRepeat, linearCount, linearSpacing, metalness));

        // Material Config: rgb, w = roughness
        const color = new THREE.Color(node.material.color || '#e2e8f0');
        materials.push(new THREE.Vector4(color.r, color.g, color.b, node.material.roughness ?? 0.4));

        // Twist, bend, mirror and radial repeat preserve |p|; only linear repeat moves copies outward
        const linearShift =
          linearCount >= 2 && linearSpacing > 0.001 ? ((linearCount - 1) * 0.5 * linearSpacing) : 0;
        // dimensions.w carries the local bounding radius used for shader culling
        dimVec.w = this.primitiveBoundRadius(typeIndex, dimVec) + roundRadius + shellThickness + linearShift + 0.001;
      } else {
        // Dummy padding entries
        inverseMatrices.push(new THREE.Matrix4().identity());
        types.push(0);
        dimensions.push(new THREE.Vector4(0, 0, 0, 0));
        csgConfig.push(new THREE.Vector4(0, 0, 0, 0));
        modifiers.push(new THREE.Vector4(0, 0, 0, 0));
        arrayModifiers.push(new THREE.Vector4(1, 1, 0, 0));
        materials.push(new THREE.Vector4(0.8, 0.8, 0.8, 0.5));
      }
    }

    // Instructions packing
    const instructions: THREE.Vector4[] = [];
    const instrCount = Math.min(compiled.instructions.length, MAX_INSTRUCTIONS);
    for (let i = 0; i < MAX_INSTRUCTIONS; i++) {
      if (i < instrCount) {
        const instr = compiled.instructions[i];
        instructions.push(new THREE.Vector4(instr.opcode, instr.arg0, instr.arg1, instr.arg2));
      } else {
        instructions.push(new THREE.Vector4(0, 0, 0, 0));
      }
    }

    // Selected range resolution
    let selectedRange = new THREE.Vector2(-1, -1);
    if (selectedNodeId) {
      const range = compiled.nodeLeafRanges.get(selectedNodeId);
      if (range && range[0] !== -1) {
        selectedRange = new THREE.Vector2(range[0], range[1]);
      }
    }

    return {
      nodeCount: count,
      inverseMatrices,
      types,
      dimensions,
      csgConfig,
      modifiers,
      arrayModifiers,
      materials,
      cullMargin: this.computeCullMargin(tree.root),
      groupBounds: this.computeGroupBounds(compiled.groupSkips, compiled.leaves, dimensions),
      instructions,
      instructionCount: instrCount,
      selectedRange
    };
  }
}
