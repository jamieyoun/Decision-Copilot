# Meeting: Constrained Alternatives (Bounded Negotiation) — Deep Dive
Date: 2026-03-05
Type: Planning

> _Fictional, synthetic example created for a personal AI PM portfolio. No real systems, customers, metrics, or employer information._

## Attendees
- [REDACTED_PM] (facilitator)
- [REDACTED_ENG_LEAD] (decisioning platform)
- [REDACTED_ML_ENG] (scoring + ranking)
- [REDACTED_DESIGN] (UX)
- [REDACTED_RISK] (policy)

## Objective
Turn the “constrained alternatives” concept into a **v0 spec**: one user-visible flow + one system fallback, with explicit constraints and auditability.

## Pre-read (fictional)
- One-page concept brief: “Constrained Alternatives”
- Draft vocabulary list (avoid AI jargon)

## Agenda
1. Pick *one* user story to ship first
2. Define constraint types allowed in v0
3. Decide logging/audit requirements
4. Confirm how we will evaluate whether it’s helping

## Context (what prompted this meeting)
In earlier jams, we agreed that “negotiation” should not feel like bartering or moving goalposts. Users need a predictable alternative path: **“Here’s what we need to proceed.”** The team needed to align on the first narrow slice that is safe enough to build and demo.

## Discussion notes (more detailed)
### 1) Candidate v0 user story
We debated two options:
- **Option A: “Ask for one additional confirmation step”** (user-visible)
- **Option B: “Fallback to a safer processing path”** (mostly invisible but observable)

Design advocated for Option A because it’s legible and trust-building: the user understands why the original path failed and what can be done. Risk was comfortable with A as long as the language is consistent and the request is bounded.

Engineering preferred B because it avoids extra steps for users. Risk flagged that invisible fallbacks can feel deceptive if outcomes change without a visible reason.

We agreed to ship both, but **A is the primary product surface** and **B is a safety net**.

### 2) Constraint types allowed in v0
We explicitly ruled out any constraint that changes “core terms” or silently alters the outcome. Allowed constraint types for v0:
- **Additional signal request**: one extra confirmation factor OR one additional user-provided attribute
- **Time-bound retry**: “try again after a short cool-down” (no looping)
- **Safer path routing**: switch to a conservative flow that has a higher friction cost

We disallowed:
- changing limits automatically
- offering multiple alternative options simultaneously
- repeated cycles of “ask for more”

### 3) Registry + governance
We aligned on a minimal **Constraint Registry** with:
- `constraint_id`, `description`, `eligibility_notes`, `requires_user_confirmation`, `review_owner`, `expires_on`
- versioning so we can reproduce historical decisions in demos

Risk requested an explicit “expiration” field so constraints don’t live forever.

### 4) Copy + explainability
We wrote draft copy principles:
- Explain the request in user language (“We need X to proceed”)
- Never reference internal scoring
- Provide a “Why am I seeing this?” drawer that lists the generic category (missing signal, mismatch, safety check)

### 5) Evaluation plan
We aligned on early success indicators that do not depend on sensitive KPIs:
- users complete the alternate step without confusion
- reduction in “give up” behavior for borderline cases (proxy via abandonment)
- user-reported clarity (“I understood why”)

## Decisions
- v0 will ship **one** user-visible constrained alternative: “additional confirmation step” with explicit user consent.
- v0 will include **one** system fallback path, but it must be observable and logged (and never changes terms silently).
- Allowed constraint types for v0 are limited to: additional signal request, time-bound retry, safer path routing.
- A minimal Constraint Registry is required in v0 with versioning and expirations.
- We will cap the experience at **one** alternative attempt; if it fails, we stop and show a clear outcome.

## Open Decisions
- [OPEN] Who is the long-term **DRI for the Constraint Registry** (PM vs Risk) and how do we hand off ownership after the pilot?
- [OPEN] Should we allow **per-tenant overrides** for certain constraint types in v1, or keep everything global until we see usage patterns?
- [OPEN] Do we commit to a **user-visible “Why am I seeing this?” drawer for all constrained flows** in v0, or treat it as an experiment?
- [OPEN] TBD: Whether expiration dates on constraints should be hard (auto-disable) or soft (review reminder).
- [OPEN] Open question: Do we need a separate "constraint declined" user-facing message, or is a generic outcome enough for v0?
- [OPEN] Needs decision: Who approves new constraint types before they can be added to the registry — Risk only or PM + Risk?
- [OPEN] To be decided: Should the one alternative attempt be resettable per session or per 24h to avoid gaming?
- [OPEN] TBD: Audit log retention for constraint invocations — 90 days or configurable per tenant?

## Action Items
- [REDACTED_PM]: Write a v0 spec covering scope + non-goals + UX copy rules (Due: 2026-03-08)
- [REDACTED_DESIGN]: Produce a clickable prototype of the alternative-step flow + rationale drawer (Due: 2026-03-09)
- [REDACTED_ENG_LEAD]: Implement a JSON-based Constraint Registry + versioning approach (Due: 2026-03-10)
- [REDACTED_ML_ENG]: Define suppression reasons + when to propose alternative vs decline (Due: 2026-03-10)
- [REDACTED_RISK]: Create a checklist for approving new constraint entries (Due: 2026-03-11)

## Risks
- **Trust risk:** If alternative requests feel arbitrary, users will assume manipulation.
- **Policy drift:** Registry entries could accrete without review and become unsafe.
- **UX complexity:** A rationale drawer can overwhelm users if too verbose.
- **Edge-case loops:** Without strict caps, retries could become a frustrating loop.

## Key insights (optional)
- The safest “AI” product often feels like a policy UI with good copy.
- Governance artifacts (registry, expirations, owners) are core product scaffolding.
- “One attempt” is a powerful simplifying constraint for v0.
