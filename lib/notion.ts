import { Client } from "@notionhq/client";
import "server-only";

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

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
  return notion;
}

export function getDatabaseId() {
  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error("NOTION_DATABASE_ID is not defined");
  }
  return process.env.NOTION_DATABASE_ID;
}
