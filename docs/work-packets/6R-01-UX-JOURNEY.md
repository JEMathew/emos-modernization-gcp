# 6R-01 — Standardized Decision Journey UX Follow-Through

## Document control

| Field | Value |
|---|---|
| Slice ID | 6R-01 |
| Name | Standardize the portfolio-to-mobilization decision journey |
| Program / Feature | PGM-INTELLIGENCE / Phase A |
| Owner | Jincen E Mathew |
| Status | Implemented and committed locally; remote push pending release authentication |
| Target release | Unassigned beta follow-through; no release inclusion claimed |
| Authorities | Product Constitution; official 6R-01 registry entry; user UX review dated 2026-09-10 |

## Objective and business value

Make the current stage, primary action, and next step understandable across the
authenticated journey without requiring users to interpret competing navigation
labels, duplicate controls, or overlapping prompt modes.

## Scope

### Included

- Establish one presentation journey: **Discover → Understand → Decide → Plan → Mobilize**.
- Use one reusable, compact current-stage marker instead of duplicating the full journey on product pages.
- Use identical desktop and mobile navigation names and ordering.
- Rename saved **Assessments** navigation to **History** and preserve its count.
- Remove the workspace-local History button after History becomes a global destination.
- Rename the decision workspace navigation to **Decisions**; retain 6R context inside the workspace.
- Keep **New Assessment** visually primary but match the height and typography of other header actions.
- Remove the Portfolio-page Plan shortcut that permits users to skip evidence understanding and decision work; retain Plan in global navigation.
- Remove the duplicate contextual Portfolio action from an active assessment.
- Replace the initial Assess / Options / Decision mode selector with one governed 6R assessment path.
- Offer comparison and executive-summary prompts as contextual follow-ups after an assessment exists.
- Collapse raw workload evidence by default while keeping it accessible, copyable, and expanded on request.
- Open existing assessments at their decision summary rather than automatically jumping to the final dialogue turn.
- Align Product Tour language and evaluator scenarios with the resulting UI.
- Align the Export Executive Pack action with the standard authenticated header-action scale while preserving its primary emphasis and export behavior.

### Explicit exclusions

- No change to deterministic evidence completeness, readiness, prioritization, or 6R rules.
- No change to Gemini schemas, server prompts, saved historical modes, Firestore data, authentication, or authorization.
- No deletion or migration of stored assessments.
- No new route, dependency, landing-page redesign, infrastructure change, or release assignment.

## Dependencies and readiness

- Predecessor slice: 6R-01 implemented and validated in the current product checkout.
- Required contracts: existing assessment creation, follow-up, history, Enterprise DNA, and planning callbacks.
- Existing behavior baseline: 115/115 unit/API/security/UI tests pass before this follow-through.
- Data/configuration prerequisites: none; all QA uses existing synthetic data.

## Expected change set

| File or boundary | Reason |
|---|---|
| `src/components/JourneyStage.tsx` | Reusable current-stage presentation contract |
| Portfolio, DNA, workspace, planning components | Apply consistent stage language and contextual actions |
| `src/components/Navbar.tsx` | Align navigation naming, ordering, and action sizing |
| `src/components/TestWalkthroughModal.tsx` | Align guided tour and evaluator scenarios |
| Focused React tests | Protect navigation, stages, disclosure, and action behavior |

Scoring, server, persistence, Firebase, and Firestore rule files must not change.
Preserve all existing UI-CLARITY-01 working-tree changes.

## Acceptance criteria

1. Product pages show one compact current-stage marker using the canonical five-stage vocabulary.
2. Desktop and mobile navigation use the same order and labels: Portfolio, Decisions, Plan, History.
3. History retains the saved assessment count and opens existing records as before.
4. New Assessment remains identifiable but matches other header actions in height and type scale.
5. Discover does not offer a shortcut that bypasses Understand and Decide; Plan remains available globally.
6. Active assessments contain no duplicate Portfolio action.
7. A new assessment has one governed submission path and no ambiguous mode selector.
8. Active assessments expose working Compare Options and Executive Summary follow-up shortcuts.
9. Raw workload evidence is collapsed by default and can be expanded and copied.
10. Opening saved history lands at the decision summary; new follow-up activity still scrolls to the dialogue end.
11. Product Tour and evaluator instructions describe controls that exist.
12. Existing 6R, persistence, security, import, planning, and responsive happy paths remain working.
13. Export Executive Pack uses the same compact height and typography as other authenticated header actions without changing the generated artifact.

## Validation plan

- Focused React tests for standardized navigation, stage markers, evidence disclosure, and follow-up shortcuts.
- Full unit/API/security/UI suite.
- TypeScript checking and production build.
- Browser QA at desktop and 741-pixel narrow viewport.
- `git diff --check` and a scope diff confirming no server, scoring, or persistence changes.

## Risks and rollback

| Risk | Mitigation | Rollback signal/action |
|---|---|---|
| Simplification hides an existing mode | Preserve historical mode rendering and backend contracts; change only new-entry presentation | Restore the selector if focused creation contracts fail |
| Collapsed evidence harms traceability | Keep an explicit disclosure button and copy action | Default the section open if evidence becomes undiscoverable |
| Navigation rename causes test or responsive drift | Use identical labels/order in both render branches and verify both viewports | Revert Navbar-only presentation changes |

## Definition of Done

- [x] Scope and exclusions satisfied.
- [x] Focused and full regression gates pass.
- [x] Desktop and narrow browser QA pass.
- [x] Completion report exists in `work_results/`.
- [x] No release or compliance claim exceeds available evidence.

## Completion report

Create `work_results/6R-01-UX-JOURNEY-result.md` with the exact change set,
commands, results, acceptance evidence, known issues, rollback, and demo steps.
