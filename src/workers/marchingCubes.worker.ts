// ========================================================================
// SDF Studio 3D - Marching Cubes Web Worker
// ========================================================================

import { edgeTable, triTable } from './marchingCubesTables';
import type { PrimitiveType, PrimitiveDimensions, CSGConfig, ModifierConfig, MaterialConfig } from '../tree/types';

export interface WorkerNodeData {
  id: string;
  type: PrimitiveType;
  dimensions: PrimitiveDimensions;
  csg: CSGConfig;
  modifiers?: ModifierConfig;
  material?: MaterialConfig;
  inverseMatrix: number[]; // 16 elements column-major
}

export interface WorkerExtractRequest {
  nodes: WorkerNodeData[];
  resolution: number;
  bounds?: {
    min: [number, number, number];
    max: [number, number, number];
  };
}

export type WorkerMessageOut =
  | { type: 'progress'; progress: number }
  | { type: 'complete'; positions: Float32Array; normals: Float32Array }
  | { type: 'error'; error: string };

// ========================================================================
// CPU SDF Primitive Evaluators
// ========================================================================

function sdSphere(x: number, y: number, z: number, r: number): number {
  return Math.hypot(x, y, z) - r;
}

function sdBox(x: number, y: number, z: number, b: [number, number, number]): number {
  const qx = Math.abs(x) - b[0];
  const qy = Math.abs(y) - b[1];
  const qz = Math.abs(z) - b[2];
  const max0x = Math.max(qx, 0.0);
  const max0y = Math.max(qy, 0.0);
  const max0z = Math.max(qz, 0.0);
  const outDist = Math.hypot(max0x, max0y, max0z);
  const inDist = Math.min(Math.max(qx, Math.max(qy, qz)), 0.0);
  return outDist + inDist;
}

function sdCappedCylinder(x: number, y: number, z: number, h: number, r: number): number {
  const dx = Math.hypot(x, z) - r;
  const dy = Math.abs(y) - h;
  const max0x = Math.max(dx, 0.0);
  const max0y = Math.max(dy, 0.0);
  return Math.min(Math.max(dx, dy), 0.0) + Math.hypot(max0x, max0y);
}

function sdTorus(x: number, y: number, z: number, R: number, r: number): number {
  const qx = Math.hypot(x, z) - R;
  return Math.hypot(qx, y) - r;
}

function sdCapsule(x: number, y: number, z: number, h: number, r: number): number {
  const cy = y - Math.max(-h, Math.min(h, y));
  return Math.hypot(x, cy, z) - r;
}

function sdCappedCone(x: number, y: number, z: number, h: number, r1: number, r2: number): number {
  const qx = Math.hypot(x, z);
  const qy = y;
  const k1x = r2;
  const k1y = h;
  const k2x = r2 - r1;
  const k2y = 2.0 * h;
  const caX = qx - Math.min(qx, qy < 0.0 ? r1 : r2);
  const caY = Math.abs(qy) - h;
  const dotK2 = k2x * k2x + k2y * k2y;
  const dotSub = (k1x - qx) * k2x + (k1y - qy) * k2y;
  const t = Math.max(0.0, Math.min(1.0, dotSub / dotK2));
  const cbX = qx - k1x + k2x * t;
  const cbY = qy - k1y + k2y * t;
  const s = cbX < 0.0 && caY < 0.0 ? -1.0 : 1.0;
  return s * Math.sqrt(Math.min(caX * caX + caY * caY, cbX * cbX + cbY * cbY));
}

function sdPipe(x: number, y: number, z: number, h: number, r: number, thickness: number): number {
  const d1 = Math.hypot(x, z) - r;
  const wx = Math.abs(d1) - thickness;
  const wy = Math.abs(y) - h;
  return Math.min(Math.max(wx, wy), 0.0) + Math.hypot(Math.max(wx, 0.0), Math.max(wy, 0.0));
}

