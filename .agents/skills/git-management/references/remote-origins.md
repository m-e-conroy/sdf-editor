# Remote Origins Management

---

## Initializing a Repository

### Create a new local repository
```bash
mkdir my-project && cd my-project
git init
git init -b main           # set default branch to 'main' (Git 2.28+)
```

### Clone an existing repository
```bash
# HTTPS
git clone https://github.com/org/repo.git

# SSH (recommended for read/write)
git clone git@github.com:org/repo.git

# Clone into a custom directory name
git clone git@github.com:org/repo.git my-local-name

# Clone a specific branch
git clone -b develop git@github.com:org/repo.git

# Shallow clone (last N commits only — faster for large repos)
git clone --depth 1 git@github.com:org/repo.git

# Clone only a specific tag
git clone --depth 1 --branch v2.0.0 git@github.com:org/repo.git
```

---

## Listing Remotes

```bash
# List remote names
git remote

# List remotes with URLs
git remote -v

# Detailed info: tracked branches, push/pull status
git remote show origin
git remote show upstream
```

---

## Adding Remotes

```bash
# Add the standard 'origin' remote
git remote add origin git@github.com:org/repo.git

# Add multiple remotes (common for open-source forks)
git remote add origin   git@github.com:your-fork/repo.git
git remote add upstream git@github.com:original-org/repo.git

# Add a remote that only tracks a specific branch
git remote add -t main origin git@github.com:org/repo.git

# Add and fetch immediately
git remote add -f staging git@github.com:org/staging.git
```

---

## Changing Remote URLs

```bash
# Change the URL of 'origin'
git remote set-url origin git@github.com:new-org/new-repo.git

# Switch from HTTPS to SSH
git remote set-url origin git@github.com:org/repo.git

# Switch from SSH to HTTPS
git remote set-url origin https://github.com/org/repo.git

# Verify the change
git remote -v
```

---

## Renaming and Removing Remotes

```bash
# Rename a remote
git remote rename origin upstream
git remote rename old-name new-name

# Remove a remote
git remote remove upstream
git remote rm upstream

# Verify
git remote -v
```

---

## Fetching, Pulling, Pushing

```bash
# Fetch from all remotes (update remote-tracking branches)
git fetch --all
git fetch origin
git fetch --prune          # also remove stale remote-tracking refs

# Pull (fetch + merge)
git pull origin main

# Pull with rebase (cleaner history)
git pull --rebase origin main

# Push current branch to its upstream
git push

# Push and set upstream tracking
git push -u origin feature/my-feature

# Push a specific local branch to a remote branch
git push origin local-branch:remote-branch

# Push all local branches
git push origin --all

# Push all tags
git push origin --tags

# Force push (after history rewrite — use carefully)
# ⚠️ Only on branches you own and haven't shared
git push --force-with-lease origin feature/my-feature   # safer
git push --force origin feature/my-feature              # dangerous
```

---

## Syncing a Fork with Upstream

```bash
# One-time setup: add upstream remote
git remote add upstream git@github.com:original-org/repo.git

# Sync your fork's main with upstream
git fetch upstream
git switch main
git merge upstream/main              # or: git rebase upstream/main
git push origin main                 # update your fork on GitHub
```

---

## Working with Multiple Remotes

```bash
# Push to both origin and backup simultaneously
git remote set-url --add origin git@backup-host:org/repo.git

# Push to a specific remote
git push backup main

# Fetch from upstream, push to origin (fork workflow)
git fetch upstream
git rebase upstream/main
git push origin main
```

---

## SSH vs HTTPS

| | SSH | HTTPS |
|--|-----|-------|
| Auth | SSH key (no password prompts) | Username/password or token |
| URL format | `git@github.com:org/repo.git` | `https://github.com/org/repo.git` |
| Recommended for | Regular contributors | CI/CD, one-off clones |
| Credential caching | None needed (key agent) | Use credential helper |

### Check current auth method

```bash
git remote -v               # look at URL format
```

### Configure credential helper (HTTPS)

```bash
# macOS
git config --global credential.helper osxkeychain

# Windows
git config --global credential.helper manager

# Linux (cache in memory for 1 hour)
git config --global credential.helper "cache --timeout=3600"
```

---

## Git Configuration Essentials

```bash
# Set user identity
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Set default branch name for new repos
git config --global init.defaultBranch main

# Enable color UI
git config --global color.ui auto

# Set default editor
git config --global core.editor "code --wait"   # VS Code
git config --global core.editor vim

# Set diff/merge tool
git config --global diff.tool vscode
git config --global merge.tool vscode

# Show current config
git config --list
git config --list --global
git config --list --local           # repo-specific
```

---

## Setting Up a New Repo with Remote (Full Flow)

```bash
# 1. Create local repo
mkdir my-project && cd my-project
git init -b main

# 2. Create initial files
echo "# My Project" > README.md
echo "node_modules/" > .gitignore

# 3. Initial commit
git add .
git commit -m "chore: initial project setup"

# 4. Add remote (created on GitHub/GitLab first)
git remote add origin git@github.com:org/my-project.git

# 5. Push and set tracking
git push -u origin main

# 6. Verify
git remote -v
git branch -vv
```

---

## Diagnosing Remote Issues

```bash
# Test SSH connection to GitHub
ssh -T git@github.com

# Verify remote URL
git remote get-url origin

# Check network reachability
git ls-remote origin

# Debug push/fetch
GIT_TRACE=1 git fetch origin
GIT_SSH_COMMAND="ssh -v" git push origin main
```
