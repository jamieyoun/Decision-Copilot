"use client";

import {
  formatLastIngest,
  formatExactTimestamp,
  type IngestSummary,
} from "@/lib/copilot-types";
import { ThemeToggle } from "@/components/ThemeToggle";

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

type Props = {
  ingest: IngestSummary | null;
  lastIngestTime: number | null;
  isIngesting: boolean;
  onRunIngest: () => void;
};

export function StatusBar({ ingest, lastIngestTime, isIngesting, onRunIngest }: Props) {
  const hasIngested = ingest != null && ingest.totalDocuments > 0;

  return (
    <header className="sticky top-0 z-10 h-14 shrink-0 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
      <div className="mx-auto flex h-full max-w-[1600px] flex-nowrap items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-4 overflow-hidden">
          <h1 className="shrink-0 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Decision Copilot
          </h1>
          <div className="flex flex-nowrap items-center gap-3">
            {hasIngested ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                <IconCheck /> Indexed
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                Not indexed
              </span>
            )}
            {hasIngested && (
              <>
                <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  {ingest!.totalDocuments} docs
                </span>
                <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  {ingest!.totalChunks} chunks
                </span>
                {lastIngestTime != null && (
                  <span
                    className="shrink-0 text-xs text-slate-400 dark:text-slate-500"
                    title={formatExactTimestamp(lastIngestTime)}
                  >
                    Last ingest {formatLastIngest(lastIngestTime)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={onRunIngest}
            disabled={isIngesting}
            className="min-w-[7rem] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-800"
          >
            {isIngesting ? "Ingesting…" : "Run Ingest"}
          </button>
        </div>
      </div>
    </header>
  );
}
