# Meeting: Eval Harness — Quality Bar for Retrieval + Summaries
Date: 2026-03-08
Type: Planning

> _Fictional, synthetic example created for a personal AI PM portfolio. No real systems or metrics._

## Attendees
- [REDACTED_PM]
- [REDACTED_ML]
- [REDACTED_ENG]
- [REDACTED_ANALYTICS]

## Objective
Define a lightweight evaluation harness for our note-search / RAG demo: what “good” looks like and how we’ll test it without proprietary data.

## Agenda
1. Define evaluation tasks
2. Define failure modes (hallucination, missing citations)
3. Choose a small gold set
4. Decide how we’ll track regressions

## Discussion notes
### Evaluation tasks
We chose three tasks aligned to the dataset structure:
1) Extract all Decisions across notes
2) Extract open Action Items due in a date range
3) Answer a question with citations (must reference filenames)

### Failure modes
We listed key failure modes:
- hallucinated decisions that are not in notes
- mixing action items across meetings incorrectly
- missing or incorrect citations
- overconfident answers when retrieval returns weak matches

### Gold set design
We decided a small hand-authored gold set is enough:
- 10 Q&A prompts
- expected sources (files)
- expected key points

### Regression approach
Engineering proposed running the gold set on every change and flagging:
- citation coverage
- faithfulness (exact text match for key claims)
- consistency (same answer structure)

## Decisions
- We will build an eval harness with 3 task types: extract decisions, extract action items, Q&A with citations.
- Any answer must include citations or explicitly say “insufficient evidence.”
- We will create a small gold set (10 prompts) and run it as a script.
- We will treat citation accuracy as the primary metric for v0.

## Open Decisions
- [OPEN] TBD: Should the gold set be 10 prompts or expand to 20 once the harness is stable?
- [OPEN] Open question: Do we score "insufficient evidence" responses as correct when appropriate, or only cited answers?
- [OPEN] Needs decision: Who maintains the gold set — PM or ML?
- [OPEN] To be decided: Run eval on every commit or only on main branch before deploy?
- [OPEN] TBD: How do we handle flaky evals (e.g. non-deterministic retrieval)?

## Action Items
- [REDACTED_PM]: Draft the 10 gold prompts + expected answers at high level (Due: 2026-03-11)
- [REDACTED_ENG]: Implement `run_eval.ts` or `run_eval.py` to execute prompts and compare outputs (Due: 2026-03-13)
- [REDACTED_ML]: Propose a rubric for faithfulness vs helpfulness tradeoffs (Due: 2026-03-12)

## Risks
- **Overfitting:** The system might optimize for the gold set and not generalize.
- **Eval brittleness:** Exact string matching could be too strict.
- **False confidence:** Good eval results may hide real UX issues.

## Key insights (optional)
- In RAG demos, citations are your “trust interface.”
- “I don’t know” is a feature, not a bug, when evidence is weak.
