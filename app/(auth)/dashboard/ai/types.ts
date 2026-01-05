export type ChatMode = "fast" | "agentic";

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}
