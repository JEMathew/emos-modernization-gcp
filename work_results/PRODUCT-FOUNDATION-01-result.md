# Packet 1 — Product foundation

Date: 20 September 2026. Local implementation only; not pushed or deployed.

## Customer outcome

After sign-in, the Command Center connects portfolio evidence to the next modernization action. A shared shell carries portfolio/workload context through Overview, Portfolio, Enterprise DNA, Assess, Decide, Align, Wave Plan, Mobilize and History. Direct links, refresh and browser back are supported for saved records. All 15 lifecycle stages, Mobilize and their sub-stages are discoverable without implying unfinished controls work.

Delivery labels are Available / Building next / Planned. Available stages can still contain explicitly marked unfinished sub-stages, including TCO analysis, approval, capacity and delivery-baseline controls. The scope is a navigation foundation, not completion of the MVP through Target State.

## Changed files

- `src/lib/workspaceNavigation.ts`: canonical URLs, context, browser history and missing-route handling.
- `src/components/CommandCenter.tsx`: selected-portfolio counts, evidence gaps, next action and workflow entry points.
- `src/components/Dashboard.tsx`, `Navbar.tsx`, `ModernizationLifecycle.tsx`, `JourneyStage.tsx`: shared shell, breadcrumbs, lifecycle and stage guidance, failure/loading states and responsive navigation.
- `src/components/PortfolioPlanView.tsx`, `ReflectionWorkspace.tsx`, `SamplePortfolioView.tsx`: controlled context, correct stage selection and workload assessment prefill.
- `src/components/ThemeSelector.tsx`, `src/index.css`: keyboard appearance selection, focus treatment and readable shared colors.
- `src/App.tsx`: remount private app state when authenticated account changes.
- `src/config/productFacts.ts`: explicit unfinished sub-stage markers; no invented new availability.
- `tests/dashboard.navigation.test.tsx`, `tests/app.workspace-auth.test.tsx`: new regression coverage. Journey, lifecycle and safe-rendering test labels updated to the implemented navigation; security assertions retained.
- `tests/fixtures/dashboardPreview.tsx`, `tests/fixtures/dashboardBackend.ts`, `scripts/qa/product-foundation.mjs`: isolated synthetic browser review, with database writes and model calls disabled.
- `docs/product/IMPLEMENTATION_STATE.md`, `HACKATHON_RELEASE_SCORECARD.md`, `EMOS_UX_CONSTITUTION.md`, `HIGGSFIELD_BATCH_1.md`: packet boundary, evidence, handoff and visual-generation timing.

## Verification

| Check | Result | Boundary |
|---|---|---|
| `npm run lint` | PASS | TypeScript check |
| `npm run test:unit` | PASS — 15 files, 142 tests | Includes API contracts, authentication, guardrails, safe rendering, readiness, waves, routes and UI; provider/database mocks are not live-service proof |
| Focused final navigation/auth/lifecycle rerun | PASS — 3 files, 17 tests | After final delivery-label changes |
| `npm run build` | PASS | Main JS 1,630.88 kB minified / 423.82 kB gzip; large-chunk warning remains |
| `npm run test:firestore` | BLOCKED | Java runtime missing; emulator could not start, so owner-isolation tests were not executed |
| `git diff --check` | PASS | Whitespace and conflict-marker check |
| Security-boundary diff | No changes | Server, Firestore rules, Firebase/model service modules and CI unchanged |

The new tests cover deep links, reload reconstruction, back navigation, imported-portfolio context, missing/mismatched records, loading, subscription failure, empty inventory, URL encoding, account-state reset and keyboard/persisted appearance selection. Error-path tests intentionally log permission-denied messages; those are expected fixtures, not test failures.

### Browser review

Reviewed through the in-app browser against the isolated local fixture, not the production service. Screenshots were inspected in the task; no durable screenshot files are claimed.

