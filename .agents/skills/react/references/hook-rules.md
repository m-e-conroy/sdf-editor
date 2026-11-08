# React Hook Rules & Patterns

## 1. The Core Rules
- **Top Level Only**: Don't call hooks inside loops, conditions, or nested functions. This ensures hooks are called in the same order each render.
- **React Functions Only**: Only call hooks from React function components or custom hooks.

## 2. Effect Dependency Best Practices
- **Exhaustive Deps**: Always include every prop, state, or derived variable used inside the effect. 
- **Functional Updates**: If you update state based on its previous value, use the functional form `setState(prev => prev + 1)` to avoid adding the state itself as a dependency.
- **Stabilize Objects**: Use `useMemo` or `useCallback` for objects/functions passed as dependencies to prevent infinite loops.

## 3. Custom Hook Pattern
```typescript
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
```
