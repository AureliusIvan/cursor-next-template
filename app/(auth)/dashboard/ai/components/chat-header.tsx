"use client";

import { motion } from "framer-motion";
import { Plus, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatSession {
  id: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

interface ChatHeaderProps {
  hasMessages: boolean;
  onClear: () => void;
  sessions: ChatSession[];
  currentSessionId: number | null;
  onSessionSelect: (sessionId: number | null) => void;
  onCreateSession: () => void;
}

export function ChatHeader({
  hasMessages,
  onClear,
  sessions,
  currentSessionId,
  onSessionSelect,
  onCreateSession,
}: ChatHeaderProps) {
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex shrink-0 items-center justify-between gap-4"
      initial={{ opacity: 0, y: -10 }}
    >
      <div className="flex flex-1 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-indigo-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-xl">AI Assistant</h1>
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(value) => {
                if (value === "new") {
                  onCreateSession();
                } else {
                  onSessionSelect(Number.parseInt(value, 10));
                }
              }}
              value={currentSessionId?.toString() || "new"}
            >
              <SelectTrigger className="h-7 w-fit border-0 bg-transparent px-0 text-muted-foreground text-sm shadow-none hover:text-foreground">
                <SelectValue>
                  {currentSession
                    ? currentSession.title || `Chat ${currentSession.id}`
                    : "New Chat"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Chat
                  </div>
                </SelectItem>
                {sessions.length > 0 &&
                  sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      <div className="flex flex-col">
                        <span>{session.title || `Chat ${session.id}`}</span>
                        {session._count && session._count.messages > 0 && (
                          <span className="text-muted-foreground text-xs">
                            {session._count.messages} messages
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-sm">Powered by LLM</p>
          </div>
        </div>
      </div>
      {hasMessages && (
        <Button
          className="rounded-xl text-muted-foreground hover:text-destructive"
          onClick={onClear}
          size="sm"
          variant="ghost"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </motion.div>
  );
}
