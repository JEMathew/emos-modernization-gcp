# EMOS Ideathon Deliverables and Evidence Pack

## Submission position

The challenge permits a product other than a journal. EMOS is a substantially expanded implementation: an authenticated, multi-turn Gemini application whose original feature is evidence-governed, vendor-neutral enterprise modernization decision support.

This document separates four evidence states:

- **Implemented** — behavior exists in the repository.
- **Tested** — an automated check exercises the control.
- **Deployed** — the behavior is available in the published application.
- **Externally verified** — deployment configuration or independent evidence has been inspected for the exact commit.

Do not treat one state as proof of another.

## Requirement-to-evidence matrix

| Challenge requirement | Status before final publication | Product behavior | Source | Verification |
|---|---|---|---|---|
| Google AI Studio security directives | Configured and externally verified on 14 September 2026; durable submission screenshot pending | The build constitution covers threat modelling, authentication, Firestore isolation, secret handling, untrusted content and release gates | [`AI_STUDIO_SECURITY_CONSTITUTION.md`](AI_STUDIO_SECURITY_CONSTITUTION.md) | Saved text was reopened and matched to the canonical 4,654-character source; retain a sanitized Studio screenshot for submission |
| Firebase authentication | Implemented and locally tested | Google Sign-In; protected APIs verify the Firebase ID token; popup and mobile redirect paths are supported | `src/lib/firebase.ts`, `src/lib/gemini.ts`, `server.ts`, `src/App.tsx` | `tests/auth.android.test.ts`, `tests/api.chat.contract.test.ts`, `tests/public.routes.test.tsx` |
| Multi-turn Gemini interaction | Implemented and locally tested | Follow-up turns preserve bounded conversation context, call Gemini through the authenticated server and persist the updated thread | `src/components/Dashboard.tsx`, `src/lib/gemini.ts`, `server.ts` | API contract, schema and rendering suites |
| Isolated Cloud Firestore storage | Implemented; rules suite awaits CI rerun for this commit | User profiles, assessment threads, imported workloads and program alignment use owner-scoped paths and deny unmatched access | `firestore.rules`, `src/lib/firebase.ts` | `tests/firestore.rules.test.ts`; GitHub Actions release gate |
| Google Cloud Secret Manager | Implemented and externally verified on 14 September 2026, including least-privilege cleanup | Browser code receives no Gemini key; server reads `GEMINI_API_KEY` from the runtime; Cloud Run injects it from Secret Manager | `server.ts`, `README.md` | Service `gemini-reflection-journal` maps `GEMINI_API_KEY` to `emos-gemini-api-key`; the dedicated EMOS runtime retains `Secret Manager Secret Accessor`, and the redundant secret-level grant to the default compute account was removed |
| Original feature enhancement | Implemented and locally tested | Enterprise DNA, deterministic completeness, canonical 6R reasoning, vendor neutrality, critical-gap readiness, evidence plans, wave planning and executive artifacts | `src/lib/readiness.ts`, `src/lib/guardrails.ts`, `src/lib/wavePlanner.ts`, `src/components/PublicSandboxPage.tsx` | Readiness, guardrail, wave-planning and public-route suites |

## Two-minute judge path

