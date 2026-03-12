"use client";

import { useState, useMemo } from "react";
import {
  type ExtractedItem,
  type EvidenceItem,
  confidenceFromScore,
  citationLine,
} from "@/lib/copilot-types";

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
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

const INITIAL_EVIDENCE_COUNT = 3;

/** Highlight words from query in text (simple string match, case-insensitive) */
function highlightWords(text: string, words: string[]): React.ReactNode {
  const usable = words.filter((w) => w.length > 1);
  if (usable.length === 0) return text;
  const escaped = usable.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  const matchSet = new Set(usable.map((w) => w.toLowerCase()));
  return parts.map((part, i) =>
    matchSet.has(part.toLowerCase()) ? (
      <mark key={i} className="rounded bg-amber-200/80 dark:bg-amber-600/40">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

type Props = {
  item: ExtractedItem;
  evidence: EvidenceItem[];
  isPinned: boolean;
  onClose: () => void;
  onCopy: () => void;
  onPin: () => void;
  onMarkReviewed: () => void;
};

export function EvidenceDrawer({
  item,
  evidence,
  isPinned,
  onClose,
  onCopy,
  onPin,
  onMarkReviewed,
}: Props) {
  const [showAllEvidence, setShowAllEvidence] = useState(false);
  const [showRawChunk, setShowRawChunk] = useState(false);

  const confidence = confidenceFromScore(item.score);
  const evidenceToShow = showAllEvidence ? evidence : evidence.slice(0, INITIAL_EVIDENCE_COUNT);
  const hasMore = evidence.length > INITIAL_EVIDENCE_COUNT;

  const keywords = useMemo(() => {
    return item.text
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/gi, ""))
      .filter((w) => w.length > 2);
  }, [item.text]);

  const confidenceClass =
    confidence === "High"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
      : confidence === "Medium"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";

  return (
    <>
      <div
        className="fixed inset-0 z-20 bg-slate-900/20 transition-opacity duration-200 md:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-30 flex h-full w-full flex-col border-l border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out dark:border-slate-700 dark:bg-slate-800 sm:w-[380px]"
        aria-label="Evidence and citation"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Evidence</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-800"
            aria-label="Close drawer"
          >
            <IconX />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.text}</p>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            {citationLine(item.citation)}
          </div>
          <div className="mt-2">
            <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${confidenceClass}`}>
              {confidence}
            </span>
          </div>
          {confidence === "Low" && (
            <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
              Evidence is weak. Based on meeting notes; consider verifying in source.
            </p>
          )}
          {confidence !== "Low" && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Based on top retrieved evidence.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-800"
            >
              <IconCopy /> Copy item
            </button>
            <button
              type="button"
              onClick={onPin}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-800"
            >
              {isPinned ? <IconPinFilled /> : <IconPin />} {isPinned ? "Unpin" : "Pin"}
            </button>
            <button
              type="button"
              onClick={onMarkReviewed}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-800"
            >
              Mark reviewed
            </button>
          </div>

          <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Source & preview
          </h4>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Most relevant evidence shown.
          </p>

          {evidence.length > 0 ? (
            <ul className="mt-2 space-y-3">
              {evidenceToShow.map((ev, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50"
                >
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    {ev.citation?.meetingTitle ?? "—"} · {ev.citation?.meetingDate ?? "—"} ·{" "}
                    {ev.citation?.section ?? "—"}
                    {ev.citation?.chunkId != null && ` · ${ev.citation.chunkId}`}
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    Relevance: {((ev.score ?? 0) * 100).toFixed(0)}%
                  </div>
                  {showRawChunk ? (
                    <pre className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-800 dark:text-slate-100">
                      {ev.preview}
                    </pre>
                  ) : (
                    <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-800 dark:text-slate-100">
                      {highlightWords(ev.preview ?? "", keywords)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              No matching evidence chunk for this item. Most relevant evidence from the query is listed in the main view.
            </p>
          )}

          {hasMore && !showAllEvidence && (
            <button
              type="button"
              onClick={() => setShowAllEvidence(true)}
              className="mt-2 text-xs font-medium text-slate-600 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:text-slate-100 dark:focus-visible:ring-slate-500"
            >
              Open evidence — show {evidence.length - INITIAL_EVIDENCE_COUNT} more
            </button>
          )}

          {evidence.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="raw-chunk"
                checked={showRawChunk}
                onChange={(e) => setShowRawChunk(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-700"
              />
              <label htmlFor="raw-chunk" className="text-xs text-slate-600 dark:text-slate-400">
                View raw chunk
              </label>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
