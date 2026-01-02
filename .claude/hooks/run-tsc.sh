#!/bin/bash

# Read hook input from stdin
INPUT=$(cat)

# Extract file path from the Write/Edit tool input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run tsc for TypeScript files (exclude .d.ts)
if [[ "$FILE_PATH" == *.ts ]] && [[ "$FILE_PATH" != *.d.ts ]]; then
  cd "$CLAUDE_PROJECT_DIR" || exit 0

  # Run tsc with noEmit to check types without generating output
  OUTPUT=$(bun run tsc --noEmit "$FILE_PATH" 2>&1)
  STATUS=$?

  if [ $STATUS -eq 0 ]; then
    echo "TypeScript check passed: $FILE_PATH"
    exit 0
  else
    echo "$OUTPUT" >&2
    exit 2  # Exit code 2 shows error to Claude
  fi
fi

exit 0
