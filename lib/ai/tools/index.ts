/**
 * Tool registry - exports all available tools for the AI assistant
 */

import { getContact, listContacts, queryNotionDatabase, searchContacts } from "./crm-tools";
import { webSearch } from "./web-tools";

/**
 * All available tools for agentic mode
 */
export const agenticTools = {
  searchContacts,
  getContact,
  listContacts,
  queryNotionDatabase,
  webSearch,
} as const;

export type ToolName = keyof typeof agenticTools;

/**
 * Get filtered tools based on enabled tool names
 * If no enabledTools provided, returns all tools
 */
export function getFilteredTools(
  enabledTools?: string[]
): typeof agenticTools | Record<string, (typeof agenticTools)[ToolName]> | undefined {
  // If no tools specified, return all tools
  if (!enabledTools || enabledTools.length === 0) {
    return agenticTools;
  }

  // Filter to only enabled tools
  const filteredTools: Record<string, (typeof agenticTools)[ToolName]> = {};

  for (const toolName of enabledTools) {
    if (toolName in agenticTools) {
      filteredTools[toolName] = agenticTools[toolName as ToolName];
    }
  }

  // Return undefined if no valid tools found
  return Object.keys(filteredTools).length > 0 ? filteredTools : undefined;
}

// Export individual tools for direct use
export { searchContacts, getContact, listContacts, queryNotionDatabase, webSearch };
