// ========================================================================
// SDF Studio 3D - Scene Numeric Sensing & Geometric Queries
// ========================================================================

import * as THREE from 'three';
import { CSGTree } from '../tree/CSGTree';
import type { PrimitiveType, PrimitiveDimensions } from '../tree/types';
import { SdfEvaluator } from './cpu/SdfEvaluator';

export interface SceneBounds {
  min: [number, number, number];
  max: [number, number, number];
  center: [number, number, number];
  size: [number, number, number];
}

export interface DistanceSampleResult {
  distances: number[];
  nearestNodeId?: string;
}

export interface VolumeEstimateResult {
  volume: number;
  boundingBoxVolume: number;
  fillRatio: number;
}

export class SceneQueries {
  /**
   * Computes local-space bounding half-extents for any primitive.
   */
  public static getPrimitiveLocalBounds(
    type: PrimitiveType,
    dims: PrimitiveDimensions
  ): { min: [number, number, number]; max: [number, number, number] } {
    switch (type) {
      case 'sphere': {
        const r = dims.radius ?? 0.8;
        return { min: [-r, -r, -r], max: [r, r, r] };
      }
      case 'box': {
        const s = dims.size ?? [0.7, 0.7, 0.7];
        return { min: [-s[0], -s[1], -s[2]], max: [s[0], s[1], s[2]] };
      }
      case 'cylinder':
      case 'chamfer_cylinder':
      case 'pipe': {
        const r = dims.radius ?? 0.5;
        const h = dims.height ?? 0.8;
        const th = dims.thickness ?? 0;
        const totalR = r + th;
        return { min: [-totalR, -h, -totalR], max: [totalR, h, totalR] };
      }
      case 'torus':
      case 'capped_torus': {
        const R = dims.radiusMajor ?? 0.7;
        const r = dims.radiusMinor ?? 0.25;
        const outer = R + r;
        return { min: [-outer, -r, -outer], max: [outer, r, outer] };
      }
      case 'capsule': {
        const h = dims.height ?? 0.6;
        const r = dims.radius ?? 0.35;
        return { min: [-r, -h - r, -r], max: [r, h + r, r] };
      }
      case 'cone': {
        const h = dims.height ?? 0.8;
        const r = Math.max(dims.baseRadius ?? 0.6, dims.topRadius ?? 0.0);
        return { min: [-r, -h, -r], max: [r, h, r] };
      }
      case 'hemisphere': {
        const r = dims.radius ?? 0.8;
        return { min: [-r, 0, -r], max: [r, r, r] };
      }
      case 'ellipsoid':
      case 'superellipsoid': {
        const radii = dims.radii ?? [0.8, 0.6, 0.5];
        return { min: [-radii[0], -radii[1], -radii[2]], max: [radii[0], radii[1], radii[2]] };
      }
      case 'pyramid': {
        const h = dims.height ?? 1.0;
        return { min: [-0.5, 0, -0.5], max: [0.5, h, 0.5] };
      }
      case 'hexagonal_prism':
      case 'triangular_prism': {
        const r = dims.radius ?? 0.6;
        const h = dims.height ?? 0.7;
        return { min: [-r, -h, -r], max: [r, h, r] };
      }
      case 'tetrahedron':
      case 'octahedron': {
        const r = dims.radius ?? 0.8;
        return { min: [-r, -r, -r], max: [r, r, r] };
      }
      case 'chain_link': {
        const le = (dims.linkLength ?? 0.6) * 0.5;
        const r1 = dims.radiusMajor ?? 0.5;
        const r2 = dims.thickness ?? 0.15;
        return { min: [-r1 - r2, -le - r1 - r2, -r2], max: [r1 + r2, le + r1 + r2, r2] };
      }
      case 'egg': {
        const ra = dims.baseRadius ?? 0.6;
        const h = dims.height ?? 1.2;
        return { min: [-ra, -h * 0.5, -ra], max: [ra, h * 0.5, ra] };
      }
      case 'heart': {
        const s = dims.radius ?? 0.8;
        const h = dims.height ?? 0.3;
        return { min: [-s, -s * 0.5, -h], max: [s, s * 1.5, h] };
      }
      case 'star_prism': {
        const r = dims.outerRadius ?? 0.75;
        const h = (dims.height ?? 0.4) * 0.5;
        return { min: [-r, -r, -h], max: [r, r, h] };
      }
      default:
        return { min: [-0.8, -0.8, -0.8], max: [0.8, 0.8, 0.8] };
    }
  }

