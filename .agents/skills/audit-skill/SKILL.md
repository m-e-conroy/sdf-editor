---
name: audit-skill
description: Audit AI agent skills: structural compliance, content quality, directory hygiene. Trigger: "audit skill", "review skill quality", "validate skills", "lint library".
version: 1.0.0
---

# Skill Auditor

Purpose: validate, report, auto-fix skills against standards.

## When to Use

Trigger:
- Audit skills in `.agents/skills/`.
- Check compliance, quality, hygiene.
- Auto-fix minor issues.

## Instructions

Audit process:

### Phase 1: Structural Compliance

1. **Read `SKILL.md`**.
2. **Validate Frontmatter**:
   - `name` exists + matches directory (lowercase, hyphens).
   - `description` has trigger phrase.
   - Optional fields (`version`, `context`, `disable-model-invocation`) valid.
3. **Validate Sections**: Check presence/order: `## When to Use`, `## Instructions`, `## Output Format`, `## Examples`, `## Resources`.
4. **Line Count**: Confirm `SKILL.md` < 500 lines.

### Phase 2: Directory Hygiene

5. **Audit Subdirs**:
   - List files/subdirs.
   - Flag empty subdirs (`references/`, `scripts/`).
   - Flag orphaned files.
   - Flag broken internal links.
6. **Naming**:
   - Subdirs: `scripts/`, `references/`, `assets/`.
   - Flag non-standard subdirs.

### Phase 3: Content Quality

7. **Language**: Use imperative, verb-first language. Flag passive/vague phrasing ("consider", "helpful").
8. **Triggers**: `## When to Use` needs specific, actionable triggers.
9. **Examples**: `## Examples` needs `**Input:**` / `**Expected Action:**` pairs.
10. **Resources**: Links must point to real files or plausible URLs.
11. **Cross-Skill**: Verify referenced skills exist.

### Phase 4: Auto-Fix (Minor Issues)

12. **Auto-fix without asking**:
    - Add `version: 0.1.0` if missing.
    - Remove trailing whitespace.
    - Delete empty subdirs.
    - Fix header typos (`Instuctions` → `Instructions`).
13. **Do NOT auto-fix**: Missing sections, low-quality content, broken external links, structural redesigns.

### Phase 5: Report

14. **Generate Audit Report** via Output Format. Group by severity.

## Output Format

Report structure:

```markdown
## 🔍 Skill Audit Report: `{skill-name}`

### Summary
| Check | Status |
|-------|--------|
| Frontmatter | ✅ Pass / ❌ Fail |
| Required Sections | ✅ Pass / ❌ Fail |
| Line Count (< 500) | ✅ {count} lines |
| Directory Hygiene | ✅ Clean / ⚠️ Issues |
| Content Quality | ✅ Good / ⚠️ Needs Improvement |
| Cross-Skill References | ✅ Valid / ❌ Broken |

### ❌ Failures (Must Fix)
1. [Issue description and location]
2. [Issue description and location]

### ⚠️ Warnings (Should Fix)
1. [Issue description and suggestion]
2. [Issue description and suggestion]

### 🔧 Auto-Fixed
1. [What was fixed automatically]

### ✅ Passed Checks
- [List of all checks that passed cleanly]
```

For multiple skills, show overview table first:

```markdown
## 🔍 Library Audit Overview

| Skill | Structure | Content | Directory | Overall |
|-------|-----------|---------|-----------|---------|
| `api-patterns` | ✅ | ✅ | ✅ | ✅ Pass |
| `clean-code` | ✅ | ⚠️ | ✅ | ⚠️ Warn |
| `mcp-builder` | ❌ | ✅ | ✅ | ❌ Fail |

### Skills Requiring Attention
[Individual reports for skills with warnings or failures]
```

## Examples

**Input:** "Audit the `testing-patterns` skill."
**Expected Action:**
1. Read `.agents/skills/testing-patterns/SKILL.md`.
2. Validate frontmatter: `name: testing-patterns` matches directory, `description` has triggers.
3. Check required sections: `## When to Use`, `## Instructions`, `## Output Format`, `## Examples`, `## Resources`.
4. List directory contents. Flag empty or orphaned subdirs.
5. Review instruction language for imperative verbs.
6. Verify examples have Input/Expected Action pairs.
7. Auto-fix minor issues.
8. Generate audit report.

**Input:** "Audit all skills in the library."
**Expected Action:**
1. List directories in `.agents/skills/`.
2. Run audit pipeline on each skill.
3. Present Library Audit Overview table.
4. Follow with individual reports for warnings or failures.

## Resources

- [Create Skill Template](../create-skill/assets/skill-template.md) — Canonical template.
- [Create Skill Workflow](../create-skill/SKILL.md) — Validation checklist.

## Related Skills

- **[create-skill](../create-skill/SKILL.md)** — Foundational skill defining audited standards.
- **[project-organization](../project-organization/SKILL.md)** — Directory structure and naming conventions.
- **[clean-code](../clean-code/SKILL.md)** — Instruction quality and readability.
