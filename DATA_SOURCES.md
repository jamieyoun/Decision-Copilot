
# DATA_SOURCES — Synthetic Meeting Notes (External Safe)

This project uses a set of **12 synthetic meeting notes** derived from real work patterns.

## What “synthetic” means here
- The files are written to mimic realistic meeting-note structure (Context / Discussion / Decisions / Action Items / Risks).
- All sensitive and confidential internal information has been removed.
- You (the author) have verified these notes are safe to use externally.

## What is included
- Generic project themes and decisions
- Non-identifying placeholders
- General product/engineering meeting patterns

## What is explicitly NOT included
- Company names (unless public / non-sensitive)
- Internal system names, endpoints, or architecture details
- Customer names, partner names, or personally identifying information
- Metrics, financials, volumes, or proprietary thresholds
- Any content covered by NDA or internal-only policies

## How to use the dataset in this repo
Place the 12 `.md` files under:

```txt
data/meetings/
```

The ingestion pipeline reads these files, extracts minimal metadata headers, and builds a local index.

## Disclosure (recommended for public repos)
Add a line like this to your README:

> “Meeting notes are synthetic artifacts derived from real work patterns; all sensitive/confidential details have been removed and the dataset is verified safe for external use.”
