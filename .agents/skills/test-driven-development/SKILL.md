---
name: test-driven-development
description: Test-Driven Development (TDD) principles, Red-Green-Refactor cycle, and strategies for writing testable code.
triggers: [TDD, test driven development, write tests first, red green refactor, testable code]
---

# Test-Driven Development (TDD)

Purpose: write test before code, drive design through testing.

## When to Use

Trigger:
- Implement TDD.
- Write tests first.
- Apply "Red-Green-Refactor".
- Design testable, decoupled code.

## Instructions

TDD Guidelines:

1. **🔴 Red: Write Failing Test**
   - Write test first. No prod code until test fails.
   - Test must fail for right reason (missing implementation).
   - Focus on single behavior.

2. **🟢 Green: Make Pass**
   - Write absolute minimum code to pass.
   - Avoid future features/over-engineering. "Fake it 'til you make it" OK.
   - Goal: get test green.

3. **🔵 Refactor: Clean Design**
   - Clean code while keeping tests green.
   - Remove duplication, improve names, apply patterns.
   - Refactor messy tests.

4. **Testing Principles**
   - **Test Behavior, Not Implementation**: Verify *what*, not *how*. Do not test private methods.
   - **Keep Tests Fast**: Isolate from filesystem, network, DB.
   - **AAA Pattern**: Arrange, Act, Assert.
   - **One Assert per Concept**: Single logical reason to fail.

5. **Dependencies**
   - Inject dependencies via interfaces/abstractions.
   - Mock/stub external services. Avoid over-mocking internals.

## Output Format

Structure:

```markdown
### 🔴 Red: Failing Test
Test for [Behavior]. Fails because [Reason].
[Code Block with Test]

### 🟢 Green: Implementation
Minimum code to pass.
[Code Block with Implementation]

### 🔵 Refactor (if applicable)
Clean implementation.
[Code Block with Refactored Code]
```

## Examples

**Input:** "Build string calculator using TDD. Start with empty string returning 0."
**Expected Action:**
1. Respond with **Red Phase**: failing test for empty string.
2. Provide **Green Phase**: simplest implementation (`return 0;`).
3. Explain transition to next requirement.

## Resources

- [Test-Driven Development by Example (Kent Beck)](https://en.wikipedia.org/wiki/Test-driven_development)
- [Testing Patterns Skill](../testing-patterns/SKILL.md)

## Related Skills

- **[testing-patterns](../testing-patterns/SKILL.md)**: Strategies during TDD cycle.
- **[clean-code](../clean-code/SKILL.md)**: Refactor to high standard.
