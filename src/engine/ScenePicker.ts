// ========================================================================
// SDF Studio 3D - CPU Sphere-Traced Viewport Raycaster & Node Picker
// ========================================================================

import * as THREE from 'three';
import { CSGTree } from '../tree/CSGTree';
import { SDFNode, PrimitiveType, PrimitiveDimensions } from '../tree/types';

export class ScenePicker {
  private static MAX_STEPS = 64;
  private static HIT_EPSILON = 0.008;
  private static MAX_DIST = 40.0;

  /**
   * Casts a ray from camera through screen coordinates (clientX, clientY)
   * into the CSG tree scene, returning the clicked SDFNode ID or null if background/floor is hit.
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

      // Evaluate minimum distance across active nodes
      let minSceneDist = 1e5;
      for (let i = 0; i < flattened.length; i++) {
        const d = this.evalNodeDistance(p, flattened[i].node, flattened[i].inverseWorldMatrix);
        if (d < minSceneDist) {
          minSceneDist = d;
        }
      }

      // Check floor plane intersection (floor at y = -1.2)
      const dFloor = p.y + 1.2;
      if (dFloor < minSceneDist && dFloor < this.HIT_EPSILON) {
        // Clicked the floor plane
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
      const dist = Math.abs(this.evalNodeDistance(hitPos, flattened[i].node, flattened[i].inverseWorldMatrix));
      if (dist < minNodeDist) {
        minNodeDist = dist;
        closestNodeId = flattened[i].node.id;
      }
    }

    return minNodeDist < 0.15 ? closestNodeId : null;
  }

  private static evalNodeDistance(worldP: THREE.Vector3, node: SDFNode, invMatrix: THREE.Matrix4): number {
    const p = worldP.clone().applyMatrix4(invMatrix);
    const mods = node.modifiers || {};

    // 1. Array Modifiers (Polar & Linear)
    if (mods.radialRepeat && mods.radialRepeat >= 2) {
      const sector = (2.0 * Math.PI) / mods.radialRepeat;
      let angle = Math.atan2(p.z, p.x) + 0.5 * sector;
      const r = Math.hypot(p.x, p.z);
      angle = ((angle % sector) + sector) % sector - 0.5 * sector;
      p.x = r * Math.cos(angle);
      p.z = r * Math.sin(angle);
    }
    if (mods.linearCount && mods.linearCount >= 2 && mods.linearSpacing && mods.linearSpacing > 0.001) {
      const halfLimit = (mods.linearCount - 1.0) * 0.5;
      const c = Math.max(-halfLimit, Math.min(halfLimit, Math.round(p.x / mods.linearSpacing)));
      p.x = p.x - mods.linearSpacing * c;
    }

    // 2. Deformation Modifiers (Twist & Bend)
    const twist = mods.twistFactor ?? (mods as any).twist ?? 0.0;
    if (Math.abs(twist) > 0.001) {
      const c = Math.cos(twist * p.y);
      const s = Math.sin(twist * p.y);
      const xzX = c * p.x - s * p.z;
      const xzZ = s * p.x + c * p.z;
      p.x = xzX;
      p.z = xzZ;
    }

    const bend = mods.bendFactor ?? 0.0;
    if (Math.abs(bend) > 0.001) {
      const c = Math.cos(bend * p.x);
      const s = Math.sin(bend * p.x);
      const xyX = c * p.x - s * p.y;
      const xyY = s * p.x + c * p.y;
      p.x = xyX;
      p.y = xyY;
    }

    // 3. Symmetry Mask
    if (mods.mirrorAxes) {
      if (mods.mirrorAxes[0]) p.x = Math.abs(p.x);
      if (mods.mirrorAxes[1]) p.y = Math.abs(p.y);
      if (mods.mirrorAxes[2]) p.z = Math.abs(p.z);
    } else if (mods.mirrorAxis === 'x') p.x = Math.abs(p.x);
    else if (mods.mirrorAxis === 'y') p.y = Math.abs(p.y);
    else if (mods.mirrorAxis === 'z') p.z = Math.abs(p.z);

    let d = this.evalPrimitive(node.primitive.type, p.x, p.y, p.z, node.primitive.dimensions);

    // Rounding modifier
    if (mods.roundRadius && mods.roundRadius > 0) {
      d -= mods.roundRadius;
    }

    // Shell / Onion modifier
    if (mods.shellThickness && mods.shellThickness > 0) {
      d = Math.abs(d) - mods.shellThickness;
    }

    return d;
  }

  public static evalPrimitive(type: PrimitiveType, x: number, y: number, z: number, dims: PrimitiveDimensions): number {
    switch (type) {
      case 'sphere':
        return Math.hypot(x, y, z) - (dims.radius ?? 0.8);
      case 'box': {
        const s = dims.size || [0.7, 0.7, 0.7];
        const qx = Math.abs(x) - s[0];
        const qy = Math.abs(y) - s[1];
        const qz = Math.abs(z) - s[2];
        return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, Math.max(qy, qz)), 0);
      }
      case 'cylinder': {
        const h = dims.height ?? 0.8;
        const r = dims.radius ?? 0.5;
        const dx = Math.hypot(x, z) - r;
        const dy = Math.abs(y) - h;
        return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
      }
      case 'torus': {
        const R = dims.radiusMajor ?? 0.7;
        const r = dims.radiusMinor ?? 0.25;
        const qx = Math.hypot(x, z) - R;
        return Math.hypot(qx, y) - r;
      }
      case 'capsule': {
        const h = dims.height ?? 0.6;
        const r = dims.radius ?? 0.35;
        const cy = y - Math.max(-h, Math.min(h, y));
        return Math.hypot(x, cy, z) - r;
      }
      case 'cone': {
        const h = dims.height ?? 0.8;
        const r1 = dims.baseRadius ?? 0.6;
        const r2 = dims.topRadius ?? 0.0;
        const qx = Math.hypot(x, z);
        const k1x = r2, k1y = h;
        const k2x = r2 - r1, k2y = 2.0 * h;
        const caX = qx - Math.min(qx, y < 0 ? r1 : r2);
        const caY = Math.abs(y) - h;
        const dotK2 = k2x * k2x + k2y * k2y;
        const cbX = qx - k1x + k2x * Math.max(0, Math.min(1, ((k1x - qx) * k2x + (k1y - y) * k2y) / dotK2));
        const cbY = y - k1y + k2y * Math.max(0, Math.min(1, ((k1x - qx) * k2x + (k1y - y) * k2y) / dotK2));
        const s = (cbX < 0 && caY < 0) ? -1 : 1;
        return s * Math.sqrt(Math.min(caX * caX + caY * caY, cbX * cbX + cbY * cbY));
      }
      case 'pipe': {
        const h = dims.height ?? 0.8;
        const r = dims.radius ?? 0.5;
        const th = dims.thickness ?? 0.08;
        const d1 = Math.abs(Math.hypot(x, z) - r) - th;
        const d2 = Math.abs(y) - h;
        return Math.min(Math.max(d1, d2), 0) + Math.hypot(Math.max(d1, 0), Math.max(d2, 0));
      }
      case 'hemisphere': {
        const r = dims.radius ?? 0.8;
        return Math.max(Math.hypot(x, y, z) - r, -y);
      }
      case 'ellipsoid': {
        const radii = dims.radii ?? [0.8, 0.6, 0.5];
        const rx = Math.max(radii[0], 0.001);
        const ry = Math.max(radii[1], 0.001);
        const rz = Math.max(radii[2], 0.001);
        const k0 = Math.hypot(x / rx, y / ry, z / rz);
        const k1 = Math.hypot(x / (rx * rx), y / (ry * ry), z / (rz * rz));
        return k0 * (k0 - 1.0) / Math.max(k1, 0.0001);
      }
      case 'pyramid': {
        const h = dims.height ?? 1.0;
        const m2 = h * h + 0.25;
        let px = Math.abs(x);
        let pz = Math.abs(z);
        if (pz > px) {
          const tmp = px; px = pz; pz = tmp;
        }
        px -= 0.5;
        const qx = pz;
        const qy = h * y - 0.5 * px;
        const qz = h * px + 0.5 * y;
        const s = Math.max(-qx, 0.0);
        const t = Math.max(0.0, Math.min(1.0, (qy - 0.5 * pz) / (m2 + 0.25)));
        const a = m2 * (qx + s) * (qx + s) + qy * qy;
        const b = m2 * (qx + 0.5 * t) * (qx + 0.5 * t) + (qy - m2 * t) * (qy - m2 * t);
        const d2 = (qy > 0 && -qx * m2 - qy * 0.5 > 0) ? 0.0 : Math.min(a, b);
        return Math.sqrt((d2 + qz * qz) / m2) * Math.sign(Math.max(qz, -y));
      }
      case 'hexagonal_prism': {
        const r = dims.radius ?? 0.6;
        const h = dims.height ?? 0.7;
        const kx = -0.8660254, ky = 0.5, kz = 0.57735;
        let px = Math.abs(x), py = Math.abs(y);
        const dotK = 2.0 * Math.min(kx * px + ky * py, 0.0);
        px -= dotK * kx;
        py -= dotK * ky;
        const clampedX = Math.max(-kz * r, Math.min(kz * r, px));
        const d1 = Math.hypot(px - clampedX, py - r) * Math.sign(py - r);
        const d2 = Math.abs(z) - h;
        return Math.min(Math.max(d1, d2), 0) + Math.hypot(Math.max(d1, 0), Math.max(d2, 0));
      }
      case 'triangular_prism': {
        const r = dims.radius ?? 0.6;
        const h = dims.height ?? 0.7;
        const qx = Math.abs(x), qy = y, qz = Math.abs(z);
        return Math.max(qz - h, Math.max(qx * 0.866025 + qy * 0.5, -qy) - r * 0.5);
      }
      case 'tetrahedron': {
        const r = dims.radius ?? 0.8;
        const md = Math.max(
          Math.max(-x - y - z, x + y - z),
          Math.max(-x + y + z, x - y + z)
        );
        return (md - r) / Math.sqrt(3.0);
      }
      case 'octahedron': {
        const s = dims.radius ?? 0.8;
        let px = Math.abs(x), py = Math.abs(y), pz = Math.abs(z);
        const m = px + py + pz - s;
        let qx = px, qy = py, qz = pz;
        if (3.0 * px < m) { qx = px; qy = py; qz = pz; }
        else if (3.0 * py < m) { qx = py; qy = pz; qz = px; }
        else if (3.0 * pz < m) { qx = pz; qy = px; qz = py; }
        else return m * 0.57735027;
        const k = Math.max(0.0, Math.min(s, 0.5 * (qz - qy + s)));
        return Math.hypot(qx, qy - s + k, qz - k);
      }
      case 'capped_torus': {
        const ra = dims.radiusMajor ?? 0.7;
        const rb = dims.radiusMinor ?? 0.25;
        const th = (dims.arcAngle ?? Math.PI / 2) * 0.5;
        const scX = Math.sin(th), scY = Math.cos(th);
        const px = Math.abs(x);
        const k = (scY * px > scX * y) ? (px * scX + y * scY) : Math.hypot(px, y);
        return Math.sqrt(Math.max(0.0, x * x + y * y + z * z + ra * ra - 2.0 * ra * k)) - rb;
      }
      case 'chain_link': {
        const le = (dims.linkLength ?? 0.6) * 0.5;
        const r1 = dims.radiusMajor ?? 0.5;
        const r2 = dims.thickness ?? 0.15;
        const qy = Math.max(Math.abs(y) - le, 0.0);
        return Math.hypot(Math.hypot(x, qy) - r1, z) - r2;
      }
      case 'chamfer_cylinder': {
        const h = (dims.height ?? 0.8) * 0.5;
        const r = dims.radius ?? 0.5;
        const c = Math.min(dims.chamfer ?? 0.08, Math.min(r, h));
        const qx = Math.hypot(x, z), qy = Math.abs(y);
        const ux = qx - r, uy = qy - h;
        const dChamfer = (ux + uy + c) * 0.70710678;
        return Math.max(Math.max(ux, uy), dChamfer);
      }
      case 'egg': {
        const ra = Math.max(dims.baseRadius ?? 0.5, 0.001);
        const rb = Math.max(dims.tipRadius ?? 0.25, 0.001);
        const h = dims.height ?? 1.2;
        const r = ra - rb;
        const sc = Math.abs(r) > 0.001 ? h / (1.73205 * Math.abs(r)) : 1.0;
        const qx = Math.hypot(x, z);
        const qy = y / Math.max(sc, 0.001);
        let d = (qy < 0.0) ? (Math.hypot(qx, qy) - r - rb) : (Math.hypot(qx, qy - 1.73205 * r) - rb);
        return d * Math.min(1.0, sc);
      }
      case 'heart': {
        const s = Math.max(dims.radius ?? 0.8, 0.001);
        const h = Math.max(dims.height ?? 0.3, 0.001);
        const qx = Math.abs(x) / s;
        const qy = (y + 0.5 * s) / s;
        const d2d = (qy + qx > 1.0)
          ? Math.hypot(qx - 0.25, qy - 0.75) - 0.35355
          : Math.hypot(qx, qy - 1.0) * (qx >= qy ? 1 : -1);
        const wx = d2d * s;
        const wy = Math.abs(z) - h;
        return Math.min(Math.max(wx, wy), 0) + Math.hypot(Math.max(wx, 0), Math.max(wy, 0));
      }
      case 'star_prism': {
        const r = dims.outerRadius ?? 0.75;
        const h = (dims.height ?? 0.4) * 0.5;
        const qx = Math.abs(x), qy = Math.abs(y);
        const d2d = Math.hypot(qx, qy) - r;
        const wx = d2d;
        const wy = Math.abs(z) - h;
        return Math.min(Math.max(wx, wy), 0) + Math.hypot(Math.max(wx, 0), Math.max(wy, 0));
      }
      default:
        return Math.hypot(x, y, z) - 0.8;
    }
  }
}
