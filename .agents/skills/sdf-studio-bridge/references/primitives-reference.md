# SDF Studio 3D - Primitives Reference

SDF Studio 3D provides 22 analytical and fractal Signed Distance Field primitives evaluated via exact Euclidean distance functions, smooth approximations, and distance bounds in WebGL GLSL and CPU evaluation routines.

---

## Primitive Categories & Schemas

### 1. Basic Primitives

#### `sphere`
- **Description**: Exact Euclidean distance sphere.
- **Fields**:
  - `radius` (number, default: `0.8`, min: `0.05`, max: `5.0`)
- **Notes**: Isotropic, invariant to rotation.

#### `box`
- **Description**: Axis-aligned box with half-extents.
- **Fields**:
  - `size` (vec3 `[hx, hy, hz]`, default: `[0.7, 0.7, 0.7]`, min: `0.05`, max: `5.0`)
- **Notes**: Total width = $2 \times hx$, height = $2 \times hy$, depth = $2 \times hz$.

#### `cylinder`
- **Description**: Capped cylinder oriented along the Y axis.
- **Fields**:
  - `radius` (number, default: `0.5`, min: `0.05`, max: `5.0`)
  - `height` (number, default: `1.0`, min: `0.05`, max: `10.0`)
- **Notes**: Full height from $-height$ to $+height$ (total height is $2 \times height$).

#### `torus`
- **Description**: Circular torus centered in the XZ plane.
- **Fields**:
  - `majorRadius` (number, default: `1.0`, min: `0.1`, max: `5.0`) - Distance from center of tube to center of torus ($R$).
  - `minorRadius` (number, default: `0.3`, min: `0.02`, max: `2.0`) - Radius of the tube itself ($r$).
- **Notes**: Major radius should be strictly greater than minor radius.

#### `capsule`
- **Description**: Vertical capsule aligned with Y axis.
- **Fields**:
  - `radius` (number, default: `0.4`, min: `0.05`, max: `5.0`)
  - `height` (number, default: `0.8`, min: `0.05`, max: `10.0`) - Half-height of the central cylindrical section.
- **Notes**: Total length = $2 \times height + 2 \times radius$.

#### `cone`
- **Description**: Upright cone tapering to an apex at $+Y$.
- **Fields**:
  - `radius` (number, default: `0.7`, min: `0.05`, max: `5.0`) - Base radius.
  - `height` (number, default: `1.2`, min: `0.05`, max: `10.0`) - Total height from base to tip.

#### `hemisphere`
- **Description**: Half-sphere capping at the XZ plane ($y \ge 0$).
- **Fields**:
  - `radius` (number, default: `0.8`, min: `0.05`, max: `5.0`)

---

### 2. CAD & Mechanical Primitives

#### `pipe`
- **Description**: Hollow cylindrical tube with controllable wall thickness.
- **Fields**:
  - `radius` (number, default: `0.6`, min: `0.05`, max: `5.0`) - Outer radius.
  - `thickness` (number, default: `0.1`, min: `0.01`, max: `1.0`) - Wall thickness.
  - `height` (number, default: `1.0`, min: `0.05`, max: `10.0`) - Half-height.

#### `capped_torus`
- **Description**: Angular slice / arc of a torus.
- **Fields**:
  - `majorRadius` (number, default: `1.0`, min: `0.1`, max: `5.0`)
  - `minorRadius` (number, default: `0.25`, min: `0.02`, max: `2.0`)
  - `angleDeg` (number, default: `90.0`, min: `5.0`, max: `355.0`) - Arc coverage in degrees.

#### `chamfer_cylinder`
- **Description**: Cylinder with beveled / chamfered end edges.
- **Fields**:
  - `radius` (number, default: `0.6`, min: `0.05`, max: `5.0`)
  - `height` (number, default: `0.8`, min: `0.05`, max: `10.0`)
  - `chamfer` (number, default: `0.15`, min: `0.01`, max: `1.0`)

