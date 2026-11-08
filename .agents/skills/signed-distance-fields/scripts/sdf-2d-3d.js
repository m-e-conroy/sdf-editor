/**
 * @file sdf-2d-3d.js
 * @description Zero-dependency CPU Signed Distance Field (SDF) utility library
 * derived from "Computational Distance Geometry and Visual Applications".
 * Provides 2D/3D exact primitives, CSG & smooth minimum operators, domain transforms,
 * numerical gradients/normals, CPU sphere tracing, contact resolution, and 2D Jump Flooding (JFA).
 */

// ============================================================================
// 1. Vector Helpers (2D & 3D)
// ============================================================================
export const Vec2 = {
  len: (x, y) => Math.hypot(x, y),
  dot: (ax, ay, bx, by) => ax * bx + ay * by,
  clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
};

export const Vec3 = {
  len: (p) => Math.hypot(p.x, p.y, p.z),
  dot: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
  sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  scale: (v, s) => ({ x: v.x * s, y: v.y * s, z: v.z * s }),
  abs: (v) => ({ x: Math.abs(v.x), y: Math.abs(v.y), z: Math.abs(v.z) }),
  maxScalar: (v, s) => ({ x: Math.max(v.x, s), y: Math.max(v.y, s), z: Math.max(v.z, s) }),
  normalize: (v) => {
    const l = Math.hypot(v.x, v.y, v.z);
    return l > 1e-12 ? { x: v.x / l, y: v.y / l, z: v.z / l } : { x: 0, y: 1, z: 0 };
  },
};

// ============================================================================
// 2. Exact 2D SDF Primitives
// ============================================================================
export function sdCircle2D(p, r) {
  return Math.hypot(p.x, p.y) - r;
}

export function sdBox2D(p, b) {
  const qx = Math.abs(p.x) - b.x;
  const qy = Math.abs(p.y) - b.y;
  const outDist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inDist = Math.min(Math.max(qx, qy), 0);
  return outDist + inDist;
}

export function sdSegment2D(p, a, b, r = 0) {
  const pax = p.x - a.x, pay = p.y - a.y;
  const bax = b.x - a.x, bay = b.y - a.y;
  const denom = bax * bax + bay * bay;
  const h = denom > 1e-12 ? Vec2.clamp((pax * bax + pay * bay) / denom, 0, 1) : 0;
  return Math.hypot(pax - bax * h, pay - bay * h) - r;
}

// ============================================================================
// 3. Exact 3D SDF Primitives
// ============================================================================
export function sdSphere(p, r) {
  return Vec3.len(p) - r;
}

export function sdBox(p, b) {
  const q = {
    x: Math.abs(p.x) - b.x,
    y: Math.abs(p.y) - b.y,
    z: Math.abs(p.z) - b.z,
  };
  const outDist = Vec3.len(Vec3.maxScalar(q, 0));
  const inDist = Math.min(Math.max(q.x, q.y, q.z), 0);
  return outDist + inDist;
}

export function sdRoundBox(p, b, r) {
  return sdBox(p, { x: b.x - r, y: b.y - r, z: b.z - r }) - r;
}

export function sdTorus(p, majorR, minorR) {
  const qx = Math.hypot(p.x, p.z) - majorR;
  return Math.hypot(qx, p.y) - minorR;
}

export function sdCapsule(p, a, b, r) {
  const pa = Vec3.sub(p, a);
  const ba = Vec3.sub(b, a);
  const denom = Vec3.dot(ba, ba);
  const h = denom > 1e-12 ? Vec2.clamp(Vec3.dot(pa, ba) / denom, 0, 1) : 0;
  return Vec3.len(Vec3.sub(pa, Vec3.scale(ba, h))) - r;
}

// ============================================================================
// 4. CSG Booleans, Smooth Minimum (smin), and Domain Modifiers
// ============================================================================
export const opUnion = (d1, d2) => Math.min(d1, d2);
export const opIntersection = (d1, d2) => Math.max(d1, d2);
export const opDifference = (d1, d2) => Math.max(d1, -d2);
export const opRound = (d, r) => d - r;
export const opOnion = (d, thickness) => Math.abs(d) - thickness;

export function sminPolynomial(a, b, k) {
  if (k <= 1e-9) return Math.min(a, b);
  const h = Vec2.clamp(0.5 + (0.5 * (b - a)) / k, 0.0, 1.0);
  return b * (1.0 - h) + a * h - k * h * (1.0 - h);
}

export function sminCubic(a, b, k) {
  if (k <= 1e-9) return Math.min(a, b);
  const k6 = k * 6.0;
  const h = Math.max(k6 - Math.abs(a - b), 0.0) / k6;
  return Math.min(a, b) - h * h * h * k6 * (1.0 / 6.0);
}

