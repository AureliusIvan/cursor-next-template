# Using Beads in AI Agent Workflows

Beads is a git-backed issue tracker designed for AI-supervised coding workflows. It uses hash-based IDs to prevent collisions and syncs issues via JSONL files.

## Overview

Beads stores issues in `.beads/issues.jsonl` (git-tracked) and provides a CLI (`bd`) for managing them. The AI agent should read from and write to this file to track work progress.

**Key files:**
- `.beads/issues.jsonl` - Issue database (git-tracked, source of truth)
- `.beads/config.yaml` - Configuration file
- `.beads/beads.db` - SQLite database (git-ignored, auto-generated)

## AI Agent Workflow

### Create an Issue

```bash
bd create "Issue title" [description]
```

Examples:
```bash
bd create "Add user authentication"
bd create "Fix login bug" "Users cannot log in with email"
```

### List Issues

```bash
bd list                    # List all issues
bd list --open             # List only open issues
bd list --closed           # List only closed issues
bd list --label bug        # Filter by label
bd list --priority high    # Filter by priority
```

### View Issue Details

```bash
bd show <issue-id>
```

### Update Issue Status

```bash
bd update <issue-id> --status open          # Mark as open
bd update <issue-id> --status in_progress    # Mark as in progress
bd update <issue-id> --status ready          # Mark as ready
bd update <issue-id> --status done          # Mark as done
bd close <issue-id>                         # Close an issue
bd reopen <issue-id>                        # Reopen a closed issue
```

### Edit Issue

```bash
bd edit <issue-id>         # Opens editor to edit issue
```

### Dependencies

```bash
bd depends <issue-id> <dependency-id>
bd depends <issue-id> <dep1> <dep2> <dep3>  # Multiple dependencies
bd show <issue-id>                           # View dependencies
```

### Labels and Priorities

```bash
bd label <issue-id> <label-name>
bd label <issue-id> bug feature enhancement  # Multiple labels
bd priority <issue-id> <priority>            # low, normal, high, critical
```

### Syncing

```bash
bd sync                    # Sync with remote
bd sync --pull             # Pull changes only
bd sync --push             # Push changes only
```

## AI Agent Workflow

### 1. Starting a Session: Read and Understand Issues

**Always start by syncing and reading issues:**

```bash
bd sync                    # Pull latest issues from remote
bd list --open            # List all open issues
```

**Read `.beads/issues.jsonl` directly** to understand:
- Current open issues
- Dependencies between issues
- Priorities and labels
- Issue statuses (`open`, `ready`, `closed`)

**Key workflow:**
1. Read `.beads/issues.jsonl` to get current state
2. Identify issues with status `ready` or `open`
3. Check dependencies - only work on issues whose dependencies are `closed`
4. Prioritize by `priority` field (`critical` > `high` > `normal` > `low`)

### 2. Working on Issues

**When starting work on an issue:**

```bash
bd update <issue-id> --status in_progress  # Mark as in progress
```

**During work:**
- Read issue details: `bd show <issue-id>`
- Check dependencies: Ensure all dependencies are `closed`
- Update issue description if needed: `bd edit <issue-id>`

**When work is complete:**

```bash
bd update <issue-id> --status done        # Mark as done
bd close <issue-id>                       # Close the issue
```

### 3. Creating New Issues

**When breaking down work or identifying new tasks:**

```bash
bd create "Task: Description" "Optional detailed description"
bd label <issue-id> <label>              # Add labels (bug, feature, frontend, backend)
bd priority <issue-id> <priority>        # Set priority (low, normal, high, critical)
bd depends <issue-id> <dep-id>           # Set dependencies
```

**Best practices:**
- Create granular, actionable issues
- Set dependencies before starting work
- Use labels to categorize (`bug`, `feature`, `frontend`, `backend`, `api`, `ui`)
- Set appropriate priorities

### 4. Managing Dependencies

**Before working on an issue:**
1. Check dependencies: `bd show <issue-id>` shows dependency list
2. Verify all dependencies are `closed`
3. If dependencies are open, work on them first

**Setting up dependencies:**

```bash
bd create "Task: Add database schema"
bd create "Task: Implement API endpoint"
bd depends <api-endpoint-id> <schema-id>  # API depends on schema
```

### 5. Ending a Session: Sync Changes

**Before ending work:**

```bash
bd sync                    # Push changes to remote
```

**Critical:** Always sync before and after working with issues to ensure consistency.

### Complete Agent Workflow Example

