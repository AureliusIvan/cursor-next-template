import { contactEvents } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const encoder = new TextEncoder();

  // Use a shared state object that all closures reference
  // This ensures all closures see the same state updates
  const state = {
    keepAliveInterval: null as NodeJS.Timeout | null,
    handleContactEvent: null as ((contact: unknown) => void) | null,
    isClosed: false,
    controllerRef: null as ReadableStreamDefaultController<Uint8Array> | null,
  };

  const cleanup = () => {
    if (state.isClosed) {
      return; // Prevent double cleanup
    }

    // Null out controller FIRST to prevent any send operations
    // This is the critical guard - even if callbacks are running, they'll fail this check
    state.controllerRef = null;

    // Set closed flag
    state.isClosed = true;

    // Clear interval to prevent future callbacks
    if (state.keepAliveInterval) {
      clearInterval(state.keepAliveInterval);
      state.keepAliveInterval = null;
    }

    // Remove event listener
    if (state.handleContactEvent) {
      contactEvents.off("contact.created", state.handleContactEvent);
      state.handleContactEvent = null;
    }
  };

  const stream = new ReadableStream({
    start(controller) {
      state.controllerRef = controller;

      const send = (data: string, _source: string) => {
        // Double-check before attempting to send - check state object
        // This must be checked BEFORE any logging to avoid errors
        if (!state.controllerRef || state.isClosed) {
          return;
        }

        // Wrap entire operation in try-catch to catch any errors
        try {
          // Store controller reference locally from state object
          const currentController = state.controllerRef;
          if (!currentController) {
            return;
          }

          // Attempt to enqueue
          currentController.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (_error: unknown) {
          // Silently return - don't call cleanup() to avoid recursion
          return;
        }
      };

      // Send initial connection message
      send(JSON.stringify({ type: "connected" }), "initial");

      // Listen for contact events
      state.handleContactEvent = (contact: unknown) => {
        if (!state.isClosed && state.controllerRef) {
          send(JSON.stringify({ type: "contact.created", data: contact }), "event");
        }
      };

      contactEvents.on("contact.created", state.handleContactEvent);

      // Keep-alive interval (every 30 seconds)
      state.keepAliveInterval = setInterval(() => {
        // CRITICAL: Synchronous check FIRST - read from shared state object
        // All closures reference the same state object, so updates are visible immediately
        if (!state.controllerRef || state.isClosed) {
          // Stream is closed - clear this interval and exit immediately
          const currentInterval = state.keepAliveInterval;
          if (currentInterval) {
            clearInterval(currentInterval);
            state.keepAliveInterval = null;
          }
          return;
        }

        // Only proceed if we have a valid controller and stream is not closed
        // Attempt to send ping - send() will handle errors gracefully
        send(JSON.stringify({ type: "ping" }), "ping");
      }, 30_000);
    },
    cancel() {
      // Cleanup when stream is cancelled (client disconnect)
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering for nginx
    },
  });
}
