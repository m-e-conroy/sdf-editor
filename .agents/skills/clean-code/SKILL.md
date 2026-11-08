---
name: clean-code
description: Apply Robert C. Martin's Clean Code principles. Review code quality, refactor, check naming, functions, error handling, comments.
version: 1.0.0
---

# Clean Code

Purpose: maintainable, readable, professional code.

## When to Use

Trigger:
- Review code quality/readability.
- Request refactoring.
- Questions on naming, function size, scope.
- Guide error handling, comments.

## Instructions

Apply Clean Code principles:

### Naming Conventions

**Variables**: Intention-revealing. No single-letter counters.
- `❌ const d = new Date();` → `✅ const currentDate = new Date();`
- `❌ const u = users.filter((x) => x.active);` → `✅ const activeUsers = users.filter((user) => user.isActive);`

**Functions**: Verb phrases.
- `❌ function process(data) { ... }` → `✅ function validateUserInput(formData) { ... }`
- `❌ function handle(x) { ... }` → `✅ function calculateTotalPrice(orderItems) { ... }`

**Classes**: Noun phrases. Avoid generic names (`Data`, `Manager`, `Processor`).
- `❌ class Data { ... }` → `✅ class UserRepository { ... }`
- `❌ class Manager { ... }` → `✅ class OrderService { ... }`

### Functions

**Single Responsibility**: One function, one task.
- ❌ **Bad**:
  ```typescript
  function processOrder(order) {
    validateOrder(order);
    calculateTotal(order);
    saveToDatabase(order);
    sendEmail(order);
  }
  ```
- ✅ **Good**:
  ```typescript
  function validateOrder(order) { ... }
  function calculateOrderTotal(order) { ... }
  function persistOrder(order) { ... }
  function notifyCustomer(order) { ... }
  ```

**Keep Small**: Limit to ≤20 lines. Extract helpers.

**Arguments**: Aim 0-2 parameters. Pack >3 into objects/DTOs.
- `❌ function createUser(name, email, age, address, phone, role) { ... }`
- `✅ function createUser(userData: CreateUserDto) { ... }`

### Error Handling

Handle explicitly. Never swallow exceptions.
- ❌ **Bad**:
  ```typescript
  try {
    doSomething();
  } catch (e) {
    console.log(e);
  }
  ```
- ✅ **Good**:
  ```typescript
  try {
    await processPayment(order);
  } catch (error) {
    logger.error("Payment processing failed", { orderId: order.id, error });
    throw new PaymentFailedError(order.id, error.message);
  }
  ```

### Comments

Explain WHY, not WHAT. Code must be self-documenting.
- ❌ **Bad**:
  ```typescript
  // Increment counter by 1
  counter++;
  ```
- ✅ **Good**:
  ```typescript
  // Offset for 0-based index when displaying to users
  const displayIndex = arrayIndex + 1;
  ```

**Pre & Post Conditions**: Docstrings for implicit assumptions.
- ❌ **Bad**:
  ```typescript
  function calculateDiscount(price: number, discountPercent: number): number {
    return price * (1 - discountPercent / 100);
  }
  ```
- ✅ **Good**:
  ```typescript
  /**
   * Calculates final price after discount.
   *
   * @pre price must be >= 0
   * @pre discountPercent must be between 0 and 100 inclusive
   * @post returns value between 0 and price
   */
  function calculateDiscount(price: number, discountPercent: number): number {
    return price * (1 - discountPercent / 100);
  }
  ```

## Output Format

Show before/after. Explain Clean Code principle violated. Use markdown diffs/blocks.

## Examples

**Input**:
"Review this function:
function chk(u) {
if(u.a > 18) {
db.save(u);
send(u.email, 'welcome');
}
}"

**Action**: Analyze and refactor.

**Response**:
Violates Clean Code:
1. **Naming**: `chk`, `u`, `a` not intention-revealing.
2. **Responsibility**: checks age, saves DB, sends email.

Refactored:
```typescript
// Separated responsibilities and improved naming
function processNewUser(user: User) {
  if (isAdult(user.age)) {
    saveUser(user);
    sendWelcomeEmail(user.email);
  }
}

function isAdult(age: number): boolean {
  return age > 18;
}
```

## Resources

### Quick Reference

| Principle | Guideline |
| :--- | :--- |
| Names | Intention-revealing |
| Functions | Small, single purpose |
| Parameters | ≤3 ideally |
| Comments | Explain why, not what |
| Formatting | Consistent, readable |
| Error Handling | Explicit, informative |
| DRY | Don't repeat yourself |
| KISS | Keep it simple |

- [Agent Skills Official Specification](https://agentskills.io)

## Related Skills

- **[nodejs-best-practices](../nodejs-best-practices/SKILL.md)**: Clean Node.js patterns.
- **[project-organization](../project-organization/SKILL.md)**: Organise clean components.
- **[test-driven-development](../test-driven-development/SKILL.md)**: TDD cycle refactoring.
