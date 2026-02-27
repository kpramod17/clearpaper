import type { PaperSection } from "@shared/types";

interface SectionBySectionProps {
  sections: PaperSection[];
  onTermClick: (term: string) => void;
}

function renderBody(body: string, sectionIndex: number, onTermClick: (term: string) => void) {
  const paragraphs = body.split(/\n\n+/);

  return paragraphs.map((paragraph, pIndex) => {
    const parts = paragraph.split(/(\{\{[^}]+\}\})/g);

    return (
      <p
        key={`${sectionIndex}-${pIndex}`}
        className="text-sm leading-[1.85] text-[#999]"
      >
        {parts.map((part, i) => {
          const match = part.match(/^\{\{(.+)\}\}$/);
          if (match) {
            const term = match[1];
            return (
              <span
                key={`${sectionIndex}-${pIndex}-${i}`}
                className="highlight-term"
                onClick={() => onTermClick(term)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onTermClick(term);
                }}
              >
                {term}
              </span>
            );
          }
          return <span key={`${sectionIndex}-${pIndex}-${i}`}>{part}</span>;
        })}
      </p>
    );
  });
}

export default function SectionBySection({ sections, onTermClick }: SectionBySectionProps) {
  return (
    <div className="space-y-8">
      {sections.map((section, index) => (
        <div key={index}>
          <h3 className="mb-3 font-serif text-lg text-[#e8e8e3]">
            {section.originalHeading}
          </h3>
          <div className="space-y-4">
            {renderBody(section.simplifiedContent, index, onTermClick)}
          </div>
        </div>
      ))}
    </div>
  );
}
