"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export function LoadingIndicator() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0, y: 10 }}
      key="loading"
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-muted">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <Card className="rounded-2xl rounded-tl-sm border-0 bg-muted/50 px-4 py-3 shadow-none">
        <div className="flex gap-1">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            className="h-2 w-2 rounded-full bg-muted-foreground/50"
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
          />
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            className="h-2 w-2 rounded-full bg-muted-foreground/50"
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0.2,
            }}
          />
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            className="h-2 w-2 rounded-full bg-muted-foreground/50"
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0.4,
            }}
          />
        </div>
      </Card>
    </motion.div>
  );
}
