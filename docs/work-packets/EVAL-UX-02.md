# EVAL-UX-02 — Readiness and Trust Follow-Through

## Document control

| Field | Value |
|---|---|
| Slice ID | EVAL-UX-02 |
| Name | Make readiness behavior observable and complete the evaluator handoff |
| Program / feature | Buyer and end-user evaluation experience |
| Owner | Jincen E Mathew |
| Status | Ready for preview |
| Target release | Beta v1.0 follow-through |
| Authorities | EMOS product rules, existing public-beta boundaries, prior `BUYER-END-USER-EXPERIENCE` packet |

## Objective and business value

Let a public evaluator change synthetic evidence, observe the real deterministic readiness rule, inspect the conformance evidence, and continue into their authenticated portfolio without a dead-end handoff. This turns the central product claim from copy into observable behavior while preserving an honest distinction between rule conformance and real-world decision accuracy.

## Scope

### Included

- Add a staged synthetic evidence exercise that demonstrates 61% → 67% → 78% → 89%, with `READY` appearing only after the threshold and every critical gap are satisfied.
- Make the 70% threshold's necessary-but-not-sufficient rule explicit throughout the public evaluation journey.
- Complete Google sign-in handoff from the sandbox with progress, safe error handling, and navigation to the authenticated portfolio.
- Publish the existing readiness conformance cases and source link in the Trust experience without claiming decision accuracy.
- Export the current evidence gaps as a portable CSV action list with blank owner, source, and due-date fields.
- Correct verified content inconsistencies in founder experience, application-count grammar, sample-portfolio description, and section numbering.
- Extend the design-partner protocol with blind partner labels, parallel ARB recruitment, five repeatable moderated sessions, and explicit separation of conformance from accuracy.
- Add focused regression tests and a completion report.

### Explicit exclusions

- No claim of real-world readiness accuracy before independent architects label representative workloads.
- No actual recruitment, moderated sessions, ARB review, customer evidence, or willingness-to-pay result; those require external participants.
- No arbitrary ServiceNow, LeanIX, or spreadsheet field-mapping engine in this packet.
- No native PDF/PPTX dependency or production/security certification claim.
- No unverified statement about Gemini retention, training treatment, logging, or processing region.
- No OAuth consent-screen branding change; that is an external Google configuration action.
- No new decision-readiness enum beyond `READY` and `NEEDS EVIDENCE`.

## Dependencies and readiness

- Existing public sandbox, deterministic readiness evaluator, Google authentication, Trust page, sample portfolio, and unit tests.
- Synthetic Apex Aerospace evidence only.
- Existing Google Sign In remains the authenticated-product boundary.

## Expected change set

| File or boundary | Reason |
|---|---|
| `src/components/PublicSandboxPage.tsx` | Interactive evidence ladder, evidence export, and authenticated handoff |
| `src/components/TrustCenterPage.tsx` | Public conformance evidence and verified open controls |
| `src/config/productFacts.ts` | Correct centralized founder fact |
| `src/components/LandingPage.tsx` | Correct section numbering and application-count grammar |
| `src/components/SamplePortfolioView.tsx` | Align portfolio description with displayed workloads |
| `src/lib/readiness.ts` | Reusable immutable evidence-stage helper |
| `src/lib/sampleDecisionBrief.ts` | Portable evidence-action CSV |
| `tests/*` | Protect readiness transitions, handoff, disclosure and content consistency |
| `docs/design-partner-session-protocol.md` | Independent-labelling, ARB and moderated-session method |
| `work_results/EVAL-UX-02-result.md` | Completion evidence |

## Acceptance criteria

1. Given the initial Apex scenario, the sandbox reports 61% and `NEEDS EVIDENCE`.
2. Adding only the TCO baseline produces 67% and remains blocked.
3. Adding target-platform and architecture evidence produces 78% and remains blocked because critical dependency and downtime evidence are unresolved.
4. Resolving the remaining critical evidence produces 89% and `READY`.
5. Every readiness surface states that 70% is necessary but not sufficient.
6. Successful sandbox sign-in navigates to the authenticated product; pending and failure states are visible and safe.
7. The Trust page reports the committed conformance cases and clearly says they are not proof of real-world decision accuracy.
8. Evidence gaps can leave the sandbox in a CSV containing gap, status, owner, evidence source, and due date columns.
9. Existing public and authenticated happy paths remain intact.

## Validation plan

- Focused Vitest suites for public routes, readiness, authentication, decision artifacts, and content facts.
- Full TypeScript lint, unit/contract suite, and production build.
- Browser verification of the sandbox transitions and successful authenticated handoff.
- Review all new disclosure copy for overclaiming and synthetic-data boundaries.
- Run `git diff --check` and validate the final branch without unrelated changes.

## Risks and rollback

| Risk | Mitigation | Rollback signal/action |
|---|---|---|
| Interactive evidence is mistaken for customer evidence | Label every injected fact synthetic and evaluation-only | Remove the evidence controls if the boundary is not clear |
| Sign-in redirect loops on mobile | Use a bounded session handoff flag and clear it after consumption | Revert to existing sign-in behavior and preserve public sandbox access |
| Conformance results are mistaken for accuracy | State the distinction next to the results and source | Remove aggregate claims; retain only source-linked cases |
| New controls increase density | Keep the exercise within the existing Evidence panel and preserve reduced motion | Revert the panel while keeping the corrected copy |

## Definition of done

- [x] Acceptance criteria pass.
- [ ] Security, reliability, accessibility and regression checks pass. Unit and contract checks pass; the unchanged Firestore rule suite could not start because Java is unavailable on the host.
- [x] No real customer data or unverified provider claims are introduced.
- [x] Completion report exists in `work_results/`.
- [x] The exact diff is previewed before push.
- [x] No unrelated file is included.
