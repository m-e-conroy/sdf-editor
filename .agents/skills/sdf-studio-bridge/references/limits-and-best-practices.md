# SDF Studio 3D - Modifiers, CSG Mathematics & Limits Reference

SDF Studio evaluates CSG scenes via real-time WebGL GLSL raymarching. To maintain steady 60 FPS rendering and bounded shader compilation times, the engine enforces strict limits on scene complexity while providing a powerful suite of spatial domain modifiers and smooth CSG blending operators.

---

## 1. Hard Technical Limits

| Parameter | Limit | Reason |
| :--- | :--- | :--- |
| **Max Leaf Primitives** | **32** (`MAX_LEAF_COUNT`) | Uniform buffer & register limits in fragment shader raymarcher. |
| **Max CSG Instructions** | **64** (`MAX_INSTRUCTIONS`) | VM execution budget per ray step. |
| **Max Stack Depth** | **8** (`MAX_STACK_DEPTH`) | Fixed-size evaluation stack in WebGL GLSL. |
| **Point Distance Samples** | **256** | Per-call payload budget for `sense.sampleDistance`. |
| **Marching Cubes Grid** | **128³** (default `64³`) | Browser CPU/GPU memory headroom for polygon extraction. |

> [!WARNING]
> Scenes containing more than 32 leaf nodes will be rejected by `scene.applyRecipe` and `scene.addPrimitive` with error `MAX_LEAVES_EXCEEDED`. Design your CSG hierarchy deliberately using modifiers (symmetry, repetition, shelling) to maximize visual detail within 15–28 primitives.

---

## 2. Smooth Boolean CSG Blending (`blend.radius` / $k$)

In SDF Studio, CSG boolean operations between primitives or groups support polynomial smooth transitions parameterized by the blend radius $k$ (`radius`):

```json
{
  "operation": "union",
  "blend": {
    "mode": "smooth_polynomial",
    "radius": 0.15
  }
}
```

### Mathematical Foundations
In the shader VM (`raymarch.frag.glsl`), smooth booleans are evaluated using Inigo Quilez quadratic polynomial smooth minimum and maximum:

#### Smooth Union (`operation: 'union'`)
$$h = \text{clamp}\left(0.5 + 0.5 \cdot \frac{d_B - d_A}{k}, 0.0, 1.0\right)$$
$$d_{\text{res}} = \text{mix}(d_B, d_A, h) - k \cdot h \cdot (1.0 - h)$$

#### Smooth Difference (`operation: 'difference'`, $A - B$)
$$h = \text{clamp}\left(0.5 + 0.5 \cdot \frac{-d_B - d_A}{k}, 0.0, 1.0\right)$$
$$d_{\text{res}} = \text{smaxPolynomial}(d_A, -d_B, k) = \text{mix}(d_A, -d_B, h) + k \cdot h \cdot (1.0 - h)$$

#### Smooth Intersection (`operation: 'intersection'`, $A \cap B$)
$$h = \text{clamp}\left(0.5 + 0.5 \cdot \frac{d_B - d_A}{k}, 0.0, 1.0\right)$$
$$d_{\text{res}} = \text{smaxPolynomial}(d_A, d_B, k) = \text{mix}(d_A, d_B, h) + k \cdot h \cdot (1.0 - h)$$

### Material Interpolation
When two shapes blend smoothly with factor $k$, the raymarcher interpolates their visual material properties across the transition factor $h$:
- **Color**: $\text{Color} = \text{mix}(\text{Color}_B, \text{Color}_A, h)$
- **Roughness**: $\text{Roughness} = \text{mix}(\text{Roughness}_B, \text{Roughness}_A, h)$
- **Metalness**: $\text{Metalness} = \text{mix}(\text{Metalness}_B, \text{Metalness}_A, h)$

### Recommended $k$ Regimes
| Blend Radius $k$ | Appearance | Ideal For |
| :--- | :--- | :--- |
| **$0.0$ (`mode: 'hard'` )** | Knife-sharp transition | Mechanical seams, panel gaps, glass inserts, discrete fasteners. |
| **$0.03 - 0.08$** | Subtle structural fillet / weld | Welded metal tubes, bracket fillets, car body seams, furniture joints. |
| **$0.12 - 0.25$** | Natural anatomical transition | Shoulders joining torsos, neck-to-head, deltoid-to-bicep, stem-to-leaf. |
| **$0.30 - 0.60$** | Viscous fluid merge | Melting wax, cartoon slime, organic alien blobs, dough. |

---

## 3. The SDF Modifier Suite

Modifiers transform the spatial evaluation domain ($p \to p'$) or the final scalar distance ($d \to d'$) on a node before it is combined into the CSG tree.

### 1. Shell Thickness (`modifiers.shellThickness`)
- **JSON Property**: `"shellThickness": number` (e.g. `0.04`)
- **Shader Formula**:
  $$d_{\text{shell}} = |d| - t$$