| Surface | Observed result |
|---|---|
| Desktop, 1440 px, light and dark | Command Center layout and navigation readable; no horizontal overflow |
| Tablet, 768 px, dark | Two-column summary and compact navigation; document width 762 px within 768 px viewport |
| Mobile, 390 px | Overview, DNA, Plan, Mobilize and new assessment fit; DNA refresh and browser back retain saved context |
| Narrow mobile, 320 px | Fixed wrapped navigation labels; overview, DNA, Plan, Mobilize and assessment fit within viewport |
| Lifecycle | All stages/sub-stages visible when expanded; selecting an available stage collapses the panel |
| Appearance | Light, Dark and System selectable; choice persisted after reload; keyboard menu covered by tests |

The optional headless browser runner could not launch Chromium under this machine's process policy. The browser observations above were performed with the existing in-app browser instead. Do not report the optional runner's entire matrix or simulated OS-theme-change check as executed. Full accessibility conformance, screen-reader review, zoom/reflow and device-specific testing remain release work.

To repeat interactive review, run `QA_SERVE_ONLY=1 node scripts/qa/product-foundation.mjs` and use the printed loopback URL. To run the optional automated matrix on a machine permitting browser launch, set `QA_OUTPUT_DIR` to an evidence folder and run the same script with an installed Playwright module/browser. `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_CHROMIUM_PATH` can point to existing installations. No production credentials are required. The fixture is separate from the shipped entry point.

## Regressions and remaining gaps

- Fixed during review: 320 px navigation text wrapping, outdated Align/Plan/Mobilize labels, unhandled subscription failures appearing like empty data, and navigation fallbacks that could show unrelated records.
- No remaining failures in the executed tests. This is not evidence of zero production regressions.
- Saved URL context is preserved; unsaved drafts are not persisted across navigation or reload.
- Existing marketing language and demo media are intentionally unchanged. The proposed Northstar narrative differs from the existing sample dataset; packets 3/8 must reconcile it.
- Existing importer limits remain 5 MB / 200 workloads. No 5,000-asset or live-connector claim is made.
- Java/Firestore testing, real sign-in/AI/persistence smoke, Studio authorship/screenshots, candidate deployment evidence, complete accessibility review and demo updates remain outstanding.

## Hackathon, security and media

The [scorecard](../docs/product/HACKATHON_RELEASE_SCORECARD.md) records **4 PASS, 8 PARTIAL, 0 FAIL** against the requested 12-item checklist, with evidence and regression risk per row. These are bounded engineering results, not official judging weights or a production-compliance certificate. Original-feature behavior is tested, but the criterion remains PARTIAL until AI Studio authorship evidence is complete.

No authentication, ownership-rule, server-side model or secret boundary was weakened. New account-state reset is covered locally. Firestore isolation still requires the Java emulator/CI gate; no zero-leakage guarantee is inferred from mocked browser data.

Higgsfield is not required for this functional packet. No media generated, modified or integrated; all four approved assets remain unchanged. Explicit Higgsfield work belongs in packets 8/9 after structure/copy/workflows are settled. No visual-asset registry update is required for unchanged media.

## Commit and rollback

- Parent / rollback baseline: `3e6e23072d9d8c6e78f74f5896e44c12027f0c1d`.
- Packet commit reference: `emos-packet-1-foundation-20260920` (local checkpoint tag; resolve using `git rev-parse emos-packet-1-foundation-20260920`).
- Commit subject: `feat: establish coherent EMOS MVP product foundation`.
- Restore the previous code through a reviewed revert of this packet commit, preserving unrelated work. Do not hard-reset the checkout.
- No GCP deployment or traffic change occurred. A future release must record and verify its previous healthy Cloud Run revision and configuration/data compatibility before deployment; this local checkpoint is not a tested production rollback.

## Exact next packet

**Packet 2 — Safe intake and discovery.** Add supported CSV/JSON schema mapping and preview, actionable validation/recovery, explicit limits, untrusted-data boundaries, and a reliable path into the imported portfolio. Evaluate practical tabular/XLSX support deliberately; do not accept arbitrary file types or begin connector work. Continue from the [implementation handoff](../docs/product/IMPLEMENTATION_STATE.md), implement only that packet, update the evidence and make one local commit. No push or deployment without authorization.
