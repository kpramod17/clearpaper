import { useState } from "react";
import type { SimplifyResponse } from "@shared/types";
import SimplifiedContent from "./SimplifiedContent";
import SectionBySection from "./SectionBySection";
import TopicTags from "./TopicTags";

type ViewTab = "simplified" | "sections" | "original";

interface ArticleViewProps {
  result: SimplifyResponse;
  onTermClick: (term: string) => void;
}

export default function ArticleView({ result, onTermClick }: ArticleViewProps) {
  const [view, setView] = useState<ViewTab>("simplified");

  const tabs: { key: ViewTab; label: string }[] = [
    { key: "simplified", label: "Simplified" },
    { key: "sections", label: "Section-by-Section" },
    { key: "original", label: "Original" },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Title */}
      <h2 className="mb-5 font-serif text-3xl leading-snug text-[#e8e8e3]">
        {result.title}
      </h2>

      {/* Topic Tags */}
      <TopicTags tags={result.tags} explanation={result.tagExplanation} />

      {/* Three-tab Toggle */}
      <div className="mb-8 mt-6 flex gap-6 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`pb-3 text-xs font-medium tracking-wide transition-colors ${
              view === tab.key
                ? "tab-active text-[#e8e8e3]"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === "simplified" && (
        <div>
          <p className="mb-5 text-[11px] uppercase tracking-widest text-[#444]">
            Click underlined terms for deep dives
          </p>
          <SimplifiedContent
            sections={result.simplifiedContent}
            onTermClick={onTermClick}
          />
        </div>
      )}

      {view === "sections" && (
        <div>
          <p className="mb-5 text-[11px] uppercase tracking-widest text-[#444]">
            The paper's own sections, rewritten in plain language
          </p>
          <SectionBySection
            sections={result.sectionBySection}
            onTermClick={onTermClick}
          />
        </div>
      )}

      {view === "original" && (
        <div className="whitespace-pre-line text-sm leading-[1.8] text-[#888]">
          {result.originalContent}
        </div>
      )}
    </div>
  );
}
