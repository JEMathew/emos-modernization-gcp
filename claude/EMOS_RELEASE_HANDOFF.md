# EMOS integrated MVP release handoff

Updated: 20 September 2026. This is the authoritative continuation brief for
Claude Code or another coding agent. It records verified local state; it does
not claim that GitHub or production deployment has completed.

## Start here

- Repository: `JEMathew/emos-modernization-gcp`
- Local checkout: the repository containing this file
- Branch: `codex/emos-visual-assets`
- Integrated functional commit: `bff05ac93546ad1179a89a62f451c7a9c59dd45c`
- Immutable candidate tag: `emos-integrated-mvp-20260920`
- Previous visual baseline: `47d9809058b782f3d578a52426df507d6ccaa696`
- Immutable baseline tag: `emos-packet-2-5-visual-alignment-20260920`
- Remote: `https://github.com/JEMathew/emos-modernization-gcp.git`
- Production service: `gemini-reflection-journal`
- Google Cloud project: `codev-0326`
- Region: `asia-southeast1`
- Custom domain: `https://emos-modernization.ai.studio`

Before changing anything, run `git status --short`, `git rev-parse HEAD`,
`git log --oneline --decorate -5` and `git remote -v`. Preserve any user or
agent changes you did not create. Never reset, force-push, move the release
tags, or overwrite a dirty tree.

## What is implemented

One coherent, responsive private product experience exists from Align through
Define Target State:

1. Align
2. Discover, including bounded CSV or flat-JSON intake
3. Understand / Enterprise DNA and evidence quality
4. Assess, including readiness, risk, complexity, feasibility and economics
5. Decide with canonical 6R comparison and human accountability
6. Govern with architecture, security, compliance and evidence gates
7. Prioritize using a transparent formula and human funding boundary
8. Plan roadmaps and waves
9. Mobilize owners, readiness gaps and the delivery baseline
10. Define Target State, including architecture, NFRs, migration, cutover and
    rollback

Execute, Validate, Transition, Measure Benefits, Learn and Reassess are visible
but inert and labelled `Planned`. Policies and constraints, ownership capture,
initial dependency mapping, and capacity/resource modelling are labelled
`Building next`. Do not imply these are shipped.

The current server modules are bounded specialists behind an orchestrator, not
independently deployed autonomous agents. A true traversable enterprise
knowledge graph is not implemented; current workload dependency and evidence
relationships are its foundation only.

## Stable product routes

| Experience | Route |
|---|---|
| Command Center | `/app` |
| Portfolio and safe intake | `/app/portfolio` |
| Enterprise DNA | `/app/workloads/:id/dna` |
| Evidence workbench | `/app/workloads/:id/evidence` |
| Assessment | `/app/workloads/:id/assessment` |
| Decision | `/app/workloads/:id/decision?assessment=:assessmentId` |
| Governance | `/app/govern?workload=:id` |
| Prioritization | `/app/prioritize?workload=:id` |
| Align | `/app/plan?stage=align` |
| Plan | `/app/plan` |
| Mobilize | `/app/plan?stage=mobilize` |
| Target state | `/app/workloads/:id/target-state` |
| History | `/app/history` |

## Security invariants

- Firebase Authentication gates the private workspace.
- Tenant data is owner-scoped below `/users/{uid}` in Firestore.
- Gemini access and secrets stay server-side; do not put credentials in browser
  bundles, code, prompts, logs or handoff artifacts.
- Imported text and model output render as inert text.
- Keep file, row and column limits, mapping/preview/consent, prompt-injection
  screening, secret redaction, schema validation and authorized-evidence
  selection intact.
- AI can explain and recommend. It cannot approve, reject, waive a control,
  invent missing evidence or change deterministic scores.
- Firestore rules must be deployed before the new client. The old rules do not
  admit the new governance and target-state records.

## Verification at handoff

| Check | State | Evidence or next gate |
|---|---|---|
| Type/static checks | PASS | `npm run lint` |
| Automated tests | PASS | 214 tests across 21 files |
| Production build | PASS | Existing main-chunk warning: about 1.68 MB minified / 438 KB gzip |
| Responsive UI | PASS locally | Synthetic browser review at desktop, 390 px and 320 px; light/dark/system checked |
| Firestore emulator | BLOCKED locally | Java is absent; run in Java 21 CI or a Java-enabled environment |
| Live Firebase auth and persistence | PARTIAL | Requires exact production-revision smoke evidence |
| Live Gemini interaction | PARTIAL | Requires authenticated production smoke evidence |
| GitHub push | PENDING | Terminal write authentication was not completed |
| Google Cloud deployment | PENDING | `gcloud` is absent locally and Firebase CLI is unauthenticated |
| Real production captures and refreshed demo media | PENDING | Capture only after production smoke passes |

