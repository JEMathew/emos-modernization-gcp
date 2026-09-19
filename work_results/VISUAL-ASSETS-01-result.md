# VISUAL-ASSETS-01 — EMOS concept visual integration

## Changes

- Copied the four approved original files into `public/assets/emos/` unchanged.
- Added `src/components/EmosVisuals.tsx`: hero image fallback, muted looping
  inline video with playback controls, reduced-motion support and error fallback;
  lazy-loaded Command Center and Enterprise DNA concept previews.
- Updated only visual presentation in `src/components/LandingPage.tsx`.
- Retained routes, navigation, existing scenario, CTA behavior and product logic.
- Added explicit product-concept and synthetic-data captions.
- Recorded scope in `docs/work-packets/VISUAL-ASSETS-01.md`.

## Local validation — 19 September 2026

- `npm run lint`: passed.
- `npm run test:unit`: 108 passed; 17 API tests could not run because the local
  execution sandbox forbids opening the HTTP listener (`listen EPERM`).
- `npm run build`: passed; existing large-chunk advisory remains.
- `git diff --check`: passed.
- Confirmed all four originals are present in the production build output.
- Three images inspected at 1376 × 768; originals retain their concept microcopy.

## Release gates

GitHub's full Guardrail release gate, including API and Firestore emulator tests,
must pass before promotion. Browser layout and asset playback checks must be
performed against the candidate revision before production traffic is promoted.

## Deployment target and rollback

Repository: `JEMathew/emos-modernization-gcp`.
Cloud Run: `codev-0326 / asia-southeast1 / gemini-reflection-journal`.
Public URL: https://emos-modernization.ai.studio.
Previous serving revision verified: `gemini-reflection-journal-00032-fpr`.
Preserve runtime service account, secrets and existing access policy.

## Demo steps

1. Open the home page; inspect the hero image/video and synthetic-data caption.
2. Pause the animation using the native controls.
3. Enable reduced motion; confirm the static image is used.
4. Open the existing scenario through the EMOS menu; inspect both platform
   previews and their full-size links.
5. Confirm the public sandbox and Learning Center remain available.

Production promotion and final CI evidence are recorded by the release task;
this pre-release report does not claim that either has completed.
