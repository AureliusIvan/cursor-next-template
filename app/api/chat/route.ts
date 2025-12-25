import { anthropic } from "@ai-sdk/anthropic";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import Firecrawl from "@mendable/firecrawl-js";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  wrapLanguageModel,
} from "ai";
import { z } from "zod";

import { getDatabaseId, getNotionClient } from "@/lib/notion";
import prisma from "@/lib/prisma";

const provider = process.env.AI_PROVIDER || "openai";

function getModel() {
  switch (provider) {
    case "anthropic": {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is not set");
      }
      // return anthropic(apiKey)("claude-3-5-sonnet-20241022");
      return anthropic("claude-sonnet-4-5");
    }
    case "google":
    case "gemini": {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
      }
      return google("gemini-3-flash-preview");
    }
    case "openai":
    default: {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set");
      }
      return openai("gpt-4o-mini");
    }
  }
}

function extractUrls(text: string): string[] {
  const urlRegex =
    /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g;
  const matches = text.match(urlRegex);
  return matches
    ? matches.map((url) => (url.startsWith("http") ? url : `https://${url}`))
    : [];
}

async function fetchWebContent(url: string): Promise<string | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const client = new Firecrawl({ apiKey });
    const doc = await client.scrape(url, {
      formats: ["markdown"],
    });

    if (doc.markdown) {
      return doc.markdown;
    }

    return null;
  } catch (error) {
    console.error("Firecrawl error:", error);
    return null;
  }
}

interface ErrorInfo {
  code: "RATE_LIMIT" | "UNAUTHORIZED" | "API_ERROR" | "UNKNOWN";
  status: number;
  message: string;
  retryAfter?: number;
}

function detectErrorType(error: unknown): ErrorInfo {
  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  // Check for rate limit errors
  if (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("rate_limit") ||
    errorMessage.includes("too many requests") ||
    errorMessage.includes("quota exceeded") ||
    errorMessage.includes("429") ||
    (error as any)?.status === 429 ||
    (error as any)?.statusCode === 429
  ) {
    // Try to extract retry-after from error or default to 60 seconds
    const retryAfter =
      (error as any)?.retryAfter ||
      (error as any)?.retry_after ||
      (error as any)?.headers?.["retry-after"] ||
      60;

    return {
      code: "RATE_LIMIT",
      status: 429,
      message: "Rate limit exceeded. Please try again later.",
      retryAfter:
        typeof retryAfter === "number"
          ? retryAfter
          : parseInt(retryAfter, 10) || 60,
    };
  }

  // Check for authentication errors
  if (
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("unauthorised") ||
    errorMessage.includes("invalid api key") ||
    errorMessage.includes("invalid_api_key") ||
    errorMessage.includes("authentication failed") ||
    errorMessage.includes("api key") ||
    errorMessage.includes("apikey") ||
    errorMessage.includes("401") ||
    (error as any)?.status === 401 ||
    (error as any)?.statusCode === 401
  ) {
    return {
      code: "UNAUTHORIZED",
      status: 401,
      message: "Authentication failed. Please check your API credentials.",
    };
  }

  // Check for other API errors (400, 403, 404, 500, etc.)
  const status = (error as any)?.status || (error as any)?.statusCode;
  if (status && typeof status === "number" && status >= 400 && status < 500) {
    return {
      code: "API_ERROR",
      status,
      message: "API request failed. Please try again later.",
    };
  }

  // Default to unknown error
  return {
    code: "UNKNOWN",
    status: 500,
    message: "An unexpected error occurred. Please try again later.",
  };
}

type ChatMode = "fast" | "agentic";

const AGENTIC_SYSTEM_PROMPT = `You are an advanced AI assistant operating in Agentic mode with access to a CRM database. In this mode, you should:

1. **Think step-by-step**: Break down complex problems into smaller, manageable steps.
2. **Reason explicitly**: Show your reasoning process before providing answers.
3. **Be thorough**: Consider multiple perspectives and potential edge cases.
4. **Plan before acting**: Outline your approach before executing.
5. **Reflect on results**: Verify your conclusions and consider if there are better alternatives.
6. **Use available tools**: When the user asks about contacts, companies, or CRM data, use the available tools to query the database.

**Available Tools:**
- \`searchContacts\`: Search for contacts by name, email, company, or role
- \`getContact\`: Get detailed information about a specific contact by ID
- \`listContacts\`: List all contacts with optional pagination
- \`queryNotionDatabase\`: Query the Notion database directly for advanced searches

When answering questions about contacts or CRM data:
1. First use the appropriate tool to fetch the data
2. Present the results in a clear, formatted way
3. Offer relevant follow-up actions

When answering general questions, structure your response as:
- **Understanding**: Restate what you understand about the request
- **Approach**: Outline your planned approach
- **Execution**: Work through the problem step by step
- **Result**: Provide the final answer or recommendation
- **Verification**: Briefly verify the result makes sense`;

