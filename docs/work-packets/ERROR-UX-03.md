# ERROR-UX-03 — Separate AI Availability From Persistence Failures

**Status:** Ready for preview

## Objective

Prevent an unavailable Gemini connection from being presented as a Firestore synchronization failure, while preserving the user's saved assessment and draft follow-up.

## Acceptance criteria

- Missing or unavailable Gemini configuration returns a safe, actionable availability response.
- AI failures state that persisted assessment data is unaffected.
- Firestore failures continue to use synchronization language.
- **Retry Save** appears only for persistence failures.
- Failed follow-up text remains available for resubmission.
- Authentication, owner isolation and guardrail behavior remain unchanged.

## Exclusions

- Do not place a Gemini API key in source control or browser code.
- Do not add a simulated AI response to the authenticated experience.
- Do not redesign the portfolio page in this packet.
- Do not push or publish before refreshed preview approval.

## Validation

- TypeScript check.
- Unit, API contract, security and UI suites.
- Production build.
- Browser verification with the local Gemini secret intentionally absent.
