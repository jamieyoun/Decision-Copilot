## Decision Copilot

Turn raw meeting notes into a reviewable list of **open decisions**, **risks**, and **action items** – with traceable evidence from your markdown notes.

This is a **Next.js App Router** project with a local, rules-first AI workflow (no external model calls by default).

---

## Features

- **Evidence‑first UI**
  - 3‑pane layout: modes/filters · results list · evidence drawer
  - Every item includes meeting title, date, section, and source chunk ID
  - Right-hand drawer shows top retrieved evidence with previews and a “view raw chunk” toggle

- **Task‑mode workflow**
  - Modes: **Open Decisions**, **Risks**, **Action Items**
  - Pin important items, mark items as reviewed/dismissed
  - “Show reviewed” toggle to bring triaged items back when needed

- **Local index & chunking**
  - Markdown meetings in `data/meetings`
  - `lib/loader.ts` loads header metadata and raw text
  - `lib/chunker.ts` splits meetings into section-level chunks per `##` heading
  - `/api/ingest` embeds and indexes chunks locally (see `lib/vectorstore.ts`)
  - `/api/analyze` runs rules-first extraction on retrieved chunks

- **Professional UI**
  - Enterprise-style layout with a neutral palette and clear hierarchy
  - Light/dark theme toggle in the header (persists per browser)
  - Keyboard shortcuts: `1`/`2`/`3` switch mode, `Esc` closes the evidence drawer
  - Skeleton loaders, empty states, and clear error banners

---

## Project structure (high level)

- `app/page.tsx` – Decision Copilot main UI (3‑pane layout)
- `app/api/ingest/route.ts` – builds the local vector index from `data/meetings`
- `app/api/analyze/route.ts` – retrieves + analyzes chunks for decisions/risks/actions
- `lib/loader.ts` – loads & validates meeting markdown files
- `lib/chunker.ts` – creates section‑level `MeetingChunk`s
- `lib/vectorstore.ts` – local vector index utilities
- `lib/analyze.ts` – rules‑first extraction logic
- `lib/copilot-types.ts` – shared UI types and helpers
- `components/*` – layout and UI components (`StatusBar`, `Sidebar`, `ResultsList`, `EvidenceDrawer`, `ThemeProvider`, etc.)

---

## Prerequisites

- Node.js 18+ (or the version recommended by your Node/Next.js toolchain)
- `npm` (or `pnpm` / `yarn` if you prefer – commands below assume `npm`)

---

## Running locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## Preparing meeting data

Place markdown files under `data/meetings`. Each file must start with:

```markdown
# Meeting: <title>
Date: YYYY-MM-DD
Type: <type>

## Section 1
...
```

- `id` is derived from the filename (without extension).
- Sections are defined by `##` headings; each section becomes a single chunk.

---

## Typical workflow

1. **Add markdown** meeting notes to `data/meetings`.
2. In the UI, click **“Ingest meeting notes”** (or **Run Ingest** in the header) – this:
   - Loads all meetings via `lib/loader.ts`
   - Chunks them via `lib/chunker.ts`
   - Embeds & indexes chunks locally (`/api/ingest` + `lib/vectorstore.ts`)
3. Choose a mode: **Open Decisions**, **Risks**, or **Action Items**.
4. Review results:
   - Pin key items
   - Mark items reviewed/dismissed (client-side only; persisted in `localStorage`)
   - Inspect evidence in the right drawer for traceability
5. Export:
   - Export **pinned** or **current view** to Markdown
   - Copy items or exports to clipboard for docs or tickets

---

## Keyboard & shortcuts

- `1` – Open Decisions
- `2` – Risks
- `3` – Action Items
- `Esc` – Close the evidence drawer

These shortcuts are disabled when typing in inputs/textareas.

---

## Environment & deployment

This is a standard Next.js 16 (App Router) project:

- Dev: `npm run dev`
- Production build: `npm run build`
- Start production server: `npm start`

You can deploy using any Next.js-compatible host (e.g. Vercel). No external AI services are required for the core workflow; embeddings and indexing run locally.

---

## Contributing

Improvements to the extraction rules, UI, or data pipeline are welcome. Ideas that are especially valuable:

- Better heuristics for classifying decisions/risks/action items
- Additional filters (owner, status, severity) based on structured note formats
- UX improvements that keep the **evidence‑first** and **calm, enterprise** aesthetic