// Define Notion/CRM tools for Agentic mode
const agenticTools = {
  searchContacts: tool({
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
            error instanceof Error
              ? error.message
              : "Failed to search contacts",
        };
      }
    },
  }),

  getContact: tool({
    description:
      "Get detailed information about a specific contact by their ID",
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
          },
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to get contact",
        };
      }
    },
  }),

  listContacts: tool({
    description:
      "List all contacts in the CRM database with optional pagination",
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
  }),

  queryNotionDatabase: tool({
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

        const results = response.results.map((page: any) => {
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
        });

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
  }),
  webSearch: tool({
    description:
      "Search the web, scrape web pages, extract structured data, or map websites. Use this for any web-related information gathering.",
    inputSchema: z.object({
      action: z
        .enum(["search", "scrape", "extract", "map"])
        .describe(
          "Action to perform: search (find info), scrape (get page content), extract (structured data), map (discover URLs)",
        ),
      query: z.string().optional().describe("Search query (for search action)"),
      url: z
        .string()
        .optional()
        .describe(
          "URL to scrape, extract from, or map (for scrape/extract/map actions)",
        ),
      urls: z
        .array(z.string())
        .optional()
        .describe("Multiple URLs for extraction (for extract action)"),
      extractPrompt: z
        .string()
        .optional()
        .describe("What to extract from the page(s) (for extract action)"),
      limit: z
        .number()
        .optional()
        .default(5)
        .describe("Number of results to return"),
    }),
    execute: async ({
      action,
      query,
      url,
      urls,
      extractPrompt,
      limit,
    }: {
      action: "search" | "scrape" | "extract" | "map";
      query?: string;
      url?: string;
      urls?: string[];
      extractPrompt?: string;
      limit: number;
    }) => {
      try {
        // Note: Firecrawl MCP tools would be called here
        // For now, return a placeholder response
        return {
          success: false,
          error:
            "Firecrawl MCP integration not yet configured. Please set up Firecrawl API credentials.",
          action,
          requestedQuery: query,
          requestedUrl: url || urls?.[0],
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to perform web search operation",
        };
      }
    },
  }),
};

type ToolName = keyof typeof agenticTools;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages,
      mode = "fast",
      enabledTools,
    } = body as {
      messages: unknown;
      mode?: ChatMode;
      enabledTools?: string[];
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request: messages array required", {
        status: 400,
      });
    }

    // Extract URLs from the last user message
    const lastMessage = messages[messages.length - 1];
    const urls: string[] =
      lastMessage?.role === "user"
        ? extractUrls(lastMessage.content || "")
        : [];

    // Fetch web content for detected URLs
    const webContents: Array<{ url: string; content: string }> = [];
    if (urls.length > 0) {
      for (const url of urls.slice(0, 3)) {
        // Limit to 3 URLs to avoid timeout
        const content = await fetchWebContent(url);
        if (content) {
          webContents.push({ url, content });
        }
      }
    }

    // Enhance messages with web content context
    const enhancedMessages = [...messages];
    if (webContents.length > 0 && lastMessage?.role === "user") {
      const contextMessage = `Here is additional context from web pages:\n\n${webContents
        .map(
          ({ url, content }) =>
            `URL: ${url}\nContent:\n${content.substring(0, 8000)}\n---\n`,
        )
        .join("\n")}`;

      enhancedMessages[enhancedMessages.length - 1] = {
        ...lastMessage,
        content: `${lastMessage.content}\n\n${contextMessage}`,
      };
    }

    // const model = getModel();
    const model = wrapLanguageModel({
      model: google("gemini-3-flash-preview"),
      middleware: devToolsMiddleware(),
    });

    // For agentic mode, add system prompt and tools for step-by-step reasoning
    const systemPrompt = mode === "agentic" ? AGENTIC_SYSTEM_PROMPT : undefined;

    // Filter tools based on enabledTools if provided
    let tools:
      | Record<string, (typeof agenticTools)[keyof typeof agenticTools]>
      | undefined;
    if (mode === "agentic") {
      if (enabledTools && enabledTools.length > 0) {
        // Only include enabled tools
        tools = {};
        for (const toolName of enabledTools) {
          if (toolName in agenticTools) {
            tools[toolName] =
              agenticTools[toolName as keyof typeof agenticTools];
          }
        }
        if (Object.keys(tools).length === 0) {
          tools = undefined;
        }
      } else {
        // No tools specified, use all tools
        tools = agenticTools;
      }
    }

    const result = streamText({
      model,
      system: systemPrompt,
      tools,
      stopWhen: mode === "agentic" ? stepCountIs(5) : undefined, // Allow multiple tool calls in agentic mode
      messages: await convertToModelMessages(enhancedMessages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("AI chat error:", error);

    // Detect error type
    const errorInfo = detectErrorType(error);

    // Build error response
    const errorResponse: {
      error: string;
      code: string;
      retryAfter?: number;
    } = {
      error: errorInfo.message,
      code: errorInfo.code,
    };

    if (errorInfo.retryAfter !== undefined) {
      errorResponse.retryAfter = errorInfo.retryAfter;
    }

    // Set response headers
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (errorInfo.retryAfter !== undefined) {
      headers["Retry-After"] = String(errorInfo.retryAfter);
    }

    return new Response(JSON.stringify(errorResponse), {
      status: errorInfo.status,
      headers,
    });
  }
}
