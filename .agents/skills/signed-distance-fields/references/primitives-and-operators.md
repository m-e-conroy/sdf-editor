# SDF Primitives, CSG Booleans, and Domain Operators Reference

Comprehensive mathematical and GLSL reference derived from *Computational Distance Geometry and Visual Applications* (Inigo Quilez `distfunctions` / `distfunctions2d` / `smin`, Distance Estimator Compendium, and Max-Norm Distance Computation).

---

## 1. Mathematical Foundations

### Signed Distance Function Definition
Given a subset $\Omega \subset \mathbb{R}^n$ with boundary $\partial\Omega$, the Euclidean Signed Distance Function $f: \mathbb{R}^n \to \mathbb{R}$ is:
$$f(\mathbf{p}) = \begin{cases} -d(\mathbf{p}, \partial\Omega) & \text{if } \mathbf{p} \in \text{interior}(\Omega) \\ 0 & \text{if } \mathbf{p} \in \partial\Omega \\ +d(\mathbf{p}, \partial\Omega) & \text{if } \mathbf{p} \in \text{exterior}(\Omega) \end{cases}$$
where $d(\mathbf{p}, \partial\Omega) = \inf_{\mathbf{y} \in \partial\Omega} \|\mathbf{p} - \mathbf{y}\|_2$.

### The Eikonal Equation & 1-Lipschitz Continuity
For any piecewise smooth boundary $\partial\Omega$, an exact Euclidean SDF is differentiable almost everywhere (except on the medial axis / equidistant skeleton) and satisfies the **Eikonal equation**:
$$\|\nabla f(\mathbf{p})\|_2 = 1$$
- On the surface ($f(\mathbf{p}) = 0$), the gradient $\mathbf{n} = \nabla f(\mathbf{p})$ is the exact unit outward surface normal.
- Off the surface, $\mathbf{p}_{\text{closest}} = \mathbf{p} - f(\mathbf{p}) \nabla f(\mathbf{p})$ projects $\mathbf{p}$ directly onto the nearest surface point in $O(1)$ time.
- Every exact SDF satisfies **1-Lipschitz continuity**:
  $$|f(\mathbf{x}) - f(\mathbf{y})| \le \|\mathbf{x} - \mathbf{y}\|_2 \quad \forall \mathbf{x}, \mathbf{y} \in \mathbb{R}^n$$

### Exact SDFs vs. Signed Distance Bounds (SDBs)
A function $f_S(\mathbf{p})$ is a valid **Signed Distance Bound (SDB)** (lower-bound distance estimator) if and only if:
$$|f_S(\mathbf{p})| \le \inf_{\mathbf{y} \in f_S^{-1}(0)} \|\mathbf{p} - \mathbf{y}\|_2$$
- **Underestimation ($\|\nabla f_S\| > 1$, so $|f_S| \le d_{\text{true}}$)**: Safe for sphere tracing; increases iteration count.
- **Overestimation ($\|\nabla f_S\| < 1$, so $|f_S| > d_{\text{true}}$)**: Unsafe; causes sphere tracing to step past thin surfaces, producing holes and clipping artifacts. Fix by multiplying steps by $\lambda = \frac{1}{\sup \|\nabla f_S\|} \in (0, 1)$.

---

## 2. Exact 2D SDF Primitives (GLSL)

```glsl
// 1. Circle (Exact)
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

// 2. Axis-Aligned Box (Exact)
float sdBox2D(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// 3. Rounded Box with per-corner radii r = (top-right, bottom-right, top-left, bottom-left) (Exact)
float sdRoundedBox2D(vec2 p, vec2 b, vec4 r) {
    r.xy = (p.x > 0.0) ? r.xy : r.zw;
    r.x  = (p.y > 0.0) ? r.x  : r.y;
    vec2 q = abs(p) - b + r.x;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
}

// 4. Line Segment / 2D Capsule (Exact)
float sdSegment2D(vec2 p, vec2 a, vec2 b, float r) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

// 5. Equilateral Triangle (Exact)
float sdEquilateralTriangle(vec2 p, float r) {
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r / k;
    if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -2.0 * r, 0.0);
    return -length(p) * sign(p.y);
}

// 6. Regular Hexagon (Exact)
float sdHexagon(vec2 p, float r) {
    const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
    p = abs(p);
    p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
    p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
    return length(p) * sign(p.y);
}

// 7. Arbitrary 2D Polygon of N vertices (Exact)
float sdPolygon(vec2 p, vec2[N] v) {
    float d = dot(p - v[0], p - v[0]);
    float s = 1.0;
    for (int i = 0, j = N - 1; i < N; j = i, i++) {
        vec2 e = v[j] - v[i];
        vec2 w = p - v[i];
        vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
        d = min(d, dot(b, b));
        bvec3 c = bvec3(p.y >= v[i].y, p.y < v[j].y, e.x * w.y > e.y * w.x);
        if (all(c) || all(not(c))) s *= -1.0;
    }
    return s * sqrt(d);
}
```

