export interface DeepDive {
  term: string;
  definition: string;
  context: string;
  simpleAnalogy: string;
  whyItMatters: string;
  historicalContext: string;
}

export interface ContentSection {
  heading: string;
  body: string;
}

export interface PaperSection {
  originalHeading: string;
  simplifiedContent: string;
}

export interface SimplifyResponse {
  title: string;
  originalContent: string;
  simplifiedContent: ContentSection[];
  sectionBySection: PaperSection[];
  tags: number[];
  tagExplanation: string;
  deepDives: DeepDive[];
}

export interface SimplifyRequest {
  url?: string;
}

export interface ExtractedPaper {
  title: string;
  content: string;
  source: string;
}

export interface ResearchDomain {
  id: number;
  name: string;
  shortName: string;
}
