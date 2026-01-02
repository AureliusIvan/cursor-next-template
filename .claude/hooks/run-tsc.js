#!/usr/bin/env bun

const { execSync } = require("child_process");
const path = require("path");

// Read hook input from stdin
let input = "";
const chunks = [];

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => chunks.push(chunk));
process.stdin.on("end", () => {
  input = chunks.join("");
  run();
});

function run() {
  try {
    const data = JSON.parse(input);
    const filePath = data?.tool_input?.file_path;

    // Only run tsc for TypeScript files (exclude .d.ts)
    if (!filePath || !filePath.endsWith(".ts") || filePath.endsWith(".d.ts")) {
      process.exit(0);
    }

    // Skip files in node_modules
    if (filePath.includes("node_modules")) {
      process.exit(0);
    }

    const projectDir = process.env.CLAUDE_PROJECT_DIR;
    if (!projectDir) {
      console.log("CLAUDE_PROJECT_DIR not set, skipping TypeScript check");
      process.exit(0);
    }

    process.chdir(projectDir);

    const relativePath = path.relative(projectDir, filePath);
    console.log(`[TSC Hook] Checking: ${relativePath}`);

    try {
      // Run tsc with noEmit to check types without generating output
      // Only check the specific file, skip lib check for speed
      execSync(`bunx tsc --noEmit --skipLibCheck "${filePath}"`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      console.log(`[TSC Hook] ✓ TypeScript check passed: ${relativePath}`);
      process.exit(0);
    } catch (tscError) {
      const output = tscError.stdout || tscError.stderr || tscError.message;

      // Filter out node_modules errors - only show errors from project files
      const lines = output.split("\n");
      const projectErrors = lines.filter(
        (line) => !line.includes("node_modules/") && line.trim() !== ""
      );

      if (projectErrors.length === 0) {
        // All errors were from node_modules, consider it passing
        console.log(`[TSC Hook] ✓ TypeScript check passed: ${relativePath} (ignored node_modules errors)`);
        process.exit(0);
      }

      console.error(`[TSC Hook] ✗ TypeScript errors in: ${relativePath}`);
      console.error(projectErrors.join("\n"));
      process.exit(2); // Exit code 2 shows error to Claude
    }
  } catch (parseError) {
    // JSON parse error or other issue - skip check
    console.log("[TSC Hook] Could not parse input, skipping check");
    process.exit(0);
  }
}
