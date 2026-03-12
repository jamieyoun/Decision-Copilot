// lib/analyze.ts
// Rules-first extraction for Decision Copilot.
// Given retrieved meeting chunks (with citations), extract:
// - Open Decisions
// - Risks
// - Action Items
//
// This is intentionally deterministic and transparent (PM-grade):
// use structure where it exists, and keep every item traceable to sources.
export type Citation = {
    meetingTitle: string;
    meetingDate: string;
    meetingType: string;
    section: string;
    sourceFile: string;
    chunkId: string;
  };
  
  export type ExtractedItem = {
    text: string;
    citation: Citation;
    // optional: keep retrieval score for debugging / tie-breaking
    score?: number;
  };
  
  export type AnalyzeOutput = {
    openDecisions: ExtractedItem[];
    risks: ExtractedItem[];
    actionItems: ExtractedItem[];
  };
  
  // You may already have this type elsewhere; keep it lightweight here.
  // If you import MeetingChunk from your chunker, replace this with that import.
  export type MeetingChunk = {
    chunkId: string;
    meetingTitle: string;
    meetingDate: string;
    meetingType: string;
    section: string;
    text: string;
    sourceFile: string;
  };
  
  // Search result shape produced by vectorstore.searchIndex (score + metadata)
  export type Retrieved = {
    score: number;
    metadata: MeetingChunk;
  };
  
  function makeCitation(chunk: MeetingChunk): Citation {
    return {
      meetingTitle: chunk.meetingTitle,
      meetingDate: chunk.meetingDate,
      meetingType: chunk.meetingType,
      section: chunk.section,
      sourceFile: chunk.sourceFile,
      chunkId: chunk.chunkId,
    };
  }
  
  function normalizeLine(s: string): string {
    return s.replace(/\s+/g, " ").trim();
  }
  
  function isActionItem(line: string): boolean {
    const l = line.trim();
    // markdown task list
    if (/^[-*]\s*\[\s*\]\s+/.test(l)) return true;
    // optional: simple TODO patterns
    if (/^(todo|to-do)\s*:/i.test(l)) return true;
    return false;
  }
  
  function isOpenDecision(line: string): boolean {
    const l = line.trim();
    if (/\[open\]/i.test(l)) return true;
    if (/\bopen question\b/i.test(l)) return true;
    if (/\btbd\b/i.test(l)) return true;
    if (/\bneeds decision\b/i.test(l)) return true;
    if (/\bto be decided\b/i.test(l)) return true;
    return false;
  }
  
  function isRiskLine(line: string): boolean {
    const l = line.trim();
    if (/\brisk\b/i.test(l)) return true;
    if (/\bconcern\b/i.test(l)) return true;
    if (/\bblocker\b/i.test(l)) return true;
    if (/\bmitigation\b/i.test(l)) return true;
    return false;
  }
  
  function splitIntoCandidateLines(text: string): string[] {
    // Split by newline; keep bullets reasonably intact.
    // Later we trim and filter empties.
    return text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  
  function pushDedup(
    arr: ExtractedItem[],
    seen: Map<string, ExtractedItem>,
    item: ExtractedItem
  ) {
    const key = normalizeLine(item.text).toLowerCase();
    if (!key) return;
  
    // If we already saw it, keep the one with higher score (more relevant evidence)
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, item);
      arr.push(item);
      return;
    }
  
    const a = existing.score ?? -Infinity;
    const b = item.score ?? -Infinity;
    if (b > a) {
      // Replace in map and array (simple approach)
      seen.set(key, item);
      const idx = arr.findIndex(
        (x) => normalizeLine(x.text).toLowerCase() === key
      );
      if (idx >= 0) arr[idx] = item;
    }
  }
  
  function cleanBulletPrefix(line: string): string {
    // Remove leading bullet markers so items read well in UI
    return line
      .replace(/^[-*]\s+/, "")
      .replace(/^\[\s*\]\s+/, "") // edge
      .trim();
  }
  
  function cleanTaskPrefix(line: string): string {
    // Turn "- [ ] Do X" into "Do X"
    return line.replace(/^[-*]\s*\[\s*\]\s+/, "").trim();
  }
  
  /**
  * Main function:
  * Takes retrieved chunks (topK) and extracts structured lists with citations.
  */
  export function analyzeRetrieved(retrieved: Retrieved[]): AnalyzeOutput {
    const openDecisions: ExtractedItem[] = [];
    const risks: ExtractedItem[] = [];
    const actionItems: ExtractedItem[] = [];
  
    const seenDecisions = new Map<string, ExtractedItem>();
    const seenRisks = new Map<string, ExtractedItem>();
    const seenActions = new Map<string, ExtractedItem>();
  
    for (const r of retrieved) {
      const chunk = r.metadata;
      const score = r.score;
      const citation = makeCitation(chunk);
  
      const sectionName = (chunk.section || "").toLowerCase();
  
      const lines = splitIntoCandidateLines(chunk.text);
  
      for (const raw of lines) {
        const line = normalizeLine(raw);
        if (!line) continue;
  
        // ACTION ITEMS
        if (sectionName.includes("action") || isActionItem(line)) {
          const text = isActionItem(line) ? cleanTaskPrefix(line) : cleanBulletPrefix(line);
          if (text) {
            pushDedup(actionItems, seenActions, { text, citation, score });
          }
          continue;
        }
  
        // OPEN DECISIONS
        if (sectionName.includes("decision") || isOpenDecision(line)) {
          const text = cleanBulletPrefix(line);
          if (text && isOpenDecision(text)) {
            // keep the marker as part of text? usually better to keep it readable
            pushDedup(openDecisions, seenDecisions, { text, citation, score });
          } else if (text && sectionName.includes("decision")) {
            // If it's in Decisions section but not explicitly OPEN/ TBD, still include
            // (some notes may not use markers)
            pushDedup(openDecisions, seenDecisions, { text, citation, score });
          }
          continue;
        }
  
        // RISKS
        if (sectionName.includes("risk") || isRiskLine(line)) {
          const text = cleanBulletPrefix(line);
          if (text) {
            pushDedup(risks, seenRisks, { text, citation, score });
          }
          continue;
        }
  
        // If we’re in Key insights section, we can still classify by keywords
        if (sectionName.includes("key insights") || sectionName.includes("insights")) {
          if (isActionItem(line)) {
            const text = cleanTaskPrefix(line);
            pushDedup(actionItems, seenActions, { text, citation, score });
          } else if (isOpenDecision(line)) {
            const text = cleanBulletPrefix(line);
            pushDedup(openDecisions, seenDecisions, { text, citation, score });
          } else if (isRiskLine(line)) {
            const text = cleanBulletPrefix(line);
            pushDedup(risks, seenRisks, { text, citation, score });
          }
        }
      }
    }
  
    // Optional: sort by score desc so the most relevant items appear first
    const sortByScore = (a: ExtractedItem, b: ExtractedItem) =>
      (b.score ?? -Infinity) - (a.score ?? -Infinity);
  
    openDecisions.sort(sortByScore);
    risks.sort(sortByScore);
    actionItems.sort(sortByScore);
  
    return { openDecisions, risks, actionItems };
  }