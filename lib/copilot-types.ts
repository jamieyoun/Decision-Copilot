/**
 * Shared types and helpers for Decision Copilot UI.
 * Defensive coding: citation fields may be missing from API.
 */

export type Mode = "decisions" | "risks" | "actions";

export type IngestSummary = {
  totalDocuments: number;
  totalChunks: number;
  chunkCountsBySection?: Record<string, number>;
  durationMs?: number;
  ms?: number;
};

export type Citation = {
  meetingTitle?: string;
  meetingDate?: string;
  meetingType?: string;
  section?: string;
  sourceFile?: string;
  chunkId?: string;
};

export type ExtractedItem = {
  text: string;
  citation: Citation;
  score?: number;
};

export type EvidenceItem = {
  score: number;
  citation: Citation;
  preview: string;
};

/** Confidence thresholds: >0.45 High, 0.30–0.45 Medium, else Low */
export function confidenceFromScore(score: number | undefined): "High" | "Medium" | "Low" {
  if (score == null || score <= 0) return "Low";
  if (score > 0.45) return "High";
  if (score >= 0.3) return "Medium";
  return "Low";
}

export function resultKey(item: ExtractedItem): string {
  const c = item.citation ?? {};
  return `${c.chunkId ?? ""}::${item.text.slice(0, 100)}`;
}

export function formatLastIngest(ms: number): string {
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60_000) return "Just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatLastReviewed(ms: number): string {
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60_000) return "Just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatExactTimestamp(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Safe citation line for display */
export function citationLine(c: Citation): string {
  const title = c?.meetingTitle ?? "—";
  const date = c?.meetingDate ?? "—";
  const section = c?.section ?? "—";
  return `${title} — ${date} — ${section}`;
}

/** Parse YYYY-MM-DD to timestamp for date filtering */
export function parseMeetingDate(d: string | undefined): number {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return isNaN(t) ? 0 : t;
}

const STORAGE_KEY_PINNED = "decision-copilot-pinned";
const STORAGE_KEY_DISMISSED = "decision-copilot-dismissed";

export function loadPinnedFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PINNED);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? new Set(arr as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function savePinnedToStorage(keys: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify([...keys]));
  } catch {
    // ignore
  }
}

export function loadDismissedFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? new Set(arr as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function saveDismissedToStorage(keys: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify([...keys]));
  } catch {
    // ignore
  }
}
