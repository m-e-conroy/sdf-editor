---
name: testing-patterns
description: Testing patterns, principles, unit testing, integration testing, mocking strategies. Use to write, design, refactor tests, or implement mocking.
---

# Testing Patterns

Purpose: reliable, fast, maintainable test suites.

## When to Use

Trigger:
- Write, review, refactor tests (unit, integration, E2E).
- Design test strategy or architecture.
- Implement mocks, stubs, spies, fakes.
- Debug flaky tests, speed up suites.

## Instructions

Principles:
1. **Testing Pyramid**: Many unit, some integration, few E2E.
2. **AAA Pattern**: Arrange (setup data/mocks), Act (run), Assert (verify).
3. **Unit Tests**:
   - Fast (<100ms), isolated, repeatable.
   - Test logic, edge cases, errors. Skip framework, third-party, simple getters.
4. **Integration Tests**: Focus on flows, DB queries, contracts. Use hooks for resource management/reset.
5. **Mocking**:
   - Mock external APIs, DB, network, time, random.
   - Do not mock code under test, pure functions, simple dependencies.
   - Types: Stub (fixed), Spy (track), Mock (expect), Fake (simplified logic).
6. **Organization**:
   - Use behavior-driven names (e.g., `should return error when user not found`).
   - Group via `describe`, isolate via `it`/`test`.
7. **Data Management**: Use factories, fixtures, builders. Randomize non-essential values to prevent brittleness.
8. **Best Practices**:
   - One logical assert per test.
   - No order dependency.
   - Clean up side-effects.
9. **Anti-Patterns**: Never test implementation details — test observable behavior. Avoid complex setup duplication. Find root cause of flakiness.

## Output Format

Structure:
1. **Testing Strategy**: Explain test types + scenarios.
2. **Mocking & Setup**: External dependencies + mock strategy.
3. **Implementation Code**: Test code with AAA separation.
4. **Data Management**: Data generation method (factory/mock payload).

## Examples

**Input:** "Test for `calculateDiscount` function."
**Expected Action:**
1. Recognise as pure function → Unit Test.
2. AAA pattern, no mocks.
3. Cover standard, boundary (0%, 100%), error cases.

**Input:** "Test for `getUserProfile` API endpoint."
**Expected Action:**
1. Integration Test (DB/API).
2. Spy/Mock DB layer or test DB connection.
3. Arrange uses factory for fake user.
4. HTTP request + status/schema assertions.

## Resources

- [Martin Fowler: Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [GivenWhenThen Pattern](https://martinfowler.com/bliki/GivenWhenThen.html)

## Related Skills

- **[test-driven-development](../test-driven-development/SKILL.md)**: Core methodology.
- **[api-patterns](../api-patterns/SKILL.md)**: RESTful testing.
- **[nodejs-best-practices](../nodejs-best-practices/SKILL.md)**: Runners and environments.
