# Art Movement Algorithm Reference Library

> Portable pseudocode algorithms for generative art inspired by historical movements.
> Consumed by `art-theory` skill.

---

## Pseudocode Conventions

```
// Comments explain intent
FUNCTION name(params) → return_type
  variable ← expression
  FOR each item IN collection DO ...
  WHILE condition DO ...
  IF condition THEN ... ELSE ...
  RETURN value
END

// Math notation
dot(A, B)           // dot product (see trigonometry skill)
cross(A, B)         // cross product (see geometry skill)
lerp(a, b, t)       // linear interpolation: a + t*(b-a)
noise(x, y)         // any continuous noise function (Perlin, Simplex, etc.)
random(min, max)    // seeded uniform random in range
map(v, inLow, inHigh, outLow, outHigh)  // remap a value between ranges
```

---

## Movement → Algorithm Mapping

Movements encode implicit computational philosophies. Identify underlying process:

| Movement                  | Core Algorithmic Idea                                                  |
| ------------------------- | ---------------------------------------------------------------------- |
| Impressionism             | Local colour sampling + atmospheric blur + short stroke accumulation   |
| Pointillism               | Discrete dot placement; optical mixing through proximity and density   |
| Cubism                    | Multi-perspective decomposition; fragmented planes of same subject      |
| Constructivism            | Primary geometry assembled by rule; form follows structural logic      |
| Suprematism               | Minimal geometric primitives; deliberate spatial tension               |
| De Stijl                  | Grid-constrained rectangles; primary colour + black/white only         |
| Op Art                    | Perceptual instability via high-contrast pattern interference          |
| Minimalism                | Repetition/seriality; reduction to essential formal elements           |
| Abstract Expressionism    | Gestural mark accumulation; velocity and pressure as aesthetic signal  |
| Surrealism                | Juxtaposition of unrelated systems; dreamlike associative logic        |
| Generative / Computer Art | Emergent complexity from explicit rules and seeded variation           |
| Futurism                  | Motion as form; simultaneous states of a moving object                 |
| Bauhaus                   | Grid + proportion + functional geometry; type as visual element        |
| Art Nouveau               | Organic curves, symmetry axes, botanical branching motifs              |
| Glitch Art                | Deliberate corruption of data or render pipeline                       |
| Pixel Art                 | Integer grid; palette reduction; aliasing as aesthetic                 |
| Fractal / Recursive       | Self-similarity across scales; recursive subdivision                   |

---

## Math Mapping Reference

| Need                                       | Use                                          |
| ------------------------------------------ | -------------------------------------------- |
| Organic curves, oscillation, rotation      | **trigonometry** skill                       |
| Spatial tests, normals, distances, planes  | **geometry** skill                           |
| Transforms, projections, perspective grids | **linear-algebra** skill                     |
| Noise-based perturbation                   | `noise(x, y, z)` — any value noise function  |
| Colour interpolation                       | `lerp(c1, c2, t)` in linear colour space     |

---

## Seeded Variation

Algorithms should accept `seed`. Same seed = identical output. Reproducible and explorable.

```
FUNCTION with_seed(seed, algorithm, params)
  set_random_seed(seed)
  set_noise_seed(seed)
  RETURN algorithm(params)
END
```

---

## Movement Algorithms

### Constructivism / De Stijl / Suprematism

**Philosophy:** Meaning from structure. Geometry is vocabulary; proportion and tension are grammar. Restrict palette.

