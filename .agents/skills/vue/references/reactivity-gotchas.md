# Vue Reactivity Gotchas

## 1. Losing Reactivity on Destructuring
If you destructure a reactive object, the resulting variables are NO LONGER reactive.
- **Wrong**: `const { count } = state;` (count is just a static value now).
- **Right**: `const { count } = toRefs(state);` or access as `state.count`.

## 2. Ref Unwrapping
- `ref` is automatically unwrapped in templates: `<div>{{ count }}</div>`.
- `ref` MUST be accessed via `.value` in logic: `count.value++`.
- `reactive` properties do NOT use `.value`.

## 3. Deep vs Shallow Reactivity
- `reactive()` is deep by default.
- Use `shallowRef()` or `shallowReactive()` for performance optimization with large datasets that don't need deep observation.

## 4. Collection Reactivity
- Vue 3 uses Proxies, so `array[index] = value` and `array.length = 0` ARE reactive (unlike Vue 2).
