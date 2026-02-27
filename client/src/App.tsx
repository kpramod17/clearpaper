import { useState } from "react";
import type { SimplifyResponse } from "@shared/types";
import PaperInput from "./components/UrlInput";
import ArticleView from "./components/ArticleView";
import DeepDiveDrawer from "./components/DeepDiveDrawer";
import { Plus } from "lucide-react";
import { colors } from "./lib/design";

export default function App() {
  const [result, setResult] = useState<SimplifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  async function handleSimplifyUrl(url: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to simplify paper");
      }

      const data: SimplifyResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSimplifyPdf(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const res = await fetch("/api/simplify-pdf", {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type — browser sets it with multipart boundary
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to simplify PDF");
      }

      const data: SimplifyResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleNewThread() {
    setResult(null);
    setError(null);
    setSelectedTerm(null);
  }

  const selectedDeepDive = result?.deepDives.find(
    (d) => d.term.toLowerCase() === selectedTerm?.toLowerCase()
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <button
            onClick={handleNewThread}
            className="cursor-pointer bg-transparent border-none p-0"
          >
            <h1 className="text-sm tracking-wide text-[#e8e8e3]">
              Clear<span className="font-medium text-[#5ba4c9]">Paper</span>
            </h1>
          </button>
          {result && (
            <button
              onClick={handleNewThread}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-[#777] transition-colors hover:border-white/20 hover:text-[#aaa]"
            >
              <Plus className="h-3 w-3" />
              New
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        {!result && !loading && (
          <PaperInput
            onSubmitUrl={handleSimplifyUrl}
            onSubmitPdf={handleSimplifyPdf}
            error={error}
          />
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            {/* Animated bars */}
            <div className="flex items-end gap-1.5 mb-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full loading-bar"
                  style={{
                    backgroundColor: colors.accent,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>

            {/* Status text */}
            <div className="text-center">
              <p className="text-sm font-medium text-[#e8e8e3] mb-2">
                Analyzing paper
              </p>
              <p className="text-xs text-[#555] loading-status">
                Extracting content and breaking down the research...
              </p>
            </div>

            {/* Skeleton preview */}
            <div className="mt-12 w-full max-w-sm space-y-3 opacity-30">
              <div className="h-5 w-3/4 rounded skeleton-pulse" />
              <div className="h-3 w-full rounded skeleton-pulse" style={{ animationDelay: "0.1s" }} />
              <div className="h-3 w-5/6 rounded skeleton-pulse" style={{ animationDelay: "0.2s" }} />
              <div className="h-3 w-4/6 rounded skeleton-pulse" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}

        {result && (
          <ArticleView
            result={result}
            onTermClick={(term) => setSelectedTerm(term)}
          />
        )}
      </main>

      {/* Deep Dive Drawer */}
      {selectedDeepDive && (
        <DeepDiveDrawer
          deepDive={selectedDeepDive}
          onClose={() => setSelectedTerm(null)}
        />
      )}
    </div>
  );
}
