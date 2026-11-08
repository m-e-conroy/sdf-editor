# SDF Rendering, Lighting, JFA, Collision, and Meshing Reference

Technical reference derived from *Computational Distance Geometry and Visual Applications* covering sphere tracing, interval raymarching, surface normals, RTSDF soft shadows, MSDF font rendering, the Jump Flooding Algorithm (JFA), Adaptively Sampled Distance Fields (ADFs), collision detection, and polygon extraction.

---

## 1. Sphere Tracing (Raymarching) & Acceleration

### Standard Sphere Tracing Loop
Sphere tracing advances along ray $\mathbf{r}(t) = \mathbf{r}_0 + t\mathbf{r}_d$ by the unpenetrated sphere radius $d = f(\mathbf{r}(t))$:
```glsl
float rayMarch(vec3 ro, vec3 rd, float tMin, float tMax) {
    float t = tMin;
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + t * rd;
        float d = map(p);
        if (abs(d) < SURF_DIST * t) return t; // Screen-space adaptive epsilon
        t += d;
        if (t >= tMax) break;
    }
    return -1.0;
}
```
- **Screen-Space Adaptive Threshold**: Scaling `SURF_DIST` proportionally to depth (`SURF_DIST * t`) prevents distant surfaces from wasting iterations and eliminates close-up precision banding.

### Over-Relaxation Sphere Tracing (Keinert et al.)
Standard sphere tracing exhibits linear convergence ($1/\sin\theta$) when a ray grazes a surface at shallow angle $\theta$. Over-relaxation multiplies the step by $\omega \in (1.0, 1.6)$ and falls back only if the next unrelaxed sphere fails to overlap the previous one:
```glsl
float rayMarchOverRelaxed(vec3 ro, vec3 rd, float tMin, float tMax) {
    float t = tMin;
    float omega = 1.35; // Over-relaxation factor in (1.0, 1.6)
    float prevRadius = 0.0;
    float stepLength = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        float d = map(ro + t * rd);
        float radius = abs(d);
        bool sorFail = (omega > 1.0) && ((radius + prevRadius) < stepLength);
        if (sorFail) {
            // Step back and disable over-relaxation
            stepLength -= omega * stepLength;
            omega = 1.0;
        } else {
            stepLength = d * omega;
        }
        prevRadius = radius;
        if (radius < SURF_DIST) return t;
        t += stepLength;
        if (t >= tMax) break;
    }
    return -1.0;
}
```

### Interval & Affine Raymarching
Instead of evaluating $f$ at discrete points, **Interval Raymarching** evaluates $f([t_a, t_b])$ using interval or affine arithmetic:
1. If $0 \notin [d_{\min}, d_{\max}]$, no intersection exists in $[t_a, t_b]$.
2. If $0 \in [d_{\min}, d_{\max}]$, the interval brackets a surface crossing, enabling secant root-finding with superlinear convergence order $\phi \approx 1.618$ without skipping thin walls.

---

## 2. Gradient / Normal Estimation, Soft Shadows, and Ambient Occlusion

### Surface Normal Estimation: 6-Tap vs. 4-Tap IQ Tetrahedron
Because $\mathbf{n} = \frac{\nabla f(\mathbf{p})}{\|\nabla f(\mathbf{p})\|}$ on the zero-level set:
- **Central Differences (6 evaluations)**:
  $$\nabla f(\mathbf{p}) \approx \begin{bmatrix} f(\mathbf{p}+\epsilon\mathbf{e}_x) - f(\mathbf{p}-\epsilon\mathbf{e}_x) \\ f(\mathbf{p}+\epsilon\mathbf{e}_y) - f(\mathbf{p}-\epsilon\mathbf{e}_y) \\ f(\mathbf{p}+\epsilon\mathbf{e}_z) - f(\mathbf{p}-\epsilon\mathbf{e}_z) \end{bmatrix}$$
- **IQ Tetrahedron Technique (4 evaluations — Preferred on GPU)**:
  Samples 4 vertices of a regular tetrahedron $\mathbf{k}_0=(1,-1,-1)$, $\mathbf{k}_1=(-1,-1,1)$, $\mathbf{k}_2=(-1,1,-1)$, $\mathbf{k}_3=(1,1,1)$:
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

