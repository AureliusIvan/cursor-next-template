import { Client } from "@notionhq/client";
import "server-only";

// Private cached client instance
let notionClient: Client | null = null;

export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

export interface NotionContactProperties {
  Name: {
    title: { plain_text: string }[];
  };
  Email: {
    email: string | null;
  };
  Phone: {
    phone_number: string | null;
  };
  Company: {
    rich_text: { plain_text: string }[];
  };
  Role: {
    rich_text: { plain_text: string }[];
  };
  // Add other fields as needed
}

export type NotionPage = {
  id: string;
  properties: NotionContactProperties;
  last_edited_time: string;
  url: string;
};

/**
 * Validate that Notion API key is configured
 */
function validateNotionApiKey(): void {
  if (!process.env.NOTION_API_KEY) {
    throw new Error(
      "NOTION_API_KEY is not configured. Please set it in your .env file. " +
        "Get your API key from https://www.notion.so/my-integrations"
    );
  }

  // Basic format validation (Notion API keys typically start with 'secret_')
  const apiKey = process.env.NOTION_API_KEY.trim();
  if (apiKey.length === 0) {
    throw new Error("NOTION_API_KEY is empty. Please set a valid API key in your .env file.");
  }
}

/**
 * Extract UUID from database ID (handles URL slugs and UUIDs)
 */
function extractDatabaseUUID(databaseId: string): string {
  // Remove any URL parts if present
  let cleaned = databaseId.trim();

  // FIRST: Check if it's already a valid UUID format (with or without hyphens)
  // This takes priority over URL extraction to avoid incorrect conversions
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleaned)) {
    // Already has hyphens, return as-is
    return cleaned;
  }

  if (/^[0-9a-f]{32}$/i.test(cleaned)) {
    // 32 hex characters without hyphens, add hyphens
    return `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`;
  }

  // SECOND: Handle full Notion URLs
  // Example: https://www.notion.so/aurelivan/2d493eb1e6d18093bda7cd0faa96a5ce?v=...
  // Extract the database slug/ID from the URL (handles query parameters)
  const urlMatch = cleaned.match(/notion\.so\/[^/]+\/([a-zA-Z0-9-]+)(?:\?|$)/i);
  if (urlMatch) {
    cleaned = urlMatch[1];
  }

  // THIRD: If it contains a hyphen-separated prefix (like "Personal-CRM-"), extract the UUID part
  // UUIDs are 32 hex characters, optionally with hyphens
  const uuidPattern = /([0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12})/i;
  const match = cleaned.match(uuidPattern);

  if (match) {
    // Return UUID with hyphens normalized
    const uuid = match[1].replace(/-/g, "");
    return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
  }

  // Return original if we can't parse it (will fail at API level with better error)
  return cleaned;
}

/**
 * Validate that Notion database ID is configured
 */
function validateDatabaseId(): void {
  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error(
      "NOTION_DATABASE_ID is not configured. Please set it in your .env file. " +
        "Find your database ID in the Notion database URL (the long alphanumeric string after the last slash). " +
        "Example: For URL 'https://notion.so/workspace/DATABASE_ID?v=...', use the DATABASE_ID part."
    );
  }

  const databaseId = process.env.NOTION_DATABASE_ID.trim();
  if (databaseId.length === 0) {
    throw new Error(
      "NOTION_DATABASE_ID is empty. Please set a valid database ID in your .env file."
    );
  }

  // Basic format validation (Notion database IDs are typically 32 characters, alphanumeric with hyphens)
  if (databaseId.length < 20) {
    throw new Error(
      "NOTION_DATABASE_ID appears to be invalid. " +
        "Database IDs are typically 32 characters long. Check your .env file."
    );
  }
}

export function getNotionClient() {
  validateNotionApiKey();

  // Create client lazily and cache it
  if (!notionClient) {
    notionClient = new Client({
      auth: process.env.NOTION_API_KEY!.trim(),
    });
  }

  return notionClient;
}

export function getDatabaseId() {
  validateDatabaseId();
  const rawId = process.env.NOTION_DATABASE_ID!.trim();
  // Extract UUID format from the database ID (handles URL slugs)
  return extractDatabaseUUID(rawId);
}
