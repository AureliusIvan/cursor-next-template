"use client";

import { Component, type ReactNode } from "react";
import { debug, debugError, logErrorPersistently } from "@/lib/debug";
import { isDev } from "@/lib/dev-utils";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component for catching client-side errors
 * Displays detailed error information in development mode
 * Shows user-friendly message in production
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    debugError(
      {
        component: "ErrorBoundary",
        function: "componentDidCatch",
      },
      error,
      errorInfo,
    );

    // Log error persistently
    logErrorPersistently({
      type: "error_boundary",
      message: error.message,
      stack: error.stack,
      component: "ErrorBoundary",
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    debug(
      {
        component: "ErrorBoundary",
        function: "handleReset",
      },
      "Resetting error boundary",
    );
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (isDev()) {
        return (
          <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-8 dark:bg-red-950/20">
            <div className="w-full max-w-2xl rounded-lg border border-red-200 bg-white p-6 shadow-lg dark:border-red-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
                Development Error
              </h2>
              {this.state.error && (
                <div className="mb-4">
                  <p className="mb-2 font-semibold text-red-800 dark:text-red-300">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="overflow-auto rounded bg-red-50 p-4 text-xs text-red-900 dark:bg-red-950/30 dark:text-red-200">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={this.handleReset}
                className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 dark:bg-black">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Something went wrong
            </h2>
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              We encountered an unexpected error. Please try refreshing the
              page.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="rounded bg-black px-4 py-2 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
