import { debug, debugError } from "../debug";
import {
  createNotionClientWithToken,
  getDatabaseId,
  getNotionClient,
} from "../notion";
import prisma from "../prisma";
import type { NotionFieldMapping } from "../types/notion-integration";

/**
 * Sync contacts from Notion using admin API key (legacy/system-wide sync)
 */
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
    { lastSyncTime },
  );

  let hasMore = true;
  let cursor: string | undefined;
  let processedCount = 0;

  try {
    while (hasMore) {
      // 2. Query Notion
      const response = await notion.databases.query({
        database_id: databaseId,
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
    debugError({ component: "Sync" }, error, { lastSyncTime });
    return { success: false, error };
  }
}

/**
 * Extract value from Notion property based on field mapping
 */
function extractNotionProperty(
  properties: any,
  propertyName: string,
): string | null {
  if (!propertyName || !properties[propertyName]) {
    return null;
  }

  const property = properties[propertyName];

  // Handle different property types
  if (property.title?.[0]?.plain_text) {
    return property.title[0].plain_text;
  }
  if (property.rich_text?.[0]?.plain_text) {
    return property.rich_text[0].plain_text;
  }
  if (property.email) {
    return property.email;
  }
  if (property.phone_number) {
    return property.phone_number;
  }
  if (property.url) {
    return property.url;
  }
  if (property.select?.name) {
    return property.select.name;
  }
  if (property.multi_select) {
    return property.multi_select.map((s: any) => s.name).join(", ");
  }

  return null;
}

/**
 * Sync contacts from Notion using user's OAuth token and field mapping
 */
export async function syncContactsFromNotionForUser(userId: number) {
  try {
    // Get user's Notion account
    const notionAccount = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "notion",
      },
    });

    if (!notionAccount?.accessToken) {
      throw new Error("User has not connected Notion");
    }

    // Parse config from scope
    let config: {
      databaseId?: string;
      fieldMapping?: NotionFieldMapping;
    } = {};

    try {
      config = notionAccount.scope
        ? JSON.parse(notionAccount.scope as string)
        : {};
    } catch (e) {
      throw new Error("Invalid Notion configuration");
    }

    if (!config.databaseId || !config.fieldMapping) {
      throw new Error("Notion is not fully configured");
    }

    const notion = createNotionClientWithToken(notionAccount.accessToken);
    const { databaseId, fieldMapping } = config;

    debug(
      { component: "Sync", function: "syncContactsFromNotionForUser" },
      "Starting user sync",
      { userId, databaseId },
    );

    let hasMore = true;
    let cursor: string | undefined;
    let processedCount = 0;

    while (hasMore) {
      // Query Notion database
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
      });

      const pages = response.results;

      // Process pages
      for (const page of pages) {
        if (!("properties" in page)) continue;

        const props = page.properties as any;

        // Extract fields using field mapping
        const name =
          extractNotionProperty(props, fieldMapping.nameProperty) || "Untitled";
        const email = extractNotionProperty(props, fieldMapping.emailProperty);
        const phone = extractNotionProperty(props, fieldMapping.phoneProperty);
        const company = extractNotionProperty(
          props,
          fieldMapping.companyProperty,
        );
        const role = extractNotionProperty(props, fieldMapping.roleProperty);

        // Store everything in metadata
        const metadata = { ...props };

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
            updatedAt: new Date(),
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

    debug(
      { component: "Sync", function: "syncContactsFromNotionForUser" },
      "User sync completed",
      { userId, processedCount },
    );

    return { success: true, count: processedCount };
  } catch (error) {
    debugError({ component: "Sync" }, error, { userId });
    return { success: false, error };
  }
}
