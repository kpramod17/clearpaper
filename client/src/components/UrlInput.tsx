import { useState, useRef } from "react";
import { ArrowRight, Upload } from "lucide-react";

interface PaperInputProps {
  onSubmitUrl: (url: string) => void;
  onSubmitPdf: (file: File) => void;
  error: string | null;
}

export default function PaperInput({ onSubmitUrl, onSubmitPdf, error }: PaperInputProps) {
  const [url, setUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (url.trim()) {
      onSubmitUrl(url.trim());
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onSubmitPdf(file);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      onSubmitPdf(file);
    }
  }

  return (
    <div className="flex flex-col items-center py-28 animate-fade-in-up">
      {/* Hero heading */}
      <h2 className="mb-3 text-center font-serif text-5xl leading-[1.15] text-[#e8e8e3] sm:text-6xl">
        understand<br />
        <span className="italic">research</span>
      </h2>
      <p className="mb-12 max-w-sm text-center text-sm leading-relaxed text-[#555]">
        Paste a paper URL or upload a PDF. Get a clear, jargon-free
        explanation with deep dives into key concepts.
      </p>

      {/* URL Input */}
      <form onSubmit={handleUrlSubmit} className="w-full max-w-md">
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste an arXiv, PubMed, or paper URL"
            className="flex-1 bg-transparent text-sm text-[#e8e8e3] placeholder-[#444] outline-none"
            required
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-full bg-[#e8e8e3] px-4 py-2 text-xs font-medium text-[#0a0a0a] transition-opacity hover:opacity-80"
          >
            Simplify
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="my-8 flex w-full max-w-md items-center gap-4">
        <div className="flex-1 border-t border-white/[0.06]" />
        <span className="text-[11px] uppercase tracking-widest text-[#444]">or</span>
        <div className="flex-1 border-t border-white/[0.06]" />
      </div>

      {/* PDF Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full max-w-md cursor-pointer rounded-lg border border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-[#5ba4c9]/50 bg-[#5ba4c9]/5"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <Upload className="mx-auto mb-3 h-5 w-5 text-[#555]" />
        <p className="text-sm text-[#777]">
          Drop a PDF here or <span className="text-[#5ba4c9]">browse</span>
        </p>
        <p className="mt-1 text-xs text-[#444]">PDF up to 20MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-6 text-xs text-red-400/80">
          {error}
        </p>
      )}
    </div>
  );
}
