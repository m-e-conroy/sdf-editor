# React Performance Optimization Checklist

## 1. Identify Bottlenecks
- [ ] Use **React DevTools Profiler** to find components re-rendering too often.
- [ ] Enable "Highlight updates when components render" in DevTools settings.

## 2. Rendering Optimization
- [ ] **React.memo**: Wrap pure functional components that receive static or primitive props.
- [ ] **useCallback**: Memoize event handlers passed to memoized children.
- [ ] **useMemo**: Memoize expensive calculations (e.g. filtering large lists).

## 3. State Management
- [ ] **State Colocation**: Move state down. Don't lift state to `App.tsx` if only `Modal.tsx` needs it.
- [ ] **Avoid Context Overuse**: Context triggers a re-render in ALL consumers when any part of the value changes. Split contexts or use Zustand for performance.

## 4. Network & Bundle
- [ ] **Lazy Loading**: Use `React.lazy(() => import('./HeavyComponent'))`.
- [ ] **Virtualization**: Use `react-window` or `react-virtuoso` for lists > 100 items.
- [ ] **Asset Optimization**: Use Next.js `<Image />` or manual `srcset` for responsive images.
