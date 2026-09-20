# EMOS integrated MVP implementation state

Updated: 21 September 2026. This file records the production MVP; it does not imply an official hackathon judging score.

## Release identity

- Repository: `JEMathew/emos-modernization-gcp`
- Branch: `codex/emos-visual-assets`
- Visual-alignment baseline: `47d9809058b782f3d578a52426df507d6ccaa696`, immutable tag `emos-packet-2-5-visual-alignment-20260920`.
- Integrated candidate tag: `emos-integrated-mvp-20260920`. Production media tag: `emos-production-media-v2-20260921`. Do not move either tag. Beta v2 landing-performance tag: `emos-beta-v2-media-performance-20260921` at `605d75646de194a40a0c7fb5127b7d3ea27aea01`; narrated-demo tag: `emos-beta-v2-narrated-demo-20260921` at `579b0ae25893d90be69dae6b3ffccc3021088756`. Do not move these tags.
- Deployed narrated-demo source: `579b0ae25893d90be69dae6b3ffccc3021088756`; CI run `35540767630`; Cloud Run revision `gemini-reflection-journal-00057-doz` at 100% traffic. The inherited service `commit-sha` label still names the earlier media-performance commit; the served versioned MP4 hash is the source-content verification for this media-only deployment.
- Production target: `gemini-reflection-journal`, project `codev-0326`, region `asia-southeast1`, custom domain `https://emos-modernization.ai.studio`.
- Code rollback: revert the integrated commit or redeploy the immutable visual-alignment baseline after reviewing data/rules compatibility. Never hard-reset a working tree containing user changes.
- Cloud rollback: `gemini-reflection-journal-media-perf-605d756` was recorded at 100% traffic before the narrated-demo release and remains the immediate traffic-restore target. `gemini-reflection-journal-media-ed9afe2` and `gemini-reflection-journal-cache-b7915d4` remain retained earlier rollback baselines.

## Customer outcome

EMOS now presents one connected, capability-honest modernization journey from Align through Define Target State. A user can sign in, bring a bounded CSV/JSON portfolio, inspect Enterprise DNA and evidence quality, run a governed assessment, compare the canonical 6R options, make a named human decision, prioritize the portfolio, plan waves, mobilize owners and define a target-state delivery baseline. Execute through Reassess remain visible and explicitly Planned.

## Available MVP capabilities

| Stage | Implemented experience |
|---|---|
| Align | Program outcomes, named sponsor/owners, risk posture, horizon, platform intent and success measures |
| Discover | Synthetic/imported portfolio separation; safe CSV/JSON Source → Map → Preview → Result flow; 5 MiB, 200-workload and 40-column bounds; invalid-row consent; atomic owner-scoped persistence and exact-payload retry |
| Understand | Enterprise DNA across business, technology, data/risk, ownership, dependencies, economics and evidence quality |
| Assess | Deterministic readiness, complexity, risk, feasibility, cost/TCO/value baseline and explicit critical gaps |
| Decide | Evidence-bounded multi-turn reasoning and canonical 6R comparison; the model explains but does not approve |
| Govern | Architecture, security, compliance and evidence gates; named approve/reject/more-evidence decision; exceptions and bounded audit history |
| Prioritize | Transparent value/effort/risk/dependency/alignment formula with human funding boundary |
| Plan | Roadmaps, waves, capacity, milestones and cost-benefit baseline |
| Mobilize | Owners, readiness gaps, charter and delivery-baseline handoff |
| Define Target State | Architecture/platform patterns, NFRs, security, data migration, cutover, rollback and named owner |

Known incomplete sub-stages remain labelled `Building next`: policies/constraints, ownership capture, initial dependency mapping and capacity/resources. Execute, Validate, Transition, Measure Benefits, Learn and Reassess are `Planned` and inert.

## Stable application URLs

