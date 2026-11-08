---
name: vue
description: Vue.js development patterns, Composition API, SFCs, reactivity, and state management. Triggers: "vue", "vuejs", "composition api", "ref", "reactive", "sfc", "pinia", "vue-router", "computed".
version: 1.0.0
---

# Vue.js Skill

Build scalable, high-performance UI using Vue 3 and the Composition API.

## When to Use

Trigger when:
- Creating interactive web interfaces.
- Managing reactive data and state.
- Building reusable components (SFCs).
- Routing and navigation (Vue Router).
- Global state management (Pinia).

## Instructions

### 1. Composition API
- **`setup` script**: Use `<script setup>` for better DX and performance.
- **`ref` vs `reactive`**: Use `ref()` for primitives and simple objects. Use `reactive()` for deeply nested objects.
- **Composables**: Extract shared logic into `useX` functions.

### 2. Component Architecture
- **Single File Components (SFCs)**: Keep template, logic, and styles together.
- **Props & Emits**: Use `defineProps` and `defineEmits` for strict typing.
- **Provide/Inject**: Use for dependency injection across deeply nested components.

### 3. Reactivity & Performance
- **Computed**: Use `computed()` for derived state to ensure optimal caching.
- **Watchers**: Use `watch()` or `watchEffect()` for side effects.
- **Teleport**: Use `<Teleport>` for modals/popovers to avoid CSS stacking context issues.

### 4. Ecosystem Integration
- **Pinia**: Use as official state management store.
- **Vue Router**: Handle client-side navigation.
- **VueUse**: Use for standardized composables (storage, observers, sensors).

## Output Format

```markdown
### Vue Implementation: {Feature}

**1. SFC Structure**
- Template logic, script setup breakdown.

**2. Reactive State**
- Refs, reactives, and computed values.

**3. Composables**
- Logic encapsulation strategy.

**4. Ecosystem Usage**
- Pinia stores, routing, or teleport needs.
```

## Related Skills

- **[client-state-management](../client-state-management/SKILL.md)**: Store patterns.
- **[css-expert](../css-expert/SKILL.md)**: Scoped styling.
- **[ui-ux-pro-max](../ui-ux-pro-max/SKILL.md)**: Component implementation.
