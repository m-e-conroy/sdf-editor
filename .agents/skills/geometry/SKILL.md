---
name: geometry
description: Euclidean geometry for games/rendering/simulation: planes, line-plane intersections, raycasting, collision detection, bounding volumes, vectors, normals, spatial tests. Use for hit detection, physics, ray-vs-mesh intersection, frustum culling, overlap tests, AABB, OBB, sweep tests, point-in-triangle, closest-point queries, spatial math. Trigger: "check if ray hits", "plane equation", "find face normal", "where line cross", "is point inside", "detect collision", "bounding box overlap", "distance to plane", vectors, dot/cross products.
---

# Geometry

## When to Use

Hit detection, physics, ray-vs-mesh, frustum culling, overlap, AABB/OBB, sweep, point-in-triangle, closest-point, splines, Voronoi, spatial math.

## Instructions

1. **Identify Problem**: Primitive intersection, spatial partition, collision, or procedural.
2. **Euclidean Fundamentals**: Use vectors, dot, cross. Avoid trig (sin/cos) if vector equivalent exists.
3. **Edge Cases**: Check degenerate cases (zero-length vectors, parallel, float `EPSILON`).
4. **Select Algorithm**:
   - Broad: AABB, bounding sphere.
   - Narrow: SAT, GJK.
   - Mesh: Möller–Trumbore.
   - Curves: Bézier, Catmull-Rom.

## Output Format

1. **Geometric Strategy**: Approach + rationale.
2. **Implementation**: Code/pseudocode + math comments.
3. **Edge Cases**: List pitfalls (parallel, divide by zero).

---

## Euclidean Fundamentals

### The Building Blocks

| Primitive | Definition in code |
| :--- | :--- |
| **Point** | Position: `{x, y, z}` — no size, no direction |
| **Vector** | Displacement/direction: `{x, y, z}` — no fixed position |
| **Line** | `P(t) = origin + t * direction` — infinite, parametric |
| **Ray** | Line with `t ≥ 0` — start point, extends forever |
| **Segment** | `P(t) = A + t * (B - A)`, `t ∈ [0, 1]` — bounded ends |
| **Plane** | Points satisfying `dot(N, P) = d` — infinite flat surface |
| **Triangle** | Three vertices A, B, C — mesh unit |

Points translate. Vectors do not.

---

## Vectors — The Core Tool

### Essential Operations

```js
// Dot product — measures alignment; result is a scalar
function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Cross product — produces a vector perpendicular to both inputs
function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

// Length (magnitude)
function length(v) {
  return Math.sqrt(dot(v, v));
}

// Normalise — make unit length (length = 1)
function normalise(v) {
  const len = length(v);
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function scale(v, s) { return { x: v.x * s, y: v.y * s, z: v.z * s }; }
```

### What the Dot Product Tells You

`dot(A, B) = |A| |B| cos(θ)`. Unit vectors: dot = cos(angle).

| Value | Meaning |
| :--- | :--- |
| `dot > 0` | Point roughly same direction (angle < 90°) |
| `dot = 0` | Perpendicular |
| `dot < 0` | Point away from each other (angle > 90°) |
| `dot = 1` | Identical directions (unit vectors) |
| `dot = -1` | Opposite directions (unit vectors) |

Fast test for camera facing, view cone, lighting.

### What the Cross Product Gives You

`cross(A, B)` perpendicular to both, mag `|A| |B| sin(θ)`.

- **Face normal:** `cross(B - A, C - A)` for triangle ABC
- **Winding check:** cross direction tells CW vs CCW
- **Triangle area:** `length(cross(B - A, C - A)) / 2`

---

## Planes

Plane divides space. Defined by **normal** (unit) and **signed distance**: `dot(N, P) - d = 0`.

- `dot(N, P) - d > 0` → point P in front
- `dot(N, P) - d < 0` → point P behind
- `dot(N, P) - d = 0` → point P on plane

### Computing a Plane from Three Points

```js
function planeFromPoints(a, b, c) {
  const normal = normalise(cross(sub(b, a), sub(c, a)));
  const d = dot(normal, a);
  return { normal, d };
}
```

### Signed Distance from a Point to a Plane

```js
function signedDist(plane, point) {
  return dot(plane.normal, point) - plane.d;
}
```

Used in frustum cull, BSP. Pos = front; neg = behind; abs = distance.

---

## Raycasting

Ray: `P(t) = origin + t * direction`, `t ≥ 0`. Find smallest positive `t`.

### Ray vs. Plane

```js
function rayPlane(rayOrigin, rayDir, plane) {
  const denom = dot(plane.normal, rayDir);
  if (Math.abs(denom) < 1e-6) return null; // parallel
  const t = (plane.d - dot(plane.normal, rayOrigin)) / denom;
  return t >= 0 ? t : null;
}
```

