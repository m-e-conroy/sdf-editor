import { ref, watch, onMounted } from 'vue';

/**
 * Vue 3 Composable for LocalStorage persistence.
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const value = ref<T>(defaultValue);

  onMounted(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        value.value = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse storage:', e);
      }
    }
  });

  watch(value, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal));
  }, { deep: true });

  return value;
}
