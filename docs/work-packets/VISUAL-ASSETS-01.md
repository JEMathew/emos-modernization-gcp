# VISUAL-ASSETS-01 — Approved EMOS concept visuals

## Objective and authorization

Publish the four supplied EMOS visuals to the existing production application at
https://emos-modernization.ai.studio. The user authorized implementation, Git
publication and GCP deployment on 19 September 2026.

## Acceptance criteria

- Store the original three PNGs and one MP4 in `public/assets/emos/`.
- Use the hero image as a static fallback and the animation as muted, looping,
  inline hero media with playback controls and respect for reduced motion.
- Show Command Center and Enterprise DNA in the existing scenario section.
- Label the images as product concepts using synthetic enterprise data.
- Preserve existing navigation, routes, CTA behavior and application logic.
- Validate types, unit/API/UI tests, production build, asset delivery and layout.
- Pass the GitHub release gate before deploying the reviewed commit.

## Dependencies and exclusions

Base: production `main` commit `3e4007eda9d183dcdb95ca60fe0c4e0680fb0fc7`.
Uses the existing React, Vite and Cloud Run deployment. No new dependencies,
generated images, backend changes, IAM changes or site IA changes.

## Release and rollback

Target repository: `JEMathew/emos-modernization-gcp`.
Target Cloud Run service: `gemini-reflection-journal`, project `codev-0326`,
region `asia-southeast1`. Verify the live service before deployment, retain the
previous revision, and restore its traffic if the new revision fails smoke tests.
Record verification results and any blockers in `work_results/`.
