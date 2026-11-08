---
name: art-theory
description: Translate art movements and visual theory into language-agnostic algorithmic pseudocode for procedural and generative digital art. Use this skill whenever the user asks to create generative or procedural art inspired by a specific art movement or style — impressionism, cubism, surrealism, constructivism, op art, minimalism, expressionism, etc. — and wants the underlying algorithm described in a way that is portable across languages and libraries. Also triggers on "how would I code [art style]", "algorithmic [movement]", "procedural [style] art", "generative [movement] style", or any request to turn an art theory concept into a composable algorithm. References the geometry, trigonometry, and linear-algebra skills for spatial and mathematical foundations.
version: 1.0.0
---

# Art Theory

Purpose: translate art movements/styles into portable, language-agnostic algorithms.

## When to Use

Trigger:
- Create generative/procedural art inspired by art movement/style (impressionism, cubism, surrealism).
- Request portable, language-agnostic algorithms.

## Instructions

1. **Understand Art Theory**: Translate movements into algorithmic rules, processes, and constraints.
2. **Find Core Algorithm**: Use [Movement → Algorithm Mapping](references/movement-algorithms.md#movement--algorithm-mapping).
3. **Use Math Foundations**: Refer to **geometry**, **trigonometry**, **linear-algebra** via [Math Mapping Reference](references/movement-algorithms.md#math-mapping-reference).
4. **Retrieve Pseudocode**: Load pseudocode from [Movement Algorithms](references/movement-algorithms.md#movement-algorithms).
5. **Format**: Follow [Pseudocode Conventions](references/movement-algorithms.md#pseudocode-conventions).
6. **Apply Seed**: Support `seed` parameters. See [Seeded Variation](references/movement-algorithms.md#seeded-variation).
7. **Compose**: Layer styles via [Composing Across Movements](references/movement-algorithms.md#composing-across-movements).

## Output Format

1. **Philosophy**: Computational translation of movement philosophy.
2. **Algorithm**: Portable pseudocode.
3. **Dependencies**: Required math functions or skills.

## Examples

**Input:** "How would I code Pointillism?"
**Expected Action:**
1. Find Pointillism mapping: "Discrete dot placement; optical mixing through proximity and density."
2. Draft pseudocode: `poisson_disc_sample` + colour theory splitting.
3. Output Philosophy → Algorithm → Dependencies.

**Expected Output:**

**Philosophy:** Canvas with discrete dots. Local colour approximates source tone. Optical mixing produces continuous gradients.

**Algorithm:**
```
FUNCTION pointillist_render(source_image, canvas, dot_radius, density)
  FOR each sample_point IN poisson_disc_sample(canvas.bounds, min_dist = dot_radius * 2) DO
    colour ← sample_colour(source_image, sample_point)
    colour ← apply_colour_theory_split(colour)
    draw_circle(canvas, sample_point, dot_radius, colour)
  END
END

FUNCTION apply_colour_theory_split(c) → colour
  primary ← nearest_primary(c)
  comp    ← complementary(primary)
  RETURN lerp(c, primary, 0.3) + noise_offset_in_hue(0.05)
END
```

**Dependencies:** Poisson disc sampling, `lerp`.

## Resources

- [references/movement-algorithms.md](references/movement-algorithms.md) — Full pseudocode library.
- [List of Art Movements — Wikipedia](https://en.wikipedia.org/wiki/List_of_art_movements)

## Related Skills

- **[algorithmic-art](../algorithmic-art/SKILL.md)** — Implementation of systems/rules.
- **[p5js-creative-coding](../p5js-creative-coding/SKILL.md)** — Layer for browser visuals.
- **[trigonometry](../trigonometry/SKILL.md)** — Harmony, balance, periodic patterns.
- **[geometry](../geometry/SKILL.md)** — Composition, tessellation, perspective.
