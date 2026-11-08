---
name: signed-distance-fields
description: Mathematical foundations, 2D/3D primitives, CSG booleans, smooth blending (smin), domain repetition, sphere tracing (raymarching), soft shadows, MSDF text rendering, Jump Flooding Algorithm (JFA), collision detection, and mesh extraction using Signed Distance Fields (SDFs). Trigger: "SDF", "signed distance field", "signed distance function", "ray marching", "raymarching", "sphere tracing", "smooth minimum", "smin", "Inigo Quilez", "implicit surface", "CSG boolean", "Jump Flooding Algorithm", "JFA", "distance transform", "MSDF font", "SDF shadows", "marching cubes", "dual contouring".
version: 1.0.0
---

# Signed Distance Fields (SDFs)

 Derive, compose, render, and optimize implicit curves, surfaces, and volumetric fields using Signed Distance Functions ($f: \mathbb{R}^n \to \mathbb{R}$).

## When to Use

Trigger this skill when the user asks to:
- Write 2D or 3D Signed Distance Functions (primitives, custom shapes, fractals, or distance bounds).
- Combine shapes with Constructive Solid Geometry (CSG) booleans or organic Smooth Minimum (`smin`) blends.
- Apply domain or metric operations: infinite/finite repetition, symmetry folding, elongation, rounding, onioning (shells), twisting, bending, or $L_p$ / $L_\infty$ norms.
- Implement GPU sphere tracing (raymarching), interval raymarching, surface normals (central differences or IQ tetrahedron), SDF soft shadows, or ambient occlusion in GLSL/WGSL/Three.js.
- Render crisp vector shapes or typography at any scale using SDF or Multi-Channel SDF (MSDF) textures and screen-space derivatives (`fwidth`).
- Compute GPU distance transforms or Voronoi diagrams via the Jump Flooding Algorithm (JFA).
- Extract polygon meshes from implicit fields (Marching Cubes, Dual Contouring, Gridhopping, DeepSDF) or resolve SDF collision contacts.

## Instructions

1. **Establish Sign and Metric Conventions**:
   - Define the zero-level set $\partial\Omega = \{\mathbf{p} \in \mathbb{R}^n \mid f(\mathbf{p}) = 0\}$ as the surface boundary.
   - Enforce the standard graphics convention: $f(\mathbf{p}) < 0$ inside the interior $\Omega$, $f(\mathbf{p}) > 0$ outside, and $|f(\mathbf{p})| = \inf_{\mathbf{y} \in \partial\Omega} \|\mathbf{p} - \mathbf{y}\|_2$.
   - Preserve the **Eikonal property** ($\|\nabla f(\mathbf{p})\|_2 = 1$ almost everywhere) and **1-Lipschitz continuity** ($|f(\mathbf{x}) - f(\mathbf{y})| \le \|\mathbf{x} - \mathbf{y}\|_2$) so sphere tracing never steps through geometry.

2. **Select Exact Primitives over Bounds**:
   - Use exact Euclidean primitives (where $\|\nabla f\| = 1$ everywhere) whenever possible to maximize raymarching convergence speed and keep offset surfaces ($f(\mathbf{p}) - r$) uniform.
   - Consult [references/primitives-and-operators.md](references/primitives-and-operators.md) for canonical 2D and 3D GLSL/JS primitive formulas (Circle, Sphere, Box, Torus, Capped Cylinder, Capsule, Capped Cone, Ellipsoid, GDF Polyhedra).
   - When using non-exact **Signed Distance Bounds (SDBs)** (e.g., ellipsoid approximation, non-uniform scale, twist, displacement, or neural SDFs), ensure the estimator **underestimates** the true distance ($|f_S(\mathbf{p})| \le d(\mathbf{p}, \partial\Omega)$) or multiply the step by a conservative relaxation factor $\lambda \in (0, 1)$.

