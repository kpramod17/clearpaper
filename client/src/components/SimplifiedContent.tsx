import type { ContentSection } from "@shared/types";

interface SimplifiedContentProps {
  sections: ContentSection[];
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

export default function SimplifiedContent({ sections, onTermClick }: SimplifiedContentProps) {
  return (
    <div className="space-y-8">
      {sections.map((section, index) => (
        <div key={index}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#5ba4c9]">
            {section.heading}
          </h3>
          <div className="space-y-4">
            {renderBody(section.body, index, onTermClick)}
          </div>
        </div>
      ))}
    </div>
  );
}