#### `chain_link`
- **Description**: Elongated stadium-shaped chain link segment.
- **Fields**:
  - `length` (number, default: `0.8`, min: `0.1`, max: `5.0`) - Straight segment length.
  - `majorRadius` (number, default: `0.5`, min: `0.1`, max: `3.0`)
  - `minorRadius` (number, default: `0.15`, min: `0.02`, max: `1.0`)

---

### 3. Polyhedra & Prisms

#### `pyramid`
- **Description**: 4-sided square-base pyramid.
- **Fields**:
  - `height` (number, default: `1.2`, min: `0.1`, max: `5.0`)
  - `base` (number, default: `1.0`, min: `0.1`, max: `5.0`)

#### `hexagonal_prism`
- **Description**: Regular 6-sided prism along the Y axis.
- **Fields**:
  - `radius` (number, default: `0.7`, min: `0.05`, max: `5.0`) - Circumradius of hexagon.
  - `height` (number, default: `0.8`, min: `0.05`, max: `10.0`) - Half-height.

#### `triangular_prism`
- **Description**: Equilateral 3-sided prism.
- **Fields**:
  - `radius` (number, default: `0.7`, min: `0.05`, max: `5.0`)
  - `height` (number, default: `0.8`, min: `0.05`, max: `10.0`)

#### `tetrahedron`
- **Description**: Regular 4-sided triangular polyhedron.
- **Fields**:
  - `size` (number, default: `0.9`, min: `0.1`, max: `5.0`)

#### `octahedron`
- **Description**: Regular 8-sided dual-pyramid polyhedron.
- **Fields**:
  - `size` (number, default: `0.9`, min: `0.1`, max: `5.0`)

#### `star_prism`
- **Description**: Extruded regular 5-pointed star.
- **Fields**:
  - `radius` (number, default: `0.8`, min: `0.1`, max: `5.0`) - Outer tip radius.
  - `innerRadiusRatio` (number, default: `0.5`, min: `0.15`, max: `0.85`) - Valley depth ratio.
  - `height` (number, default: `0.4`, min: `0.05`, max: `5.0`) - Half-thickness.

---

### 4. Organic Primitives

#### `ellipsoid`
- **Description**: 3-axis scalable ellipsoid (true distance bound).
- **Fields**:
  - `radii` (vec3 `[rx, ry, rz]`, default: `[0.9, 0.6, 0.5]`, min: `0.05`, max: `5.0`)

#### `superellipsoid`
- **Description**: Squircle-like box/sphere blend with exponents $e_1, e_2$.
- **Fields**:
  - `size` (vec3 `[sx, sy, sz]`, default: `[0.7, 0.7, 0.7]`, min: `0.05`, max: `5.0`)
  - `e1` (number, default: `0.3`, min: `0.05`, max: `4.0`) - Vertical roundness exponent.
  - `e2` (number, default: `0.3`, min: `0.05`, max: `4.0`) - Horizontal roundness exponent.

#### `egg`
- **Description**: Asymmetric vertical ovoid tapering towards the top.
- **Fields**:
  - `radius` (number, default: `0.65`, min: `0.05`, max: `5.0`)
  - `pointiness` (number, default: `0.25`, min: `0.0`, max: `1.0`) - Asymmetry factor.
  - `height` (number, default: `0.8`, min: `0.05`, max: `5.0`)

#### `heart`
- **Description**: 3D cardioid heart shape.
- **Fields**:
  - `size` (number, default: `0.8`, min: `0.1`, max: `5.0`)

---

### 5. Fractal Primitives

#### `mandelbulb`
- **Description**: 3D Power-8 Mandelbulb fractal approximation.
- **Fields**:
  - `power` (number, default: `8.0`, min: `2.0`, max: `16.0`)
  - `iterations` (number, default: `6`, min: `2`, max: `12`)
  - `bailout` (number, default: `2.0`, min: `1.0`, max: `8.0`)
- **Note**: Fractals are computationally heavy; limit count and use conservative step counts.
