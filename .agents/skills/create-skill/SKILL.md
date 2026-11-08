---
name: create-skill
description: Create, scaffold, or generate new AI agent skills.
version: 1.2.0
---

# Create Skill

## When to Use

Create, scaffold, or generate new AI agent skills for library.

## Instructions

1. **Understand Goal**: Clarify purpose, scope, inputs/outputs. Ask user if ambiguous.
2. **Research**: Search for docs, best practices, tools. Check existing skills in `.agents/skills/` to avoid duplicates.
3. **Determine Name**: Choose unique URL-safe ID (max 64 chars, lowercase, numbers, hyphens).
   - Good: `web-scraping`, `extract-pdf-text`, `react-component-generator`
   - Bad: `WebScraping`, `extract pdf text`, `my_skill_v2`
4. **Create Directory**: Scaffold new directory in `.agents/skills/` matching `name`.
5. **Draft `SKILL.md`**: Copy `skill-template.md`. Must include:
   - **YAML Frontmatter**: `name` (required), `description` (required + triggers), `version`, etc.
   - **Markdown Body**: `## When to Use`, `## Instructions` (imperative), `## Output Format`, `## Examples`, `## Resources`. Keep <500 lines.
6. **Layout**: Scaffold subdirs: `scripts/`, `references/`, `assets/`.
7. **Enrichment (MANDATORY)**: Create at least one supporting asset per skill:
   - **`scripts/`**: Boilerplate, utilities, templates.
   - **`references/`**: Best practices, common patterns, gotchas.
   - **`assets/`**: Images, sample data, configuration files.
8. **Validate**: Confirm:
   - [ ] `name` matches directory.
   - [ ] `description` has triggers.
   - [ ] Instructions imperative.
   - [ ] `SKILL.md` <500 lines.
   - [ ] Supporting assets exist.
   - [ ] No duplicate functionality.
9. **Review**: Present scaffolded skill for feedback using output format.
10. **Synchronize Agents**: Update matching `.agents/agents/*.md` files (frontmatter `skills:` and `## 🧰 Recommended Skills`) and `docs/TRIGGER_CATALOG.md`.

## Output Format

Present structured summary:

```
### Skill Created: `{name}`
**Path:** `.agents/skills/{name}/`
**Files:**
- `SKILL.md` — {line count} lines
- `scripts/` — {file list or "none"}
- `references/` — {file list or "none"}
- `assets/` — {file list or "none"}
**Triggers:** "{trigger phrases from description}"
```

## Examples

**Input:** "Create a skill to extract text from PDFs."

**Expected Action:**

1. Research PDF text extraction tools/approaches.
2. Check `.agents/skills/` for existing PDF skills.
3. Create directory `.agents/skills/extract-pdf-text`.
4. Copy template to `.agents/skills/extract-pdf-text/SKILL.md`.
5. Populate instructions, validate.
6. Present summary:

```
### Skill Created: `extract-pdf-text`
**Path:** `.agents/skills/extract-pdf-text/`
**Files:**
- `SKILL.md` — 45 lines
- `scripts/` — none
- `assets/` — none
**Triggers:** "extract text from PDFs", "read a PDF"
```

## Post-Creation: Agent Synchronization

After creating and validating a new skill, integrate it across the ecosystem:

1. **Identify Relevant Agents**:
   - Inspect `.agents/agents/*.md` to identify which specialist personas operate within the domain of the new skill (e.g., `frontend-developer`, `backend-developer`, `game-developer`, `blockbench-expert`, `security-auditor`, etc.).
   - Check the `authority` and `## 🎯 Core Responsibility` fields in candidate agents.

2. **Update Agent Frontmatter (`skills:`)**:
   - Add the skill reference (`skills/<skill-name>`) to the `skills:` list in the YAML frontmatter of each matching agent:
     ```yaml
     skills:
       - skills/my-new-skill
     ```

3. **Update Agent System Prompt (`## 🧰 Recommended Skills`)**:
   - Add a formatted markdown link and concise guidance in the agent's `## 🧰 Recommended Skills` section:
     ```markdown
     - **[my-new-skill](../skills/my-new-skill/SKILL.md)** — Core guidance and patterns for <domain task>.
     ```

4. **Update Trigger Catalog**:
   - Add the skill name and primary trigger phrases to `docs/TRIGGER_CATALOG.md` under the appropriate category.

## Resources

- [Agent Skills Official Specification](https://agentskills.io)
- [Agent Skills GitHub Repository](https://github.com/agentskills/agentskills)
- [Antigravity Codes Agent Skills](https://antigravity.codes/agent-skills)
- [assets/skill-template.md](assets/skill-template.md) — Starter template

## Related Skills

- **[audit-skill](../audit-skill/SKILL.md)** — Validate new skills.
- **[project-organization](../project-organization/SKILL.md)** — Correct placement in ecosystem.
- **[create-workflow](../create-workflow/SKILL.md)** — Build higher-level procedures.
