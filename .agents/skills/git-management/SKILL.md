---
name: git-management
description: Comprehensive Git repository management for setup, branching, commits, secret scanning, and releases.
argument-hint: 'Describe git task: e.g. "create feature branch", "resolve conflicts", "tag v1.2.0"'
---

# Git Repository Management

Guidance: setup, branching, commits, remotes, gitignore, secrets, conflicts, tagging.

## Quick Navigation

| Task | Reference |
| :--- | :--- |
| Init, remote, clone | [Remote Origins](./references/remote-origins.md) |
| Branch management | [Branch Management](./references/branches.md) |
| Commits, amend, squash | [Commits & Messages](./references/commits.md) |
| .gitignore, secrets | [.gitignore & Secrets](./references/gitignore-secrets.md) |
| Conflict resolution | [Merge Conflicts](./references/merge-conflicts.md) |
| Tags, semver, CHANGELOG | [Tags & Versioning](./references/tags-versioning.md) |

## When to Use

Trigger:
- `git init`, `git clone`, remote `origin` setup.
- Branch creation, switching, tracking.
- Conventional commits, squashing, amending.
- Secret scanning, `.gitignore` fixes.
- Merge conflict analysis, resolution.
- Semver tagging, CHANGELOG updates.

## Instructions

1. **Safety Scan**: Before commit/push, run:
   ```bash
   git diff --cached | grep -iE "(password|secret|api[_-]?key|token|private[_-]?key|auth)"
   ```
   If secrets found: **STOP.** Unstage, add to `.gitignore`, rotate if exposed.
2. **Standard Flow**:
   - `git status` check state.
   - `git pull --rebase` stay current.
   - `git switch -c <type>/<name>` new work.
3. **Commits**:
   - `git add -p` stage hunks.
   - Conventional messages (`feat`, `fix`, `chore`).
   - Fix previous: `git commit --amend --no-edit`.
4. **Conflicts**:
   - Identify markers (`<<<<<<<`, `=======`, `>>>>>>>`).
   - Resolve manually. Keep best code.
   - `git add <file>`, then `git merge --continue`.
5. **Releases**:
   - Tag per semver: `MAJOR.MINOR.PATCH`.
   - Annotated tags: `git tag -a vX.Y.Z -m "chore(release): vX.Y.Z"`.

## Verification

- [ ] `git status` clean (or expected).
- [ ] No secrets in `git diff`.
- [ ] Message format: `<type>(<scope>): <summary>`.
- [ ] Conflict markers gone.
- [ ] Tag exists: `git tag -l`.

## Reference Tables

### Commit Types
| Type | When |
| :--- | :--- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Docs only |
| `refactor` | Restructuring |
| `test` | Add/fix tests |
| `chore` | Maintenance |
| `security` | Security fix |

### Secret Scanning Checklist
| Pattern | Looks Like |
| :--- | :--- |
| API keys | `sk-...`, `AKIA...` |
| Private keys | `-----BEGIN RSA PRIVATE KEY-----` |
| DB URLs | `postgres://user:pass@host` |
| Tokens | `ghp_...`, `Authorization: Bearer ...` |

### Semantic Versioning
- **MAJOR**: Breaking changes.
- **MINOR**: New features (backwards-compatible).
- **PATCH**: Bug fixes.
