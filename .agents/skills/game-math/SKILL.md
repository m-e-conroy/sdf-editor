---
name: game-math
description: Advanced mathematics for game development, graphics programming, and generative art — covering vectors, matrices, coordinate spaces, rotation (quaternions, Euler angles), geometric primitives, polar/spherical coordinates, kinematics, rigid-body physics, and parametric curves. Use for 2D/3D math, transformations, coordinate spaces, camera systems, rotation representation, raycasting, collision geometry, physics simulation, animation curves, or procedural geometry.
version: 1.0.0
---

# Game & Graphics Math

Guidance on math driving games, real-time graphics, and generative art.

## When to Use

Trigger when:
- 2D/3D math for games/graphics: vectors, matrices, coordinate spaces, rotations, cameras, curves, rendering pipelines.
- Gimbal lock, quaternion interpolation, projection matrices, Bézier curves.
- Math connecting simulation to visuals.

## Instructions

1. **Math Domain**: Vectors, matrices, rotation, coordinate spaces, curves, rendering pipeline.
2. **KaTeX**: Use math notation for reasoning.
3. **Code Implementation**: Code (JS default) for formulas.
4. **Coordinate Conventions**: Declare handedness (R vs L), axis orientation (Y-up vs Z-up), angle direction (CW vs CCW).
5. **Reference Specialist Skills**: Delegate to **trigonometry**, **geometry**, **linear-algebra**, **physics** for deep-dives.

## Output Format

1. **Mathematical Concept**: Math with notation.
2. **Visual Intuition**: Geometric description.
3. **Code Implementation**: Runnable snippet with comments.
4. **Gotchas**: Coordinate assumptions, precision, common mistakes.

## 1. Vectors

Fundamental type for positions, directions, velocities, normals, forces.

### Essential Operations

| Operation | Formula | Geometric Meaning |
| :--- | :--- | :--- |
| Addition | $\vec{a} + \vec{b}$ | Chain displacements |
| Subtraction | $\vec{b} - \vec{a}$ | Direction A to B |
| Scaling | $s \cdot \vec{v}$ | Stretch/shrink |
| Magnitude | $\|\vec{v}\| = \sqrt{x^2 + y^2 + z^2}$ | Length |
| Normalize | $\hat{v} = \vec{v} / \|\vec{v}\|$ | Unit direction |
| Dot product | $\vec{a} \cdot \vec{b} = \|\vec{a}\|\|\vec{b}\|\cos\theta$ | Projection, angle test |
| Cross product | $\vec{a} \times \vec{b}$ | Perpendicular (3D) |

### Dot Product — The Workhorse

Lighting, collisions, FOV, projection.

```javascript
function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Angle between vectors
function angleBetween(a, b) {
  return Math.acos(dot(a, b) / (magnitude(a) * magnitude(b)));
}

// Facing test: B in front of A?
// dot > 0 → front, < 0 → behind, = 0 → perpendicular
```

### Cross Product — Surface Normals & Winding

```javascript
function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

// Triangle normal
function triangleNormal(v0, v1, v2) {
  let edge1 = sub(v1, v0);
  let edge2 = sub(v2, v0);
  return normalize(cross(edge1, edge2));
}
```

## 2. Coordinate Spaces

Chain of spaces model to screen.

### The Transform Pipeline

```
Object Space → World Space → Camera Space → Clip Space → NDC → Screen Space
   (Model)      (Model M)     (View V)     (Proj P)   (÷w)   (Viewport)
```

| Space | Origin | Use |
| :--- | :--- | :--- |
| **Object (Local)** | Centre of object | Model mesh |
| **World** | Scene origin | Relative positioning |
| **Camera (View)** | Camera | Viewport view |
| **Clip** | Post-projection | Culling, perspective divide |
| **NDC** | $[-1, 1]^3$ | Normalized device coords |
| **Screen** | Top-left pixel | Final rasterization |

