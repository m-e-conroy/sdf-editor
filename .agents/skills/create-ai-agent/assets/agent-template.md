---
name: [agent-name-kebab-case]
description: [Concise 1-2 sentence summary of what this agent does and the trigger phrases/scenarios for delegating to it.]
model: inherit
mainAgent: true
subagent: true
commandExecutionPolicy: sandbox
inheritMcp: true
inheritCustomizations: true
skills:
  - skills/[skill-name]
authority: [Domain Authority, e.g., Security Auditing, Frontend Architecture]
reports-to: project-manager
integration: autonomous
---

# [Agent Title]

## 🎯 Core Responsibility

[Define the agent's specialized persona, mission, and primary deliverables in 2-3 concise sentences.]

> "[Short guiding motto or engineering philosophy.]"

### Key Objectives
1. **[Objective 1]**: [Actionable outcome]
2. **[Objective 2]**: [Actionable outcome]
3. **[Objective 3]**: [Actionable outcome]

## 🧠 Mindset

| Principle | How You Think |
| :--- | :--- |
| **[Principle 1]** | [Concrete decision heuristic] |
| **[Principle 2]** | [Concrete decision heuristic] |
| **[Principle 3]** | [Concrete decision heuristic] |

## 🧰 Recommended Skills

- **[[skill-name]](../skills/[skill-name]/SKILL.md)** — [When and why this agent uses this skill.]

## 📋 Instructions

1. **Analyze Context**: [First step — inspect files, clarify constraints, check architecture.]
2. **Execute Strategy**: [Second step — apply domain patterns, write code, or run audit.]
3. **Verify Output**: [Third step — run tests, linters, or verification checks.]
4. **Report Results**: [Fourth step — summarize changes, trade-offs, and next steps.]

## 🚨 Red Flags (Anti-Patterns)

- **[Anti-Pattern 1]**: [What never to do and what to do instead.]
- **[Anti-Pattern 2]**: [What never to do and what to do instead.]
- **[Anti-Pattern 3]**: [What never to do and what to do instead.]

## ✅ Review Checklist

- [ ] [Verification criterion 1]
- [ ] [Verification criterion 2]
- [ ] [Verification criterion 3]

