# R3F Best Practices & Common Pitfalls

## 1. The "State vs Ref" Rule
**PITFALL**: Updating React state (`useState`) inside `useFrame`.
**RESULT**: Component re-renders every frame (60-120fps), causing massive lag.
**FIX**: Use `useRef` to store the Three.js object and mutate its properties directly in `useFrame`.

## 2. Resource Management
**PITFALL**: Creating new Geometries or Materials inside a component's render function.
**RESULT**: Memory leaks and GPU churn.
**FIX**: Lift geometries and materials out of the component or use `useMemo`.

## 3. The `<Canvas>` Location
**PITFALL**: Putting UI elements (HTML buttons, nav) INSIDE the `<Canvas>`.
**RESULT**: They won't render or will cause WebGL errors.
**FIX**: Use the `Html` component from `@react-three/drei` if they need to follow a 3D point, or keep UI outside the Canvas entirely.

## 4. Asset Loading
**PITFALL**: Loading assets without `<Suspense>`.
**RESULT**: App crashes when it encounters an async load.
**FIX**: Always wrap components using `useLoader` or `useGLTF` in a `<Suspense>` boundary.

## 5. Event Bubbling
**PITFALL**: Assuming events bubble like DOM.
**RESULT**: Clicks hitting hidden objects.
**FIX**: Use `e.stopPropagation()` on R3F events if you want to prevent them from hitting objects behind the current one.
