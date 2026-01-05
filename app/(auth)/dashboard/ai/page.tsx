"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

import { ChatHeader } from "./components/chat-header";
import { ChatInput } from "./components/chat-input";
import { MessageList } from "./components/message-list";
import { useChatHistory } from "./hooks/use-chat-history";
import { useChatInput } from "./hooks/use-chat-input";
import { useChatTools } from "./hooks/use-chat-tools";
import type { ChatMode } from "./types";

export default function Chat() {
  const [mode, setMode] = useState<ChatMode>("fast");
  const [toolsDialogOpen, setToolsDialogOpen] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const messagesRef = useRef<typeof messages>([]);

  const { currentSessionId, sessions, loadSession, saveMessage, deleteSession, createSession } =
    useChatHistory({
      sessionId,
      onSessionChange: setSessionId,
    });

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
    onSend: async (inputText, inputAttachments) => {
      // Ensure we have a session
      let sessionToUse = currentSessionId;
      if (!sessionToUse) {
        sessionToUse = await createSession();
        if (!sessionToUse) {
          return;
        }
      }

      // Save user message
      await saveMessage("user", inputText, {
        attachments: inputAttachments.map((a) => ({
          url: a.url,
          type: a.type,
          name: a.name,
        })),
      });

      sendMessage(
        { text: inputText },
        {
          body: {
            mode,
            enabledTools,
            sessionId: sessionToUse,
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

  // Track messages to detect new ones and save them
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Save assistant messages when they're complete
  useEffect(() => {
    const lastMessage = messages.at(-1);
    if (
      lastMessage &&
      lastMessage.role === "assistant" &&
      status !== "streaming" &&
      currentSessionId
    ) {
      // Extract text content from parts
      const textParts = lastMessage.parts.filter((p) => p.type === "text");
      const content = textParts.map((p) => p.text).join("");

      if (content) {
        // Check if this message was already saved (compare with previous state)
        const prevMessages = messagesRef.current.slice(0, -1);
        const isNewMessage = !prevMessages.some((m) => m.id === lastMessage.id);

        if (isNewMessage) {
          const messageData = "data" in lastMessage ? lastMessage.data : undefined;
          saveMessage("assistant", content, messageData).catch(console.error);
        }
      }
    }
  }, [messages, status, currentSessionId, saveMessage]);

  // Load session messages when sessionId changes (from URL or selection)
  useEffect(() => {
    if (currentSessionId && messages.length === 0) {
      loadSession(currentSessionId).then((loadedMessages) => {
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId]); // Only run when sessionId changes, not on every render

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

  const handleClear = async () => {
    if (currentSessionId) {
      await deleteSession(currentSessionId);
    }
    setMessages([]);
    setSessionId(null);
  };

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden p-4 md:p-6">
      <ChatHeader
        currentSessionId={currentSessionId}
        hasMessages={messages.length > 0}
        onClear={handleClear}
        onCreateSession={async () => {
          const newId = await createSession();
          if (newId) {
            setMessages([]);
          }
        }}
        onSessionSelect={async (id) => {
          if (id === null) {
            setMessages([]);
            setSessionId(null);
          } else {
            const loadedMessages = await loadSession(id);
            setMessages(loadedMessages);
          }
        }}
        sessions={sessions}
      />

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
