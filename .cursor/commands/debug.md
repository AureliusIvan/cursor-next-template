# Debug Commands

## Quick Reference

| Resource | Location | Purpose |
|----------|----------|---------|
| Server logs | `.cursor/tmp/runner.log` | Next.js dev server output |
| Hooks log | `.cursor/tmp/hooks.log` | Cursor hooks execution log |
| Next.js MCP | `nextjs_call` tool | Runtime errors, routes, logs |

### Next.js MCP Commands

```typescript
// Check for compilation/runtime errors
mcp_next-devtools_nextjs_call({ port: "3000", toolName: "get_errors" })

// List all routes
mcp_next-devtools_nextjs_call({ port: "3000", toolName: "get_routes" })

// Get log file path
mcp_next-devtools_nextjs_call({ port: "3000", toolName: "get_logs" })
```

## Diagnostic Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| `diagnose-notion.ts` | Test Notion API connectivity and permissions | `bun scripts/diagnose-notion.ts` |
| `test-sync-api.ts` | Test sync API endpoint | `bun scripts/test-sync-api.ts` |
| `investigate-datasource.ts` | Debug Notion data source IDs | `bun scripts/investigate-datasource.ts` |

## Debugging Patterns

### API Errors

**Error Serialization**: Error objects don't serialize to JSON properly.
```typescript
// BAD: Returns {} in JSON
return { success: false, error }

// GOOD: Extract error details
return { 
  success: false, 
  error: error.message,
  details: { code: error.code, status: error.status }
}
```

**Test APIs Independently**: Create diagnostic scripts to isolate issues.
```typescript
// Test raw API without SDK
const response = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
```

### Environment Variables

- **Changes require server restart** - Stop and restart `bun dev`
- **Check actual values in logs** - Values might be stale or wrong
- **Multiple IDs cause confusion** - Verify you're using the correct one
- **URL formats vary** - Full URLs, slugs, UUIDs with/without hyphens

### SDK Breaking Changes

1. Check SDK version in `package.json`
2. Review SDK README/changelog for API changes
3. Create diagnostic scripts to test new API methods

**Example: Notion SDK 5.6.0 Breaking Change**
```typescript
// OLD (deprecated)
notion.databases.query({ database_id: id })

// NEW (required)
const db = await notion.databases.retrieve({ database_id: id });
const dataSourceId = db.data_sources[0].id;  // DIFFERENT from database_id!
notion.dataSources.query({ data_source_id: dataSourceId })
```

## Notion-Specific Issues

### Database ID vs Data Source ID (SDK 5.6.0+)

**Critical**: In Notion SDK 5.6.0+, `dataSources.query()` requires `data_source_id`, NOT `database_id`. These are different IDs!

```typescript
// Step 1: Get database
const database = await notion.databases.retrieve({ database_id: databaseId });

// Step 2: Extract data source ID (DIFFERENT from database ID!)
const dataSourceId = database.data_sources[0].id;

// Step 3: Query using data source ID
await notion.dataSources.query({ data_source_id: dataSourceId });
```

### Database ID Formats

| Format | Example |
|--------|---------|
| Full URL | `https://www.notion.so/workspace/2d493eb1e6d18093bda7cd0faa96a5ce?v=...` |
| URL slug | `Personal-CRM-2d393eb1e6d18094b716d2fc817db224` |
| UUID with hyphens | `2d493eb1-e6d1-8093-bda7-cd0faa96a5ce` |
| UUID without hyphens | `2d493eb1e6d18093bda7cd0faa96a5ce` |

**Extraction regex**: `/notion\.so\/[^/]+\/([a-zA-Z0-9-]+)(?:\?|$)/i`

### Integration Permissions

`object_not_found` often means the integration doesn't have access:

1. Open database in Notion
2. Click `...` menu (top right)
3. Click "Add connections" or "Connections"
4. Select your integration
5. Ensure "Read" permission is enabled

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `object_not_found` | Integration can't access resource | Share database with integration |
| `validation_error` | Wrong ID format or API method | Check ID format, verify API method |
| `unauthorized` | Invalid API key | Check `NOTION_API_KEY` in `.env` |

## Troubleshooting Flowchart

```
Sync fails
    │
    ▼
Check server logs (.cursor/tmp/runner.log)
    │
    ▼
Is error serialized properly? ──No──► Extract error.message, error.code
    │
    Yes
    ▼
What error code?
    │
    ├─► object_not_found
    │       │
    │       ▼
    │   Check integration permissions
    │       │
    │       ▼
    │   Still failing? ──► Check SDK version (database_id vs data_source_id)
    │
    ├─► validation_error
    │       │
    │       ▼
    │   Check ID format (URL, slug, UUID)
    │       │
    │       ▼
    │   Check API method (databases.query vs dataSources.query)
    │
    └─► unauthorized
            │
            ▼
        Check NOTION_API_KEY in .env
            │
            ▼
        Verify key at notion.so/my-integrations
```

## Browser Automation Testing

```typescript
// Start browser
mcp_next-devtools_browser_eval({ action: "start" })

// Navigate to page
mcp_next-devtools_browser_eval({ action: "navigate", url: "http://localhost:3000/..." })

// Take snapshot for element refs
mcp_next-devtools_browser_eval({ action: "snapshot" })

// Check console errors
mcp_next-devtools_browser_eval({ action: "console_messages", errorsOnly: true })
```

## Quick Debug Checklist

- [ ] Check `.cursor/tmp/runner.log` for server-side errors
- [ ] Run `bun scripts/diagnose-notion.ts` for API issues
- [ ] Verify environment variables are correct and server restarted
- [ ] Check error serialization (extract `.message`, `.code`)
- [ ] Verify SDK version and API method compatibility
- [ ] Test with raw fetch to bypass SDK
- [ ] Check integration permissions in Notion
