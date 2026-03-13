# Meeting: AI Sequencing — MVP Definition & Telemetry
Date: 2026-03-06
Type: Planning

> _Fictional, synthetic example created for a personal AI PM portfolio. No real systems, customers, metrics, or employer information._

## Attendees
- [REDACTED_PM]
- [REDACTED_ML]
- [REDACTED_ENG]
- [REDACTED_DESIGN]
- [REDACTED_ANALYTICS]

## Objective
Lock MVP scope for sequencing and define the **telemetry + evaluation loop** needed to iterate responsibly.

## Agenda
1. Define what “sequencing” means in MVP
2. Decide which signals are allowed
3. Define telemetry events
4. Define what constitutes a “good recommendation”

## Context
The team previously agreed that sequencing must be recommendation-only in v0. This meeting focused on turning that into a buildable slice that produces learnings quickly.

## Discussion notes
### MVP definition
We defined sequencing as: **“Recommend the next best step and timing inside a workflow.”**
MVP does:
- show one recommendation card
- optionally pre-fill a draft action (never executes)
- allow “accept”, “edit”, “snooze”, “dismiss”

MVP does NOT:
- chain multiple steps
- run in the background
- send automatic notifications without user opt-in

### Allowed signals
We constrained signals to user-visible, non-sensitive signals:
- workflow state (which screen, what step)
- user inputs (what they typed/selected)
- recent actions in the workflow (not cross-product surveillance)

We explicitly excluded any signals that could be perceived as monitoring unrelated activity.

### Telemetry
Analytics proposed a minimal event schema:
- `recommendation_shown` (with category)
- `recommendation_accepted`
- `recommendation_edited` (edit delta type)
- `recommendation_snoozed` (duration bucket)
- `recommendation_dismissed` (reason if provided)
- `recommendation_suppressed` (suppression reason)

### What is “good”?
We chose non-sensitive “quality” proxies:
- acceptance rate with low edit burden
- “snooze then accept” pattern indicates timing was slightly off, not wrong
- dismissals with “not relevant” indicate categorization issues

## Decisions
- MVP recommendation UI is a single card with actions: accept, edit, snooze, dismiss.
- MVP will support **two** recommendation categories only (to reduce noise): “Next step” and “Timing reminder.”
- Only user-visible workflow signals are allowed in MVP; no cross-context tracking.
- We will instrument suppression events to understand coverage gaps.
- We will define a weekly review ritual to look at telemetry and decide one improvement.

## Open Decisions
- [OPEN] Should we allow **per-user fine-tuning of recommendation frequency** in v1, or keep it fixed and rely on global tuning?
- [OPEN] Where should the **“Why this recommendation?” explainer** live (inline on the card vs a separate drawer) so it stays understandable but not noisy?
- [OPEN] Do we treat **“snooze” data as an explicit signal for future timing models**, or keep it purely descriptive until we have more volume?
- [OPEN] TBD: Max recommendations per user per day to avoid advice fatigue — 5, 10, or configurable?
- [OPEN] Open question: Should "dismiss" require a reason (dropdown) for analytics, or stay optional?
- [OPEN] Needs decision: Do we ship "Next step" and "Timing reminder" as two separate recommendation types in MVP or merge into one?
- [OPEN] To be decided: Snooze duration options — fixed (e.g. 1h, 1d) or free-form?
- [OPEN] TBD: Whether suppression events should be visible in any user-facing debug or admin-only.

## Action Items
- [REDACTED_PM]: Write MVP scope + non-goals + acceptance criteria (Due: 2026-03-08)
- [REDACTED_DESIGN]: Ship UI spec for recommendation card + interactions + empty states (Due: 2026-03-09)
- [REDACTED_ENG]: Implement event emission for the telemetry schema (Due: 2026-03-12)
- [REDACTED_ANALYTICS]: Draft a minimal dashboard mock (adoption/quality/safety) (Due: 2026-03-12)
- [REDACTED_ML]: Propose a first-pass heuristic baseline (non-ML) so we can ship fast (Due: 2026-03-11)

## Risks
- **Advice fatigue:** Too frequent suggestions could cause users to ignore the feature.
- **Ambiguous overrides:** Edits can mean “wrong” or “needs personalization.”
- **Privacy perception risk:** Users may feel watched if signals are unclear.
- **Evaluation risk:** Early usage may be too sparse to draw conclusions.

## Key insights (optional)
- A heuristic baseline is a feature: it lets us validate UX + telemetry before model complexity.
- Capturing “snooze” is crucial—timing errors are common and fixable.
- Suppression telemetry is how we learn where not to recommend.
