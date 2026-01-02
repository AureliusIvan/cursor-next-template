"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/app/generated/prisma/client/browser";

interface UseProjectStreamOptions {
  initialProjects: Project[];
}

export function useProjectStream({ initialProjects }: UseProjectStreamOptions) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource("/api/crm/projects/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "project.created") {
          // Add new project to the beginning of the list (newest first)
          setProjects((prev) => [message.data, ...prev]);
        } else if (message.type === "project.updated") {
          // Update existing project in the list
          setProjects((prev) => prev.map((p) => (p.id === message.data.id ? message.data : p)));
        } else if (message.type === "project.deleted") {
          // Remove deleted project from the list
          setProjects((prev) => prev.filter((p) => p.id !== message.data.id));
        } else if (message.type === "ping") {
          // Keep-alive ping, no action needed
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      // Connection error - EventSource will auto-reconnect
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, []);

  return projects;
}