  /**
   * Computes the world-space axis-aligned bounding box (AABB) of the tree or a specific node.
   */
  public static getBounds(tree: CSGTree, nodeId?: string, tight = false): SceneBounds {
    const flattened = tree.flattenWithTransforms();
    const targetNodes = nodeId
      ? flattened.filter((item) => item.node.id === nodeId)
      : flattened;

    if (targetNodes.length === 0) {
      return {
        min: [-1, -1, -1],
        max: [1, 1, 1],
        center: [0, 0, 0],
        size: [2, 2, 2]
      };
    }

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const item of targetNodes) {
      const localBounds = this.getPrimitiveLocalBounds(item.node.primitive.type, item.node.primitive.dimensions);
      const mods = item.node.modifiers || {};

      // Expand local bounds for rounding and shell
      const extra = (mods.roundRadius ?? 0) + (mods.shellThickness ?? 0);
      localBounds.min[0] -= extra; localBounds.min[1] -= extra; localBounds.min[2] -= extra;
      localBounds.max[0] += extra; localBounds.max[1] += extra; localBounds.max[2] += extra;

      // Expand for radial repeat
      if (mods.radialRepeat && mods.radialRepeat >= 2) {
        const r = Math.hypot(
          Math.max(Math.abs(localBounds.min[0]), Math.abs(localBounds.max[0])),
          Math.max(Math.abs(localBounds.min[2]), Math.abs(localBounds.max[2]))
        );
        localBounds.min[0] = -r; localBounds.max[0] = r;
        localBounds.min[2] = -r; localBounds.max[2] = r;
      }

      // Expand for linear count
      if (mods.linearCount && mods.linearCount >= 2 && mods.linearSpacing) {
        const halfSpan = (mods.linearCount - 1) * 0.5 * mods.linearSpacing;
        localBounds.min[0] -= halfSpan;
        localBounds.max[0] += halfSpan;
      }

      // Symmetrize for mirror axes
      if (mods.mirrorAxes) {
        if (mods.mirrorAxes[0]) {
          const maxAx = Math.max(Math.abs(localBounds.min[0]), Math.abs(localBounds.max[0]));
          localBounds.min[0] = -maxAx; localBounds.max[0] = maxAx;
        }
        if (mods.mirrorAxes[1]) {
          const maxAy = Math.max(Math.abs(localBounds.min[1]), Math.abs(localBounds.max[1]));
          localBounds.min[1] = -maxAy; localBounds.max[1] = maxAy;
        }
        if (mods.mirrorAxes[2]) {
          const maxAz = Math.max(Math.abs(localBounds.min[2]), Math.abs(localBounds.max[2]));
          localBounds.min[2] = -maxAz; localBounds.max[2] = maxAz;
        }
      }

      // Transform all 8 local corners to world space
      const corners: THREE.Vector3[] = [
        new THREE.Vector3(localBounds.min[0], localBounds.min[1], localBounds.min[2]),
        new THREE.Vector3(localBounds.max[0], localBounds.min[1], localBounds.min[2]),
        new THREE.Vector3(localBounds.min[0], localBounds.max[1], localBounds.min[2]),
        new THREE.Vector3(localBounds.max[0], localBounds.max[1], localBounds.min[2]),
        new THREE.Vector3(localBounds.min[0], localBounds.min[1], localBounds.max[2]),
        new THREE.Vector3(localBounds.max[0], localBounds.min[1], localBounds.max[2]),
        new THREE.Vector3(localBounds.min[0], localBounds.max[1], localBounds.max[2]),
        new THREE.Vector3(localBounds.max[0], localBounds.max[1], localBounds.max[2])
      ];

      for (const corner of corners) {
        corner.applyMatrix4(item.worldMatrix);
        if (corner.x < minX) minX = corner.x;
        if (corner.y < minY) minY = corner.y;
        if (corner.z < minZ) minZ = corner.z;
        if (corner.x > maxX) maxX = corner.x;
        if (corner.y > maxY) maxY = corner.y;
        if (corner.z > maxZ) maxZ = corner.z;
      }
    }

