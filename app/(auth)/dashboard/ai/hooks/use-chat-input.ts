"use client";

import { useUploadFiles } from "@better-upload/client";
import { useRef, useState } from "react";

import type { Attachment } from "../types";

interface UseChatInputOptions {
  onSend: (input: string, attachments: Attachment[]) => void;
}

export function useChatInput({ onSend }: UseChatInputOptions) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
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

  const handleSend = () => {
    if (input.trim() || attachments.length > 0) {
      onSend(input, attachments);
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

  return {
    input,
    setInput,
    attachments,
    textareaRef,
    fileInputRef,
    control,
    handleSend,
    handleKeyDown,
    handleFileSelect,
    removeAttachment,
  };
}
