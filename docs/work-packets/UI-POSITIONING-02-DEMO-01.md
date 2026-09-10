# UI-POSITIONING-02-DEMO-01 — Demo and Product Tour Alignment

## Objective

Align the introduction video, Learning Center entry point, and in-product Product
Tour with the canonical full-lifecycle positioning while preserving the honest
Beta v1.0 capability boundary.

## Acceptance criteria

1. The Product Tour explicitly presents Align, Discover, Understand, Assess,
   Decide, Plan, and Mobilize in that order.
2. Assessment and decision are separate, accurate steps rather than one combined
   capability claim.
3. The tour remains progressively disclosed, responsive, keyboard accessible,
   and concise.
4. The introduction video opens with the canonical full-lifecycle scope and
   states that Beta v1.0 delivers the evidence, decision, and planning foundation.
5. The introduction is undated and makes no unsupported execution or outcome
   claim.
6. MP4, SRT, and WebVTT opening content remain synchronized.
7. Focused tests, the full unit suite, type checking, production build, and
   whitespace validation pass.

## Dependencies

- `UI-POSITIONING-02` canonical messaging and lifecycle groups.
- Existing public introduction video and verified Google Drive file mapping.
- Existing Product Tour modal and journey regression suite.

## Exclusions

- No change to assessment, scoring, 6R logic, authentication, persistence,
  imports, exports, secrets, or Cloud Run configuration.
- No re-recording of all 19 feature walkthroughs.
- No claim that Beta v1.0 executes migrations or measures realized outcomes.
- Preserve the unrelated untracked release-candidate QA report.

## Validation

- Focused Product Tour and video-contract tests.
- Full Vitest unit suite.
- TypeScript type check and production build.
- Media duration, stream, opening-frame, and subtitle inspection.
- Signed-out and authenticated production smoke after deployment.
- `git diff --check` and selective staging.

