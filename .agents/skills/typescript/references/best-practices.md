# TypeScript Best Practices

## 1. Favor Interfaces over Types for Objects
Interfaces are better for performance (type-checking speed) and are extendable via declaration merging.
```typescript
interface User {
  id: string;
}
interface User {
  name: string; // Merged!
}
```

## 2. Use `unknown` over `any`
`unknown` is safer as it forces you to perform a type check before using the value.
```typescript
function process(val: unknown) {
  if (typeof val === 'string') {
    val.toUpperCase(); // Safe
  }
}
```

## 3. Avoid Enums
Prefer Literal Unions or Const Objects. Literal unions produce less code and are more predictable.
- **Avoid**: `enum Status { Active, Inactive }`
- **Prefer**: `type Status = 'active' | 'inactive'`

## 4. Function Overloads
Use for functions that return different types based on input arguments.
```typescript
function get(id: string): User;
function get(ids: string[]): User[];
function get(arg: string | string[]): User | User[] { ... }
```
