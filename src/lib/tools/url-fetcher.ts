/**
 * URL Fetcher — ambil konten halaman web dan ekstrak teks.
 * Berguna untuk merangkum artikel, dokumentasi, atau halaman web.
 * 100% gratis, tidak perlu API key.
 */

import { fetch } from "expo/fetch";

const MAX_CONTENT_LENGTH = 12000; // ~3000 tokens, batas aman untuk context
const FETCH_TIMEOUT_MS = 15000;

// Strip HTML tags and extract meaningful text
function htmlToText(html: string): string {
  let text = html;

  // Remove script and style elements entirely
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, "");

  // Remove comments
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Remove head section
  text = text.replace(/<head[\s\S]*?<\/head>/gi, "");

  // Replace block elements with newlines for better formatting
  text = text.replace(/<(br|hr|p|div|h[1-6]|li|tr|blockquote|section|article|header|footer|nav|main|aside)[^>]*>/gi, "\n");
  text = text.replace(/<\/(br|hr|p|div|h[1-6]|li|tr|blockquote|section|article|header|footer|nav|main|aside)>/gi, "\n");

  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "");

  // Collapse whitespace
  text = text.replace(/[ \t]+/g, " ");

  // Collapse multiple newlines
  text = text.replace(/\n\s*\n/g, "\n\n");

  // Trim
  text = text.trim();

  return text;
}

// Try to extract the main content (article body) from HTML
function extractMainContent(html: string): string {
  // Try to find article/main content areas
  const articleMatch =
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ||
    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ||
    html.match(/<div[^>]*class="[^"]*(?:content|article|post|entry|body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1];

  if (articleMatch && articleMatch.length > 200) {
    return htmlToText(articleMatch);
  }

  // Fallback: use the whole body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return htmlToText(bodyMatch);
}

// Extract title from HTML
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].replace(/\s+/g, " ").trim();
  }
  const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
  if (ogTitle) return ogTitle[1].trim();
  return "";
}

export type FetchResult = {
  title: string;
  content: string;
  url: string;
  success: boolean;
  error?: string;
};

/**
 * Fetch dan ekstrak teks dari URL.
 * @param url - halaman web yang akan diambil
 * @returns FetchResult dengan title + content
 */
export async function fetchUrl(url: string): Promise<FetchResult> {
  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    // Try adding https://
    try {
      parsedUrl = new URL(`https://${url}`);
    } catch {
      return {
        title: "",
        content: "",
        url,
        success: false,
        error: "URL tidak valid. Contoh: https://example.com",
      };
    }
  }

  // Only allow http/https
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      title: "",
      content: "",
      url,
      success: false,
      error: "Hanya HTTP/HTTPS yang didukung.",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KawanModel/1.0)",
        Accept: "text/html,application/xhtml+xml,*/*",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        title: "",
        content: "",
        url: parsedUrl.toString(),
        success: false,
        error: `Gagal mengakses halaman (HTTP ${response.status}).`,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    const html = await response.text();

    // If it's not HTML (e.g. PDF, JSON, plain text), return as-is
    if (!contentType.includes("html") && !contentType.includes("xhtml")) {
      const text = html.length > MAX_CONTENT_LENGTH
        ? html.slice(0, MAX_CONTENT_LENGTH) + "\n\n... [dipotong]"
        : html;
      return {
        title: parsedUrl.pathname,
        content: text,
        url: parsedUrl.toString(),
        success: true,
      };
    }

    const title = extractTitle(html);
    let content = extractMainContent(html);

    // Truncate if too long
    if (content.length > MAX_CONTENT_LENGTH) {
      content = content.slice(0, MAX_CONTENT_LENGTH) + "\n\n... [konten dipotong karena terlalu panjang]";
    }

    if (!content.trim()) {
      return {
        title,
        content: "(Halaman kosong atau tidak memiliki teks yang dapat diekstrak)",
        url: parsedUrl.toString(),
        success: true,
      };
    }

    return {
      title,
      content,
      url: parsedUrl.toString(),
      success: true,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return {
        title: "",
        content: "",
        url: parsedUrl.toString(),
        success: false,
        error: "Timeout — halaman terlalu lama dimuat (15 detik).",
      };
    }
    return {
      title: "",
      content: "",
      url: parsedUrl.toString(),
      success: false,
      error: `Gagal mengambil konten: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}
