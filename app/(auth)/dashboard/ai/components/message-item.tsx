"use client";

import type { UIMessage } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { Streamdown } from "streamdown";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface MessageItemProps {
  message: UIMessage;
  index: number;
}

export function MessageItem({ message, index }: MessageItemProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: 10 }}
      key={message.id}
      transition={{ delay: index * 0.05 }}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={
            message.role === "user"
              ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
              : "bg-muted"
          }
        >
          {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`max-w-[75%] ${message.role === "user" ? "items-end" : "items-start"}`}>
        {message.role === "user" ? (
          <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-violet-600 to-indigo-600 px-4 py-3 text-white">
            {message.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <p className="whitespace-pre-wrap" key={`${message.id}-${i}`}>
                    {part.text}
                  </p>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <Card className="rounded-2xl rounded-tl-sm border-0 bg-muted/50 px-4 py-3 shadow-none">
            {message.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <Streamdown
                    className="prose prose-sm dark:prose-invert max-w-none"
                    key={`${message.id}-${i}`}
                  >
                    {part.text}
                  </Streamdown>
                );
              }
              return null;
            })}
          </Card>
        )}
      </div>
    </motion.div>
  );
}