3. **Compose Shapes with CSG and Smooth Blending**:
   - Combine scalar distances using classic booleans:
     - **Union**: $\min(d_1, d_2)$
     - **Intersection**: $\max(d_1, d_2)$
     - **Subtraction ($A \setminus B$)**: $\max(d_1, -d_2)$
   - Replace hard creases with organic fillets using **Quadratic Polynomial Smooth Min (`smin`)**:
     $$h = \text{clamp}\left(0.5 + 0.5\frac{b - a}{k},\, 0.0,\, 1.0\right), \quad \text{smin}(a, b, k) = \text{mix}(b, a, h) - k\,h\,(1.0 - h)$$
   - Note that `min`/`max` inside an interior ($d_1 < 0, d_2 < 0$) and `smin` near blending seams slightly distort the Euclidean metric; use exact exterior formulations from [references/primitives-and-operators.md](references/primitives-and-operators.md) if interior accuracy is required (e.g., refraction or deep onioning).

4. **Transform Coordinates Before Evaluation**:
   - Apply rigid transformations by inverting the transform on the query point: evaluate $f(R^{-1}(\mathbf{p} - \mathbf{t}))$.
   - Apply uniform scale $s$ by dividing coordinates and multiplying the output: $d_{\text{scaled}}(\mathbf{p}) = s \cdot f(\mathbf{p} / s)$.
   - Apply non-uniform scale $\mathbf{s} = (s_x, s_y, s_z)$ conservatively using the minimum axis factor: $d_{\text{safe}}(\mathbf{p}) = f(\mathbf{p} / \mathbf{s}) \cdot \min(s_x, s_y, s_z)$.
   - Tile geometry using modulo domain repetition ($\mathbf{q} = \text{mod}(\mathbf{p} + 0.5\mathbf{c}, \mathbf{c}) - 0.5\mathbf{c}$) or finite clamped repetition ($\mathbf{q} = \mathbf{p} - c \cdot \text{clamp}(\text{round}(\mathbf{p}/c), -\mathbf{l}, \mathbf{l})$). Only tile symmetric primitives across cell boundaries, or evaluate neighboring cells to prevent clipping artifacts.

5. **Implement Raymarching (Sphere Tracing) and Shading**:
   - March along ray $\mathbf{r}(t) = \mathbf{r}_0 + t\mathbf{r}_d$ by advancing $t \leftarrow t + f(\mathbf{r}_0 + t\mathbf{r}_d)$ until $f < \epsilon$ (hit), $t > t_{\max}$ (miss), or step count reaches `MAX_STEPS`.
   - Compute surface normals via the **IQ 4-Tap Tetrahedron Method** (4 scene evaluations instead of 6 for central differences):
     ```glsl
     vec3 calcNormal(vec3 p) {
         const float h = 0.0005;
         const vec2 k = vec2(1.0, -1.0);
         return normalize(
             k.xyy * map(p + k.xyy * h) +
             k.yyx * map(p + k.yyx * h) +
             k.yxy * map(p + k.yxy * h) +
             k.xxx * map(p + k.xxx * h)
         );
     }
     ```
   - Compute free **SDF Soft Shadows** by marching toward the light and tracking penumbra attenuation $k_{\text{shadow}} = \min\left(k_{\text{shadow}},\, k \cdot \frac{f(\mathbf{p} + t\mathbf{l})}{t}\right)$, and **Ambient Occlusion** by sampling 4–5 short steps along the normal $\mathbf{n}$. See [scripts/raymarch-template.glsl](scripts/raymarch-template.glsl) and [references/rendering-and-applications.md](references/rendering-and-applications.md).

6. **Render 2D SDFs, Fonts, and MSDF Atlases with Hardware Anti-Aliasing**:
   - Never use hard `if (d < 0.0)` branching for 2D SDF rendering. Convert signed distance to anti-aliased coverage across a 1-pixel window using screen-space derivatives:
     ```glsl
     float w = fwidth(d);
     float alpha = 1.0 - smoothstep(-w, w, d);
     ```
   - For **Multi-Channel Signed Distance Fields (MSDF)** to preserve sharp glyph corners, reconstruct the signed distance as the median of RGB channels before applying `fwidth`:
     ```glsl
     float median(float r, float g, float b) {
         return max(min(r, g), min(max(r, g), b));
     }
     ```

