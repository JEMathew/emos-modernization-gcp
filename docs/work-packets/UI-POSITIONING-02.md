# UI-POSITIONING-02 — Full-Lifecycle Landing Positioning

## Document control

| Field | Value |
|---|---|
| Slice ID | UI-POSITIONING-02 |
| Name | Clarify the EMOS beta foundation and full-lifecycle vision |
| Program / feature | Buyer and end-user evaluation experience |
| Owner | Jincen E Mathew |
| Status | Implemented, uncommitted |
| Target release | Beta v1.0 follow-through; release assignment unmodified |
| Authorities | Product Constitution; UI-CLARITY-01; current public-beta boundaries; user approval dated 2026-09-10 |

## Objective and business value

Make it immediately clear that EMOS is designed for the entire enterprise
modernization journey while stating only shipped beta capabilities in present
tense. Preserve the established menu-based experience, typography, labels and
primary actions so existing users retain orientation.

## Scope

### Included

- Add the reviewed canonical messaging source to the release repository.
- Set the founder-experience fact to `15+` everywhere through the existing fact constant.
- Refine the landing hero around the full-lifecycle purpose and current beta boundary.
- Keep the existing desktop and mobile menu experience and hash-addressable sections.
- Correct the lifecycle presentation so current planning and mobilization are not described as future-only capabilities.
- Present all six canonical 6R dispositions once in the existing Why EMOS view.
- Add concise customer questions and answers using visible, defensible language.
- Consolidate metadata and add accurate organization/web-application structured data.
- Add focused regression coverage and a completion report.

### Explicit exclusions

- No assessment, evidence, 6R scoring, readiness, plan, import or export behavior change.
- No authentication, authorization, Firestore, secret, API or deployment change.
- No claim that EMOS executes migrations, supports multiple AI providers today, or measures realized outcomes today.
- No competitor exclusivity claim.
- No new dependency or architecture decision.
- Preserve the existing untracked release-candidate QA report.

## Dependencies and readiness

- Predecessor slices: UI-CLARITY-01 and 6R-01-UX-JOURNEY behavior already deployed.
- Required decisions/contracts: canonical six dispositions; deterministic evidence readiness; current public-beta capability boundary.
- Existing behavior baseline: React landing page, menu-selected hash views, responsive navigation, public sandbox and Product Tour.
- Data/configuration prerequisites: synthetic reference data only; no new configuration.

## Expected change set

| File or boundary | Reason |
|---|---|
| `claude/messaging-source.md` | Canonical positioning, facts and language controls |
| `src/config/productFacts.ts` | Authoritative founder-experience fact and lifecycle display groups |
| `src/components/LandingPage.tsx` | Refined hero, lifecycle boundary and visible customer answers |
| `src/App.tsx` | Keep the runtime document title aligned with landing metadata |
| `index.html` | Search metadata and accurate structured data |
| `README.md` | Align the repository introduction and link the canonical source |
| `tests/public.routes.test.tsx` | Public positioning, navigation and claim-boundary regression |
| `tests/documentation.contract.test.ts` | Canonical-source and metadata contract regression |
| `work_results/UI-POSITIONING-02-result.md` | Completion evidence |

Files outside this set must not change. The existing untracked
`work_results/RELEASE-CANDIDATE-FUNCTIONAL-QA-2026-09-10.md` is unrelated and
must not be staged.

## Acceptance criteria

1. The first screen states the full-lifecycle EMOS purpose and marks the beta foundation in shipped language.
2. The page does not state or imply that the beta executes migrations, measures realized outcomes, or supports interchangeable AI providers today.
3. Desktop and mobile menu labels, Product Tour, authentication actions and hash-addressable views remain functional.
4. The Vision view distinguishes Available in Beta, Building Next and Product Vision with planning and mobilization correctly represented as available.
5. All six canonical dispositions are represented once with equal consideration.
6. Founder experience renders as `15+` everywhere.
7. Visible customer answers are concise, self-contained and free of unsupported competitor exclusivity claims.
8. Metadata has one description and structured data matches visible claims.
9. Focused tests, full unit tests, type checking, production build and whitespace validation pass.

## Validation plan

- Unit/contract tests: focused `tests/public.routes.test.tsx`, then full Vitest suite.
- Integration/BDD scenarios: open each desktop/mobile menu destination and verify hash-selected content.
- Browser/accessibility/responsive regression: desktop and narrow viewport smoke checks; native headings, links and details controls.
- Security checks: verify no secret, identity, persistence or CSP boundary changed; `npm audit --omit=dev --audit-level=high`.
- Reliability/fault checks: authentication error and public-route behavior remain covered by the full suite.
- Performance budget: production build completes; record existing bundle warning if unchanged.
- Clean-checkout validation: `git diff --check`; selective staging excludes unrelated QA evidence.

## Risks and rollback

| Risk | Mitigation | Rollback signal/action |
|---|---|---|
| Vision wording is mistaken for shipped execution | Explicit Beta Today and Product Vision markers; prohibited-language tests | Revert the content commit |
| Landing page becomes text-heavy | Preserve menu-selected views and use concise answers/details | Remove the new answer block |
| SEO markup diverges from visible content | Generate only static facts already visible on the page | Remove the JSON-LD block |

## Definition of Done

- [x] Scope and exclusions satisfied.
- [x] Acceptance and BDD scenarios pass.
- [x] Security, reliability and regression evidence passes.
- [x] Documentation is current; no ADR or release-registry change is required.
- [x] Completion report exists in `work_results/`.
- [ ] Exact commit is pushed and CI status is recorded.
- [x] No unrelated file is included.
