
# AI_TRADEOFFS_CHEATSHEET — Decision Copilot

Use this as a **quick reference for why certain AI product decisions were made**. Helpful during design and interviews.

---

## Rules vs LLMs
**Choice:** Rules-first where structure exists

**Why:**
- Meeting notes have predictable patterns
- Rules are faster, cheaper, and more reliable

**Tradeoff:**
- Less flexible if formatting degrades

---

## Retrieval vs Generation
**Choice:** Retrieval-heavy, generation-light

**Why:**
- The goal is surfacing context, not inventing answers
- Retrieval enables citations and trust

**Tradeoff:**
- Answers may feel less "polished" but are verifiable

---

## Task-mode UX vs Chatbot
**Choice:** Explicit task modes (Decisions / Risks / Actions)

**Why:**
- Users return to the same questions repeatedly
- Easier to evaluate and trust

**Tradeoff:**
- Less open-ended exploration

---

## Local models vs Hosted APIs
**Choice:** Local-first (no API keys)

**Why:**
- Portable demos
- Privacy-friendly
- Fewer dependencies

**Tradeoff:**
- Slower and sometimes less capable models

---

## Evidence-first UI vs Clean UI
**Choice:** Show citations and evidence by default

**Why:**
- Trust > aesthetics for AI products
- Reduces overreliance on AI outputs

**Tradeoff:**
- Slightly noisier UI

---

## Automation vs Human Control
**Choice:** Decision support only

**Why:**
- Prevents overreach
- Keeps humans accountable

**Tradeoff:**
- Less perceived "magic"

---

## Interview one-liner
> "I use rules where structure exists, retrieval where trust matters, and generation only where ambiguity remains."
