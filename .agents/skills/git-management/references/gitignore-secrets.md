# .gitignore Management & Secret Scanning

---

## .gitignore Pattern Format

| Pattern | Matches |
|---------|---------|
| `*.log` | All `.log` files anywhere in tree |
| `build/` | The `build/` directory anywhere |
| `/build/` | Only the root-level `build/` directory |
| `**/logs` | `logs/` directory anywhere in tree |
| `!important.log` | Re-include a previously excluded file |
| `*.py[cod]` | `.pyc`, `.pyo`, `.pyd` |
| `doc/frotz/` | Directory `doc/frotz` but not `a/doc/frotz` |
| `doc/**/*.txt` | All `.txt` files under `doc/` recursively |

**Key rules:**
- Blank lines = separators (ignored)
- Lines starting with `#` = comments
- Trailing spaces are ignored unless escaped with `\`
- `!` negates a pattern (re-include after exclusion)
- A `**` in the middle matches zero or more directories
- Patterns without a `/` match anywhere in the tree

---

## Standard .gitignore Sections

### Universal Template

```gitignore
# ==========================================
# SECRETS & CREDENTIALS  ← ALWAYS FIRST
# ==========================================
.env
.env.*
.env.local
.env.development
.env.test
.env.production
.env.staging
*.pem
*.key
*.p12
*.pfx
*.cert
*.crt
*_rsa
*_rsa.pub
*_ed25519
*_ed25519.pub
id_rsa
id_rsa.pub
secrets.json
secrets.yaml
secrets.yml
credentials.json
service-account*.json
*serviceaccount*.json

# ==========================================
# OPERATING SYSTEM
# ==========================================
# macOS
.DS_Store
.AppleDouble
.LSOverride
._*
.Spotlight-V100
.Trashes

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/

# Linux
*~
.fuse_hidden*
.directory

# ==========================================
# EDITORS & IDEs
# ==========================================
.vscode/
!.vscode/extensions.json
!.vscode/settings.json  # optional: include team settings
.idea/
*.swp
*.swo
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# ==========================================
# BUILD OUTPUTS
# ==========================================
dist/
build/
out/
.output/
*.min.js
*.min.css

# ==========================================
# DEPENDENCIES
# ==========================================
node_modules/
vendor/
.venv/
venv/
__pycache__/
*.py[cod]
*.egg-info/

# ==========================================
# LOGS & TEMP
# ==========================================
*.log
logs/
tmp/
temp/
.temp/
*.tmp
*.cache
.cache/
```

---

## Language-Specific Patterns

### Node.js / JavaScript
```gitignore
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.eslintcache
.parcel-cache
.next/
.nuxt/
.vite/
dist/
coverage/
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### Python
```gitignore
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.venv
venv/
ENV/
.pytest_cache/
.coverage
htmlcov/
.tox/
```

### Java / Maven / Gradle
```gitignore
*.class
*.jar
*.war
*.ear
*.nar
hs_err_pid*
target/
.gradle/
build/
```

---

## Stopping Tracking a File Already Committed

If a file was accidentally committed (e.g., `.env`):

```bash
# Step 1: Remove from index (stop tracking), keep local copy
git rm --cached .env
git rm --cached -r build/     # for directories

# Step 2: Add to .gitignore
echo ".env" >> .gitignore

# Step 3: Commit the removal
git commit -m "security: stop tracking .env file

Added .env to .gitignore to prevent accidental credential exposure.
IMPORTANT: Rotate any credentials that were committed."

# Step 4: If already pushed to remote, rotate ALL exposed secrets immediately
```

### If the Secret Is in Git History

**If NOT yet pushed to a shared branch:**
```bash
# Remove from last commit
git rm --cached .env
git commit --amend --no-edit
```

**If pushed and history must be rewritten** (advanced — coordinate with team):
```bash
# Using git-filter-repo (recommended over filter-branch)
pip install git-filter-repo
git filter-repo --path .env --invert-paths

# Force push (requires team coordination)
git push origin --force --all
git push origin --force --tags
```

