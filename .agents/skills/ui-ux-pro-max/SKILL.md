---
name: ui-ux-pro-max
description: UI/UX design intelligence with anti-AI-slop philosophy. 50+ styles, 21 palettes, 50 font pairings, 20 charts, 9 stacks.
---

# ui-ux-pro-max

Design guide for web/mobile. 67 styles, 96 palettes, 57 font pairings, 99 UX guidelines, 25 chart types, 13 stacks. Priority recommendations.

> **Design Philosophy**: Bold, intentional aesthetic direction — never generic/default. Production-grade code, creative vision.

## Prerequisites

Check/install Python:
```bash
# Check version
python3 --version || python --version
# Install (macOS/Ubuntu/Windows)
brew install python3 || sudo apt install python3 || winget install Python.Python.3.12
```

## When to Apply

Reference when:
- Designing components/pages.
- Choosing palettes/typography.
- Reviewing UX issues.
- Building landing pages/dashboards.
- Implementing accessibility (a11y).

## Quick Reference — Rule Categories by Priority

### 1. Accessibility (CRITICAL)
- `color-contrast` — Min 4.5:1 ratio.
- `focus-states` — Visible focus rings.
- `alt-text` — Descriptive image labels.
- `aria-labels` — Required for icon buttons.
- `keyboard-nav` — Tab order matches visual order.
- `form-labels` — Explicit `<label>` + `for`.

### 2. Touch & Interaction (CRITICAL)
- `touch-target-size` — Min 44×44px.
- `hover-vs-tap` — Click/tap for primary actions.
- `loading-buttons` — Disable during async load.
- `error-feedback` — Clean message near field.
- `cursor-pointer` — Add to all clickable elements.

### 3. Performance (HIGH)
- `image-optimization` — WebP, `srcset`, lazy load.
- `reduced-motion` — Check `prefers-reduced-motion`.
- `content-jumping` — Reserve space for async content.

### 4. Layout & Responsive (HIGH)
- `viewport-meta` — `width=device-width, initial-scale=1`.
- `readable-font-size` — Min 16px body text on mobile.
- `horizontal-scroll` — Fit viewport width perfectly.
- `z-index-management` — Use strict scale (10, 20, 30, 50).

### 5. Typography & Color (MEDIUM)
- `line-height` — 1.5–1.75 for body text.
- `line-length` — 65–75 characters max per line.
- `font-pairing` — Match heading/body personalities.

### 6. Animation (MEDIUM)
- `duration-timing` — 150–300ms micro-interactions.
- `transform-performance` — Use `transform` and `opacity` only.
- `loading-states` — Skeleton screens/spinners.

### 7. Style Selection (MEDIUM)
- `style-match` — Match style to product type.
- `consistency` — Consistent style across views.
- `no-emoji-icons` — Use SVG, never raw emojis.

### 8. Charts & Data (LOW)
- `chart-type` — Chart matches data type.
- `color-guidance` — Accessible color palettes.
- `data-table` — Provide table alternative.

---

## How to Use This Skill

### Step 0: Design Thinking — Commit to Bold Aesthetic Direction (REQUIRED)

Define creative direction before code:
1. **Purpose**: Problem solved, target user.
2. **Aesthetic Tone**: Choose BOLD direction (Minimalist, Retro-futuristic, Editorial, Brutalist, Industrial). Intentionality over intensity.
3. **Memorable Thing**: One standout element (interaction, layout, animation).
4. **Constraints**: Framework, performance, a11y.

> **CRITICAL**: Bold maximalism or refined minimalism work. Generic middle fails.

### Step 1: Analyze Requirements
- **Product type**: SaaS, e-commerce, portfolio, dashboard.
- **Style keywords**: minimal, playful, professional.
- **Industry**: healthcare, fintech, gaming.
- **Stack**: Default: `html-tailwind`.

### Step 2: Generate Design System (REQUIRED)

Run search tool for design system recommendations:
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

### Step 2b: Persist Design System (Master + Overrides Pattern)