function sdHemisphere(x: number, y: number, z: number, r: number): number {
  return Math.max(Math.hypot(x, y, z) - r, -y);
}

function sdEllipsoid(x: number, y: number, z: number, r: [number, number, number]): number {
  const k0 = Math.hypot(x / r[0], y / r[1], z / r[2]);
  const k1 = Math.hypot(x / (r[0] * r[0]), y / (r[1] * r[1]), z / (r[2] * r[2]));
  return k1 > 0 ? (k0 * (k0 - 1.0)) / k1 : k0;
}

function sdSuperellipsoid(x: number, y: number, z: number, r: [number, number, number], e1: number, e2: number): number {
  const qx = Math.abs(x / r[0]);
  const qy = Math.abs(y / r[1]);
  const qz = Math.abs(z / r[2]);
  const t1 = Math.pow(Math.pow(qx, 2.0 / e2) + Math.pow(qy, 2.0 / e2), e2 / e1);
  const val = Math.pow(t1 + Math.pow(qz, 2.0 / e1), e1 * 0.5) - 1.0;
  return val * Math.min(r[0], Math.min(r[1], r[2]));
}

function sdPyramid(x: number, y: number, z: number, h: number): number {
  const m2 = h * h + 0.25;
  let px = Math.abs(x);
  let pz = Math.abs(z);
  if (pz > px) {
    const tmp = px;
    px = pz;
    pz = tmp;
  }
  px -= 0.5;
  const qx = pz;
  const qy = h * y - 0.5 * px;
  const qz = h * px + 0.5 * y;
  const s = Math.max(-qx, 0.0);
  const t = Math.max(0.0, Math.min(1.0, (qy - 0.5 * pz) / (m2 + 0.25)));
  const a = m2 * (qx + s) * (qx + s) + qy * qy;
  const b = m2 * (qx + 0.5 * t) * (qx + 0.5 * t) + (qy - m2 * t) * (qy - m2 * t);
  const d2 = Math.min(qy, -qx * m2 - qy * 0.5) > 0.0 ? 0.0 : Math.min(a, b);
  const sign = Math.max(qz, -y) >= 0 ? 1.0 : -1.0;
  return Math.sqrt((d2 + qz * qz) / m2) * sign;
}

function sdHexPrism(x: number, y: number, z: number, h: [number, number]): number {
  const kx = -0.8660254;
  const ky = 0.5;
  const kz = 0.57735;
  let px = Math.abs(x);
  let py = Math.abs(y);
  const dot = 2.0 * Math.min(kx * px + ky * py, 0.0);
  px -= dot * kx;
  py -= dot * ky;
  const clampedX = Math.max(-kz * h[0], Math.min(kz * h[0], px));
  const signY = py - h[0] < 0 ? -1.0 : 1.0;
  const dx = Math.hypot(px - clampedX, py - h[0]) * signY;
  const dy = Math.abs(z) - h[1];
  return Math.min(Math.max(dx, dy), 0.0) + Math.hypot(Math.max(dx, 0.0), Math.max(dy, 0.0));
}

function sdTriPrism(x: number, y: number, z: number, h: [number, number]): number {
  const qx = Math.abs(x);
  const qy = y;
  const qz = Math.abs(z);
  return Math.max(qz - h[1], Math.max(qx * 0.866025 + qy * 0.5, -qy) - h[0] * 0.5);
}

function sdTetrahedron(x: number, y: number, z: number, r: number): number {
  const md = Math.max(
    Math.max(-x - y - z, x + y - z),
    Math.max(-x + y + z, x - y + z)
  );
  return (md - r) / Math.sqrt(3.0);
}

function sdOctahedron(x: number, y: number, z: number, s: number): number {
  let px = Math.abs(x);
  let py = Math.abs(y);
  let pz = Math.abs(z);
  const m = px + py + pz - s;
  let qx = px, qy = py, qz = pz;
  if (3.0 * px < m) {
    qx = px; qy = py; qz = pz;
  } else if (3.0 * py < m) {
    qx = py; qy = pz; qz = px;
  } else if (3.0 * pz < m) {
    qx = pz; qy = px; qz = py;
  } else {
    return m * 0.57735027;
  }
  const k = Math.max(0.0, Math.min(s, 0.5 * (qz - qy + s)));
  return Math.hypot(qx, qy - s + k, qz - k);
}

