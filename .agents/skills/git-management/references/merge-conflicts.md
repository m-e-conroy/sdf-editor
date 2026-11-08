# Merge Conflict Analysis & Resolution

---

## Understanding Conflict Markers

When a merge conflict occurs, Git marks the conflicted sections:

```
<<<<<<< HEAD
Your code on the current branch
=======
Their code from the branch being merged in
>>>>>>> feature/other-branch
```

### diff3 Style (shows common ancestor — recommended)

Enable with: `git config merge.conflictStyle diff3`

```
<<<<<<< HEAD
Your changes
||||||| base (common ancestor)
Original code before either branch changed it
=======
Their changes
>>>>>>> feature/other-branch
```

This is more informative — you can see what both sides changed FROM.

### zdiff3 Style (cleanest)

Enable with: `git config merge.conflictStyle zdiff3`

Similar to diff3 but removes matching lines from the conflict region, making it smaller and easier to read.

---

## Step-by-Step Conflict Resolution

### 1. Identify Conflicts

```bash
git status                         # shows "both modified" files
git diff                           # shows conflict markers in working tree
git ls-files -u                    # shows conflict stages: 1=base, 2=ours, 3=theirs
```

### 2. Understand What Each Side Changed

```bash
# See your version (HEAD)
git show :2:src/app.js

# See their version (incoming)
git show :3:src/app.js

# See the common ancestor
git show :1:src/app.js

# View the log that led to each change
git log --merge -p src/app.js
```

### 3. Resolve Each File

**Option A: Edit manually**
1. Open the conflicted file
2. Decide which code to keep (yours, theirs, or a combination)
3. Remove ALL conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
4. Save the file

**Option B: Accept one side entirely**
```bash
# Accept YOUR version for a file
git checkout --ours src/app.js

# Accept THEIR version for a file
git checkout --theirs src/app.js

# Then stage it
git add src/app.js
```

**Option C: Use a mergetool**
```bash
git mergetool                      # opens configured tool
git mergetool src/app.js           # specific file only

# Common tools: vscode, vimdiff, meld, kdiff3, opendiff
# Configure: git config merge.tool vscode
```

**VS Code as merge tool:**
```ini
# In ~/.gitconfig:
[merge]
    tool = vscode
[mergetool "vscode"]
    cmd = code --wait $MERGED
```

### 4. Stage Resolved Files

```bash
git add src/app.js                 # mark as resolved
git add .                          # stage all resolved files
```

### 5. Complete the Merge

```bash
git merge --continue               # preferred method
# or
git commit                         # if --continue is not available
```

### 6. Abort if Needed

```bash
git merge --abort                  # cancel and restore pre-merge state
```

---

## Merge Strategies

```bash
# Default: ort (3-way merge, best for two branches)
git merge feature/my-feature

# No fast-forward — always create a merge commit
git merge --no-ff feature/my-feature

# Squash all commits into one unstaged batch (great for clean history)
git merge --squash feature/my-feature
git commit -m "feat(auth): add OAuth2 flow"

# Fast-forward only (fail if not possible)
git merge --ff-only feature/my-feature

# Specific strategy
git merge -s ort feature/my-feature
git merge -s recursive feature/my-feature   # older alias

# Strategy options: auto-resolve entire file conflicts
git merge -X ours feature/my-feature        # prefer our version for conflicts
git merge -X theirs feature/my-feature      # prefer their version for conflicts
```

---

## Analyzing Branch Divergence Before Merging

```bash
# Check how far apart two branches are
git log --oneline feature/my-feature ^main  # commits in feature not in main
git log --oneline main ^feature/my-feature  # commits in main not in feature

# Visualize the divergence
git log --oneline --graph --all --decorate

# Find the merge base (common ancestor)
git merge-base main feature/my-feature

# Preview what files will conflict
git diff --name-only main...feature/my-feature

# Full three-way diff preview
git diff main...feature/my-feature
```

---

## Resolving Specific Conflict Types

### Binary File Conflicts

Binary files (images, PDFs, compiled artifacts) cannot be merged textually — you must choose one side:

```bash
# Keep your binary file
git checkout --ours path/to/image.png
git add path/to/image.png

# Keep their binary file
git checkout --theirs path/to/image.png
git add path/to/image.png
```

### Delete/Modify Conflicts

When one branch deleted a file and the other modified it:

```bash
# Accept the deletion
git rm path/to/deleted-file.js

# Keep the modified version
git checkout --ours path/to/deleted-file.js
git add path/to/deleted-file.js
```

### Both Added the Same File With Different Content

```bash
# View both versions
git show :2:new-file.js   # HEAD (ours)
git show :3:new-file.js   # MERGE_HEAD (theirs)

# Manually merge the file, then:
git add new-file.js
```

### Rename Conflicts

When both sides rename the same file differently:

```bash
git status                         # see the rename conflict
# Decide which name to use, then:
git add chosen-name.js
git rm other-name.js               # if they're separate files
```

---

## Preventing Future Conflicts

### Rebase Instead of Merge (Linear History)

```bash
# Keep feature branch up to date with main via rebasing
git switch feature/my-feature
git fetch origin
git rebase origin/main

# Interactive rebase to clean up before merging
git rebase -i origin/main
```

### Squash Before Merging

```bash
# Squash all feature commits into one clean commit
git switch main
git merge --squash feature/my-feature
git commit -m "feat(auth): complete OAuth2 implementation"
git branch -d feature/my-feature
```

### Configure Rerere (Reuse Recorded Resolution)

Git can remember how you resolved specific conflicts and apply the same resolution automatically next time:

```bash
# Enable rerere globally
git config --global rerere.enabled true

# After resolving, rerere records the resolution
# Next time the same conflict appears, it auto-applies
git rerere diff                    # see what rerere is about to apply
git rerere status                  # list recorded resolutions
```

---

## After Resolution: Verify

```bash
# No more conflict markers remain
grep -rn "<<<<<<\|=======\|>>>>>>>" src/

# Run tests
# npm test / python -m pytest / etc.

# Review the merge commit
git log --oneline -5
git show HEAD
```