### Improved SDF Penumbra Soft Shadows (Inigo Quilez)
Standard penumbra estimation tracks $\min(k \cdot d / t)$, which can produce concentric banding rings near sharp occluders. Triangulating the closest approach $y$ between two consecutive steps $d$ and $ph$ removes the banding:
```glsl
float calcSoftShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;
    float ph = 1e10; // Previous step distance
    for (int i = 0; i < 64; i++) {
        float h = map(ro + rd * t);
        if (h < 0.0005) return 0.0;
        float y = h * h / (2.0 * ph);
        float d = sqrt(h * h - y * y);
        res = min(res, k * d / max(0.0, t - y));
        ph = h;
        t += h;
        if (t >= maxt) break;
    }
    res = clamp(res, 0.0, 1.0);
    return res * res * (3.0 - 2.0 * res);
}
```

### RTSDF (Real-Time SDF for Dynamic Soft Shadows)
For dynamic polygon scenes where analytical SDFs are unavailable, **RTSDF** generates real-time 3D SDF volume textures via a 3-stage pipeline:
1. **Coarse Voxelization & 3D JFA**: Orthographic 3-axis rasterization seeds occupied voxels; 3D Jump Flooding computes a coarse SDF $c_t$.
2. **Selective Fine Ray Tracing**: Only texels near surfaces ($c_t \le d_{\text{threshold}}$) cast stochastic rays to compute accurate distance $r_t$.
3. **Temporal Accumulation**: Blends across frames with decay $\alpha$: $f_t = \min(\alpha f_{t-1} + (1 - \alpha)c_t,\, r_t)$.

### SDF Ambient Occlusion
March 5 short steps along the normal $\mathbf{n}$; wherever $f(\mathbf{p} + h_i \mathbf{n}) < h_i$, nearby geometry is occluding the hemisphere:
```glsl
float calcAO(vec3 pos, vec3 nor) {
    float occ = 0.0;
    float sca = 1.0;
    for (int i = 0; i < 5; i++) {
        float h = 0.01 + 0.12 * float(i) / 4.0;
        float d = map(pos + h * nor);
        occ += (h - d) * sca;
        sca *= 0.95;
        if (occ > 0.35) break;
    }
    return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}
```

---

## 3. SDF and Multi-Channel SDF (MSDF) Font / Vector Rendering

### Why MSDF Beats Single-Channel SDF
A single-channel SDF stores scalar distance to the nearest edge. Under bilinear GPU texture filtering, the isoline $d = 0.5$ rounds off sharp corners at high magnification.
**MSDF (`msdfgen`)** decomposes glyph outlines at sharp corners into 3 color-coded channels (R, G, B), storing signed distance to two intersecting edge segments in separate channels.

### Complete MSDF Fragment Shader (Anti-Aliased Fill + Outline + Glow)
```glsl
float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

// screenPxRange = (atlasDistanceRange / atlasTextureSize) * screenTexelSize
vec4 renderMSDF(sampler2D msdfAtlas, vec2 uv, vec4 fillColor, vec4 outlineColor, float outlineWidth) {
    vec3 msd = texture(msdfAtlas, uv).rgb;
    float sd = median(msd.r, msd.g, msd.b) - 0.5;
    
    // Screen-space derivative width for 1-pixel anti-aliasing
    float w = fwidth(sd);
    float fillAlpha = smoothstep(-w, w, sd);
    float outlineAlpha = smoothstep(-w, w, sd + outlineWidth);
    
    vec3 color = mix(outlineColor.rgb, fillColor.rgb, fillAlpha);
    return vec4(color, outlineAlpha * max(fillColor.a, outlineColor.a));
}
```

---

## 4. Jump Flooding Algorithm (JFA) for GPU Distance Transforms & Voronoi

### Algorithm Mechanics
Given an $N \times N$ texture with seed pixels initialized to their own UV/pixel coordinates $(x_s, y_s)$ and non-seeds to `vec2(-1.0)`:
- Execute $\log_2(N)$ ping-pong fragment passes.
- Pass $k \in \{0, 1, \dots, \log_2(N)-1\}$ uses step offset:
  $$\text{step}_k = 2^{\log_2(N) - k - 1}$$
