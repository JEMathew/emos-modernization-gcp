# UI-CLARITY-01 — Product Language and Navigation Clarity

## Document control

| Field | Value |
|---|---|
| Slice ID | UI-CLARITY-01 |
| Name | Clarify product language and preserve primary navigation actions |
| Program / feature | Buyer and end-user evaluation experience |
| Owner | Jincen E Mathew |
| Status | Implemented, uncommitted |
| Target release | Beta v1.0 follow-through |
| Authorities | EMOS product rules, current public-beta boundaries, user UX review dated 2026-09-10 |

## Objective and business value

Remove ambiguous or evaluator-oriented language from the primary end-user path,
make the Product Tour visibly actionable, and keep account sign-out available at
constrained desktop widths without changing assessment data or decision logic.

## Scope

### Included

- Remove the duplicated Enterprise Modernization badge from authenticated navigation.
- Remove the ambiguous 6R descriptor from the brand area; retain the actionable 6R navigation label.
- Present legacy saved-assessment categories with current user-facing labels without migrating stored records.
- Identify test coverage and Firestore access-control material as evaluator evidence.
- Remove the decorative landing-page vertical progress rail.
- Give the landing-page Product Tour control a visible secondary-button treatment.
- Reduce authenticated-header pressure so sign-out remains visible.
- Keep one global New Assessment action by removing its duplicate from assessment history.
- Remove the creation timestamp from the decision header while retaining dates in assessment history.
- Add focused regression coverage and a completion report.

### Explicit exclusions

- No Firestore data migration or stored category mutation.
- No change to canonical 6R scoring, evidence completeness, readiness, or recommendations.
- No removal of evaluator evidence required for the current hackathon review.
- No authentication, authorization, persistence, deployment, or infrastructure change.
- No redesign of the landing page, product tour, or authenticated navigation.

## Dependencies

- Existing React, TypeScript, Tailwind CSS, Firebase authentication, and Vitest setup.
- Existing `LandingPage`, `Navbar`, `HistorySidebar`, and `TestWalkthroughModal` components.

## Acceptance criteria

1. The authenticated brand area does not repeat “Enterprise Modernization.”
2. The authenticated brand area contains no 6R methodology badge; the decision workspace remains available in navigation.
3. Legacy `Legacy Application` and `Problem Solving` records display as `Application` and `Architecture Review`, while filtering still works.
4. Evaluator-only test and access-control content says who it is for and is not presented as end-user tour content.
5. The landing-page vertical rail is absent; horizontal page progress remains unchanged.
6. Product Tour has a visible border/surface treatment and still opens the tour.
7. Sign-out remains a non-shrinking header action, while optional account and learning labels disclose only at wider breakpoints.
8. New Assessment appears once as the persistent global header action, including responsive layouts.
9. The decision header does not display creation date/time; assessment history retains its date for traceability.
10. Type checking, focused tests, the full unit suite, production build, and whitespace validation pass.

## Validation

- Focused Vitest tests for landing, authenticated navigation, history category presentation, and evaluator evidence.
- `npm run lint`
- `npm run test:unit`
- `npm run build`
- `git diff --check`

## Completion report

Create `work_results/UI-CLARITY-01-result.md` with files changed, commands and
tests run, results, acceptance criteria, known issues, and demo steps.
