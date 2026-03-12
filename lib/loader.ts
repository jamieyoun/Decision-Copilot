import 'server-only';
import { cache } from 'react';
import fs from 'fs/promises';
import path from 'path';

type AnyFn = (...args: any[]) => Promise<any>;

export interface LoaderOptions {
  /**
   * Revalidation time in seconds, or `false` to opt out of caching
   * when used with Next.js `fetch`.
   */
  revalidate?: number | false;
}

/**
 * Wrap an async function in React's `cache` for use in
 * Next.js App Router server components.
 *
 * Example:
 *
 * const getUser = createLoader(async (id: string) => {
 *   const res = await fetch(`${process.env.API_URL}/users/${id}`, {
 *     next: { revalidate: 60 },
 *   });
 *   if (!res.ok) throw new Error('Failed to fetch user');
 *   return res.json() as Promise<User>;
 * });
 */
export function createLoader<F extends AnyFn>(
  fn: F,
  _options: LoaderOptions = {},
) {
  // `cache` memoizes the function per request + arguments
  const cachedFn = cache(fn);
  return cachedFn as F;
}

/**
 * Convenience helper for fetching JSON in server components.
 *
 * Respects Next.js `fetch` caching via the `next` option.
 */
export async function fetchJson<T>(
  input: string | URL,
  init?: RequestInit & { next?: { revalidate?: number | false } },
): Promise<T> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Request to "${input.toString()}" failed with ${res.status}: ${text}`,
    );
  }

  return (await res.json()) as T;
}

export interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  type: string;
  rawText: string;
  sourceFile: string;
}

/**
 * Load all meeting markdown files from `data/meetings`.
 *
 * Each file must begin with:
 *   # Meeting: <title>
 *   Date: YYYY-MM-DD
 *   Type: <type>
 *
 * Returns an array of meeting records.
 */
export async function loadMeetings(): Promise<MeetingRecord[]> {
  const meetingsDir = path.join(process.cwd(), 'data', 'meetings');

  let entries: string[];
  try {
    entries = await fs.readdir(meetingsDir);
  } catch (error: any) {
    if (error && error.code === 'ENOENT') {
      throw new Error(
        `Meetings directory not found at "${meetingsDir}". ` +
          'Ensure `data/meetings` exists and contains .md files.',
      );
    }
    throw new Error(
      `Failed to read meetings directory at "${meetingsDir}": ${error?.message ?? String(
        error,
      )}`,
    );
  }

  const mdFiles = entries.filter((name) => name.toLowerCase().endsWith('.md'));

  if (mdFiles.length === 0) {
    throw new Error(
      `No meeting markdown files found in "${meetingsDir}". ` +
        'Add at least one `.md` file with the required header format.',
    );
  }

  const meetings: MeetingRecord[] = [];

  for (const filename of mdFiles) {
    const filePath = path.join(meetingsDir, filename);
    const rawText = await fs.readFile(filePath, 'utf8');

    const lines = rawText.split(/\r?\n/);

    if (lines.length < 3) {
      throw new Error(
        `Meeting file "${filePath}" is missing required header lines. ` +
          'Expected at least 3 lines: title, date, and type.',
      );
    }

    const titleMatch = lines[0].match(/^#\s*Meeting:\s*(.+)$/);
    const dateMatch = lines[1].match(/^Date:\s*(\d{4}-\d{2}-\d{2})\s*$/);
    const typeMatch = lines[2].match(/^Type:\s*(.+)\s*$/);

    if (!titleMatch || !dateMatch || !typeMatch) {
      throw new Error(
        `Meeting file "${filePath}" has an invalid header. ` +
          'Expected the first three lines to be:\n' +
          '# Meeting: <title>\n' +
          'Date: YYYY-MM-DD\n' +
          'Type: <type>',
      );
    }

    const id = path.basename(filename, path.extname(filename));

    meetings.push({
      id,
      title: titleMatch[1].trim(),
      date: dateMatch[1],
      type: typeMatch[1].trim(),
      rawText,
      sourceFile: path.join('data', 'meetings', filename),
    });
  }

  return meetings;
}

// Backwards/ergonomic alias used by API routes.
export async function loadMeetingDocs(): Promise<MeetingRecord[]> {
  return loadMeetings();
}

