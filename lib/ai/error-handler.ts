/**
 * Centralized error detection and handling for AI operations
 */

import { debugError } from "@/lib/debug";
import type { ErrorInfo } from "./types";

/**
 * Detect and classify error types from various AI provider errors
 */
export function detectErrorType(error: unknown): ErrorInfo {
  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

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
        typeof retryAfter === "number" ? retryAfter : Number.parseInt(retryAfter, 10) || 60,
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

/**
 * Build a standardized error response
 */
export function buildErrorResponse(error: unknown): Response {
  // Log the error for debugging
  debugError({ module: "ChatAPI" }, error);

  // Detect error type
  const errorInfo = detectErrorType(error);

  // Build error response body
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
