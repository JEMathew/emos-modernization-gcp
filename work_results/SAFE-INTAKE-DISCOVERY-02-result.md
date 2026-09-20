# Packet 2 — Safe intake and discovery

Date: 20 September 2026. **Local implementation complete; not pushed, deployed or approved for production.** Packet 3 was not started. No parallel coding agents or media generation were used.

## Customer outcome

An authenticated user can select a bounded CSV/JSON inventory, map source columns, inspect normalized workloads and validation problems, explicitly exclude invalid rows, confirm the valid count and continue into their imported Discover portfolio. Uploaded text remains untrusted data. Validation is not AI approval or a modernization decision.

The four steps are **Source → Map → Preview → Import result**. Success opens `/app/portfolio?portfolio=imported`; the existing workload Enterprise DNA link preserves imported context. The Command Center, lifecycle navigation and public site IA remain intact.

## Repository and checkpoint

- Checkout: `/Users/jincenmathew/Documents/Codex/2026-09-19/referenced-chatgpt-conversation-this-is-an/work/emos-production-assets`.
- Branch: `codex/emos-visual-assets`; initially clean, no unrelated changes to preserve and no applicable AGENTS.md found.
- Parent/checkpoint verified: `973f2405f0d9ed48cabaec685054708f84bb1974` / `emos-packet-1-foundation-20260920`.
- One scoped local commit, subject `feat: add safe portfolio intake and discovery`.
- Candidate checkpoint: `emos-packet-2-safe-intake-20260920`. Resolve the exact commit with `git rev-parse emos-packet-2-safe-intake-20260920`; the completion message includes the SHA. A commit cannot contain its own eventual hash, so this report uses the stable checkpoint reference.
- No push, deployment, Cloud Run traffic change or live data write was performed.

## Implemented contract

1. **Source:** CSV and flat JSON only, including JSON arrays or one `workloads`/`data` envelope. Extension, MIME indication, actual parsing, file size and row/column counts checked. MIME is a hint, not trusted proof. Downloads retain the CSV template and synthetic examples.
2. **Mapping:** deterministic canonical/common-name suggestions, editable target selections, explicit Do not import, required field guidance, duplicate-target prevention and source-name traceability. Unmapped fields are not persisted.
3. **Preview:** normalized fields, logical row number, source mapping, individual errors/warnings, valid/invalid totals and pages of ten records. Blocking rows require correction in the source or explicit exclusion. Back retains the source; changing mapping invalidates preview and exclusion consent.
4. **Persistence:** strict schema revalidation and authenticated UID checks; all records read before writes in one Firestore transaction. A conflict aborts the whole import without replacing existing data. The stable preview import ID plus identical payload makes retries idempotent. No sequential partial-save success.
5. **Recovery:** visible progress and errors, disabled duplicate submissions/close while saving, unchanged payload on retry, stale async results discarded after close/account change. Success is shown only when save resolves. The actual Firebase transaction still needs emulator/live proof.
6. **Discover:** imported inventory stays separate from synthetic samples. Import source/validation details are disclosed separately. Earlier records without provenance remain readable. Existing subscription loading/permission-error states are retained and tested.

### Bounds and evidence truth