```bash
# 1. Start session - sync and read issues
bd sync
bd list --open

# 2. Read .beads/issues.jsonl to understand current state
# Identify ready issues with closed dependencies

# 3. Start working on an issue
bd update <issue-id> --status in_progress

# 4. Work on the issue (implement code, fix bugs, etc.)

# 5. If creating sub-tasks during work
bd create "Sub-task: Specific task"
bd depends <parent-issue-id> <sub-task-id>

# 6. Complete the issue
bd update <issue-id> --status done
bd close <issue-id>

# 7. Sync changes
bd sync
```

## Reference: Essential Commands

### Create an Issue

```bash
bd create "Issue title" [description]
```

### List Issues

```bash
bd list                    # List all issues
bd list --open             # List only open issues
bd list --closed           # List only closed issues
bd list --label bug        # Filter by label
bd list --priority high    # Filter by priority
```

### View Issue Details

```bash
bd show <issue-id>
```

### Update Issue Status

```bash
bd update <issue-id> --status open          # Mark as open
bd update <issue-id> --status in_progress    # Mark as in progress
bd update <issue-id> --status ready          # Mark as ready
bd update <issue-id> --status done          # Mark as done
bd close <issue-id>                         # Close an issue
bd reopen <issue-id>                        # Reopen a closed issue
```

### Edit Issue

```bash
bd edit <issue-id>         # Opens editor to edit issue
```

### Dependencies

```bash
bd depends <issue-id> <dependency-id>
bd depends <issue-id> <dep1> <dep2> <dep3>  # Multiple dependencies
bd show <issue-id>                           # View dependencies
```

### Labels and Priorities

```bash
bd label <issue-id> <label-name>
bd label <issue-id> bug feature enhancement  # Multiple labels
bd priority <issue-id> <priority>            # low, normal, high, critical
```

### Syncing

```bash
bd sync                    # Sync with remote
bd sync --pull             # Pull changes only
bd sync --push             # Push changes only
```

## Issue Format (JSONL)

Issues in `.beads/issues.jsonl` follow this structure:

```json
{
  "id": "hash-based-id",
  "title": "Issue title",
  "description": "Optional description",
  "status": "open|in_progress|ready|done|closed",
  "created": "ISO 8601 timestamp",
  "updated": "ISO 8601 timestamp",
  "dependencies": ["dep-id-1", "dep-id-2"],
  "labels": ["label1", "label2"],
  "priority": "low|normal|high|critical"
}
```

**Agent should parse this JSONL directly** to understand issue state, dependencies, and priorities.

## Agent Best Practices

1. **Always sync at session start**: `bd sync` before reading issues
2. **Read `.beads/issues.jsonl` directly**: Parse JSONL to understand current state
3. **Respect dependencies**: Only work on issues whose dependencies are `closed`
4. **Update status during work**: Use `bd update --status in_progress` when starting
5. **Create granular issues**: Break large features into smaller, actionable tasks
6. **Set dependencies before starting**: Use `bd depends` to establish order
7. **Use labels consistently**: `bug`, `feature`, `frontend`, `backend`, `api`, `ui`
8. **Set priorities**: `critical` > `high` > `normal` > `low`
9. **Close issues when done**: `bd close <issue-id>` after completing work
10. **Sync at session end**: `bd sync` before finishing work

## Agent Workflow Patterns

### Pattern 1: Working Through Existing Issues

```bash
# Start session
bd sync
bd list --open

# Read .beads/issues.jsonl to find ready issues
# Check dependencies are closed

# Work on issue
bd update <issue-id> --status in_progress
# ... implement changes ...
bd update <issue-id> --status done
bd close <issue-id>

# End session
bd sync
```

### Pattern 2: Breaking Down a Large Task

```bash
# While working on an issue, identify sub-tasks
bd create "Sub-task: Specific implementation detail"
bd label <sub-task-id> frontend
bd depends <parent-issue-id> <sub-task-id>

# Continue with sub-task
bd update <sub-task-id> --status in_progress
# ... work ...
bd close <sub-task-id>

# Then continue with parent
bd update <parent-issue-id> --status in_progress
```

### Pattern 3: Bug Fixing Workflow

```bash
# Create bug issue
bd create "Bug: Description"
bd label <bug-id> bug
bd priority <bug-id> high

# Investigate and fix
bd update <bug-id> --status in_progress
# ... fix bug ...
bd close <bug-id>
bd sync
```

## Troubleshooting

### Issue not appearing
- Run `bd sync` to pull latest changes
- Check `.beads/issues.jsonl` file exists

### Dependency conflicts
- Use `bd show <issue-id>` to view dependency graph
- Ensure dependencies are closed before closing dependent issues

### Sync conflicts
- Beads uses git for syncing - resolve git conflicts normally
- JSONL format makes conflicts easier to resolve

## Additional Resources

- Beads repository: Check the main README for latest features
- Issue format: See `.beads/issues.jsonl` for examples
- Configuration: See `.beads/config.yaml` for settings
