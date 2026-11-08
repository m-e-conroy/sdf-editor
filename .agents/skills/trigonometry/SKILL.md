---
name: trigonometry
description: Apply trig to creative coding, graphics, animation. Use for angles, rotations, oscillations, orbits, waves.
version: 1.0.0
---

# Trigonometry

## When to Use

Use when user want move in circle, create wave/pulse, animate orbit, rotate shapes/vectors, calculate angles, build compass/dial, or implement periodic motion. Trigger on: `math.sin`, `math.cos`, `atan2`, polar coordinates, 3D rotation.

## Instructions

1. **Identify Core Motion**: circular, oscillation, rotation, or angle calculation.
2. **Enforce Radians**: Ensure inputs in radians. Convert degrees if needed.
3. **Use Right Tools**: `Math.atan2(y, x)` for angles. `Math.hypot(dx, dy)` for distances.
4. **Coordinate System**: In 2D canvas, Y points down (reverses angles/sine).
5. **Optimize 3D**: Prefer quaternions for composed rotations. Use Euler/trig for simple single-axis or spherical sampling.

## Output Format

1. **Mathematical Approach**: Explain angle, wave, or rotation logic.
2. **Implementation**: Code/pseudocode. Distinguish `x` (`cos`) vs `y` (`sin`).
3. **Coordinate Context**: State coordinate assumptions (e.g., "Y points down").

---

## The Essentials (Radians First)

JS `Math.sin()`, `Math.cos()`, `Math.atan2()` use **radians**.

| Concept | Formula |
| --- | --- |
| Degrees → Radians | `rad = deg * (Math.PI / 180)` |
| Radians → Degrees | `deg = rad * (180 / Math.PI)` |
| Full circle | `2 * Math.PI` (~6.283) |
| Half circle | `Math.PI` (~3.14159) |
| Quarter circle | `Math.PI / 2` (~1.5708) |

**Intuition:** Unit circle (radius 1) origin centered. Angle $\theta$ point is $(\cos\theta, \sin\theta)$.

---

## Core Functions

### sin and cos — circular pair

```js
// Position on circle radius r, angle theta
const x = cx + r * Math.cos(theta);
const y = cy + r * Math.sin(theta);
```

- `cos` drive **horizontal** (x-axis)
- `sin` drive **vertical** (y-axis)
- Return values between -1 and 1.
- 90° out of phase; combine to trace circle.

### atan2 — measure angle from vector

```js
// Angle from A to B (radians)
const angle = Math.atan2(B.y - A.y, B.x - A.x);
```

Use `atan2(y, x)` not `atan(y/x)`. Argument order: **y first, then x**.

### tan — ratio

$\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}$. Used for angles from side ratios.

---

## Key Identities for Graphics

| Identity | Use in code |
| --- | --- |
| $\sin^2\theta + \cos^2\theta = 1$ | Keep point on unit circle; normalize vector |
| $\sin(-\theta) = -\sin(\theta)$ | Flip vertical oscillation |
| $\cos(-\theta) = \cos(\theta)$ | Cosine symmetric; mirror motion |
| $\sin(\theta + \pi/2) = \cos(\theta)$ | Convert sine to cosine wave |
| $\sin(2\theta) = 2 \sin(\theta) \cos(\theta)$ | Frequency doubling |
| $\cos(A+B) = \cos(A)\cos(B) - \sin(A)\sin(B)$ | Rotation matrix derivation |

---

## Trigonometry Table (Common Angles)

| Angle (deg) | Radians | $\sin$ | $\cos$ | $\tan$ |
| --- | --- | --- | --- | --- |
| $0^\circ$ | $0$ | $0$ | $1$ | $0$ |
| $30^\circ$ | $\pi/6$ | $0.5$ | $\sqrt{3}/2 \approx 0.866$ | $1/\sqrt{3} \approx 0.577$ |
| $45^\circ$ | $\pi/4$ | $\sqrt{2}/2 \approx 0.707$ | $\sqrt{2}/2 \approx 0.707$ | $1$ |
| $60^\circ$ | $\pi/3$ | $\sqrt{3}/2 \approx 0.866$ | $0.5$ | $\sqrt{3} \approx 1.732$ |
| $90^\circ$ | $\pi/2$ | $1$ | $0$ | $\infty$ |
| $180^\circ$ | $\pi$ | $0$ | $-1$ | $0$ |
| $270^\circ$ | $3\pi/2$ | $-1$ | $0$ | $\infty$ |
| $360^\circ$ | $2\pi$ | $0$ | $1$ | $0$ |

---

## 2D Graphics Patterns

### Circular / Orbital Motion

```js
const speed = 0.02; // rad/frame
const radius = 100;

function update(t) {
  const x = cx + radius * Math.cos(t * speed);
  const y = cy + radius * Math.sin(t * speed);
}
```

**Elliptical:** use different `rx`, `ry`. **Offset phase:** add `phaseOffset`.

### Oscillation / Wave Motion

```js
const y = cy + amplitude * Math.sin(time * frequency); // Vertical bob
const x = cx + amplitude * Math.cos(time * frequency); // Horizontal sweep
const scale = 1 + 0.2 * Math.sin(time * 2); // Pulse size
```

