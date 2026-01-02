#!/bin/bash

# validate-naming.sh - Enforces kebab-case naming convention for component files
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

# Only check component files (tsx/jsx files in components or app directories)
case "$relative_path" in
  *.tsx|*.jsx)
    ;;
  *)
    exit 0
    ;;
esac

# Skip if not in components or app directories
if [[ "$relative_path" != *"components"* ]] && [[ "$relative_path" != *"app"* ]]; then
  exit 0
fi

# Skip test files and node_modules
if [[ "$relative_path" == *"test"* ]] || \
   [[ "$relative_path" == *"node_modules"* ]] || \
   [[ "$relative_path" == *".test."* ]] || \
   [[ "$relative_path" == *".spec."* ]]; then
  exit 0
fi

# Extract filename without extension
filename=$(basename "$relative_path" | sed 's/\.[^.]*$//')

# Check if filename contains uppercase letters or underscores (not kebab-case)
if [[ "$filename" =~ [A-Z_] ]]; then
  # Suggest kebab-case version
  suggested_name=$(echo "$filename" | tr '[:upper:]' '[:lower:]' | tr '_' '-')
  log "⚠️  Component file should use kebab-case: $filename → $suggested_name"
fi

# Exit successfully (don't block agent operations)
exit 0
