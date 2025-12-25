/**
 * AI model configuration and provider management
 */

import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
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
export function getModel(): LanguageModel {
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