```
FUNCTION constructivist_composition(canvas, seed)
  set_seed(seed)
  palette ← [BLACK, WHITE, RED, YELLOW, BLUE]   // De Stijl constraint; expand for Constructivism

  // Recursive binary space partitioning
  FUNCTION subdivide(rect, depth)
    IF depth = 0 OR rect.area < MIN_CELL THEN
      fill(rect, choose_weighted(palette))       // smaller cells → colour; larger → white
      RETURN
    END
    axis ← IF depth is even THEN HORIZONTAL ELSE VERTICAL
    split ← rect.edge(axis) * random(0.3, 0.7)  // golden ratio feels natural here
    [left, right] ← rect.split(axis, split)
    subdivide(left,  depth - 1)
    subdivide(right, depth - 1)
    draw_line(canvas, split_edge, thickness = 3, colour = BLACK)
  END

  subdivide(canvas.bounds, depth = random_int(3, 6))
END
```

---

### Impressionism

**Philosophy:** Light is motion. Transient illumination recorded. Short directional strokes carry colour and gesture.

```
FUNCTION impressionist_render(source_image, canvas, stroke_count)
  FOR i FROM 1 TO stroke_count DO
    pos    ← random_point(canvas.bounds)
    colour ← sample_colour(source_image, pos)
    angle  ← estimate_local_gradient_angle(source_image, pos) + random(-0.4, 0.4)
    length ← random(8, 24)          // short strokes
    width  ← random(2, 6)

    // Stroke as a displaced line with colour variation
    stroke_colour ← vary_temperature(colour, random(-0.1, 0.1))   // warm/cool shifts
    draw_stroke(canvas, pos, angle, length, width, stroke_colour, opacity = 0.7)
  END
END

// Temperature variation: shift hue slightly toward warm (orange) or cool (blue)
FUNCTION vary_temperature(c, amount) → colour
  IF amount > 0 THEN RETURN lerp(c, WARM_ORANGE, amount)
  ELSE RETURN lerp(c, COOL_BLUE, abs(amount))
END
```

---

### Op Art (Optical / Perceptual)

**Philosophy:** Unstable field. Rigid geometric repetition at threshold of resolution generates movement/vibration/depth via human visual processing limits.

```
// Uses trigonometry skill: sin/cos for oscillating frequencies
FUNCTION op_art_interference(canvas, freq_A, freq_B, phase_offset)
  FOR each pixel (x, y) IN canvas DO
    // Two overlapping sine wave gratings at different angles
    wave_1 ← sin(x * freq_A + y * freq_A * 0.5)
    wave_2 ← sin(x * freq_B * 0.5 + y * freq_B + phase_offset)
    interference ← (wave_1 + wave_2) * 0.5   // combine: -1 to 1

    // Threshold to hard black/white — no grey, maximum contrast
    value ← IF interference > 0 THEN WHITE ELSE BLACK
    set_pixel(canvas, x, y, value)
  END
END

// Concentric circle variant
FUNCTION op_art_radial(canvas, centre, ring_freq, distortion_freq)
  FOR each pixel (x, y) IN canvas DO
    dist  ← distance(centre, (x, y))     // trigonometry skill: distance
    angle ← atan2(y - centre.y, x - centre.x)

    // Distort radial distance by angle-dependent oscillation
    distorted_dist ← dist + sin(angle * distortion_freq) * 10
    value ← IF floor(distorted_dist * ring_freq) is even THEN WHITE ELSE BLACK
    set_pixel(canvas, x, y, value)
  END
END
```

---

### Abstract Expressionism / Action Painting

**Philosophy:** Mark IS meaning. Force, velocity, gesture are subject. Simulate body: energy and physical accumulation.

```
FUNCTION action_painting(canvas, seed, stroke_count)
  set_seed(seed)

  // Simulate a gestural "body" that carries momentum
  pos      ← random_point(canvas.bounds)
  velocity ← random_vector(magnitude = 15)

  FOR i FROM 1 TO stroke_count DO
    // Physics: velocity with drag and noise perturbation
    velocity ← velocity * 0.92 + noise_vector(pos, scale = 0.005) * 8
    velocity ← clamp_magnitude(velocity, 2, 30)
    pos      ← pos + velocity

    // Wrap or bounce at canvas edges
    pos ← wrap(pos, canvas.bounds)

    // Mark: size and opacity correlate with speed
    speed   ← magnitude(velocity)
    radius  ← map(speed, 2, 30, 2, 18)
    opacity ← map(speed, 2, 30, 0.4, 0.9)
    colour  ← choose_from_palette_weighted_by_energy(speed)

    draw_splatter(canvas, pos, radius, colour, opacity)
  END
END
```