function sdMandelbulb(x: number, y: number, z: number): number {
  let wx = x * 0.8;
  let wy = y * 0.8;
  let wz = z * 0.8;
  let m = wx * wx + wy * wy + wz * wz;
  let dz = 1.0;
  for (let i = 0; i < 4; i++) {
    const sqrtM = Math.sqrt(m);
    dz = 8.0 * Math.pow(sqrtM, 7.0) * dz + 1.0;
    const r = sqrtM;
    if (r < 1e-6) break;
    const b = 8.0 * Math.acos(Math.max(-1.0, Math.min(1.0, wy / r)));
    const a = 8.0 * Math.atan2(wx, wz);
    const powR = Math.pow(r, 8.0);
    wx = x * 0.8 + powR * Math.sin(b) * Math.sin(a);
    wy = y * 0.8 + powR * Math.cos(b);
    wz = z * 0.8 + powR * Math.sin(b) * Math.cos(a);
    m = wx * wx + wy * wy + wz * wz;
    if (m > 256.0) break;
  }
  return (0.25 * Math.log(m) * Math.sqrt(m) / dz) / 0.8;
}

function evalPrimitive(type: PrimitiveType, x: number, y: number, z: number, dims: PrimitiveDimensions): number {
  switch (type) {
    case 'sphere':
      return sdSphere(x, y, z, dims.radius ?? 0.8);
    case 'box':
      return sdBox(x, y, z, dims.size ?? [0.7, 0.7, 0.7]);
    case 'cylinder':
      return sdCappedCylinder(x, y, z, dims.height ?? 0.8, dims.radius ?? 0.5);
    case 'torus':
      return sdTorus(x, y, z, dims.radiusMajor ?? 0.7, dims.radiusMinor ?? 0.25);
    case 'capsule':
      return sdCapsule(x, y, z, dims.height ?? 0.6, dims.radius ?? 0.35);
    case 'cone':
      return sdCappedCone(x, y, z, dims.height ?? 0.8, dims.baseRadius ?? 0.6, dims.topRadius ?? 0.0);
    case 'pipe':
      return sdPipe(x, y, z, dims.height ?? 0.8, dims.radius ?? 0.5, dims.thickness ?? 0.08);
    case 'hemisphere':
      return sdHemisphere(x, y, z, dims.radius ?? 0.8);
    case 'ellipsoid':
      return sdEllipsoid(x, y, z, dims.radii ?? (dims.size as [number, number, number]) ?? [0.8, 0.6, 0.5]);
    case 'superellipsoid':
      return sdSuperellipsoid(x, y, z, dims.radii ?? [0.8, 0.6, 0.5], dims.exponents?.[0] ?? 1.0, dims.exponents?.[1] ?? 1.0);
    case 'pyramid':
      return sdPyramid(x, y, z, dims.height ?? 1.0);
    case 'hexagonal_prism':
      return sdHexPrism(x, y, z, [dims.radius ?? 0.6, dims.height ?? 0.7]);
    case 'triangular_prism':
      return sdTriPrism(x, y, z, [dims.radius ?? 0.6, dims.height ?? 0.7]);
    case 'tetrahedron':
      return sdTetrahedron(x, y, z, dims.radius ?? 0.8);
    case 'octahedron':
      return sdOctahedron(x, y, z, dims.radius ?? 0.8);
    case 'mandelbulb':
      return sdMandelbulb(x, y, z);
    case 'plane':
      return y;
    default:
      return sdSphere(x, y, z, 0.8);
  }
}

// ========================================================================
// CSG Booleans & Smooth Operators
// ========================================================================

