---
name: algorithmic-art
description: Build procedural, generative, and infinite art using code. Use this skill when the user asks to create algorithmic art, generative art, procedural art, infinite art, or code-driven visual systems. Also triggers on "flow field", "noise field", "L-system", "cellular automata", "Game of Life", "reaction-diffusion", "Turing pattern", "tessellation", "Penrose tiling", "space-filling curve", "Hilbert curve", "strange attractor", "Lorenz attractor", "fractal flame", "particle system art", "recursive pattern", "procedural texture", "infinite zoom", "seeded generation", "hash art", "on-chain art", "generative NFT", "creative coding algorithm", or any request to produce visual art through rules, systems, or code rather than manual drawing.
version: 1.0.0
---

# Algorithmic Art

Art made by defining systems — rules, equations, simulations — computation produces visual result. Artist designs *process*, not *picture*.

**Scope distinction:**
- **art-theory** → *"what aesthetic?"* (movement → philosophy → pseudocode)
- **p5js-creative-coding** → *"how render in p5.js?"* (API reference)
- **algorithmic-art** (this skill) → *"what algorithm drives it?"* (technique → math → implementation)

## When to Use

Use when user wants visual output via code-driven systems: noise flow fields, L-systems, cellular automata, reaction-diffusion, tilings, fractals, strange attractors, space-filling curves, particle systems, procedural generation. Also for infinite art, seeded variation, deterministic yet explorable art.

## Instructions

1. **Identify the Technique**: Match request to algorithm family via [Technique Index](references/technique-library.md#technique-index).
2. **Explain the System**: Describe rules, inputs, and emergent behaviour before code.
3. **Select the Implementation**: Consult [references/technique-library.md](references/technique-library.md) for full code pattern.
4. **Provide Seeded, Deterministic Code**: Every algorithm must accept `seed` param. See [Infinite Art & Seeded Generation](references/technique-library.md#infinite-art--seeded-generation).
5. **Use Math Skills**: Reference **trigonometry**, **geometry**, **linear-algebra**, **physics** for underlying math.
6. **Target the User's Renderer**: Adapt to user environment (p5.js, Canvas, SVG, GLSL, Python/PIL). Default: p5.js.
7. **Design for Infinity**: Varying seed, params, or iterations must yield a family of related but distinct artworks.

## Output Format

1. **System Description**: What algorithm does + why it produces interesting visuals.
2. **Parameters**: Key tunables (seed, resolution, iteration count, scale, palette).
3. **Code**: Complete, runnable implementation in target environment.
4. **Variations**: 2–3 parameter tweaks or extensions for meaningfully different results.

## Examples

**Input:** "Create a generative art piece using a flow field"

**Expected Action:**
1. Match to technique: [Noise Fields (Flow Fields)](references/technique-library.md#1-noise-fields-flow-fields).
2. Provide complete p5.js sketch with seeded noise, particle system, fading trails.
3. Suggest variations: curl noise for smoother paths, colour by velocity, layer multiple noise octaves.

**Input:** "Make a reaction-diffusion pattern that looks like coral"

**Expected Action:**
1. Match to technique: [Reaction-Diffusion](references/technique-library.md#4-reaction-diffusion).
2. Set params to coral regime: `f=0.055, k=0.062`.
3. Provide implementation with pixel-level rendering.
4. Suggest variations: adjust feed/kill rates, add colour mapping based on chemical B concentration.

## Resources

- [references/technique-library.md](references/technique-library.md) — Full implementation library: 8 core techniques, seeded generation, colour palette strategies.
- [The Coding Train — Coding Challenges](https://thecodingtrain.com/challenges) — Video walkthroughs
- [Generative Artistry](https://generativeartistry.com/) — Classic technique tutorials
- [Inconvergent](https://inconvergent.net/) — Deep generative algorithm explorations
- [The Book of Shaders](https://thebookofshaders.com/) — GPU procedural techniques
- [The Nature of Code (Daniel Shiffman)](https://natureofcode.com/)

## Related Skills

- **[art-theory](../art-theory/SKILL.md)** — Historical + theoretical foundations of algorithmic art movements.
- **[p5js-creative-coding](../p5js-creative-coding/SKILL.md)** — Primary tool for implementing generative algorithms.
- **[trigonometry](../trigonometry/SKILL.md)** — Periodic motion, oscillations, wave-based patterns.
- **[game-math](../game-math/SKILL.md)** — Vectors + coordinate transforms for complex generative systems.