### Ray vs. Triangle (Möller–Trumbore)

Uses barycentric coords to interpolate UVs, normals.

```js
function rayTriangle(orig, dir, A, B, C) {
  const EPSILON = 1e-8;
  const edge1 = sub(B, A);
  const edge2 = sub(C, A);
  const h = cross(dir, edge2);
  const a = dot(edge1, h);
  if (Math.abs(a) < EPSILON) return null; // parallel

  const f = 1.0 / a;
  const s = sub(orig, A);
  const u = f * dot(s, h);
  if (u < 0 || u > 1) return null;

  const q = cross(s, edge1);
  const v = f * dot(dir, q);
  if (v < 0 || u + v > 1) return null;

  const t = f * dot(edge2, q);
  return t > EPSILON ? { t, u, v } : null;
}
```

Interpolate vertex attributes:
```js
const w = 1 - u - v;
const interp = add(add(scale(attrA, w), scale(attrB, u)), scale(attrC, v));
```

### Ray vs. Sphere

```js
function raySphere(orig, dir, centre, radius) {
  const oc = sub(orig, centre);
  const b = dot(oc, dir);
  const c = dot(oc, oc) - radius * radius;
  const disc = b * b - c;
  if (disc < 0) return null;
  const t = -b - Math.sqrt(disc);
  return t >= 0 ? t : -b + Math.sqrt(disc) >= 0 ? -b + Math.sqrt(disc) : null;
}
```

### Ray vs. AABB (Slab Method)

```js
function rayAABB(orig, dir, min, max) {
  let tmin = -Infinity, tmax = Infinity;
  for (const axis of ["x", "y", "z"]) {
    if (Math.abs(dir[axis]) < 1e-8) {
      if (orig[axis] < min[axis] || orig[axis] > max[axis]) return null;
    } else {
      const invD = 1 / dir[axis];
      let t1 = (min[axis] - orig[axis]) * invD;
      let t2 = (max[axis] - orig[axis]) * invD;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
  }
  return tmin >= 0 ? tmin : tmax >= 0 ? tmax : null;
}
```

---

## Collision Detection

### Point Tests

**Point inside AABB:**
```js
function pointInAABB(p, min, max) {
  return p.x >= min.x && p.x <= max.x && p.y >= min.y && p.y <= max.y && p.z >= min.z && p.z <= max.z;
}
```

**Point inside sphere (squared distance):**
```js
function pointInSphere(p, centre, radius) {
  const d = sub(p, centre);
  return dot(d, d) <= radius * radius;
}
```

**Point inside triangle (2D):**
```js
function pointInTriangle2D(p, A, B, C) {
  function sign(p1, p2, p3) { return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y); }
  const d1 = sign(p, A, B), d2 = sign(p, B, C), d3 = sign(p, C, A);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}
```

### AABB vs. AABB Overlap

```js
function aabbOverlap(minA, maxA, minB, maxB) {
  return minA.x <= maxB.x && maxA.x >= minB.x && minA.y <= maxB.y && maxA.y >= minB.y && minA.z <= maxB.z && maxA.z >= minB.z;
}
```
Overlap if all three axis intervals overlap.

### Sphere vs. Sphere

```js
function sphereOverlap(centreA, rA, centreB, rB) {
  const d = sub(centreA, centreB);
  return dot(d, d) <= (rA + rB) * (rA + rB);
}
```

### Closest Point on Segment to Point

```js
function closestPointOnSegment(A, B, P) {
  const AB = sub(B, A);
  const t = dot(sub(P, A), AB) / dot(AB, AB);
  return add(A, scale(AB, Math.max(0, Math.min(1, t))));
}
```

### Separating Axis Theorem (SAT)

Shapes do not overlap if projection on any axis is disjoint.
OBBs test: 3 normals A + 3 normals B + 9 cross products.

---

## Normals, Winding, and Backface Culling

### Face Normal
```js
function faceNormal(A, B, C) { return normalise(cross(sub(B, A), sub(C, A))); }
```
Winding: CCW (OpenGL default), CW (Direct3D default).

### Backface Culling
```js
// viewDir points camera to surface
function isFrontFacing(normal, viewDir) { return dot(normal, viewDir) < 0; }
```

### Reflecting a Vector
```js
// incident points to surface; normal points away
function reflect(incident, normal) { return sub(incident, scale(normal, 2 * dot(incident, normal))); }
```

---

## Coordinate Systems and Transforms

### Local vs. World Space
Transforms via matrices. Normal transformation uses inverse-transpose model matrix.

