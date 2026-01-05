"use client";

import { FileText, ImageIcon, X } from "lucide-react";

import type { Attachment } from "../types";

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
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
            onClick={() => onRemove(attachment.id)}
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