function sminPolynomial(a: number, b: number, k: number): number {
  if (k <= 0.0001) return Math.min(a, b);
  const h = Math.max(0.0, Math.min(1.0, 0.5 + 0.5 * (b - a) / k));
  return b * (1.0 - h) + a * h - k * h * (1.0 - h);
}

function smaxPolynomial(a: number, b: number, k: number): number {
  return -sminPolynomial(-a, -b, k);
}

// ========================================================================
// AST Scene Distance Evaluator
// ========================================================================

function createSceneEvaluator(nodes: WorkerNodeData[]) {
  return function evalScene(px: number, py: number, pz: number): number {
    if (nodes.length === 0) return 1.0;

    let dAcc = 1000.0;
    let initialized = false;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const m = node.inverseMatrix;

      // Transform world coordinate into node local coordinate
      let lx = m[0] * px + m[4] * py + m[8] * pz + m[12];
      let ly = m[1] * px + m[5] * py + m[9] * pz + m[13];
      let lz = m[2] * px + m[6] * py + m[10] * pz + m[14];

      // Modifiers: Twist
      const twist = node.modifiers?.twistFactor ?? node.modifiers?.twist ?? 0.0;
      if (Math.abs(twist) > 0.001) {
        const c = Math.cos(twist * ly);
        const s = Math.sin(twist * ly);
        const nx = c * lx - s * lz;
        const nz = s * lx + c * lz;
        lx = nx;
        lz = nz;
      }

      // Modifiers: Symmetry
      const mirror = node.modifiers?.mirrorAxis;
      if (mirror === 'x') lx = Math.abs(lx);
      else if (mirror === 'y') ly = Math.abs(ly);
      else if (mirror === 'z') lz = Math.abs(lz);

      // Evaluate Primitive
      let d = evalPrimitive(node.type, lx, ly, lz, node.dimensions);

      // Modifiers: Rounding
      const roundRadius = node.modifiers?.roundRadius ?? 0.0;
      if (roundRadius > 0.0) d -= roundRadius;

      // Modifiers: Shell / Onion
      const shell = node.modifiers?.shellThickness ?? 0.0;
      if (shell > 0.0) d = Math.abs(d) - shell;

      if (!initialized) {
        dAcc = d;
        initialized = true;
        continue;
      }

      const op = node.csg.operation;
      const isSmooth = node.csg.blendMode === 'smooth_polynomial';
      const k = node.csg.blendRadius || 0.0;

      if (op === 'union') {
        dAcc = isSmooth ? sminPolynomial(dAcc, d, k) : Math.min(dAcc, d);
      } else if (op === 'difference') {
        dAcc = isSmooth ? smaxPolynomial(dAcc, -d, k) : Math.max(dAcc, -d);
      } else if (op === 'intersection') {
        dAcc = isSmooth ? smaxPolynomial(dAcc, d, k) : Math.max(dAcc, d);
      }
    }

    return dAcc;
  };
}

// Compute Normal via Central Differences
function computeNormal(evalSDF: (x: number, y: number, z: number) => number, x: number, y: number, z: number, h = 0.001): [number, number, number] {
  const nx = evalSDF(x + h, y, z) - evalSDF(x - h, y, z);
  const ny = evalSDF(x, y + h, z) - evalSDF(x, y - h, z);
  const nz = evalSDF(x, y, z + h) - evalSDF(x, y, z - h);
  const len = Math.hypot(nx, ny, nz);
  if (len > 1e-7) {
    return [nx / len, ny / len, nz / len];
  }
  return [0, 1, 0];
}

// ========================================================================
// Marching Cubes Execution Loop
// ========================================================================

