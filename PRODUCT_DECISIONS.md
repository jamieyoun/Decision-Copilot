
# PRODUCT_DECISIONS — Decision Copilot (Local + Next.js)

This document explains the **product choices** behind Decision Copilot. The goal is to make the project legible as **AI PM work**, not just code.

---

## 1) Product intent (v1)
**Job-to-be-done:** Help a PM (or team lead) regain context quickly by surfacing:
- open decisions
- risks
- action items

**Not** to replace judgment or make decisions automatically.

---

## 2) Why “task mode” UX instead of a generic chatbot
**Decision:** Provide explicit modes (Open Decisions / Risks / Action Items / Ask).

**Why:**
- Teams repeatedly return to the *same* post-meeting questions.
- Task-mode is faster, reduces prompt variance, and supports clearer evaluation.
- It prevents the product from overreaching (“strategy generator”) and keeps it grounded.

**Tradeoff:** Less flexible than open-ended chat, but higher trust and repeatability.

---

## 3) Evidence-first + citations as a core feature (trust > cleverness)
**Decision:** Always show citations (meeting title/date/section) and optionally the retrieved evidence snippet.

**Why:**
- Users need to verify and build trust.
- AI outputs are probabilistic; the UI must make uncertainty visible.

**Tradeoff:** Slightly noisier UI, but dramatically more credible and useful.

---

## 4) Local-first architecture (no API keys)
**Decision:** Use local embeddings and local indexing.

**Why:**
- Portable demos; no secrets management.
- Privacy-friendly default.
- Mirrors real constraints in many enterprise settings.

**Tradeoff:** Local models can be slower/less accurate than hosted solutions.

---

## 5) Rules-first extraction where structure exists
**Decision:** For meeting notes, extract decisions/risks/actions using deterministic patterns (e.g., `[OPEN]`, task lists `- [ ]`, “Risks” section), and use embeddings primarily for *retrieval*.

**Why:**
- Your meeting notes are structured. Rules are reliable and fast.
- AI is used where ambiguity exists (finding relevant chunks), not for everything.

**Tradeoff:** If notes are inconsistent, rules may miss items; mitigated by retrieval + evidence display.

---

## 6) Chunking strategy: section-level chunks
**Decision:** Chunk by markdown sections (`## Decisions`, `## Risks`, `## Action Items`, etc.) rather than arbitrary token windows.

**Why:**
- Preserves semantic units (“this is a decision list”).
- Improves precision and citation quality.

**Tradeoff:** Very long sections may reduce retrieval precision; can be improved later with paragraph sub-chunking.

---

## 7) Guardrails
**Guardrails in v1:**
- Conservative answers when evidence is weak
- Citations required
- No autonomous actions
- Clear “out-of-scope” boundaries

---

## 8) What I would do next (v2)
- Add a lightweight evaluation harness (gold questions + rubric)
- Add feedback logging and prompt iteration loop
- Add recency weighting (e.g., “last 2 weeks”) using metadata
- Expand corpus beyond meetings (public RFCs/design docs)
