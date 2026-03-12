import 'server-only';

import type { MeetingRecord } from './loader';

export interface MeetingChunk {
  chunkId: string;
  meetingTitle: string;
  meetingDate: string;
  meetingType: string;
  section: string;
  text: string;
  sourceFile: string;
}

/**
 * Split a meeting document into section-level chunks.
 *
 * - Splits only on headings starting with "##"
 * - Each non-empty section becomes exactly one chunk
 * - Does not split within a section
 * - chunkId is stable: `${doc.id}::${index}`
 */
export function chunkMeeting(doc: MeetingRecord): MeetingChunk[] {
  const { id, title, date, type, rawText, sourceFile } = doc;

  const lines = rawText.split(/\r?\n/);

  const chunks: MeetingChunk[] = [];

  let currentSectionTitle: string | null = null;
  let currentSectionLines: string[] = [];
  let sectionIndex = 0;

  const flushSection = () => {
    if (!currentSectionTitle) return;

    const text = currentSectionLines.join('\n').trim();
    if (!text) {
      // Ignore empty sections
      return;
    }

    const chunkId = `${id}::${sectionIndex}`;

    chunks.push({
      chunkId,
      meetingTitle: title,
      meetingDate: date,
      meetingType: type,
      section: currentSectionTitle,
      text,
      sourceFile,
    });

    sectionIndex += 1;
  };

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.*)$/);

    if (headingMatch) {
      // Starting a new section: flush the previous one
      flushSection();
      currentSectionTitle = headingMatch[1].trim();
      currentSectionLines = [];
    } else if (currentSectionTitle) {
      currentSectionLines.push(line);
    }
  }

  // Flush the last section, if any
  flushSection();

  return chunks;
}

