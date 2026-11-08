---
name: client-state-management
description: Managing frontend state. Server state (React Query), global UI state (Zustand), URL state, and optimistic updates. Triggers: "state management", "react query", "zustand", "redux", "optimistic updates", "url state", "swr".
version: 1.0.0
---

# Client State Management Skill

> **Purpose**: Architect predictable, high-performance frontend state systems.

## When to Use

- Managing API data and caching (Server State).
- Handling cross-component UI state (Global State).
- Synchronizing UI with the browser URL (URL State).
- Implementing optimistic UI updates (Instant feedback).
- Managing complex local component logic.

## Instructions

Apply state patterns based on data type:

### 1. Server State (Data from APIs)
Don't use `useEffect` + `useState` for API calls. Use specialized libraries (React Query, SWR).
- **Caching**: Automated cache invalidation and background revalidation (`stale-while-revalidate`).
- **Loading/Error**: Use built-in status flags instead of manual booleans.
- **Prefetching**: Load data before the user needs it (e.g., on hover).

### 2. Global UI State
Use lightweight stores (Zustand, Jotai) over complex ones (Redux) unless required.
- **Actions**: Define functions to update state within the store.
- **Selectors**: Only subscribe to the specific slice of state needed to prevent re-renders.

### 3. URL State (Single Source of Truth)
Use the URL for state that should be shareable or survive refreshes (Filters, Search, Active Tab).
- **Implementation**: `useSearchParams` or `nuqs`.

### 4. Optimistic Updates
Give users instant feedback while the server processes.
- **Logic**: Update UI immediately -> Perform API call -> If error, roll back to previous state.

### 5. State Hierarchy
Keep state as local as possible.
1. **Local**: `useState` / `useReducer`.
2. **URL**: Search params.
3. **Server**: `useQuery`.
4. **Global**: Zustand / Context (last resort).

## Output Format

Propose State Architecture:

```markdown
### State Management Strategy: {Component/App}

**1. Server State**
- (React Query, caching strategy, keys)

**2. Global UI State**
- (Zustand stores, persistent slices)

**3. URL State**
- (Shared params, routing sync)

**4. Performance**
- (Memoization, selector strategy)
```

## Related Skills

- **[frontend-developer](../agents/frontend-developer.md)**: Implementation in React/Vue.
- **[api-patterns](../api-patterns/SKILL.md)**: Structuring responses for easy caching.
- **[core-web-vitals](../core-web-vitals/SKILL.md)**: Impact of state updates on CLS and INP.
