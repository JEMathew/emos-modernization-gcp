# FOLLOWUP-CONTRACT-01 — Conversational Follow-Up Contract and Assessment Immutability

## Document control

| Field | Value |
|---|---|
| Slice ID | FOLLOWUP-CONTRACT-01 |
| Name | Differentiate Initial Assessments from Conversational Follow-Ups and Protect Metric Immutability |
| Program / feature | Modernization decision workspace and reasoning pipeline |
| Owner | Jincen E Mathew |
| Status | Validated for pull request |
| Target release | Beta v1.0 follow-through |
| Authorities | EMOS Security Constitution, AI Studio guidelines, Enterprise 6R Modernization taxonomy |

## Objective and business value

Establish a formal discriminated union contract for AI interactions that separates initial 6R modernization assessments from subsequent conversational follow-up turns. This guarantees that:
1. Multi-turn dialogue is concise, contextual, and grounded in untrusted-fenced conversation history.
2. Canonical assessment metrics (`recommended6R`, `confidenceScore`, `evidenceCompleteness`, `decisionReadiness`) are strictly immutable to conversational follow-up prose, and can only change via structured evidence updates followed by deterministic recalculation.
3. Server-selected response routing uses the validated history contract rather than a client-supplied mode or authorization flag; follow-up prose remains unable to mutate canonical state.
4. Follow-up errors (availability, guardrail, sync) are distinct and user-actionable.

## Scope

### Included

- Discriminated union response schemas: `assessment` (full 6R assessment attributes + trust indicators) vs `follow_up` (concise response prose + trust indicators without attributes).
- Server-selected follow-up detection based on validated non-empty conversation history, without treating a client mode flag as authorization.
- Bounded untrusted context format (preserving initial workload question/assessment plus recent dialogue turns, capped at 10 items) preventing context exhaustion.
- Input validation, prompt-injection rejection, and secret scrubbing on all turns.
- Guardrail failure closure (`AI_GUARDRAIL_REJECTED`) on malformed or empty model outputs.
- Canonical state immutability in `Dashboard.tsx`: follow-up responses write strictly to the interaction `turns` array, never mutating canonical 6R assessment fields.
- Multi-turn turn persistence and reload under authenticated Firestore owner (`/users/{userId}/interactions/{interactionId}`).
- Dedicated UI error states for reasoning availability, guardrail rejection, and persistence sync issues.
- Cloud Run and AI Studio preview runtime binding through platform-provided host/port values.
- A narrowly scoped `frame-ancestors` policy permitting only the application itself and `https://aistudio.google.com` to embed the product.
- Comprehensive contract and rendering unit tests covering the new contracts.

### Explicit exclusions

- No client-side override to force assessment mode or mutate canonical metrics.
- No direct browser Gemini API calls; all AI traffic remains through the authenticated Express server.
- No storage of API keys or secrets in source code or client state.
- No unsolicited external libraries or database engine migrations.
- No push, sync to GitHub, merge, or production deployment in this packet.

## Acceptance criteria

1. Server selects follow-up routing from non-empty validated history rather than trusting a client mode or authorization flag.
2. Concise follow-up questions do not invoke the initial 6R structured parser and return `{ type: 'follow_up', ... }` without assessment attributes.
3. Follow-up prose cannot modify `recommended6R`, `confidenceScore`, `evidenceCompleteness`, or `decisionReadiness`.
4. User questions and model responses persist to `/users/{userId}/interactions/{interactionId}` and reload correctly when reopened.
5. Bounded history retains initial context and up to 8 recent turns (sufficient context for second and subsequent follow-ups).
6. Initial assessments continue strict schema validation, 6R taxonomy enforcement, secret scrubbing, and deterministic score reconciliation.
7. Distinct error banners for AI reasoning unavailable, guardrail rejection, and Firestore sync failure, with **Retry Save** restricted to persistence errors.

## Validation plan

- Type checking: `npm run lint` (`tsc --noEmit`).
- Unit and contract tests: `npm run test:unit` covering API contracts, multi-turn history, secret redaction, guardrail rejection, and safe rendering.
- Production build: `npm run build`.
- Formatting / whitespace check: `git diff --check`.
- Production dependency advisory check: `npm audit --omit=dev`.
- Authenticated AI Studio preview: three conversational follow-ups, deterministic-state immutability, Firestore persistence, reload, and owner-isolation status.
