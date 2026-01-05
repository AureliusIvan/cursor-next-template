/**
 * Shared TypeScript types and interfaces for the AI system
 */

import type { z } from "zod";

/**
 * Chat operating modes
 */
export type ChatMode = "fast" | "agentic";

/**
 * Supported AI providers
 */
export type AIProvider = "openai" | "anthropic" | "google" | "gemini" | "kimi";

/**
 * Error classification codes
 */
export type ErrorCode = "RATE_LIMIT" | "UNAUTHORIZED" | "API_ERROR" | "UNKNOWN";

/**
 * Structured error information
 */
export interface ErrorInfo {
  code: ErrorCode;
  status: number;
  message: string;
  retryAfter?: number;
}

/**
 * Web content fetched from URLs
 */
export interface WebContent {
  url: string;
  content: string;
}

/**
 * Tool execution result with type safety
 */
export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Contact data structure from CRM
 */
export interface ContactData {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  notionId: string | null;
  metadata?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
  lastSyncedAt?: Date | null;
}

/**
 * Notion query result
 */
export interface NotionContactResult {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  url: string;
  lastEdited: string;
}

/**
 * Model configuration
 */
export interface ModelConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
}

/**
 * Tool definition with schema
 */
export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  execute: (input: TInput) => Promise<TOutput>;
}

/**
 * Web search action types
 */
export type WebSearchAction = "search" | "scrape" | "extract" | "map";

/**
 * Web search tool parameters
 */
export interface WebSearchParams {
  action: WebSearchAction;
  query?: string;
  url?: string;
  urls?: string[];
  extractPrompt?: string;
  limit: number;
}
