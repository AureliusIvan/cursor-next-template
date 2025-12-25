#!/usr/bin/env bun
/**
 * Test script for Notion sync API endpoint
 * Run with: bun scripts/test-sync-api.ts
 */

const API_URL = process.env.API_URL || "http://localhost:3000";

async function testSyncAPI() {
  console.log("🧪 Testing Notion Sync API...\n");

  try {
    const response = await fetch(`${API_URL}/api/crm/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const status = response.status;

    console.log(`📊 Status Code: ${status}`);
    console.log(`📦 Response:`, JSON.stringify(data, null, 2));

    if (data.success) {
      console.log(`\n✅ Sync successful! Synced ${data.count} contacts`);
      if (data.algoliaSync) {
        if (data.algoliaSync.success) {
          console.log(`✅ Algolia sync: ${data.algoliaSync.count} contacts`);
        } else {
          console.log(`⚠️  Algolia sync failed: ${data.algoliaSync.error}`);
        }
      }
    } else {
      console.log(`\n❌ Sync failed: ${data.error}`);
      if (data.details) {
        console.log(`📋 Details:`, JSON.stringify(data.details, null, 2));
      }
    }

    return { success: data.success, status, data };
  } catch (error) {
    console.error("❌ Request failed:", error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.main) {
  testSyncAPI()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}

export { testSyncAPI };
