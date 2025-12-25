#!/usr/bin/env bun
/**
 * Diagnostic script to test Notion API access
 * Run with: bun scripts/diagnose-notion.ts
 */

import { Client } from "@notionhq/client";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function diagnose() {
  console.log("\n🔍 Notion API Diagnostic\n");
  console.log("=".repeat(50));

  // 1. Check environment variables
  console.log("\n📋 Environment Variables:");
  console.log(
    `  NOTION_API_KEY: ${NOTION_API_KEY ? `${NOTION_API_KEY.slice(0, 10)}...` : "❌ NOT SET"}`,
  );
  console.log(`  NOTION_DATABASE_ID: ${NOTION_DATABASE_ID || "❌ NOT SET"}`);

  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.log("\n❌ Missing environment variables. Please set them in .env");
    return;
  }

  // 2. Extract/format database ID
  let databaseId = NOTION_DATABASE_ID.trim();

  // Handle full URLs
  const urlMatch = databaseId.match(
    /notion\.so\/[^/]+\/([a-zA-Z0-9-]+)(?:\?|$)/i,
  );
  if (urlMatch) {
    databaseId = urlMatch[1];
    console.log(`  Extracted from URL: ${databaseId}`);
  }

  // Format with hyphens if needed
  if (/^[0-9a-f]{32}$/i.test(databaseId)) {
    databaseId = `${databaseId.slice(0, 8)}-${databaseId.slice(8, 12)}-${databaseId.slice(12, 16)}-${databaseId.slice(16, 20)}-${databaseId.slice(20)}`;
    console.log(`  Formatted with hyphens: ${databaseId}`);
  }

  const databaseIdNoHyphens = databaseId.replace(/-/g, "");
  console.log(`  Without hyphens: ${databaseIdNoHyphens}`);

  // 3. Create client
  const notion = new Client({ auth: NOTION_API_KEY });

  console.log("\n🧪 Running Tests...\n");

  // Test 1: Check if it's a database
  console.log("Test 1: Trying databases.retrieve()...");
  try {
    const db = await notion.databases.retrieve({ database_id: databaseId });
    console.log(
      `  ✅ SUCCESS! Found database: "${(db as any).title?.[0]?.plain_text || "Untitled"}"`,
    );
    console.log(`  Database ID: ${db.id}`);
    if ((db as any).data_source_id) {
      console.log(`  Data Source ID: ${(db as any).data_source_id}`);
    }
  } catch (error: any) {
    console.log(`  ❌ FAILED: ${error.code} - ${error.message}`);
    if (error.code === "object_not_found") {
      console.log("     This could mean:");
      console.log("     - The database is not shared with your integration");
      console.log("     - The ID is for a page, not a database");
      console.log("     - The ID is incorrect");
    }
  }

  // Test 2: Check if it's a page
  console.log("\nTest 2: Trying pages.retrieve()...");
  try {
    const page = await notion.pages.retrieve({ page_id: databaseId });
    console.log(`  ✅ SUCCESS! Found page with ID: ${page.id}`);
    console.log("     This means the ID is for a PAGE, not a database!");
    console.log(
      "     If the page contains an inline database, you need to find its ID.",
    );

    // Try to get the page's blocks to find any databases
    console.log("\n  Checking page blocks for inline databases...");
    try {
      const blocks = await notion.blocks.children.list({
        block_id: databaseId,
        page_size: 20,
      });
      const dbBlocks = blocks.results.filter(
        (b: any) => b.type === "child_database",
      );
      if (dbBlocks.length > 0) {
        console.log(`  ✅ Found ${dbBlocks.length} inline database(s):`);
        for (const block of dbBlocks) {
          console.log(`     - ID: ${block.id}`);
          console.log(
            `       Title: ${(block as any).child_database?.title || "Untitled"}`,
          );
        }
        console.log("\n  💡 Use one of these IDs as your NOTION_DATABASE_ID");
      } else {
        console.log("  No inline databases found in the first 20 blocks");
      }
    } catch (blockError: any) {
      console.log(`  Could not read blocks: ${blockError.message}`);
    }
  } catch (error: any) {
    console.log(`  ❌ FAILED: ${error.code} - ${error.message}`);
  }

  // Test 3: Try dataSources.query
  console.log("\nTest 3: Trying dataSources.query()...");
  try {
    const response = await (notion as any).dataSources.query({
      data_source_id: databaseId,
      page_size: 1,
    });
    console.log(
      `  ✅ SUCCESS! Query returned ${response.results.length} result(s)`,
    );
  } catch (error: any) {
    console.log(`  ❌ FAILED: ${error.code} - ${error.message}`);
  }

  // Test 4: Try with ID without hyphens
  console.log("\nTest 4: Trying dataSources.query() without hyphens...");
  try {
    const response = await (notion as any).dataSources.query({
      data_source_id: databaseIdNoHyphens,
      page_size: 1,
    });
    console.log(
      `  ✅ SUCCESS! Query returned ${response.results.length} result(s)`,
    );
  } catch (error: any) {
    console.log(`  ❌ FAILED: ${error.code} - ${error.message}`);
  }

  // Test 5: List all databases the integration can access
  console.log("\nTest 5: Searching for accessible databases...");
  try {
    const searchResult = await notion.search({
      filter: { property: "object", value: "database" },
      page_size: 10,
    });
    if (searchResult.results.length > 0) {
      console.log(
        `  ✅ Found ${searchResult.results.length} accessible database(s):`,
      );
      for (const db of searchResult.results) {
        const title = (db as any).title?.[0]?.plain_text || "Untitled";
        console.log(`     - "${title}" (ID: ${db.id})`);
      }
      console.log("\n  💡 Use one of these IDs if your database is listed");
    } else {
      console.log("  ⚠️ No databases found!");
      console.log(
        "     Your integration may not have access to any databases.",
      );
      console.log(
        "     Please share at least one database with your integration.",
      );
    }
  } catch (error: any) {
    console.log(`  ❌ FAILED: ${error.code} - ${error.message}`);
  }

  // Test 6: Check API key validity
  console.log("\nTest 6: Verifying API key (users.me)...");
  try {
    const me = await notion.users.me({});
    console.log(`  ✅ API key is valid!`);
    console.log(`     Bot name: ${me.name || "Unnamed"}`);
    console.log(`     Bot ID: ${me.id}`);
    if ((me as any).bot?.owner?.workspace) {
      console.log(
        `     Workspace: ${(me as any).bot.owner.workspace.name || "Unknown"}`,
      );
    }
  } catch (error: any) {
    console.log(`  ❌ FAILED: ${error.code} - ${error.message}`);
    if (error.code === "unauthorized") {
      console.log("     Your API key is invalid or expired!");
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Diagnostic complete.\n");
}

diagnose().catch(console.error);
