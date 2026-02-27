import { Router } from "express";
import multer from "multer";
import { scrapeArticle, extractFromPdfBuffer } from "./services/scraper.js";
import { analyzePaper } from "./services/claude.js";
import { initSSE } from "./services/sse.js";
import type { SimplifyResponse } from "../shared/types.js";

const router = Router();

// Configure multer for in-memory storage (no disk writes needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted") as any);
    }
  },
});

// POST /api/simplify — URL-based paper extraction (SSE stream)
router.post("/api/simplify", async (req, res) => {
  const { url } = req.body;

  // Validation errors return normal JSON (before SSE starts)
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  // Start SSE stream
  const sse = initSSE(res);
  sse.startHeartbeat();

  try {
    sse.sendStatus("Fetching paper...");
    console.log(`[SIMPLIFY] Fetching: ${url}`);
    const paper = await scrapeArticle(url);
    console.log(`[SIMPLIFY] Extracted "${paper.title}" (${paper.content.length} chars)`);

    sse.sendStatus("Analyzing paper with AI...");
    console.log(`[SIMPLIFY] Analyzing with Claude...`);
    const analysis = await analyzePaper(paper);
    console.log(`[SIMPLIFY] Analysis complete - ${analysis.tags.length} tags, ${analysis.deepDives.length} terms`);

    const response: SimplifyResponse = {
      title: paper.title,
      originalContent: paper.content,
      simplifiedContent: analysis.sections,
      sectionBySection: analysis.sectionBySection,
      tags: analysis.tags,
      tagExplanation: analysis.tagExplanation,
      deepDives: analysis.deepDives,
    };

    sse.sendResult(response);
  } catch (error: any) {
    console.error(`[SIMPLIFY] Error: ${error.message}`);
    sse.sendError(error.message || "Failed to simplify paper");
  }
});

// POST /api/simplify-pdf — PDF file upload (SSE stream)
router.post("/api/simplify-pdf", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "PDF file is required" });
  }

  // Start SSE stream
  const sse = initSSE(res);
  sse.startHeartbeat();

  try {
    sse.sendStatus("Processing PDF...");
    console.log(`[SIMPLIFY-PDF] Processing: ${req.file.originalname}`);
    const paper = await extractFromPdfBuffer(req.file.buffer, "uploaded PDF");
    console.log(`[SIMPLIFY-PDF] Extracted "${paper.title}" (${paper.content.length} chars)`);

    sse.sendStatus("Analyzing paper with AI...");
    console.log(`[SIMPLIFY-PDF] Analyzing with Claude...`);
    const analysis = await analyzePaper(paper);
    console.log(`[SIMPLIFY-PDF] Analysis complete - ${analysis.tags.length} tags, ${analysis.deepDives.length} terms`);

    const response: SimplifyResponse = {
      title: paper.title,
      originalContent: paper.content,
      simplifiedContent: analysis.sections,
      sectionBySection: analysis.sectionBySection,
      tags: analysis.tags,
      tagExplanation: analysis.tagExplanation,
      deepDives: analysis.deepDives,
    };

    sse.sendResult(response);
  } catch (error: any) {
    console.error(`[SIMPLIFY-PDF] Error: ${error.message}`);
    sse.sendError(error.message || "Failed to simplify PDF");
  }
});

export default router;
