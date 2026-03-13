# Meeting: Incident Review — Recommendation Loop Bug (Synthetic)
Date: 2026-03-14
Type: Incident Review

> _Fictional incident created for a personal AI PM portfolio. No real systems or events._

## Attendees
- [REDACTED_ENG_LEAD]
- [REDACTED_PM]
- [REDACTED_SUPPORT]

## Objective
Postmortem a synthetic issue where the app repeatedly suggested the same action after users dismissed it.

## Agenda
1. Timeline of what happened
2. Root cause analysis
3. Fix plan
4. Prevention plan

## Discussion notes
### Symptom
Users dismissed a recommendation, but the same recommendation reappeared on the next refresh.

### Root cause
- Dismissal event was logged, but the ranking layer did not incorporate it.
- The cache keyed recommendations only on workflow state, not on user response.

### Fix plan
- Add a “cooldown” state after dismissal per recommendation category.
- Include user response signals in ranking inputs.

### Prevention
- Add a regression test: dismiss → refresh → should not show same suggestion.
- Add a dashboard alert for repeated dismissals.

## Decisions
- Dismissal will trigger a category cooldown and suppress that recommendation for a fixed window.
- Ranking inputs must include user response history (accept/edit/snooze/dismiss).
- We will add an automated test for the loop scenario.

## Open Decisions
- [OPEN] TBD: Cooldown window length — 1 hour, 24 hours, or configurable per tenant?
- [OPEN] Open question: Should we show a "You dismissed this" note if the same suggestion would have appeared?
- [OPEN] Needs decision: Include snooze in response history for ranking or only accept/dismiss/edit?
- [OPEN] To be decided: Dashboard alert threshold — 3 repeated dismissals or 5?
- [OPEN] TBD: User-facing explanation — in-app tooltip only or also in docs?

## Action Items
- [REDACTED_ENG_LEAD]: Implement cooldown logic and update cache keys (Due: 2026-03-16)
- [REDACTED_PM]: Update product spec to treat dismissal as strong negative feedback (Due: 2026-03-16)
- [REDACTED_SUPPORT]: Draft a user-facing explanation for dismiss behavior (Due: 2026-03-17)

## Risks
- **Over-suppression:** Cooldowns could hide useful recommendations.
- **Complexity:** Response history inputs could complicate ranking logic.
- **Trust damage:** Repeated suggestions feel spammy and reduce adoption.

## Key insights (optional)
- Feedback loops aren’t optional in recommendation products.
- “Dismiss” is a product contract: it must be respected.
