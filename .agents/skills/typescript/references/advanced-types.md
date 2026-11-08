# Advanced TypeScript Patterns

## 1. Discriminated Unions
Safely handle different object shapes based on a literal tag.
```typescript
type Result<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function handle(res: Result<number>) {
  if (res.status === 'success') {
    console.log(res.data); // data is number
  } else {
    console.log(res.message); // message is string
  }
}
```

## 2. Exhaustive Checks
Ensure all cases of a union are handled using `never`.
```typescript
function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function process(res: Result<any>) {
  switch (res.status) {
    case 'success': return;
    case 'error': return;
    default: return assertNever(res); // Error if new status added
  }
}
```

## 3. Template Literal Types
Construct types from string interpolation.
```typescript
type Direction = 'top' | 'bottom' | 'left' | 'right';
type Margin = `margin-${Direction}`; // 'margin-top' | 'margin-bottom' | ...
```

## 4. `satisfies` Operator
Validate shape without narrowing the inferred type.
```typescript
const theme = {
  primary: '#ff0000',
  secondary: [0, 255, 0]
} satisfies Record<string, string | number[]>;

// theme.secondary still knows it's an array, not just string | number[]
theme.secondary.map(x => x); 
```
