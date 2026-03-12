
# BUILD_CHECKLIST — Decision Copilot

Use this checklist to **build the project efficiently without over-scoping**. Follow it top to bottom. When a step says *stop*, move on.

---

## Phase 1 — Data & Ingestion (Foundation)
✅ Meeting notes are synthetic, externally safe, and stored in `data/meetings/`
✅ Metadata headers present (Meeting title, Date, Type)

**Build**
- [ ] Loader reads all `.md` files and extracts metadata + raw text
- [ ] Chunker splits notes by section (`Decisions`, `Risks`, `Action Items`)
- [ ] `/api/ingest` returns document + chunk counts

**Stop when**
- You can `POST /api/ingest` and see correct counts

---

## Phase 2 — Retrieval & Indexing (Core AI capability)

**Build**
- [ ] Local embeddings (no API keys)
- [ ] Local vector index written to disk
- [ ] Retrieval returns top relevant chunks for a query

**Stop when**
- Index builds successfully
- Retrieved chunks clearly map back to meetings + sections

---

## Phase 3 — Decision Copilot Behaviors (Product logic)

**Build**
- [ ] Open Decisions mode (rules-first extraction)
- [ ] Risks mode
- [ ] Action Items mode
- [ ] Citations included with every result

**Stop when**
- Results are correct *and* traceable to sources

---

## Phase 4 — Minimal UI (Trust-first)

**Build**
- [ ] Button to ingest data
- [ ] Tabs or buttons for Decisions / Risks / Actions
- [ ] Evidence panel or expandable citation view

**Stop when**
- A user can verify every output in under 1 click

---

## Phase 5 — Polish (Portfolio-ready)

**Build**
- [ ] Clear README
- [ ] Product Decisions doc linked
- [ ] Data Sources disclosure included

**Stop when**
- You can demo the product in under 2 minutes

---

## Red flags (do NOT do these in v1)
🚫 Don’t add agents
🚫 Don’t automate decisions
🚫 Don’t optimize model performance prematurely
🚫 Don’t expand beyond meeting notes

> If you feel tempted to do any of the above, the project is already good enough.
