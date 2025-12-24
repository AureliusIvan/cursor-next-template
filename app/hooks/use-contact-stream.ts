"use client";

import type { Contact } from "@prisma/client";
import { useEffect, useRef, useState } from "react";

interface UseContactStreamOptions {
  initialContacts: Contact[];
}

export function useContactStream({ initialContacts }: UseContactStreamOptions) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource("/api/crm/contacts/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "contact.created") {
          // Add new contact to the beginning of the list (newest first)
          setContacts((prev) => [message.data, ...prev]);
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

  return contacts;
}