function extractMesh(request: WorkerExtractRequest) {
  const { nodes, resolution } = request;
  const evalSDF = createSceneEvaluator(nodes);

  // Compute dynamic bounding box
  let minB: [number, number, number] = [-2.2, -2.2, -2.2];
  let maxB: [number, number, number] = [2.2, 2.2, 2.2];

  if (request.bounds) {
    minB = [...request.bounds.min];
    maxB = [...request.bounds.max];
  } else if (nodes.length > 0) {
    let bMinX = -1.5, bMinY = -1.5, bMinZ = -1.5;
    let bMaxX = 1.5, bMaxY = 1.5, bMaxZ = 1.5;

    for (const node of nodes) {
      // Invert local origin: node position in world space
      // Since worldMatrix was inverted to get inverseMatrix,
      // approximate position is translation column of worldMatrix or bounds heuristic
      const rad = (node.dimensions.radius || (node.dimensions.size ? Math.max(...node.dimensions.size) : 1.0)) * 1.5;
      // Conservative world padding
      bMinX = Math.min(bMinX, -rad - 1.0);
      bMinY = Math.min(bMinY, -rad - 1.0);
      bMinZ = Math.min(bMinZ, -rad - 1.0);
      bMaxX = Math.max(bMaxX, rad + 1.0);
      bMaxY = Math.max(bMaxY, rad + 1.0);
      bMaxZ = Math.max(bMaxZ, rad + 1.0);
    }
    minB = [bMinX, bMinY, bMinZ];
    maxB = [bMaxX, bMaxY, bMaxZ];
  }

  const res = Math.max(8, Math.min(256, Math.floor(resolution)));
  const sizeX = res + 1;
  const sizeY = res + 1;
  const sizeZ = res + 1;
  const totalGridPoints = sizeX * sizeY * sizeZ;

  const stepX = (maxB[0] - minB[0]) / res;
  const stepY = (maxB[1] - minB[1]) / res;
  const stepZ = (maxB[2] - minB[2]) / res;

  const field = new Float32Array(totalGridPoints);

  // 1. Sample 3D Grid
  let ptr = 0;
  for (let z = 0; z < sizeZ; z++) {
    const fz = minB[2] + z * stepZ;
    for (let y = 0; y < sizeY; y++) {
      const fy = minB[1] + y * stepY;
      for (let x = 0; x < sizeX; x++) {
        const fx = minB[0] + x * stepX;
        field[ptr++] = evalSDF(fx, fy, fz);
      }
    }
    if (z % 4 === 0 || z === sizeZ - 1) {
      const progress = (z + 1) / sizeZ * 0.55;
      self.postMessage({ type: 'progress', progress });
    }
  }

  // 2. Polygonize Cubes
  const posChunks: number[] = [];
  const normChunks: number[] = [];

  const yd = sizeX;
  const zd = sizeX * sizeY;

  const vlist: Array<[number, number, number]> = new Array(12);

  function interp(p1: [number, number, number], p2: [number, number, number], v1: number, v2: number): [number, number, number] {
    const diff = v2 - v1;
    const t = Math.abs(diff) > 1e-6 ? Math.max(0.0, Math.min(1.0, (0.0 - v1) / diff)) : 0.5;
    return [
      p1[0] + t * (p2[0] - p1[0]),
      p1[1] + t * (p2[1] - p1[1]),
      p1[2] + t * (p2[2] - p1[2])
    ];
  }

  const hNorm = Math.min(stepX, Math.min(stepY, stepZ)) * 0.4;

  for (let z = 0; z < res; z++) {
    const fz = minB[2] + z * stepZ;
    const fz2 = fz + stepZ;
    const zOffset = z * zd;

    for (let y = 0; y < res; y++) {
      const fy = minB[1] + y * stepY;
      const fy2 = fy + stepY;
      const yOffset = zOffset + y * yd;

      for (let x = 0; x < res; x++) {
        const fx = minB[0] + x * stepX;
        const fx2 = fx + stepX;
        const q = yOffset + x;

        const q1 = q + 1;
        const qy = q + yd;
        const qz = q + zd;
        const q1y = q1 + yd;
        const q1z = q1 + zd;
        const qyz = qy + zd;
        const q1yz = q1y + zd;

        const f0 = field[q];
        const f1 = field[q1];
        const f2 = field[qy];
        const f3 = field[q1y];
        const f4 = field[qz];
        const f5 = field[q1z];
        const f6 = field[qyz];
        const f7 = field[q1yz];

        let cubeindex = 0;
        if (f0 < 0) cubeindex |= 1;
        if (f1 < 0) cubeindex |= 2;
        if (f2 < 0) cubeindex |= 8;
        if (f3 < 0) cubeindex |= 4;
        if (f4 < 0) cubeindex |= 16;
        if (f5 < 0) cubeindex |= 32;
        if (f6 < 0) cubeindex |= 128;
        if (f7 < 0) cubeindex |= 64;

        const bits = edgeTable[cubeindex];
        if (bits === 0) continue;

        const p0: [number, number, number] = [fx, fy, fz];
        const p1: [number, number, number] = [fx2, fy, fz];
        const p2: [number, number, number] = [fx, fy2, fz];
        const p3: [number, number, number] = [fx2, fy2, fz];
        const p4: [number, number, number] = [fx, fy, fz2];
        const p5: [number, number, number] = [fx2, fy, fz2];
        const p6: [number, number, number] = [fx, fy2, fz2];
        const p7: [number, number, number] = [fx2, fy2, fz2];

        if (bits & 1) vlist[0] = interp(p0, p1, f0, f1);
        if (bits & 2) vlist[1] = interp(p1, p3, f1, f3);
        if (bits & 4) vlist[2] = interp(p2, p3, f2, f3);
        if (bits & 8) vlist[3] = interp(p0, p2, f0, f2);
        if (bits & 16) vlist[4] = interp(p4, p5, f4, f5);
        if (bits & 32) vlist[5] = interp(p5, p7, f5, f7);
        if (bits & 64) vlist[6] = interp(p6, p7, f6, f7);
        if (bits & 128) vlist[7] = interp(p4, p6, f4, f6);
        if (bits & 256) vlist[8] = interp(p0, p4, f0, f4);
        if (bits & 512) vlist[9] = interp(p1, p5, f1, f5);
        if (bits & 1024) vlist[10] = interp(p3, p7, f3, f7);
        if (bits & 2048) vlist[11] = interp(p2, p6, f2, f6);

        let triIdx = cubeindex * 16;
        while (triTable[triIdx] !== -1) {
          const e1 = triTable[triIdx];
          const e2 = triTable[triIdx + 1];
          const e3 = triTable[triIdx + 2];

          // Swap e2 and e3 for standard outward CCW winding
          const vA = vlist[e1];
          const vB = vlist[e3];
          const vC = vlist[e2];

          const nA = computeNormal(evalSDF, vA[0], vA[1], vA[2], hNorm);
          const nB = computeNormal(evalSDF, vB[0], vB[1], vB[2], hNorm);
          const nC = computeNormal(evalSDF, vC[0], vC[1], vC[2], hNorm);

          posChunks.push(vA[0], vA[1], vA[2], vB[0], vB[1], vB[2], vC[0], vC[1], vC[2]);
          normChunks.push(nA[0], nA[1], nA[2], nB[0], nB[1], nB[2], nC[0], nC[1], nC[2]);

          triIdx += 3;
        }
      }
    }

    if (z % 4 === 0 || z === res - 1) {
      const progress = 0.55 + ((z + 1) / res) * 0.45;
      self.postMessage({ type: 'progress', progress });
    }
  }

  const positions = new Float32Array(posChunks);
  const normals = new Float32Array(normChunks);

  (self as any).postMessage(
    { type: 'complete', positions, normals },
    [positions.buffer, normals.buffer]
  );
}

// ========================================================================
// Worker Listener
// ========================================================================

self.onmessage = (event: MessageEvent<WorkerExtractRequest>) => {
  try {
    extractMesh(event.data);
  } catch (err: any) {
    self.postMessage({ type: 'error', error: err?.message || String(err) });
  }
};
