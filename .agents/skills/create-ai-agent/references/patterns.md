# AI Agent & Antigravity Subagent Architecture Patterns

Reference guide for configuring Google Antigravity custom agents/subagents (`.agents/agents/*.md`), orchestrating background subagent lifecycles, and structuring reasoning loops.

---

## 1. Official Antigravity Agent Markdown Specification

In Google Antigravity, custom agents and subagents are defined as Markdown files (`.md`) with a YAML frontmatter block.
- **Discovery Paths**:
  1. **Workspace**: `.agents/agents/<name>.md` or `.agents/agents/<name>/agent.md`
  2. **Global**: `~/.gemini/config/agents/<name>.md` or `~/.gemini/config/agents/<name>/agent.md`
  3. **Plugin**: `agents/<name>.md` or `agents/<name>/agent.md` inside a plugin root

### Complete YAML Frontmatter Reference (`https://antigravity.google/docs/subagents/`)

```yaml
---
name: dependency-modernizer
description: Upgrades local project packages, updates manifests, and verifies test suites pass. Use when auditing or modernizing dependencies.
mainAgent: true
subagent: true
model: inherit
commandExecutionPolicy: sandbox
inheritMcp: true
inheritCustomizations: true
skills:
  - skills/testing-patterns
  - skills/nodejs-best-practices
tools:
  - read_file
  - edit_file
  - write_file
  - run_command
  - manage_task
---
```

### Frontmatter Field Rules & Gotchas

1. **`model` (`"inherit"` | `"flash_lite"` | `"flash"` | `"pro"`)**:
   - **Default**: `"inherit"` (recommended so the subagent uses the parent conversation's active model).
   - **`"flash_lite"`**: Fastest/lightest tier for high-volume or trivial extraction tasks.
   - **`"flash"`**: Low-latency tier for straightforward coding, formatting, or routine checks.
   - **`"pro"`**: Deep reasoning tier for system architecture, complex debugging, or multi-file refactoring.
   - **Critical Gotcha**: Using arbitrary model strings (e.g., `gemini-flash-latest`, `gemini-3.1-pro`, `gemini-pro-vision`) causes the Antigravity subagent loader to reject the file, preventing it from appearing in `Available subagents`.
2. **`mainAgent` (`boolean`, default `true`) & `subagent` (`boolean`, default `true`)**:
   - Set `mainAgent: true` if users should be able to launch a primary chat session with this persona (`agy --agent <name>` or UI selector).
   - Set `subagent: true` if parent agents should be able to delegate background tasks to this persona via `invoke_subagent`.
3. **`tools` (`string[]`, optional)**:
   - Defaults to all parent-permitted tools when omitted (`send_message` is always included so the subagent can communicate with its parent).
   - Specify an explicit read-only list (e.g., `[read_file, search_web, list_resources, read_resource]`) to enforce strict non-mutating behavior for research or audit subagents.
4. **`commandExecutionPolicy` (`"sandbox"` | `"off"` | `"auto"` | `"eager"`, default `"sandbox"`)**:
   - Keep `"sandbox"` as the default so terminal commands run safely inside the workspace sandbox without unnecessary approval prompts.
5. **`skills` (`string[]`, optional)**:
   - Pre-loads specific skill paths into the agent's context at startup, complementing the progressive disclosure links in `## 🧰 Recommended Skills`.
6. **`inheritMcp` (`boolean`, default `true`) & `inheritCustomizations` (`boolean`, default `true`)**:
   - Controls whether the agent automatically receives workspace MCP servers, rules, skills, and hooks.

---

## 2. Subagent Lifecycle, Workspace Modes & Messaging

### Static vs. Dynamic Subagents
- **Static Markdown Subagents (`.agents/agents/<name>.md`)**: Persistent, version-controlled, and automatically discovered across sessions.
- **Dynamic Runtime Subagents (`define_subagent`)**: Created on the fly for the current conversation only:
  - `Name`: Unique identifier.
  - `Description`: When to use the subagent.
  - `SystemPrompt`: Full instructions for the subagent.
  - `EnableWriteTools` (`boolean`): Grants `write_file`, `edit_file`, and `run_command`.
  - `EnableMCPTools` (`boolean`): Grants access to MCP tools.
  - `EnableSubagentTools` (`boolean`): Grants `define_subagent` and `invoke_subagent` for nested delegation.

### Workspace Isolation Modes in `invoke_subagent`
When invoking a subagent via `invoke_subagent(TypeName, Role, Prompt, Model, Workspace)`:
| `Workspace` Mode | Behavior | Best Use Case |
| :--- | :--- | :--- |
| **`"inherit"`** (Default) | Shares the exact working directory with the parent agent. | Read-only research, sequential edits, or non-overlapping file tasks. |
| **`"branch"`** | Creates an isolated workspace cloned/branched from the parent. | Parallel implementation experiments or risky refactors. |
| **`"share"`** | Creates a new workspace sharing the underlying repo storage (like `git worktree` or `hg share`). | Parallel feature branches without duplicating repository storage. |

### Reactive Wakeup & Inter-Agent Messaging
- **Context Isolation**: Each subagent starts with a clean context window (no parent chat history bloat). Pass all necessary file paths, constraints, and expected deliverables in `Prompt`.
- **No Polling**: Never loop or sleep waiting for a subagent. End your turn or continue independent work; Antigravity automatically wakes the parent agent when a subagent sends a message or finishes.
- **Continuing Work**: Reuse the `conversationId` returned by `invoke_subagent` via `send_message(Recipient, Message)` for follow-up tasks instead of spawning a new subagent.

---

## 3. Core Reasoning Frameworks

### ReAct (Reason + Act)
Loop `Thought -> Action (Tool Call) -> Observation`. Best for codebase exploration, debugging, and iterative implementation.

### Plan-and-Solve (Plan-and-Execute)
1. **Planner**: Decompose goal into atomic, verifiable tasks with dependencies.
2. **Executor**: Execute tasks sequentially or delegate parallelizable tasks to subagents.
Best for multi-step features, migrations, and full-stack scaffolding.

### Reflection / Verification Gate
Generate artifact or code change -> run automated verification (`run_command` tests/linter or QA subagent) -> self-correct before reporting completion.

---

## 4. Tool Design & Usage Principles

| Principle | Explanation |
| :--- | :--- |
| **Least Privilege** | Restrict read-only agents (researchers, auditors) via `tools:` in frontmatter or `EnableWriteTools: false`. |
| **Sandbox First** | Default to `commandExecutionPolicy: sandbox` and `BypassSandbox: false`. |
| **Explicit Deliverables** | Instruct subagents on the exact structure (file paths, diff summary, verification output) they must return. |
| **Progressive Skill Loading** | Link domain skills under `## 🧰 Recommended Skills` so the agent reads `SKILL.md` on demand without bloating baseline context. |
