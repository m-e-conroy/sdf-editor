# SVG Graphics Patterns and Guidelines

## Why SVG

- Scales infinitely.
- Searchable/accessible text.
- CSS-styleable (dark mode).
- Small file size.
- Version control friendly.

## Banner Template

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300">
  <!-- Background -->
  <rect width="100%" height="100%" fill="#1a1a2e"/>

  <!-- Title -->
  <text x="50" y="100" font-size="48" fill="#fff" font-family="system-ui">
    Project Name
  </text>

  <!-- Tagline -->
  <text x="50" y="150" font-size="24" fill="#888">
    One-line description
  </text>

  <!-- Feature pills -->
  <g transform="translate(50, 200)">
    <rect rx="12" width="100" height="24" fill="#4a4a6a"/>
    <text x="50" y="17" text-anchor="middle" fill="#fff" font-size="12">Feature 1</text>
  </g>
</svg>
```

## Key Techniques

| Technique          | Use Case            |
| ------------------ | ------------------- |
| `viewBox`          | Responsive scaling  |
| `<defs>` + `<use>` | Reusable components |
| `<linearGradient>` | Modern backgrounds  |
| `<clipPath>`       | Shaped containers   |
| CSS variables      | Theme switching     |

## Dark/Light Mode

```xml
<style>
  @media (prefers-color-scheme: dark) {
    .bg { fill: #1a1a2e; }
    .text { fill: #ffffff; }
  }
  @media (prefers-color-scheme: light) {
    .bg { fill: #ffffff; }
    .text { fill: #1a1a2e; }
  }
</style>
```

## Icon Guidelines

| Size    | Use               |
| ------- | ----------------- |
| 16x16   | Favicon, small UI |
| 32x32   | Tab icon, lists   |
| 128x128 | App icon          |
| 512x512 | Store listing     |

## SMIL Animation

### Delayed Fade-In Pattern

```xml
<!-- Element starts invisible, fades in after delay -->
<g opacity="0">
  <text x="50" y="100" font-size="48" fill="#fff">Title</text>
  <animate
    attributeName="opacity"
    from="0" to="1"
    dur="0.8s"
    begin="0.5s"
    fill="freeze"
  />
</g>
```

**Key attributes**:

| Attribute     | Purpose               | Values                                             |
| ------------- | --------------------- | -------------------------------------------------- |
| `begin`       | Delay before start    | `"0.5s"`, `"1s"`, `"click"`                        |
| `dur`         | Animation duration    | `"0.3s"` to `"2s"` typical                         |
| `fill`        | State after animation | `"freeze"` (keep end state) or `"remove"` (revert) |
| `repeatCount` | Repetitions           | `"1"`, `"3"`, `"indefinite"`                       |

### Staggered Entrance

```xml
<g opacity="0">
  <rect rx="12" width="100" height="24" fill="#4a4a6a"/>
  <text x="50" y="17" text-anchor="middle" fill="#fff" font-size="12">Feature 1</text>
  <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.3s" fill="freeze"/>
</g>
<g opacity="0">
  <rect rx="12" width="100" height="24" fill="#4a4a6a"/>
  <text x="50" y="17" text-anchor="middle" fill="#fff" font-size="12">Feature 2</text>
  <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.6s" fill="freeze"/>
</g>
<g opacity="0">
  <rect rx="12" width="100" height="24" fill="#4a4a6a"/>
  <text x="50" y="17" text-anchor="middle" fill="#fff" font-size="12">Feature 3</text>
  <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.9s" fill="freeze"/>
</g>
```

**Pattern**: Increment `begin` by `0.3s` per element for staggering.

### SMIL Compatibility

| Platform        | Support                          |
| --------------- | -------------------------------- |
| Chrome/Edge     | Full SMIL                        |
| Firefox         | Full SMIL                        |
| Safari          | Full SMIL                        |
| GitHub README   | **No animation** (static render) |
| npm/PyPI README | **No animation** (static render) |

**Rule**: For README badges/banners, set initial `opacity="1"` as fallback. Animated SVGs render static first frame in non-animated contexts.

### CSS vs SMIL: Choosing the Right Tool

| Goal                                   | Use  | Why                                 |
| -------------------------------------- | ---- | ----------------------------------- |
| `opacity`, `fill`, `stroke` loops      | CSS  | Hardware-accelerated, lower battery |
| `transform` (rotate, scale, translate) | CSS  | Composited on GPU                   |
| `:hover` / `:focus` states             | CSS  | Cannot be done with SMIL            |
| Path morphing (`d` attribute)          | SMIL | CSS cannot animate `d` portably     |
| `viewBox` animation                    | SMIL | No CSS equivalent                   |
| Click/event-triggered sequences        | SMIL | `begin="el.click"` without JS       |
| Following a bezier motion path         | SMIL | `<animateMotion>` + `<mpath>`       |

**General rule**: CSS for visual props/transforms. SMIL for attributes CSS cannot touch or JS-free interaction.

### Path Morphing

Shapes must have **same number of points and command types**.

```xml
<svg viewBox="0 0 100 100">
  <!-- Square that morphs into a diamond on click -->
  <path id="shape" d="M10,10 L90,10 L90,90 L10,90 Z" fill="crimson">
    <animate
      attributeName="d"
      begin="shape.click"
      dur="0.5s"
      fill="freeze"
      to="M50,10 L90,50 L50,90 L10,50 Z"
    />
  </path>
</svg>
```

**Tip**: Trace shapes with same number of anchor points and winding direction.

### Motion Path

Move element along curve via `<animateMotion>` + `<mpath>`.

```xml
<svg viewBox="0 0 200 200">
  <!-- The path to follow (can be invisible) -->
  <path id="track" d="M20,100 Q60,20 100,100 T180,100" fill="none" stroke="#ddd"/>

  <!-- Element that travels the path -->
  <circle r="6" fill="#4a90d9">
    <animateMotion dur="3s" repeatCount="indefinite" rotate="auto">
      <mpath href="#track"/>
    </animateMotion>
  </circle>
</svg>
```

`rotate="auto"` keeps element tangent to curve. Use `rotate="auto-reverse"` to flip 180°.

### Interactive Event Chaining

`begin` and `end` reference other animations/events. Zero JS state machines.

```xml
<svg viewBox="0 0 200 100">
  <!-- Button: click to start sequence -->
  <rect id="btn" x="10" y="35" width="80" height="30" rx="6" fill="#4a90d9" cursor="pointer"/>
  <text x="50" y="55" text-anchor="middle" fill="#fff" font-size="12" pointer-events="none">Play</text>

  <!-- Step 1: slide in on click -->
  <circle id="dot" cx="-20" cy="50" r="10" fill="#cf4040">
    <animate
      id="slide"
      attributeName="cx"
      begin="btn.click"
      dur="0.4s"
      to="150"
      fill="freeze"
    />
    <!-- Step 2: pulse after step 1 ends -->
    <animate
      attributeName="r"
      begin="slide.end + 0.1s"
      dur="0.3s"
      values="10;16;10"
      fill="freeze"
    />
  </circle>
</svg>
```

**Chaining syntax**:
- `begin="anim1.end"`
- `begin="anim1.end + 0.5s"`
- `begin="el.click"`
- `begin="el.mouseover"`

### Spline Easing

Use `calcMode="spline"` with `keySplines`.

```xml
<animate
  attributeName="cy"
  from="20" to="180"
  dur="1s"
  calcMode="spline"
  keyTimes="0;1"
  keySplines="0.4 0 0.2 1"
  fill="freeze"
/>
```

| Feel                   | keySplines value   |
| ---------------------- | ------------------ |
| Ease-in-out (Material) | `0.4 0 0.2 1`      |
| Ease-out (decelerate)  | `0 0 0.2 1`        |
| Ease-in (accelerate)   | `0.4 0 1 1`        |
| Bouncy                 | `0.34 1.56 0.64 1` |

## CSS Transform Patterns

### Nested Group Pattern

**Problem**: Position transforms conflict with animation transforms.
**Solution**: Nested `<g>` groups.

```xml
<!-- Outer group: POSITION (static) -->
<g transform="translate(600, 150)">
  <!-- Inner group: ANIMATION (dynamic) -->
  <g>
    <animateTransform
      attributeName="transform"
      type="rotate"
      from="0" to="360"
      dur="10s"
      repeatCount="indefinite"
    />
    <!-- The actual shape -->
    <circle r="20" fill="#4a90d9"/>
  </g>
</g>
```

**Rule**: Never mix static and animated transforms on same element.
**CSS alt**: Add `transform-box: fill-box; transform-origin: center;` to CSS.

### Scale from Center

```xml
<g transform="translate(100, 100)">
  <!-- transform-origin doesn't work reliably in SVG;
       use translate to center, then scale -->
  <g>
    <animateTransform
      attributeName="transform"
      type="scale"
      from="0.8" to="1.0"
      dur="0.5s"
      fill="freeze"
    />
    <!-- Shape centered at origin (0,0) -->
    <circle cx="0" cy="0" r="30" fill="#d3f5db"/>
  </g>
</g>
```

### Pulse Effect

```xml
<circle cx="50" cy="50" r="10" fill="#cf222e">
  <animateTransform
    attributeName="transform"
    type="scale"
    values="1;1.2;1"
    dur="1.5s"
    repeatCount="indefinite"
  />
</circle>
```

## ClipPath Container Layering

### 3-Layer Pattern

Shaped containers with content/borders:

```xml
<defs>
  <clipPath id="container-clip">
    <rect x="50" y="50" width="400" height="200" rx="16"/>
  </clipPath>
</defs>

<!-- Layer 1: BACKGROUND (fill behind clip) -->
<rect x="50" y="50" width="400" height="200" rx="16" fill="#f6f8fa"/>

<!-- Layer 2: CLIPPED CONTENT (stays inside shape) -->
<g clip-path="url(#container-clip)">
  <!-- Content that may overflow is safely clipped -->
  <image href="photo.jpg" x="50" y="50" width="400" height="200"/>
  <text x="70" y="120" font-size="24" fill="#fff">Overlay Text</text>
</g>

<!-- Layer 3: BORDER OUTLINE (drawn last, on top) -->
<rect x="50" y="50" width="400" height="200" rx="16"
      fill="none" stroke="#d1d9e0" stroke-width="2"/>
```

**Order**:
1. Background
2. Clipped content
3. Border outline

### Rounded Card Pattern

```xml
<defs>
  <clipPath id="card">
    <rect width="300" height="180" rx="12"/>
  </clipPath>
</defs>

<g transform="translate(20, 20)">
  <!-- Card background -->
  <rect width="300" height="180" rx="12" fill="#ffffff"/>

  <!-- Card content (clipped) -->
  <g clip-path="url(#card)">
    <!-- Header band -->
    <rect width="300" height="48" fill="#0550ae"/>
    <text x="16" y="32" fill="#fff" font-size="16" font-weight="bold">Card Title</text>
    <!-- Body -->
    <text x="16" y="80" fill="#1f2328" font-size="14">Card content here</text>
  </g>

  <!-- Card border -->
  <rect width="300" height="180" rx="12" fill="none" stroke="#d1d9e0"/>
</g>
```

## SVG Optimization

### SVGO Configuration

```json
{
  "plugins": [
    "preset-default",
    { "name": "removeViewBox", "active": false },
    { "name": "removeDimensions", "active": true },
    { "name": "removeTitle", "active": false }
  ]
}
```

**Critical**: Never remove `viewBox` (scaling) or `<title>` (a11y).

### Size Budget

| SVG Type        | Target Size | Max   |
| --------------- | ----------- | ----- |
| Icon            | < 1 KB      | 2 KB  |
| Badge/shield    | < 2 KB      | 5 KB  |
| Banner          | < 10 KB     | 25 KB |
| Complex diagram | < 25 KB     | 50 KB |

### Common Optimization Wins

| Technique                                      | Savings           |
| ---------------------------------------------- | ----------------- |
| Remove editor metadata (Inkscape, Illustrator) | 20-50%            |
| Simplify paths (reduce decimal precision)      | 10-20%            |
| Remove empty groups/unused defs                | 5-15%             |
| Convert shapes to paths                        | 5-10%             |
| Gzip on server                                 | 60-80% additional |

## Accessibility

- `role="img"` on `<svg>` for meaningful graphics.
- `<title>` — short name (first child of `<svg>`).
- `<desc>` — description for complex diagrams; link via `aria-labelledby`.
- `aria-hidden="true"` on decorative SVGs.
- Contrast: 4.5:1 text, 3:1 UI.
- `pointer-events="none"` on text inside interactive shapes.

```xml
<svg role="img" aria-labelledby="svg-title svg-desc" viewBox="0 0 400 200">
  <title id="svg-title">Monthly revenue chart</title>
  <desc id="svg-desc">Bar chart showing revenue rising from $12k in January to $18k in March.</desc>
  <!-- chart content -->
</svg>
```

## Tools

| Tool       | Purpose         |
| ---------- | --------------- |
| SVGO       | Optimize/minify |
| Inkscape   | Visual editing  |
| svg-to-png | Rasterization   |

## SVG for Documentation Illustrations

Best format for polished documentation visuals. More control than Mermaid.

### When to Choose SVG Over Mermaid

| Scenario                         | Use SVG                  | Use Mermaid             |
| -------------------------------- | ------------------------ | ----------------------- |
| Architecture overview for README | ✅ Branded, polished     | ❌ Too generic          |
| Internal dev docs flow           | ❌ Overkill              | ✅ Quick, accurate      |
| Marketing / landing page         | ✅ Full design control   | ❌ Unbranded            |
| Infographic with custom layout   | ✅ Arbitrary positioning | ❌ Auto-layout only     |
| Dark/light theme required        | ✅ CSS media queries     | ⚠️ Limited theming      |
| Print / high-DPI output          | ✅ Infinitely scalable   | ⚠️ Rasterized at render |

### Illustration Template

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" role="img">
  <title>Architecture Overview</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .bg { fill: #1e1e1e; }
      .text { fill: #d4d4d4; }
      .box { fill: #2d2d2d; stroke: #444; }
      .accent { fill: #0078d4; }
    }
    @media (prefers-color-scheme: light) {
      .bg { fill: #ffffff; }
      .text { fill: #1a1a1a; }
      .box { fill: #f5f5f5; stroke: #ddd; }
      .accent { fill: #0078d4; }
    }
    .label { font-family: system-ui, sans-serif; font-size: 14px; }
    .title-text { font-family: system-ui, sans-serif; font-size: 20px; font-weight: 600; }
    .connector { stroke-width: 2; stroke-dasharray: 4 4; }
  </style>

  <rect class="bg" width="100%" height="100%"/>

  <!-- Title -->
  <text class="title-text text" x="400" y="30" text-anchor="middle">Architecture Name</text>

  <!-- Boxes with rounded corners -->
  <g transform="translate(100, 60)">
    <rect class="box" rx="8" width="200" height="80" stroke-width="1.5"/>
    <text class="label text" x="100" y="45" text-anchor="middle">Component A</text>
  </g>

  <!-- Connector arrow -->
  <line class="connector accent" x1="300" y1="100" x2="400" y2="100"/>
  <polygon class="accent" points="400,95 410,100 400,105"/>

  <g transform="translate(420, 60)">
    <rect class="box" rx="8" width="200" height="80" stroke-width="1.5"/>
    <text class="label text" x="100" y="45" text-anchor="middle">Component B</text>
  </g>
</svg>
```

### Key Principles

1. **Dark/light mode** via `@media (prefers-color-scheme: ...)`.
2. **Semantic classes** (`.box`, `.accent`).
3. **Center** with `text-anchor="middle"`.
4. **Group** with `<g transform="translate()">`.
5. **ViewBox ratio** 2:1 (800x400) or 1:1 (600x600).

## Illustrating Real-World Subjects (Animals, Objects, People)

### The Snowman Problem

**Problem**: AI defaults to stacking circles/rects for animals/people. Produces geometric snowmen.
**Root Cause**: Primitive shapes instead of `<path>` with Bezier curves.
**Snowman Test**: Silhouette alone must identify subject.

### Mandatory Rules for Subject Illustrations

| #   | Rule                                                                     | Why                                                                                                                    |
| --- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | **Start with silhouette** — outer `<path>` outline FIRST                 | Outline makes/breaks recognition.                                                                                      |
| 2   | **Use `<path>` with Bezier curves** for organic shapes                   | Animals have no perfect circles.                                                                                       |
| 3   | **Pass squint test** — outline alone identifiable                        | If outline doesn't read as subject, redo it.                                                                           |
| 4   | **Get proportions right**                                                | Head-to-body ratio, limb length/placement.                                                                             |
| 5   | **Count limbs correctly**                                                | 4 legs for quadrupeds, 2 for birds. Show 3 legs in side view.                                                          |
| 6   | **Differentiate species by anatomy**                                     | See feature table.                                                                                                     |

### Feature Differentiation Table

| Animal     | Key Silhouette Features                                                                                                        | Common AI Mistakes                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| **Dog**    | Snout/muzzle, floppy/pointed ears (SIDE), 4 legs, tail, body longer than tall                                                   | Flat face, cat ears on top, 2 legs, circle head                    |
| **Cat**    | Pointed ears on TOP, round face, whiskers, slender body, long tail, 4 legs, small paws                                          | No whiskers, dog-like snout, stocky body                           |
| **Bird**   | Beak, wings, 2 thin legs, tail feathers, no arms                                                                               | 4 legs, no beak, arms instead of wings                             |
| **Fish**   | Streamlined oval body, tail fin, dorsal fin, NO legs                                                                           | Legs added, round body, no fins                                    |
| **Person** | Head on neck on shoulders, 2 arms, 2 legs, torso taller than wide                                                              | Snowman stack, no neck, T-pose arms                                |
| **Horse**  | Long neck, elongated head, 4 long thin legs, mane, flowing tail                                                                | Dog-like proportions, short legs, round head                       |
| **Rabbit** | LONG upright ears, round body, short front legs, large hind legs, cotton tail                                                   | Short ears, same-length legs                                       |

### Path-First Approach

**Never build animal from primitive shapes.** Build from single continuous `<path>` outline.

#### Step-by-Step: Drawing a Dog (Side View)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img">
  <title>Dog illustration</title>

  <!-- Step 1: BODY OUTLINE - single path defining the entire silhouette -->
  <!-- Start at chest, go along back, tail, rear leg, belly, front leg, up to chin, head, ear, back to start -->
  <path d="
    M 120,180
    C 120,140 140,110 180,105
    C 210,100 250,100 280,110
    Q 300,118 310,135
    L 330,115
    L 320,140
    Q 315,160 310,180
    L 305,220
    L 290,220
    L 290,185
    Q 260,195 220,195
    L 180,220
    L 165,220
    L 170,185
    Q 140,180 120,180
    Z
  " fill="#c89050" stroke="#6b4226" stroke-width="2"/>

  <!-- Step 2: HEAD - overlapping path with snout protruding forward -->
  <path d="
    M 130,160
    C 120,130 100,110 85,100
    Q 70,92 60,100
    C 50,110 55,130 60,140
    L 65,148
    Q 80,160 100,165
    Q 115,168 130,160
    Z
  " fill="#c89050" stroke="#6b4226" stroke-width="2"/>

  <!-- Step 3: SNOUT/MUZZLE - dog feature -->
  <path d="
    M 72,130
    C 60,125 50,128 48,135
    C 46,142 52,148 62,148
    Q 70,145 72,138
    Z
  " fill="#e8c690" stroke="#6b4226" stroke-width="1.5"/>

  <!-- Step 4: EAR - floppy, on SIDE of head -->
  <path d="
    M 100,105
    C 105,85 115,75 120,80
    C 125,88 118,105 110,112
    Z
  " fill="#a0703c" stroke="#6b4226" stroke-width="1.5"/>

  <!-- Step 5: Details LAST - eye, nose, mouth -->
  <circle cx="82" cy="115" r="4" fill="#2c1810"/>  <!-- Eye -->
  <ellipse cx="52" cy="135" rx="5" ry="4" fill="#2c1810"/>  <!-- Nose -->
  <path d="M 55,142 Q 62,148 68,144" fill="none" stroke="#6b4226" stroke-width="1.5"/>  <!-- Mouth -->

  <!-- Step 6: TAIL - curved upward -->
  <path d="M 325,120 Q 345,90 350,100 Q 348,115 330,125"
        fill="#c89050" stroke="#6b4226" stroke-width="2"/>
</svg>
```

**Why this works**:
- Silhouette reads "dog" without color.
- Snout dominant feature.
- 4 legs visible.
- Proportion correct (longer than tall).
- `<path>` curves only.

### Proportion Guide

```text
┌──────────────────────────────────────────┐
│         HEAD    NECK    BODY             │
│        ┌───┐   ┌─┐   ┌──────────┐      │
│   ear→ │   │───│ │───│          │ ←tail │
│        │ • │   │ │   │          │  /    │
│  snout→│ ▪ │   └─┘   │          │ /     │
│        └───┘         │          │/      │
│                      └──┬──┬──┬─┘       │
│                         │  │  │  │      │
│                     legs (4, not 2!)    │
│                                         │
│  HEAD:BODY ratio ≈ 1:2.5 (dog)         │
│  HEAD:BODY ratio ≈ 1:2   (cat)         │
│  HEAD:BODY ratio ≈ 1:4   (horse)       │
│  LEG length ≈ body height (dog, horse)  │
│  LEG length ≈ 0.7× body height (cat)   │
└──────────────────────────────────────────┘
```

### Color Guidelines

| Subject | Natural Palette                                                                    | Avoid                               |
| ------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| Dog     | Browns (#c89050, #a0703c, #6b4226), Golden (#e8c690), Black, White, Gray           | Green, blue, purple (unnatural)     |
| Cat     | Gray (#8e8e8e), Orange (#d68c45), Black, White, Siamese (#c4a882)                  | Bright green, neon colors           |
| Bird    | Species-specific; blue (#4a90d9), red (#cf4040), yellow (#e6b422), green (#5ab05a) | All one color (usually multi-toned) |
| Person  | Skin tones, clothing colors                                                        | Geometric shapes for body parts     |
| Tree    | Green canopy (#4a8c3f, #6aad5a), brown trunk (#6b4226, #8b6914)                    | Blue leaves, gray trunk             |

### Common Failure Modes

| Failure                  | Cause                                                          | Fix                                                         |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------- |
| "Snowman with ears"      | Stacked circles for body                                       | One continuous `<path>` for body                            |
| "Cat ears on everything" | Triangles on top of head                                       | Ears on SIDE of head (dogs)                                 |
| "Floating face"          | Features on perfect circle                                     | Distinct head shape (snout, jawline)                        |
| "Stick figure animal"    | Rects for legs on circles                                      | Legs taper, connect organically                             |
| "2-legged quadruped"     | Missing leg pair                                               | Always count 4 legs                                         |
| "Psychedelic colors"     | Branding palette instead of natural                            | Earthy tones                                                |
| "Giant head, tiny body"  | No proportion reference                                        | Head smaller than body                                      |

### Workflow

1. **Identify** — Species/object, view.
2. **Reference proportions** — Check guide/table.
3. **Draw silhouette** — `<path>` for body. Squint test.
4. **Add major features** — Head, ears, limbs.
5. **Add details last** — Eyes, nose, mouth, texture, color.
6. **Squint test** — Recognizable without color?
