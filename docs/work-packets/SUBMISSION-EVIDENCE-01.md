# SUBMISSION-EVIDENCE-01 — Ideathon Security and Delivery Evidence

## Document control

| Field | Value |
|---|---|
| Slice ID | SUBMISSION-EVIDENCE-01 |
| Name | Make every Ideathon requirement directly verifiable |
| Program / feature | Personal Gemini Journal Ideathon submission evidence |
| Owner | Jincen E Mathew |
| Status | Ready for preview |
| Dependency | EVAL-UX-02 readiness and trust follow-through |

## Objective and business value

Give an evaluator a short, evidence-backed path from each challenge requirement to the shipped behavior, source, automated verification and deployment proof. Preserve a strict distinction between implemented controls, locally tested controls and externally verified deployment configuration.

## Included

- Check in the canonical Google AI Studio security constitution used for the build.
- Add a requirement-to-evidence matrix and a two-minute judge path.
- Replace stale verification counts with links to dated work results and CI.
- Document the exact sanitized evidence required for AI Studio configuration, Cloud Run Secret Manager binding and service-account access.
- Link the evidence pack prominently from the repository README.
- Validate documentation links, TypeScript, tests and the production build.

## Excluded

- No fabricated screenshot or claim that a Google AI Studio setting has been applied before it is visibly verified.
- No secret value, ID token, credential, private portfolio or unrestricted cloud configuration output.
- No new landing-page sections or challenge-specific marketing inside the buyer journey.
- No deployment, merge or publication before preview approval.
- No claim of formal penetration testing, certification or real-world decision accuracy.

## Acceptance criteria

1. Every challenge requirement maps to behavior, source and verification evidence.
2. The canonical AI Studio instructions cover threat modelling, authentication, owner isolation, secret handling, untrusted AI input/output and release gates.
3. The repository distinguishes Secret Manager-compatible application code from proof of the deployed secret binding.
4. The judge can evaluate the core requirements and original feature in about two minutes.
5. Test-count claims do not silently become stale.
6. Missing external evidence is labelled pending instead of implied complete.

## Validation

- Inspect all documentation links and referenced source paths.
- Run `npm run lint`, `npm run test:unit`, `npm run build` and `git diff --check`.
- Run the Firestore emulator suite in GitHub Actions after push.
- Verify Google AI Studio and Cloud Run evidence after publication without recording secret values.

## Definition of done

- [x] Pre-deployment evidence pack is complete and ready for review.
- [ ] AI Studio configuration evidence is captured safely.
- [ ] Secret Manager deployment evidence is captured safely.
- [ ] GitHub Actions release gate is green for the exact commit.
- [ ] The published URL resolves to the exact verified commit.
- [x] Completion report is added to `work_results/`.
