# Cloud Run Buildpack Release Fix — 2026-09-10

## Objective

Make the validated EMOS release reproducibly buildable by Google Cloud Buildpacks using the repository's canonical npm lockfile.

## Acceptance criteria

- The repository exposes one package-manager lockfile: `package-lock.json`.
- Vite is declared once, as a development/build dependency.
- `npm ci`, TypeScript validation, unit/API/security/UI tests, the production build, and the production dependency audit pass.
- The GitHub Guardrail release gate, including Firestore emulator tests, passes before merge.
- No application behavior, scoring, authentication, persistence, or security-rule contract changes.

## Dependencies

- Node.js 20+
- npm and `package-lock.json`
- GitHub Actions Java 21 runtime for the Firestore emulator gate
- Google Cloud Buildpacks for the production image

## Exclusions

- No user-interface or product-flow changes
- No dependency upgrades
- No Cloud Run service, IAM, or application-runtime changes in this code packet

## Files changed

- `package.json`: removed the duplicate runtime Vite declaration.
- `package-lock.json`: refreshed the root dependency declaration.
- `bun.lock`: removed the stale secondary lockfile that caused Cloud Buildpacks to select Bun and fail its frozen-lock check.
- `work_results/CLOUD-RUN-BUILDPACK-RELEASE-2026-09-10.md`: recorded this packet.

## Commands run

- `npm install --package-lock-only --ignore-scripts`
- `npm ci`
- `npm test`
- `npm run lint`
- `npm run build`
- `npm audit --omit=dev`

## Test results

- Unit/API/security/UI: 121/121 passed locally.
- TypeScript: passed.
- Production build: passed.
- Production dependency audit: 0 vulnerabilities.
- Local Firestore emulator: not run because the host does not have Java installed; the GitHub Guardrail release gate installs Java 21 and remains the required release authority.

## Acceptance criteria met

- Local packaging, application tests, type-check, build, and production audit pass.
- Final acceptance is conditional on the GitHub Guardrail release gate passing after push.

## Known issues

- Vite reports the existing large-bundle advisory; this packet does not change bundle composition.

## Demo and release steps

1. Run `npm ci` and `npm run build` from a clean checkout.
2. Confirm the GitHub Guardrail release gate passes.
3. Build the merged commit with Google Cloud Buildpacks.
4. Deploy the immutable image as a no-traffic Cloud Run revision.
5. Verify the revision, Secret Manager reference, health endpoint, and user journey before routing production traffic.
