/**
 * Debug utilities for client-side debugging
 * All functions only log in development mode
 */

import { isDev } from "./dev-utils";

type DebugContext = {
  component?: string;
  function?: string;
  [key: string]: unknown;
};

/**
 * Debug logger that only works in development
 * @param context - Context information (component, function, etc.)
 * @param message - Debug message
 * @param ...args - Additional data to log
 */
export function debug(context: DebugContext | string, message?: string, ...args: unknown[]): void {
  if (!isDev()) return;

  if (typeof context === "string") {
    console.log(`[Debug] ${context}`, message, ...args);
    return;
  }

  const { component, function: fn, ...rest } = context;
  const prefix = [component, fn].filter(Boolean).join("::");
  const logMessage = prefix ? `[Debug] ${prefix}` : "[Debug]";

  if (message) {
    console.log(logMessage, message, ...args);
  } else {
    console.log(logMessage, rest);
  }

  if (Object.keys(rest).length > 0) {
    console.log("Context:", rest);
  }
}

/**
 * Debug error logger with stack trace
 * @param context - Context information
 * @param error - Error object or error message
 * @param ...args - Additional data to log
 */
export function debugError(
  context: DebugContext | string,
  error: Error | string,
  ...args: unknown[]
): void {
  if (!isDev()) return;

  if (typeof context === "string") {
    console.error(`[Debug Error] ${context}`, error, ...args);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    return;
  }

  const { component, function: fn, ...rest } = context;
  const prefix = [component, fn].filter(Boolean).join("::");
  const logMessage = prefix ? `[Debug Error] ${prefix}` : "[Debug Error]";

  console.error(logMessage, error, ...args);
  if (error instanceof Error) {
    console.error("Stack:", error.stack);
  }

  if (Object.keys(rest).length > 0) {
    console.error("Context:", rest);
  }
}

/**
 * Create a grouped console log for better organization
 * @param label - Group label
 * @param fn - Function to execute within the group
 */
export function debugGroup(label: string, fn: () => void): void {
  if (!isDev()) {
    fn();
    return;
  }

  console.group(`[Debug Group] ${label}`);
  try {
    fn();
  } finally {
    console.groupEnd();
  }
}

/**
 * Start a performance timer
 * @param label - Timer label
 * @param context - Optional context information
 */
export function debugTime(label: string, context?: DebugContext): void {
  if (!isDev()) return;

  const contextStr = context
    ? ` ${[context.component, context.function].filter(Boolean).join("::")}`
    : "";
  console.time(`[Debug Time]${contextStr} ${label}`);
}

/**
 * End a performance timer
 * @param label - Timer label (must match debugTime label)
 * @param context - Optional context information
 */
export function debugTimeEnd(label: string, context?: DebugContext): void {
  if (!isDev()) return;

  const contextStr = context
    ? ` ${[context.component, context.function].filter(Boolean).join("::")}`
    : "";
  console.timeEnd(`[Debug Time]${contextStr} ${label}`);
}

/**
 * Log a table for better data visualization
 * @param data - Data to display as table
 * @param context - Optional context information
 */
export function debugTable(data: unknown, context?: DebugContext): void {
  if (!isDev()) return;

  const prefix = context
    ? `[Debug Table] ${[context.component, context.function].filter(Boolean).join("::")}`
    : "[Debug Table]";
  console.log(prefix);
  console.table(data);
}

/**
 * Log error persistently to file via API endpoint
 * Only works in development mode
 * Silently handles failures to avoid breaking error handling flow
 * @param errorData - Error data object to log
 */
export async function logErrorPersistently(errorData: Record<string, unknown>): Promise<void> {
  if (!isDev()) return;
  if (typeof window === "undefined") return; // Only works client-side

  try {
    await fetch("/api/debug/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorData),
    });
  } catch (error) {
    // Silently fail - don't break error handling if logging fails
    // Errors are already logged to console via debugError()
  }
}
