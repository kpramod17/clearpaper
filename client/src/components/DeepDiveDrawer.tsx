import { useEffect } from "react";
import type { DeepDive } from "@shared/types";
import { X } from "lucide-react";

interface DeepDiveDrawerProps {
  deepDive: DeepDive;
  onClose: () => void;
}

const sections = [
  { key: "definition" as const, label: "Definition" },
  { key: "context" as const, label: "In this paper" },
  { key: "simpleAnalogy" as const, label: "Analogy" },
  { key: "whyItMatters" as const, label: "Why it matters" },
  { key: "historicalContext" as const, label: "Prior work" },
];

export default function DeepDiveDrawer({ deepDive, onClose }: DeepDiveDrawerProps) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="drawer-overlay fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-panel flex h-full w-full max-w-md flex-col border-l border-white/[0.06] bg-[#0a0a0a]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-widest text-[#444]">
              Deep dive
            </p>
            <h3 className="font-serif text-2xl text-[#e8e8e3]">
              {deepDive.term}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#555] transition-colors hover:text-[#999]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {sections.map(({ key, label }) => (
            <div key={key}>
              <h4 className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[#555]">
                {label}
              </h4>
              <p className="text-sm leading-[1.8] text-[#999]">
                {deepDive[key]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
