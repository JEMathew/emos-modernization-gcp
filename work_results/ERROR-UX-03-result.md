# ERROR-UX-03 Completion Report

## Outcome

AI reasoning availability and Firestore persistence failures now have distinct, accurate user states. When the local Gemini connection is absent, EMOS preserves the draft, states that saved assessment data is unaffected and does not offer the unrelated **Retry Save** action.

## Files changed

- `server.ts`
- `src/components/Dashboard.tsx`
- `src/components/ReflectionWorkspace.tsx`
- `tests/api.chat.contract.test.ts`
- `tests/rendering.security.test.tsx`
- `docs/work-packets/ERROR-UX-03.md`
- `work_results/ERROR-UX-03-result.md`

## Commands and verification

- `npm run lint` — passed.
- `npm run test:unit` — **106/106 passed** across 11 files.
- `npm run build` — passed.
- `git diff --check` — passed.
- Authenticated Chrome preview with `GEMINI_API_KEY` intentionally absent — passed.

## Acceptance criteria

- [x] Missing Gemini configuration returns a safe `503` availability response.
- [x] AI failure copy states that saved assessment data is unaffected.
- [x] Firestore failures retain synchronization language.
- [x] **Retry Save** is hidden for reasoning failures and retained for persistence failures.
- [x] Failed follow-up text remains in the message box for resubmission.
- [x] Authentication, persisted history and deterministic assessment content remain available.
- [x] Availability copy wraps instead of being clipped at desktop widths.

## Known issues

- A real multi-turn Gemini response cannot be validated locally without a server-side key. It must be verified after deployment using the Secret Manager-backed runtime configuration.
- The production bundle retains the existing large-chunk warning.

## Preview steps

1. Open an existing assessment in the authenticated local product.
2. Submit a follow-up while the local Gemini secret remains absent.
3. Confirm the banner begins **AI reasoning unavailable**.
4. Confirm the message remains in the input and **Retry Save** is absent.

## Release decision

Ready for refreshed user preview. Not yet pushed or published.
