# Commits & Commit Messages

Complete reference for staging, committing, amending, and writing high-quality Git commit messages.

---

## Staging Changes

```bash
# Stage all changes in tracked files
git add -A           # all: new + modified + deleted
git add .            # all in current directory tree
git add -u           # only modified + deleted (no new files)

# Stage specific files
git add src/auth.js config/db.js

# Interactive hunk-by-hunk staging (RECOMMENDED)
git add -p           # review each change chunk before staging
git add --patch

# Stage part of a file interactively
git add -i           # full interactive mode menu
```

---

## Checking Status Before Committing

```bash
git status                    # overview of staged/unstaged/untracked
git diff                      # unstaged changes
git diff --staged             # staged changes (what will be committed)
git diff --cached             # alias for --staged

# Preview exactly what the next commit will contain
git diff --staged --stat
```

---

## Writing the Commit

```bash
# Open editor for full commit message
git commit

# Inline message (single-line)
git commit -m "feat(auth): add JWT refresh token support"

# Multi-line from command line
git commit -m "fix(payments): prevent double-charge on retry" \
           -m "Adds idempotency key check before processing." \
           -m "Closes #482"

# Stage all tracked files AND commit
git commit -a -m "docs: update README installation section"

# Commit with a body from a file
git commit -F commit-message.txt
```

---

## Conventional Commits Format

```
<type>(<optional scope>): <short summary, imperative, ≤72 chars>
<blank line>
<optional body — explain WHAT and WHY, not HOW>
<blank line>
<optional footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature visible to users |
| `fix` | Bug fix visible to users |
| `docs` | Documentation only |
| `style` | Formatting, semicolons; no logic change |
| `refactor` | Code restructuring, no feature/fix |
| `perf` | Performance improvement |
| `test` | Add or update tests |
| `build` | Build system, dependencies (npm, pip, etc.) |
| `ci` | CI/CD pipeline config |
| `chore` | Other maintenance; version bumps, releases |
| `security` | Security patches, vulnerability fixes |
| `revert` | Revert a previous commit |

### Breaking Changes

```bash
# Option 1: append ! after type/scope
git commit -m "feat!: remove deprecated v1 auth endpoint"

# Option 2: BREAKING CHANGE footer
git commit -m "feat(api): redesign response envelope

BREAKING CHANGE: 'data' wrapper removed from all API responses.
Clients must update to read top-level fields directly.

Closes #301"
```

### Good vs. Bad Messages

| Bad | Good |
|-----|------|
| `fix stuff` | `fix(cart): correct item quantity overflow at checkout` |
| `WIP` | `feat(notifications): add email digest for weekly summary` |
| `updated` | `refactor(auth): extract token validation into separate module` |
| `final` | `chore(release): bump version to 2.1.0` |

**Rules for summary line:**
- Imperative mood: "add", "fix", "remove" not "added", "fixing"
- No period at end
- ≤ 72 characters
- Lowercase after type prefix

---

## Amending Commits

```bash
# Change the last commit message only (not pushed yet)
git commit --amend -m "fix(auth): correct token expiry calculation"

# Add a forgotten file to the last commit
git add forgotten-file.js
git commit --amend --no-edit        # keep same message

# Fully rewrite last commit (opens editor)
git commit --amend

# ⚠️ NEVER amend commits already pushed to a shared branch
```

---

## Undoing / Reverting

```bash
# Unstage a file (keep working tree changes)
git restore --staged file.js       # Git 2.23+
git reset HEAD file.js             # older syntax

# Discard working tree changes for a file
git restore file.js

# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, keep changes unstaged
git reset --mixed HEAD~1           # default

# ⚠️ Undo last commit AND discard changes (destructive)
git reset --hard HEAD~1

# Safe: create a new "undo" commit (works on pushed commits)
git revert HEAD
git revert abc1234
```

---

## Interactive Rebase (Squash / Reorder / Fixup)

```bash
# Squash last 3 commits
git rebase -i HEAD~3

# In the editor, change commands:
# pick  → keep as-is
# reword → keep commit, change message
# squash → merge into previous, combine messages
# fixup  → merge into previous, discard this message
# drop   → delete the commit entirely
# edit   → pause to amend this commit

# ⚠️ Only rebase commits NOT yet pushed to shared branch
```

### Automatic Fixup Workflow
```bash
# While on feature branch, make a fix for a previous commit
git add fix.js
git commit --fixup=<sha-of-commit-to-fix>

# Then auto-squash all fixup! commits
git rebase -i --autosquash HEAD~5
```

---

## Cherry-Pick

```bash
# Apply a single commit from another branch
git cherry-pick abc1234

# Apply range (inclusive)
git cherry-pick abc1234^..def5678

# Apply without committing (stage only)
git cherry-pick --no-commit abc1234
```

---

## Stashing

```bash
# Stash current changes
git stash
git stash push -m "WIP: auth refactor"

# Include untracked files
git stash -u

# List stashes
git stash list

# Apply most recent stash (keep in stash)
git stash apply

# Pop most recent stash (apply + remove from stash)
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Drop a stash
git stash drop stash@{1}

# Create a branch from a stash
git stash branch feature/from-stash stash@{0}
```

---

## Viewing History

```bash
# Compact log
git log --oneline --graph --decorate --all

# Log for a file
git log --follow -- src/auth.js

# Search commits by message
git log --grep="fix(auth)"

# Search commits by code content
git log -S "apiKey" --oneline

# Show a specific commit
git show abc1234

# Show what changed in last commit
git show HEAD
```
