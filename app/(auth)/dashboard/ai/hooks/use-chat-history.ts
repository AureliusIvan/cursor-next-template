"use client";

import type { UIMessage } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

interface ChatSession {
  id: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

interface ChatMessage {
  id: number;
  role: string;
  content: string;
  metadata: unknown;
  createdAt: string;
}

interface UseChatHistoryOptions {
  sessionId?: number | null;
  onSessionChange?: (sessionId: number | null) => void;
}

interface UseChatHistoryReturn {
  currentSessionId: number | null;
  sessions: ChatSession[];
  isLoading: boolean;
  error: string | null;
  createSession: () => Promise<number | null>;
  loadSession: (sessionId: number) => Promise<UIMessage[]>;
  saveMessage: (role: string, content: string, metadata?: unknown) => Promise<void>;
  deleteSession: (sessionId: number) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

export function useChatHistory({
  sessionId: initialSessionId,
  onSessionChange,
}: UseChatHistoryOptions = {}): UseChatHistoryReturn {
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(initialSessionId || null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef<Set<string>>(new Set()); // Track messages being saved to avoid duplicates

  // Load sessions on mount
  useEffect(() => {
    refreshSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update current session when prop changes
  useEffect(() => {
    if (initialSessionId !== undefined && initialSessionId !== currentSessionId) {
      setCurrentSessionId(initialSessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSessionId]);

  const refreshSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/chat/sessions");
      if (!response.ok) {
        throw new Error("Failed to load sessions");
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (): Promise<number | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      const newSessionId = data.session.id;
      setCurrentSessionId(newSessionId);
      onSessionChange?.(newSessionId);
      await refreshSessions();
      return newSessionId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (sessionId: number): Promise<UIMessage[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/chat/sessions/${sessionId}`);

      if (!response.ok) {
        throw new Error("Failed to load session");
      }

      const data = await response.json();
      const messages: UIMessage[] = (data.session.messages || []).map((msg: ChatMessage) => {
        const message: UIMessage = {
          id: String(msg.id),
          role: msg.role as "user" | "assistant" | "system",
          parts: [
            {
              type: "text" as const,
              text: msg.content,
            },
          ],
        } as UIMessage;
        if (msg.metadata && typeof msg.metadata === "object") {
          (message as UIMessage & { data?: unknown }).data = msg.metadata;
        }
        return message;
      });

      setCurrentSessionId(sessionId);
      onSessionChange?.(sessionId);
      return messages;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessage = async (role: string, content: string, metadata?: unknown): Promise<void> => {
    if (!currentSessionId) {
      // Auto-create session if none exists
      const newSessionId = await createSession();
      if (!newSessionId) {
        return;
      }
    }

    const sessionIdToUse = currentSessionId;
    if (!sessionIdToUse) {
      return;
    }

    // Create a unique key for this message to avoid duplicate saves
    const messageKey = `${sessionIdToUse}-${role}-${content.slice(0, 50)}`;
    if (savingRef.current.has(messageKey)) {
      return; // Already saving this message
    }

    savingRef.current.add(messageKey);

    try {
      const response = await fetch(`/api/chat/sessions/${sessionIdToUse}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          content,
          metadata: metadata || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save message");
      }

      // Refresh sessions to update updatedAt timestamp
      await refreshSessions();
    } catch (err) {
      console.error("Failed to save message:", err);
      // Don't set error state here - failing to save shouldn't break the UI
    } finally {
      savingRef.current.delete(messageKey);
    }
  };

  const deleteSession = async (sessionId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      // If deleting current session, clear it
      if (sessionId === currentSessionId) {
        setCurrentSessionId(null);
        onSessionChange?.(null);
      }

      await refreshSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete session");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentSessionId,
    sessions,
    isLoading,
    error,
    createSession,
    loadSession,
    saveMessage,
    deleteSession,
    refreshSessions,
  };
}
