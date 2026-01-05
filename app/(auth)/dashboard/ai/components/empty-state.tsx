"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { suggestions } from "../constants";

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16"
      exit={{ opacity: 0, scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.95 }}
      key="empty"
    >
      {/* Animated gradient orb */}
      <motion.div
        animate={{ rotate: 360 }}
        className="relative mb-8 h-32 w-32"
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 blur-xl" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500/40 to-indigo-500/40 blur-lg" />
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-violet-500/50 to-indigo-500/50 blur-md" />
        <div className="absolute inset-12 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
      </motion.div>

      <h2 className="mb-2 font-semibold text-2xl">How can I help you?</h2>
      <p className="mb-6 text-center text-muted-foreground">
        Ask me anything or try one of these suggestions
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion, i) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            key={suggestion}
            transition={{ delay: i * 0.1 }}
          >
            <Badge
              className="cursor-pointer rounded-xl px-4 py-2 text-sm transition-colors hover:bg-primary/10"
              onClick={() => onSuggestionClick(suggestion)}
              variant="outline"
            >
              {suggestion}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
