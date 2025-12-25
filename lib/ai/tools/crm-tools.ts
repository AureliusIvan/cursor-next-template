/**
 * CRM and Notion database tools for the AI assistant
 */

import { tool } from "ai";
import { z } from "zod";
import { getDatabaseId, getNotionClient } from "@/lib/notion";
import prisma from "@/lib/prisma";
import type { ContactData, NotionContactResult } from "../types";

/**
 * Search for contacts in the CRM database
 */
export const searchContacts = tool({
  description:
    "Search for contacts in the CRM database by name, email, company, or role. Returns matching contacts.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Search term to match against name, email, company, or role"),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Maximum number of results to return"),
  }),
  execute: async ({ query, limit }: { query: string; limit: number }) => {
    try {
      const contacts = await prisma.contact.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            { role: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        orderBy: { updatedAt: "desc" },
      });

      return {
        success: true,
        count: contacts.length,
        contacts: contacts.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          role: c.role,
          notionId: c.notionId,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to search contacts",
      };
    }
  },
});

/**
 * Get detailed information about a specific contact
 */
export const getContact = tool({
  description: "Get detailed information about a specific contact by their ID",
  inputSchema: z.object({
    id: z.number().describe("The contact ID to retrieve"),
  }),
  execute: async ({ id }: { id: number }) => {
    try {
      const contact = await prisma.contact.findUnique({
        where: { id },
      });

      if (!contact) {
        return { success: false, error: "Contact not found" };
      }

      return {
        success: true,
        contact: {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          role: contact.role,
          notionId: contact.notionId,
          metadata: contact.metadata,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt,
          lastSyncedAt: contact.lastSyncedAt,
        } as ContactData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get contact",
      };
    }
  },
});

/**
 * List all contacts with pagination
 */
export const listContacts = tool({
  description: "List all contacts in the CRM database with optional pagination",
  inputSchema: z.object({
    limit: z
      .number()
      .optional()
      .default(20)
      .describe("Maximum number of contacts to return"),
    offset: z
      .number()
      .optional()
      .default(0)
      .describe("Number of contacts to skip for pagination"),
  }),
  execute: async ({ limit, offset }: { limit: number; offset: number }) => {
    try {
      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          take: limit,
          skip: offset,
          orderBy: { name: "asc" },
        }),
        prisma.contact.count(),
      ]);

      return {
        success: true,
        total,
        count: contacts.length,
        offset,
        contacts: contacts.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          company: c.company,
          role: c.role,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list contacts",
      };
    }
  },
});

/**
 * Query the Notion database directly
 */
export const queryNotionDatabase = tool({
  description:
    "Query the Notion database directly for advanced searches. Use this when you need to search by specific Notion properties or need data not synced to the local database.",
  inputSchema: z.object({
    filter: z
      .object({
        property: z
          .string()
          .describe(
            "The Notion property name to filter by (e.g., 'Name', 'Email', 'Company')",
          ),
        type: z
          .enum(["title", "rich_text", "email", "phone_number"])
          .describe("The Notion property type"),
        value: z.string().describe("The value to search for"),
      })
      .optional()
      .describe("Optional filter for the query"),
    pageSize: z
      .number()
      .optional()
      .default(10)
      .describe("Number of results per page"),
  }),
  execute: async ({
    filter,
    pageSize,
  }: {
    filter?: {
      property: string;
      type: "title" | "rich_text" | "email" | "phone_number";
      value: string;
    };
    pageSize: number;
  }) => {
    try {
      const notion = getNotionClient();
      const databaseId = getDatabaseId();

      // First retrieve the database to get data source ID (required for Notion SDK 5.6.0+)
      const database = await notion.databases.retrieve({
        database_id: databaseId,
      });
      const dataSourceId = (database as any).data_sources?.[0]?.id;

      if (!dataSourceId) {
        return {
          success: false,
          error: "Could not find data source ID for the database",
        };
      }

      // Build filter if provided
      let queryFilter: any;
      if (filter) {
        const { property, type, value } = filter;
        queryFilter = {
          property,
          [type]:
            type === "title" || type === "rich_text"
              ? { contains: value }
              : { equals: value },
        };
      }

      const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
        page_size: pageSize,
        filter: queryFilter,
      });

      const results: NotionContactResult[] = response.results.map(
        (page: any) => {
          const props = page.properties || {};
          return {
            id: page.id,
            name:
              props.Name?.title?.[0]?.plain_text ||
              props.Title?.title?.[0]?.plain_text ||
              "Untitled",
            email: props.Email?.email || null,
            phone: props.Phone?.phone_number || null,
            company: props.Company?.rich_text?.[0]?.plain_text || null,
            role: props.Role?.rich_text?.[0]?.plain_text || null,
            url: page.url,
            lastEdited: page.last_edited_time,
          };
        },
      );

      return {
        success: true,
        count: results.length,
        hasMore: response.has_more,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to query Notion database",
      };
    }
  },
});
