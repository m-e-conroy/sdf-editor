---
name: create-antigravity-rules
description: This skill should be used when the user asks to "create project rules", "define system instructions", "set up guidelines for Antigravity", or "update my rules".
version: 1.1.0
---

# Create Antigravity Rules

## When to Use

Trigger for:
- Creating/updating/managing project rules.
- Defining system instructions or coding guidelines.

## Instructions

1. **Check Existing Rules**: Scan for `.cursorrules`, `.agents/rules.md`, `CLAUDE.md`. Present findings. Ask: update or replace?
2. **Gather Requirements**: Ask for specific rules/constraints. Wait for response.
3. **Select Template**:
   - [assets/cursorrules.template](assets/cursorrules.template) → Cursor/IDE compatibility.
   - [assets/rules-template.md](assets/rules-template.md) → Antigravity/Gemini CLI native.
4. **Format Rules**: Populate template. Categorize (Core, Style, Framework, etc.).
5. **Merge/Create**:
   - If update: Read file, merge new rules. No duplicates.
   - If none: Create new from template.
6. **Save**:
   - Cursor: `.cursorrules` in root.
   - Markdown: `.agents/rules.md`.
7. **Validate**: Check file saved, no duplicates, logical order, original rules kept.
8. **Review**: Use Output Format.

## Output Format

Summary after save:

```
### Rules Saved
**File:** `{file path}`
**Action:** Created / Updated
**Rules ({count}):**
- {category}: {rule summary}
- {category}: {rule summary}
- ...
```
Ask for further changes.

## Examples

**Example 1 — Single rule (new file):**

**Input:** "Always use TypeScript strict mode."

**Expected Action**:
1. Scan — none.
2. Select `rules-template.md`.
3. Add rule to "Style & Formatting".
4. Save to `.agents/rules.md`.
5. Present:
   ```
   ### Rules Saved
   **File:** `.agents/rules.md`
   **Action:** Created
   **Rules (1):**
   - Style & Formatting: Enforce TypeScript strict mode for all files
   ```

**Example 2 — Multiple rules (existing file):**

**Input:** "Add these rules: use 2-space indentation, prefer arrow functions, always write JSDoc comments."

**Expected Action**:
1. Scan — `.agents/rules.md` found (3 rules).
2. Ask: Update/replace?
3. User: "Update."
4. Merge 3 new rules.
5. Save.
6. Present:
   ```
   ### Rules Saved
   **File:** `.agents/rules.md`
   **Action:** Updated
   **Rules (6):**
   - Style & Formatting: Use 2-space indentation
   - Style & Formatting: Prefer arrow functions over function declarations
   - Communication Preferences: Always write JSDoc comments for public APIs
   - ... (3 existing rules preserved)
   ```

## Resources

- [assets/cursorrules.template](assets/cursorrules.template) — `.cursorrules` template.
- [assets/rules-template.md](assets/rules-template.md) — `.agents/rules.md` template.

## Related Skills

- **[prompt-building](../prompt-building/SKILL.md)**: Refining rule language.
