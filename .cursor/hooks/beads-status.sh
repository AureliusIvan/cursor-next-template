#!/bin/bash

# beads-status.sh - Show current beads issue status
# Displays open issues, in-progress issues, and priority breakdown

# Set up logging
LOG_DIR=".cursor/tmp"
LOG_FILE="$LOG_DIR/hooks.log"
mkdir -p "$LOG_DIR"

# Log function that writes to both stderr and log file
log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] [beads-status] $*" | tee -a "$LOG_FILE" >&2
}

log "Fetching beads status..."

echo ""
echo "=== Open Issues ==="
bd list --open

echo ""
echo "=== In Progress ==="
bd list --status in_progress || echo "No issues in progress"

echo ""
echo "=== Ready Issues ==="
bd list --status ready || echo "No ready issues"

log "Status display completed"