---

### Surrealism

**Philosophy:** Unconscious mind associaion. Unrelated systems in same space: one governs geography, other governs identity. Dreamlike dissonance.

```
FUNCTION surrealist_composition(canvas, seed, element_count)
  set_seed(seed)

  // System A: Atmospheric landscape using noise fields
  // (geometry skill: signed distance functions for terrain forms)
  FOR y FROM 0 TO canvas.height DO
    horizon ← canvas.height * 0.5 + noise(y * 0.01, seed) * 80
    sky_colour  ← gradient(DEEP_VIOLET, WARM_AMBER, y / horizon)
    draw_horizontal_band(canvas, y, IF y < horizon THEN sky_colour ELSE EARTH_TONE)
  END

  // System B: Incongruous objects placed by System A's depth map
  FOR i FROM 1 TO element_count DO
    pos   ← random_point(canvas.bounds)
    depth ← sample_depth_map(canvas, pos)    // derived from the noise landscape
    scale ← map(depth, 0, 1, 2.0, 0.3)      // distant = small, near = large

    // Deliberately select an incongruous subject
    subject ← random_from([MELTING_CLOCK, FLOATING_EYE, INVERTED_STAIRCASE, ...])
    draw_subject(canvas, subject, pos, scale, desaturate_by = depth * 0.5)
  END
END
```

---

### Generative / Computer Art

**Philosophy:** System is artist. Beauty in process. Seeded variation → infinite expressions.

```
FUNCTION generative_flow_field(canvas, seed, particle_count, steps)
  set_seed(seed)

  // Build a vector field from layered noise
  // (trigonometry skill: angles; noise produces smooth rotation values)
  FUNCTION field_angle(x, y) → angle
    nx ← noise(x * 0.003, y * 0.003, 0)
    ny ← noise(x * 0.003, y * 0.003, 100)
    RETURN atan2(ny - 0.5, nx - 0.5) * TWO_PI * 2
  END

  FOR each particle IN spawn_particles(count = particle_count, bounds = canvas) DO
    FOR step FROM 1 TO steps DO
      angle    ← field_angle(particle.pos.x, particle.pos.y)
      velocity ← vector_from_angle(angle) * particle.speed
      new_pos  ← particle.pos + velocity

      draw_line(canvas, particle.pos, new_pos,
                colour  = particle.colour,
                opacity = map(step, 0, steps, 0.8, 0.0))   // fade with age

      particle.pos ← new_pos
      IF out_of_bounds(new_pos, canvas) THEN BREAK
    END
  END
END
```

---

### Art Nouveau

**Philosophy:** Nature is geometry. Organic forms obey growth rules: branching, spiralling, symmetry. Ornament is structure.

```
// Uses trigonometry skill heavily: angles, arcs, spiral equations
FUNCTION art_nouveau_vine(canvas, origin, seed)
  set_seed(seed)

  FUNCTION grow_branch(pos, angle, length, depth)
    IF depth = 0 OR length < 2 THEN RETURN

    // Organic curve: angle drifts with noise, not straight
    FOR t FROM 0 TO 1 STEP 0.05 DO
      curve_angle ← angle + noise(pos.x * 0.02, pos.y * 0.02, depth) * 0.8
      next_pos    ← pos + vector_from_angle(curve_angle) * (length * 0.05)

      thickness ← lerp(depth * 1.5, 0.5, t)     // taper toward tip
      draw_curve_segment(canvas, pos, next_pos, thickness, DEEP_GREEN)
      pos ← next_pos
    END

    // Bifurcate: main branch + side shoot
    side_angle ← angle + random(-0.6, -0.3) * PI   // asymmetric branching
    grow_branch(pos, angle + random(-0.2, 0.2), length * 0.7, depth - 1)
    grow_branch(pos, side_angle,                length * 0.5, depth - 2)

    // Leaf at branching nodes
    IF random() > 0.4 THEN draw_leaf(canvas, pos, angle, scale = length * 0.3)
  END

  grow_branch(origin, -HALF_PI, 150, depth = 6)
END
```

