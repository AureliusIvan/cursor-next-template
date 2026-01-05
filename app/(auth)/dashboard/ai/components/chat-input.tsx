"use client";

import { motion } from "framer-motion";
import { Plus, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { Attachment, ChatMode } from "../types";

import { AttachmentPreview } from "./attachment-preview";
import { ModeSelector } from "./mode-selector";
import { ToolsDialog } from "./tools-dialog";

interface ChatInputProps {
  input: string;
  attachments: Attachment[];
  mode: ChatMode;
  tools: Array<{
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    enabled: boolean;
  }>;
  enabledToolsCount: number;
  toolsDialogOpen: boolean;
  hasMessages: boolean;
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  isUploadPending: boolean;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (id: string) => void;
  onModeChange: (mode: ChatMode) => void;
  onToggleTool: (toolId: string) => void;
  onToolsDialogOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({
  input,
  attachments,
  mode,
  tools,
  enabledToolsCount,
  toolsDialogOpen,
  hasMessages,
  isLoading,
  fileInputRef,
  textareaRef,
  isUploadPending,
  onInputChange,
  onKeyDown,
  onFileSelect,
  onRemoveAttachment,
  onModeChange,
  onToggleTool,
  onToolsDialogOpenChange,
  onSubmit,
}: ChatInputProps) {
  const { state: sidebarState, isMobile } = useSidebar();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "z-50 shrink-0 transition-all",
        hasMessages
          ? (() => {
              const baseClasses = "fixed bottom-4";
              if (isMobile) {
                return cn(baseClasses, "right-4 left-4");
              }
              if (sidebarState === "collapsed") {
                return cn(baseClasses, "right-6 left-[calc(var(--sidebar-width-icon)+1rem)]");
              }
              return cn(baseClasses, "right-6 left-[calc(var(--sidebar-width)+1rem)]");
            })()
          : "relative mt-4"
      )}
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="rounded-2xl border bg-card/95 p-3 shadow-xl backdrop-blur-md dark:bg-card/90">
        <AttachmentPreview attachments={attachments} onRemove={onRemoveAttachment} />

        <form className="space-y-3" onSubmit={onSubmit}>
          {/* Row 1: Attachment, Textarea, Send */}
          <div className="flex items-center gap-2">
            {/* Attachment button */}
            <Button
              className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
              disabled={isUploadPending}
              onClick={() => fileInputRef.current?.click()}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <input
              accept="image/*,application/pdf,text/*"
              className="hidden"
              multiple
              onChange={onFileSelect}
              ref={fileInputRef}
              type="file"
            />

            <Textarea
              className="min-h-[44px] flex-1 resize-none rounded-xl border-0 bg-transparent shadow-none focus-visible:ring-0"
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a message..."
              ref={textareaRef}
              rows={1}
              value={input}
            />

            <Button
              className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 transition-transform hover:scale-105"
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              size="icon"
              type="submit"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Row 2: Mode buttons + Tools */}
          <div className="flex items-center gap-2">
            <ModeSelector mode={mode} onModeChange={onModeChange} />

            <ToolsDialog
              enabledToolsCount={enabledToolsCount}
              onOpenChange={onToolsDialogOpenChange}
              onToggleTool={onToggleTool}
              open={toolsDialogOpen}
              tools={tools}
            />
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
