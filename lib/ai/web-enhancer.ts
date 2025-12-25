/**
 * Message enhancement with web content fetching
 */

import { debug } from "@/lib/debug";
import type { WebContent } from "./types";
import { fetchMultipleContents } from "./utils/content-fetcher";
import { extractUrls } from "./utils/url-extractor";

/**
 * Extract URLs from the last user message
 */
export function extractUrlsFromMessages(messages: any[]): string[] {
  const lastMessage = messages[messages.length - 1];

  if (lastMessage?.role !== "user") {
    return [];
  }

  const content = lastMessage.content || "";
  return extractUrls(content);
}

/**
 * Fetch web content for detected URLs (in parallel)
 */
export async function fetchWebContentsForUrls(
  urls: string[],
  maxUrls = 3,
): Promise<WebContent[]> {
  if (urls.length === 0) {
    return [];
  }

  debug(
    { module: "WebEnhancer" },
    `Found ${urls.length} URLs, fetching up to ${maxUrls}`,
  );

  // Fetch content in parallel
  return fetchMultipleContents(urls, maxUrls);
}

/**
 * Format web content for inclusion in message context
 */
export function formatWebContentContext(
  webContents: WebContent[],
  maxContentLength = 8000,
): string {
  if (webContents.length === 0) {
    return "";
  }

  const formattedContent = webContents
    .map(
      ({ url, content }) =>
        `URL: ${url}\nContent:\n${content.substring(0, maxContentLength)}\n---\n`,
    )
    .join("\n");

  return `Here is additional context from web pages:\n\n${formattedContent}`;
}

/**
 * Enhance messages with web content from detected URLs
 * This is the main orchestration function
 */
export async function enhanceMessagesWithWebContent(
  messages: any[],
  options: {
    maxUrls?: number;
    maxContentLength?: number;
  } = {},
): Promise<any[]> {
  const { maxUrls = 3, maxContentLength = 8000 } = options;

  // Extract URLs from the last message
  const urls = extractUrlsFromMessages(messages);

  if (urls.length === 0) {
    debug({ module: "WebEnhancer" }, "No URLs found in messages");
    return messages;
  }

  // Fetch web content in parallel
  const webContents = await fetchWebContentsForUrls(urls, maxUrls);

  if (webContents.length === 0) {
    debug({ module: "WebEnhancer" }, "No web content fetched successfully");
    return messages;
  }

  // Format context
  const contextMessage = formatWebContentContext(webContents, maxContentLength);

  // Enhance the last message with context
  const enhancedMessages = [...messages];
  const lastMessage = enhancedMessages[enhancedMessages.length - 1];

  enhancedMessages[enhancedMessages.length - 1] = {
    ...lastMessage,
    content: `${lastMessage.content}\n\n${contextMessage}`,
  };

  debug(
    { module: "WebEnhancer" },
    `Enhanced message with ${webContents.length} web contents`,
  );

  return enhancedMessages;
}
