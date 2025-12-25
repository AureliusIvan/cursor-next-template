import { algoliasearch } from "algoliasearch";
import { debug, debugError } from "../debug";
import prisma from "../prisma";

interface AlgoliaContact {
  objectID: string; // Use contact ID as objectID
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
}

export async function syncContactsToAlgolia() {
  const applicationId = process.env.ALGOLIA_APPLICATION_ID;
  const apiKey =
    process.env.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_API_KEY;
  const indexName = process.env.ALGOLIA_CONTACTS_INDEX || "contacts";

  if (!applicationId || !apiKey) {
    debug(
      { component: "AlgoliaSync", function: "syncContactsToAlgolia" },
      "Algolia credentials not configured",
    );
    return {
      success: false,
      error:
        "Algolia credentials not configured. Please set ALGOLIA_APPLICATION_ID and ALGOLIA_ADMIN_API_KEY environment variables.",
    };
  }

  try {
    const searchClient = algoliasearch(applicationId, apiKey);

    debug(
      { component: "AlgoliaSync", function: "syncContactsToAlgolia" },
      "Starting Algolia sync",
      { indexName },
    );

    // Fetch all contacts from database
    const contacts = await prisma.contact.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        role: true,
      },
    });

    if (contacts.length === 0) {
      debug(
        { component: "AlgoliaSync", function: "syncContactsToAlgolia" },
        "No contacts to sync",
      );
      return { success: true, count: 0 };
    }

    // Transform contacts to Algolia format
    const algoliaContacts: AlgoliaContact[] = contacts.map((contact) => ({
      objectID: contact.id.toString(),
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      role: contact.role,
    }));

    // Save all objects to Algolia (replace existing)
    const response = await searchClient.saveObjects({
      indexName,
      objects: algoliaContacts as unknown as Record<string, unknown>[],
    });

    // Response is BatchResponse[] - extract objectIDs from all batches
    const objectIDs = Array.isArray(response)
      ? response.flatMap((batch) => batch.objectIDs || [])
      : [];

    debug(
      { component: "AlgoliaSync", function: "syncContactsToAlgolia" },
      "Algolia sync completed",
      {
        contactsCount: contacts.length,
        batchesProcessed: Array.isArray(response) ? response.length : 0,
        objectIDsCount: objectIDs.length,
      },
    );

    // Configure searchable attributes and ranking
    await searchClient.setSettings({
      indexName,
      indexSettings: {
        searchableAttributes: ["name", "email", "company", "role", "phone"],
        attributesForFaceting: ["company", "role"],
      },
    });

    debug(
      { component: "AlgoliaSync", function: "syncContactsToAlgolia" },
      "Algolia index settings configured",
    );

    return {
      success: true,
      count: contacts.length,
      objectIDs,
    };
  } catch (error) {
    debugError(
      { component: "AlgoliaSync" },
      error instanceof Error ? error : new Error(String(error)),
      { indexName },
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteContactFromAlgolia(contactId: number) {
  const applicationId = process.env.ALGOLIA_APPLICATION_ID;
  const apiKey =
    process.env.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_API_KEY;
  const indexName = process.env.ALGOLIA_CONTACTS_INDEX || "contacts";

  if (!applicationId || !apiKey) {
    return { success: false, error: "Algolia credentials not configured" };
  }

  try {
    const searchClient = algoliasearch(applicationId, apiKey);

    await searchClient.deleteObject({
      indexName,
      objectID: contactId.toString(),
    });

    return { success: true };
  } catch (error) {
    debugError(
      { component: "AlgoliaSync", function: "deleteContactFromAlgolia" },
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function upsertContactToAlgolia(contact: {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
}) {
  const applicationId = process.env.ALGOLIA_APPLICATION_ID;
  const apiKey =
    process.env.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_API_KEY;
  const indexName = process.env.ALGOLIA_CONTACTS_INDEX || "contacts";

  if (!applicationId || !apiKey) {
    return { success: false, error: "Algolia credentials not configured" };
  }

  try {
    const searchClient = algoliasearch(applicationId, apiKey);

    const algoliaContact: AlgoliaContact = {
      objectID: contact.id.toString(),
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      role: contact.role,
    };

    await searchClient.saveObject({
      indexName,
      body: algoliaContact as unknown as Record<string, unknown>,
    });

    return { success: true };
  } catch (error) {
    debugError(
      { component: "AlgoliaSync", function: "upsertContactToAlgolia" },
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
