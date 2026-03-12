# Meeting: Quarterly Planning — Next Bets for the AI Assistant
Date: 2026-03-15
Type: Planning

> _Fictional planning meeting created for a personal AI PM portfolio._

## Attendees
- [REDACTED_PM]
- [REDACTED_ENG_MANAGER]
- [REDACTED_ML_LEAD]
- [REDACTED_DESIGN_LEAD]

## Objective
Choose the next 2–3 bets for the next quarter and define what we will *not* do.

## Agenda
1. Review learnings from v0
2. Brainstorm next bets
3. Rank by impact vs effort vs risk
4. Define quarter goals

## Discussion notes
### Candidate bets
1) Upgrade retrieval to embeddings + citations
2) Add admin governance UI for constraint registry
3) Add “explainability analytics” dashboard
4) Add more workflows for sequencing

### Prioritization
We used three filters:
- improves trust/legibility
- produces measurable learning
- keeps scope bounded

We deprioritized “more workflows” until the core loop is stable.

## Decisions
- Next quarter bets: (1) embeddings-based retrieval with citations, (2) governance UI for constraints, (3) improved onboarding and demo script.
- We will not add new workflows until we can show stable usefulness in one.
- We will treat evaluation harness as a first-class deliverable (not optional).

## Action Items
- [REDACTED_PM]: Draft quarterly goals and success criteria (Due: 2026-03-18)
- [REDACTED_ML_LEAD]: Propose embedding model options and offline indexing plan (Due: 2026-03-20)
- [REDACTED_ENG_MANAGER]: Staff plan for governance UI and index pipeline (Due: 2026-03-20)
- [REDACTED_DESIGN_LEAD]: Concept mockups for governance UI + citations UX (Due: 2026-03-22)

## Risks
- **Evaluation debt:** Embeddings without eval could create invisible regressions.
- **Governance complexity:** Admin UI can balloon if not constrained.
- **Tooling drift:** Demo may become too engineered for its purpose.

## Key insights (optional)
- Trust features (citations, governance) are often more valuable than model sophistication.
- A clear “not doing” list is the only way to protect focus.
