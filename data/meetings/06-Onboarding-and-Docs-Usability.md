# Meeting: Onboarding & Docs — Making the Demo Self-Serve
Date: 2026-03-10
Type: Design

> _Fictional, synthetic example created for a personal AI PM portfolio._

## Attendees
- [REDACTED_PM]
- [REDACTED_DESIGN]
- [REDACTED_DEVREL]
- [REDACTED_ENG]

## Objective
Improve onboarding so a recruiter or engineer can run the demo in <15 minutes without back-and-forth.

## Agenda
1. Audit current README
2. Identify top friction points
3. Agree on docs structure
4. Decide what “good onboarding” means

## Discussion notes
### Friction audit
Common blockers:
- unclear prerequisites (Node versions)
- unclear “what to run where”
- not obvious what queries to try

### Docs structure
We proposed:
- top-level README: what this is, why it’s safe, quickstart
- `USE_CASES.md`: how to use dataset for RAG/evals
- `DEMO_SCRIPT.md`: 5 queries to run + expected behaviors
- troubleshooting: 3 common issues (install, port, file paths)

### In-app onboarding
Design suggested adding:
- a default query list (“try these”) and a small “What am I looking at?” panel

## Decisions
- We will add a `DEMO_SCRIPT.md` with 5 guided queries and what to look for.
- The Next.js landing page will include example queries and a short “about” blurb.
- We will standardize prerequisites in README (Node version + commands).
- We will keep troubleshooting minimal and focus on fast success paths.

## Open Decisions
- [OPEN] TBD: Should the onboarding panel be dismissible forever or show once per session?
- [OPEN] Open question: Do we add a short video walkthrough or rely on text + screenshots only?
- [OPEN] Needs decision: Which 5 queries go in DEMO_SCRIPT — PM to propose or team vote?
- [OPEN] To be decided: Include Windows-specific commands in README or assume WSL/macOS only?
- [OPEN] TBD: "What am I looking at?" panel — collapse by default or expanded on first load?

## Action Items
- [REDACTED_PM]: Draft `DEMO_SCRIPT.md` and update README quickstart (Due: 2026-03-12)
- [REDACTED_DESIGN]: Add lightweight onboarding panel in UI (Due: 2026-03-13)
- [REDACTED_DEVREL]: Write “What this demonstrates” section targeted at AI startups (Due: 2026-03-12)
- [REDACTED_ENG]: Add a `npm run check` script to validate setup (Due: 2026-03-14)

## Risks
- **Docs bloat:** Too much text reduces clarity.
- **UI clutter:** Onboarding panel could distract from core experience.
- **Unreliable setup:** If commands differ by OS, users may get stuck.

## Key insights (optional)
- Onboarding is product: a demo that’s hard to run looks like a weak product.
- “Example queries” are the fastest way to create aha moments.
