---
name: mcp-builder
description: Build robust, secure, well-designed MCP servers. Design tools/resources, configure clients, troubleshoot integrations.
---

# MCP Builder

Purpose: build robust, secure, well-designed Model Context Protocol (MCP) servers.

## When to Use

Trigger:
- Scaffold/build new MCP server.
- Design/refine tools, resources, prompts.
- Configure MCP for Claude Desktop or other clients.
- Troubleshoot/optimize existing servers.

## Instructions

Principles:
1. **Structure Project**: Use standard architectures (TS/Node or Python). Handle Stdio, SSE, or WebSocket transports.
2. **Design Action Tools**: Verb-noun names (e.g., `get_weather`). One tool, one job.
3. **Strict Schemas**: Validate inputs. Clear JSON schemas + human-readable descriptions.
4. **Resource Patterns**: Expose static/dynamic data via URIs (`docs://`, `users://`, `files://`).
5. **Handle Errors**: Return structured validation errors. Hide internal crash details. Log deep details locally.
6. **Secure Server**: Sanitize inputs. Use env vars for keys/secrets. Validate permissions.
7. **Multimodal Data**: Base64 encode images/files with MIME types.
8. **Test**: Unit test logic, integration test server, contract test schemas.
9. **Configure Client**: Provide config (command, args, env) for Claude Desktop.

## Output Format

Response structure:
1. **Architecture Strategy**: Transport + structure.
2. **Tool/Resource Schemas**: Definitions for implementation.
3. **Implementation Code**: Full code + error handling + typing.
4. **Client Configuration**: Registration JSON config (e.g., `mcp_config.json`).
5. **Best Practices Checklist**: Adherence to MCP standards.

## Examples

**Input:** "Create MCP server to list and read local markdown files."
**Expected Action:**
1. Use `stdio` transport.
2. Design `list_markdown_files` + `read_markdown_file`.
3. Strict JSON schemas + path limits.
4. Validate file existence + type.
5. Catch filesystem errors; return user-friendly response.
6. Present code + Claude Desktop config.

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Official MCP GitHub Repositories](https://github.com/modelcontextprotocol)

## Related Skills

- **[create-ai-agent](../create-ai-agent/SKILL.md)** — Design agents consuming these tools.
- **[nodejs-best-practices](../nodejs-best-practices/SKILL.md)** — Robust Node.js implementation.
