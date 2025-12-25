import { NextResponse } from "next/server";
import { syncContactsToAlgolia } from "@/lib/sync/algolia";
import { syncContactsFromNotion } from "@/lib/sync/import";

/**
 * Determine HTTP status code based on error type
 */
function getErrorStatus(error: unknown): number {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Environment variable errors - 400 Bad Request
    if (
      message.includes("not configured") ||
      message.includes("not defined") ||
      message.includes("empty")
    ) {
      return 400;
    }

    // Notion API errors
    const notionError = error as any;
    if (notionError.status) {
      return notionError.status;
    }
    if (
      notionError.code === "unauthorized" ||
      message.includes("unauthorized")
    ) {
      return 401;
    }
    if (
      notionError.code === "object_not_found" ||
      message.includes("not found")
    ) {
      return 404;
    }
    if (
      notionError.code === "validation_error" ||
      message.includes("validation")
    ) {
      return 400;
    }
  }

  return 500;
}

/**
 * Extract user-friendly error message
 */
function getUserFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    // Environment variable errors
    if (message.includes("NOTION_API_KEY")) {
      return "Notion API key is not configured. Please check your environment variables.";
    }
    if (message.includes("NOTION_DATABASE_ID")) {
      return "Notion database ID is not configured. Please check your environment variables.";
    }

    // Notion API errors
    const notionError = error as any;
    if (notionError.code === "unauthorized") {
      return "Notion API authentication failed. Please check your API key and ensure the integration has access to the database.";
    }
    if (notionError.code === "object_not_found") {
      return (
        "Notion database not found. Please verify:\n" +
        "1. The database ID in your .env file is correct\n" +
        "2. The database is shared with your Notion integration\n" +
        "3. Your integration has 'Read' permissions for the database\n" +
        "To share: Open the database in Notion → Click '...' → 'Add connections' → Select your integration"
      );
    }
    if (notionError.code === "validation_error") {
      return `Notion API validation error: ${notionError.message || message}`;
    }

    return message;
  }

  return String(error);
}

export async function POST() {
  try {
    // 1. Sync contacts from Notion to database
    const notionResult = await syncContactsFromNotion();

    if (!notionResult.success) {
      const errorMessage = getUserFriendlyError(notionResult.error);
      const status = getErrorStatus(notionResult.error);

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: notionResult.details || notionResult.error,
        },
        { status },
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
        : {
            success: false,
            error:
              typeof algoliaResult.error === "string"
                ? algoliaResult.error
                : String(algoliaResult.error),
          },
    });
  } catch (error) {
    const errorMessage = getUserFriendlyError(error);
    const status = getErrorStatus(error);

    console.error("Sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
      },
      { status },
    );
  }
}