- **How It Works**:
  Takes any solid primitive (sphere, box, ellipsoid, cylinder, pipe, cone) and hollows it out, creating an inner and outer wall of uniform thickness $t$.
- **Why It Matters**:
  A hollow container conventionally requires 2 primitives: an outer shape and an inner subtraction cutter ($A - B$). `shellThickness` delivers an exact hollow shell with **1 single leaf primitive**!
- **Example — Hollow Helmet / Bowl**:
  ```json
  {
    "ref": "pilot_helmet",
    "name": "Pilot Helmet",
    "type": "sphere",
    "dimensions": { "radius": 0.85 },
    "modifiers": { "shellThickness": 0.04 },
    "material": { "color": "#f8fafc", "roughness": 0.2, "metalness": 0.1 }
  }
  ```

---

### 2. Coordinate Bending (`modifiers.bendFactor`)
- **JSON Property**: `"bendFactor": number` (typically $-1.5$ to $+1.5$)
- **Shader Formula**:
  $$\theta = k \cdot p.x$$
  $$\begin{bmatrix} p.x' \\ p.y' \end{bmatrix} = \begin{bmatrix} \cos \theta & -\sin \theta \\ \sin \theta & \cos \theta \end{bmatrix} \begin{bmatrix} p.x \\ p.y \end{bmatrix}$$
- **How It Works**:
  Deforms local 2D space in the $XY$ plane. As $p.x$ moves away from center, coordinate space rotates proportionally to $k$, curving the shape like an arch, banana, or bow.
- **The Depth Mapping Trick**:
  Because `bendFactor` bends local $X$ into local $Y$, you can bend shapes backward into depth ($Z$) by rotating the node:
  ```json
  "rotationDeg": [-90, 0, 0]
  ```
  Local $Y$ maps to world $Z$ (depth), allowing horizontal width ($X$) to curve convexly forward in the center while curving backward into the chassis at the left and right sides!
- **Example — Curved CRT Television Tube / Cockpit Windshield**:
  ```json
  {
    "ref": "crt_glass",
    "name": "Curved Screen Glass",
    "type": "box",
    "dimensions": { "size": [0.64, 0.05, 0.50] },
    "position": [0.0, 0.0, 0.60],
    "rotationDeg": [-90, 0, 0],
    "modifiers": {
      "bendFactor": -0.20,
      "roundRadius": 0.06
    },
    "material": { "color": "#334155", "roughness": 0.10, "metalness": 0.20 }
  }
  ```

---

### 3. Spatial Twisting (`modifiers.twistFactor` or `twist`)
- **JSON Property**: `"twistFactor": number` (typically $-2.0$ to $+2.0$)
- **Shader Formula**:
  $$\theta = k \cdot p.y$$
  $$\begin{bmatrix} p.x' \\ p.z' \end{bmatrix} = \begin{bmatrix} \cos \theta & -\sin \theta \\ \sin \theta & \cos \theta \end{bmatrix} \begin{bmatrix} p.x \\ p.z \end{bmatrix}$$
- **How It Works**:
  Progressively rotates the horizontal cross-section $(p.x, p.z)$ around the vertical $Y$ axis proportional to height $p.y$.
- **Ideal For**: Screws, industrial drill bits, candy canes, rope cords, spiraling anime hair bangs, decorative columns.
- **Example — Industrial Drill Bit**:
  ```json
  {
    "ref": "drill_head",
    "name": "Twisted Drill Bit",
    "type": "star_prism",
    "dimensions": { "radius": 0.35, "innerRadiusRatio": 0.6, "height": 0.8 },
    "modifiers": { "twistFactor": 1.75 },
    "material": { "color": "#94a3b8", "roughness": 0.25, "metalness": 0.95 }
  }
  ```

---

### 4. Radial Array / Polar Repetition (`modifiers.radialRepeat`)
- **JSON Property**: `"radialRepeat": number` (integer $N \in [2, 24]$)
- **Shader Formula**:
  $$\text{sector} = \frac{2\pi}{N}, \quad r = \sqrt{p.x^2 + p.z^2}$$
  $$\phi = \text{atan2}(p.z, p.x) + 0.5 \cdot \text{sector}$$
  $$\phi' = \text{mod}(\phi, \text{sector}) - 0.5 \cdot \text{sector}$$
  $$p' = (r \cos \phi', p.y, r \sin \phi')$$
- **How It Works**:
  Folds 360° of 3D space around the local vertical $Y$ axis into $N$ identical angular wedges.
- **Important Origin Rule**:
  Because repetition folds space relative to local $x=0, z=0$, primitives centered at $(0, 0, 0)$ will overlap in place. To generate a radial circle of elements (like turbine blades or bolts), the primitive geometry must extend away from the origin along an axis (e.g. rotated off-axis or elongated).
