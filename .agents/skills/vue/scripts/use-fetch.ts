import { ref, toValue, watchEffect } from 'vue';

/**
 * Reactive Data Fetching Composable
 */
export function useFetch(url: string | (() => string)) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(true);

  const fetchData = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(toValue(url));
      data.value = await response.json();
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  };

  watchEffect(() => {
    fetchData();
  });

  return { data, error, loading, retry: fetchData };
}
