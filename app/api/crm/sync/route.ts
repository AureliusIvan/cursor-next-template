import { syncContactsFromNotion } from "@/lib/sync/import";
import { syncContactsToAlgolia } from "@/lib/sync/algolia";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 1. Sync contacts from Notion to database
    const notionResult = await syncContactsFromNotion();
    
    if (!notionResult.success) {
      return NextResponse.json(
        { success: false, error: "Notion sync failed", details: notionResult.error },
        { status: 500 }
      );
    }

    // 2. Sync contacts from database to Algolia
    const algoliaResult = await syncContactsToAlgolia();
    
    // Return combined result
    // Algolia sync failure is not critical - we still return success if Notion sync worked
    return NextResponse.json({ 
      success: true, 
      count: notionResult.count,
      message: `Successfully synced ${notionResult.count} contacts from Notion`,
      algoliaSync: algoliaResult.success 
        ? { success: true, count: algoliaResult.count }
        : { success: false, error: algoliaResult.error },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
