/**
 * AI Chat API Route
 * Handles streaming chat completions with tool support and web content enhancement
 */

import { devToolsMiddleware } from "@ai-sdk/devtools";
import { convertToModelMessages, stepCountIs, streamText, wrapLanguageModel } from "ai";
import { buildErrorResponse } from "@/lib/ai/error-handler";
import { getModel } from "@/lib/ai/models";
import { getSystemPrompt } from "@/lib/ai/prompts";
import { getFilteredTools } from "@/lib/ai/tools";
import type { ChatMode } from "@/lib/ai/types";
import { enhanceMessagesWithWebContent } from "@/lib/ai/web-enhancer";

/**
 * POST handler for AI chat completions
 */
export async function POST(req: Request) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON in request body", { status: 400 });
    }

    // Destructure body
    const {
      messages,
      mode = "fast",
      enabledTools,
    } = body as {
      messages: unknown;
      mode?: ChatMode;
      enabledTools?: string[];
      sessionId?: number;
    };

    // Validate messages
    if (!(messages && Array.isArray(messages))) {
      return new Response("Invalid request: messages array required", {
        status: 400,
      });
    }

    // Enhance messages with web content (parallel fetching)
    const enhancedMessages = await enhanceMessagesWithWebContent(messages, {
      maxUrls: 3,
      maxContentLength: 8000,
    });

    // Get model with devtools middleware
    const model = wrapLanguageModel({
      model: getModel(),
      middleware: devToolsMiddleware(),
    });

    // Get system prompt based on mode
    const systemPrompt = getSystemPrompt(mode);

    // Get tools for agentic mode
    const tools = mode === "agentic" ? getFilteredTools(enabledTools) : undefined;

    // Stream response
    const result = streamText({
      model,
      system: systemPrompt,
      tools,
      stopWhen: mode === "agentic" ? stepCountIs(5) : undefined,
      messages: await convertToModelMessages(enhancedMessages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return buildErrorResponse(error);
  }
}