> ⚠️ **Always rotate/revoke any exposed credentials immediately**, regardless of history rewriting. History rewrites do not protect secrets that may have been seen, cached, or forked.

---

## Secret Scanning

### Manual Quick Scan (Pre-Commit)

```bash
# Scan staged changes for common secret patterns
git diff --cached | grep -iE \
  "(password|passwd|secret|api[_-]?key|token|private[_-]?key|auth|bearer|credential)"

# Scan all tracked files in the repo
git grep -iE "(password|passwd|secret|api[_-]?key|token|private[_-]?key)" -- '*.js' '*.ts' '*.py' '*.json' '*.yaml' '*.yml'

# Find files with high-entropy strings (potential secrets)
grep -rE "[A-Za-z0-9+/]{40,}={0,2}" --include="*.json" --include="*.yaml" .
```

### Common Secret Patterns to Detect

| Service | Pattern | Example |
|---------|---------|---------|
| AWS Access Key | `AKIA[0-9A-Z]{16}` | `AKIAIOSFODNN7EXAMPLE` |
| AWS Secret Key | `[0-9a-zA-Z/+]{40}` in AWS context | |
| GitHub Token (classic) | `ghp_[A-Za-z0-9]{36}` | `ghp_abc123...` |
| GitHub OAuth | `gho_[A-Za-z0-9]{36}` | |
| GitHub Actions | `ghs_[A-Za-z0-9]{36}` | |
| Stripe Live Key | `sk_live_[A-Za-z0-9]{24,}` | |
| Stripe Test Key | `sk_test_[A-Za-z0-9]{24,}` | |
| Google API Key | `AIza[0-9A-Za-z\-_]{35}` | |
| Slack Token | `xox[baprs]-[0-9A-Za-z]{10,250}` | |
| Twilio | `SK[0-9a-fA-F]{32}` | |
| RSA Private Key | `-----BEGIN RSA PRIVATE KEY-----` | |
| Generic JWT | `ey[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?` | |
| Database URL | `(postgres|mysql|mongodb)://\S+:\S+@` | |

### Automated Tools (Highly Recommended)

```bash
# gitleaks — detect secrets in git repos (fast, production-quality)
# Install: https://github.com/gitleaks/gitleaks
gitleaks detect --source . --verbose
gitleaks protect --staged        # scan staged files pre-commit

# truffleHog — scans git history for secrets
# Install: pip install trufflehog
trufflehog git file://. --only-verified

# detect-secrets (Yelp, baseline-based)
# Install: pip install detect-secrets
detect-secrets scan > .secrets.baseline
detect-secrets audit .secrets.baseline
```

### Pre-Commit Hook for Secret Detection

Create `.git/hooks/pre-commit` (chmod +x):

```bash
#!/bin/sh
# Block commits if common secret patterns are found in staged files

PATTERNS="(password\s*=|passwd\s*=|secret\s*=|api_key\s*=|apikey\s*=|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|sk_live_|-----BEGIN (RSA |EC )?PRIVATE KEY-----)"

if git diff --cached --name-only | xargs grep -lE "$PATTERNS" 2>/dev/null; then
  echo ""
  echo "ERROR: Potential secrets detected in staged files."
  echo "Review the above files before committing."
  echo "To bypass (use carefully): git commit --no-verify"
  echo ""
  exit 1
fi
```

---

## Checking What's Currently Ignored

```bash
# Check if a specific file is ignored and why
git check-ignore -v path/to/file.env

# List all ignored files
git ls-files --others --ignored --exclude-standard

# Test a pattern manually
git check-ignore -v --no-index .env
```

---

## Global .gitignore (Personal, Cross-Repo)

```bash
# Create a global ignore file for your OS/editor files
git config --global core.excludesFile ~/.gitignore_global

# Add entries to it
cat >> ~/.gitignore_global << 'EOF'
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*.swo
EOF
```
