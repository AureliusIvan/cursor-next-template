"use client";

import { Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import type { ToolConfig } from "../types";

interface ToolsDialogProps {
  tools: ToolConfig[];
  enabledToolsCount: number;
  onToggleTool: (toolId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolsDialog({
  tools,
  enabledToolsCount,
  onToggleTool,
  open,
  onOpenChange,
}: ToolsDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
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
            Enable tools to give the AI access to your data. Only available in Agentic mode.
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
                  <Switch checked={tool.enabled} onCheckedChange={() => onToggleTool(tool.id)} />
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
