---
name: procedural-generation
description: PCG for levels, terrain, and content. Perlin/Simplex noise, L-systems, Wave Function Collapse, Cellular Automata. Triggers: "pcg", "procedural generation", "random levels", "terrain generation", "wfc".
version: 1.0.0
---

# Procedural Generation Skill

> **Purpose**: Create infinite, varied game content via algorithmic rules.

## When to Use

- Generate random/endless levels or dungeons.
- Create natural terrain, heightmaps, and biomes.
- Distribute vegetation or loot points algorithmically.
- Generate rule-based architecture or flora structures (L-systems).
- Resolve complex tile-based constraints (Wave Function Collapse).

## Instructions

Apply PCG algorithms matching targeted outputs:

### 1. Noise-Based Systems (Terrain/Heightmaps)
- **Perlin / Simplex Noise**: Continuous, natural-looking gradients.
- **Fractional Brownian Motion (fBm)**: Layer octaves of varying frequency/amplitude for fractal detail (e.g. mountain peaks).
- **Thresholding**: Map ranges to biomes (e.g. value < 0.3 is Water, 0.3-0.7 Grass, > 0.7 Snow).

### 2. Layouts & Dungeons
- **Random Walk / Drunkard's Walk**: Organic cave/trench burrowing.
- **BSP (Binary Space Partitioning)**: Structured, rectangular room layouts.
- **Cellular Automata**: Smooth organic bounds using neighbor count rules (e.g. if neighbors > 4, state = Wall).

### 3. Constraint-Based (WFC)
- **Wave Function Collapse**: Propagate local adjacency rules across a grid. Excellent for consistent modular systems (city blocks, pipe networks).

### 4. Grammar-Based (L-Systems)
- **L-Systems**: Use formal recursive replacement string rules (e.g. `F -> FF-[-F+F+F]+[+F-F-F]`) to grow branching models (vegetation, road networks).

## Output Format

Propose PCG strategy:

```markdown
### PCG Specification: {Feature Name}

**1. Algorithm**
- (Noise, WFC, Cellular Automata, etc.)

**2. Parameters**
- (Seed, Octaves, Persistence, Birth/Death limits)

**3. Transformation**
- (How data maps to game objects/tiles)

**4. Performance**
- (Generation time, pre-computation vs. runtime)
```

## Related Skills

- **[algorithmic-art](../algorithmic-art/SKILL.md)**: Aesthetic procedural systems.
- **[game-math](../game-math/SKILL.md)**: Noise function sampling and math.
- **[spatial-partitioning](../spatial-partitioning/SKILL.md)**: Storing and querying large-scale procedural worlds.
