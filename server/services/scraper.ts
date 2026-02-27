import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import pdf from "pdf-parse";
import type { ExtractedPaper } from "../../shared/types.js";

/**
 * Convert arxiv.org/abs/ID to arxiv.org/pdf/ID for direct PDF access
 */
function normalizeArxivUrl(url: string): { targetUrl: string; isArxiv: boolean } {
  const arxivAbsMatch = url.match(/arxiv\.org\/abs\/([\d.]+)/);
  if (arxivAbsMatch) {
    return {
      targetUrl: `https://arxiv.org/pdf/${arxivAbsMatch[1]}`,
      isArxiv: true,
    };
  }
  if (url.includes("arxiv.org/pdf/")) {
    return { targetUrl: url, isArxiv: true };
  }
  return { targetUrl: url, isArxiv: false };
}

function isPdfUrl(url: string): boolean {
  return url.endsWith(".pdf") || url.includes("arxiv.org/pdf/");
}

/**
 * Extract text from a PDF buffer (used by both URL fetch and file upload)
 */
export async function extractFromPdfBuffer(
  buffer: Buffer,
  source: string
): Promise<ExtractedPaper> {
  const data = await pdf(buffer);

  if (!data.text || data.text.trim().length < 100) {
    throw new Error("Could not extract meaningful text from PDF. The file may be image-based or corrupted.");
  }

  const title =
    data.info?.Title ||
    data.text.split("\n").find((line: string) => line.trim().length > 5)?.trim() ||
    "Untitled Paper";

  return {
    title,
    content: data.text.trim(),
    source,
  };
}

/**
 * Scrape a paper from a URL (handles both HTML pages and PDFs, including arXiv)
 */
export async function scrapeArticle(url: string): Promise<ExtractedPaper> {
  const { targetUrl } = normalizeArxivUrl(url);

  let response;
  try {
    response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
    });
  } catch (err: any) {
    throw new Error(
      `Could not connect to ${new URL(targetUrl).hostname}. The site may be blocking automated requests. Try uploading the PDF directly.`
    );
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch paper: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";

  // Route to PDF extraction if content-type is PDF or URL ends in .pdf
  if (contentType.includes("application/pdf") || isPdfUrl(targetUrl)) {
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hostname = new URL(targetUrl).hostname.replace("www.", "");
    return extractFromPdfBuffer(buffer, hostname);
  }

  // Otherwise, use HTML + Readability extraction
  const html = await response.text();
  const dom = new JSDOM(html, { url: targetUrl });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article || !article.textContent || article.textContent.trim().length < 100) {
    throw new Error(
      "Could not extract paper content. The site may require JavaScript or block scraping. Try uploading the PDF directly."
    );
  }

  const hostname = new URL(targetUrl).hostname.replace("www.", "");

  return {
    title: article.title || "Untitled Paper",
    content: article.textContent.trim(),
    source: hostname,
  };
}
