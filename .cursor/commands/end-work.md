# Ending Work Session

This command helps you properly close out a work session with beads issue tracking.

## Standard Workflow

### 1. Update Issue Status

For completed work:
```bash
bd update <issue-id> --status done
bd close <issue-id>
```

For work in progress:
```bash
bd update <issue-id> --notes "Progress update: what was done"
```

### 2. Create Issues for Remaining Work

If you identified new tasks:
```bash
bd create "Task: Brief description" "Detailed description including:
- Problem statement
- Location (file paths, line numbers)
- Root cause analysis
- Proposed solution
- Files to modify"
```

Add labels and priority:
```bash
bd label <issue-id> bug|feature|frontend|backend|api|ui
bd priority <issue-id> low|normal|high|critical
```

### 3. Sync Issues
```bash
bd sync
```
This syncs with remote repository.

### 4. Git Workflow

```bash
# Pull latest changes
git pull --rebase

# Ensure beads are synced
bd sync

# Stage beads changes explicitly
git add .beads/issues.jsonl

# Commit with issue reference
git commit -m "feat: [issue-id] description of changes"

# Push to remote
git push
```

### 5. Verify

```bash
# Check git status
git status  # Should show "up to date with origin"

# Check open issues
bd list --open
```

## Complete Session End Checklist

- [ ] Update issue status (`done` or `closed`)
- [ ] Create issues for any remaining work
- [ ] Add notes to in-progress issues
- [ ] Sync beads: `bd sync`
- [ ] Pull latest git changes: `git pull --rebase`
- [ ] Stage beads changes: `git add .beads/issues.jsonl`
- [ ] Commit changes
- [ ] Push to remote: `git push`
- [ ] Verify: `git status` and `bd list --open`

## Quick Commands

```bash
# Close completed issue
bd close <issue-id>

# Update status
bd update <issue-id> --status done

# Add progress notes
bd update <issue-id> --notes "Completed X, Y remaining"

# Sync issues
bd sync

# Sync and push only
bd sync --push
```

## Helper Scripts

```bash
# Sync issues
.cursor/hooks/beads-sync.sh

# Show current status
.cursor/hooks/beads-status.sh
```

## Best Practices

1. **Always close completed issues** - Don't leave them open
2. **Create follow-up issues** - Track remaining work
3. **Add notes** - Document progress for next session
4. **Sync before git push** - Ensure beads are synced
5. **Stage beads file** - Explicitly add `.beads/issues.jsonl` to git
6. **Reference issues in commits** - Use `[issue-id]` in commit messages

## Example Session End

```bash
# 1. Close completed issue
bd close cursor-next-template-r40

# 2. Create follow-up issue
bd create "Task: Add error handling" "Add proper error handling to project form"
bd label <new-issue-id> feature frontend
bd priority <new-issue-id> normal

# 3. Sync
bd sync

# 4. Git workflow
git pull --rebase
git add .beads/issues.jsonl
git add <other-changed-files>
git commit -m "feat: [cursor-next-template-r40] Fix new project button"
git push

# 5. Verify
git status
bd list --open
```
