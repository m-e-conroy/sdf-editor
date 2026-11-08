---
name: storybook-ai
description: Integrate Storybook with AI agents via MCP. Generate stories, fetch component docs, run visual tests. Triggers: "use storybook with ai", "storybook mcp", "generate stories with ai", "component documentation storybook".
version: 1.0.0
---

# Storybook AI

Connect Storybook to AI agents using Model Context Protocol (MCP) for component development, documentation, and testing.

## When to Use

Trigger when:
- Connecting AI agent to local Storybook instance.
- Fetching component properties/examples without hallucination.
- Automatically generating stories from component code.
- Running component tests through an agent.
- Documenting components using AI-assisted JSDoc.

## Instructions

### 1. Setup
1. **Install Addon**:
   ```bash
   npx storybook add @storybook/addon-mcp
   ```
2. **Start Storybook**:
   ```bash
   npm run storybook
   ```
3. **Verify MCP Endpoint**: Access `http://localhost:6006/mcp`.
4. **Connect Agent**:
   ```bash
   npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project
   ```

### 2. Core Tools
- `list-all-documentation`: List all components in Storybook.
- `get-documentation`: Fetch props, examples, and summaries for specific component.
- `get-storybook-story-instructions`: Get latest story writing conventions.
- `run-story-tests`: Execute component tests via Storybook.

### 3. Best Practices
1. **Writing Stories**: One concept per story. Descriptive "why" in JSDoc.
2. **Documentation**: Use JSDoc summaries (`@summary`) for components and stories.
3. **Prop Types**: Enforce `react-docgen-typescript` for accuracy.
4. **Curation**: Use `tags: ['!manifest']` to exclude noise/deprecated docs.
5. **Static Analysis**: MDX content must be explicit; dynamic values (e.g. `.map()` over tokens) do not show in manifest.

### 4. Agent Configuration
Add to `AGENTS.md` or `CLAUDE.md`:
```markdown
When working on UI components, use `storybook-mcp` tools to check docs before acting.
- Query `list-all-documentation` for component list.
- Query `get-documentation` for props and examples.
- Never hallucinate component properties.
```

## Output Format

```markdown
### Storybook AI Connected
**Endpoint:** `{mcp-url}`
**Server Name:** `{server-name}`
**Components Found:** `{count}`
**Status:** ✅ Active
```

## Examples

**Input:** "Help me use Storybook with my agent."
**Expected Action:**
1. Check if Storybook is running.
2. Install `@storybook/addon-mcp`.
3. Provide `mcp-add` command.
4. Update `CLAUDE.md` with Storybook tool instructions.

## Resources

- [Storybook AI Official Docs](https://storybook.js.org/docs/ai)
- [MCP Specification](https://modelcontextprotocol.io)
- [best-practices](references/best-practices.md)

## Related Skills

- **[frontend-design](../frontend-design/SKILL.md)** — General component design rules.
- **[mcp-builder](../mcp-builder/SKILL.md)** — Building/extending MCP servers.
- **[testing-patterns](../testing-patterns/SKILL.md)** — Integration with Storybook tests.
