<script setup lang="ts">
import { ref, computed } from 'vue';

/**
 * Vue 3 Base Component Template
 * Features: Props, Emits, Reactive State, Computed.
 */

// 1. Props Definition
const props = defineProps<{
  title: string;
  count?: number;
}>();

// 2. Emits Definition
const emit = defineEmits<{
  (e: 'update', value: number): void;
}>();

// 3. Reactive State
const internalCount = ref(props.count || 0);

// 4. Computed Logic
const doubleCount = computed(() => internalCount.value * 2);

// 5. Actions
const increment = () => {
  internalCount.value++;
  emit('update', internalCount.value);
};
</script>

<template>
  <div class="component-container">
    <h2>{{ title }}</h2>
    <p>Count: {{ internalCount }} (Double: {{ doubleCount }})</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<style scoped>
.component-container {
  padding: 1rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
}
</style>