Do not downgrade BLOCKED or PARTIAL to PASS without fresh evidence. The detailed
implementation report is `work_results/EMOS-INTEGRATED-MVP-20260920-result.md`.
The current scorecard is `docs/product/HACKATHON_RELEASE_SCORECARD.md` and the
evidence index is `docs/EVIDENCE_INDEX.md`.

## Approved media integrity

These four approved source assets must retain the following SHA-256 values:

| Asset | SHA-256 |
|---|---|
| `emos-landing-hero-v1.png` | `e05e206dca5ffb5a6231f4931329f4997c42bca6f5478dcdabd474d8dc0ba08f` |
| `emos-hero-animation-v1.mp4` | `5e3886be464442fb4714912205ce19a23913afdfa9a47105c9bde065b39ca8a3` |
| `emos-command-center-dashboard-v1.png` | `555fee90bf4b4dd7d6b0c83f9e326c19292eee7ad0439af878d36550cb24061d` |
| `emos-enterprise-dna-v1.png` | `68329cbcd2e52498a65585cfc4bd3f47348e912586d757903a43e1ff16b45fff` |

The landing page uses them as concept or atmospheric media only. Functional
proof must come from real coded-product captures. Keep user-facing copy
provider-neutral; document Google implementation evidence in technical and
hackathon material.

## Safe release sequence

Continue as one controlled product release followed by one evidence/media
update, not as an unreviewed big-bang deployment:

1. Confirm the worktree and candidate identity, then rerun lint, all tests and
   the production build.
2. Push the current branch and immutable tags through an authenticated GitHub
   session. Never place a token in the remote URL or a shell command.
3. Let required CI finish. Run Firestore emulator tests in Java 21; record any
   blocker honestly.
4. Authenticate to Google Cloud/Firebase using the repository's established
   operator process. Confirm project, account and target before every mutation.
5. Record the currently healthy Cloud Run revision and traffic split. This is
   the production rollback target.
6. Deploy and verify Firestore rules first.
7. Deploy the application to `gemini-reflection-journal` in `codev-0326`,
   `asia-southeast1`. Bind secrets through Secret Manager only.
8. Run public and authenticated smoke tests on the exact revision: landing,
   sign-in boundary, portfolio import/save/reopen, DNA/evidence, assessment,
   follow-up/history, human decision, governance and target-state save/reopen.
9. If smoke fails, restore all traffic to the recorded prior healthy revision.
   Do not delete the failed revision or data needed for diagnosis.
10. After smoke passes, capture the real production UI. Use Higgsfield/Higgsedit
    only to assemble/refine landing and demo media from those captures; do not
    generate fake product UI or replace live interactions with raster screens.
11. Recheck mobile/tablet/desktop, day/night/system appearance, media hashes,
    hackathon evidence and capability-state truthfulness. Record the deployed
    revision, rollback revision, URLs and evidence in the integrated report.

## Rollback

Code rollback uses an immutable known-good commit/tag or a normal revert after
reviewing Firestore compatibility. Never use `git reset --hard` on a shared or
dirty checkout. Cloud rollback restores traffic to the prior healthy Cloud Run
revision recorded immediately before deployment. Firestore rules/data changes
must be assessed independently; rolling back application traffic does not roll
back persisted data.

## Source-of-truth files

- `docs/product/IMPLEMENTATION_STATE.md`
- `docs/product/EMOS_UX_CONSTITUTION.md`
- `docs/product/HACKATHON_RELEASE_SCORECARD.md`
- `docs/AI_STUDIO_SECURITY_CONSTITUTION.md`
- `docs/EVIDENCE_INDEX.md`
- `docs/IDEATHON_DELIVERABLES.md`
- `docs/DEMO_FLOW.md`
- `work_results/EMOS-INTEGRATED-MVP-20260920-result.md`
- `claude/messaging-source.md`

When documents disagree, verified code/tests and `IMPLEMENTATION_STATE.md` take
precedence for current capability. Do not revive older packet language as the
release plan; the functional MVP is now integrated.
