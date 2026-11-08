---
name: create-ai-agent
description: Architect, configure, and scaffold AI agents and Antigravity subagents (.agents/agents/*.md). Define YAML frontmatter (model, tools, skills, commandExecutionPolicy, mainAgent, subagent), system prompts, reasoning loops, and tool permissions. Use for "create agent", "build agent", "scaffold agent", "create subagent", "update agent markdown", "design agent architecture", or agentic workflows.
version: 2.0.0
---

# Create AI Agent & Antigravity Subagent

Architect, configure, and scaffold custom AI agents and Antigravity subagents following the official [Google Antigravity Subagents Specification](https://antigravity.google/docs/subagents/).

## When to Use

Trigger this skill when the user asks to:
- Create, scaffold, or update an agent markdown file in `.agents/agents/<name>.md` or `~/.gemini/config/agents/<name>.md`.
- Configure Antigravity subagent YAML frontmatter (`model`, `mainAgent`, `subagent`, `tools`, `skills`, `commandExecutionPolicy`, `inheritMcp`, `inheritCustomizations`).
- Define dynamic runtime subagents using `define_subagent` and orchestrate them via `invoke_subagent`, `send_message`, and `manage_subagents`.
- Architect multi-agent workflows, reasoning loops (ReAct, Plan-and-Solve, Reflection), memory structures, or tool allowlists.

## Instructions

1. **Clarify Agent Scope & Execution Mode**:
   - Identify the agent's primary domain, persona, and whether it operates as a **Primary Agent** (`mainAgent: true`), a background **Subagent** (`subagent: true`), or both.
   - Determine workspace isolation needs when invoked as a subagent: `inherit` (shared working tree), `branch` (isolated Git worktree/clone), or `share` (shared underlying repo storage).

2. **Choose Discovery Location**:
   - **Workspace Agent (Project-Scoped)**: Write to `.agents/agents/<name>.md` (or `.agents/agents/<name>/agent.md`).
   - **Global Agent (Machine-Wide)**: Write to `~/.gemini/config/agents/<name>.md`.
   - **Plugin Agent (Bundled)**: Write to `agents/<name>.md` inside the plugin directory.
   - Ensure `<name>` is lowercase `kebab-case` (e.g., `security-auditor`, `game-developer`).

3. **Configure Valid Antigravity YAML Frontmatter**:
   - Populate the YAML frontmatter strictly using valid Antigravity Subagent fields (invalid `model` values prevent Antigravity from registering the subagent):

   | Field | Type | Default | Valid Values & Rules |
   | :--- | :--- | :--- | :--- |
   | `name` | `string` | File/folder name | Unique lowercase `kebab-case` identifier (e.g., `qa-engineer`). |
   | `description` | `string` | **Required** | Clear summary of what the agent does + trigger conditions for delegation. |
   | `model` | `string` | `"inherit"` | **MUST** be one of: `"inherit"`, `"flash_lite"`, `"flash"`, or `"pro"`. Never use raw model IDs like `gemini-flash-latest`. |
   | `mainAgent` | `boolean` | `true` | Allows selecting the agent directly as a primary session in UI or `agy --agent <name>`. |
   | `subagent` | `boolean` | `true` | Allows parent agents to spawn this agent asynchronously via `invoke_subagent`. |
   | `tools` | `string[]` | All tools | Optional allowlist of built-in tools (e.g., `read_file`, `edit_file`, `write_file`, `run_command`). Omit write/shell tools for read-only auditors/researchers. (`send_message` is always included.) |
   | `commandExecutionPolicy` | `string` | `"sandbox"` | Terminal execution policy: `"sandbox"`, `"off"`, `"auto"`, or `"eager"`. |
   | `skills` | `string[]` | `[]` | Optional list of skill paths pre-loaded for this agent (e.g., `skills/testing-patterns`). |
   | `inheritMcp` | `boolean` | `true` | Whether the agent inherits active workspace MCP servers. |
   | `inheritCustomizations` | `boolean` | `true` | Whether workspace-level skills, rules, and hooks are inherited. |

   - If maintaining library orchestration metadata (`authority`, `reports-to`, `integration`), keep `model` set to a valid tier (`inherit`, `flash_lite`, `flash`, or `pro`).

4. **Draft the Markdown Body (System Prompt)**:
   - Remember that everything below the YAML frontmatter compiles directly into the agent's **System Prompt**.
   - Copy structure from [assets/agent-template.md](assets/agent-template.md) and include:
     - **`## 🎯 Core Responsibility`**: Role definition, mission statement, and key objectives.
     - **`## 🧠 Mindset & Principles`**: Decision-making heuristics and architectural priorities.
     - **`## 🧰 Recommended Skills`**: Markdown links to relevant skills in `../skills/<skill-name>/SKILL.md`.
     - **`## 📋 Operating Procedures`**: Imperative, verb-first step-by-step instructions and reasoning loop (ReAct, Plan-and-Solve, or Reflection from [references/patterns.md](references/patterns.md)).
     - **`## 🚨 Red Flags (Anti-Patterns)`**: Explicit prohibitions and failure modes.
     - **`## ✅ Review Checklist & Output Format`**: Verification gates before reporting back to the user or parent agent.

5. **Configure Runtime Subagent Orchestration (When Applicable)**:
   - For on-the-fly subagents without a static `.md` file, call `define_subagent` with `Name`, `Description`, `SystemPrompt`, `EnableWriteTools`, `EnableMCPTools`, and `EnableSubagentTools`.
   - Launch subagents asynchronously via `invoke_subagent` (`TypeName`, `Role`, `Prompt`, `Model: "inherit"`, `Workspace: "inherit" | "branch" | "share"`).
   - Never poll in a loop after `invoke_subagent`; Antigravity's reactive wakeup resumes execution automatically when the subagent finishes or sends a message.
   - Continue work with an existing subagent by calling `send_message` with its `conversationId` rather than spawning a duplicate subagent.

6. **Synchronize Ecosystem Registries**:
   - When adding or updating a workspace agent in `.agents/agents/`, update `AGENTS.md` and `docs/TRIGGER_CATALOG.md` so the repository index stays in sync.

## Output Format

Present a structured summary after creating or updating an agent:

```markdown
### Agent Created / Updated: `{name}`
**Path:** `.agents/agents/{name}.md`

**1. Antigravity Frontmatter Configuration**
- **Model Tier**: `inherit` | `flash_lite` | `flash` | `pro`
- **Modes**: `mainAgent: {true|false}`, `subagent: {true|false}`
- **Command Policy**: `{sandbox|off|auto|eager}`
- **Tools / Skills**: `{allowlist or "All (default)"}`

**2. Persona & System Prompt**
- **Core Responsibility**: ...
- **Recommended Skills**: ...
- **Key Guardrails**: ...
```

## Examples

**Input:** "Create a read-only dependency auditor subagent that checks package manifests and security advisories."

**Expected Action:**
1. Choose name `dependency-auditor` and path `.agents/agents/dependency-auditor.md`.
2. Configure YAML frontmatter with `model: flash`, `mainAgent: false`, `subagent: true`, `commandExecutionPolicy: sandbox`, `inheritMcp: true`, and a read-only `tools` allowlist (`read_file`, `search_web`, `list_resources`).
3. Draft the system prompt body using [assets/agent-template.md](assets/agent-template.md) with `## 🎯 Core Responsibility`, `## 🧰 Recommended Skills` (linking `web-security` and `nodejs-best-practices`), `## 📋 Operating Procedures`, and `## 🚨 Red Flags`.
4. Register the new agent in `AGENTS.md` and `docs/TRIGGER_CATALOG.md`.

**Input:** "Update our existing `.agents/agents/*.md` files so they work properly as Antigravity subagents."

**Expected Action:**
1. Audit the YAML frontmatter of each `.agents/agents/*.md` file.
2. Replace legacy/invalid `model` strings (such as `gemini-flash-latest` or `gemini-3.1-pro`) with valid Antigravity model tiers (`inherit`, `flash_lite`, `flash`, or `pro`).
3. Add explicit `mainAgent`, `subagent`, `commandExecutionPolicy`, `inheritMcp`, and `inheritCustomizations` fields where needed.
4. Verify all linked skills in `## 🧰 Recommended Skills` resolve to valid `../skills/<name>/SKILL.md` files.

## Resources

- [assets/agent-template.md](assets/agent-template.md) — Canonical Antigravity agent & subagent Markdown template.
- [references/patterns.md](references/patterns.md) — Subagent lifecycle, frontmatter reference, reasoning loops (ReAct, Plan-and-Solve), and tool design patterns.
- [Google Antigravity Subagents Documentation](https://antigravity.google/docs/subagents/) — Official specification for `.agents/agents/` Markdown files and subagent orchestration.
- [Building LLM-Based Agents (Gemini API Docs)](https://ai.google.dev/gemini-api/docs/agents)

## Related Skills

- **[prompt-building](../prompt-building/SKILL.md)** — Craft high-signal system prompts and instruction hierarchies.
- **[parallel-agents](../parallel-agents/SKILL.md)** — Orchestrate concurrent multi-agent workflows and subagent teams.
- **[mcp-builder](../mcp-builder/SKILL.md)** — Build custom MCP tools for agents.
- **[create-skill](../create-skill/SKILL.md)** — Scaffold modular skills that agents reference.
