#!/bin/bash

# beads-context.sh - Output beads context for AI agent
# Provides JSON-formatted output of current issue state for AI context

# Set up logging
LOG_DIR=".cursor/tmp"
LOG_FILE="$LOG_DIR/hooks.log"
mkdir -p "$LOG_DIR"

# Log function that writes to both stderr and log file
log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] [beads-context] $*" | tee -a "$LOG_FILE" >&2
}

log "Generating beads context..."

# Check if bd supports JSON output
if bd list --open --json >/dev/null 2>&1; then
  echo "=== Open Issues (JSON) ==="
  bd list --open --json
  echo ""
  echo "=== In Progress (JSON) ==="
  bd list --status in_progress --json 2>/dev/null || echo "[]"
else
  # Fallback to text output
  echo "=== Open Issues ==="
  bd list --open
  echo ""
  echo "=== In Progress ==="
  bd list --status in_progress || echo "No issues in progress"
fi

log "Context generation completed"
