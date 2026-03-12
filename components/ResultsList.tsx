"use client";

import {
  type Mode,
  type ExtractedItem,
  resultKey,
  confidenceFromScore,
  citationLine,
} from "@/lib/copilot-types";
import { ResultsSkeleton } from "./Skeletons";

const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M12 2v10M12 2l4 4-4 4M12 2L8 6l4 4" />
    <path d="M5 12h14v10H5z" />
  </svg>
);
const IconPinFilled = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
  </svg>
);
const IconFileText = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const MODE_LABELS: Record<Mode, string> = {
  decisions: "Open Decisions",
  risks: "Risks",
  actions: "Action Items",
};

function ResultRow({
  item,
  isSelected,
  isPinned,
  onSelect,
  onTogglePin,
  onDismiss,
  onKeyDown,
}: {
  item: ExtractedItem;
  isSelected: boolean;
  isPinned: boolean;
  onSelect: (item: ExtractedItem) => void;
  onTogglePin: (item: ExtractedItem) => void;
  onDismiss: (item: ExtractedItem) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const confidence = confidenceFromScore(item.score);
  const confidenceClass =
    confidence === "High"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
      : confidence === "Medium"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";

  return (
    <li
      className={`rounded-lg border bg-white p-4 shadow-sm transition-all duration-150 dark:bg-slate-800/50 ${
        isSelected
          ? "border-slate-400 ring-2 ring-slate-300 dark:border-slate-500 dark:ring-slate-600"
          : "border-slate-200 hover:border-slate-300 hover:shadow dark:border-slate-700 dark:hover:border-slate-600"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(item);
          }
          onKeyDown(e);
        }}
        className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900"
        aria-label={`View evidence for: ${item.text.slice(0, 60)}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.text}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${confidenceClass}`}>
              {confidence}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(item);
              }}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 dark:hover:bg-slate-700 dark:hover:text-slate-300 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-800"
              aria-label={isPinned ? "Unpin" : "Pin"}
              title={isPinned ? "Unpin" : "Pin"}
            >
              {isPinned ? <IconPinFilled /> : <IconPin />}
            </button>
          </div>
        </div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {citationLine(item.citation)}
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(item);
          }}
          className="rounded text-xs font-medium text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 dark:text-slate-400 dark:hover:text-slate-200 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-800"
        >
          Mark reviewed
        </button>
      </div>
    </li>
  );
}

function EmptyState({ mode, hasIngested }: { mode: Mode; hasIngested: boolean }) {
  const label = MODE_LABELS[mode].toLowerCase();
  const guidance = hasIngested
    ? `No ${label} found. Try ingesting again or check note formatting.`
    : "Run Ingest to build the index, then choose a view to analyze.";
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/80 py-12 px-6 text-center dark:border-slate-600 dark:bg-slate-800/30">
      <IconFileText />
      <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
        No {label} yet
      </p>
      <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">{guidance}</p>
    </div>
  );
}

type SortKind = "relevance" | "recency";

type Props = {
  mode: Mode;
  isAnalyzing: boolean;
  results: ExtractedItem[];
  pinnedItems: ExtractedItem[];
  unpinnedItems: ExtractedItem[];
  selectedItem: ExtractedItem | null;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  sortBy: SortKind;
  onSortChange: (v: SortKind) => void;
  hasIngested: boolean;
  hasActiveFilters: boolean;
  onSelect: (item: ExtractedItem) => void;
  onTogglePin: (item: ExtractedItem) => void;
  onDismiss: (item: ExtractedItem) => void;
  onCloseDrawer: () => void;
  onExportPinned: () => void;
  onExportAll: () => void;
  onCopyExport: (scope: "pinned" | "all") => void;
};

export function ResultsList({
  mode,
  isAnalyzing,
  results,
  pinnedItems,
  unpinnedItems,
  selectedItem,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  hasIngested,
  onSelect,
  onTogglePin,
  onDismiss,
  onCloseDrawer,
  onExportPinned,
  onExportAll,
  onCopyExport,
  hasActiveFilters,
}: Props) {
  const modeLabel = MODE_LABELS[mode];
  const showFilteredEmpty = hasActiveFilters && results.length === 0 && !isAnalyzing;

  const btnClass =
    "inline-flex min-w-[6.5rem] items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900";

  return (
    <main className="min-w-0 flex-1 overflow-auto p-4 transition-[padding] duration-200 md:p-6">
      <div className="mb-4 flex min-h-10 flex-nowrap items-center justify-between gap-4">
        <h2 className="shrink-0 text-base font-semibold tracking-tight text-slate-800 dark:text-slate-200">
          {modeLabel}
        </h2>
        <div className="flex shrink-0 flex-nowrap items-center gap-2">
          {pinnedItems.length > 0 && (
            <>
              <button type="button" onClick={onExportPinned} className={btnClass}>
                <IconDownload /> Export pinned
              </button>
              <button type="button" onClick={() => onCopyExport("pinned")} className={btnClass}>
                Copy pinned
              </button>
            </>
          )}
          {results.length > 0 && (
            <>
              <button type="button" onClick={onExportAll} className={btnClass}>
                <IconDownload /> Export all
              </button>
              <button type="button" onClick={() => onCopyExport("all")} className={btnClass}>
                Copy view
              </button>
            </>
          )}
        </div>
      </div>

      {results.length > 0 && !isAnalyzing && (
        <div className="mb-4 flex h-9 flex-nowrap items-center gap-3">
          <input
            type="search"
            placeholder="Filter within results…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full min-w-0 max-w-[240px] rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus-visible:ring-slate-500"
            aria-label="Search within results"
          />
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Sort:</span>
            <button
              type="button"
              onClick={() => onSortChange("relevance")}
              className={`min-w-[4.5rem] rounded-md px-2 py-1.5 text-[11px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 ${
                sortBy === "relevance"
                  ? "bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              Relevance
            </button>
            <button
              type="button"
              onClick={() => onSortChange("recency")}
              className={`min-w-[4rem] rounded-md px-2 py-1.5 text-[11px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 ${
                sortBy === "recency"
                  ? "bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              Recency
            </button>
          </div>
        </div>
      )}

      {isAnalyzing && <ResultsSkeleton />}

      {showFilteredEmpty && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/80 py-8 px-4 text-center dark:border-slate-600 dark:bg-slate-800/30">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No items match your filters</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Clear search, date range, or meeting type to see results.</p>
        </div>
      )}

      {!isAnalyzing && results.length === 0 && !showFilteredEmpty && (
        <EmptyState mode={mode} hasIngested={hasIngested} />
      )}

      {!isAnalyzing && results.length > 0 && !showFilteredEmpty && (
        <ul className="space-y-2" aria-label={`${modeLabel} list`}>
          {pinnedItems.length > 0 && (
            <>
              <li className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pinned
              </li>
              {pinnedItems.map((item) => (
                <ResultRow
                  key={resultKey(item)}
                  item={item}
                  isSelected={selectedItem !== null && resultKey(selectedItem) === resultKey(item)}
                  isPinned
                  onSelect={onSelect}
                  onTogglePin={onTogglePin}
                  onDismiss={onDismiss}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") onCloseDrawer();
                  }}
                />
              ))}
              <li className="pt-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                All
              </li>
            </>
          )}
          {unpinnedItems.map((item) => (
            <ResultRow
              key={resultKey(item)}
              item={item}
              isSelected={selectedItem !== null && resultKey(selectedItem) === resultKey(item)}
              isPinned={false}
              onSelect={onSelect}
              onTogglePin={onTogglePin}
              onDismiss={onDismiss}
              onKeyDown={(e) => {
                if (e.key === "Escape") onCloseDrawer();
              }}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
