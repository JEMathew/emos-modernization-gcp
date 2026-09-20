# EMOS implementation handoff

Updated: 20 September 2026. Packet 1 — Product foundation implemented locally; production release remains gated.

## Repository and checkpoint

- Repository: `JEMathew/emos-modernization-gcp`
- Checkout: `/Users/jincenmathew/Documents/Codex/2026-09-19/referenced-chatgpt-conversation-this-is-an/work/emos-production-assets`
- Branch: `codex/emos-visual-assets`
- Previous commit / rollback baseline: `3e6e23072d9d8c6e78f74f5896e44c12027f0c1d`
- New packet commit: local immutable Git reference `emos-packet-1-foundation-20260920`. Resolve its exact SHA with `git rev-parse emos-packet-1-foundation-20260920`.
- Commit subject: `feat: establish coherent EMOS MVP product foundation`
- Production: not pushed or deployed. No Cloud Run revision or traffic changed in this packet.
- Code rollback: revert the packet commit after reviewing the working tree; do not hard-reset user changes. A future deployment also requires a recorded prior healthy Cloud Run revision and database/config compatibility review. A code commit alone is not a production rollback rehearsal.

## Completed

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

## Verification and known gaps

See [packet result](../../work_results/PRODUCT-FOUNDATION-01-result.md) and [scorecard](HACKATHON_RELEASE_SCORECARD.md) for dated evidence and release gates.

- `npm run lint`, 142 unit/API/UI tests and production build pass.
- Browser review uses an isolated local synthetic adapter, with no Firebase writes or real AI calls. It does not prove live sign-in or production persistence.
- Firestore emulator could not start: Java runtime missing. Existing CI provisions Java 21 and must pass on the candidate commit before release.
- Build reports an approximately 1.63 MB minified main bundle (424 KB gzip); code splitting/performance work remains.
- Organization tenancy, roles, SSO, enterprise-scale imports and connectors are not delivered here.
- Saved context survives navigation; unsaved drafts are local component state, not durable records.
- The existing sample dataset uses Customer Analytics, Enterprise Data Warehouse and Document Management. The proposed Northstar / Legacy Order Management visual narrative is not yet the live sample data model. Reconcile it intentionally during packets 3/8; do not fabricate consistency.
- Some legacy/public marketing copy retains Beta language. Packet 8 owns that refresh; this packet standardizes lifecycle availability.
- No new media generated. No asset changes; Higgsfield is required in packets 8/9 per the accepted plan.

## Next work packet — 2: Safe intake and discovery

Implement one bounded intake slice: mapping and preview for supported CSV/JSON input, actionable row-level errors, explicit limits, safe handling of untrusted fields, and reliable continuation into the imported portfolio. Assess XLSX feasibility before adding it; do not accept arbitrary files or claim 5,000+ scale. Preserve the existing 5 MB / 200-workload limits until a separately tested ingestion path changes them. Connectors remain later work.

Read only this handoff, the UX constitution, `src/utils/portfolioImporter.ts`, `src/components/ImportPortfolioModal.tsx`, `src/components/SamplePortfolioView.tsx`, the relevant Firebase/schema methods and importer tests initially. Use focused tests, update the scorecard and handoff, and commit one packet. Do not push or deploy without authorization.

Remaining sequence: 3 DNA/evidence; 4 assessment/decision/economics; 5 governance/prioritization; 6 plan/target state; 7 enterprise operating model; 8 website/Higgsfield visuals/Product Builder Information; 9 demo/Higgsfield media/evidence/release.

## Cross-tool continuation

Codex or Claude Code should inspect Git status, this handoff and applicable repository instructions before changing files. Read the relevant security constitution, implement only the next packet, preserve unrelated changes, and update the same evidence files. Never run two writers on this checkout simultaneously. Do not put credentials in prompts, documentation or fixtures.
