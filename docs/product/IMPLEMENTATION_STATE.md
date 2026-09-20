# EMOS implementation handoff

Updated: 20 September 2026. Packets 1, 2 and the 2.5 visual-alignment checkpoint are implemented locally; production release remains gated. Latest: Packet 2.5 — visual alignment.

## Repository and checkpoint

- Repository: `JEMathew/emos-modernization-gcp`
- Checkout: `/Users/jincenmathew/Documents/Codex/2026-09-19/referenced-chatgpt-conversation-this-is-an/work/emos-production-assets`
- Branch: `codex/emos-visual-assets`
- Previous commit / rollback baseline: `ec0bbf50d3ba22fe4b7931bf61519f09c8c63b49`, checkpoint `emos-packet-2-safe-intake-20260920`.
- New checkpoint: `emos-packet-2-5-visual-alignment-20260920`. Resolve its exact SHA after commit with `git rev-parse emos-packet-2-5-visual-alignment-20260920`; do not move this checkpoint.
- Commit subject: `feat: align EMOS product UI with approved visual direction`
- Production: not pushed or deployed. No Cloud Run revision or traffic changed in this packet.
- Code rollback: revert the packet commit after reviewing the working tree; do not hard-reset user changes. A future deployment also requires a recorded prior healthy Cloud Run revision and database/config compatibility review. A code commit alone is not a production rollback rehearsal.

## Completed

### Packet 2.5 — Visual alignment

- Replaced the wide desktop tab bar with a persistent application rail while retaining the same Overview, Portfolio, Decisions, Plan and History IA.
- Added a compact mobile header and fixed bottom navigation; primary actions, theme choice and sign-out retain minimum 44 px targets.
- Stabilized portfolio context beneath the header/rail, expanded the working canvas to 1600 px and kept the five-phase lifecycle visible before workspace content.
- Applied theme-aware dark navy, cyan journey-state and gold primary-action tokens without changing workflow truth, routes or availability.
- Reviewed Command Center, Portfolio, Enterprise DNA and intake mapping in desktop dark mode, Command Center in light mode, and intake at 390 px with no page-level horizontal overflow.
- Reused existing Higgsfield references. No generated asset, approved production asset hash, model call, data contract or server boundary changed.

### Packet 2 — Safe intake and discovery

- Code-native Source → Map → Preview → Import result workflow, preserving the existing Command Center and navigation.
- CSV and flat JSON intake with extension/MIME/parse validation, 5 MiB / 200 workload / 40 column limits, row-level errors, explicit field mapping and normalized preview. XLSX and connectors remain Planned.
- Required ID/name/type, bounded fields, canonical enum validation, duplicate-key/column/mapping/ID rejection and case-insensitive conflict checks against loaded inventory. No arbitrary file acceptance or 5,000-asset claim.
- Invalid rows are excluded only by explicit consent. Original files and unmapped columns stay out of persistence and AI evidence. Normalization, credential redaction and literal formula handling are disclosed in preview warnings.
- Atomic owner-scoped Firestore transaction with strict normalized schema validation, exact-payload idempotent retry and no replacement of conflicting existing documents. Actual emulator and live-service validation remain release gates.
- Source filename, logical record number, chosen mapping, validation version and warning count accompany imported workloads. Missing evidence stays missing; the legacy Medium planning fallback is disclosed rather than counted as known criticality.
- Import progress, account-change reset, actionable failure, retry, focus-managed errors, browser Back and successful imported-portfolio/DNA handoff covered locally. Draft content stays in memory and is intentionally discarded on refresh/close.

### Packet 1 — Product foundation (retained)

