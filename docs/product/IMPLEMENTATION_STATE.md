# EMOS integrated MVP implementation state

Updated: 20 September 2026. This file records the integrated release candidate; it does not imply product-owner approval or an official hackathon score.

## Release identity

- Repository: `JEMathew/emos-modernization-gcp`
- Branch: `codex/emos-visual-assets`
- Visual-alignment baseline: `47d9809058b782f3d578a52426df507d6ccaa696`, immutable tag `emos-packet-2-5-visual-alignment-20260920`.
- Integrated candidate tag: `emos-integrated-mvp-20260920` after the release commit is created. Do not move the tag.
- Production target: `gemini-reflection-journal`, project `codev-0326`, region `asia-southeast1`, custom domain `https://emos-modernization.ai.studio`.
- Code rollback: revert the integrated commit or redeploy the immutable visual-alignment baseline after reviewing data/rules compatibility. Never hard-reset a working tree containing user changes.
- Cloud rollback: record the prior healthy Cloud Run revision before deployment and restore traffic to it if smoke verification fails.

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

- PASS — Type/static checks: `npm run lint`.
- PASS — Unit/API/component/navigation/security tests: 214 tests across 21 files.
- PASS — Production build. The existing main-chunk warning remains (about 1.68 MB minified / 438 KB gzip).
- PASS — Local synthetic browser review for desktop, 390 px and 320 px; new deep routes, light/dark/system behavior and no page-level horizontal overflow reviewed.
- BLOCKED — Firestore Emulator Suite: Java runtime is absent locally, so this cannot be called PASS. Candidate CI or a Java-enabled environment must run it.
- PARTIAL — Authentication, live Firestore persistence and real Gemini calls have automated contracts but require exact production-revision smoke evidence.
- PASS — Approved media hashes remain unchanged before the final real-product demo treatment.

## Approved media retained

- `emos-landing-hero-v1.png` — `e05e206dca5ffb5a6231f4931329f4997c42bca6f5478dcdabd474d8dc0ba08f`
- `emos-hero-animation-v1.mp4` — `5e3886be464442fb4714912205ce19a23913afdfa9a47105c9bde065b39ca8a3`
- `emos-command-center-dashboard-v1.png` — `555fee90bf4b4dd7d6b0c83f9e326c19292eee7ad0439af878d36550cb24061d`
- `emos-enterprise-dna-v1.png` — `68329cbcd2e52498a65585cfc4bd3f47348e912586d757903a43e1ff16b45fff`

The landing page uses the four assets as concept/atmospheric media only. Functional proof must use real coded-product captures. Customer-facing product copy is provider-neutral; Google implementation evidence remains in technical documentation.

## Known limitations and next action

- No live enterprise connectors, 5,000-asset synchronous capacity claim, organization tenancy/RBAC, autonomous approval, automated migration execution or operational stages 10–15.
- File intake supports bounded CSV/flat JSON only. XLSX and connector catalog entries remain Planned.
- Target-state and governance approvals are owner-scoped MVP records; they are not multi-role enterprise workflow enforcement.
- Firestore rules must be deployed before the client because old rules do not admit the new governance/target-state documents.
- Run candidate CI with Java 21, then perform authenticated production smoke tests for sign-in, intake persistence, assessment/follow-up/history, governance and target-state save/reopen. Record the deployed revision and prior rollback revision in the integrated build report.

## Cross-tool continuation

If Codex is unavailable, start with `claude/README.md` and
`claude/EMOS_RELEASE_HANDOFF.md`. The machine-readable state is
`claude/emos-handoff.json`, and `claude/EMOS_CONTINUATION_PROMPT.md` is the
copy-ready continuation prompt. These artifacts preserve the same release gates,
capability boundaries, security invariants and rollback sequence; using another
coding agent does not relax them.
