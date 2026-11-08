# Tags & Version Management

---

## Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH[-pre-release][+build]`

| Version Part | When to Bump | Example |
|--------------|-------------|---------|
| `MAJOR` | Breaking/incompatible API change | `1.0.0` → `2.0.0` |
| `MINOR` | New backwards-compatible feature | `1.0.0` → `1.1.0` |
| `PATCH` | Backwards-compatible bug fix | `1.0.0` → `1.0.1` |

### Pre-Release Identifiers

| Stage | Format | Example |
|-------|--------|---------|
| Alpha (early testing) | `X.Y.Z-alpha.N` | `1.2.0-alpha.1` |
| Beta (feature complete) | `X.Y.Z-beta.N` | `1.2.0-beta.2` |
| Release Candidate | `X.Y.Z-rc.N` | `1.2.0-rc.1` |

### Deciding Which Part to Bump

Based on **Conventional Commits** since the last tag:

| Commits contain | Bump |
|-----------------|------|
| Any `BREAKING CHANGE` footer or `feat!:` / `fix!:` | **MAJOR** |
| Any `feat:` (no breaking changes) | **MINOR** |
| Only `fix:`, `perf:`, `docs:`, `style:` etc. | **PATCH** |
| Only `chore:`, `build:`, `ci:` | Generally no version bump |

---

## Creating Tags

### Lightweight Tags (Simple Pointer)

```bash
# Tag at current HEAD
git tag v1.2.0

# Tag a specific commit
git tag v1.2.0 abc1234
```

> Lightweight tags are just a label — no author, date, or message. Not recommended for releases.

---

### Annotated Tags (Recommended for Releases)

Annotated tags store: creation date, tagger name/email, and a message. These are the standard for version releases.

```bash
# Create annotated tag at HEAD
git tag -a v1.2.0 -m "chore(release): v1.2.0"

# Create with a detailed message
git tag -a v2.0.0 -m "chore(release): v2.0.0

BREAKING CHANGES:
- Removed deprecated v1 auth endpoint
- Response envelope restructured

New features:
- OAuth2 social login
- Rate limiting per API key"

# Tag a specific commit
git tag -a v1.1.5 abc1234 -m "chore(release): v1.1.5"

# Edit the tag message in your editor
git tag -a v1.2.0 -e
```

---

## Pushing Tags to Remote

```bash
# Push a single tag
git push origin v1.2.0

# Push all local tags
git push origin --tags

# Push both commits and all tags together
git push origin main --tags
```

> Tags are NOT pushed automatically with `git push`. You must push them explicitly.

---

## Listing Tags

```bash
# List all tags
git tag

# List with tag messages (annotated)
git tag -n

# List with first N lines of message
git tag -n3

# Filter by pattern
git tag -l "v1.*"
git tag -l "v2.*-rc*"

# Sort by version (semantic)
git tag --sort=version:refname
git tag --sort=-version:refname    # descending (newest first)

# Show a specific tag's details
git show v1.2.0
```

---

## Deleting Tags

```bash
# Delete a local tag
git tag -d v1.2.0

# Delete a remote tag
git push origin --delete v1.2.0
git push origin :refs/tags/v1.2.0  # older syntax

# Delete both local and remote
git tag -d v1.2.0
git push origin --delete v1.2.0
```

---

## Replacing / Re-Tagging

If you tagged the wrong commit and haven't pushed yet:

```bash
git tag -d v1.2.0           # delete local tag
git tag -a v1.2.0 <correct-commit> -m "chore(release): v1.2.0"
```

If already pushed (discouraged — coordinate with team, communicate clearly):

```bash
git tag -d v1.2.0
git push origin --delete v1.2.0
git tag -a v1.2.0 <correct-commit> -m "chore(release): v1.2.0 (corrected)"
git push origin v1.2.0
```

> ⚠️ Others who already fetched the old tag will need to: `git tag -d v1.2.0 && git fetch origin tag v1.2.0`

---

## Complete Release Workflow

### Patch Release (v1.2.1 → fixing bugs only)

```bash
# 1. Ensure main is up to date
git switch main
git pull

# 2. Optional: create release branch for cherry-picks
git switch -c release/1.2.1

# 3. Cherry-pick bug fixes if needed
git cherry-pick abc1234

# 4. Update version in package files
# package.json, pyproject.toml, Cargo.toml, etc.
# - manually or with tool: npm version patch, poetry version patch

# 5. Update CHANGELOG.md (see below)

# 6. Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore(release): v1.2.1"

# 7. Create annotated tag
git tag -a v1.2.1 -m "chore(release): v1.2.1"

# 8. Merge release branch back to main (if used)
git switch main
git merge --no-ff release/1.2.1
git branch -d release/1.2.1

# 9. Push commits and tags
git push origin main
git push origin v1.2.1
```

### Minor Release (v1.2.0 → new features)

```bash
git switch main && git pull

# Prepare release
npm version minor            # auto-bumps, commits, tags (Node.js projects)
# or manual steps as above

git push origin main --tags
```

### Major Release (v2.0.0 → breaking changes)

```bash
git switch main && git pull

# Prepare release
npm version major
# or manual steps

git push origin main --tags

# Optionally maintain a v1 branch for LTS
git switch -c v1-maintenance v1.0.0
git push -u origin v1-maintenance
```

---

## CHANGELOG.md Format (Keep a Changelog)

Follow [keepachangelog.com](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.2.0] - 2026-04-13

### Added
- User profile avatars (#245)
- Dark mode support (#251)

### Changed
- API responses now return ISO 8601 dates

### Fixed
- Correct cart total when discounts applied (#267)
- Prevent duplicate email registration (#271)

### Security
- Upgraded dependency X to patch CVE-2026-1234

## [1.1.0] - 2026-02-01

### Added
- Export to CSV feature (#198)

[Unreleased]: https://github.com/org/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/org/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/org/repo/compare/v1.0.0...v1.1.0
```

### Sections

| Section | Contains |
|---------|---------|
| `Added` | New features |
| `Changed` | Changes to existing functionality |
| `Deprecated` | Features to be removed in future |
| `Removed` | Removed features |
| `Fixed` | Bug fixes |
| `Security` | Security patches or CVEs |

---

## Auto-Generating CHANGELOG from Commits

If your project uses Conventional Commits, tools exist to auto-generate CHANGELOGs:

```bash
# conventional-changelog-cli (Node.js)
npx conventional-changelog-cli -p angular -i CHANGELOG.md -s

# release-please (Google, creates a PR automatically)
# commitlint + semantic-release (fully automated)
npx semantic-release
```

---

## Finding a Good Tag to Reference

```bash
# The most recent annotated tag reachable from HEAD
git describe --tags

# Most recent tag (any)
git describe --tags --abbrev=0

# Tags on a specific commit
git tag --points-at abc1234

# Tags containing a specific commit
git tag --contains abc1234
```
