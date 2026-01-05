"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

import { ChatHeader } from "./components/chat-header";
import { ChatInput } from "./components/chat-input";
import { MessageList } from "./components/message-list";
import { useChatInput } from "./hooks/use-chat-input";
import { useChatTools } from "./hooks/use-chat-tools";
import type { ChatMode } from "./types";

export default function Chat() {
  const [mode, setMode] = useState<ChatMode>("fast");
  const [toolsDialogOpen, setToolsDialogOpen] = useState(false);

  const { messages, setMessages, sendMessage, status } = useChat();
  const isLoading = status === "streaming" || status === "submitted";

  const scrollRef = useRef<HTMLDivElement>(null);

  const { tools, toggleTool, enabledToolsCount, enabledTools } = useChatTools();

  const {
    input,
    setInput,
    attachments,
    textareaRef,
    fileInputRef,
    control,
    handleSend: handleInputSend,
    handleKeyDown,
    handleFileSelect,
    removeAttachment,
  } = useChatInput({
    onSend: (inputText, inputAttachments) => {
      sendMessage(
        { text: inputText },
        {
          body: {
            mode,
            enabledTools,
            attachments: inputAttachments.map((a) => ({
              url: a.url,
              type: a.type,
              name: a.name,
            })),
          },
        }
      );
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden p-4 md:p-6">
      <ChatHeader hasMessages={messages.length > 0} onClear={() => setMessages([])} />

      <MessageList
        isLoading={isLoading}
        messages={messages}
        onSuggestionClick={handleSuggestionClick}
        scrollRef={scrollRef}
      />

      <ChatInput
        attachments={attachments}
        enabledToolsCount={enabledToolsCount}
        fileInputRef={fileInputRef}
        hasMessages={messages.length > 0}
        input={input}
        isLoading={isLoading}
        isUploadPending={control.isPending}
        mode={mode}
        onFileSelect={handleFileSelect}
        onInputChange={setInput}
        onKeyDown={handleKeyDown}
        onModeChange={setMode}
        onRemoveAttachment={removeAttachment}
        onSubmit={(e) => {
          e.preventDefault();
          handleInputSend();
        }}
        onToggleTool={toggleTool}
        onToolsDialogOpenChange={setToolsDialogOpen}
        textareaRef={textareaRef}
        tools={tools}
        toolsDialogOpen={toolsDialogOpen}
      />
    </main>
  );
}