- File maximum 5 MiB (displayed as 5 MB), 200 records, 40 columns; CSV parser cell limit 10,000 characters; source column names at most 100 characters.
- Selected IDs at most 100 characters with a safe path-segment alphabet; names at most 250; evidence values at most 2,000. Canonical types: Application / Data Platform. Optional criticality: High / Medium / Low. Nested mapped JSON values and non-finite numbers rejected.
- Normalized batch maximum 4 MiB. More than 200 records must be split; no bulk 5,000-asset promise.
- Case-insensitive IDs checked against the file and loaded inventory; the transaction checks exact document conflicts again. No global cross-user uniqueness or organization tenancy is implied.
- Missing criticality stays missing in DNA/completeness and displays Unspecified in portfolio cards. The existing Medium planning fallback is disclosed as provisional. Missing stack/hosting/capability use Unspecified, not invented facts.
- Oversized source fields are errors, not silently truncated evidence. Derived modernization signal summaries may be shortened with a warning while full bounded evidence remains in DNA. Whitespace/control cleanup, literal formula prefixes and recognized credential redaction are disclosed.
- CSV row references are logical non-empty record positions including the header, not physical line numbers when multiline cells or blank lines occur. JSON rows start at 1.
- Import metadata includes the filename, selected column-name mapping, row, import ID, validation version and warning count. It does not store the original file, unmapped values or a durable raw-data archive. Metadata is provenance, not independently verified truth.
- Browser history holds only step/session context. Unsaved file content is memory-only; close/refresh loses the draft and retry ID. A stale `intake=` URL does not restore a file. Persisted inventory reload is dependent on owner-scoped Firestore access, not the demo fixture.

### XLSX decision

Not implemented. No existing XLSX parser dependency is present. Adding a ZIP/XML/spreadsheet parser and evaluating archive expansion, formulas, macros, resource limits and safe export behavior would broaden this packet. Users can export flat CSV/JSON. XLSX and connectors remain Planned; no dependency was introduced merely to add formats.

## Security review

- Trust boundaries: browser file → bounded parser → explicit mapping → validated normalized evidence → human-reviewed save → owner-scoped transaction/rules. Later assessment continues through the existing authenticated server and guardrails.
- Filenames, headers, values and JSON keys are untrusted. Reserved/ambiguous keys, invalid columns, malformed CSV/JSON and detected credential-like filenames/headers are rejected. Known credential patterns in values are redacted with a warning; detection is not a guarantee that all secrets are recognized.
- React text rendering keeps HTML/script-like values literal. Formulas, URLs and commands are not evaluated or followed. Prompt-injection-like values carry warnings and remain inert data; existing later AI guardrails may reject them.
- Intake does not call Gemini or transmit the original file to AI. Only selected normalized fields can later become bounded evidence. Evaluation labels and import metadata stay outside the assessment prompt.
- Persistence derives its owner from the authenticated client session and is enforced by the unchanged owner boundary in Firestore rules. Client validation is defense in depth, not authorization. Added metadata rules are optional for old records and bounded for new records.
- Server-side model access, Firebase authentication, Secret Manager configuration and existing security tests were not weakened. No credential values were read, added to fixtures or captured in screenshots. Parser/persistence errors avoid raw-record logging.
- Human confirmation approves importing data, not evidence truth, a 6R disposition, funding or migration. No autonomous actions were introduced.

## Agent architecture delta

All capabilities below are **deterministic governed services**, not independent autonomous agents or Gemini-assisted workers. Available means available in this local candidate, not deployed. The parent and persistence capability stay **Building next for production** until actual Firestore and live-service gates pass.

### Portfolio Intake Agent foundation

- **Customer responsibility / parent:** coordinate safe reviewed portfolio onboarding / EMOS Discover.
- **Inputs / outputs:** authenticated identity, CSV/JSON and user mapping/consent → reviewed normalized workloads, import result and Discover route.
- **Tools / behavior:** native dialog, deterministic importer/normalizer, Firebase transaction; no model calls.
- **Human boundary:** select source, confirm mapping, explicitly exclude invalid rows and authorize the exact valid count.
- **Data/security boundary:** memory-only raw source, bounded owner-scoped records; no organization-wide or autonomous access.
- **Delivery / tests:** Building next for production; all principal local steps implemented and covered by intake, modal, persistence and dashboard suites plus browser review. Firestore emulator BLOCKED.
- **Limitations:** synchronous 200-record intake, no durable draft queue, connectors, XLSX, SSO/RBAC or enterprise-scale agent orchestration.

### File Validation