| Experience | URL |
|---|---|
| Command Center | `/app` |
| Portfolio / intake | `/app/portfolio` |
| Enterprise DNA | `/app/workloads/:id/dna` |
| Evidence workbench | `/app/workloads/:id/evidence` |
| Assessment | `/app/workloads/:id/assessment` |
| Decision | `/app/workloads/:id/decision?assessment=:assessmentId` |
| Governance | `/app/govern?workload=:id` |
| Prioritization | `/app/prioritize?workload=:id` |
| Align / Plan / Mobilize | `/app/plan?stage=align`, `/app/plan`, `/app/plan?stage=mobilize` |
| Target state | `/app/workloads/:id/target-state` |
| History | `/app/history` |

`portfolio=imported`, `workload` and `assessment` preserve relevant UI context; they are not authorization. Firestore owner paths and verified Firebase identity remain the authorization boundary.

## Server-side agent architecture

`server/orchestration.ts` provides a compact typed orchestration registry. These are bounded specialist modules, not independently deployed autonomous agents.

| Module | Inputs and outputs | Boundary |
|---|---|---|
| EMOS Orchestrator | Stage, authorized evidence and user question → one specialist instruction | Routes only; no enterprise fact or approval generation |
| Intake & Discovery specialist | Bounded source/mapping metadata → normalized portfolio facts | File limits, validation and persistence stay deterministic |
| Evidence & DNA specialist | Authorized workload evidence → gaps, provenance and remediation explanation | Missing evidence remains missing |
| Assessment & Economics specialist | Deterministic metrics plus evidence → explainable comparison | Readiness, TCO and scoring arithmetic stay deterministic |
| Governance & Decision specialist | Gates, recommendation and human context → review explanation | Cannot approve, reject or waive controls |
| Planning & Target-State specialist | Approved context, waves and baseline → planning explanation | Cannot provision, execute migration or approve baseline |

## Security and data boundaries

- Firebase Authentication gates the private workspace; account changes remount/reset private state.
- Gemini access remains server-side. The browser never receives the private model key; Cloud Run binds it from Google Cloud Secret Manager.
- Firestore data lives below `/users/{uid}`. Rules allow only the authenticated owner and validate bounded shapes for imported workloads, alignment, governance and target state.
- Imported text and model output render as inert text. Prompt-injection screening, secret redaction, request/output schemas and authorized-evidence selection remain in place.
- Governance audit JSON is validated, capped at 20 events and 12,000 characters, and malformed/forged actions are discarded when read.
- Approval buttons are human-operated and evidence-gated in the client. This is an MVP workflow control, not enterprise RBAC or a server-authoritative approval engine.

## Verification snapshot

- PASS — Type/static checks and production build for media commit `ed9afe2`.
- PASS — Unit/API/component/navigation/security and Java 21 Firestore emulator suites in CI run `35530543112`.
- PASS — Production build. The existing main-chunk warning remains (about 1.68 MB minified / 438 KB gzip).
- PASS — Local synthetic browser review for desktop, 390 px and 320 px; new deep routes, light/dark/system behavior and no page-level horizontal overflow reviewed.
- PASS — Firestore Emulator Suite ran in CI with Java 21; active production ruleset is `84847c06-eb45-422d-87b9-2d8545fa3623`.
- PASS — Authenticated production assessment/follow-up/history and governance/Target State persistence smoke; optional second-account live isolation remains additional evidence.
- PASS — Four approved v1 media hashes remain unchanged; two versioned real-production v2 assets were added and verified.
- PASS — Beta v2 landing-media performance: poster-first WebP (70,132 bytes), deferred silent 1080p loop (1,985,917 bytes), reduced-motion/Data Saver/2G/mobile static fallbacks, viewport pausing and keyboard Play/Pause passed focused tests, CI and production candidate/live checks.
- PASS — Beta v2 narrated walkthrough: the separate Learning Center MP4 is 4,024,724 bytes, 1920×1080 / 79.417 seconds, Cillian-narrated and has burned English Montserrat/black-outline captions. CI `35540767630`, zero-traffic candidate and live custom-domain media/header checks passed.
- BLOCKED LOCALLY / PASS IN CI — the local Firestore emulator cannot start without Java; CI `35534159098` installed Java 21 and passed the complete release-gating suite. No Firestore rules changed in this workstream.

