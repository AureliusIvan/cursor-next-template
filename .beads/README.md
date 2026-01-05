# Beads - AI-Native Issue Tracking

Welcome to Beads! This repository uses **Beads** for issue tracking - a modern, AI-native tool designed to live directly in your codebase alongside your code.

## What is Beads?

Beads is issue tracking that lives in your repo, making it perfect for AI coding agents and developers who want their issues close to their code. No web UI required - everything works through the CLI and integrates seamlessly with git.

**Learn more:** [github.com/steveyegge/beads](https://github.com/steveyegge/beads)

## Quick Start

### Essential Commands

```bash
# Create new issues
bd create "Add user authentication"

# View all issues
bd list

# View issue details
bd show <issue-id>

# Update issue status
bd update <issue-id> --status in_progress
bd update <issue-id> --status done

# Sync with git remote
bd sync
```

### Working with Issues

Issues in Beads are:
- **Git-native**: Stored in `.beads/issues.jsonl` and synced like code
- **AI-friendly**: CLI-first design works perfectly with AI coding agents
- **Branch-aware**: Issues can follow your branch workflow
- **Always in sync**: Auto-syncs with your commits

## Why Beads?

✨ **AI-Native Design**
- Built specifically for AI-assisted development workflows
- CLI-first interface works seamlessly with AI coding agents
- No context switching to web UIs

🚀 **Developer Focused**
- Issues live in your repo, right next to your code
- Works offline, syncs when you push
- Fast, lightweight, and stays out of your way

🔧 **Git Integration**
- Automatic sync with git commits
- Branch-aware issue tracking
- Intelligent JSONL merge resolution

## Get Started with Beads

Try Beads in your own projects:

```bash
# Install Beads
curl -sSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Initialize in your repo
bd init

# Create your first issue
bd create "Try out Beads"
```

## Cursor Integration

This repository has integrated Beads with Cursor AI workflows for seamless issue tracking.

### Quick Start Commands

Use these Cursor commands for common workflows:

- `/use-start-work` - Begin work session with beads sync
- `/use-end-work` - Complete session with sync and push
- `/use-beads-create-issue` - Create well-formatted issues
- `/use-beads` - Complete beads reference

### Helper Scripts

Run these scripts from the project root:

```bash
# Interactive work session starter
.cursor/hooks/beads-start-work.sh

# Show current issue status
.cursor/hooks/beads-status.sh

# Get context for AI agent
.cursor/hooks/beads-context.sh

# Sync issues with remote
.cursor/hooks/beads-sync.sh
```

### Workflow Integration

**Session Start:**
1. Run `bd sync --pull` to get latest issues
2. Read `.beads/issues.jsonl` to understand current state
3. Select issue to work on (check dependencies first)
4. Mark as in progress: `bd update <issue-id> --status in_progress`

**During Work:**
- Create sub-issues when breaking down tasks
- Update progress with notes: `bd update <issue-id> --notes "update"`
- Check dependencies before starting: `bd show <issue-id>`

**Session End:**
1. Close completed issues: `bd close <issue-id>`
2. Create issues for remaining work
3. Sync: `bd sync`
4. Git workflow: `git pull --rebase && bd sync && git add .beads/issues.jsonl && git commit && git push`

### Documentation

- **Agent Workflow**: See `AGENTS.md` for comprehensive beads integration
- **Issue Template**: See `.cursor/templates/issue-template.md` for issue creation guide
- **Commands**: See `.cursor/commands/` for detailed workflow documentation

## Learn More

- **Documentation**: [github.com/steveyegge/beads/docs](https://github.com/steveyegge/beads/tree/main/docs)
- **Quick Start Guide**: Run `bd quickstart`
- **Examples**: [github.com/steveyegge/beads/examples](https://github.com/steveyegge/beads/tree/main/examples)

---

*Beads: Issue tracking that moves at the speed of thought* ⚡
