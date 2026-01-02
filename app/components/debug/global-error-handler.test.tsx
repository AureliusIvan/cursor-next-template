/**
 * Manual Testing Guide for GlobalErrorHandler
 *
 * Since this component relies on browser APIs (window events) and React hooks,
 * it's best tested manually in a browser environment. This file provides:
 * 1. Manual testing instructions
 * 2. Test helper component for easy testing
 */

/**
 * MANUAL TESTING STEPS:
 *
 * 1. Ensure you're in development mode (NODE_ENV=development)
 *
 * 2. Add GlobalErrorHandler to your app layout:
 *    import { GlobalErrorHandler } from "@/app/components/debug/global-error-handler";
 *    // In your root layout:
 *    <GlobalErrorHandler />
 *
 * 3. Test Synchronous Errors:
 *    Open browser console and run:
 *    throw new Error("Test synchronous error");
 *
 *    Expected results:
 *    - Error logged to console with [Debug Error] prefix
 *    - Error logged with [CLIENT ERROR] prefix
 *    - Error persisted to .cursor/tmp/client-errors.log
 *
 * 4. Test Promise Rejections:
 *    Open browser console and run:
 *    Promise.reject(new Error("Test promise rejection"));
 *
 *    Expected results:
 *    - Error logged to console with [Debug Error] prefix
 *    - Error logged with [CLIENT ERROR] prefix
 *    - Error persisted to .cursor/tmp/client-errors.log
 *
 * 5. Test Non-Error Rejections:
 *    Promise.reject("String rejection");
 *
 * 6. Verify Log File:
 *    Check .cursor/tmp/client-errors.log for persisted errors
 *
 * 7. Test Production Mode:
 *    Set NODE_ENV=production and verify no errors are logged
 *
 * 8. Test Cleanup:
 *    Navigate away from page and verify listeners are removed
 */

"use client";

import { GlobalErrorHandler } from "./global-error-handler";

/**
 * Test helper component for easy manual testing
 * Add this to a test page to trigger errors easily
 *
 * Usage:
 * 1. Create a test page: app/test-error-handler/page.tsx
 * 2. Import and render: <ErrorTestHelper />
 * 3. Click buttons to trigger different error types
 */
export function ErrorTestHelper() {
  const triggerSyncError = () => {
    // Use setTimeout to throw outside React's event handler
    setTimeout(() => {
      throw new Error("Manual test: Synchronous error");
    }, 0);
  };

  const triggerAsyncError = () => {
    setTimeout(() => {
      throw new Error("Manual test: Async error");
    }, 100);
  };

  const triggerPromiseRejection = () => {
    // Create unhandled promise rejection
    Promise.reject(new Error("Manual test: Promise rejection"));
  };

  const triggerStringRejection = () => {
    // Create unhandled promise rejection with string
    Promise.reject("Manual test: String rejection");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <GlobalErrorHandler />
      <h2>Error Handler Test Helper</h2>
      <p>Click buttons to trigger different error types:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button onClick={triggerSyncError} style={{ padding: "10px" }} type="button">
          Trigger Synchronous Error
        </button>
        <button onClick={triggerAsyncError} style={{ padding: "10px" }} type="button">
          Trigger Async Error
        </button>
        <button onClick={triggerPromiseRejection} style={{ padding: "10px" }} type="button">
          Trigger Promise Rejection
        </button>
        <button onClick={triggerStringRejection} style={{ padding: "10px" }} type="button">
          Trigger String Rejection
        </button>
      </div>
      <div
        style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f0f0f0", fontSize: "12px" }}
      >
        <p>
          <strong>Note:</strong> React catches errors in event handlers.
        </p>
        <p>For best results, use the browser console directly:</p>
        <code style={{ display: "block", marginTop: "5px" }}>throw new Error("Test error");</code>
        <code style={{ display: "block", marginTop: "5px" }}>
          Promise.reject(new Error("Test rejection"));
        </code>
        <p style={{ marginTop: "10px" }}>
          Check browser console and .cursor/tmp/client-errors.log for results
        </p>
      </div>
    </div>
  );
}
