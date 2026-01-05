"use client";

import type { UIMessage } from "@ai-sdk/react";
import { AnimatePresence } from "framer-motion";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { EmptyState } from "./empty-state";
import { LoadingIndicator } from "./loading-indicator";
import { MessageItem } from "./message-item";

interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onSuggestionClick: (suggestion: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  scrollRef,
  onSuggestionClick,
}: MessageListProps) {
  return (
    <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
      <div className={cn("space-y-4", messages.length > 0 ? "pb-40" : "pb-4")}>
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={onSuggestionClick} />
          ) : (
            messages.map((message, index) => (
              <MessageItem index={index} key={message.id} message={message} />
            ))
          )}

          {isLoading && <LoadingIndicator />}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
