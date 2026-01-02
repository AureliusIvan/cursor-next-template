/**
 * Web content fetching with Firecrawl integration and caching
 */

import Firecrawl from "@mendable/firecrawl-js";
import { debug, debugError } from "@/lib/debug";

/**
 * Simple in-memory cache with TTL
 */
class ContentCache {
  private cache = new Map<string, { content: string; timestamp: number }>();
  private readonly ttl: number;

  constructor(ttlMinutes = 10) {
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  get(url: string): string | null {
    const cached = this.cache.get(url);
    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(url);
      return null;
    }

    debug({ module: "ContentCache" }, `Cache hit for ${url}`);
    return cached.content;
  }

  set(url: string, content: string): void {
    this.cache.set(url, {
      content,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Singleton cache instance
const cache = new ContentCache(10);

/**
 * Fetch web content using Firecrawl
 * Returns null if Firecrawl is not configured or if fetching fails
 */
export async function fetchWebContent(url: string): Promise<string | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    debug({ module: "ContentFetcher" }, "Firecrawl API key not configured");
    return null;
  }

  // Check cache first
  const cached = cache.get(url);
  if (cached) {
    return cached;
  }

  try {
    debug({ module: "ContentFetcher" }, `Fetching content from ${url}`);
    const client = new Firecrawl({ apiKey });
    const doc = await client.scrape(url, {
      formats: ["markdown"],
    });

    if (doc.markdown) {
      // Cache the result
      cache.set(url, doc.markdown);
      return doc.markdown;
    }

    return null;
  } catch (error) {
    debugError({ module: "ContentFetcher" }, error, { url });
    return null;
  }
}

/**
 * Fetch content from multiple URLs in parallel
 * Returns array of successful fetches only
 */
export async function fetchMultipleContents(
  urls: string[],
  maxConcurrent = 3
): Promise<Array<{ url: string; content: string }>> {
  if (urls.length === 0) {
    return [];
  }

  debug(
    { module: "ContentFetcher" },
    `Fetching ${urls.length} URLs in parallel (max ${maxConcurrent})`
  );

  // Limit concurrent requests
  const limitedUrls = urls.slice(0, maxConcurrent);

  // Fetch all in parallel
  const results = await Promise.allSettled(
    limitedUrls.map(async (url) => {
      const content = await fetchWebContent(url);
      return { url, content };
    })
  );

  // Filter successful results with content
  const successful = results
    .filter(
      (
        result
      ): result is PromiseFulfilledResult<{
        url: string;
        content: string | null;
      }> => result.status === "fulfilled" && result.value.content !== null
    )
    .map((result) => ({
      url: result.value.url,
      content: result.value.content as string,
    }));

  debug(
    { module: "ContentFetcher" },
    `Successfully fetched ${successful.length}/${urls.length} URLs`
  );

  return successful;
}

/**
 * Clear the content cache (useful for testing)
 */
export function clearContentCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size(),
  };
}
