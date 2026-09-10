# UI-POSITIONING-02-DEMO-01 — Completion Report

## Objective

Align the introduction video, Learning Center entry point, and in-product Product
Tour with the canonical full-lifecycle EMOS positioning and the honest Beta v1.0
capability boundary.

## Files changed

- `docs/DEMO_FLOW.md`
- `docs/LEARN.md`
- `docs/demo/EMOS-Beta-Introduction.mp4`
- `docs/demo/EMOS-Beta-Introduction.srt`
- `docs/demo/EMOS-Beta-Introduction.vtt`
- `docs/demo/README.md`
- `docs/work-packets/UI-POSITIONING-02-DEMO-01.md`
- `scripts/media/intro-headline.txt`
- `scripts/media/intro-subhead.txt`
- `scripts/media/refresh-intro-opening.sh`
- `src/components/TestWalkthroughModal.tsx`
- `src/data/learningVideos.ts`
- `tests/documentation.contract.test.ts`
- `tests/journey.ux.test.tsx`
- `tests/public.routes.test.tsx`
- `work_results/UI-POSITIONING-02-DEMO-01-result.md`

The unrelated untracked
`work_results/RELEASE-CANDIDATE-FUNCTIONAL-QA-2026-09-10.md` was preserved and
excluded.

## Commands run

- Focused Vitest run for Product Tour, public routes, and video playback.
- Full `npm run test:unit` run with local ephemeral-port access.
- `npm run lint`.
- `npm run build`.
- Local production server on `http://127.0.0.1:3011`.
- Browser accessibility-tree and visual Product Tour inspection.
- Local speech synthesis and FFmpeg media composition.
- `avmediainfo` stream and duration inspection.
- Embedded-subtitle extraction and opening-frame inspection.
- `git diff --check`.

## Tests and results

- Focused journey, public-route, and video tests: **30/30 passed**.
- Full unit and HTTP contract suite: **125/125 passed** across 12 files.
- TypeScript type check: **passed**.
- Production build: **passed**.
- Whitespace validation: **passed**.
- Browser Product Tour inspection: **passed**; seven explicit stages render in
  order with one progressively disclosed detail panel.
- Media inspection: **passed**; 1280×840 H.264 video, mono AAC audio, English
  timed-text track, 256.75-second duration, and corrected opening frames.

The first sandboxed full-suite attempt could not open Supertest's ephemeral
loopback port (`EPERM`). The same suite passed completely when rerun with local
loopback access; this was an execution-environment restriction, not a product
failure.

## Acceptance criteria met

1. Product Tour now presents Align, Discover, Understand, Assess, Decide, Plan,
   and Mobilize in the same order used by the landing capability horizon.
2. Assess and Decide are distinct steps with accurate actions and no duplicated
   capability claim.
3. The tour remains concise, responsive, keyboard accessible, and progressively
   disclosed.
4. The introduction opens with “One operating system for the entire
   modernization journey.”
5. The opening narration and captions state that Beta v1.0 delivers the evidence,
   decision, and planning foundation today.
6. The dated introduction and old decision-intelligence-only opening were removed.
7. The validated remainder of the 4:17 introduction remains intact in content.
8. Learning Center copy and documentation use the same scope and beta boundary.
9. No assessment, scoring, 6R, authentication, persistence, import, export,
   secret, or Cloud Run logic changed.

## Known issues

- The existing production Google Drive file must receive this MP4 as a new
  version to preserve its public file ID and update both the landing page and
  Learning Center player.
- Supporting clips should be replaced only if a visible action or label conflicts
  with the deployed product; older surrounding chrome alone does not invalidate
  an otherwise accurate task demonstration.
- The existing Vite large-chunk advisory remains unchanged.

## Demo steps

1. Open the landing page and play **EMOS Beta Introduction**; confirm the new
   full-lifecycle title card, undated narration, and beta boundary.
2. Open Learning Center lesson 00 and confirm it resolves to the same updated
   Drive file.
3. Open Product Tour and confirm all seven beta stages appear in order.
4. Select Assess and Decide separately and verify the detail panel changes.
5. Open Evaluation Evidence and verify evaluator-only material remains outside
   the normal end-user flow.

