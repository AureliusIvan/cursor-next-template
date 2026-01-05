#!/bin/bash

# beads-start-work.sh - Interactive work session starter
# Syncs issues, displays status, and helps select issue to work on

# Set up logging
LOG_DIR=".cursor/tmp"
LOG_FILE="$LOG_DIR/hooks.log"
mkdir -p "$LOG_DIR"

# Log function that writes to both stderr and log file
log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] [beads-start-work] $*" | tee -a "$LOG_FILE" >&2
}

log "Starting work session..."

echo "🔄 Syncing beads issues..."
if bd sync --pull; then
  echo "✓ Synced successfully"
else
  echo "⚠ Sync completed with warnings"
fi

echo ""
echo "📋 Current Status:"
echo ""
echo "=== Open Issues ==="
bd list --open

echo ""
echo "=== In Progress ==="
bd list --status in_progress || echo "No issues in progress"

echo ""
echo "=== Ready Issues ==="
bd list --status ready || echo "No ready issues"

echo ""
echo "💡 Next steps:"
echo "  1. Read .beads/issues.jsonl to understand issue details"
echo "  2. Check dependencies: bd show <issue-id>"
echo "  3. Start work: bd update <issue-id> --status in_progress"

log "Work session started"
