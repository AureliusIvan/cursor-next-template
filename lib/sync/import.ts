import { debug, debugError } from "../debug";
import { getDatabaseId, getNotionClient } from "../notion";
import prisma from "../prisma";

/**
 * Extract error message from various error types
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check for Notion API errors
    const notionError = error as any;
    if (notionError.code) {
      // Notion API error format
      return `${notionError.code}: ${notionError.message || error.message}`;
    }
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return String(error);
}

/**
 * Extract detailed error information for debugging
 */
function extractErrorDetails(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const notionError = error as any;
    const details: Record<string, unknown> = {
      message: error.message,
      name: error.name,
    };

    // Add Notion-specific error details
    if (notionError.code) {
      details.code = notionError.code;
    }
    if (notionError.status) {
      details.status = notionError.status;
    }
    if (notionError.body) {
      details.body = notionError.body;
    }

    return details;
  }
  return { error: String(error) };
}

export async function syncContactsFromNotion() {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  // 1. Get last sync time
  const syncState = await prisma.syncState.findUnique({
    where: { resourceType: "contacts" },
  });

  const lastSyncTime = syncState?.lastSyncTime?.toISOString();
  debug(
    { component: "Sync", function: "syncContactsFromNotion" },
    "Starting sync",
    { lastSyncTime, databaseId },
  );

  let hasMore = true;
  let cursor: string | undefined;
  let processedCount = 0;

  try {
    // First, retrieve the database to get its data source ID
    // In Notion SDK 5.6.0, dataSources.query requires the data_source_id, not database_id
    // These are DIFFERENT - the database object contains a data_sources array with the correct ID
    debug(
      { component: "Sync", function: "syncContactsFromNotion" },
      "Retrieving database to get data source ID",
      { databaseId },
    );

    const database = await notion.databases.retrieve({
      database_id: databaseId,
    });
    const dataSourceId = (database as any).data_sources?.[0]?.id;

    if (!dataSourceId) {
      throw new Error(
        "Database does not have an associated data source. " +
          "This may be due to an older Notion API version. Database ID: " +
          databaseId,
      );
    }

    debug(
      { component: "Sync", function: "syncContactsFromNotion" },
      "Found data source ID",
      {
        databaseId,
        dataSourceId,
        databaseTitle: (database as any).title?.[0]?.plain_text,
      },
    );

    while (hasMore) {
      // 2. Query Notion using dataSources.query with the correct data source ID
      const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
        start_cursor: cursor,
        filter: lastSyncTime
          ? {
              timestamp: "last_edited_time",
              last_edited_time: {
                after: lastSyncTime,
              },
            }
          : undefined,
      });

      const pages = response.results;

      // 3. Process pages
      for (const page of pages) {
        if (!("properties" in page)) continue;

        const props = page.properties as any; // Type assertion for flexibility

        // Extract fields safely
        // Adjust these property names based on your actual Notion DB schema
        const name =
          props.Name?.title?.[0]?.plain_text ||
          props.Title?.title?.[0]?.plain_text ||
          "Untitled";

        const email = props.Email?.email || null;
        const phone = props.Phone?.phone_number || null;
        const company = props.Company?.rich_text?.[0]?.plain_text || null;
        const role = props.Role?.rich_text?.[0]?.plain_text || null;

        // Store everything else in metadata
        // We exclude known fields to avoid duplication
        const metadata = { ...props };
        delete metadata.Name;
        delete metadata.Email;
        delete metadata.Phone;
        delete metadata.Company;
        delete metadata.Role;

        await prisma.contact.upsert({
          where: { notionId: page.id },
          update: {
            name,
            email,
            phone,
            company,
            role,
            metadata,
            lastSyncedAt: new Date(),
            updatedAt: new Date(), // Local update time matches sync
          },
          create: {
            notionId: page.id,
            name,
            email,
            phone,
            company,
            role,
            metadata,
            lastSyncedAt: new Date(),
          },
        });

        processedCount++;
      }

      hasMore = response.has_more;
      cursor = response.next_cursor || undefined;
    }

    // 4. Update SyncState
    await prisma.syncState.upsert({
      where: { resourceType: "contacts" },
      update: { lastSyncTime: new Date() },
      create: {
        resourceType: "contacts",
        lastSyncTime: new Date(),
      },
    });

    debug(
      { component: "Sync", function: "syncContactsFromNotion" },
      "Sync completed",
      { processedCount },
    );
    return { success: true, count: processedCount };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    const errorDetails = extractErrorDetails(error);
    debugError(
      { component: "Sync", function: "syncContactsFromNotion" },
      error instanceof Error ? error : String(error),
      {
        lastSyncTime,
        ...errorDetails,
      },
    );
    // Provide additional context for common errors
    if (errorDetails.code === "object_not_found") {
      return {
        success: false,
        error: errorMessage,
        details: {
          ...errorDetails,
          troubleshooting: {
            step1:
              "Verify your NOTION_DATABASE_ID in .env matches the database ID from Notion",
            step2:
              "Open the database in Notion → Click '...' → 'Copy link' → Extract the ID from the URL",
            step3:
              "Share the database with your integration: Click '...' → 'Add connections' → Select your integration",
            step4:
              "Ensure your integration has 'Read' permissions for the database",
            exampleUrl:
              "https://notion.so/workspace/2d393eb1e6d18094b716d2fc817db224",
            exampleId:
              "2d393eb1-e6d1-8094-b716-d2fc817db224 or 2d393eb1e6d18094b716d2fc817db224",
          },
        },
      };
    }

    return {
      success: false,
      error: errorMessage,
      details: errorDetails,
    };
  }
}