- Command Center is the authenticated default at `/app`, with actual selected-portfolio counts, deterministic evidence gaps and next actions.
- Shared top navigation: Overview, Portfolio, Decisions, Plan, History. History is a dedicated page.
- URL-backed portfolio, workload, assessment and stage context; refresh and back/forward support.
- All 15 stages, Mobilize and their sub-stages visible; only available workflows are navigable. Available / Building next / Planned replaces beta-style delivery labels in the lifecycle.
- Align, Plan and Mobilize open the correct sections; selecting a lifecycle stage collapses the panel.
- Workload-specific Assess opens the matching evidence; Decide can reopen its saved assessment. Missing or mismatched records produce an unavailable state instead of an unrelated workload.
- Loading and read-error states prevent failed subscriptions from being presented as empty, successful data.
- Shared breadcrumbs, active portfolio selector, and progressive disclosure for inputs, evidence, AI activity, decisions, outputs and next stage.
- Light / Dark / System preserved, with keyboard selection, focus return and local persistence.
- Private app state remounts when account identity changes. Authentication, server AI access, Firestore rules and secret configuration remain intact.

## Stage availability

| Available workflow entry | Building next | Planned |
|---|---|---|
| Align, Discover, Understand, Assess, Decide, Plan, Mobilize | Govern, Prioritize, Define Target State | Execute, Validate, Transition, Measure Benefits, Learn, Reassess |

Availability is not completion of every sub-stage. Policies/constraints, ownership capture, initial dependency mapping, full TCO/value analysis, human approval, capacity/resources, milestones, cost-benefit baseline, delivery charter, closing handoff gaps and delivery-baseline approval are explicitly marked Building next inside otherwise available stages.

## Routes

| Workspace | Implemented URL |
|---|---|
| Command Center | `/app` |
| Portfolio | `/app/portfolio` |
| Enterprise DNA | `/app/workloads/:id/dna` |
| Workload assessment | `/app/workloads/:id/assessment` |
| Workload decision | `/app/workloads/:id/decision?assessment=:assessmentId` |
| Standalone assessment / decision | `/app/assessment`, `/app/decision?assessment=:assessmentId` |
| Align | `/app/plan?stage=align` |
| Wave Plan | `/app/plan` |
| Mobilize | `/app/plan?stage=mobilize` |
| Saved decisions | `/app/history` |

Imported portfolio URLs carry `portfolio=imported`. Portfolio/overview/planning URLs can carry `workload=:id` to retain the selection. These are application URLs, not authorization: all records still come from owner-scoped subscriptions. Public pages remain under their existing routes.

The open intake dialog adds ephemeral `intake=source|map|preview|result` context. Back within the same open session retains mapping/preview; a changed mapping invalidates the old preview. No uploaded values enter the URL or browser history. Refresh does not restore an unsaved file, and old intake URLs do not recreate a draft. The success action opens `/app/portfolio?portfolio=imported`.

## Agent architecture delta — Packet 2

