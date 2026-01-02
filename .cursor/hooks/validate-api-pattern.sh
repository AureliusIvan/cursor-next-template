#!/bin/bash

# validate-api-pattern.sh - Validates API route response patterns
# This script is called by Cursor's afterFileEdit hook

# Set up logging
LOG_DIR=".cursor/tmp"
LOG_FILE="$LOG_DIR/hooks.log"
mkdir -p "$LOG_DIR"

# Log function that writes to both stderr and log file
log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $*" | tee -a "$LOG_FILE" >&2
}

# Read JSON input from stdin
json_input=$(cat)

# Extract the file path from the JSON input
file_path=$(echo "$json_input" | jq -r '.file_path // empty')

# If file_path is not available or empty, exit successfully (don't fail the hook)
if [ -z "$file_path" ]; then
  exit 0
fi

# Get the workspace root (first workspace root from the JSON)
workspace_root=$(echo "$json_input" | jq -r '.workspace_roots[0] // empty')

# Change to workspace root if available, otherwise use current directory
if [ -n "$workspace_root" ]; then
  cd "$workspace_root" || exit 0
fi

# Convert absolute path to relative path if needed
if [ -n "$workspace_root" ] && [[ "$file_path" == "$workspace_root"* ]]; then
  relative_path="${file_path#$workspace_root/}"
else
  relative_path="$file_path"
fi

# Only check API route files
if [[ "$relative_path" != *"app/api"* ]] || [[ "$relative_path" != *"route.ts" ]]; then
  exit 0
fi

# Check if file exists
if [ ! -f "$relative_path" ]; then
  exit 0
fi

# Check for proper error handling pattern
if ! grep -qE "NextResponse\.json.*error" "$relative_path" 2>/dev/null; then
  log "ℹ️  API route should include error handling with NextResponse.json({ error: ... })"
fi

# Check for success pattern (informational, not blocking)
if ! grep -qE "NextResponse\.json.*success.*true" "$relative_path" 2>/dev/null; then
  # This is just informational, not an error
  if grep -qE "NextResponse\.json" "$relative_path" 2>/dev/null; then
    log "ℹ️  Consider using NextResponse.json({ success: true, data: ... }) pattern for consistency"
  fi
fi

# Exit successfully (don't block agent operations)
exit 0
