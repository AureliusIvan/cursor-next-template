"use client";

import { motion } from "framer-motion";
import { Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  hasMessages: boolean;
  onClear: () => void;
}

export function ChatHeader({ hasMessages, onClear }: ChatHeaderProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex shrink-0 items-center justify-between"
      initial={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-indigo-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-xl">AI Assistant</h1>
          <p className="text-muted-foreground text-sm">Powered by LLM</p>
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
