#!/bin/bash

# beads-sync.sh - Sync beads issues with remote repository
# This script syncs beads issues by pulling latest changes and pushing local changes

# Set up logging
LOG_DIR=".cursor/tmp"
LOG_FILE="$LOG_DIR/hooks.log"
mkdir -p "$LOG_DIR"

# Log function that writes to both stderr and log file
log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] [beads-sync] $*" | tee -a "$LOG_FILE" >&2
}

log "Starting beads sync..."

# Sync with remote (pull first, then push)
if bd sync; then
  log "✓ Beads sync completed successfully"
  exit 0
else
  log "✗ Beads sync failed"
  exit 1
fi