Save configuration:
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" [--page "dashboard"]
```
Creates:
- `design-system/MASTER.md` — Source of truth.
- `design-system/pages/page.md` — Page-specific overrides.

### Step 3: Supplement with Detailed Searches (as needed)

Query specific domains:
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

| Need | Domain | Example |
| :--- | :--- | :--- |
| Style options | `style` | `--domain style "glassmorphism dark"` |
| Chart recs | `chart` | `--domain chart "real-time dashboard"` |
| UX practices | `ux` | `--domain ux "animation a11y"` |
| Font pairings | `typography` | `--domain typography "elegant luxury"` |
| Landing structure | `landing` | `--domain landing "hero social-proof"` |

### Step 4: Stack Guidelines (Default: html-tailwind)

Query stack implementation:
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack html-tailwind
```
Stacks: `html-tailwind`, `react`, `nextjs`, `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`.

---

## Search Reference

### Available Domains

| Domain | Use For | Example Keywords |
| :--- | :--- | :--- |
| `product` | Type recommendations | SaaS, e-commerce, portfolio |
| `style` | Styles, colors, effects | glassmorphism, minimalism |
| `typography` | Font pairings | elegant, playful, modern |
| `color` | Palettes by type | saas, fintech, service |
| `landing` | Structures, CTAs | hero, testimonial, pricing |
| `chart` | Chart types | trend, comparison, timeline |
| `ux` | UX rules, pitfalls | animation, a11y, loading |
| `react` | React performance | bundle, suspense, memo |
| `web` | Web design standards | aria, focus, semantic |
| `prompt` | AI generation prompts | (style name) |

### Available Stacks

| Stack | Focus |
| :--- | :--- |
| `html-tailwind` | Tailwind, responsive, a11y (DEFAULT) |
| `react` | State, hooks, perf, patterns |
| `nextjs` | SSR, routing, images |
| `vue` | Composition API, Pinia |
| `svelte` | Runes, stores, SvelteKit |
| `swiftui` | Views, State, Animation |
| `react-native` | Native mobile layouts, Navigation |
| `flutter` | Widgets, custom theming |
| `shadcn` | Components, custom styling, forms |
| `jetpack-compose` | Composables, State Hoisting |

---

## Example Workflow

**Request:** "Làm landing page cho dịch vụ chăm sóc da chuyên nghiệp"

### Step 1: Analyze Requirements
- Product: Spa service. Style: elegant, soft. Industry: Beauty. Stack: html-tailwind.

### Step 2: Generate Design System (REQUIRED)
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service elegant" --design-system -p "Serenity Spa"
```

### Step 3: Detailed Searches (Optional)
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux
python3 skills/ui-ux-pro-max/scripts/search.py "elegant luxury serif" --domain typography
```

### Step 4: Stack Guidelines
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "layout responsive form" --stack html-tailwind
```

---

## Output Formats

Configure design system format:
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system [-f markdown]
```

---

## Tips for Better Results

1. **Specific keywords**: "healthcare SaaS dashboard" > "app".
2. **Combine domains**: Style + Typography + Color = Complete system.
3. **UX safety**: Check "animation", "z-index", "a11y" patterns.
4. **No convergence**: Maintain unique project styles, layouts, themes.

---

## Landing Page Strategy

### Above-the-Fold Formula

```
┌─────────────────────────────────────────────────┐
│ [Logo]            [Nav]          [CTA Button]   │
│                                                 │
│   Headline (6-12 words)                         │
│   ─────────────────────────                     │
│   Subheadline (15-25 words)    [Hero Image]     │
│                                 show OUTCOME    │
│   [Primary CTA Button]                          │
│   "Start Free Trial"                            │
│                                                 │
│   Social proof: "Trusted by 10,000+ teams"      │
│   [logo] [logo] [logo] [logo] [logo]            │
└─────────────────────────────────────────────────┘
```

### Headlines
**6–12 words**. State **OUTCOME**, not product.

| ❌ Bad | ✅ Good |
| :--- | :--- |
| "Welcome to Our Platform" | "Turn feedback into features, automatically" |
| "World's Most Advanced AI" | "Spreadsheet that thinks like a database" |
| "We Help Businesses Grow" | "Find bugs before users do" |

### Hero Images
Show **outcome**, not generic screenshot.

