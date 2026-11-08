---
name: core-web-vitals
description: Optimize web applications for Google's Core Web Vitals (LCP, INP, CLS). Use when the user asks about performance optimization, lighthouse scores, page load speed, responsiveness, layout shifts, or Core Web Vitals metrics.
---

# Core Web Vitals Optimization

## When to Use

Use when user requests to improve frontend performance, fix Lighthouse scores, or optimize LCP, INP, CLS.

## Instructions

1. **Identify Metric**:
    - **LCP (Largest Contentful Paint)**: Loading. Good <= 2.5s.
    - **INP (Interaction to Next Paint)**: Responsiveness. Good <= 200ms.
    - **CLS (Cumulative Layout Shift)**: Stability. Good <= 0.1.

2. **Analyze Root Cause**:
    - **LCP**: Render-blocking CSS/JS, slow server, large unoptimized images, CSR rendering delays.
    - **INP**: Long JS tasks, complex layout/style calculations, excessive DOM tree size.
    - **CLS**: Missing image dimensions, dynamic elements without reserved space, font swapping (FOUT/FOIT).

3. **Apply Optimization**:
    - **LCP**: Preload resources, defer non-critical JS, use modern image formats (WebP/AVIF), SSR/SSG, CDNs.
    - **INP**: Break long tasks (`setTimeout`, `scheduler.yield`), delegate to Web Workers, reduce JS bundles.
    - **CLS**: Set explicit `width`/`height` on media, reserve layout containers for ads/dynamic widgets, use `font-display: optional`.

4. **Verify Fix**: Measure using Chrome DevTools (Performance panel), Lighthouse audits, or `web-vitals` library (RUM).

## Output Format

```markdown
### ⚡ {Metric} Optimization Plan

**1. Root Cause Analysis**
Why metric underperforms.

**2. Proposed Fixes**
- **Fix 1**: [Description and Code Example]
- **Fix 2**: [Description and Code Example]

**3. Verification Steps**
How to test via DevTools or Lighthouse.
```

## Examples

**Input:** "My images are causing layout shifts as they load. How do I fix this?"
**Expected Action:**
1. Metric: CLS.
2. Root cause: Unknown image dimensions.
3. Fix: Add explicit `width`/`height` or CSS `aspect-ratio`.
4. Code: Show before/after HTML and CSS.

## Resources

- [Google Core Web Vitals Documentation](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Optimize LCP](https://web.dev/articles/optimize-lcp)
- [Optimize INP](https://web.dev/articles/optimize-inp)
- [Optimize CLS](https://web.dev/articles/optimize-cls)

## Related Skills

- **[nodejs-best-practices](../nodejs-best-practices/SKILL.md)**: Backend optimization for LCP.
- **[frontend-design](../frontend-design/SKILL.md)**: UX patterns to reduce layout shifts.
