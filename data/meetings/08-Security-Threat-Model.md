# Meeting: Security & Threat Modeling — AI Notes Demo
Date: 2026-03-11
Type: Risk Review

> _Fictional, synthetic example created for a personal AI PM portfolio._

## Attendees
- [REDACTED_SECURITY]
- [REDACTED_ENG]
- [REDACTED_PM]

## Objective
Threat model the demo architecture and identify must-have mitigations for a public GitHub project.

## Agenda
1. Identify assets and attack surfaces
2. Enumerate threats
3. Decide mitigations and safe defaults

## Discussion notes
### Assets
- synthetic notes files
- API endpoints (search, fetch, extract)
- logs (avoid storing sensitive content)

### Threats
- path traversal via note id
- XSS via markdown rendering
- prompt injection content inside notes (even if synthetic)
- accidental leakage via environment variables

### Mitigations
- sanitize note ids and restrict to `.md` files in a fixed directory
- render markdown with safe options; avoid raw HTML rendering
- treat notes as untrusted input even if synthetic
- ensure `.env` is gitignored

## Decisions
- The demo will restrict note reads to a whitelisted directory and enforce `.md` extension.
- We will avoid rendering raw HTML from markdown; render safe markdown only.
- API responses will avoid echoing full content unless explicitly requested.
- We will add a short “Security notes” section to README.

## Action Items
- [REDACTED_ENG]: Harden note fetch route against path traversal (Due: 2026-03-13)
- [REDACTED_SECURITY]: Provide a minimal security checklist for open-source demos (Due: 2026-03-13)
- [REDACTED_PM]: Add security disclaimers and safe defaults in docs (Due: 2026-03-14)

## Risks
- **Markdown XSS:** Rendering raw HTML could enable script injection.
- **Directory traversal:** Attackers could read arbitrary files if IDs are not sanitized.
- **Prompt injection:** Notes could contain adversarial instructions for downstream LLMs.

## Key insights (optional)
- Treat documents as untrusted input—security posture shouldn’t depend on “good data.”
- Most demo security issues are simple: path handling and rendering.
