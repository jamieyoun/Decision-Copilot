"use client";

import {
  type Mode,
  type IngestSummary,
  formatLastReviewed,
} from "@/lib/copilot-types";

const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

type DateRangeFilter = "all" | "7" | "14" | "30";

type Props = {
  mode: Mode;
  isAnalyzing: boolean;
  onModeChange: (m: Mode) => void;
  ingest: IngestSummary | null;
  isIngesting: boolean;
  onIngest: () => void;
  lastCountByMode: Partial<Record<Mode, number>>;
  pinnedKeys: Set<string>;
  lastReviewedAt: number | null;
  meetingTypes: string[];
  dateRange: DateRangeFilter;
  onDateRangeChange: (v: DateRangeFilter) => void;
  meetingTypeFilter: string;
  onMeetingTypeFilterChange: (v: string) => void;
};

const MODE_LABELS: Record<Mode, string> = {
  decisions: "Open Decisions",
  risks: "Risks",
  actions: "Action Items",
};

export function Sidebar({
  mode,
  isAnalyzing,
  onModeChange,
  ingest,
  isIngesting,
  onIngest,
  lastCountByMode,
  pinnedKeys,
  lastReviewedAt,
  meetingTypes,
  dateRange,
  onDateRangeChange,
  meetingTypeFilter,
  onMeetingTypeFilterChange,
}: Props) {
  return (
    <aside
      className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
      aria-label="Modes and filters"
    >
      <div className="p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          View
        </h2>
        <div className="mt-2 flex flex-col gap-0.5">
          {(["decisions", "risks", "actions"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => !isAnalyzing && onModeChange(m)}
              disabled={isAnalyzing}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-800 disabled:opacity-50 ${
                mode === m
                  ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
              }`}
            >
              {MODE_LABELS[m]}
              {mode === m && <IconChevronRight />}
            </button>
          ))}
        </div>
      </div>

      {/* Filters — min-height keeps layout stable when meeting types load */}
      <div className="min-h-[120px] border-t border-slate-200 p-4 dark:border-slate-700">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Filters
        </h2>
        {meetingTypes.length > 0 && (
          <div className="mt-2">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Meeting type
            </label>
            <select
              value={meetingTypeFilter}
              onChange={(e) => onMeetingTypeFilterChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus-visible:ring-slate-500"
            >
              <option value="">All</option>
              {meetingTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-2">
          <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Date range
          </label>
          <div className="mt-1 flex flex-wrap gap-1">
            {(["all", "7", "14", "30"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onDateRangeChange(v)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 ${
                  dateRange === v
                    ? "bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
              >
                {v === "all" ? "All" : `Last ${v}d`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 p-4 dark:border-slate-700">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Index
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Based on meeting notes in <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">data/meetings</code>.
        </p>
        <button
          type="button"
          onClick={onIngest}
          disabled={isIngesting}
          className="mt-3 h-10 w-full rounded-lg bg-slate-900 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-800"
        >
          {isIngesting ? "Ingesting…" : "Ingest meeting notes"}
        </button>
      </div>

      {/* Pinned + Review summary */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-700">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Review summary
        </h2>
        <dl className="mt-2 space-y-1.5 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500 dark:text-slate-400">Decisions</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">
              {lastCountByMode.decisions ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500 dark:text-slate-400">Risks</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">
              {lastCountByMode.risks ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500 dark:text-slate-400">Actions</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">
              {lastCountByMode.actions ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-t border-slate-200 pt-2 dark:border-slate-700">
            <dt className="text-slate-500 dark:text-slate-400">Pinned</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">{pinnedKeys.size}</dd>
          </div>
          {lastReviewedAt != null && (
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Last reviewed</dt>
              <dd className="font-medium text-slate-700 dark:text-slate-200">
                {formatLastReviewed(lastReviewedAt)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </aside>
  );
}
