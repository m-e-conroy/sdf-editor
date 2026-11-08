---
name: prompt-building
description: Use when user ask "build prompt", "write prompt for agent", or "help prompt Antigravity".
version: 1.0.0
---

# Prompt Building

Purpose: help write, refine, and structure robust prompts.

## When to Use

Trigger:
- User asks to write/refine/structure prompt.
- Build prompts for app development (system instructions, task prompts, few-shot examples).

## Instructions

Drafting process:
1. **Analyze**: Identify core objective. If vague, ask for persona, task, context, format.
2. **Apply Strategies**:
   - **Persona**: Define AI role (e.g., "Act as Senior React Developer").
   - **Task**: State clearly using imperative language.
   - **Context**: Provide background (frameworks, limitations).
   - **Format**: Declare output type (JSON, markdown, code).
   - **Examples**: Add few-shot examples.
3. **Drafting**: Use XML tags (`<context>`, `<instructions>`, `<output_format>`) or markdown headings.
4. **Refine**: Ensure clear, concise rules. Use positive constraints ("only do Y") over negative ("don't do X").
5. **Present**: Return prompt inside code block.

## Output Format

Final prompt structure:
```markdown
You are a [Persona]. Your task is to [Task].

<context>
[Contextual details]
</context>

<instructions>
1. [Step 1]
2. [Step 2]
</instructions>

<output_format>
[Format requirements]
</output_format>
```

Briefly explain structure effectiveness (1-2 sentences).

## Examples

**Input:** "Help me write a prompt to generate unit tests for my Python application."
**Expected Action:**
1. Determine task (unit tests) + language (Python).
2. Structure prompt: testing persona (QA Engineer), clear instructions, formatting (pytest).
3. Present prompt:
   ```markdown
   Act as a Senior QA Engineer specializing in Python. Your task is to write comprehensive unit tests for the provided Python code.
   
   <instructions>
   1. Analyze the code to identify all edge cases and main execution paths.
   2. Write tests using the `pytest` framework.
   3. Include setup and teardown fixtures where appropriate.
   4. Add descriptive docstrings to each test explaining what it covers.
   </instructions>
   
   <output_format>
   Output only the Python code containing the tests. Do not provide conversational filler.
   </output_format>
   ```
4. Provide short rationale.

## Resources

- [Prompt design strategies (Gemini API)](https://ai.google.dev/gemini-api/docs/prompting-strategies)
- [Writing Effective AI Prompts for Business (Google Workspace)](https://workspace.google.com/resources/ai/writing-effective-prompts/)
- [Gemini 3 prompting guide (Vertex AI)](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/gemini-3-prompting-guide)

## Related Skills

- **[create-ai-agent](../create-ai-agent/SKILL.md)** — Prompting for personas.
- **[brainstorming](../brainstorming/SKILL.md)** — Context extraction.
- **[create-antigravity-rules](../create-antigravity-rules/SKILL.md)** — Project-wide instructions.
