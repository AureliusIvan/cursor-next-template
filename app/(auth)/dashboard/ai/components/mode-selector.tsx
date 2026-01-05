"use client";

import { Brain, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ChatMode } from "../types";

interface ModeSelectorProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center rounded-xl bg-muted/50 p-1">
      <Button
        className={cn(
          "h-8 gap-1.5 rounded-lg px-3 text-xs transition-all",
          mode === "fast"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => onModeChange("fast")}
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
        onClick={() => onModeChange("agentic")}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Brain className="h-3.5 w-3.5" />
        Agentic
      </Button>
    </div>
  );
}
