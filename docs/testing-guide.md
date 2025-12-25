# Programmatic Testing & Debugging Guide

This guide shows how AI agents (and developers) can programmatically test and debug changes in this project.

## Available Testing Methods

### 1. **Next.js MCP Tools** (Recommended for Next.js projects)

The project has Next.js MCP (Model Context Protocol) tools enabled. These can be used to:

- **Check for errors**: `nextjs_call` with `get_errors` tool
- **List routes**: `nextjs_call` with `get_routes` tool  
- **Get page metadata**: `nextjs_call` with `get_page_metadata` tool
- **Check logs**: `nextjs_call` with `get_logs` tool

**Example Usage:**
```typescript
// Check for compilation/runtime errors
mcp_next-devtools_nextjs_call({
  port: "3000",
  toolName: "get_errors"
})

// List all routes
mcp_next-devtools_nextjs_call({
  port: "3000", 
  toolName: "get_routes"
})
```

### 2. **API Testing via Terminal Commands**

Test API endpoints directly using `curl` or `fetch`:

```bash
# Test sync endpoint
curl -X POST http://localhost:3000/api/crm/sync \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

# Test with authentication (if needed)
curl -X POST http://localhost:3000/api/crm/sync \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -w "\nHTTP Status: %{http_code}\n"
```

**Or use the test script:**
```bash
bun scripts/test-sync-api.ts
```

### 3. **Browser Automation** (UI Testing)

Use Playwright browser automation to test UI interactions:

```typescript
// Start browser
mcp_next-devtools_browser_eval({
  action: "start",
  headless: true
})

// Navigate to page
mcp_next-devtools_browser_eval({
  action: "navigate",
  url: "http://localhost:3000/dashboard/crm/contacts"
})

// Click sync button
mcp_next-devtools_browser_eval({
  action: "click",
  element: "Sync Now button",
  ref: "button-ref-from-snapshot"
})

// Check console messages
mcp_next-devtools_browser_eval({
  action: "console_messages",
  errorsOnly: true
})
```

**Note**: Requires Playwright installation. Install with:
```bash
bunx playwright install
```

### 4. **Unit/Integration Tests** (Bun Test)

The project uses Bun's test framework. Create test files:

```typescript
// lib/sync/import.test.ts
import { test, expect } from "bun:test";
import { syncContactsFromNotion } from "./import";

test("syncContactsFromNotion handles missing env vars", async () => {
  // Temporarily remove env vars
  const originalKey = process.env.NOTION_API_KEY;
  delete process.env.NOTION_API_KEY;
  
  const result = await syncContactsFromNotion();
  expect(result.success).toBe(false);
  expect(result.error).toContain("NOTION_API_KEY");
  
  // Restore
  process.env.NOTION_API_KEY = originalKey;
});
```

Run tests:
```bash
bun test                    # Run all tests
bun test --watch           # Watch mode
bun test lib/sync/import.test.ts  # Run specific test
```

### 5. **Log Monitoring**

Monitor logs in real-time:

```bash
# Server logs (Next.js dev server)
tail -f .cursor/tmp/runner.log

# Check for errors
grep -i error .cursor/tmp/runner.log

# Database logs (if using Docker)
bun run docker:logs
```

### 6. **Debug Utilities**

The project includes debug utilities (`lib/debug.ts`) that only log in development:

```typescript
import { debug, debugError, debugTime } from "@/lib/debug";

// These automatically disable in production
debug({ component: "Sync" }, "Starting sync");
debugError({ component: "Sync" }, error);
debugTime("syncOperation");
```

## Testing Workflow Example

Here's a complete workflow for testing the Notion sync:

### Step 1: Check for Errors
```typescript
// Use Next.js MCP to check for compilation errors
const errors = await mcp_next-devtools_nextjs_call({
  port: "3000",
  toolName: "get_errors"
});
```

### Step 2: Test API Endpoint
```bash
# Quick test
curl -X POST http://localhost:3000/api/crm/sync

# Or use test script
bun scripts/test-sync-api.ts
```

### Step 3: Verify Error Handling
```typescript
// Test with missing env vars
const result = await fetch("/api/crm/sync", { method: "POST" });
const data = await result.json();

// Verify error format
expect(data.success).toBe(false);
expect(data.error).toBeDefined();
expect(data.details).toBeDefined();
```

### Step 4: Test UI (Browser Automation)
```typescript
// Navigate to contacts page
browser_navigate({ url: "http://localhost:3000/dashboard/crm/contacts" });

// Click sync button
browser_click({ element: "Sync Now button", ref: "..." });

// Check for toast notifications
browser_snapshot(); // Check if error toast appears
```

### Step 5: Check Logs
```bash
# Verify debug logs
tail -f .cursor/tmp/runner.log | grep -i "sync"
```

## Automated Test Scripts

### Test Sync API (`scripts/test-sync-api.ts`)

```bash
bun scripts/test-sync-api.ts
```

Tests:
- ✅ API endpoint responds
- ✅ Error handling works correctly
- ✅ Response format is correct
- ✅ Error messages are user-friendly

### Test Database Connection (`lib/db-connection.test.ts`)

```bash
bun lib/db-connection.test.ts
```

Tests:
- ✅ Database connection works
- ✅ Prisma Client is functional

## Best Practices

1. **Always check errors first** using Next.js MCP `get_errors`
2. **Test error cases** - missing env vars, invalid API keys, etc.
3. **Verify error messages** are user-friendly and actionable
4. **Check logs** for detailed debugging information
5. **Use browser automation** for UI testing when possible
6. **Create reusable test scripts** for common operations

## Debugging Tips

- **Check `.cursor/tmp/runner.log`** for server-side errors
- **Use browser DevTools** for client-side debugging (via browser automation)
- **Enable debug logging** using `lib/debug.ts` utilities
- **Monitor network requests** using browser automation's `network_requests` action
- **Check console messages** using `console_messages` action

## Example: Testing Sync Error Handling

```typescript
// 1. Test with missing NOTION_API_KEY
delete process.env.NOTION_API_KEY;
const result1 = await syncContactsFromNotion();
expect(result1.success).toBe(false);
expect(result1.error).toContain("NOTION_API_KEY");

// 2. Test with invalid database ID
process.env.NOTION_API_KEY = "secret_test";
process.env.NOTION_DATABASE_ID = "invalid";
const result2 = await syncContactsFromNotion();
expect(result2.success).toBe(false);

// 3. Test API endpoint error handling
const response = await fetch("/api/crm/sync", { method: "POST" });
const data = await response.json();
expect(response.status).toBe(400); // Should be 400 for config errors
expect(data.error).toBeDefined();
expect(data.details).toBeDefined();
```
