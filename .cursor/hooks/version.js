#!/usr/bin/env node

// version.js - Example hook demonstrating exit code logging
// This script is called by Cursor's afterFileEdit hook

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up logging
const LOG_DIR = join(__dirname, "..", "tmp");
const LOG_FILE = join(LOG_DIR, "hooks.log");

// Ensure log directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

// Log function that writes to both stderr and log file
function log(message) {
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
  const logMessage = `[${timestamp}] ${message}`;
  console.error(logMessage);

  try {
    writeFileSync(LOG_FILE, `${logMessage}\n`, { flag: "a" });
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
  }
}

// Read JSON input from stdin
let jsonInput;
try {
  const stdin = readFileSync(0, "utf-8");
  jsonInput = JSON.parse(stdin);
} catch (error) {
  log(`Error reading stdin: ${error.message}`);
  process.exit(0);
}

// Extract the file path from the JSON input
const filePath = jsonInput?.file_path || "";

// If file_path is not available or empty, exit successfully
if (!filePath) {
  process.exit(0);
}

// Get the workspace root
const workspaceRoot = jsonInput?.workspace_roots?.[0] || process.cwd();

// Only process package.json files
if (!filePath.includes("package.json")) {
  process.exit(0);
}

// Example: Check if version field exists in package.json
let exitCode = 2;

try {
  const packageJsonPath = join(workspaceRoot, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  if (packageJson.version) {
    log(`✓ package.json version: ${packageJson.version}`);
    exitCode = 0; // Success
  } else {
    log("⚠️  package.json is missing version field");
    exitCode = 2; // Exit with code 2 to signal an issue
  }
} catch (error) {
  log(`Error reading package.json: ${error.message}`);
  exitCode = 1; // Exit with code 1 for errors
}

// Log the exit code before exiting
log(`Hook exiting with code: ${exitCode}`);

// Exit with the determined code
process.exit(exitCode);