    // Tight sampled refinement if requested
    if (tight && Number.isFinite(minX)) {
      const gridRes = 12;
      let tMinX = Infinity, tMinY = Infinity, tMinZ = Infinity;
      let tMaxX = -Infinity, tMaxY = -Infinity, tMaxZ = -Infinity;
      let foundAny = false;

      const stepX = (maxX - minX) / gridRes;
      const stepY = (maxY - minY) / gridRes;
      const stepZ = (maxZ - minZ) / gridRes;

      for (let ix = 0; ix <= gridRes; ix++) {
        const px = minX + ix * stepX;
        for (let iy = 0; iy <= gridRes; iy++) {
          const py = minY + iy * stepY;
          for (let iz = 0; iz <= gridRes; iz++) {
            const pz = minZ + iz * stepZ;
            const dist = SdfEvaluator.evalSceneDistance([px, py, pz], tree);
            if (dist <= 0.05) {
              foundAny = true;
              if (px < tMinX) tMinX = px;
              if (py < tMinY) tMinY = py;
              if (pz < tMinZ) tMinZ = pz;
              if (px > tMaxX) tMaxX = px;
              if (py > tMaxY) tMaxY = py;
              if (pz > tMaxZ) tMaxZ = pz;
            }
          }
        }
      }

      if (foundAny) {
        minX = tMinX; minY = tMinY; minZ = tMinZ;
        maxX = tMaxX; maxY = tMaxY; maxZ = tMaxZ;
      }
    }

    return {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
      center: [(minX + maxX) * 0.5, (minY + maxY) * 0.5, (minZ + maxZ) * 0.5],
      size: [maxX - minX, maxY - minY, maxZ - minZ]
    };
  }

  /**
   * Evaluates signed distance at sample points, finding the nearest node if applicable.
   */
  public static sampleDistance(
    tree: CSGTree,
    points: [number, number, number][],
    nodeId?: string
  ): DistanceSampleResult {
    const flattened = tree.flattenWithTransforms();
    const targetItem = nodeId ? flattened.find((item) => item.node.id === nodeId) : null;

    const distances: number[] = [];
    let nearestNodeId: string | undefined = undefined;
    let minAbsoluteDistance = Infinity;

    for (const pt of points) {
      if (targetItem) {
        const d = SdfEvaluator.evalNodeDistance(pt, targetItem.node, targetItem.inverseWorldMatrix);
        distances.push(d);
        if (Math.abs(d) < minAbsoluteDistance) {
          minAbsoluteDistance = Math.abs(d);
          nearestNodeId = targetItem.node.id;
        }
      } else {
        const d = SdfEvaluator.evalSceneDistance(pt, tree);
        distances.push(d);

        // Identify closest node among all nodes
        for (const item of flattened) {
          const nodeDist = Math.abs(SdfEvaluator.evalNodeDistance(pt, item.node, item.inverseWorldMatrix));
          if (nodeDist < minAbsoluteDistance) {
            minAbsoluteDistance = nodeDist;
            nearestNodeId = item.node.id;
          }
        }
      }
    }

    return {
      distances,
      nearestNodeId
    };
  }

  /**
   * Estimates scene/node volume via coarse 3D grid Monte Carlo integration.
   */
  public static estimateVolume(tree: CSGTree, nodeId?: string): VolumeEstimateResult {
    const bounds = this.getBounds(tree, nodeId, false);
    const boxVol = bounds.size[0] * bounds.size[1] * bounds.size[2];

    if (boxVol <= 0 || !Number.isFinite(boxVol)) {
      return { volume: 0, boundingBoxVolume: 0, fillRatio: 0 };
    }

    const res = 24;
    const totalPoints = res * res * res;
    let insideCount = 0;

    const stepX = bounds.size[0] / res;
    const stepY = bounds.size[1] / res;
    const stepZ = bounds.size[2] / res;

    for (let ix = 0; ix < res; ix++) {
      const px = bounds.min[0] + (ix + 0.5) * stepX;
      for (let iy = 0; iy < res; iy++) {
        const py = bounds.min[1] + (iy + 0.5) * stepY;
        for (let iz = 0; iz < res; iz++) {
          const pz = bounds.min[2] + (iz + 0.5) * stepZ;
          const d = SdfEvaluator.evalSceneDistance([px, py, pz], tree);
          if (d <= 0.0) {
            insideCount++;
          }
        }
      }
    }

    const fillRatio = insideCount / totalPoints;
    const volume = fillRatio * boxVol;

    return {
      volume,
      boundingBoxVolume: boxVol,
      fillRatio
    };
  }
}
