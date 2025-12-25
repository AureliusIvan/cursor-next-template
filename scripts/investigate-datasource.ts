#!/usr/bin/env bun
/**
 * Investigation script to understand dataSources.query requirements
 * Run with: bun scripts/investigate-datasource.ts
 */

import { Client } from "@notionhq/client";

const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const DATABASE_ID = "2d493eb1-e6d1-8093-bda7-cd0faa96a5ce";

async function investigate() {
  const notion = new Client({ auth: NOTION_API_KEY });

  console.log("\n🔬 Investigating dataSources.query requirements\n");
  console.log("=".repeat(60));

  // 1. Get full database object
  console.log("\n1️⃣ Full database.retrieve() response:");
  try {
    const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
    console.log(JSON.stringify(db, null, 2));
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }

  // 2. Try search with "data_source" filter
  console.log("\n2️⃣ Search for data_sources:");
  try {
    const searchResult = await notion.search({
      filter: { property: "object", value: "data_source" as any },
      page_size: 10,
    });
    console.log(`Found ${searchResult.results.length} data source(s):`);
    for (const ds of searchResult.results) {
      console.log(`  - ID: ${ds.id}`);
      console.log(`    Object: ${ds.object}`);
      console.log(`    Full:`, JSON.stringify(ds, null, 2).slice(0, 500));
    }
  } catch (error: any) {
    console.log(`Error: ${error.code} - ${error.message}`);
  }

  // 3. Try dataSources.retrieve with database ID
  console.log("\n3️⃣ dataSources.retrieve with database ID:");
  try {
    const ds = await (notion as any).dataSources.retrieve({
      data_source_id: DATABASE_ID,
    });
    console.log("Success! Data source:", JSON.stringify(ds, null, 2));
  } catch (error: any) {
    console.log(`Error: ${error.code} - ${error.message}`);
  }

  // 4. Check what methods are available on notion.dataSources
  console.log("\n4️⃣ Available methods on notion.dataSources:");
  console.log(Object.keys((notion as any).dataSources));

  // 5. Try using notion.request() to call old databases/{id}/query directly
  console.log("\n5️⃣ Using notion.request() to call databases/{id}/query:");
  try {
    const response = await notion.request({
      path: `databases/${DATABASE_ID}/query`,
      method: "post",
      body: {},
    });
    console.log(
      "Success! Response:",
      JSON.stringify(response, null, 2).slice(0, 1000),
    );
  } catch (error: any) {
    console.log(`Error: ${error.code} - ${error.message}`);
    if (error.body) {
      console.log("Body:", error.body);
    }
  }

  // 6. Try fetching with raw fetch to see raw API response
  console.log("\n6️⃣ Raw fetch to databases/{id}/query:");
  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28", // Try older API version
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      },
    );
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(data, null, 2).slice(0, 1000));
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Investigation complete.\n");
}

investigate().catch(console.error);