### Sprite / Object Rotation

```js
const angle = Math.atan2(target.y - self.y, target.x - self.x);
rotate(angle);
```

**Rotate point around origin:**

```js
function rotatePoint(px, py, cx, cy, angle) {
  const dx = px - cx, dy = py - cy;
  return {
    x: cx + dx * Math.cos(angle) - dy * Math.sin(angle),
    y: cy + dx * Math.sin(angle) + dy * Math.cos(angle),
  };
}
```

### Polar Coordinates

```js
// Polar → Cartesian
const x = r * Math.cos(theta), y = r * Math.sin(theta);

// Cartesian → Polar
const r = Math.hypot(x, y), theta = Math.atan2(y, x);
```

**Spiral:** $r = \text{spacing} \times \theta$. **Rose curve:** $r = \cos(k\theta)$.

---

## 3D Graphics Patterns

### Spherical → Cartesian (3D Point on Sphere)

```js
// phi (φ): polar angle from +Y (0=top, π=bottom)
// theta (θ): azimuthal angle around Y
const x = r * Math.sin(phi) * Math.cos(theta);
const y = r * Math.cos(phi);
const z = r * Math.sin(phi) * Math.sin(theta);
```

### Rotation Matrices

**Rotate around Z-axis:**

```js
function rotateZ(x, y, z, angle) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
    z: z,
  };
}
```

**Rotate around X-axis:** $y' = y\cos\theta - z\sin\theta, z' = y\sin\theta + z\cos\theta$.
**Rotate around Y-axis:** $x' = x\cos\theta + z\sin\theta, z' = -x\sin\theta + z\cos\theta$.

### GLSL / Shader Trig

No `Math.` prefix.

```glsl
float dist = length(uv - vec2(0.5));
float ring = sin(dist * 20.0 - uTime * 2.0); // ripple
```

### Camera Orbit (Three.js)

```js
camera.position.x = target.x + radius * Math.sin(phi) * Math.cos(theta);
camera.position.y = target.y + radius * Math.cos(phi);
camera.position.z = target.z + Math.sin(phi) * Math.sin(theta);
camera.lookAt(target);
```

---

## Compound and Advanced Patterns

### Layered Oscillations

```js
function noisyOscillation(t) {
  return 0.5 * Math.sin(t * 1.0) + 0.25 * Math.sin(t * 2.3 + 1.1) + 0.125 * Math.sin(t * 5.1 + 2.4);
}
```

### Easing with Sine

```js
const eased = 0.5 - 0.5 * Math.cos(t * Math.PI); // ease in-out
const easeIn = Math.sin((t * Math.PI) / 2);
```

### Lerp / Wrap Angle

```js
function lerpAngle(a, b, t) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  return a + diff * t;
}

const wrapped = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
```

---

## Examples

**Input:**
"Write a function to animate an object orbiting around a centre point, with a slight vertical bobbing effect."

**Expected Output:**

**Mathematical Approach:**
Combine orbital motion (circle using $\cos$ for $x$, $\sin$ for $z$) with vertical $\sin$ wave for $y$. Advance `time` each frame.

**Implementation:**
```js
function updateOrbitWithBobbing(cx, cy, radius, time, speed, bobAmplitude, bobFrequency) {
  const angle = time * speed;
  const x = cx + radius * Math.cos(angle);
  const baseZ = radius * Math.sin(angle);
  const y = cy + bobAmplitude * Math.sin(time * bobFrequency);
  return { x, y, z: baseZ };
}
```

**Coordinate Context:**
Assuming 3D (Three.js), $+Y$ points up. In 2D canvas, $+Y$ points down.

---

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Degrees with `Math.sin()` | Convert to radians: `deg * PI / 180` |
| `atan(y/x)` | Use `atan2(y, x)` |
| Y-axis inverted | In canvas, Y increases downward |
| Gimbal lock | Use quaternions for 3D |
| Circular looks like line | Swapped sin/cos or used same function |

---

## Quick Reference

| Task | Formula / Code |
| --- | --- |
| Point on circle | $x = cx + r\cos\theta, y = cy + r\sin\theta$ |
| Object facing target | `Math.atan2(dy, dx)` |
| Oscillate | $val = \text{centre} + \text{amp} \times \sin(t \times \text{freq})$ |
| Rotate point 2D | $x' = x\cos\theta - y\sin\theta, y' = x\sin\theta + y\cos\theta$ |
| Distance | `Math.hypot(dx, dy)` |
| Degrees to radians | `deg * (Math.PI / 180)` |

## Resources

- [Trigonometric Cheat Sheet — GeeksforGeeks](https://www.geeksforgeeks.org/maths/trigonometric-cheat-sheet/)
- [Trigonometry Index — Math is Fun](https://www.mathsisfun.com/algebra/trigonometry-index.html)
- [Interactive Unit Circle — Math is Fun](https://www.mathsisfun.com/algebra/trig-interactive-unit-circle.html)

## Related Skills

- **Geometry** — Triangle properties, collision, intersections.
- **Linear Algebra** — Vectors, matrices, dot/cross products.
- **Physics** — Velocity, acceleration, forces, dynamics.
- **[game-math](../game-math/SKILL.md)** — Game trig (cameras, aiming).