- **Customer responsibility / parent:** reject unsupported or malformed input before mapping / Portfolio Intake Agent foundation.
- **Inputs / outputs:** file extension/MIME/bytes and parsed structure → bounded source columns/rows or actionable errors.
- **Tools / behavior:** File API, strict CSV state machine, JSON parser and duplicate-key checks; deterministic.
- **Human boundary:** user chooses/corrects the source; rejection cannot be bypassed by the import UI.
- **Data/security boundary:** size checked before reading, content/columns/cells/rows bounded; no archive processing or file execution.
- **Delivery / tests:** Available locally; `portfolioIntake` and `portfolioImporter.limits` cover valid/empty/malformed/type/size/count/Unicode cases.
- **Limitations:** flat CSV/JSON only; not an antivirus scanner or proof of source truth.

### Schema Mapping

- **Customer responsibility / parent:** make source-to-product translation understandable / Portfolio Intake Agent foundation.
- **Inputs / outputs:** source column names and chosen targets → explicit unique selected-field mapping or field errors.
- **Tools / behavior:** canonical/alias lookup, native selects and mapping validator; deterministic.
- **Human boundary:** suggestions require review; unselected columns explicitly excluded; changes require a new preview.
- **Data/security boundary:** source labels rendered as text; only allowlisted target fields retained.
- **Delivery / tests:** Available locally; unit mapping cases, duplicate/required UI cases, retained browser Back state and responsive review pass.
- **Limitations:** no semantic AI inference, nested transformation language or reusable saved mapping templates.

### Content Safety

- **Customer responsibility / parent:** prevent imported text becoming executable content or instructions / Portfolio Intake Agent foundation.
- **Inputs / outputs:** selected untrusted values → bounded literal/redacted values, warnings or validation errors.
- **Tools / behavior:** existing evidence sanitizer, credential-pattern redactor, injection detector and React text rendering; deterministic.
- **Human boundary:** warnings must be inspectable before import; later material decisions remain human-reviewed.
- **Data/security boundary:** no eval, formula execution, HTML insertion, external URL fetch or model call; excluded/evaluation metadata is not later AI evidence.
- **Delivery / tests:** Available locally; hostile-cell, redaction, literal-rendering and evidence-separation tests, existing guardrail/rendering suites pass.
- **Limitations:** pattern detection is not exhaustive DLP, malware scanning or universal prompt-injection immunity.

### Portfolio Normalization

- **Customer responsibility / parent:** create a coherent workload without inventing missing evidence / Portfolio Intake Agent foundation.
- **Inputs / outputs:** selected validated fields → EnterpriseWorkload/DNA, gaps, warnings and bounded source provenance.
- **Tools / behavior:** workload normalizer, completeness calculation and schema bounds; deterministic.
- **Human boundary:** inspect normalized values and disclosed changes before save; validation is not verification of truth.
- **Data/security boundary:** raw/unmapped columns excluded; evaluation metadata separated; non-finite/nested mapped values rejected.
- **Delivery / tests:** Available locally; field/enum/ID bounds, incomplete/missing evidence, maximum-value summaries and all shipped sample CSV cases pass.
- **Limitations:** legacy provisional Medium planning default remains disclosed; no cost estimation, evidence ownership workflow or Packet 3 enrichment added.

### Persistence and Discover Handoff

- **Customer responsibility / parent:** save the reviewed set safely and open the correct portfolio / Portfolio Intake Agent foundation.
- **Inputs / outputs:** validated batch, stable import ID and current authenticated UID → one atomic save or actionable failure, then imported Discover context.
- **Tools / behavior:** strict Zod schema, Firebase `runTransaction`, owner-scoped Firestore rules and existing route parser; deterministic.
- **Human boundary:** explicit import/exclusion consent; no save during mapping and no automatic assessment after import.
- **Data/security boundary:** checks account before/during transaction, reads before writes, conflicts abort, exact payload retry is idempotent; server rules are final authority.
- **Delivery / tests:** Building next for production; 8 mocked persistence tests, 11 modal tests and 15 navigation tests pass. Emulator tests added for metadata isolation, real transaction retry and denied atomic batch; not run because Java is absent.
- **Limitations:** no offline durable queue, cross-device draft recovery or live persistence proof. Closing the preview loses retry identity; existing records are not overwritten by fresh imports.