These are deterministic governed services, not autonomous AI agents. No Gemini or other model calls were added. See the [packet result](../../work_results/SAFE-INTAKE-DISCOVERY-02-result.md#agent-architecture-delta) for each capability's inputs, outputs, approval/data boundaries, tests and limitations.

| Capability | Parent / responsibility | Delivery status and evidence |
|---|---|---|
| Portfolio Intake Agent foundation | EMOS Discover; coordinate reviewed inventory intake | Building next for production; full local workflow implemented/tested, Firestore emulator and live persistence still blocked/pending |
| File Validation | Portfolio Intake; bound and parse CSV/JSON | Available in local candidate; parser/limit/malformed-input tests |
| Schema Mapping | Portfolio Intake; map selected columns without ambiguity | Available in local candidate; mapping unit/UI tests and browser review |
| Content Safety | Portfolio Intake; keep content inert and bounded | Available in local candidate; injection, redaction, safe-rendering and evaluation-separation tests; no universal immunity claim |
| Portfolio Normalization | Portfolio Intake; preserve evidence/gaps and provenance | Available in local candidate; normalization, field-boundary and sample-data tests |
| Persistence and Discover Handoff | Portfolio Intake; atomic save, retry and correct portfolio route | Building next for production; mocked transaction/component/navigation checks pass, real Firestore gate remains |

All five sub-capabilities are implemented; none is advertised as a separately autonomous sub-agent. Human confirmation authorizes importing the reviewed valid set, never a modernization decision. Google-specific implementation evidence remains technical, not a customer-facing capability label.

## Verification and known gaps

See [Packet 2 result](../../work_results/SAFE-INTAKE-DISCOVERY-02-result.md), [Packet 1 result](../../work_results/PRODUCT-FOUNDATION-01-result.md) and [scorecard](HACKATHON_RELEASE_SCORECARD.md) for dated evidence and release gates.

- `npm run lint`, 202 unit/API/UI tests across 18 files, and production build pass on the Packet 2.5 source.
- Browser review uses an isolated local synthetic adapter, with no Firebase writes or real AI calls. It does not prove live sign-in or production persistence.
- Firestore emulator could not start: Java runtime missing. Existing CI provisions Java 21 and must pass on the candidate commit before release.
- Build reports an approximately 1.65 MB minified main bundle (430 KB gzip); code splitting/performance work remains. The bounded parser timing test is not an enterprise-scale performance result.
- Firestore rules now admit strictly bounded optional import provenance while preserving ownership checks and compatibility with old records. The old deployed rules reject new provenance fields: verify and release the rules before the candidate app in a separately authorized deployment. Do not deploy this local packet alone.
- Import size is additionally bounded to 4 MiB of normalized records for an atomic save. CSV source cells have a 10,000-character parsing cap; mapped evidence fields are at most 2,000 characters, names 250 and IDs 100.
- Recovery keeps the exact reviewed payload in the open dialog. Closing/refreshing loses retry identity; a subsequent fresh upload must not overwrite existing IDs. Offline durable queues, organization tenancy and cross-device draft recovery are not implemented.
- Organization tenancy, roles, SSO, enterprise-scale imports and connectors are not delivered here.
- Saved context survives navigation; unsaved drafts are local component state, not durable records.
- The existing sample dataset uses Customer Analytics, Enterprise Data Warehouse and Document Management. The proposed Northstar / Legacy Order Management visual narrative is not yet the live sample data model. Reconcile it intentionally during packets 3/8; do not fabricate consistency.
- Some legacy/public marketing copy retains Beta language. Packet 8 owns that refresh; this packet standardizes lifecycle availability.
- No new media generated and approved asset hashes remain unchanged. Existing Higgsfield references guided Packet 2.5; final website and demo media remain after workflow stabilization.

## Next work packet — 3: Enterprise DNA and evidence (not started)

Build the evidence workbench on normalized imported workloads: clear known/missing/incomplete evidence, source traceability, ownership and gaps, including current cost/TCO baseline. Preserve deterministic completeness and human verification. Confirm the exact Packet 3 acceptance scope before coding; do not turn metadata or placeholders into verified evidence. Assessment/economic comparison belongs to Packet 4. No additional packet was implemented here.

Read this handoff, the UX/security constitutions and the relevant DNA/evidence components and tests initially. Preserve the intake contract, 5 MB / 200-workload bound and owner-scoped persistence. Use focused tests, update the scorecard and handoff, and commit one packet. Do not push or deploy without authorization.

Remaining sequence: 3 DNA/evidence; 4 assessment/decision/economics; 5 governance/prioritization; 6 plan/target state; 7 enterprise operating model; 8 website/Higgsfield visuals/Product Builder Information; 9 demo/Higgsfield media/evidence/release.

## Cross-tool continuation

Codex or Claude Code should inspect Git status, this handoff and applicable repository instructions before changing files. Read the relevant security constitution, implement only the next packet, preserve unrelated changes, and update the same evidence files. Never run two writers on this checkout simultaneously. Do not put credentials in prompts, documentation or fixtures.
