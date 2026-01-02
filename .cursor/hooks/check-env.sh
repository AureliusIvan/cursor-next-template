#!/bin/bash

# check-env.sh - Validates .env file matches .env.example
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

# Only check when .env or .env.example changes
if [[ "$relative_path" != *".env"* ]]; then
  exit 0
fi

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
  exit 0
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  log "⚠️  .env file not found. Create it from .env.example"
  exit 0
fi

# Extract variable names from .env.example (excluding comments and empty lines)
# Get variables that are defined (have = sign)
env_example_vars=$(grep -E '^[A-Z_]+=' .env.example 2>/dev/null | cut -d'=' -f1 | sort)
env_vars=$(grep -E '^[A-Z_]+=' .env 2>/dev/null | cut -d'=' -f1 | sort)

# Find missing variables
missing_vars=$(comm -23 <(echo "$env_example_vars") <(echo "$env_vars"))

if [ -n "$missing_vars" ]; then
  log "⚠️  Missing environment variables in .env:"
  echo "$missing_vars" | while read -r var; do
    log "   - $var"
  done
fi

# Exit successfully (don't block agent operations)
exit 0