---

## 3. Exact & Bound 3D SDF Primitives (GLSL)

```glsl
// 1. Sphere (Exact)
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

// 2. Axis-Aligned Box (Exact)
float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// 3. Round Box (Exact)
float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// 4. Plane (Exact when n is normalized)
float sdPlane(vec3 p, vec3 n, float h) {
    return dot(p, n) + h;
}

// 5. Torus (Exact) — t.x = major radius R, t.y = minor radius r
float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

// 6. Capped Cylinder (Exact) — h = half-height, r = radius
float sdCappedCylinder(vec3 p, float h, float r) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

// 7. Capsule / Line Segment (Exact)
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

// 8. Vertical Capsule (Exact)
float sdVerticalCapsule(vec3 p, float h, float r) {
    p.y -= clamp(p.y, 0.0, h);
    return length(p) - r;
}

// 9. Capped Cone (Exact) — h = half-height, r1 = base radius, r2 = top radius
float sdCappedCone(vec3 p, float h, float r1, float r2) {
    vec2 q = vec2(length(p.xz), p.y);
    vec2 k1 = vec2(r2, h);
    vec2 k2 = vec2(r2 - r1, 2.0 * h);
    vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r1 : r2), abs(q.y) - h);
    vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0.0, 1.0);
    float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
    return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}

// 10. Octahedron (Exact)
float sdOctahedron(vec3 p, float s) {
    p = abs(p);
    float m = p.x + p.y + p.z - s;
    vec3 q;
    if (3.0 * p.x < m) q = p.xyz;
    else if (3.0 * p.y < m) q = p.yzx;
    else if (3.0 * p.z < m) q = p.zxy;
    else return m * 0.57735027;
    float k = clamp(0.5 * (q.z - q.y + s), 0.0, s);
    return length(vec3(q.x, q.y - s + k, q.z - k));
}

// 11. Ellipsoid (Bound — not exact!)
float sdEllipsoid(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
}
```

### Generalized Distance Functions (GDF Polyhedra)
Platonic and Archimedean solids can be evaluated via normal projection over directional basis vectors `GDFVectors`:
```glsl
float fGDF(vec3 p, float r, int begin, int end) {
    float d = 0.0;
    for (int i = begin; i <= end; ++i)
        d = max(d, abs(dot(p, GDFVectors[i])));
    return d - r;
}
```

---

## 4. CSG Boolean & Smooth Blending (`smin`) Operators

### Hard Booleans & Chamfering
```glsl
float opUnion(float d1, float d2)        { return min(d1, d2); }
float opIntersection(float d1, float d2) { return max(d1, d2); }
float opDifference(float d1, float d2)   { return max(d1, -d2); } // d1 minus d2

// Beveled / Chamfered CSG (45-degree bevel of width r)
float opChamferUnion(float d1, float d2, float r) {
    return min(min(d1, d2), (d1 + d2 - r) * 0.70710678);
}
float opChamferDifference(float d1, float d2, float r) {
    return max(max(d1, -d2), (d1 - d2 + r) * 0.70710678);
}
```

### Smooth Minimum (`smin`) Families (Inigo Quilez)
Smooth minimum operators blend shapes within smoothing radius $k > 0$:

```glsl
// 1. Quadratic Polynomial smin (Fastest, C1 continuous, local support |a - b| < k)
float sminQuadratic(float a, float b, float k) {
    k *= 4.0;
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
}

// 2. Classic Clamped Polynomial smin (Equivalent C1 formulation)
float sminPolynomial(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// 3. Cubic Polynomial smin (C2 continuous — eliminates specular highlight seams!)
float sminCubic(float a, float b, float k) {
    k *= 6.0;
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

// 4. Root / Circular smin (Exact circular fillet)
float sminCircular(float a, float b, float k) {
    k *= 1.0 / (1.0 - sqrt(0.5));
    vec2 u = max(vec2(k - a, k - b), vec2(0.0));
    return max(k, min(a, b)) - length(u);
}

// 5. Exponential smin (Order-independent for N shapes, global support)
float sminExponential(float a, float b, float k) {
    float r = exp2(-a / k) + exp2(-b / k);
    return -k * log2(r);
}

// Smooth Maximum (for Smooth Intersection and Smooth Subtraction)
float smaxPolynomial(float a, float b, float k) {
    return -sminPolynomial(-a, -b, k);
}
float opSmoothDifference(float d1, float d2, float k) {
    return smaxPolynomial(d1, -d2, k);
}
```

