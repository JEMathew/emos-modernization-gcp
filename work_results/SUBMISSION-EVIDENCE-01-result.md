# SUBMISSION-EVIDENCE-01 Completion Report

## Outcome

The Ideathon evidence pack maps every challenge requirement to product behavior, source and verification evidence. During the 14 September 2026 release audit, the EMOS Google AI Studio Custom Instructions field was found empty; the canonical security constitution was then applied, saved, reopened and confirmed to match the checked-in 4,654-character source exactly.

The same audit verified the active Cloud Run service, required campaign label, deployed Secret Manager reference and the dedicated runtime account's secret-level accessor role without viewing the secret value. It also found a redundant secret-level accessor grant on the unused default compute account; removal, the new deployed commit, CI and live per-user isolation checks remain explicitly pending.

## Files changed

- `README.md`
- `docs/AI_STUDIO_SECURITY_CONSTITUTION.md`
- `docs/EVIDENCE_INDEX.md`
- `docs/IDEATHON_DELIVERABLES.md`
- `docs/work-packets/SUBMISSION-EVIDENCE-01.md`
- `tests/documentation.contract.test.ts`
- `work_results/SUBMISSION-EVIDENCE-01-result.md`

The branch also contains the previously completed `EVAL-UX-02` product and buyer-experience changes described in `work_results/EVAL-UX-02-result.md`.

## Commands run

- `npm run lint`
- `npm run test:unit`
- `npm run build`
- `git diff --check`
- local HTTP and browser preview checks against `http://127.0.0.1:3000/`

## Tests and results

- TypeScript: passed.
- Unit, API contract, security, documentation and UI suites: **106/106 passed** across 11 files after `ERROR-UX-03`.
- Production build: passed.
- Diff whitespace validation: passed.
- Local preview: returned HTTP 200; home and public sandbox loaded successfully.
- Firestore rules suite: not rerun locally because Java is unavailable on this Mac. The suite remains part of the GitHub Actions release gate, which installs Java 21.

An initial documentation-contract run exposed two overly literal assertions. The assertions were corrected to test the actual security and dated-result guarantees, after which the full suite passed.

## Acceptance criteria met

- [x] Every challenge requirement maps to behavior, source and verification evidence.
- [x] The canonical AI Studio instructions cover threat boundaries, authentication, owner isolation, secret handling, untrusted AI input/output and release gates.
- [x] Secret Manager-compatible application code is distinguished from deployed binding proof.
- [x] A two-minute judge path covers the core requirements and the original EMOS feature.
- [x] Stale permanent test-count claims are removed and protected by a documentation contract.
- [x] Missing external evidence is labelled pending.
- [x] Google AI Studio Custom Instructions were applied, saved and reopened without exposing credentials.
- [x] The deployed Cloud Run `secretKeyRef` and `dev-tutorial=cloud-run-ai-challenge` label were externally verified.

## Known issues and pending external evidence

- A durable, sanitized Google AI Studio screenshot that visibly includes the EMOS workspace name still needs to be retained for the submission artifact.
- The unused default compute account's redundant secret-level accessor grant should be removed; the active Cloud Run revision already uses the dedicated EMOS runtime account.
- GitHub Actions, the Firestore emulator suite and the exact deployed commit must be verified after push.
- Live Google Sign-In, owner-scoped persistence and the post-auth return path must be smoke-tested on the published candidate.
- The production bundle still emits Vite's existing large-chunk warning; it does not fail the build.

## Preview steps

1. Open `http://127.0.0.1:3000/` to review the current candidate.
2. Select **Explore Without Sign-In**.
3. Open **Evidence** and step through 61% → 67% → 78% → 89%.
4. Confirm 78% remains `NEEDS EVIDENCE` while critical gaps are open, and 89% becomes `READY` only after they close.
5. Review **Trust and Evaluation** for the authored conformance-suite boundary and external-validation plan.
6. Review `docs/IDEATHON_DELIVERABLES.md` for the judge path and deployment evidence checklist.

## Release decision

**Approved by the user for commit, push and production deployment on 14 September 2026; release verification is in progress.**
