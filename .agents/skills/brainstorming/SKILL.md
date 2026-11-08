---
name: brainstorming
description: Socratic questioning and discovery protocol. Use when user says "build", "create", or "make" without details, requirements vague, or complex feature requested. Ensure clarity before code.
version: 1.0.0
allowed-tools: Read, Glob, Grep
---

# Brainstorming & Communication Protocol

> Understand before build. Ask before assume.

## When to Use

Trigger when:
- User says "Build [thing]", "Create [thing]", or "Make [thing]" without details.
- Complex feature/architecture requested.
- Update/change requested.
- Requirements vague or missing purpose, users, constraints.

## Instructions

**🛑 SOCRATIC GATE (MANDATORY)**

1. **STOP** — NO code/implementation yet.
2. **ASK** — Min 3 questions before proceed:
   - 🎯 **Purpose**: What problem solved?
   - 👥 **Users**: Who use this?
   - 📦 **Scope**: Must-have vs nice-to-have?
3. **WAIT** — Require user response before proceed.

**🧠 Dynamic Question Generation**

> **⛔ NEVER use static templates.** Generate context-aware questions.

Principles:
- **Context-aware**: Match domain.
- **Prioritized**: Most important first.
- **Open-ended**: Encourage detail.
- **Assumption-free**: Do not lead answer.

Process:
1. Identify domain (frontend, backend, mobile).
2. Detect ambiguities in request.
3. Generate 3-5 clarifying questions.
4. Order by implementation impact.
5. Present clearly using required format.

**Communication Principles**

- **Concise**: Exclude fluff.
- **Visual**: Emojis for scanability.
- **Specific**: Concrete terms ("~2 mins" not "wait a bit").
- **Alternatives**: Offer paths when stuck.
- **Proactive**: Suggest next step.

**Anti-Patterns (AVOID)**

- Jump to solutions.
- Assume requirements.
- Over-engineer v1 (build MVP first).
- Ignore constraints.
- "I think" phrases.

## Output Format

### Question Format

Format questions like this:

```markdown
Before I proceed, I have a few questions:

1. **[Topic]**: [Specific question]?
2. **[Topic]**: [Specific question]?
3. **[Topic]**: [Specific question]?

Feel free to answer all at once, and I'll start implementing.
```

### Progress Reporting

Use status board:

```markdown
## Status Update

| Task            | Status | Notes    |
| --------------- | ------ | -------- |
| Database schema | ✅     | Migrated |
| API endpoints   | 🔄     | 3/5 done |
| Frontend pages  | ⏳     | Next up  |
```
*Status Icons:* ✅ Complete, 🔄 In progress, ⏳ Pending, ❌ Failed/Blocked, ⚠️ Warning/Attention needed.

### Error Handling

Pattern:

```markdown
🔍 **Symptom**: [What happened]
🎯 **Root cause**: [Why it happened]
✅ **Fix**: [The solution]
🛡️ **Prevention**: [How to avoid in future]
```

### Completion Message

Pattern:

```markdown
## ✅ Complete: [Task Name]

### What was done
- [Deliverable 1]
- [Deliverable 2]

### How to verify
[Specific steps to test]

### Next steps (suggested)
1. [Optional follow-up]
2. [Optional follow-up]
```

## Examples

**Input:**
"Build a login page."

**Expected Action:**
No code. Ask clarifying questions using format.

```markdown
Before I proceed, I have a few questions:

1. **Authentication**: Are we using a specific auth provider (e.g., Firebase, Auth0, custom JWT)?
2. **UI Design**: Do you have a design system or preferred library (e.g., Tailwind, Material-UI), or should I create a custom design?
3. **Features**: Should I include "Forgot Password" and "Sign up" links on this page?

Feel free to answer all at once, and I'll start implementing.
```

## Resources

- [Agent Skills Official Specification](https://agentskills.io)

## Related Skills

- **[plan-writing](../plan-writing/SKILL.md)**: Convert ideas to implementation plans.
- **[prompt-building](../prompt-building/SKILL.md)**: Craft prompts from refined requirements.