- Each pixel checks 9 neighbors at $\mathbf{p} + (i, j) \cdot \text{step}_k$ for $i, j \in \{-1, 0, +1\}$ (or 5 neighbors in a `+` cross for speed) and retains the seed coordinate minimizing $\|\mathbf{p} - \mathbf{s}\|_2^2$.
- **JFA+1 / 1+JFA**: Running an extra pass at $\text{step} = 1$ before (`1+JFA`) or after (`JFA+1`) eliminates virtually all Voronoi flood-stepping errors.
- **Signed Distance Field from Inside/Outside Seeds**: Run JFA twice (once with exterior pixels as seeds → $d_{\text{in}}$, once with interior pixels as seeds → $d_{\text{out}}$), then compute $\text{SDF} = d_{\text{out}} - d_{\text{in}}$.

---

## 5. Adaptively Sampled Distance Fields (ADFs), Collision, and Meshing

### Adaptively Sampled Distance Fields (ADFs) on GPU (Bastos et al.)
- **Octree + $3\times 3\times 3$ Voxel Brick Atlas**: Subdivide space adaptively only where trilinear reconstruction error exceeds tolerance $\epsilon_{\text{ADF}}$. Pack sibling cells into $3\times 3\times 3$ voxel bricks in a 3D hardware texture.
- **Stackless Perfect Spatial Hashing**: Replace pointer-chasing octree traversal with a collision-free 3D spatial hash table $H(\mathbf{m}) = M[(m_x, m_y, m_z) \bmod \bar{m} + \Phi[(m_x, m_y, m_z) \bmod \bar{\phi}]]$, enabling $O(1)$ random access per hierarchy level.
- **Superficial ADF Step Scaling**: When distant empty octree cells are pruned with an error tolerance of $e$ (e.g., $10\%$), multiply sphere-tracing step distances by $(1 - e)$ (e.g., $0.90$) to guarantee zero overshoot.
- **Precomputed Smooth Normals**: Store 24-bit smooth corner normals in a companion 3D texture and trilinearly interpolate them to eliminate $C^1$ cell-boundary shading seams.

### Real-Time Collision Detection with SDFs
- **Particle / Vertex vs. SDF ($O(1)$)**:
  - Penetration test: $d = f(\mathbf{p}) < 0$.
  - Penetration depth: $|d|$.
  - Contact normal: $\mathbf{n} = \nabla f(\mathbf{p})$.
  - Contact point on surface: $\mathbf{p}_c = \mathbf{p} - d\,\mathbf{n}$.
- **General Concave SDF-vs-SDF (Dual-Gradient Method)**:
  1. Decompose shapes into convex Oriented Bounding Boxes (OBBs) for broadphase octree culling.
  2. In overlapping regions, march witness points along the dual gradient $\nabla f_B(\mathbf{x})$ projected onto the interior constraint $f_A(\mathbf{x}) \le 0$ to find maximal penetration depth without getting trapped in local concavity minima.

### Mesh & Polygon Extraction from SDFs
| Method | Complexity | Sharp Features | Best Use Case |
| :--- | :--- | :--- | :--- |
| **Marching Cubes (MC)** | $O(N^3)$ | Rounded edges | Fast smooth organic isosurfaces, metaballs |
| **Gridhopping (Sphere-Traced MC)** | $O(N^2 \log N)$ | Same as MC | Accelerates MC by sphere tracing along $N^2$ grid rays to skip empty cells |
| **Surface Nets** | $O(N^3)$ | Smooth quads | Low-distortion quad/triangle meshes |
| **Dual Contouring (DC)** | $O(N^3)$ or Octree | **Preserves sharp creases & corners** | CAD/CSG models; solves Quadratic Error Function $\sum (\mathbf{n}_i \cdot (\mathbf{v} - \mathbf{p}_i))^2$ inside each cell using SDF gradients $\mathbf{n}_i = \nabla f(\mathbf{p}_i)$ |

