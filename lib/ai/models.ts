/**
 * AI model configuration and provider management
 */

import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import type { LanguageModelV3 } from "@ai-sdk/provider";
import type { AIProvider } from "./types";

/**
 * Get the configured AI provider from environment
 */
export function getProviderFromEnv(): AIProvider {
  const provider = process.env.AI_PROVIDER || "openai";
  return provider as AIProvider;
}

/**
 * Get the AI model instance based on provider configuration
 * Throws error if required API key is not set
 */
export function getModel(): LanguageModelV3 {
  const provider = getProviderFromEnv();

  switch (provider) {
    case "anthropic": {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is not set");
      }
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

    case "kimi": {
      const apiKey = process.env.KIMI_API_KEY;
      const baseURL = process.env.KIMI_BASE_URL || "https://ark.ap-southeast.bytepluses.com/api/v3";
      const model = process.env.KIMI_MODEL || "kimi-k2-thinking-251104";
      if (!apiKey) {
        throw new Error("KIMI_API_KEY is not set");
      }
      const kimiOpenAI = createOpenAI({
        apiKey,
        baseURL,
      });
      // Explicitly use chat() to force chat/completions endpoint instead of responses
      return kimiOpenAI.chat(model);
    }

    default: {
      // Default to OpenAI
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set");
      }
      return openai("gpt-4o-mini");
    }
  }
}

/**
 * Validate that required API keys are present
 */
export function validateModelConfig(): { valid: boolean; error?: string } {
  try {
    getModel();
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