1. **0:00–0:15 — Establish the product.** Open the [live application](https://emos-modernization.ai.studio/) and select **Explore Without Sign-In**.
2. **0:15–0:45 — Demonstrate the original mechanism.** In **Evidence**, select **Define Target Strategy**. Observe 78% completeness and confirm that the decision remains `NEEDS EVIDENCE` because critical dependency and downtime evidence is unresolved.
3. **0:45–1:00 — Close the gate correctly.** Select **Close Critical Gaps**, then **Decision Gate**. Observe 89% and `READY`, explicitly qualified as ready for human review rather than automatically approved.
4. **1:00–1:20 — Show the user artifact.** Download the Executive Decision Brief or Evidence Plan. The latter carries unresolved gaps into owner, source and due-date columns.
5. **1:20–1:40 — Show Gemini and persistence.** Sign in with Google, run an assessment and ask a follow-up question. Reopen the saved thread from history.
6. **1:40–2:00 — Show security evidence.** Open **Trust and Evaluation**, inspect the conformance boundary, then use this matrix to locate authentication, Firestore and Secret Manager evidence.

## Safe deployment evidence checklist

Complete this section only after the exact candidate commit is published.

### Google AI Studio

- [x] Canonical Custom Instructions applied, saved and reopened in the EMOS workspace on 14 September 2026.
- [x] Reopened value matched the canonical 4,654-character source exactly.
- [ ] Durable sanitized Custom Instructions screenshot retained with the submission materials.
- [ ] Screenshot visibly corresponds to the EMOS workspace.
- [ ] Screenshot contains no credential or unrelated account information.

### Cloud Run and Secret Manager

- [ ] Record the deployed commit: `PENDING` until the current candidate is published.
- [x] Record the live service: `gemini-reflection-journal` in project `codev-0326`, region `asia-southeast1`, serving `https://emos-modernization.ai.studio/`; verified healthy on 14 September 2026.
- [x] Verify the Cloud Run environment entry shows `GEMINI_API_KEY` uses `valueFrom.secretKeyRef` with secret `emos-gemini-api-key`; verified from the deployed service YAML on 14 September 2026 without viewing the value.
- [x] Verify the dedicated runtime service account has `roles/secretmanager.secretAccessor`; confirmed at the secret level on 14 September 2026.
- [x] Remove the unnecessary secret-level `Secret Manager Secret Accessor` grant from the default compute service account; completed and refreshed in the permissions view on 14 September 2026.
- [x] Confirm `/api/health` does not return the key or other secret material; verified 14 September 2026.

### Firebase and CI

- [ ] GitHub Actions release gate is green for the deployed commit.
- [ ] Firestore emulator owner-isolation suite passes for that commit.
- [ ] Live Google Sign-In returns the user to the authenticated product.
- [ ] A saved assessment and follow-up remain visible only under the authenticated account used for the test.

### Public challenge submission

- [x] Public source repository is reachable at `https://github.com/JEMathew/emos-modernization-gcp`.
- [x] README documents the application, unique enhancements, Firestore rules, Secret Manager setup, Cloud Run deployment, and required campaign label.
- [x] Verify the deployed Cloud Run service has `dev-tutorial=cloud-run-ai-challenge`; confirmed from service YAML on 14 September 2026.
- [ ] Publish the required social-media post or implementation write-up with `#AccelerateAIwithCloudRun`, highlighting the unique feature and Google AI Studio usage.
- [ ] Submit the official form with email, Cloud Run project/service name, social/blog link, and repository link.

## Current verification snapshot

- TypeScript check: passed locally; see `work_results/EVAL-UX-02-result.md`.
- Unit, API contract and UI suites: passed locally; see the dated work result rather than relying on a permanent hardcoded count.
- Production build: passed locally.
- Production dependency audit: 0 vulnerabilities on 10 September 2026.
- Firestore rules: test suite is committed and release-gated in GitHub Actions; the current Mac lacks the Java runtime needed to rerun it locally.
- Public repository: verified reachable on 14 September 2026. The landing-page clarity changes require their own green CI run before publication.
- Deployment: live Cloud Run service, campaign label, Secret Manager `secretKeyRef`, dedicated runtime access and least-privilege cleanup are externally verified on 14 September 2026. The exact new deployed commit remains pending.

## Original-feature explanation

EMOS does not merely add a themed prompt to the journal specification. It uses Gemini for explainable reasoning while deterministic code controls evidence completeness and decision readiness. The public exercise demonstrates the central rule: crossing 70% is necessary but not sufficient, and a critical gap keeps a fluent AI recommendation from becoming decision-ready. This is a product-specific capability with an inspectable conformance boundary—not a cosmetic enhancement.
