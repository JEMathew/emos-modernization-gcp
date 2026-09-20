# EMOS integrated MVP production result — 21 September 2026

## Outcome

One coherent release candidate now supports the modernization journey from Align through Define Target State. The interface retains the approved EMOS visual system, keeps Google implementation evidence out of customer capability labels, and keeps all later lifecycle stages visible but Planned.

## Implemented versus planned

Available: secure workspace, Command Center, bounded CSV/JSON intake, Portfolio, Enterprise DNA, Evidence Workbench, deterministic assessment/economics, canonical 6R comparison, governed multi-turn reasoning, human decisions and audit trail, prioritization, Plan, Mobilize, Target State and unified History.

Planned: live connectors, XLSX, enterprise RBAC/organization tenancy, automated migration execution, Execute, Validate, Transition, Measure Benefits, Learn and Reassess. No 5,000-asset capacity, autonomous approval or production migration claim is made.

## Agent architecture

The server registers one EMOS Orchestrator and five bounded specialists: Intake & Discovery; Evidence & Enterprise DNA; Assessment & Economics; Governance & Decision; Planning & Target State. Validation, scoring, cost/TCO arithmetic, evidence readiness and prioritization remain typed deterministic code. Gemini receives authorized evidence and may explain; it cannot create enterprise facts, approve a decision or execute a migration.

## Verification

| Layer | Status | Evidence |
|---|---|---|
| Type/static checks | PASS | `npm run lint` |
| Unit, API and component tests | PASS | 214 tests across 21 files |
| Navigation and URL context | PASS | Direct-route and back/refresh tests through Target State |
| Responsive behavior | PASS (reviewed) | Desktop plus 390 px and 320 px, no reviewed page overflow |
| Themes | PASS (reviewed) | Light, Dark and System behavior retained |
| Keyboard/focus/accessibility | PASS (automated candidate) / PARTIAL (formal audit) | Keyboard theme controls, dialog focus/error behavior and labelled navigation; no formal AT audit |
| Intake/parser/persistence | PASS (unit/component) / PARTIAL (file-chooser confirmation) | Bounds, invalid rows, normalization, atomic/idempotent contracts; governance and Target State records reopened in production; local file selection remained browser-policy blocked |
| Authentication | PASS | Automated contracts plus authenticated production route matrix and persisted-record reopen |
| Firestore ownership rules | PASS (CI + live two-account proof) | Java 21 emulator suite passed in CI run `35530543112`; Account A reopened the saved synthetic multi-turn record; Account B's owner control passed while direct Account A read/update probes were denied with HTTP 403 |
| API and AI guardrails | PASS (automated) | Auth, schemas, prompt injection, redaction, empty/malformed output and safe rendering tests |
| Production build | PASS | Vite and server bundle; known main-chunk warning |
| Browser golden path | PASS (synthetic) | Coded screens reviewed through Target State; no Firebase/AI calls in fixture |
| Higgsfield fidelity | PASS | Four real production sandbox captures were assembled in Higgsedit; no fictional UI was generated |
| Hackathon requirements | PASS for implemented product and technical evidence / OWNER SUBMISSION REMAINS | Core requirements and the unique modernization enhancement are production-smoked; AI Studio configuration evidence and two-account isolation proof are recorded. Social/write-up publication and official form submission remain owner actions |
| Live-service smoke | PASS | Public and authenticated custom-domain matrices passed through Define Target State |
| Git/GCP deployment | PASS | Commit `ed9afe2`, tag `emos-production-media-v2-20260921`, CI `35530543112`, revision `gemini-reflection-journal-media-ed9afe2` |
| Rollback verification | READY, NOT USED | `gemini-reflection-journal-cache-b7915d4` recorded at 100% before release; all smoke gates passed |

## Security evidence

Firebase identity gates the workspace; Firestore paths are owner-scoped; model keys remain server-only through Secret Manager; imported content and model output are untrusted and inert; requests are bounded; governance history is bounded and validated; material approvals remain named human actions.

## Visual assets and demo

All four approved v1 assets remain preserved with unchanged hashes. The landing hero now uses two additional versioned, real-product outputs assembled in Higgsedit from the live public production sandbox:

- `emos-product-hero-production-v2.png` — SHA-256 `7fd912ddc82651684e3f9d485a7c805433d9b64c07a20880fdeadca12831e1a6`, 1920×1080.
- `emos-product-demo-v2.mp4` — SHA-256 `ea048e4369f792481447543aae410b09568a9df4e2c0cfc458e99bf3558bfbb7`, 1920×1080, 16 seconds, silent.

