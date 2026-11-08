---
name: typescript
description: TypeScript development, type safety, interfaces, generics, and configuration. Triggers: "typescript", "ts", "typing", "interface", "generics", "enum", "union types", "tsconfig", "type guard".
version: 1.0.0
---

# TypeScript

Purpose: implement robust, type-safe code using TypeScript's advanced type system.

## When to Use

Trigger:
- Define data structures (Interfaces/Types).
- Create reusable components/logic with Generics.
- Ensure API contract safety.
- Configure TS build systems (`tsconfig.json`).
- Implement type guards and assertions.

## Instructions

Follow TypeScript best practices:

### 1. Type Definition
- **Interfaces vs Types**: Use `interface` for objects (extensible). Use `type` for unions, aliases, and complex logic.
- **Strict Mode**: Enable `strict: true` in `tsconfig.json`.
- **Avoid `any`**: Use `unknown` for unknown types, `never` for impossible states.

### 2. Advanced Patterns
- **Generics**: Use for flexible, reusable functions/classes.
- **Utility Types**: Leverage `Partial`, `Pick`, `Omit`, `Record`, `Readonly`.
- **Discriminated Unions**: Use common property (e.g. `type: 'success' | 'error'`) for safe branching.

### 3. Type Safety Logic
- **Type Guards**: Use `is` operator for custom validation functions.
- **`satisfies` Operator**: Validate expression against type without losing inferred specificity.
- **Readonly**: Use `readonly` for immutable arrays/objects to prevent mutations.

### 4. Configuration
- **Path Aliases**: Use `baseUrl` and `paths` for clean imports (e.g. `@/components/*`).
- **Target**: Use `ESNext` for modern runtime, or specific targets.

## Output Format

Summary:
```markdown
### TypeScript Implementation: {Module}

**1. Interfaces & Types**
- (Primary data structures)

**2. Generic Abstractions**
- (Reusable logic components)

**3. Type Safety Strategy**
- (Type guards, discriminated unions, assertions)

**4. TSConfig Requirements**
- (Target, module, strict settings)
```

## Related Skills

- **[clean-code](../clean-code/SKILL.md)**: Code quality.
- **[react](../react/SKILL.md)**: TS with React.
- **[vue](../vue/SKILL.md)**: TS with Vue.
