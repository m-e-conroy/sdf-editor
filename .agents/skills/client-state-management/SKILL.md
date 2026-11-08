---
name: client-state-management
description: Manage frontend state. Server state (React Query), global UI (Zustand), URL state, optimistic updates. Triggers: "state management", "react query", "zustand", "redux", "optimistic updates", "url state", "swr".
version: 1.0.0
---

# Client State Management

Purpose: predictable, high-performance frontend state.

## When to Use

Trigger:
- Manage API data/caching (Server State).
- Cross-component UI state (Global State).
- Sync UI with browser URL (URL State).
- Optimistic UI updates.
- Complex local component logic.

## Instructions

Apply state patterns by data type:

### 1. Server State (API Data)
Avoid `useEffect` + `useState`. Use TanStack Query (React Query) or SWR.
- **Caching**: Auto-invalidation + background revalidation (`stale-while-revalidate`).
- **Status**: Use built-in loading/error flags.
- **Prefetching**: Load data before needed (e.g., hover).

### 2. Global UI State
Use lightweight stores (Zustand, Jotai).
- **Actions**: Functions inside store to update state.
- **Selectors**: Select specific slices to prevent unnecessary re-renders.

### 3. URL State (Source of Truth)
Use URL for shareable UI states (Filters, Search, Active Tab).
- **Tool**: `useSearchParams` or `nuqs`.

### 4. Optimistic Updates
Instant UI response while backend processes.
- **Flow**: Update UI immediately → Call API → Rollback on failure.

### 5. State Hierarchy
Keep state as local as possible.
1. **Local**: `useState` / `useReducer`.
2. **URL**: Search params.
3. **Server**: `useQuery`.
4. **Global**: Zustand (Context as last resort).

## Output Format

Summary:
```markdown
### State Management Strategy: {Component/App}

**1. Server State**
- (React Query, caching, query keys)

**2. Global UI State**
- (Zustand stores, persistent slices)

**3. URL State**
- (Shared params, routing sync)

**4. Performance**
- (Memoization, selector strategy)
```

## Related Skills

- **[frontend-developer](../agents/frontend-developer.md)**: UI framework integration.
- **[api-patterns](../api-patterns/SKILL.md)**: Cache-friendly APIs.
- **[core-web-vitals](../core-web-vitals/SKILL.md)**: Metric impacts.
