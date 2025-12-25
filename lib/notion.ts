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

export function getNotionClient() {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not defined");
  }

  // Create client lazily and cache it
  if (!notionClient) {
    notionClient = new Client({
      auth: process.env.NOTION_API_KEY,
    });
  }

  return notionClient;
}

export function getDatabaseId() {
  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error("NOTION_DATABASE_ID is not defined");
  }
  return process.env.NOTION_DATABASE_ID;
}