The product caption states that these are live public-sandbox captures using synthetic enterprise data. The Command Center and Enterprise DNA v1 visuals remain concept previews.

### Beta v2 landing-media performance update

Commit `605d75646de194a40a0c7fb5127b7d3ea27aea01` (immutable tag `emos-beta-v2-media-performance-20260921`) retains those sources and replaces only the landing delivery derivatives: a 70,132-byte WebP poster and a 1,985,917-byte silent 1920×1080 / 30 fps / 16-second H.264 loop. The video is no longer in the initial render: poster first, 800 ms defer after usable primary content, static treatment for reduced motion and constrained network, static-by-default small mobile, viewport pause, keyboard Play/Pause and error fallback. It introduces no fictional product screens.

## Release and rollback record

| Gate | Result |
|---|---|
| Pushed source | `ed9afe275b918e613c770afb127c56febf9cc03d`; immutable tag `emos-production-media-v2-20260921` |
| CI | Guardrail release gate `35530543112` passed, including Java 21 Firestore emulator and build |
| Firestore rules | Active ruleset `84847c06-eb45-422d-87b9-2d8545fa3623`; source SHA-256 `75d9b4f20d991ae18d83001a7de245e19bcabfe62a681e517eca897a156b77ff` |
| Prior healthy rollback | `gemini-reflection-journal-cache-b7915d4`, recorded at 100% traffic |
| Production | `gemini-reflection-journal-media-ed9afe2`, Ready, 100% traffic at `https://emos-modernization.ai.studio` |
| Commit metadata | Service label corrected to full `ed9afe275b918e613c770afb127c56febf9cc03d`; metadata-only revision `gemini-reflection-journal-00038-xdx` uses the identical container image and receives 0% traffic |
| Public smoke | PASS for landing, sandbox, learning, trust, stable MVP routes, health, auth boundary and v2 media |
| Authenticated smoke | PASS for route matrix, saved assessment/follow-up history, named `MORE EVIDENCE` record, Plan/Mobilize and Target State reopen |
| Rollback action | Not invoked; no release gate failed |

## Beta v2 landing-media release

| Gate | Result |
|---|---|
| Source / immutable tag | `605d75646de194a40a0c7fb5127b7d3ea27aea01` / `emos-beta-v2-media-performance-20260921` |
| CI | PASS — GitHub Actions `35534159098`, including Java 21 Firestore emulator release gate |
| Firestore rules | Unchanged; active source SHA remains `75d9b4f20d991ae18d83001a7de245e19bcabfe62a681e517eca897a156b77ff`; no rules deployment |
| Candidate | PASS — `gemini-reflection-journal-media-perf-605d756` deployed at zero traffic, public routes/media/401 boundary and browser behavior verified |
| Production | PASS — `gemini-reflection-journal-media-perf-605d756` promoted to 100% at `https://emos-modernization.ai.studio` |
| Rollback | READY / NOT USED — `gemini-reflection-journal-media-ed9afe2` recorded before promotion; `gemini-reflection-journal-cache-b7915d4` retained |
| Remaining limitation | The local Java runtime is absent, so emulator execution is CI-backed for this machine; formal WCAG/AT audit and the longer narrated demo remain later scope |

### Hackathon evidence closure

The owner-supplied sanitized AI Studio evidence shows the EMOS workspace and a configured Custom instructions surface. The accompanying 17,257-byte export covers threat modelling, secure input/output handling, Firebase authentication, owner-bound Firestore access, Secret Manager, AI guardrails and release verification. It differs from the audited repository constitution and contains duplicated generic sections; this is disclosed, and the repository constitution remains the release-policy baseline.

The production two-account proof used synthetic data only. Account A reopened an existing assessment with two saved follow-up exchanges. Account B's History contained no A-owned records and the known A assessment link was unavailable. A direct production Firestore diagnostic authenticated as Account B passed its own-record create/read control and received HTTP 403 for Account A read and update attempts. The original unchanged-record comparison falsely failed because raw JSON object ordering varied; three later reads had the same content and update time, and the update time predated the probe. The complete, non-all-green audit trail is retained in `work_results/EMOS-LIVE-ISOLATION-EVIDENCE-20260921.md`.

Residuals: the production file chooser was not driven because browser policy blocked local file selection; parser, limits and UI gates remain automated-test-backed. Official submission still needs the owner's social/write-up link and form submission.