export function opRepeatLimited(p, spacing, limit) {
  return {
    x: p.x - spacing * Vec2.clamp(Math.round(p.x / spacing), -limit.x, limit.x),
    y: p.y - spacing * Vec2.clamp(Math.round(p.y / spacing), -limit.y, limit.y),
    z: p.z - spacing * Vec2.clamp(Math.round(p.z / spacing), -limit.z, limit.z),
  };
}

// ============================================================================
// 5. Gradient / Surface Normal, Sphere Tracing, and Collision Contact Query
// ============================================================================

/**
 * Computes unit surface normal or steepest distance ascent via 4-tap IQ Tetrahedron method.
 * @param {(p: {x:number,y:number,z:number}) => number} sdfFn
 * @param {{x:number,y:number,z:number}} p
 * @param {number} [eps=1e-4]
 */
export function calcNormal3D(sdfFn, p, eps = 1e-4) {
  const d0 = sdfFn({ x: p.x + eps, y: p.y - eps, z: p.z - eps });
  const d1 = sdfFn({ x: p.x - eps, y: p.y - eps, z: p.z + eps });
  const d2 = sdfFn({ x: p.x - eps, y: p.y + eps, z: p.z - eps });
  const d3 = sdfFn({ x: p.x + eps, y: p.y + eps, z: p.z + eps });
  return Vec3.normalize({
    x: d0 - d1 - d2 + d3,
    y: -d0 - d1 + d2 + d3,
    z: -d0 + d1 - d2 + d3,
  });
}

/**
 * Sphere-traces a 3D SDF along ray r(t) = ro + t * rd.
 */
export function sphereTrace3D(sdfFn, ro, rd, { maxSteps = 128, maxDist = 100, surfDist = 1e-4, stepScale = 1.0 } = {}) {
  let t = 0;
  for (let step = 0; step < maxSteps; step++) {
    const p = Vec3.add(ro, Vec3.scale(rd, t));
    const d = sdfFn(p);
    if (Math.abs(d) < surfDist) {
      return { hit: true, t, steps: step + 1, point: p, normal: calcNormal3D(sdfFn, p) };
    }
    t += d * stepScale;
    if (t >= maxDist) break;
  }
  return { hit: false, t, steps: maxSteps, point: null, normal: null };
}

/**
 * Resolves O(1) point/sphere collision against an arbitrary 3D SDF.
 */
export function querySDFContact(sdfFn, point, radius = 0) {
  const rawDist = sdfFn(point);
  const signedSeparation = rawDist - radius;
  const normal = calcNormal3D(sdfFn, point);
  const closestSurfacePoint = Vec3.sub(point, Vec3.scale(normal, rawDist));
  return {
    penetrating: signedSeparation <= 0,
    penetrationDepth: Math.max(0, -signedSeparation),
    signedDistance: signedSeparation,
    normal,
    closestSurfacePoint,
  };
}

// ============================================================================
// 6. 2D Jump Flooding Algorithm (JFA) for Distance Transform & Voronoi
// ============================================================================

/**
 * Computes a 2D Voronoi seed map and Euclidean distance field from a binary mask using JFA.
 * @param {Uint8Array|boolean[]} mask - Length width * height (truthy = seed pixel)
 * @param {number} width
 * @param {number} height
 */
export function computeJFA2D(mask, width, height) {
  const total = width * height;
  let seedsX = new Int32Array(total).fill(-1);
  let seedsY = new Int32Array(total).fill(-1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx]) {
        seedsX[idx] = x;
        seedsY[idx] = y;
      }
    }
  }

  const maxDim = Math.max(width, height);
  let step = 1 << Math.ceil(Math.log2(maxDim) - 1);

  const runPass = (stepSize) => {
    const nextX = new Int32Array(seedsX);
    const nextY = new Int32Array(seedsY);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        let bestSX = nextX[idx];
        let bestSY = nextY[idx];
        let bestDistSq = bestSX >= 0 ? (x - bestSX) ** 2 + (y - bestSY) ** 2 : Infinity;

        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy * stepSize;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx * stepSize;
            if (nx < 0 || nx >= width) continue;
            const nIdx = ny * width + nx;
            const sx = seedsX[nIdx];
            const sy = seedsY[nIdx];
            if (sx >= 0) {
              const dSq = (x - sx) ** 2 + (y - sy) ** 2;
              if (dSq < bestDistSq) {
                bestDistSq = dSq;
                bestSX = sx;
                bestSY = sy;
              }
            }
          }
        }
        nextX[idx] = bestSX;
        nextY[idx] = bestSY;
      }
    }
    seedsX = nextX;
    seedsY = nextY;
  };

  while (step >= 1) {
    runPass(step);
    step >>= 1;
  }
  // JFA+1 pass for sub-pixel accuracy
  runPass(1);

  const distances = new Float32Array(total);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const sx = seedsX[idx];
      const sy = seedsY[idx];
      distances[idx] = sx >= 0 ? Math.hypot(x - sx, y - sy) : Infinity;
    }
  }

  return { distances, seedsX, seedsY };
}

