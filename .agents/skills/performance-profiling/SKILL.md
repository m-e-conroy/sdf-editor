---
name: performance-profiling
description: Measure, analyze, and optimize application performance. Use when profiling bottlenecks, analyzing bundle size, debugging memory leaks, or optimizing runtime. Triggers: "performance profile", "analyze bundle", "fix memory leak", "slow runtime", "lighthouse audit".
version: 1.0.1
---

# Performance Profiling

Purpose: measure, analyze, optimize — in that order.

## When to Use

Trigger:
- Performance bottlenecks in web apps.
- JS bundle size and dependency analysis.
- Memory leaks or high heap usage.
- Network request and asset load issues.
- Core Web Vitals (LCP, INP, CLS) optimization.

## Instructions

### 1. Profiling Workflow
1. **Baseline**: Measure current state (Lighthouse, RUM).
2. **Identify**: Find bottleneck (Performance/Memory/Network tabs).
3. **Fix**: Apply targeted change.
4. **Validate**: Confirm improvement vs baseline.

### 2. Core Metrics (CWV)
| Metric | Good | Poor | Target |
| :--- | :--- | :--- | :--- |
| **LCP** | < 2.5s | > 4.0s | Loading |
| **INP** | < 200ms| > 500ms| Interactivity |
| **CLS** | < 0.1 | > 0.25 | Stability |

### 3. Bundle Analysis
- **Large Deps**: Check top of bundle (Bundle Analyzer).
- **Duplicates**: Dedupe redundant libraries.
- **Unused Code**: Check coverage; tree-shake.
- **Route Splitting**: Code-split route-specific JS.

### 4. Runtime Analysis
- **Long Tasks (>50ms)**: UI blocking. Use `scheduler.yield` or Web Workers.
- **Layout Thrashing**: Avoid repeated read/write cycles to DOM.
- **Growing Heap**: Possible memory leak. Check detached DOM nodes.
- **Large Retained**: Clean up event listeners and intervals.

### 5. Quick Wins
1. **Compression**: Enable Gzip/Brotli.
2. **Lazy Load**: Images and non-critical components.
3. **Optimized Assets**: WebP/AVIF, SVGO.
4. **Caching**: Proper `Cache-Control` headers.

## Output Format

Summary:
```markdown
### Performance Profile: `{target}`
**Metric Affected:** `{LCP/INP/CLS/Memory}`
**Bottleneck:** `{Description}`
**Proposed Fix:**
- `{Action 1}`
- `{Action 2}`
**Expected Impact:** `{High/Med/Low}`
```

## Examples

**Input:** "My app feels janky during scroll."
**Expected Action:**
1. Record scroll in Performance tab.
2. Identify "Long Tasks" or "Layout" spikes.
3. Fix: Use `requestAnimationFrame` or CSS `will-change`.

**Input:** "React bundle is 2MB."
**Expected Action:**
1. Run `webpack-bundle-analyzer`.
2. Find oversized libraries (e.g., `moment`, `lodash`).
3. Fix: Replace with `date-fns`, use lodash-es, or lazy load components.

## Resources

- [Web Vitals Guide](https://web.dev/vitals/)
- [Chrome DevTools Performance Documentation](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)

## Related Skills

- **[core-web-vitals](../core-web-vitals/SKILL.md)** — Metric-specific optimizations.
- **[clean-code](../clean-code/SKILL.md)** — Reducing complexity.
- **[nodejs-best-practices](../nodejs-best-practices/SKILL.md)** — Backend runtime performance.
