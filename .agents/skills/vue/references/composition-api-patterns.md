# Vue 3 Composition API Patterns

## 1. Logic Extraction (Composables)
Move complex logic out of components into reusable functions.
```typescript
// useMouse.ts
export function useMouse() {
  const x = ref(0);
  const y = ref(0);
  
  function update(event) {
    x.value = event.pageX;
    y.value = event.pageY;
  }
  
  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));
  
  return { x, y };
}
```

## 2. Shared State (External Stores)
Use Pinia for state that needs to be accessed by many components.
```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const name = ref('Guest');
  const isAdmin = computed(() => name.value === 'Admin');
  function setName(val) { name.value = val; }
  
  return { name, isAdmin, setName };
});
```

## 3. Template Refs
Access DOM elements or component instances.
```vue
<script setup>
const myInput = ref(null);
onMounted(() => myInput.value.focus());
</script>
<template>
  <input ref="myInput" />
</template>
```
