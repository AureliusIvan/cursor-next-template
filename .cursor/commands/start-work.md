# Starting Work Session

This command helps you start a work session with proper beads issue tracking integration.

## Standard Workflow

### 1. Sync Issues
```bash
bd sync --pull
```
Pull latest issues from remote repository.

### 2. Read Current State
Read `.beads/issues.jsonl` to understand:
- Open issues and their status
- Dependencies between issues
- Priorities and labels
- Issue descriptions

### 3. Identify Work
Find issues with status `ready` or `open` where all dependencies are `closed`.

### 4. Prioritize
Sort by priority: `critical` > `high` > `normal` > `low`

### 5. Start Working
```bash
bd update <issue-id> --status in_progress
```

## Quick Commands

```bash
# Full sync (pull + push)
bd sync

# List open issues
bd list --open

# List ready issues
bd list --status ready

# List in-progress issues
bd list --status in_progress

# Show issue details
bd show <issue-id>

# Check dependencies
bd show <issue-id> | grep -i depend

# Start working on issue
bd update <issue-id> --status in_progress
```

## Helper Scripts

You can also use the helper scripts:

```bash
# Interactive work starter (syncs + shows status)
.cursor/hooks/beads-start-work.sh

# Show current status
.cursor/hooks/beads-status.sh

# Get context for AI
.cursor/hooks/beads-context.sh
```

## Best Practices

1. **Always sync first** - `bd sync --pull` ensures you have latest issues
2. **Check dependencies** - Only work on issues whose dependencies are `closed`
3. **Update status** - Mark issue as `in_progress` when starting
4. **Read descriptions** - Understand the issue fully before coding
5. **Create sub-issues** - Break down large tasks into smaller issues

## Example Session Start

```bash
# 1. Sync
bd sync --pull

# 2. List open issues
bd list --open

# 3. Read issue details
bd show cursor-next-template-r40

# 4. Check if dependencies are met
# (Read .beads/issues.jsonl to see dependencies)

# 5. Start working
bd update cursor-next-template-r40 --status in_progress
```
