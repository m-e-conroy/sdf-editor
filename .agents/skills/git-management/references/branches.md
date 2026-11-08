# Branch Management

Complete reference for creating, navigating, managing, and cleaning up Git branches.

## Branch Naming Conventions

| Pattern | Example | Use For |
|---------|---------|---------|
| `feature/<name>` | `feature/user-auth` | New features |
| `fix/<name>` | `fix/login-crash` | Bug fixes |
| `hotfix/<name>` | `hotfix/xss-vuln` | Urgent production fixes |
| `release/<version>` | `release/1.4.0` | Release preparation |
| `chore/<name>` | `chore/update-deps` | Maintenance |
| `docs/<name>` | `docs/api-endpoints` | Documentation |
| `refactor/<name>` | `refactor/auth-module` | Code restructuring |

Use only lowercase letters, numbers, and hyphens. Avoid spaces and special characters.

---

## Creating Branches

```bash
# Create and switch immediately (preferred)
git switch -c feature/my-feature

# From a specific branch or tag
git switch -c hotfix/urgent-fix main
git switch -c release/2.0.0 v1.9.0

# From a specific commit
git switch -c investigate/bug abc1234

# Old syntax (still valid)
git checkout -b feature/my-feature
```

```bash
# Create WITHOUT switching
git branch feature/background-work

# Create tracking a remote branch
git branch --track feature/shared origin/feature/shared
```

---

## Switching Branches

```bash
# Switch to an existing branch
git switch main
git switch develop

# Switch and create if not exists (using -C to force-reset if exists)
git switch -C feature/reset-branch

# Go back to the previous branch
git switch -

# Old syntax
git checkout main
```

---

## Listing Branches

```bash
# Local branches only
git branch

# Verbose (shows last commit + upstream tracking)
git branch -vv

# Remote-tracking branches
git branch -r

# All (local + remote)
git branch -a

# Branches merged into current
git branch --merged

# Branches NOT yet merged into current
git branch --no-merged

# Branches containing a specific commit
git branch --contains abc1234
```

---

## Renaming Branches

```bash
# Rename current branch
git branch -m new-name

# Rename a specific branch
git branch -m old-name new-name

# After renaming, update the remote:
git push origin --delete old-name
git push -u origin new-name
```

---

## Deleting Branches

```bash
# Delete merged branch (safe — refuses if unmerged)
git branch -d feature/done

# Force-delete unmerged branch
git branch -D feature/abandoned

# Delete multiple at once
git branch -d feature/a feature/b feature/c

# Delete a remote-tracking branch reference
git branch -dr origin/old-branch

# Delete branch on remote
git push origin --delete feature/done
```

---

## Setting Upstream Tracking

```bash
# Push and set upstream in one step
git push -u origin feature/my-feature

# Set upstream for existing branch
git branch --set-upstream-to=origin/main main
git branch -u origin/feature/my-feature feature/my-feature

# Remove upstream tracking
git branch --unset-upstream

# Check tracking status
git branch -vv
```

---

## Comparing Branches

```bash
# Commits in feature not in main
git log main..feature/my-feature

# Files changed between branches
git diff main...feature/my-feature --name-only

# Full diff between two branches
git diff main feature/my-feature

# Check if a branch is behind/ahead of remote
git fetch origin
git status                         # shows ahead/behind counts
git log HEAD..origin/main          # commits on remote not in local
git log origin/main..HEAD          # commits local not yet pushed
```

---

## Pruning Stale Remote Branches

```bash
# Fetch and prune stale remote-tracking refs
git fetch --prune
git fetch -p

# Prune without fetching
git remote prune origin

# Dry-run (see what would be pruned)
git remote prune origin --dry-run

# List remote branches that no longer exist on remote
git branch -r --merged origin/main | grep -v main
```

---

## Branch Protection Patterns (Local Safeguards)

Add this to `.git/hooks/pre-push` to prevent accidental pushes to main/master:

```bash
#!/bin/sh
protected_branches="^(main|master|develop|release/.*)$"
current_branch=$(git symbolic-ref HEAD | sed -e "s,.*/\(.*\),\1,")
if [[ "$current_branch" =~ $protected_branches ]]; then
  echo "ERROR: Direct push to '$current_branch' is blocked. Use a feature branch and PR."
  exit 1
fi
```

---

## Common Branch Workflows

### Feature Branch Workflow
```bash
git switch main && git pull
git switch -c feature/new-thing
# ... develop ...
git push -u origin feature/new-thing
# Open PR, get review, merge via PR
git switch main && git pull
git branch -d feature/new-thing
```

### Hotfix Workflow
```bash
git switch main && git pull
git switch -c hotfix/critical-fix
# ... fix ...
git commit -m "fix(auth): prevent token replay attack"
git switch main && git merge --no-ff hotfix/critical-fix
git tag -a v1.2.1 -m "chore(release): v1.2.1"
git push origin main --tags
git branch -d hotfix/critical-fix
```

### Keeping Feature Branch Up to Date with Main
```bash
git switch main && git pull
git switch feature/my-feature
git rebase main           # preferred: linear history
# or
git merge main            # if rebasing is not appropriate
```