```javascript
// Vertex transform
let clipPos = projMatrix * viewMatrix * modelMatrix * vec4(localPos, 1.0);
let ndc = clipPos.xyz / clipPos.w;
let screenPos = {
  x: (ndc.x * 0.5 + 0.5) * screenWidth,
  y: (1.0 - (ndc.y * 0.5 + 0.5)) * screenHeight // flip Y
};
```

### Changing Basis

Express point in different frame: multiply by inverse of frame transform:
$$\vec{p}_{\text{local}} = M^{-1} \cdot \vec{p}_{\text{world}}$$
For orthonormal (pure rotation), $M^{-1} = M^T$.

## 3. Matrices

### Transform Matrices (4×4 Homogeneous)

Encode rotation, scale, translation:
$$M = \begin{bmatrix} R_{3\times3} & \vec{t} \\ 0\ 0\ 0 & 1 \end{bmatrix}$$

```javascript
// Model matrix: Scale → Rotate → Translate
function modelMatrix(pos, rotAngle, scale) {
  let S = mat4.scale(scale, scale, scale);
  let R = mat4.rotateY(rotAngle);
  let T = mat4.translate(pos.x, pos.y, pos.z);
  return mat4.multiply(T, mat4.multiply(R, S)); // Order: T * R * S
}
```

### View Matrix (Camera)

Inverse of camera's world transform. Moves world so camera is origin looking down $-Z$ (R) or $+Z$ (L).

```javascript
// lookAt
function lookAt(eye, target, up) {
  let forward = normalize(sub(eye, target)); // camera looks down -Z
  let right = normalize(cross(up, forward));
  let camUp = cross(forward, right);
  return [
    right.x,   camUp.x,   forward.x,  0,
    right.y,   camUp.y,   forward.y,  0,
    right.z,   camUp.z,   forward.z,  0,
    -dot(right, eye), -dot(camUp, eye), -dot(forward, eye), 1
  ];
}
```

### Projection Matrices

**Perspective**:
$$P_{\text{persp}} = \begin{bmatrix} \frac{1}{\text{aspect} \cdot \tan(\text{fov}/2)} & 0 & 0 & 0 \\ 0 & \frac{1}{\tan(\text{fov}/2)} & 0 & 0 \\ 0 & 0 & \frac{-(f+n)}{f-n} & \frac{-2fn}{f-n} \\ 0 & 0 & -1 & 0 \end{bmatrix}$$

**Orthographic**:
$$P_{\text{ortho}} = \begin{bmatrix} \frac{2}{r-l} & 0 & 0 & -\frac{r+l}{r-l} \\ 0 & \frac{2}{t-b} & 0 & -\frac{t+b}{t-b} \\ 0 & 0 & \frac{-2}{f-n} & -\frac{f+n}{f-n} \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

## 4. Rotation

### Rotation Representations

| Rep | Pros | Cons |
| :--- | :--- | :--- |
| **Euler** | Human-readable | Gimbal lock, order-dependent |
| **Axis-angle** | Intuitive | Hard to compose |
| **Matrix** | Easy apply/compose | 9 floats, drift |
| **Quaternion** | Compact, no gimbal lock, smooth slerp | Unintuitive |

### 2D Rotation Matrix

$$R(\theta) = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}$$

```javascript
function rotate2D(point, angle) {
  let c = Math.cos(angle), s = Math.sin(angle);
  return { x: point.x * c - point.y * s, y: point.x * s + point.y * c };
}
```

### Quaternions

$q = w + xi + yj + zk$ for rotation angle $\theta$ around axis $\hat{a}$:
$$q = \cos\frac{\theta}{2} + \sin\frac{\theta}{2}(a_x i + a_y j + a_z k)$$

