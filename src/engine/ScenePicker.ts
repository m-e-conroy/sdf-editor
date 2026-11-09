// ========================================================================
// SDF Studio 3D - CPU Sphere-Traced Viewport Raycaster & Node Picker
// ========================================================================

import * as THREE from 'three';
import { CSGTree } from '../tree/CSGTree';
import { SdfEvaluator } from './cpu/SdfEvaluator';

export class ScenePicker {
  private static MAX_STEPS = 64;
  private static HIT_EPSILON = 0.008;
  private static MAX_DIST = 40.0;

  /**
   * Casts a ray from camera through screen coordinates into the CSG tree scene,
   * returning the clicked SDFNode ID or null if background/floor is hit.
   */
  public static pick(
    clientX: number,
    clientY: number,
    canvasRect: DOMRect,
    camera: THREE.PerspectiveCamera,
    tree: CSGTree
  ): string | null {
    if (canvasRect.width <= 0 || canvasRect.height <= 0) return null;

    const ndcX = ((clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
    const ndcY = -((clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
    return this.pickNDC(ndcX, ndcY, camera, tree);
  }

  public static pickNDC(
    ndcX: number,
    ndcY: number,
    camera: THREE.PerspectiveCamera,
    tree: CSGTree
  ): string | null {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    const ro = raycaster.ray.origin.clone();
    const rd = raycaster.ray.direction.clone().normalize();

    const flattened = tree.flattenWithTransforms();
    if (flattened.length === 0) return null;

    let t = 0.05;
    let hitPos: THREE.Vector3 | null = null;

    for (let step = 0; step < this.MAX_STEPS; step++) {
      const p = ro.clone().addScaledVector(rd, t);

      // Evaluate minimum distance across active nodes using shared SdfEvaluator
      let minSceneDist = 1e5;
      for (let i = 0; i < flattened.length; i++) {
        const d = SdfEvaluator.evalNodeDistance(p, flattened[i].node, flattened[i].inverseWorldMatrix);
        if (d < minSceneDist) {
          minSceneDist = d;
        }
      }

      // Check floor plane intersection (floor at y = -1.2)
      const dFloor = p.y + 1.2;
      if (dFloor < minSceneDist && dFloor < this.HIT_EPSILON) {
        return null;
      }

      if (minSceneDist < this.HIT_EPSILON) {
        hitPos = p;
        break;
      }

      if (t > this.MAX_DIST) break;
      t += Math.max(minSceneDist * 0.9, 0.01);
    }

    if (!hitPos) return null;

    // Identify which node is closest to the hit point
    let closestNodeId: string | null = null;
    let minNodeDist = Infinity;

    for (let i = 0; i < flattened.length; i++) {
      const dist = Math.abs(SdfEvaluator.evalNodeDistance(hitPos, flattened[i].node, flattened[i].inverseWorldMatrix));
      if (dist < minNodeDist) {
        minNodeDist = dist;
        closestNodeId = flattened[i].node.id;
      }
    }

    return minNodeDist < 0.15 ? closestNodeId : null;
  }
}