### Perspective Projection (3D → 2D)
```
screenX = (point.x / -point.z) * focalLength
screenY = (point.y / -point.z) * focalLength
```
`focalLength = 1 / tan(fovY / 2)`.

### Homogeneous Coordinates
4D space: **Point** `w=1`, **Direction** `w=0`. Prevents direction translation.

---

## Frustum Culling

Six planes. Cull if object entirely on wrong side of any plane.

```js
function sphereInFrustum(planes, centre, radius) {
  for (const plane of planes) { if (signedDist(plane, centre) < -radius) return false; }
  return true;
}
```

---

## Distances

Use `Math.hypot`. Prefer squared distance `distSq` for comparisons to avoid square root.

```js
const distSq = (bx - ax) ** 2 + (by - ay) ** 2 + (bz - az) ** 2;
```

---

## Advanced Geometric Patterns

### Bézier Curves (Quadratic & Cubic)

```js
function lerpVec(a, b, t) { return add(a, scale(sub(b, a), t)); }
function quadraticBezier(p0, p1, p2, t) {
  const l1 = lerpVec(p0, p1, t), l2 = lerpVec(p1, p2, t);
  return lerpVec(l1, l2, t);
}
function cubicBezier(p0, p1, p2, p3, t) {
  const l1 = quadraticBezier(p0, p1, p2, t), l2 = quadraticBezier(p1, p2, p3, t);
  return lerpVec(l1, l2, t);
}
```

### Spatial Partitioning
- **Quadtree/Octree**: Area lookups.
- **BVH**: Raytracing acceleration.
- **Spatial Hash**: Grid for dense particles.

### Voronoi & Delaunay Triangulation
- **Delaunay**: Maximize min angle.
- **Voronoi**: Closest-seed cell partitions. Used for shattering, cell structures.

---

## Examples

**Input:** "Write a function to check if a ray hits an AABB."

**Geometric Strategy:** Slab Method. Box has 3 pairs parallel planes. Ray hits if largest `tmin` ≤ smallest `tmax`.

**Implementation:**
```js
function rayAABB(orig, dir, min, max) {
  let tmin = -Infinity, tmax = Infinity;
  for (const axis of ["x", "y", "z"]) {
    if (Math.abs(dir[axis]) < 1e-8) {
      if (orig[axis] < min[axis] || orig[axis] > max[axis]) return null;
    } else {
      const invD = 1 / dir[axis];
      let t1 = (min[axis] - orig[axis]) * invD;
      let t2 = (max[axis] - orig[axis]) * invD;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
  }
  return tmin >= 0 ? tmin : (tmax >= 0 ? tmax : null);
}
```

**Edge Cases:** Parallel rays, origin inside box.

---

## Common Mistakes

| Mistake | Fix |
| :--- | :--- |
| Normalise zero-length vector | Guard: `if (length(v) < 1e-8) return fallback` |
| Forget `t ≥ 0` in ray tests | Negative `t` means hit is behind origin |
| Raw dot product for angle | Normalise both vectors first |
| Unnormalised plane normal | Signed distance will be scaled |
| Transform normal with model | Use inverse-transpose |
| AABB overlap check `<` not `<=` | Touch surfaces overlap in physics |
| Euler angles for rotation | Use quaternions to avoid gimbal lock |

---

## Quick Reference

| Query | Pattern |
| :--- | :--- |
| Face normal | `normalise(cross(B−A, C−A))` |
| Signed distance to plane | `dot(N, P) − d` |
| Ray hits plane at | `t = (d − dot(N, orig)) / dot(N, dir)` |
| Point on ray | `orig + t * dir` |
| AABB overlap | All 3 axis intervals overlap |
| Sphere overlap | `distSq ≤ (rA + rB)²` |
| Backface cull | `dot(N, camToSurf) ≥ 0` → skip |
| Reflect vector | `I − 2·dot(I,N)·N` |
| Closest point on segment | Clamp `t = dot(P−A, B−A) / dot(B−A, B−A)` to `[0,1]` |
| Interpolate at hit | Barycentric coords `(u, v, 1−u−v)` from ray-triangle |

---

## Resources

- [Geometry — Math is Fun](https://www.mathsisfun.com/geometry/)
- [Solid Geometry — Math is Fun](https://www.mathsisfun.com/geometry/solid-geometry.html)
- [Pythagoras in 3D — Math is Fun](https://www.mathsisfun.com/geometry/pythagoras-3d.html)

## Related Skills

- **linear-algebra** — underpinning math.
- **trigonometry** — angles/rotations.
- **physics** — motion/forces on geometry.
- **[game-math](../game-math/SKILL.md)** — engine implementation/pipelines.
