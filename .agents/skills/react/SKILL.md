---
name: react
description: React development patterns, hooks, components, performance, and state management. Triggers: "react", "hooks", "useeffect", "usestate", "component", "props", "context api", "virtual dom", "reconciliation".
version: 1.0.0
---

# React Skill

Build high-performance, maintainable UI using React components and hooks.

## When to Use

Trigger when:
- Creating UI components and layouts.
- Managing local or global UI state.
- Handling side effects (API calls, DOM manipulation).
- Optimizing render performance (memoization).
- Implementing complex UI logic via custom hooks.

## Instructions

### 1. Component Design
- **Functional Components**: Use function components exclusively.
- **Composition over Inheritance**: Use children and props to build complex UIs.
- **Controlled Components**: Use state for form inputs.

### 2. Hooks Strategy
- **Rules of Hooks**: Call hooks only at top level, only in React function contexts.
- **Dependency Arrays**: Include all variables used in `useEffect`, `useMemo`, `useCallback`.
- **Custom Hooks**: Extract shared logic into `useX` functions.

### 3. Performance Optimization
- **Memoization**: Use `React.memo`, `useMemo`, `useCallback` for expensive computations or preventing child re-renders.
- **State Colocation**: Keep state as close to where it is used as possible.
- **Code Splitting**: Use `React.lazy` and `Suspense` for large bundles.

### 4. State Management
- **Context API**: Use for low-frequency global updates (theme, auth).
- **External Stores**: Use Zustand/Redux for high-frequency or complex global state.

## Output Format

```markdown
### React Implementation: {Feature}

**1. Component Breakdown**
- Hierarchy and responsibilities.

**2. State Strategy**
- Local vs Global, stores used.

**3. Hook Logic**
- Custom hooks, side effect management.

**4. Performance Considerations**
- Memoization points, bundle optimization.
```

## Related Skills

- **[client-state-management](../client-state-management/SKILL.md)**: Global state patterns.
- **[browser-apis](../browser-apis/SKILL.md)**: Web APIs integration.
- **[ui-ux-pro-max](../ui-ux-pro-max/SKILL.md)**: Design implementation.
