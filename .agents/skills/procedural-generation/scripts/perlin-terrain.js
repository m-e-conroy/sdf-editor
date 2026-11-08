/**
 * Simple 2D Perlin Terrain Generator
 * Returns a heightmap based on noise octaves.
 */

export class TerrainGenerator {
  constructor(seed = Math.random()) {
    this.seed = seed;
  }

  // Minimal Noise Mock (Agent should replace with real Perlin/OpenSimplex)
  noise(x, y) {
    return (Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453) % 1;
  }

  generateMap(width, height, scale = 0.1, octaves = 3) {
    const map = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        let amplitude = 1;
        let frequency = 1;
        let noiseHeight = 0;

        for (let i = 0; i < octaves; i++) {
          const sampleX = x * scale * frequency;
          const sampleY = y * scale * frequency;
          noiseHeight += this.noise(sampleX, sampleY) * amplitude;
          
          amplitude *= 0.5;
          frequency *= 2;
        }

        row.push(noiseHeight);
      }
      map.push(row);
    }
    return map;
  }
}
