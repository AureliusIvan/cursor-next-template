# Notion Sync Troubleshooting Guide

## Error: `object_not_found: Could not find database with ID`

This error means the Notion API cannot find your database. Here's how to fix it:

### Step 1: Verify Your Database ID

1. **Open your Notion database** in a web browser
2. **Click the "..." menu** (three dots) in the top-right corner
3. **Click "Copy link"** or look at the URL in your browser
4. **Extract the database ID** from the URL:

   ```
   https://notion.so/workspace/2d393eb1e6d18094b716d2fc817db224?v=...
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    This is your database ID
   ```

5. **Update your `.env` file**:
   ```bash
   NOTION_DATABASE_ID="2d393eb1-e6d1-8094-b716-d2fc817db224"
   # OR without hyphens:
   NOTION_DATABASE_ID="2d393eb1e6d18094b716d2fc817db224"
   ```

   Both formats work - the code will normalize it automatically.

### Step 2: Share Database with Integration

**This is the most common cause of this error!**

1. **Open your Notion database**
2. **Click the "..." menu** (three dots) in the top-right corner
3. **Click "Add connections"** or "Connections"
4. **Select your Notion integration** from the list
   - If you don't see it, you may need to create one first at https://www.notion.so/my-integrations
5. **Ensure the integration has "Read" permissions** (or "Full access" for syncing)

### Step 3: Verify Integration Permissions

1. Go to https://www.notion.so/my-integrations
2. Click on your integration
3. Check the **"Capabilities"** section:
   - ✅ **Read content** - Required
   - ✅ **Read database** - Required (if available)
   - ✅ **Update content** - Optional (for two-way sync)

### Step 4: Verify API Key

Make sure your `NOTION_API_KEY` in `.env` is correct:

1. Go to https://www.notion.so/my-integrations
2. Click on your integration
3. Copy the **"Internal Integration Token"** (starts with `secret_`)
4. Update your `.env`:
   ```bash
   NOTION_API_KEY="secret_..."
   ```

### Step 5: Test the Connection

After updating your `.env` file:

1. **Restart your dev server**:
   ```bash
   # Stop the server (Ctrl+C) and restart
   bun dev
   ```

2. **Try syncing again** from the contacts page

3. **Check the error message** - it should now be more specific if there are other issues

## Common Issues

### Issue: Database ID Format

**Problem**: The database ID might be in a URL slug format like `Personal-CRM-2d393eb1e6d18094b716d2fc817db224`

**Solution**: The code automatically extracts the UUID part. Just use the full string or extract the UUID manually:
- Full: `Personal-CRM-2d393eb1e6d18094b716d2fc817db224`
- UUID only: `2d393eb1-e6d1-8094-b716-d2fc817db224`

### Issue: Integration Not Found

**Problem**: Your integration doesn't appear in the "Add connections" list

**Solution**:
1. Make sure you created the integration at https://www.notion.so/my-integrations
2. Copy the integration token to your `.env` file
3. Try sharing the database again

### Issue: Permission Denied

**Problem**: Integration doesn't have read permissions

**Solution**:
1. Go to https://www.notion.so/my-integrations
2. Edit your integration
3. Enable "Read content" capability
4. Re-share the database with the integration

## Still Having Issues?

1. **Check the server logs** (`.cursor/tmp/runner.log`) for detailed error messages
2. **Verify your `.env` file** has both `NOTION_API_KEY` and `NOTION_DATABASE_ID` set
3. **Test the API directly**:
   ```bash
   bun scripts/test-sync-api.ts
   ```

4. **Check Notion API status**: https://status.notion.so/

## Example .env Configuration

```bash
# Notion Configuration
NOTION_API_KEY="secret_your_integration_token_here"
NOTION_DATABASE_ID="2d393eb1-e6d1-8094-b716-d2fc817db224"
```

## Need Help?

- Check the [Notion API Documentation](https://developers.notion.com/reference)
- Review error details in the sync response - they include troubleshooting steps
- Check server logs for more detailed error information