| ❌ Avoid | ✅ Use Instead |
| :--- | :--- |
| Standard dashboard | Person achieving target outcome |
| Abstract stock art | Before/after transformation visual |

### CTA Buttons
`Action verb` + `outcome` + `(risk reduction)`.

| ❌ Weak | ✅ Strong |
| :--- | :--- |
| "Submit" | "Start Free Trial" |
| "Learn More" | "See It Work in 60s" |

### Section Order
1. **Hero**: Headline, subheadline, CTA, image.
2. **Social Proof**: Logos, stats, badges.
3. **Problem**: Clear pain statement.
4. **Solution**: Product value pitch.
5. **Features**: Outcomes over specs.
6. **Testimonials**: Quotes + photos.
7. **Pricing**: Transparent options.
8. **FAQ**: Address objections.
9. **Final CTA**: Urgency-driven close.
10. **Footer**: Navigation, legal.

### Social Proof Types

| Type | Best For | Example |
| :--- | :--- | :--- |
| **Logo bar** | B2B trust | "Trusted by Google, Stripe" |
| **Stats** | Scale / proof | "10,000+ teams using" |
| **Reviews** | Consumer / trust | "4.8★ rating on G2" |

### OG Image
`1200×630px` social share image. Keep name + tagline prominent, clean background.

---

## Professional UI Rules

### Anti-AI-Slop Rules (MANDATORY)

**BANNED** generic/AI patterns:

| Banned Pattern | Why Bad | Do Instead |
| :--- | :--- | :--- |
| Inter/Roboto default | No personality | Distinct display + body font pairing |
| Safe purple gradients | Cliché / generic | Curated, context-specific palette |
| Perfect card grids | Vague / forgettable | Asymmetric layout, overlap, offset grids |
| Flat solid backgrounds | Lifeless / empty | Depth: noise, mesh gradient, textures |

### Typography (Elevated)
- **Display font**: Distinct character.
- **Body font**: Highly readable, pairs well.
- **Hierarchy**: Large size contrast, bold styles.

### Color Philosophy
- **Dominant + accent** over safe, bland color selections.
- CSS variables for consistent theming.

### Motion & Animation
- **Orchestrated loading** over scattered hover shifts.
- Keep micro-interactions under 300ms.

### Visual Depth
No flat solid backgrounds:

| Technique | Use Case |
| :--- | :--- |
| Gradient meshes | Modern SaaS, Luxury, Wellness |
| Noise / grain | Editorial, Brutalist, Minimalist |
| Glassmorphism | Clean interfaces, cards, overlays |

### Spatial Composition
- **Asymmetric layouts**, negative space, overlapping layers.
- Avoid boring grid alignment.

### Icons & Visuals
- **No emoji icons**: SVG only (Lucide/Heroicons).
- **Correct logos**: SVG only (Simple Icons).
- **Stable hovers**: No layout shifts.

### Interaction & Cursor
- Clickable elements get `cursor-pointer`.
- Visual feedback on all hover/active states.

### Light/Dark Contrast
- Glass light mode uses `bg-white/80` (minimum opacity).
- Body text contrast min 4.5:1. Avoid thin gray fonts.

### Layout & Spacing
- Floating navbar gets spacing from edges (e.g., `top-4`).
- Prevent content from hiding behind fixed headers.

---

## Pre-Delivery Checklist

### Creative Intentionality
- [ ] Aesthetic tone selected and executed.
- [ ] Banned AI patterns avoided.
- [ ] Custom display font implemented.
- [ ] Background depth (mesh/noise/texture) present.

### Visual Quality
- [ ] No emoji icons (SVG only).
- [ ] Consistent Heroicons/Lucide icons.
- [ ] Hover states stable (no layout shifts).

### Interaction
- [ ] Clickable targets: `cursor-pointer`.
- [ ] 150-300ms transitions on interactive state changes.
- [ ] High-impact load animation included.

### Light/Dark Mode
- [ ] Text contrast matches 4.5:1 min.
- [ ] Borders visible in both modes.

### Layout & Accessibility
- [ ] Mobile responsive, no horizontal scroll.
- [ ] Explicit image `alt` text and form `<label>` tags.
