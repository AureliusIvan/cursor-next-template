#!/bin/bash

# prisma-generate.sh - Hook script that generates Prisma client when schema.prisma is edited
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

# Only process schema.prisma files
if [[ "$relative_path" != "prisma/schema.prisma" ]]; then
  exit 0
fi

# Run Prisma generate
log "Prisma schema changed, generating client..."
bun run db:generate 2>&1 | tee -a "$LOG_FILE" >&2 || true

# Exit successfully (don't block agent operations even if generation has warnings)
exit 0
