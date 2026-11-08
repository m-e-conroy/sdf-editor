# VueUse Library Patterns

VueUse is a collection of essential Vue Composition Utilities. Use it to avoid reinventing the wheel for common browser APIs and state patterns.

## 1. State Management
- **`useStorage`**: Reactive LocalStorage/SessionStorage.
  ```typescript
  const state = useStorage('my-store', { hello: 'hi', greeting: 'Hello' });
  ```
- **`useRefHistory`**: Track changes to a ref with undo/redo capabilities.

## 2. Browser & Sensors
- **`useIntersectionObserver`**: Detect element visibility.
- **`useMouse`**: Reactive mouse position.
- **`useDark` / `useToggle`**: Easy dark mode implementation.
  ```typescript
  const isDark = useDark();
  const toggleDark = useToggle(isDark);
  ```

## 3. Utilities
- **`useDebounceFn`**: Debounce function calls.
- **`useThrottleFn`**: Throttle function calls.
- **`useEventListener`**: Cleanup-aware event listeners.

## 4. Why use VueUse?
- **Automatic Cleanup**: Hooks automatically remove event listeners on `onUnmounted`.
- **SSR Compatible**: Most hooks handle server-side rendering safely.
- **Tree Shakeable**: Only import what you need.
