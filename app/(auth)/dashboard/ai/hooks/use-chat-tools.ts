"use client";

import { useState } from "react";

import { defaultTools } from "../constants";
import type { ToolConfig } from "../types";

export function useChatTools() {
  const [tools, setTools] = useState<ToolConfig[]>(defaultTools);

  const toggleTool = (toolId: string) => {
    setTools((prev) =>
      prev.map((tool) => (tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool))
    );
  };

  const enabledToolsCount = tools.filter((t) => t.enabled).length;
  const enabledTools = tools.filter((t) => t.enabled).map((t) => t.id);

  return {
    tools,
    toggleTool,
    enabledToolsCount,
    enabledTools,
  };
}
