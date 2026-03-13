# Meeting: Design Critique — Explainability UX (Rationale Drawer)
Date: 2026-03-12
Type: Design

> _Fictional, synthetic example created for a personal AI PM portfolio._

## Attendees
- [REDACTED_DESIGN]
- [REDACTED_PM]
- [REDACTED_RESEARCH]
- [REDACTED_ENG]

## Objective
Critique and refine the “Why?” rationale drawer so explanations are consistent, honest, and non-technical.

## Agenda
1. Review current prototype
2. Identify where users might misinterpret
3. Decide a taxonomy of reasons
4. Define copy rules

## Discussion notes
### What we saw in the prototype
- Card shows recommendation + confidence label
- Drawer shows: category, what changed, what user can do

### Misinterpretation risks
- “Confidence” labels can feel like a black box
- Users may assume the system is certain when it is not

### Reason taxonomy
We drafted 4 reason categories:
1) Missing input
2) Safety check
3) Inconsistent context
4) Preference learned (opt-in)

### Copy rules
- Use second-person language: “To proceed, we need…”
- Avoid model words: no “probability”, “embedding”, “score”
- Always include an escape hatch: “You can dismiss this.”

## Decisions
- The rationale drawer will use a fixed taxonomy of 4 reason categories.
- We will remove numeric confidence and keep qualitative labels only.
- The drawer will always include: what triggered, what to do next, and how to override.
- Personalization explanations are only shown if user opted in.

## Open Decisions
- [OPEN] TBD: Should we A/B test "High/Medium/Low" confidence labels vs no label at all?
- [OPEN] Open question: Do we show "Preference learned" only after N accepts, or from the first?
- [OPEN] Needs decision: Who writes the default copy for each of the 4 reason categories — Design or PM?
- [OPEN] To be decided: Allow product to add a 5th category later or lock to 4 for consistency?
- [OPEN] TBD: Comprehension test — internal only or include 2–3 external reviewers?

## Action Items
- [REDACTED_DESIGN]: Update prototype to new drawer structure + reason taxonomy (Due: 2026-03-14)
- [REDACTED_RESEARCH]: Run a quick comprehension test with 3 fictional scenarios (Due: 2026-03-15)
- [REDACTED_PM]: Document copy rules in `DESIGN_PRINCIPLES.md` (Due: 2026-03-15)

## Risks
- **Over-explaining:** Too much detail reduces clarity.
- **Under-explaining:** Too little feels deceptive.
- **Inconsistency:** If reasons vary by feature, trust erodes.

## Key insights (optional)
- Explanations are UX, not documentation.
- A small reason taxonomy scales better than bespoke explanations.
