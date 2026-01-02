import { projectEvents } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();

  // Use a shared state object that all closures reference
  const state = {
    keepAliveInterval: null as NodeJS.Timeout | null,
    handleProjectCreated: null as ((project: unknown) => void) | null,
    handleProjectUpdated: null as ((project: unknown) => void) | null,
    handleProjectDeleted: null as ((data: unknown) => void) | null,
    isClosed: false,
    controllerRef: null as ReadableStreamDefaultController<Uint8Array> | null,
  };

  const cleanup = () => {
    if (state.isClosed) return;

    state.controllerRef = null;
    state.isClosed = true;

    if (state.keepAliveInterval) {
      clearInterval(state.keepAliveInterval);
      state.keepAliveInterval = null;
    }

    if (state.handleProjectCreated) {
      projectEvents.off("project.created", state.handleProjectCreated);
      state.handleProjectCreated = null;
    }

    if (state.handleProjectUpdated) {
      projectEvents.off("project.updated", state.handleProjectUpdated);
      state.handleProjectUpdated = null;
    }

    if (state.handleProjectDeleted) {
      projectEvents.off("project.deleted", state.handleProjectDeleted);
      state.handleProjectDeleted = null;
    }
  };

  const stream = new ReadableStream({
    start(controller) {
      state.controllerRef = controller;

      const send = (data: string) => {
        if (!state.controllerRef || state.isClosed) {
          return;
        }

        try {
          const currentController = state.controllerRef;
          if (!currentController) {
            return;
          }

          currentController.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (_error: unknown) {
          return;
        }
      };

      // Send initial connection message
      send(JSON.stringify({ type: "connected" }));

      // Listen for project events
      state.handleProjectCreated = (project: unknown) => {
        if (!state.isClosed && state.controllerRef) {
          send(JSON.stringify({ type: "project.created", data: project }));
        }
      };

      state.handleProjectUpdated = (project: unknown) => {
        if (!state.isClosed && state.controllerRef) {
          send(JSON.stringify({ type: "project.updated", data: project }));
        }
      };

      state.handleProjectDeleted = (data: unknown) => {
        if (!state.isClosed && state.controllerRef) {
          send(JSON.stringify({ type: "project.deleted", data }));
        }
      };

      projectEvents.on("project.created", state.handleProjectCreated);
      projectEvents.on("project.updated", state.handleProjectUpdated);
      projectEvents.on("project.deleted", state.handleProjectDeleted);

      // Keep-alive interval (every 30 seconds)
      state.keepAliveInterval = setInterval(() => {
        if (!state.controllerRef || state.isClosed) {
          const currentInterval = state.keepAliveInterval;
          if (currentInterval) {
            clearInterval(currentInterval);
            state.keepAliveInterval = null;
          }
          return;
        }

        send(JSON.stringify({ type: "ping" }));
      }, 30_000);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
