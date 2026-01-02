#!/bin/bash

# validate-imports.sh - Validates import paths use @/ alias instead of relative imports
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

# Only check TypeScript/JavaScript files
case "$relative_path" in
  *.ts|*.tsx|*.js|*.jsx)
    ;;
  *)
    exit 0
    ;;
esac

# Skip test files and node_modules
if [[ "$relative_path" == *"test"* ]] || \
   [[ "$relative_path" == *"node_modules"* ]] || \
   [[ "$relative_path" == *".test."* ]] || \
   [[ "$relative_path" == *".spec."* ]]; then
  exit 0
fi

# Check for relative imports (../../ or ../)
if grep -qE "from ['\"](\.\.\/)+" "$relative_path" 2>/dev/null; then
  log "⚠️  Consider using @/ alias instead of relative imports in: $relative_path"
fi

# Exit successfully (don't block agent operations)
exit 0
