/**
 * Development utility functions
 * These helpers ensure development-only code is properly handled
 */

/**
 * Check if the code is running in development mode
 * @returns true if in development, false otherwise
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Execute a function only in development mode
 * @param fn - Function to execute in development mode
 * @param fallback - Optional fallback value for production
 * @returns Result of fn in development, fallback in production
 */
export function devOnly<T>(fn: () => T, fallback?: T): T | undefined {
  if (isDev()) {
    return fn();
  }
  return fallback;
}

/**
 * Assert a condition in development mode
 * @param condition - Condition to assert
 * @param message - Error message if assertion fails
 * @throws Error in development if condition is false
 */
export function devAssert(condition: boolean, message: string): asserts condition {
  if (isDev() && !condition) {
    throw new Error(`[Dev Assertion Failed] ${message}`);
  }
}

/**
 * Log a warning only in development mode
 * @param message - Warning message
 * @param ...args - Additional arguments to log
 */
export function devWarn(message: string, ...args: unknown[]): void {
  if (isDev()) {
    console.warn(`[Dev Warning] ${message}`, ...args);
  }
}
