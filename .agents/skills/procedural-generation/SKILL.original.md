---
name: procedural-generation
description: PCG for levels, terrain, and content. Perlin/Simplex noise, L-systems, Wave Function Collapse, Cellular Automata. Triggers: "pcg", "procedural generation", "random levels", "terrain generation", "wfc".
version: 1.0.0
---

# Procedural Generation Skill

> **Purpose**: Create infinite, varied game content via algorithmic rules.

## When to Use

- Generate random/endless levels or dungeons.
- Create natural-looking terrain and landscapes.
- Distribute vegetation or loot algorithmically.
- Generate rule-based architecture or flora (L-systems).
- Resolve complex tile-based constraints (WFC).

## Instructions

Apply PCG algorithms based on desired output:

### 1. Noise-Based Generation (Terrain/Clouds)
- **Perlin / Simplex Noise**: Use for smooth, natural gradients (heightmaps).
- **Fractional Brownian Motion (fBm)**: Layer multiple noise octaves (varying frequency/amplitude) for fractal detail (e.g., mountains).
- **Thresholding**: Map noise values to biomes (e.g., <0.3 Water, 0.3-0.7 Grass, >0.7 Snow).

### 2. Dungeons & Layouts
- **Random Walk / Drunkard's Walk**: Simple "burrowing" for organic caves.
- **BSP (Binary Space Partitioning)**: Recursive splitting for structured, room-based dungeons.
- **Cellular Automata**: Use "Game of Life" rules (e.g., if neighbors > 4, turn Wall) to smooth out organic shapes.

### 3. Constraint-Based (WFC)
- **Wave Function Collapse**: Propagates local adjacency constraints to fill a grid. Great for consistent tile-matching (pipes, buildings, top-down maps).

### 4. Rule-Based (L-Systems)
- **L-Systems**: Use formal grammars (A -> AB, B -> A) to grow recursive structures like trees, lightning, or city roads.

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

- **[algorithmic-art](../algorithmic-art/SKILL.md)**: Visual-focused procedural systems.
- **[game-math](../game-math/SKILL.md)**: Noise functions and sampling.
- **[spatial-partitioning](../spatial-partitioning/SKILL.md)**: Storing and querying large procedural worlds.
