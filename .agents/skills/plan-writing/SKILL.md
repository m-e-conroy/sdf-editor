---
name: plan-writing
description: Structured task planning with clear breakdowns, dependencies, and verification criteria. Use when implementing features, refactoring, or any multi-step work.
triggers: [write a plan, plan out, break down tasks, task breakdown, structured plan, multi-step work, planning]
---

# Plan Writing

> Frame for breaking work into actionable tasks + verification criteria.

---

## When to Use

Use for new projects, big features, complex bugs, refactors, multi-step work. Triggers: "write plan", "plan out", "break down tasks".

## Instructions

1. **Short**: Task 2-5 min. 5-10 tasks max. One-line specific descriptions.
2. **Specific**: No "setup project". Use "Run `npx create-next-app`". Name exact files.
3. **Organize**: Use **project-organization** skill. Define structure (`src/`, `tests/`). Colocate feature code. Root cause for bug fixes.
4. **Verify**: Every task needs "How to check" step (e.g. "Run `npm run dev`"). Verification always LAST step.
5. **Scripts**: Choose frontend/backend tools. No generic copy-paste.
6. **Plan File**: Save `{task-slug}.md` in **PROJECT ROOT**. NOT in `docs/` or `.claude/`. Update `- [x]` as you go.

## Output Format

Keep minimal:

```markdown
# [Task Name]

## Goal
One sentence: What are we building/fixing?

## Tasks
- [ ] Task 1: [Specific action, e.g., Create `src/features/auth/AuthButton.tsx`] → Verify: [How to check]
- [ ] Task 2: [Specific action] → Verify: [How to check]
- [ ] Task 3: [Specific action] → Verify: [How to check]

## Done When
- [ ] [Main success criteria]

## Notes
[Important architectural or project organization considerations]
```

## Examples

**Input**: "Plan addition of user login."

**Action**:
1. Create `user-login.md` in root.
2. Goal: "Implement JWT login."
3. Tasks: Use feature colocation (e.g. `src/features/auth/components/LoginForm.tsx`).
4. Verification: "Button renders in browser".
5. Present plan.

## Resources

- **[project-organization](../project-organization/SKILL.md)** — Layout, colocation, naming.

## Related Skills

- **[brainstorming](../brainstorming/SKILL.md)** — Requirements check.
- **[parallel-agents](../parallel-agents/SKILL.md)** — Delegating tasks.
