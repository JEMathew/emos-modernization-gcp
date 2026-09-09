# FOLLOWUP-CONTRACT-01 Completion Report

## Outcome

Implemented the discriminated union API contract and state protection for multi-turn modernization follow-ups. Initial assessments and subsequent conversational follow-ups are strictly differentiated, follow-up mode is determined server-side from conversation history, follow-up prose cannot mutate canonical assessment metrics, and both turns persist and reload under the authenticated owner.

## Files changed

- `server.ts` — Server-selected follow-up routing from the validated history contract, bounded history packaging with untrusted fences, discriminated `follow_up` responses, platform-aware host/port binding, and narrowly scoped AI Studio preview framing.
- `src/lib/schemas.ts` — Defined `assessmentResponseSchema`, `followUpResponseSchema`, and discriminated union `chatResponseSchema`.
- `src/lib/gemini.ts` — Updated `sendChatMessage` to handle both initial assessments and conversational follow-ups.
- `src/components/Dashboard.tsx` — Enforced assessment state immutability during follow-up updates (writing strictly to `turns`), handled differentiated response types and guardrail error classification.
- `src/components/ReflectionWorkspace.tsx` — Added guardrail rejection error state, refined error messages, and preserved retry behavior for persistence-only failures.
- `docs/AI_STUDIO_SECURITY_CONSTITUTION.md` — Added multi-turn response contracts, server-side mode determination, and assessment immutability mandates.
- `tests/api.chat.contract.test.ts` — Added contract tests for follow-up response formatting, bounded history, context retention, metric forgery rejection, secret scrubbing, and guardrail fail-closed behavior.
- `tests/firestore.rules.test.ts` — Added persistence and owner-isolation test for multi-turn conversation turns.
- `tests/rendering.security.test.tsx` — Added tests for guardrail error rendering and multi-turn conversation rendering alongside preserved canonical metrics.
- `docs/work-packets/FOLLOWUP-CONTRACT-01.md` — Work packet definition and acceptance criteria.
- `work_results/FOLLOWUP-CONTRACT-01-result.md` — Completion report.

## Commands and verification

- `npm run lint` — **Passed** (`tsc --noEmit` exited 0).
- `npm run test:unit` — **114/114 passed** across 11 test suites.
- `npm run build` — **Passed** (Vite client build and esbuild server bundle succeeded).
- `git diff --check` — **Passed** (no trailing whitespace or conflict markers).
- `npm audit --omit=dev` — **Passed** (zero known production dependency vulnerabilities).
- Authenticated AI Studio preview — **Passed** with real Gemini: three contextual follow-ups returned successfully, six turns persisted and reloaded from Firestore, and `REFACTOR`, `65%` confidence, `61%` evidence completeness, and `NEEDS EVIDENCE` remained unchanged after an attempted conversational override.

## Acceptance criteria checklist

- [x] **Server-side mode determination**: Selected from the validated non-empty `history` array in `server.ts`; client-supplied mode and authorization flags are not trusted. The history remains untrusted request data and is fenced accordingly.
- [x] **Parser isolation**: Concise follow-ups bypass `parseModelAssessment` and return `ChatFollowUpResponse` with `type: 'follow_up'` and no `attributes`.
- [x] **Assessment metric immutability**: Follow-up handling in `Dashboard.tsx` writes only to `turns`, leaving `recommended6R`, `confidenceScore`, `evidenceCompleteness`, and `decisionReadiness` untouched.
- [x] **Persistence under owner**: Conversation turns persist to `/users/{userId}/interactions/{interactionId}` under verified Firebase Auth ID token.
- [x] **Turn reloading**: Persisted turns load into `ReflectionWorkspace` and render within the assessment dialogue thread when the workload is reopened.
- [x] **Bounded context retention**: `boundedHistory` keeps the initial question and assessment plus up to 8 recent turns (10 items total), preserving full context for the second and subsequent follow-ups.
- [x] **Strict initial assessment validation**: Initial assessments continue full 6R taxonomy parsing, secret scrubbing, and deterministic score reconciliation.
- [x] **Distinct error states**: Separate handling and UX for reasoning availability (`503`), guardrail rejection (`502`), and Firestore persistence failures.

## Known limitations or untested behavior

1. **Local Gemini API key absence**: In local dev/test environments without `GEMINI_API_KEY` configured in the runtime, Gemini calls fail closed with `503 AI_REASONING_UNAVAILABLE`. Contract tests use injected mock generators; the authenticated AI Studio preview separately verified real multi-turn Gemini behavior with its server-side secret.
2. **Firestore emulator execution**: The `test:firestore` script requires Java for the local Firebase emulator binary (`Could not spawn java -version`). Security rules logic is covered by the Firestore rule specification and rules unit test definitions.
3. **Bundle size notice**: Standard Vite output note regarding vendor bundle chunks exceeding 500 kB remains as in previous builds.

## Release decision

Validated and ready for commit and pull request on `fix/follow-up-response-contract`. No push, merge, or production publication performed.
