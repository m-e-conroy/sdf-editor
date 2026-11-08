# Algorithmic Art Technique Library

> Core technique implementations for procedural/generative art.
> Consumed by `algorithmic-art` skill.

---

## Technique Index

| # | Technique | Core Idea |
|---|-----------|-----------|
| 1 | [Noise Fields (Flow Fields)](#1-noise-fields-flow-fields) | Particles follow vector field sampled from continuous noise |
| 2 | [L-Systems](#2-l-systems-lindenmayer-systems) | String-rewriting grammar → turtle graphics fractal structures |
| 3 | [Cellular Automata](#3-cellular-automata) | Grid cells update simultaneously from local neighbourhood rules |
| 4 | [Reaction-Diffusion](#4-reaction-diffusion) | Two chemicals diffuse and react, producing organic Turing patterns |
| 5 | [Tilings & Tessellations](#5-tilings--tessellations) | Plane-covering shapes — regular, semi-regular, aperiodic, Voronoi |
| 6 | [Space-Filling Curves](#6-space-filling-curves) | Single line visits every point in 2D region |
| 7 | [Strange Attractors](#7-strange-attractors) | Deterministic chaotic systems trace beautiful curves |
| 8 | [Fractal Flames & IFS](#8-fractal-flames--ifs) | Iterated function systems accumulate density map |

---

## 1. Noise Fields (Flow Fields)

Vector field from continuous noise. Particles follow field, tracing paths revealing underlying structure.

**System**: Sample noise at each grid cell → angle. Release particles; each step look up angle at position, move that direction.

**Key parameters**: `noiseScale` (zoom level), `particleCount`, `stepSize`, `noiseOctaves`

```javascript
// p5.js flow field
let particles = [];
const SCALE = 0.005;
const STEP = 2;
const COUNT = 2000;

function setup() {
  createCanvas(800, 800);
  background(10);
  noiseSeed(42); // deterministic
  for (let i = 0; i < COUNT; i++) {
    particles.push(createVector(random(width), random(height)));
  }
}

function draw() {
  for (let p of particles) {
    let angle = noise(p.x * SCALE, p.y * SCALE) * TAU * 2;
    let prev = p.copy();
    p.add(p5.Vector.fromAngle(angle).mult(STEP));
    stroke(255, 8);
    line(prev.x, prev.y, p.x, p.y);
    // wrap edges
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      p.set(random(width), random(height));
    }
  }
}
```

**Variations**: Layer multiple noise fields at different scales; colour by age/speed; curl noise (rotate gradient 90°) for divergence-free flow.

---

## 2. L-Systems (Lindenmayer Systems)

String-rewriting grammar producing fractal branching via turtle graphics.

**System**: Start with axiom string. Apply production rules N iterations. Interpret as drawing commands: `F` = forward, `+` = turn right, `-` = turn left, `[` = push state, `]` = pop state.

```javascript
// L-system engine (language-agnostic pattern)
function lSystem(axiom, rules, iterations) {
  let current = axiom;
  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (let ch of current) {
      next += rules[ch] || ch;
    }
    current = next;
  }
  return current;
}

function drawLSystem(str, len, angleDeg) {
  const rad = radians(angleDeg);
  for (let ch of str) {
    switch (ch) {
      case 'F': line(0, 0, 0, -len); translate(0, -len); break;
      case '+': rotate(rad); break;
      case '-': rotate(-rad); break;
      case '[': push(); break;
      case ']': pop(); break;
    }
  }
}

// Classic examples
// Koch curve:    axiom="F", rules={F:"F+F-F-F+F"}, angle=90
// Fractal plant: axiom="X", rules={X:"F+[[X]-X]-F[-FX]+X", F:"FF"}, angle=25
// Dragon curve:  axiom="FX", rules={X:"X+YF+", Y:"-FX-Y"}, angle=90
// Sierpinski:    axiom="F-G-G", rules={F:"F-G+F+G-F", G:"GG"}, angle=120
```

**Variations**: Randomize angle ±5° per step for organic feel; vary segment length by depth; add leaf symbols as ellipses at branch tips.

---

## 3. Cellular Automata

Grid cells update state simultaneously from local neighbourhood rules. Simple rules → complex emergent behaviour.

**System**: Init grid. Each tick, compute next state from current state + neighbours.

```javascript
// Conway's Game of Life — p5.js
let grid, next;
const RES = 8;
let cols, rows;

function setup() {
  createCanvas(800, 800);
  cols = floor(width / RES);
  rows = floor(height / RES);
  grid = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++)
      grid[i][j] = random() > 0.5 ? 1 : 0;
}

function draw() {
  background(0);
  next = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let neighbours = countNeighbours(grid, i, j);
      if (grid[i][j] === 1) {
        next[i][j] = (neighbours === 2 || neighbours === 3) ? 1 : 0;
      } else {
        next[i][j] = (neighbours === 3) ? 1 : 0;
      }
      if (grid[i][j] === 1) {
        fill(255); noStroke();
        rect(i * RES, j * RES, RES, RES);
      }
    }
  }
  grid = next;
}

function countNeighbours(g, x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      sum += g[col][row];
    }
  return sum;
}

function make2DArray(c, r) {
  return Array.from({ length: c }, () => new Array(r).fill(0));
}
```

**Beyond Life**: 1D elementary automata (Rule 30, Rule 110); multi-state; continuous (SmoothLife); Lenia.

---

## 4. Reaction-Diffusion

Two chemicals (activator A, inhibitor B) diffuse at different rates + react. Imbalance → organic patterns: spots, stripes, labyrinths.

**System**: Gray-Scott model. Each cell stores `[a, b]`. Per tick: diffuse (Laplacian convolution), apply reaction equations.

**Key parameters**: `Da` (diffusion A, ~1.0), `Db` (diffusion B, ~0.5), `f` (feed, 0.01–0.08), `k` (kill, 0.04–0.07).

**Pattern guide**: `f=0.055, k=0.062` → mitosis; `f=0.04, k=0.06` → coral/maze; `f=0.025, k=0.06` → worms.

```javascript
// Simplified reaction-diffusion update (per frame)
function updateRD(grid, w, h, Da, Db, f, k, dt) {
  let next = copyGrid(grid);
  for (let x = 1; x < w - 1; x++) {
    for (let y = 1; y < h - 1; y++) {
      let a = grid[x][y].a;
      let b = grid[x][y].b;
      let lapA = laplacian(grid, x, y, 'a');
      let lapB = laplacian(grid, x, y, 'b');
      next[x][y].a = a + (Da * lapA - a * b * b + f * (1 - a)) * dt;
      next[x][y].b = b + (Db * lapB + a * b * b - (k + f) * b) * dt;
      next[x][y].a = constrain(next[x][y].a, 0, 1);
      next[x][y].b = constrain(next[x][y].b, 0, 1);
    }
  }
  return next;
}

// 3x3 Laplacian kernel (weighted)
function laplacian(g, x, y, ch) {
  return g[x-1][y][ch]*0.2 + g[x+1][y][ch]*0.2
       + g[x][y-1][ch]*0.2 + g[x][y+1][ch]*0.2
       + g[x-1][y-1][ch]*0.05 + g[x+1][y-1][ch]*0.05
       + g[x-1][y+1][ch]*0.05 + g[x+1][y+1][ch]*0.05
       - g[x][y][ch];
}
```

---

## 5. Tilings & Tessellations

Covering plane with shapes — no gaps, no overlaps. Regular, semi-regular, aperiodic tilings produce distinct aesthetics.

| Type | Description | Example |
|------|-------------|---------|
| Regular | Single regular polygon | Squares, triangles, hexagons |
| Semi-regular | 2+ regular polygons, same vertex config | (3.6.3.6), (4.8.8) |
| Aperiodic | Non-repeating, no translational symmetry | Penrose (kite + dart) |
| Voronoi | Regions closest to seed points | Organic cell-like partitions |
| Wang tiles | Square tiles with coloured edges, matched by rule | Procedural textures |

```javascript
// Hexagonal grid — flat-top hex tiling
function drawHexGrid(cols, rows, size) {
  for (let q = 0; q < cols; q++) {
    for (let r = 0; r < rows; r++) {
      let x = size * (3/2 * q);
      let y = size * (Math.sqrt(3) * (r + 0.5 * (q % 2)));
      drawHex(x, y, size);
    }
  }
}

function drawHex(cx, cy, size) {
  beginShape();
  for (let i = 0; i < 6; i++) {
    let angle = TAU / 6 * i;
    vertex(cx + size * cos(angle), cy + size * sin(angle));
  }
  endShape(CLOSE);
}
```

**Penrose tiling**: Recursive subdivision of kite/dart shapes, or de Bruijn dual method. See [Geometry Skill](../../geometry/SKILL.md) for vector math.

---

## 6. Space-Filling Curves

Single continuous line visiting every point in 2D region. Maps 1D data → 2D preserving locality.

**Common curves**: Hilbert, Z-order (Morton), Peano, Gosper (flowsnake).

```javascript
// Hilbert curve via recursive algorithm
function hilbert(order, size) {
  let points = [];
  let n = Math.pow(2, order);
  let total = n * n;
  for (let i = 0; i < total; i++) {
    let [x, y] = d2xy(n, i);
    points.push(createVector(
      x * size / n + size / (2*n),
      y * size / n + size / (2*n)
    ));
  }
  return points;
}

// Convert linear index d to (x,y) in Hilbert curve of order n
function d2xy(n, d) {
  let x = 0, y = 0;
  for (let s = 1; s < n; s *= 2) {
    let rx = (d & 2) > 0 ? 1 : 0;
    let ry = ((d & 1) ^ rx) > 0 ? 0 : 1;
    if (ry === 0) {
      if (rx === 1) { x = s - 1 - x; y = s - 1 - y; }
      [x, y] = [y, x];
    }
    x += s * rx;
    y += s * ry;
    d = Math.floor(d / 4);
  }
  return [x, y];
}
```

---

## 7. Strange Attractors

Deterministic chaotic systems — trajectories trace beautiful, never-repeating curves in phase space.

| Attractor | Character |
|-----------|-----------|
| Lorenz | Butterfly wings (3D) |
| Rössler | Folded band (3D) |
| Clifford | 2D density map — `x'=sin(ay)+c·cos(ax)`, `y'=sin(bx)+d·cos(by)` |
| De Jong | 2D density map — `x'=sin(ay)−cos(bx)`, `y'=sin(cx)−cos(dy)` |

```javascript
// Clifford attractor — accumulate hits into a density buffer
function cliffordAttractor(a, b, c, d, iterations, w, h) {
  let density = make2DArray(w, h);
  let x = 0.1, y = 0.1;
  for (let i = 0; i < iterations; i++) {
    let nx = sin(a * y) + c * cos(a * x);
    let ny = sin(b * x) + d * cos(b * y);
    x = nx; y = ny;
    let px = floor(map(x, -3, 3, 0, w - 1));
    let py = floor(map(y, -3, 3, 0, h - 1));
    if (px >= 0 && px < w && py >= 0 && py < h) density[px][py]++;
  }
  return density;
  // Render: brightness = log(1 + density[x][y]) / log(1 + maxDensity) * 255
}
```

**Tip**: Millions of iterations + logarithmic brightness mapping → rich detail. Colour by trajectory angle or velocity.

---

## 8. Fractal Flames & IFS

Iterated Function Systems apply affine transforms randomly to point, accumulating density map. Fractal flames extend IFS with nonlinear variation functions.

**System**: Pick random transform from weighted set. Apply to current point. Plot. Repeat millions of times.

```
// IFS pseudocode
FUNCTION ifs_render(transforms, weights, iterations)
  point ← (0, 0)
  FOR i FROM 1 TO iterations DO
    t ← choose_weighted(transforms, weights)
    point ← t.apply(point)  // affine: [a b; c d] * point + [e; f]
    IF i > 20 THEN           // skip initial transient
      plot(point, colour = t.colour)
    END
  END
END
```

**Classic IFS**: Barnsley fern (4 transforms), Sierpinski triangle (3 transforms), dragon curve (2 transforms).

---

## Infinite Art & Seeded Generation

### Seed Architecture

```javascript
// Deterministic generation from a single seed
function generateArtwork(seed) {
  randomSeed(seed);
  noiseSeed(seed);

  let palette = generatePalette(random);
  let complexity = floor(random(3, 8));
  let technique = choose(['flow', 'lsystem', 'rd', 'attractor']);

  switch (technique) {
    case 'flow':      flowField(palette, complexity);        break;
    case 'lsystem':   lSystemTree(palette, complexity);      break;
    case 'rd':        reactionDiffusion(palette, complexity); break;
    case 'attractor': strangeAttractor(palette, complexity);  break;
  }
}
// Any integer seed → unique, reproducible artwork
```

### Hash-Based Generation (On-Chain / NFT Art)

```javascript
// Derive deterministic PRNG from a hex hash
function hashToSeed(hash) {
  let seed = 0;
  for (let i = 0; i < hash.length; i++) {
    seed = ((seed << 5) - seed) + hash.charCodeAt(i);
    seed = seed & seed; // Convert to 32-bit integer
  }
  return Math.abs(seed);
}
```

---

## Colour in Algorithmic Art

### Palette Generation

```javascript
// HSB palette from a seed — analogous harmony
function generatePalette(baseHue, count) {
  colorMode(HSB, 360, 100, 100);
  let palette = [];
  for (let i = 0; i < count; i++) {
    palette.push(color(
      (baseHue + i * (360 / count) + random(-15, 15)) % 360,
      random(50, 90),
      random(60, 95)
    ));
  }
  return palette;
}
```

**Strategies**: Analogous (hues within 30°), complementary (180° apart), triadic (120° apart), monochromatic (fixed hue, vary sat/brightness), temperature gradient (value → warm→cool).
