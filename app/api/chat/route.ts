import { anthropic } from "@ai-sdk/anthropic";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import Firecrawl from "@mendable/firecrawl-js";
import { convertToModelMessages, streamText, wrapLanguageModel } from "ai";
import { appendFileSync } from "fs";

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
      return google("gemini-2.5-flash");
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

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
      model: google("gemini-2.5-flash"),
      middleware: devToolsMiddleware(),
    });

    const result = streamText({
      model,
      // messages: enhancedMessages,
      messages: await convertToModelMessages(enhancedMessages),
    });

    // #region agent log
    try {
      appendFileSync(
        "/home/ivan/Project/node/cursor-next-template/.cursor/debug.log",
        JSON.stringify({
          location: "api/chat/route.ts:51",
          message: "streamText result created",
          data: {
            hasToTextStreamResponse: typeof result.toTextStreamResponse,
            hasToDataStreamResponse: typeof (result as any)
              .toDataStreamResponse,
            resultType: typeof result,
            resultKeys: Object.keys(result),
          },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run7",
          hypothesisId: "C",
        }) + "\n",
      );
    } catch {}
    // #endregion

    const response = result.toUIMessageStreamResponse();
    // #region agent log
    try {
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      appendFileSync(
        "/home/ivan/Project/node/cursor-next-template/.cursor/debug.log",
        JSON.stringify({
          location: "api/chat/route.ts:85",
          message: "Response created with headers",
          data: {
            status: response.status,
            statusText: response.statusText,
            headers,
            contentType: headers["content-type"],
          },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run7",
          hypothesisId: "H",
        }) + "\n",
      );
    } catch {}
    // #endregion
    return response;
  } catch (error) {
    console.error("AI chat error:", error);

    // Detect error type
    const errorInfo = detectErrorType(error);

    // #region agent log
    try {
      appendFileSync(
        "/home/ivan/Project/node/cursor-next-template/.cursor/debug.log",
        JSON.stringify({
          location: "api/chat/route.ts:68",
          message: "API route error",
          data: {
            error: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
            errorCode: errorInfo.code,
            errorStatus: errorInfo.status,
            errorDetails: error,
          },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run6",
          hypothesisId: "D",
        }) + "\n",
      );
    } catch {}
    // #endregion

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