7. **Select the Right Pipeline for Volumetric Storage, JFA, Collision, or Meshing**:
   - **2D/3D GPU Distance Transform & Voronoi**: Run the **Jump Flooding Algorithm (JFA)** in $\lceil\log_2 N\rceil$ passes with step offsets $2^{\log_2(N) - k - 1}$.
   - **Adaptive Volumetric Storage**: Use **Adaptively Sampled Distance Fields (ADFs)** with octree $3\times 3\times 3$ voxel blocks, 3D spatial hashing, and precomputed smooth normals to prevent $C^1$ cell-boundary shading seams.
   - **Polygon Extraction**: Use **Marching Cubes** (or **Gridhopping** sphere-traced ray acceleration for $O(N^2 \log N)$ complexity) for smooth surfaces, and **Dual Contouring** (with Hermite gradients $\nabla f$) when sharp edges and corners must be preserved.
   - **Collision Detection**: Query $f(\mathbf{p}) \le 0$ for $O(1)$ point penetration and $\nabla f(\mathbf{p})$ for contact normal; use OBB/octree broadphase + dual-gradient optimization for general concave SDF-vs-SDF contacts.

---

## Core Quick-Reference Table

| Operation / Concept | Mathematical / GLSL Expression | Metric Property |
| :--- | :--- | :--- |
| **Sphere / Circle** | `length(p) - r` | Exact ($\|\nabla f\| = 1$) |
| **Box (2D / 3D)** | `vec3 q = abs(p) - b; length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0)` | Exact |
| **Capsule / Segment** | `vec3 pa = p - a, ba = b - a; length(pa - ba * clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0)) - r` | Exact |
| **Torus** | `length(vec2(length(p.xz) - t.x, p.y)) - t.y` | Exact |
| **Rounding** | `sdf(p) - r` | Exact |
| **Onioning (Shell)** | `abs(sdf(p)) - thickness` | Exact |
| **Elongation** | `vec3 q = p - clamp(p, -h, h); sdf(q)` | Exact (1D) / Bound (3D interior) |
| **CSG Union / Intersect / Diff** | `min(a, b)` / `max(a, b)` / `max(a, -b)` | Bound inside interior |
| **Polynomial `smin`** | `float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0); mix(b,a,h) - k*h*(1.0-h)` | Bound near blend seam |
| **Uniform Scale** | `sdf(p / s) * s` | Exact |
| **Non-Uniform Scale** | `sdf(p / s) * min(s.x, min(s.y, s.z))` | Lower Bound (Safe) |
| **Infinite Repetition** | `vec3 q = mod(p + 0.5 * c, c) - 0.5 * c; sdf(q)` | Safe if symmetric in cell |
| **Finite Repetition** | `vec3 q = p - c * clamp(round(p / c), -l, l); sdf(q)` | Safe if symmetric in cell |

---

## Output Format

Structure every SDF solution as follows:

1. **Mathematical & Metric Strategy**: State the primitives, domain operators, CSG/blending mode, and whether the resulting field is an **Exact SDF** or a **Signed Distance Bound (SDB)** (noting any required step-relaxation $\lambda$).
2. **Implementation**: Provide complete, copy-pasteable GLSL, WGSL, or JS/TS code with clear function signatures (`float sdShape(vec3 p)`, `float map(vec3 p)`).
3. **Shading / Pipeline Integration**: Include normal estimation, anti-aliasing (`fwidth`), or raymarching loop tuning (`MAX_STEPS`, `SURF_DIST`, `MAX_DIST`).
4. **Edge Cases & Lipschitz Gotchas**: Highlight potential overstepping risks (non-uniform scale, twist, domain repetition cell clipping, interior boolean distortion) and their exact fixes.

## Examples