---

### Fractal / Recursive

**Philosophy:** Complexity without accumulation. Single rule applied to own output → infinite variation. Self-similarity is depth.

```
// Uses geometry skill: line segments, bounding tests
// Uses trigonometry skill: rotation of branch vectors
FUNCTION fractal_tree(canvas, pos, angle, length, depth, seed)
  set_seed(seed)
  IF depth = 0 THEN RETURN

  tip ← pos + vector_from_angle(angle) * length
  draw_line(canvas, pos, tip,
            colour    = lerp(BARK_BROWN, LEAF_GREEN, 1 - depth/MAX_DEPTH),
            thickness = depth * 1.2)

  branch_angle ← PI / 5 + noise(depth, seed) * 0.3   // ~36° ± noise
  length_ratio ← 0.67 + noise(depth, seed + 1) * 0.1  // golden ratio ≈ 0.618–0.7

  fractal_tree(canvas, tip, angle - branch_angle, length * length_ratio, depth - 1, seed)
  fractal_tree(canvas, tip, angle + branch_angle, length * length_ratio, depth - 1, seed + 1)
END
```

---

### Glitch Art

**Philosophy:** Error as aesthetic. assumptions violated. Corruption is revelation.

```
FUNCTION glitch_displacement(canvas, source, seed)
  set_seed(seed)

  // Horizontal scanline displacement
  FOR y FROM 0 TO canvas.height DO
    IF random() < 0.08 THEN   // 8% of rows get glitched
      offset    ← random_int(-80, 80)
      row_width ← random_int(canvas.width / 4, canvas.width)
      row_start ← random_int(0, canvas.width - row_width)

      FOR x FROM row_start TO row_start + row_width DO
        src_x ← wrap(x + offset, 0, canvas.width)
        set_pixel(canvas, x, y, get_pixel(source, src_x, y))
      END
    ELSE
      copy_row(source, canvas, y)
    END
  END

  // Channel separation: shift R/B channels independently
  FOR each pixel IN canvas DO
    r ← get_channel(source, pixel.x + random_int(-5,5), pixel.y, RED)
    g ← get_channel(source, pixel.x, pixel.y, GREEN)
    b ← get_channel(source, pixel.x + random_int(-5,5), pixel.y, BLUE)
    set_pixel(canvas, pixel.x, pixel.y, rgb(r, g, b))
  END
END
```

---

## Composing Across Movements

Layer movements:

```
// Constructivist grid + Impressionist stroke texture
FUNCTION constructivist_impressionism(canvas, seed)
  // Layer 1: Constructivist structure as skeleton
  grid ← subdivide_canvas(canvas, seed, depth = 4)

  FOR each cell IN grid DO
    base_colour ← choose_primary(cell.index)

    // Layer 2: Fill with Impressionist strokes instead of flat colour
    FOR i FROM 1 TO cell.area / 20 DO
      pos    ← random_point(cell.bounds)
      angle  ← noise(pos.x * 0.01, pos.y * 0.01) * TWO_PI
      stroke ← short_stroke(pos, angle, vary_colour(base_colour, 0.1))
      draw_stroke(canvas, stroke, clip_to = cell.bounds)
    END
  END

  // Layer 3: Bold construction lines over strokes
  draw_grid_lines(canvas, grid, thickness = 3, colour = BLACK)
END
```