## Verification

Final code checks: `npm run lint && npm run test:unit && npm run build` — **PASS**, 18 test files / **202 tests**. The complete suite was rerun after browser-discovered history/focus fixes and a final derived-summary boundary fix. The earlier 199-test broad run and intermediate focused runs were not treated as final-source proof.

`npm run test:firestore` — **BLOCKED**, exits before tests because no Java Runtime is available. Existing CI provisions Java; it must pass for this candidate before release. No emulator tests are claimed as passed.

Build: main JS 1,646.16 kB / 429.48 kB gzip. Existing large-chunk warning remains; no new dependencies were added. Expected synthetic permission/provider failures appear in negative-test output; tests pass and no uploaded real content was used.

| Requested test layer | Result | Evidence / qualification |
|---|---|---|
| Type/static checks | PASS | TypeScript no-emit check |
| Import parser unit tests | PASS | `portfolioIntake.test.ts` plus existing limits suite |
| Schema-mapping tests | PASS | Required, editable, ignored and duplicate mappings; UI association |
| Validation-boundary tests | PASS | Field types/enums/lengths, safe IDs, columns, expanded batch budget, non-finite numbers |
| Malformed CSV and JSON | PASS | Broken quotes, object shapes, duplicate keys, reserved/ambiguous headers, row mismatches |
| Maximum file size | PASS | Reject before read, encoded byte check, exact 5 MiB acceptance |
| Maximum record count | PASS | 200 accepted and 201 rejected for supported inputs |
| Prompt-injection / unsafe content | PASS | Inert cell values, later guardrail rejection, known-secret redaction, excluded raw/evaluation content |
| Safe rendering | PASS | Literal HTML/formulas; modal and existing rendering security tests |
| Component tests | PASS | 11 modal tests plus affected dashboard and existing UI suites |
| Keyboard/accessibility | PARTIAL | Labels, errors, focus return/wrap, browser focus visibility and error-summary focus checked; no full screen-reader/contrast audit |
| Navigation/context | PASS locally | 15 navigation tests; actual browser Back retains mapping; imported portfolio/DNA handoff |
| Authentication | PASS locally | Auth/workspace suites and intake account-switch/unauthenticated/stale async tests; no live sign-in proof |
| Firestore ownership rules | BLOCKED | Java unavailable; new real SDK/rule tests committed but not executed |
| Persistence/recovery integration | PARTIAL | 8 mocked transaction tests and synthetic failure→same-preview retry→handoff pass; real Firestore pending |
| Existing API contract/guardrails | PASS | 16 API + 23 guardrail tests; provider mocked, server unchanged |
| Production build | PASS | Client and server bundles built; large-chunk warning retained |
| Responsive browser review | PASS for reviewed surfaces | Desktop/tablet/390/320 px; Light/Dark and System source reviewed; full platform/theme matrix not certified |
| Bounded import performance | PASS locally | 200-record parse/map/preview below a generous 2-second unit threshold; not a slow-device/network or enterprise-scale benchmark |
| Live-service smoke | BLOCKED for this packet | No authorized deployment; no live identity, Firestore or Gemini verification performed |
| Rollback verification | PARTIAL | Reversible local patch checked and Packet 1 baseline retained; production traffic/database rollback not rehearsed |

### Browser observations and reproducible local review

Run `QA_SERVE_ONLY=1 QA_INTAKE=1 QA_PORT=5192 node scripts/qa/product-foundation.mjs` and open `http://127.0.0.1:5192/app/portfolio`. The top banner explicitly says synthetic data only, first save intentionally fails, retry succeeds in memory, reload clears imports and AI calls are disabled. Upload `tests/fixtures/intake-review.csv` through the file picker.

