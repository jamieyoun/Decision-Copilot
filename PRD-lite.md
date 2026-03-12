
# PRD-lite — Decision Copilot (v1)

**Owner:** (you)

## 1) Problem
Teams lose context across meeting notes and docs. Re-reading everything is slow, and important items (open decisions, risks, action items) get buried.

## 2) Target user
- PMs / Team leads who run recurring product/engineering meetings
- People who need quick context recaps and follow-through tracking

## 3) Job to be done
> After a week of meetings, help me quickly answer: *What’s still open? What are the top risks? What do I need to do next?* — with sources.

## 4) Goals (v1)
- Surface **open decisions**, **risks**, and **action items** from meeting notes
- Provide **citations** back to the specific note + section
- Be runnable **locally** without API keys

## 5) Non-goals (v1)
- Making decisions or recommendations autonomously
- Writing back to systems (Jira/Slack/etc.)
- Full enterprise search across many tools

## 6) User experience (v1)
### Core flows
1. User clicks **Ingest** (or runs POST `/api/ingest`)
2. User selects a mode: Decisions / Risks / Actions
3. User receives a short list of extracted items
4. User can expand evidence and view citations

## 7) Requirements
### Functional
- Ingest markdown notes from `data/meetings/`
- Parse lightweight metadata (title, date, type)
- Chunk notes by sections
- Build local embedding index
- Retrieve top chunks per mode
- Extract results with citations

### Trust & safety
- Evidence-first display
- Conservative responses when evidence is weak
- Explicitly synthetic, externally safe dataset documentation

## 8) Success metrics (portfolio-appropriate)
### Qualitative
- A user can verify every extracted item via citation
- A user can find open decisions in <30 seconds

### Quantitative (optional)
- % extracted items that map to correct section (manual spot-check)
- Time-to-answer and error rate (index missing, no files)

## 9) Risks & mitigations
- **Inconsistent formatting** → prefer rules for structured patterns, add fallback heuristics
- **Overconfident outputs** → require citations + show evidence
- **Slow local models** → keep corpus small, cache index, topK limits

## 10) Future work (v2)
- Evaluation harness + regression tests
- Feedback loop (useful/not useful)
- Recency filters and weighting
- Expand corpus to include public RFCs/design docs
