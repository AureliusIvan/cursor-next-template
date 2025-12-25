import { syncContactsToAlgolia } from "@/lib/sync/algolia";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await syncContactsToAlgolia();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        count: result.count,
        message: `Successfully synced ${result.count} contacts to Algolia`,
        objectIDs: result.objectIDs,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Algolia sync failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
