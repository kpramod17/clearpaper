import { RESEARCH_DOMAINS } from "../lib/constants";

interface TopicTagsProps {
  tags: number[];
  explanation: string;
}

export default function TopicTags({ tags, explanation }: TopicTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tagId) => {
          const domain = RESEARCH_DOMAINS.find((d) => d.id === tagId);
          if (!domain) return null;
          return (
            <span
              key={tagId}
              className="rounded-full border border-white/[0.08] px-3 py-1 text-[11px] text-[#666]"
            >
              {domain.shortName}
            </span>
          );
        })}
      </div>
      {explanation && (
        <p className="mt-3 text-xs leading-relaxed text-[#444]">{explanation}</p>
      )}
    </div>
  );
}
