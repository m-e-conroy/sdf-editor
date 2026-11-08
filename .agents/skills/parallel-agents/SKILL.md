---
name: parallel-agents
description: Multi-agent orchestration patterns. Use when multiple independent tasks can run with different domain expertise or when comprehensive analysis requires multiple perspectives.
triggers: [orchestrate, parallel agents, multi-agent, comprehensive review, native agents, coordinate agents, synthesis]
---

# Parallel Agents

> Orchestration via Antigravity Agent Tool.

---

## When to Use

Coordinate specialized agents for complex tasks. Ideal for cross-domain work (arch + security + test) or full-stack features. Skip for simple, single-domain fixes.

## Instructions

1. **Select Agents**:
   - Determine domains.
   - Choose specialized agents (`security-auditor`, `backend-specialist`, `frontend-specialist`, `test-engineer`, etc.).
   - `explorer-agent` (Haiku) for fast code search.
   - Custom agents for deep domain expertise.
2. **Invocation Chain**:
   - **Single**: "Use `[agent]` to `[task]`."
   - **Sequential**: "First `[agent]` for `[task]`. Then `[agent]` for `[task]`."
   - **Context Passing**: "Use `[agent]` to `[task]`. Based on findings, have `[agent]` `[task]`."
   - **Resume**: "Resume `[agentId]` with `[reqs]`."
3. **Orchestration Patterns**:
   - **Analysis**: `explorer` → `[domain]` → `synthesis`.
   - **Feature**: `[domain]` → `test-engineer` → `synthesis`.
   - **Security**: `security-auditor` → `penetration-tester` → `synthesis`.
4. **Logical Flow**: Discovery → Analysis → Implementation → Testing. Pass findings between agents. Always use `test-engineer` for verification.
5. **Synthesis**: Avoid disjointed reports. Wait for all agents. Generate unified Synthesis Report.

## Output Format

Synthesis Protocol after all agents finish:

```markdown
## Orchestration Synthesis

### Task Summary
[Summary of accomplishments + scope]

### Agent Contributions
| Agent | Finding / Contribution |
|-------|------------------------|
| `agent-name` | [Key insight/action] |

### Consolidated Recommendations
1. **Critical**: [Item]
2. **Important**: [Item]
3. **Nice-to-have**: [Item]

### Action Items
- [ ] [Task]
```

## Examples

**Input:** "Review authentication feature. Check security, backend, and tests."

**Expected Action**:
1. Plan: `security-auditor` → `backend-specialist` → `test-engineer`.
2. Sequential invocation: "Use `security-auditor` for flow. Pass findings to `backend-specialist` for API. Use `test-engineer` for coverage."
3. Final Orchestration Synthesis report.

## Resources

- [Agent Skills Official Spec](https://agentskills.io)
- [Antigravity Agent Skills](https://antigravity.codes/agent-skills)

## Related Skills

- **[create-ai-agent](../create-ai-agent/SKILL.md)**: Defining personas.
- **[plan-writing](../plan-writing/SKILL.md)**: Structuring tasks.
- **[brainstorming](../brainstorming/SKILL.md)**: Determining required agents.
