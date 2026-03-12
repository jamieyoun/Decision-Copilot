"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  type Mode,
  type IngestSummary,
  type ExtractedItem,
  type EvidenceItem,
  resultKey,
  parseMeetingDate,
  loadPinnedFromStorage,
  savePinnedToStorage,
  loadDismissedFromStorage,
  saveDismissedToStorage,
} from "@/lib/copilot-types";
import { StatusBar } from "@/components/StatusBar";
import { Sidebar } from "@/components/Sidebar";
import { ResultsList } from "@/components/ResultsList";
import { EvidenceDrawer } from "@/components/EvidenceDrawer";

type DateRangeFilter = "all" | "7" | "14" | "30";

function buildExportMarkdown(
  items: ExtractedItem[],
  mode: Mode
): string {
  const headings: Record<Mode, string> = {
    decisions: "## Open Decisions",
    risks: "## Risks",
    actions: "## Action Items",
  };
  let md = `${headings[mode]}\n\n`;
  items.forEach((r) => {
    md += `- ${r.text}\n`;
    md += `  - ${r.citation?.meetingTitle ?? "—"} — ${r.citation?.meetingDate ?? "—"} — ${r.citation?.section ?? "—"}\n`;
  });
  return md;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("decisions");
  const [ingest, setIngest] = useState<IngestSummary | null>(null);
  const [lastIngestTime, setLastIngestTime] = useState<number | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ExtractedItem[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ExtractedItem | null>(null);
  const [pinnedKeys, setPinnedKeys] = useState<Set<string>>(new Set());
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());
  const [lastCountByMode, setLastCountByMode] = useState<Partial<Record<Mode, number>>>({});
  const [lastReviewedAt, setLastReviewedAt] = useState<number | null>(null);
  const [showReviewed, setShowReviewed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "recency">("relevance");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [meetingTypeFilter, setMeetingTypeFilter] = useState("");
  const hasIngested = ingest != null && ingest.totalDocuments > 0;

  // Hydrate pinned/dismissed from localStorage on mount
  useEffect(() => {
    setPinnedKeys(loadPinnedFromStorage());
    setDismissedKeys(loadDismissedFromStorage());
  }, []);

  useEffect(() => {
    savePinnedToStorage(pinnedKeys);
  }, [pinnedKeys]);

  useEffect(() => {
    saveDismissedToStorage(dismissedKeys);
  }, [dismissedKeys]);

  const ingestApi = useCallback(async () => {
    setIsIngesting(true);
    setError(null);
    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.message ?? data?.error?.message ?? "Failed to ingest meetings.";
        throw new Error(msg);
      }
      setIngest({
        totalDocuments: data.totalDocuments ?? 0,
        totalChunks: data.totalChunks ?? 0,
        chunkCountsBySection: data.chunkCountsBySection ?? {},
        durationMs: data.durationMs ?? data.ms,
        ms: data.ms ?? data.durationMs,
      });
      setLastIngestTime(Date.now());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to ingest meetings.");
    } finally {
      setIsIngesting(false);
    }
  }, []);

  const analyzeApi = useCallback(async (nextMode: Mode) => {
    setMode(nextMode);
    setIsAnalyzing(true);
    setError(null);
    setSelectedItem(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: nextMode }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.error?.message ?? data?.message ?? "Failed to analyze meetings.";
        throw new Error(msg);
      }
      const list = (data.results ?? []) as ExtractedItem[];
      setResults(list);
      setEvidence((data.evidence ?? []) as EvidenceItem[]);
      setLastCountByMode((prev) => ({ ...prev, [nextMode]: list.length }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze meetings.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const togglePin = useCallback((item: ExtractedItem) => {
    const key = resultKey(item);
    setPinnedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const dismiss = useCallback((item: ExtractedItem) => {
    const key = resultKey(item);
    setDismissedKeys((prev) => new Set(prev).add(key));
    setLastReviewedAt(Date.now());
    if (selectedItem && resultKey(selectedItem) === key) setSelectedItem(null);
  }, [selectedItem]);

  const selectItem = useCallback((item: ExtractedItem) => setSelectedItem(item), []);
  const closeDrawer = useCallback(() => setSelectedItem(null), []);

  const now = Date.now();
  const dateRangeMs =
    dateRange === "all"
      ? 0
      : dateRange === "7"
        ? 7 * 86400 * 1000
        : dateRange === "14"
          ? 14 * 86400 * 1000
          : 30 * 86400 * 1000;

  const meetingTypes = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => {
      const t = r.citation?.meetingType?.trim();
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [results]);

  const filteredByReviewed = useMemo(() => {
    if (showReviewed) return results;
    return results.filter((r) => !dismissedKeys.has(resultKey(r)));
  }, [results, showReviewed, dismissedKeys]);

  const filteredByDateAndType = useMemo(() => {
    return filteredByReviewed.filter((r) => {
      const date = parseMeetingDate(r.citation?.meetingDate);
      if (dateRangeMs > 0 && (date === 0 || now - date > dateRangeMs)) return false;
      if (meetingTypeFilter && (r.citation?.meetingType ?? "") !== meetingTypeFilter) return false;
      return true;
    });
  }, [filteredByReviewed, dateRangeMs, meetingTypeFilter, now]);

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return filteredByDateAndType;
    const q = searchQuery.trim().toLowerCase();
    return filteredByDateAndType.filter(
      (r) =>
        r.text.toLowerCase().includes(q) ||
        (r.citation?.meetingTitle ?? "").toLowerCase().includes(q) ||
        (r.citation?.section ?? "").toLowerCase().includes(q)
    );
  }, [filteredByDateAndType, searchQuery]);

  const sortedResults = useMemo(() => {
    const list = [...filteredBySearch];
    if (sortBy === "recency") {
      list.sort((a, b) => parseMeetingDate(b.citation?.meetingDate) - parseMeetingDate(a.citation?.meetingDate));
    } else {
      list.sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));
    }
    return list;
  }, [filteredBySearch, sortBy]);

  const { pinnedItems, unpinnedItems } = useMemo(() => {
    const pinned: ExtractedItem[] = [];
    const unpinned: ExtractedItem[] = [];
    sortedResults.forEach((r) =>
      pinnedKeys.has(resultKey(r)) ? pinned.push(r) : unpinned.push(r)
    );
    return { pinnedItems: pinned, unpinnedItems: unpinned };
  }, [sortedResults, pinnedKeys]);

  const evidenceForItem = useMemo(() => {
    if (!selectedItem) return [];
    const cid = selectedItem.citation?.chunkId;
    if (!cid) return evidence;
    return evidence.filter((e) => e.citation?.chunkId === cid);
  }, [selectedItem, evidence]);

  const exportMarkdown = useCallback(
    (scope: "pinned" | "all") => {
      const items = scope === "pinned" ? pinnedItems : sortedResults;
      const md = buildExportMarkdown(items, mode);
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `decision-copilot-${mode}-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [mode, pinnedItems, sortedResults]
  );

  const copyExport = useCallback(
    async (scope: "pinned" | "all") => {
      const items = scope === "pinned" ? pinnedItems : sortedResults;
      const md = buildExportMarkdown(items, mode);
      await navigator.clipboard.writeText(md);
    },
    [mode, pinnedItems, sortedResults]
  );

  const copyToClipboard = useCallback(
    async (scope: "pinned" | "selected") => {
      if (scope === "selected" && selectedItem) {
        const line = `${selectedItem.citation?.meetingTitle ?? "—"}, ${selectedItem.citation?.meetingDate ?? "—"}, ${selectedItem.citation?.section ?? "—"}`;
        await navigator.clipboard.writeText(`${selectedItem.text}\n— ${line}`);
        return;
      }
      const text = pinnedItems
        .map((r) => `${r.text} (${r.citation?.meetingTitle ?? "—"}, ${r.citation?.meetingDate ?? "—"})`)
        .join("\n");
      await navigator.clipboard.writeText(text);
    },
    [selectedItem, pinnedItems]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? "") || target?.isContentEditable;
      if (inInput) return;
      if (e.key === "Escape") {
        if (selectedItem) {
          setSelectedItem(null);
          e.preventDefault();
        }
        return;
      }
      if (e.key === "1" || e.key === "2" || e.key === "3") {
        if (!isAnalyzing) {
          const m: Mode = e.key === "1" ? "decisions" : e.key === "2" ? "risks" : "actions";
          analyzeApi(m);
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedItem, isAnalyzing, analyzeApi]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <StatusBar
        ingest={ingest}
        lastIngestTime={lastIngestTime}
        isIngesting={isIngesting}
        onRunIngest={ingestApi}
      />

      {error && (
        <div
          className="mx-auto max-w-[1600px] shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
          role="alert"
        >
          <span className="font-medium">Error:</span> {error}
          {!hasIngested && (
            <span className="ml-2"> Run Ingest to rebuild the index.</span>
          )}
        </div>
      )}

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col md:flex-row">
        <Sidebar
          mode={mode}
          isAnalyzing={isAnalyzing}
          onModeChange={analyzeApi}
          ingest={ingest}
          isIngesting={isIngesting}
          onIngest={ingestApi}
          lastCountByMode={lastCountByMode}
          pinnedKeys={pinnedKeys}
          lastReviewedAt={lastReviewedAt}
          meetingTypes={meetingTypes}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          meetingTypeFilter={meetingTypeFilter}
          onMeetingTypeFilterChange={setMeetingTypeFilter}
        />

        <ResultsList
          mode={mode}
          isAnalyzing={isAnalyzing}
          results={sortedResults}
          pinnedItems={pinnedItems}
          unpinnedItems={unpinnedItems}
          selectedItem={selectedItem}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          hasIngested={hasIngested}
          hasActiveFilters={!!(searchQuery.trim() || dateRange !== "all" || meetingTypeFilter)}
          onSelect={selectItem}
          onTogglePin={togglePin}
          onDismiss={dismiss}
          onCloseDrawer={closeDrawer}
          onExportPinned={() => exportMarkdown("pinned")}
          onExportAll={() => exportMarkdown("all")}
          onCopyExport={copyExport}
        />

        {selectedItem && (
          <EvidenceDrawer
            item={selectedItem}
            evidence={evidenceForItem}
            isPinned={pinnedKeys.has(resultKey(selectedItem))}
            onClose={closeDrawer}
            onCopy={() => copyToClipboard("selected")}
            onPin={() => togglePin(selectedItem)}
            onMarkReviewed={() => dismiss(selectedItem)}
          />
        )}
      </div>

      <footer className="flex min-h-12 flex-nowrap items-center justify-between gap-4 border-t border-slate-200 bg-white/90 px-4 shadow-[0_-1px_3px_rgba(0,0,0,0.04)] dark:border-slate-700 dark:bg-slate-800/90 dark:shadow-[0_-1px_3px_rgba(0,0,0,0.2)]">
        <p className="shrink-0 text-[11px] text-slate-500 dark:text-slate-400" role="doc-subtitle">
          <kbd className="rounded border border-slate-300 bg-slate-100 px-1 font-mono dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">1</kbd>{" "}
          <kbd className="rounded border border-slate-300 bg-slate-100 px-1 font-mono dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">2</kbd>{" "}
          <kbd className="rounded border border-slate-300 bg-slate-100 px-1 font-mono dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">3</kbd>{" "}
          Switch mode · <kbd className="rounded border border-slate-300 bg-slate-100 px-1 font-mono dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">Esc</kbd> Close drawer
        </p>
        {results.length > 0 && (
          <label className="flex shrink-0 items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={showReviewed}
              onChange={(e) => setShowReviewed(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-700"
            />
            Show reviewed
          </label>
        )}
      </footer>
    </div>
  );
}
