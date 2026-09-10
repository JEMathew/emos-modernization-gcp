# UI-POSITIONING-02-HOTFIX-01 — Remove Landing Scroll Indicator

## Objective

Remove the decorative scroll-progress line pinned above the public landing-page
header because it appears as an unintended visual artifact on wide displays.

## Acceptance criteria

1. No progress line renders along the top edge of the landing page.
2. The sticky header, menu navigation, hash-selected views and responsive layout
   remain unchanged.
3. No authentication, assessment, persistence, secret or deployment behavior
   changes.
4. Focused landing-page tests, type checking and the production build pass.

## Dependencies

- `UI-POSITIONING-02` is deployed.
- The reported production screenshot is the visual defect baseline.

## Exclusions

- No landing copy, typography, navigation or spacing changes.
- No Cloud Run, Secret Manager, Firebase or API changes.
- No new dependency or architecture decision.

## Validation

- Add a regression assertion that the fixed top-edge progress element is absent.
- Run the focused public-route test suite, TypeScript checking and production build.
- Run `git diff --check` and inspect the final diff.

## Completion report

Record files changed, commands and results in
`work_results/UI-POSITIONING-02-HOTFIX-01-result.md`.
