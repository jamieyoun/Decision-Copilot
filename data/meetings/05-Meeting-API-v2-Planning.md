# Meeting: API v2 Planning — Notes Search + Structured Extraction
Date: 2026-03-09
Type: Planning

> _Fictional, synthetic example created for a personal AI PM portfolio. No real APIs or internal systems referenced._

## Attendees
- [REDACTED_PM]
- [REDACTED_ENG_LEAD]
- [REDACTED_FRONTEND]
- [REDACTED_DESIGN]

## Objective
Plan API v2 for the demo: move from simple keyword search to a small, well-designed API that supports:
- search
- document fetch
- structured extraction (decisions/action items/risks)

## Agenda
1. Review v1 limitations
2. Define v2 endpoints and response shapes
3. Decide pagination + error handling
4. Confirm backwards compatibility

## Discussion notes
### v1 limitations
- search returns only title/snippet; no structured fields
- no pagination
- no server-side extraction

### v2 endpoint proposal
- `GET /api/search?q=&type=&dateFrom=&dateTo=&page=` → returns ranked results
- `GET /api/notes/:id` → returns full markdown + parsed header fields
- `POST /api/extract` with `{ ids?:[], scope?: 'all', fields?: ['decisions','actions','risks'] }`

### Response shapes
Engineering suggested normalized shapes:
- `note`: `{ id, meetingTitle, date, type, excerpt }`
- `extract`: `{ decisions: [], actionItems: [], risks: [] }` each item includes `sourceId`

### Error handling
We agreed:
- invalid ids return 404
- extraction failures return partial results + `errors[]`

## Decisions
- We will implement API v2 with three endpoints: search, note fetch, extraction.
- v2 search supports filters on `Type` and date range using header fields.
- Extraction returns structured items with `sourceId` for traceability.
- v1 remains for backward compatibility but will be marked deprecated in README.

## Action Items
- [REDACTED_ENG_LEAD]: Implement parsing of header fields (meetingTitle/date/type) in a shared utility (Due: 2026-03-11)
- [REDACTED_FRONTEND]: Update UI to display Type/Date chips and basic filters (Due: 2026-03-13)
- [REDACTED_PM]: Write API v2 contract docs + examples (Due: 2026-03-12)
- [REDACTED_DESIGN]: Provide filter UI spec (minimal, non-distracting) (Due: 2026-03-12)

## Risks
- **Scope creep:** Extraction endpoint could balloon into summarization.
- **Consistency bugs:** Parsing headers incorrectly breaks filtering.
- **Performance:** Naive parsing per request could become slow at scale.

## Key insights (optional)
- A small API contract is a great portfolio artifact: it shows product thinking in interfaces.
- Traceability (`sourceId`) is the foundation for trustworthy AI features.
