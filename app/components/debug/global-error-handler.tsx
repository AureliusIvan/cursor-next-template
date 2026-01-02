"use client";

import { useEffect } from "react";
import { debugError, logErrorPersistently } from "@/lib/debug";
import { isDev } from "@/lib/dev-utils";

/**
 * Global error handler component for catching unhandled client-side errors
 * Only active in development mode
 * Logs errors to both console and persistent log file
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    if (!isDev()) return;

    // Handle synchronous errors
    const handleError = (event: ErrorEvent) => {
      const error = {
        type: "synchronous" as const,
        message: event.message,
        stack: event.error?.stack,
        location: event.filename
          ? `${event.filename}:${event.lineno}:${event.colno}`
          : undefined,
        timestamp: new Date().toISOString(),
      };

      // Log to console using existing debug utility
      debugError(
        {
          component: "GlobalErrorHandler",
          function: "handleError",
          type: "synchronous",
        },
        event.error instanceof Error ? event.error : new Error(event.message),
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      );

      // Also log in a format Cursor can easily parse
      console.error("[CLIENT ERROR]", error);

      // Persist to file
      logErrorPersistently(error);
    };

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      const errorData = {
        type: "promise_rejection" as const,
        message: error.message,
        stack: error.stack,
        reason: event.reason,
        timestamp: new Date().toISOString(),
      };

      // Log to console using existing debug utility
      debugError(
        {
          component: "GlobalErrorHandler",
          function: "handleRejection",
          type: "promise_rejection",
        },
        error,
      );

      // Also log in a format Cursor can easily parse
      console.error("[CLIENT ERROR]", errorData);

      // Persist to file
      logErrorPersistently(errorData);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
