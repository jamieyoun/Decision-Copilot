# Meeting: Data Contract & Redaction Review (Synthetic Notes Dataset)
Date: 2026-03-07
Type: Review

> _Fictional, synthetic example created for a personal AI PM portfolio. Dataset is synthetic; sections are designed to mimic real notes without including any confidential information._

## Attendees
- [REDACTED_PM]
- [REDACTED_ENG]
- [REDACTED_SECURITY]
- [REDACTED_PRIVACY]

## Objective
Define a **dataset contract** for the synthetic meeting notes so downstream tooling (search, RAG, eval) can rely on stable structure — and validate that redaction rules are consistently applied.

## Agenda
1. Confirm required sections and header format
2. Define allowed/forbidden content categories
3. Decide how we’ll validate compliance automatically

## Discussion notes
### Dataset contract
We standardized a simple header and required sections:
- Header lines: `# Meeting: …`, `Date: …`, `Type: …`
- Required sections: Decisions, Action Items, Risks, Key insights (optional)

We agreed additional sections are allowed (Context, Agenda, Discussion, Open Questions), but required sections must exist and be non-empty.

### Redaction rules
We reaffirmed the dataset must not include:
- real person names
- real customers/partners
- precise metrics, volumes, rates, dates that could map to real events
- internal system names or URLs

Allowed:
- role placeholders (e.g., [REDACTED_PM])
- generic nouns (“partner”, “client”, “workflow”)
- synthetic timelines that cannot be linked to real work

### Automated validation
Engineering proposed adding a lightweight validator that:
- checks headers exist
- checks required section headings exist
- flags forbidden patterns (email addresses, URLs, proper names if detectable)

Privacy suggested adding a manual review checklist for public releases.

## Decisions
- We will enforce a dataset contract: simple header + required sections present and non-empty.
- We will maintain a “forbidden content” checklist and run a validator before publishing.
- Notes may include additional sections, but required sections must be present and unique per meeting.
- Any future dataset expansion must pass the same validation.

## Action Items
- [REDACTED_ENG]: Add a `validate_notes.py` script that checks structure + forbidden patterns (Due: 2026-03-10)
- [REDACTED_PM]: Write a short “Data Sources & Safety” README section for GitHub (Due: 2026-03-10)
- [REDACTED_SECURITY]: Review validator rules for obvious leakage risks (Due: 2026-03-11)

## Risks
- **False sense of safety:** Automated validation won’t catch all sensitive inference.
- **Over-scrubbing:** Over-redaction can make notes unrealistic and less useful.
- **Schema drift:** If structure changes, demos and evals may break.

## Key insights (optional)
- Treating docs as a dataset forces clarity: the contract is part of the product.
- Validation is not just compliance; it increases reliability for tooling.
