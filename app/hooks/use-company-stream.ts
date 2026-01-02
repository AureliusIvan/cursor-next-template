"use client";

import type { Company } from "@prisma/client";
import { useEffect, useRef, useState } from "react";

interface UseCompanyStreamOptions {
  initialCompanies: Company[];
}

export function useCompanyStream({ initialCompanies }: UseCompanyStreamOptions) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource("/api/crm/companies/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "company.created") {
          // Add new company to the beginning of the list (newest first)
          setCompanies((prev) => [message.data, ...prev]);
        } else if (message.type === "ping") {
          // Keep-alive ping, no action needed
        }
      } catch (error) {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      // Connection error - EventSource will auto-reconnect
      // Optionally, we could add retry logic here
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, []);

  return companies;
}
