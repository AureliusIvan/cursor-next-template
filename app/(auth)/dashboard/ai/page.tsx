"use client";

import { useChat } from "@ai-sdk/react";
import { useUploadFiles } from "@better-upload/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Brain,
  Database,
  FileText,
  Globe,
  ImageIcon,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  User,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatMode = "fast" | "agentic";

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
}

interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

const defaultTools: ToolConfig[] = [
  {
    id: "searchContacts",
    name: "CRM Search",
    description: "Search contacts by name, email, or company",
    icon: Search,
    enabled: true,
  },
  {
    id: "listContacts",
    name: "List Contacts",
    description: "List all contacts with pagination",
    icon: Database,
    enabled: true,
  },
  {
    id: "getContact",
    name: "Contact Details",
    description: "Get detailed information about a contact",
    icon: User,
    enabled: true,
  },
  {
    id: "queryNotionDatabase",
    name: "Notion Query",
    description: "Query Notion database directly",
    icon: Database,
    enabled: true,
  },
  {
    id: "webSearch",
    name: "Web Search",
    description: "Search the web, scrape pages, and extract data",
    icon: Globe,
    enabled: true,
  },
];

const suggestions = [
  "Explain quantum computing",
  "Write a haiku about coding",
  "Help me debug my code",
  "What are design patterns?",
];

export default function Chat() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("fast");
  const [tools, setTools] = useState<ToolConfig[]>(defaultTools);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [toolsDialogOpen, setToolsDialogOpen] = useState(false);

  const { messages, setMessages, sendMessage, status } = useChat();
  const isLoading = status === "streaming" || status === "submitted";

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload hook
  const { control } = useUploadFiles({
    route: "chatAttachments",
    onUploadComplete: (files: any) => {
      const newAttachments = files.map((file: any) => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        url: file.url,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    },
  });

  // Auto-scroll to bottom on new messages
  const messageCount = messages.length;
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageCount]);

  const handleSend = () => {
    if (input.trim() || attachments.length > 0) {
      const enabledTools = tools.filter((t) => t.enabled).map((t) => t.id);

      sendMessage(
        { text: input },
        {
          body: {
            mode,
            enabledTools,
            attachments: attachments.map((a) => ({
              url: a.url,
              type: a.type,
              name: a.name,
            })),
          },
        }
      );
      setInput("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      control.upload(Array.from(files));
    }
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleTool = (toolId: string) => {
    setTools((prev) =>
      prev.map((tool) => (tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool))
    );
  };

  const enabledToolsCount = tools.filter((t) => t.enabled).length;

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      {/* Header */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-xl">AI Assistant</h1>
            <p className="text-muted-foreground text-sm">Powered by LLM</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            className="rounded-xl text-muted-foreground hover:text-destructive"
            onClick={() => setMessages([])}
            size="sm"
            variant="ghost"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </motion.div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
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
                        onClick={() => handleSuggestionClick(suggestion)}
                        variant="outline"
                      >
                        {suggestion}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
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
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`max-w-[75%] ${
                      message.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
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
              ))
            )}

            {/* Loading indicator */}
            {isLoading && (
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
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mt-4 rounded-2xl border bg-card/50 p-3 shadow-lg backdrop-blur-sm">
          {/* Attachment preview */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div
                  className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-sm"
                  key={attachment.id}
                >
                  {attachment.type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="max-w-[120px] truncate">{attachment.name}</span>
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => removeAttachment(attachment.id)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            {/* Row 1: Attachment, Textarea, Send */}
            <div className="flex items-center gap-2">
              {/* Attachment button */}
              <Button
                className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
                disabled={control.isPending}
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
                onChange={handleFileSelect}
                ref={fileInputRef}
                type="file"
              />

              <Textarea
                className="min-h-[44px] flex-1 resize-none rounded-xl border-0 bg-transparent shadow-none focus-visible:ring-0"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
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
              {/* Mode buttons */}
              <div className="flex items-center rounded-xl bg-muted/50 p-1">
                <Button
                  className={cn(
                    "h-8 gap-1.5 rounded-lg px-3 text-xs transition-all",
                    mode === "fast"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setMode("fast")}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Fast
                </Button>
                <Button
                  className={cn(
                    "h-8 gap-1.5 rounded-lg px-3 text-xs transition-all",
                    mode === "agentic"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setMode("agentic")}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Brain className="h-3.5 w-3.5" />
                  Agentic
                </Button>
              </div>

              {/* Tools button with dialog */}
              <Dialog onOpenChange={setToolsDialogOpen} open={toolsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="h-8 gap-1.5 rounded-lg px-3 text-muted-foreground text-xs hover:text-foreground"
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    Tools
                    {enabledToolsCount > 0 && (
                      <span className="ml-1 rounded-full bg-primary/20 px-1.5 font-medium text-[10px] text-primary">
                        {enabledToolsCount}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Tools
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-muted-foreground text-sm">
                      Enable tools to give the AI access to your data. Only available in Agentic
                      mode.
                    </p>
                    <div className="space-y-3">
                      {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <div
                            className="flex items-center justify-between rounded-lg border p-3"
                            key={tool.id}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{tool.name}</p>
                                <p className="text-muted-foreground text-xs">{tool.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={tool.enabled}
                              onCheckedChange={() => toggleTool(tool.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </Card>
      </motion.div>
    </main>
  );
}
