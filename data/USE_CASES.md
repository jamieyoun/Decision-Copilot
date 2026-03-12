# USE_CASES

## 1) Retrieval / RAG demo
- Index `notes/`.
- Retrieve top matching notes.
- Answer questions with citations (filenames).

## 2) Structured extraction
Because each note contains:
- `## Decisions`
- `## Action Items`
- `## Risks`
You can extract those sections and build dashboards or summaries.

## 3) Evaluation harness
Create a gold set of queries and expected sources, then test citation correctness and faithfulness.
