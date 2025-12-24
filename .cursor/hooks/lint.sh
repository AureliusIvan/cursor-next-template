#!/bin/bash

# lint.sh - Hook script that runs lint:fix on files edited by Cursor agent
# This script is called by Cursor's afterFileEdit hook

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

# Run biome check --write on the edited file
# Using bun to run biome as specified in AGENTS.md
# Convert absolute path to relative path if needed
if [ -n "$workspace_root" ] && [[ "$file_path" == "$workspace_root"* ]]; then
  relative_path="${file_path#$workspace_root/}"
else
  relative_path="$file_path"
fi

# Run biome check --write on the specific file
bunx biome check --write "$relative_path" 2>&1 > /dev/null

# Exit successfully (don't block agent operations even if linting has warnings)
exit 0
