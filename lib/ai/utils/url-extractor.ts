/**
 * URL extraction and validation utilities
 */

/**
 * Extract URLs from text using regex
 * Supports: https://, http://, www., and domain patterns
 */
export function extractUrls(text: string): string[] {
  const urlRegex =
    /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g;
  const matches = text.match(urlRegex);

  if (!matches) {
    return [];
  }

  // Normalize URLs and deduplicate
  const normalized = matches.map((url) =>
    url.startsWith("http") ? url : `https://${url}`,
  );

  return [...new Set(normalized)];
}

/**
 * Validate if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize URL for consistent comparison
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slash and hash
    return parsed.origin + parsed.pathname.replace(/\/$/, "") + parsed.search;
  } catch {
    return url;
  }
}