```javascript
// Axis-angle to quat
function quatFromAxisAngle(axis, angle) {
  let half = angle * 0.5, s = Math.sin(half);
  return { w: Math.cos(half), x: axis.x * s, y: axis.y * s, z: axis.z * s };
}

// Rotate vector: v' = q * v * q⁻¹
function quatRotate(q, v) {
  let t = scale(cross({x: q.x, y: q.y, z: q.z}, v), 2.0);
  let u = cross({x: q.x, y: q.y, z: q.z}, t);
  return add(add(v, scale(t, q.w)), u);
}
```

### Slerp (Spherical Linear Interpolation)

Shortest arc on unit sphere:
$$\text{slerp}(q_0, q_1, t) = \frac{\sin((1-t)\Omega)}{\sin\Omega} q_0 + \frac{\sin(t\Omega)}{\sin\Omega} q_1$$
where $\Omega = \arccos(q_0 \cdot q_1)$.

> **Gimbal lock**: Euler pitch = ±90° alignment. Use quaternions for runtime rotation.

## 5. Polar & Spherical Coordinates

### 2D Polar
$$x = r \cos\theta \qquad y = r \sin\theta$$
Orbits, radial effects. See **trigonometry** skill.

### 3D Spherical (Y-up)
$$x = r \sin\phi \cos\theta \qquad y = r \cos\phi \qquad z = r \sin\phi \sin\theta$$
Azimuth $\theta$, polar $\phi$.

```javascript
function sphericalToCartesian(r, theta, phi) {
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta)
  };
}
```

## 6. Parametric Curves

### Bézier Curves (Cubic)
$$B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t)t^2 P_2 + t^3 P_3$$

```javascript
function cubicBezier(p0, p1, p2, p3, t) {
  let u = 1 - t, uu = u * u, uuu = uu * u, tt = t * t, ttt = tt * t;
  return {
    x: uuu*p0.x + 3*uu*t*p1.x + 3*u*tt*p2.x + ttt*p3.x,
    y: uuu*p0.y + 3*uu*t*p1.y + 3*u*tt*p2.y + ttt*p3.y
  };
}
```

### Catmull-Rom Splines
Passes through all points. Interpolates between $P_1, P_2$. Camera paths, NPC routes.

## 7. Easing & Interpolation

- **Lerp**: $\text{lerp}(a, b, t) = a + t(b - a)$
- **Smoothstep**: $3t^2 - 2t^3$ (ubiquitous in shaders/UI).

## 8. Rendering Pipeline Summary

1. **Application**: Logic, input, culling, draw calls.
2. **Geometry**: Vertex shader, M/V/P transforms, clipping, screen mapping.
3. **Rasterization**: Triangle setup, fragment shader, depth test, blending.

### Blinn-Phong Lighting
$$I = k_a I_a + k_d (\hat{N} \cdot \hat{L}) I_d + k_s (\hat{N} \cdot \hat{H})^n I_s$$
Half-vector $\hat{H} = \text{normalize}(\hat{L} + \hat{V})$.

## Examples

**Input:** "Camera orbit around object."
**Expected Action:** Spherical-to-Cartesian (Sect 5) + `lookAt` view matrix (Sect 3). Update theta/phi via drag.

**Input:** "Rotation broken — flipping at 90 deg."
**Expected Action:** Gimbal lock (Sect 4). Swap Euler for quaternions (`quatFromAxisAngle`, `slerp`).

## Resources

- [Immersive Linear Algebra](http://immersivemath.com/ila/)
- [LearnOpenGL](https://learnopengl.com/)
- *3D Math Primer for Graphics and Game Development* — Dunn & Parberry

## Related Skills

- **[trigonometry](../trigonometry/SKILL.md)** — Angles, waves, circular motion.
- **[geometry](../geometry/SKILL.md)** — Raycasting, collisions, spatial queries.
- **[physics](../physics/SKILL.md)** — Dynamics, integration, PBD.
- **[linear-algebra](../linear-algebra/SKILL.md)** — Matrix internals, transforms.
- **[p5js-creative-coding](../p5js-creative-coding/SKILL.md)** — Interactively visualize math.
