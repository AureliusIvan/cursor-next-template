import { debug, debugError } from "../debug";
import { getDatabaseId, getNotionClient } from "../notion";
import prisma from "../prisma";

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