## Approved media retained

- `emos-landing-hero-v1.png` — `e05e206dca5ffb5a6231f4931329f4997c42bca6f5478dcdabd474d8dc0ba08f`
- `emos-hero-animation-v1.mp4` — `5e3886be464442fb4714912205ce19a23913afdfa9a47105c9bde065b39ca8a3`
- `emos-command-center-dashboard-v1.png` — `555fee90bf4b4dd7d6b0c83f9e326c19292eee7ad0439af878d36550cb24061d`
- `emos-enterprise-dna-v1.png` — `68329cbcd2e52498a65585cfc4bd3f47348e912586d757903a43e1ff16b45fff`

The four v1 files remain retained and unchanged. The landing now uses these additional real-product captures:

- `emos-product-hero-production-v2.png` — `7fd912ddc82651684e3f9d485a7c805433d9b64c07a20880fdeadca12831e1a6`
- `emos-product-demo-v2.mp4` — `ea048e4369f792481447543aae410b09568a9df4e2c0cfc458e99bf3558bfbb7`

The v2 files were assembled in Higgsedit from the real public production sandbox and are labelled as synthetic-data captures. Command Center and Enterprise DNA v1 remain concept previews. Customer-facing product copy is provider-neutral; Google implementation evidence remains in technical documentation.

The landing now additionally uses versioned, compression-only derivatives of those real captures:

- `emos-product-hero-production-v2-performance.webp` — 70,132 bytes; SHA-256 `2a05f3d6d47f7712b3d12f9bcea866a6527be4ea0f567a7c7ac1b41597a37b9f`.
- `emos-product-demo-v2-performance.mp4` — 1,985,917 bytes; 1920×1080, 30 fps, 16 seconds, silent; SHA-256 `7ec315f7fda794da6114386fa8da461fe2f2b0241e51ff7b7a44c764078bace4`.

See `docs/product/MEDIA_MANIFEST.md` for source provenance, accessibility treatment and retained rollback assets.

The Learning Center also hosts `emos-beta-v2-product-demo-narrated-captioned-v1.mp4`: a 79-second, 1080p Cillian-narrated walkthrough with burned English captions. It is built only from real production captures using synthetic EMOS data, covers the journey through Define Target State, and explicitly keeps Execute through Reassess Planned. It is separate from the silent/deferred landing loop and retains every prior media asset for rollback.

## Known limitations and next action

- No live enterprise connectors, 5,000-asset synchronous capacity claim, organization tenancy/RBAC, autonomous approval, automated migration execution or operational stages 10–15.
- File intake supports bounded CSV/flat JSON only. XLSX and connector catalog entries remain Planned.
- Target-state and governance approvals are owner-scoped MVP records; they are not multi-role enterprise workflow enforcement.
- Firestore rules must always be deployed before any client that requires a new document shape. The current ruleset preceded this production release; the media-only commit changed no rules.
- Beta v2 narrated-demo rollback target is `gemini-reflection-journal-media-perf-605d756`. It was not used because candidate and live production checks passed. The earlier `gemini-reflection-journal-media-ed9afe2` and `gemini-reflection-journal-cache-b7915d4` remain retained.

## Cross-tool continuation

If Codex is unavailable, start with `claude/README.md` and
`claude/EMOS_RELEASE_HANDOFF.md`. The machine-readable state is
`claude/emos-handoff.json`, and `claude/EMOS_CONTINUATION_PROMPT.md` is the
copy-ready continuation prompt. These artifacts preserve the same release gates,
capability boundaries, security invariants and rollback sequence; using another
coding agent does not relax them.