- **Example — Spiked Collar / Gear Teeth**:
  ```json
  {
    "ref": "gear_teeth",
    "name": "Radial Gear Teeth",
    "type": "cone",
    "dimensions": { "radius": 0.15, "height": 0.35 },
    "position": [0.0, 0.0, 0.0],
    "rotationDeg": [90, 0, 0],
    "modifiers": { "radialRepeat": 12 },
    "material": { "color": "#475569", "roughness": 0.3, "metalness": 0.8 }
  }
  ```

---

### 5. Coordinate Symmetry Mirroring (`modifiers.mirrorAxes` or `mirrorAxis`)
- **JSON Property**: `"mirrorAxes": [boolean, boolean, boolean]` (for $[X, Y, Z]$) or `"mirrorAxis": "x" | "y" | "z"`
- **Shader Formula**:
  $$\text{mask \& 1}: p.x' = |p.x|$$
  $$\text{mask \& 2}: p.y' = |p.y|$$
  $$\text{mask \& 4}: p.z' = |p.z|$$
- **How It Works**:
  Folds spatial coordinates across the chosen Cartesian plane(s) using absolute value operators.
- **Bilateral Symmetry ($X$-mirror)**:
  `mirrorAxes: [true, false, false]` duplicates any shape at $+X$ to $-X$. Perfect for character limbs, headlights, jet engines, wings, and side mirrors.
- **Four-Quadrant Symmetry ($X$ & $Z$ mirror)**:
  `mirrorAxes: [true, false, true]` duplicates geometry to all 4 quadrants ($[\pm X, \pm Z]$). Perfect for 4 table/chair legs, 4 car wheels, or 4 corner pillars with **1 single leaf primitive**!
- **Example — Quad Vehicle Wheels (1 leaf!)**:
  ```json
  {
    "ref": "quad_wheels",
    "name": "Wheels (Quad)",
    "type": "cylinder",
    "dimensions": { "radius": 0.32, "height": 0.12 },
    "position": [0.75, -0.35, 0.90],
    "rotationDeg": [0, 0, 90],
    "modifiers": { "mirrorAxes": [true, false, true] },
    "material": { "color": "#0f172a", "roughness": 0.75, "metalness": 0.1 }
  }
  ```

---

### 6. Bounded Linear Count & Spacing (`modifiers.linearCount` & `linearSpacing`)
- **JSON Properties**: `"linearCount": number` ($N \in [1, 16]$), `"linearSpacing": number` ($S > 0$)
- **Shader Formula**:
  $$\text{halfLimit} = \frac{N - 1}{2}$$
  $$p.x' = p.x - S \cdot \text{clamp}\left(\text{round}\left(\frac{p.x}{S}\right), -\text{halfLimit}, \text{halfLimit}\right)$$
- **How It Works**:
  Repeats space along the local $X$ axis $N$ times at regular intervals of spacing $S$.
- **The Bilateral Symmetry Trick (`linearCount: 3`)**:
  When $N=3$, instances appear at offsets $-S, 0, +S$. If the center instance at $x=0$ is positioned inside an opaque body or hull (e.g. torso, fuselage, or chassis), only the two outer instances at $\pm S$ remain visible, producing a 2-sided symmetric pair for the cost of **1 primitive leaf**!
- **Example — Radiator Grille Slats (1 leaf!)**:
  ```json
  {
    "ref": "radiator_slats",
    "name": "Radiator Grille",
    "type": "box",
    "dimensions": { "size": [0.012, 0.15, 0.04] },
    "position": [0.0, 0.20, 0.85],
    "modifiers": { "linearCount": 7, "linearSpacing": 0.08 },
    "material": { "color": "#111827", "roughness": 0.6, "metalness": 0.2 }
  }
  ```

---

### 7. Round Radius (`modifiers.roundRadius`)
- **JSON Property**: `"roundRadius": number` ($R > 0$, e.g. `0.06`)
- **Shader Formula**:
  $$d_{\text{rounded}} = d - R$$
- **How It Works**:
  Subtracts radius $R$ from the evaluated distance, rounding sharp edges and corners into smooth fillets.
- **Why It Matters**:
  Completely eliminates the "computer graphics look" of sharp procedural cubes, pyramids, and prisms. Gives electronic enclosures, wood furniture, and metal blocks natural beveled corners without adding vertices.
- **Example — Soft Leather Cushion / Beveled TV Frame**:
  ```json
  {
    "ref": "leather_seat",
    "name": "Beveled Seat Pad",
    "type": "box",
    "dimensions": { "size": [0.60, 0.08, 0.55] },
    "modifiers": { "roundRadius": 0.06 },
    "material": { "color": "#78350f", "roughness": 0.55, "metalness": 0.02 }
  }
  ```
