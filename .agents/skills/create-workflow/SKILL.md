---
name: create-workflow
description: Create, scaffold, generate new Antigravity workflow. Workflows: step-by-step procedures via @ mentions.
triggers: [create a workflow, scaffold a workflow, build a workflow, generate a workflow, new workflow]
---

# Create Workflow

## When to Use

Trigger when:
- Create, scaffold, design, or generate new Antigravity "workflow".
- Structured markdown defining multi-step repeatable tasks.

## Instructions

1. **Goal**: Purpose, audience, outcome. Problem solved? Edge cases?
2. **Name**: Unique, URL-safe ID (max 64 chars, lowercase, numbers, hyphens).
   - Good: `code-review`, `generate-docs`.
   - Bad: `CodeReview`, `generate docs`.
3. **Path**: Scaffold in `.agents/workflows/{name}.md`.
4. **Draft Markdown**:
   - **Frontmatter**: Include `name`, `description`, `agent` (primary agent ID for execution).
   - **Title**: `# Title`.
   - **When to Use**: Describe trigger conditions.
   - **Instructions**: Ordered list of imperative, verb-first steps. Focus on tools, reasoning, conditional logic. Specify agent handoffs (e.g. "Use `qa-engineer` to verify").
   - **Output Format**: Final response structure (blocks, tables).
   - **Examples**: "Input" + "Expected Action" pairs.
5. **Determinism**: Specific instructions. Use "MUST," "Validate [condition]," "Use [tool] to find [X]."
6. **Validate**: Clear, concise (<200 lines), logically sound.
7. **Save & Present**: Write to disk.

## Output Format

Summary format:
```markdown
### Workflow Created: `{name}`
**Path:** `.agents/workflows/{name}.md`
**Sections Included:**
- [x] When to Use
- [x] Instructions ({number of steps} steps)
- [x] Output Format
- [x] Examples

**Description:** "{1-sentence summary}"
```
Ask if user wants to test, adjust steps, or add examples.

## Examples

**Input**: "Security code review workflow."
**Expected Action**:
1. Name: `security-code-review`.
2. Draft markdown with tool usage (`grep_search`).
3. Save to `.agents/workflows/security-code-review.md`.
4. Present summary.

## Resources

- [Agent Skills Official Specification](https://agentskills.io)
- [Create Skill Workflow](../create-skill/SKILL.md)

## Related Skills

- **[create-skill](../create-skill/SKILL.md)** — Core automation skills.
- **[create-ai-agent](../create-ai-agent/SKILL.md)** — Agent design.
- **[plan-writing](../plan-writing/SKILL.md)** — Structured planning.
