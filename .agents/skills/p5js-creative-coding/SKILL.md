---
name: p5js-creative-coding
description: Create interactive graphics, animations, and creative coding projects using p5.js. Use for 2D/3D visualizations, generative art, interactive sketches, animations, games, data visualizations, or real-time graphics in browser. Triggers on "p5", "p5.js", "Processing", "canvas sketch", "particle system", "noise field", "perlin noise", "generative pattern", "draw with JavaScript", "interactive art", "visual sketch", "pixel manipulation", "audio-reactive visuals".
---

# p5.js Creative Coding

Purpose: browser-based creative coding. Interactive graphics, animations, multimedia.

**Docs**: https://p5js.org/reference/
**Editor**: https://editor.p5js.org/
**Examples**: https://p5js.org/examples/

## When to Use

Trigger:
- 2D/3D visualizations, generative art, interactive sketches, animations, games, data viz.
- Drawing shapes, handling user input, pixel manipulations, real-time graphics.
- "p5", "p5.js", "Processing", "canvas sketch", "particle system", "noise field", "perlin noise".

## Instructions

1. **Environment**: CDN (quick), npm (large apps), or web editor.
2. **Structure**: `setup()` for init (`createCanvas`, `frameRate`), `draw()` for animation loop.
3. **State**: Declare vars (pos, vel, arrays) globally. Update inside `draw()`.
4. **Built-ins**: Use `map()`, `noise()`, `lerp()`, `random()` instead of custom math utils.
5. **Matrix Isolation**: Use `push()` and `pop()` to isolate transforms (`translate`, `rotate`) and styles.

## Output Format

1. **Visual Concept**: Explain visual algorithm/math.
2. **Strategy**: Steps for init, update, draw.
3. **Code Example**: Complete, runnable sketch.
4. **Interactivity**: Explain interactive hooks (mouse/keys/audio).

## Project Setup

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/p5@1.11.0/lib/p5.min.js"></script>
```

### npm
```bash
npm install p5
```
```javascript
import p5 from "p5";
new p5((p) => {
  p.setup = () => p.createCanvas(400, 400);
  p.draw = () => {
    p.background(220);
    p.ellipse(p.mouseX, p.mouseY, 50, 50);
  };
});
```

## Core Structure

```javascript
function preload() { /* Load assets */ }
function setup() { createCanvas(400, 400); }
function draw() { background(220); ellipse(mouseX, mouseY, 50); }

// Loop control
noLoop(); loop(); redraw();
```

## Canvas & Environment

```javascript
createCanvas(800, 600, WEBGL); // 3D
resizeCanvas(windowWidth, windowHeight);

// System Vars: width, height, frameCount, frameRate(), deltaTime
```

## Drawing Shapes

### 2D Primitives
```javascript
point(x, y); line(x1, y1, x2, y2);
rect(x, y, w, h); square(x, y, s);
ellipse(x, y, w, h); circle(x, y, d);
triangle(x1, y1, x2, y2, x3, y3);
arc(x, y, w, h, start, stop, mode); // Modes: OPEN, CHORD, PIE
```

### Custom Shapes
```javascript
beginShape(); vertex(x, y); bezierVertex(...); endShape(CLOSE);
beginContour(); /* holes */ endContour();
```

## Color

```javascript
colorMode(HSB, 360, 100, 100);
fill(hue, sat, bri, alpha); stroke(c); noFill(); noStroke();
lerpColor(c1, c2, 0.5);
```

## Transformations

```javascript
push(); // Save state
translate(x, y); rotate(angle); scale(s);
pop(); // Restore state

angleMode(DEGREES); // or RADIANS
```

## Typography

```javascript
textSize(32); textAlign(CENTER, CENTER);
text("Hello", x, y);
let w = textWidth("Hello");
```

## Images

```javascript
img = loadImage("url");
image(img, x, y, w, h);
filter(GRAY); tint(255, 128);

loadPixels(); pixels[i] = 255; updatePixels();
```

## Input

```javascript
// Mouse: mouseX, mouseY, mouseIsPressed, mouseButton
function mousePressed() { ... }

// Keyboard: key, keyCode, keyIsPressed
if (keyIsDown(LEFT_ARROW)) { ... }
```

## Math & Random

```javascript
map(val, inMin, inMax, outMin, outMax);
lerp(a, b, t); constrain(n, low, high);
random(min, max); noise(x, y, z); // Perlin

// Vectors: createVector(x, y), v.add(v2), v.mult(s), v.mag(), v.normalize()
```

## 3D (WEBGL)

```javascript
createCanvas(w, h, WEBGL);
orbitControl(); ambientLight(100);
box(100); sphere(50); torus(100, 20);
normalMaterial(); specularMaterial(c);
```

## DOM

```javascript
createButton("Click"); createSlider(0, 255); createInput("");
button.position(x, y); button.style("color", "red");
```

## Saving Output

```javascript
saveCanvas("name", "png");
saveGif("name", 5); // 5 sec
```

## Examples

### Perlin Flow Field (Fragment)
```javascript
for (let p of particles) {
  let angle = noise(p.x * 0.01, p.y * 0.01) * TWO_PI;
  p.add(p5.Vector.fromAngle(angle));
  point(p.x, p.y);
}
```

## Quick Reference

| Func | Description |
| --- | --- |
| `push()`/`pop()` | Save/restore state |
| `translate`/`rotate` | Transform coords |
| `map()` | Remap range |
| `noise()` | Smooth randomness |
| `WEBGL` | 3D mode constant |

## Related Skills

- **[trigonometry](../trigonometry/SKILL.md)** — Arcs, orbits, waves.
- **[geometry](../geometry/SKILL.md)** — Collisions, spatial queries.
- **[physics](../physics/SKILL.md)** — Forces, particles.
- **[art-theory](../art-theory/SKILL.md)** — Aesthetic algorithms.
- **[game-math](../game-math/SKILL.md)** — 3D transforms.
- **[gsap](../gsap/SKILL.md)** — Timeline choreography.
