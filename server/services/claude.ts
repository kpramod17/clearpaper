import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedPaper, DeepDive, ContentSection, PaperSection } from "../../shared/types.js";

const DOMAINS_LIST = `1. Machine Learning (ML)
2. Natural Language Processing (NLP)
3. Computer Vision (Vision)
4. Artificial Intelligence (AI)
5. Robotics
6. Physics
7. Biology
8. Medicine & Health (Medicine)
9. Neuroscience (Neuro)
10. Mathematics (Math)
11. Chemistry
12. Environmental Science (Environment)
13. Economics & Social Science (Social Sci)
14. Materials Science (Materials)
15. Data Science & Statistics (Data Sci)`;

const client = new Anthropic();

interface ClaudeAnalysis {
  sections: ContentSection[];
  sectionBySection: PaperSection[];
  tags: number[];
  tagExplanation: string;
  deepDives: DeepDive[];
}

export async function analyzePaper(paper: ExtractedPaper): Promise<ClaudeAnalysis> {
  const contentPreview = paper.content.slice(0, 12000);

  const prompt = `You are a research scientist who explains complex academic papers to curious non-experts. Your goal is to make any reader understand the paper's contribution, methods, and significance.

Paper Title: ${paper.title}
Source: ${paper.source}
Paper Content:
${contentPreview}

Analyze this research paper and respond with ONLY valid JSON (no markdown, no backticks) in this exact structure:

{
  "sections": [
    { "heading": "Paper at a Glance", "body": "A clear 2-3 sentence summary of what this paper does and why it matters. What problem does it solve?" },
    { "heading": "Problem & Motivation", "body": "What gap or challenge motivated this research? Why did existing approaches fall short? Explain so a non-expert understands the significance." },
    { "heading": "Key Methodology", "body": "How did the researchers approach the problem? Break down the method into understandable steps. Use {{Term}} syntax to wrap 3-5 key technical concepts that get deep dives." },
    { "heading": "Main Findings", "body": "What were the key results? Were they better than previous approaches? By how much? Make numbers and comparisons meaningful to a non-expert." },
    { "heading": "Potential Benefits & Applications", "body": "How could this research be applied in the real world? Who benefits? What possibilities does it open up?" },
    { "heading": "Limitations & Future Work", "body": "What are the limitations acknowledged by the authors? What questions remain open? What might come next?" }
  ],
  "sectionBySection": [
    { "originalHeading": "Abstract", "simplifiedContent": "Plain-language rewrite of the abstract section..." },
    { "originalHeading": "1. Introduction", "simplifiedContent": "Plain-language rewrite of the introduction..." },
    { "originalHeading": "2. Related Work", "simplifiedContent": "..." },
    { "originalHeading": "3.1 Model Architecture", "simplifiedContent": "..." }
  ],
  "tags": [1, 2],
  "tagExplanation": "Brief explanation of why these research domains apply",
  "deepDives": [
    {
      "term": "Transformer",
      "definition": "A clear, accessible definition of the term",
      "context": "How this term specifically relates to this paper's contribution",
      "simpleAnalogy": "An everyday analogy (e.g., 'Think of it like a librarian who can look at every book simultaneously instead of one at a time')",
      "whyItMatters": "Why understanding this concept matters for grasping the paper's contribution",
      "historicalContext": "Brief history or prior work that led to this concept"
    }
  ]
}

Available Research Domains (use domain IDs, pick up to 3 most relevant):
${DOMAINS_LIST}

Rules:
- "sections" must have exactly the 6 headings listed above, written for someone with NO research background
- "sectionBySection": Extract the paper's ACTUAL section headings from the content (e.g., "Abstract", "1. Introduction", "3.1 Attention Mechanism", "4.2 Ablation Study"). Rewrite each section's content in simple, accessible language. Preserve the original heading exactly as it appears in the paper. Include ALL identifiable sections.
- If the paper text does not have clear section headings, infer logical sections (e.g., "Introduction", "Methods", "Results", "Discussion", "Conclusion")
- Every {{term}} across ALL section bodies AND sectionBySection simplifiedContent MUST have a matching entry in deepDives
- Spread the {{term}} markers across sections naturally (not all in one section)
- Use {{term}} markers in sectionBySection too for key technical terms
- tags array: 1-3 domain IDs (numbers only)
- deepDives: one object per highlighted term (aim for 5-8 terms total)
- Keep explanations conversational and jargon-free except for the highlighted terms
- Focus on making the research accessible to someone reading about this topic for the first time`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err: any) {
    if (err?.status === 400 || err?.status === 401 || err?.status === 403) {
      throw new Error("Anthropic API key is invalid or has insufficient credits. Check your .env file.");
    }
    throw new Error(`Claude API error: ${err?.message || "Unknown error"}`);
  }

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

  let analysis: ClaudeAnalysis;
  try {
    analysis = JSON.parse(cleanText);
  } catch {
    throw new Error("Failed to parse Claude response as JSON");
  }

  // Validate structure
  if (
    !Array.isArray(analysis.sections) ||
    !Array.isArray(analysis.sectionBySection) ||
    !Array.isArray(analysis.tags) ||
    !Array.isArray(analysis.deepDives)
  ) {
    throw new Error("Invalid response structure from Claude");
  }

  analysis.tags = analysis.tags.filter((t: number) => t >= 1 && t <= 15).slice(0, 3);
  analysis.tagExplanation = analysis.tagExplanation || "";

  return analysis;
}
