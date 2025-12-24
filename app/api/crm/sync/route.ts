import { syncContactsFromNotion } from "@/lib/sync/import";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await syncContactsFromNotion();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        count: result.count,
        message: `Successfully synced ${result.count} contacts`
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Sync failed" },
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