- Source → Map suggests five of six columns; one stays unmapped. Preview shows two valid records, one invalid and one formula-related warning. The import button requires explicit exclusion consent.
- First save fails deliberately without a success claim; the error receives focus and scrolls into view. Retrying the same preview completes and opens the imported portfolio with two synthetic workloads. The formula displays as literal text.
- Browser Back from Preview returns to Map with selections intact. A listener-lifetime bug found in real-browser testing was fixed and a parent-rerender/history regression test added.
- Desktop mapping at 1,440 CSS px: dialog client/scroll width 894/894. Tablet at 768: 744/744. Mobile at 390: 361/361. Narrow at 320: 290/290 in final Light error check; document width 314, below viewport. No horizontal overflow in reviewed intake/portfolio states.
- Dark narrow mapping and 390 px preview, Light desktop/tablet/narrow error, and System source were visually reviewed. Focus wrapping was strengthened after browser Tab testing. Screenshots were inspected inline, not archived as submission evidence. Viewport override reset after review; no browser console errors observed in the final checked state.
- This fixture is deliberately not production persistence, authorization or AI evidence. Reload clears its in-memory imports. The ordinary app still requires real sign-in and released compatible Firestore rules.

## Hackathon and release decision

The [release scorecard](../docs/product/HACKATHON_RELEASE_SCORECARD.md) records each requirement's status, evidence, regression risk, remediation and release readiness: **4 PASS at explicitly local/synthetic boundaries, 8 PARTIAL, 0 FAIL**. No official scoring weights or winning prediction are invented. More implementation evidence does not automatically make an incomplete submission compliant.

Remaining gates: Java/Firestore emulator and candidate CI; real authenticated save/retry/reload/isolation and multi-turn AI smoke; exact deployment/Secret Manager evidence; prior healthy Cloud Run revision and tested rollback; sanitized AI Studio constitution and enhancement authorship evidence; final demo/submission checks. Historical cloud/Studio evidence is dated 14 September, not treated as current candidate verification.

## Rollback and release compatibility

- Local baseline is Packet 1 commit `973f2405f0d9ed48cabaec685054708f84bb1974`. The staged patch is checked with `git diff --cached --binary | git apply --reverse --check` before commit; this is a non-mutating reversibility check, not an actual rollback rehearsal.
- To undo this packet later, inspect status and use a reviewed `git revert emos-packet-2-safe-intake-20260920`. Do not hard-reset or remove unrelated work. Do not run rollback during this packet.
- Old Firestore rules reject the new `importMetadata` field. Before any separately authorized release, pass rules tests, deploy compatible rules, then deploy the app and verify synthetic authenticated imports against the exact revision.
- The new rules still accept earlier records without metadata. Do not blindly restore older restrictive rules after new-format records exist: review old-client updates and rule/data compatibility first. No data migration or deletion has been executed.
- Cloud Run prior-revision traffic rollback and database/config compatibility are unverified. A Git checkpoint alone is not an operational rollback option for production.

## Files and scope

- Intake UI/handoff: `ImportPortfolioModal.tsx`, `Dashboard.tsx`, `SamplePortfolioView.tsx`.
- Data boundary: `portfolioImporter.ts`, extracted `workloadNormalizer.ts`, new `portfolioPersistence.ts`, Firebase wrapper, workload types and bounded optional Firestore metadata rules.
- Two malformed quoted-comma fields corrected in shipped synthetic CSV samples so stricter parsing accepts all examples.
- New parser/persistence/modal suites, extended navigation and emulator suites, and an isolated synthetic QA entry/backend/CSV. QA runner can select this fixture; it is not imported into the production app entry.
- Updated implementation state, UX boundary, scorecard and this result. No dependency/lockfile changes. No production config changes.

**Higgsfield: NOT AFFECTED / not required for Packet 2.** None of the four approved media assets changed; the visual asset registry is unchanged. Higgsfield remains planned for stabilized website visuals and demo media in packets 8/9, with real product captures for functional behavior.

**Next:** Packet 3 — Enterprise DNA and evidence, after scope confirmation. This packet does not implement assessment/economic comparison, governance, target state, website/video refresh or autonomous agent orchestration.
