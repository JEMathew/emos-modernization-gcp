# Hackathon Compliance Audit — 10 September 2026

## Authority

Audited against the official Google Codelab, **Build a User-Authenticated AI
Application with Custom Instructions on Google AI Studio & Cloud Run**:

`https://codelabs.developers.google.com/codelabs/cloud-run/cloud-run-ai-challenge?hl=en`

The official requirements are Firebase authentication, multi-turn Gemini,
user-isolated Firestore storage, secure API-key retrieval through Secret Manager,
unique enhancement beyond the starter, Cloud Run publication and campaign
labeling, public/shared source with deployment documentation, and the final form
plus social/blog showcase. Evaluation criteria are authenticity, usability,
stability, and security.

## Requirement status

| Requirement | Status | Evidence / remaining action |
|---|---|---|
| Google AI Studio custom security instructions | Pending external evidence | Constitution is checked in and recorded as configured; capture a sanitized AI Studio screenshot. |
| Firebase Google Sign-In | Pass in code and tests | Desktop popup, mobile redirect, authenticated API token verification, and profile synchronization are covered. Recheck after final deployment. |
| Multi-turn Gemini interaction | Pass in code and tests | Follow-up contract, bounded history, schema validation, failure behavior, persistence, and metric immutability are covered. |
| Owner-isolated Firestore | Pass on current `main`; final-candidate CI pending | Deny-by-default rules and emulator tests exist. GitHub release gate for `main` commit `19a4ab8` passed. Run the same gate after this UI packet is pushed. |
| Gemini secret handling | Pass in application boundary; pending Cloud evidence | Server-only `GEMINI_API_KEY`, fail-closed behavior, secret redaction, and non-secret health response are verified. Capture Cloud Run `secretKeyRef` and runtime-service-account `secretAccessor` evidence. |
| Unique feature beyond starter | Pass | EMOS provides portfolio discovery, Enterprise DNA, deterministic completeness/readiness, canonical 6R reasoning, evidence plans, wave planning, and executive artifacts. |
| Cloud Run live deployment / walkthrough | Pass for reachability | `https://emos-modernization.ai.studio/` returned HTTP 200 on 10 September 2026 and `/api/health` returned `status: ok`. Deploy and record the final candidate commit. |
| Required Cloud Run campaign label | Pending verification | Verify `dev-tutorial=cloud-run-ai-challenge` on the deployed service and capture non-secret evidence. |
| Public source and deployment README | Pass | Repository is public and README contains setup, security, Firestore, Secret Manager, Cloud Run, and campaign-label instructions. |
| Functional walkthrough coverage | Pass in repository | Written evaluator scenarios plus automated unit, API, security, and UI tests are present. |
| Social post / implementation write-up | Pending owner action | Publish with `#AccelerateAIwithCloudRun`; highlight EMOS originality and Google AI Studio usage. |
| Official submission form | Pending owner action | Submit email, Cloud Run project/service name, social/blog link, and repository link. |

## Validation performed

- Focused public/UI suite: 17/17 passed.
- Full unit/API/security/UI suite: 121/121 passed.
- TypeScript: passed.
- Production build: passed.
- Production dependency audit: 0 vulnerabilities.
- Credential-pattern scan: no private-key pattern found. The only tracked
  credential-like match is Firebase's browser configuration key in
  `firebase-applet-config.json`, which is public Firebase client configuration;
  authorization remains enforced by Firebase Auth, server token verification,
  and Firestore rules.
- GitHub repository visibility: public.
- Latest GitHub `main` guardrail gate: passed for commit `19a4ab8`.
- Live endpoint: HTTP 200; health endpoint reports Gemini configured without
  returning the key.
- Authenticated desktop QA at 1736 × 966: exactly one **New Assessment** button,
  no sidebar duplicate, and visible sign-out action.
- Authenticated narrow-layout QA at 741 × 966: final navigation remains usable,
  the sign-out action remains visible, and the decision header omits nonessential
  creation time while History retains assessment dates for traceability.

## Internal judging scorecard

The official criteria are qualitative and do not publish numeric weights. For drift control, this internal score uses an equal 25-point allocation per criterion and scores only evidence available as of this audit.

| Criterion | Score | Rationale / remaining risk |
|---|---:|---|
| Authenticity | 24/25 | The enterprise modernization scenario, Enterprise DNA, deterministic scoring, governed 6R decisions, planning, and executive artifact are materially distinct from the starter. The final showcase still needs to make the originality explicit. |
| Usability | 23/25 | The authenticated journey now uses one stage vocabulary, consistent responsive navigation, one governed assessment path, summary-first history, progressive evidence disclosure, and contextual follow-ups. Final deployed-path validation and an updated video remain open. |
| Stability | 22/25 | Unit, API, security, UI, build, deterministic fallback, and error-path coverage are strong. The final candidate still needs green CI, emulator evidence, and one live end-to-end recheck after deployment. |
| Security | 21/25 | Firebase auth, owner-bound rules, server token verification, secret redaction, CSP, and dependency audit are strong. Secret Manager/IAM and deployed campaign-label evidence remain externally unverified. |
| **Product subtotal** | **90/100** | Strong submission candidate with no current product-scope drift. |

Submission completeness is lower than the product score because the social/blog post, final form, sanitized AI Studio evidence, deployed secret/IAM proof, campaign label, and final-candidate push/CI/deployment record remain open. The candidate is committed locally, but this machine currently lacks usable GitHub release authentication and the Google Cloud CLI. Treat **90/100** as an internal readiness indicator, not a predicted judge score.

## Release conclusion

The implementation satisfies the code-facing challenge requirements and scores
strongly against authenticity, usability, stability, and security. It is not yet
submission-complete. Do not claim full compliance until the UI packet is
committed, pushed, deployed, and green in CI, and the remaining external evidence
and owner actions are closed: AI Studio screenshot, Cloud Run secret/IAM evidence,
campaign-label verification, social post, and official form submission.