### Material / Attribute Blending with `smin`
Return `vec2(distance, blendFactor)` to smoothly interpolate material IDs or colors across a CSG seam:
```glsl
vec2 sminMat(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    float d = mix(b, a, h) - k * h * (1.0 - h);
    return vec2(d, h); // mix(colorA, colorB, h)
}
```

---

## 5. Domain, Metric, and Deformation Operators

### Exact Metric Modifiers
```glsl
// Rounding (grows shape outward by r, rounds sharp exterior edges)
float opRound(float d, float r) {
    return d - r;
}

// Onioning / Annular Shell (turns solid into hollow shell of half-thickness t)
float opOnion(float d, float t) {
    return abs(d) - t;
}

// Exact 3D Elongation (splits shape along axes by half-extents h)
// Preserves exact interior distance unlike naive p - clamp(p, -h, h)
vec4 opElongateExact(vec3 p, vec3 h) {
    vec3 q = abs(p) - h;
    return vec4(max(q, 0.0), min(max(q.x, max(q.y, q.z)), 0.0));
    // Usage: vec4 w = opElongateExact(p, h); return w.w + sdPrimitive(w.xyz);
}

// Extrusion (2D SDF in xy extruded along z by half-height h)
float opExtrude(vec3 p, float d2d, float h) {
    vec2 w = vec2(d2d, abs(p.z) - h);
    return min(max(w.x, w.y), 0.0) + length(max(w, 0.0));
}

// Revolution (Revolves a 2D SDF around the Y-axis with radial offset o)
vec2 opRevolve(vec3 p, float o) {
    return vec2(length(p.xz) - o, p.y);
}
```

### Domain Repetition & Symmetry Folding
```glsl
// Infinite Repetition (period c)
vec3 opRepeat(vec3 p, vec3 c) {
    return mod(p + 0.5 * c, c) - 0.5 * c;
}

// Limited / Finite Repetition (spacing s, grid bounds [-l, +l])
vec3 opRepeatLimited(vec3 p, float s, vec3 l) {
    return p - s * clamp(round(p / s), -l, l);
}

// Polar / Angular Repetition (n radial sectors around Z/Y axis)
vec2 opRepeatPolar(vec2 p, float n) {
    float angle = 6.2831853 / n;
    float a = atan(p.y, p.x) + angle * 0.5;
    float r = length(p);
    a = mod(a, angle) - angle * 0.5;
    return vec2(cos(a), sin(a)) * r;
}

// Axial & Octant Symmetry Folding
vec3 opSymXZ(vec3 p) { return vec3(abs(p.x), p.y, abs(p.z)); }
```

### Non-Rigid Deformations & Lipschitz Step Correction
Deforming coordinates via twist, bend, or displacement breaks $\|\nabla f\| = 1$:
```glsl
// Twist around Y-axis by rate k (radians per unit y)
vec3 opTwist(vec3 p, float k) {
    float c = cos(k * p.y);
    float s = sin(k * p.y);
    mat2  m = mat2(c, -s, s, c);
    return vec3(m * p.xz, p.y);
}

// Cheap Bend around Z-axis by rate k
vec3 opCheapBend(vec3 p, float k) {
    float c = cos(k * p.x);
    float s = sin(k * p.x);
    mat2  m = mat2(c, -s, s, c);
    return vec3(m * p.xy, p.z);
}
```
> **Crucial Rule**: When using `opTwist`, `opCheapBend`, or displacement `d + disp(p)`, multiply the distance returned in `map(p)` by a relaxation factor $\lambda \in [0.5, 0.8]$ so sphere tracing does not overshoot stretched regions.

### Non-Euclidean $L_p$ and $L_\infty$ (Max-Norm) Metrics
- **$L_p$ Norm**: Replacing `length(p)` with $\|p\|_p = (|p_x|^p + |p_y|^p + |p_z|^p)^{1/p}$ turns circles/spheres/tori into rounded superquadrics (`length6`, `length8`).
- **$L_\infty$ (Max-Norm)**: $D_\infty(\mathbf{x}, \mathbf{y}) = \max_i |x_i - y_i|$. Under $L_\infty$, a surface $S$ intersects a cubic voxel of width $w$ centered at $\mathbf{p}_c$ **if and only if** $D_\infty(\mathbf{p}_c, S) \le \frac{w}{2}$, providing an exact conservative test for surface voxelization and octree culling.