**Input:** "Write a GLSL shader that smoothly blends a sphere and a rounded box with soft shadows and repetition."

**Expected Action:**
1. Define exact `sdSphere(p, r)` and `sdRoundBox(p, b, r)` primitives from [references/primitives-and-operators.md](references/primitives-and-operators.md).
2. Apply finite or infinite domain repetition `opRepeatLimited(p, c, l)` prior to local primitive evaluation.
3. Combine the primitives using `sminPolynomial(d1, d2, k)` for smooth organic blending.
4. Provide the sphere-tracing loop, 4-tap tetrahedral `calcNormal`, and penumbra soft-shadow march from [scripts/raymarch-template.glsl](scripts/raymarch-template.glsl).
5. Note that `smin` slightly perturbs the gradient near the blend zone and explain why symmetry within repetition cells prevents boundary clipping.

**Input:** "How do I render sharp corners on zoomed-in vector icons and text using distance fields in WebGL?"

**Expected Action:**
1. Explain why single-channel SDFs round sharp corners under bilinear texture interpolation.
2. Recommend a **Multi-Channel Signed Distance Field (MSDF)** atlas where intersecting contour edges are separated across R, G, and B channels.
3. Provide the fragment shader reconstruction using `float d = median(tex.r, tex.g, tex.b) - 0.5;` followed by screen-space derivative anti-aliasing `float alpha = clamp(d / fwidth(d) + 0.5, 0.0, 1.0);` from [references/rendering-and-applications.md](references/rendering-and-applications.md).
4. Show how to add a free outline or drop shadow in the same pass by thresholding at a secondary offset distance.

## Resources

- [references/primitives-and-operators.md](references/primitives-and-operators.md) — 2D/3D exact primitive equations, CSG booleans, `smin` variants, domain repetition, $L_p$/$L_\infty$ metrics, and Lipschitz distortion corrections.
- [references/rendering-and-applications.md](references/rendering-and-applications.md) — Sphere tracing, interval raymarching, tetrahedral normals, RTSDF soft shadows, AO, SDF/MSDF fonts, Jump Flooding Algorithm (JFA), GPU ADFs, collision detection, and mesh extraction.
- [scripts/raymarch-template.glsl](scripts/raymarch-template.glsl) — Complete GLSL raymarching fragment shader template with primitives, `smin`, soft shadows, and AO.
- [scripts/sdf-2d-3d.js](scripts/sdf-2d-3d.js) — CPU JavaScript library for 2D/3D SDF evaluation, CSG, gradients, sphere tracing, and Jump Flooding Algorithm (JFA).
- [assets/sdf-pipeline-config.json](assets/sdf-pipeline-config.json) — Standard presets for raymarching quality, MSDF font atlases, JFA passes, and Marching Cubes / Gridhopping mesh extraction.
- [Inigo Quilez — 3D Distance Functions](https://iquilezles.org/articles/distfunctions/)
- [Inigo Quilez — 2D Distance Functions](https://iquilezles.org/articles/distfunctions2d/)
- [Inigo Quilez — Smooth Minimum (`smin`)](https://iquilezles.org/articles/smin/)
- [Red Blob Games — Guide to SDF + MSDF Fonts](https://www.redblobgames.com/x/2403-distance-field-fonts/)

## Related Skills

- **[geometry](../geometry/SKILL.md)** — Euclidean vectors, planes, ray-primitive intersections, and bounding volumes.
- **[game-math](../game-math/SKILL.md)** — Coordinate spaces, matrices, quaternions, and rendering pipeline math.
- **[threejs-materials](../threejs-materials/SKILL.md)** — Embedding custom GLSL raymarching and MSDF shaders in Three.js `ShaderMaterial`.
- **[blender-geometry-nodes](../blender-geometry-nodes/SKILL.md)** — Volumetric SDF grids and procedural modeling inside Blender 5.2.
- **[algorithmic-art](../algorithmic-art/SKILL.md)** — Generative visual systems, fractals, and procedural textures.

