# EMOS UX Constitution

Status: approved working baseline for the MVP through Define Target State.

## Product promise

EMOS helps an enterprise move from strategic intent and incomplete estate data to evidence-backed modernization decisions, a governed plan, and an implementation-ready target state.

The current MVP ends at **Define Target State**. It does not claim to execute migrations.

## Experience principles

1. **One connected journey.** Every workspace shows where the user is in the modernization lifecycle, what evidence is available, and what the next governed action is.
2. **Evidence before recommendation.** Recommendations expose their supporting evidence, gaps, assumptions, economics, and confidence.
3. **Progressive disclosure.** Portfolio summaries lead to workload detail; workload detail leads to evidence, assessment, decision, plan, and target state.
4. **One primary action per view.** Secondary actions remain visually subordinate.
5. **Status is consistent everywhere.** Use only `Needs evidence`, `In review`, `Decision ready`, `Approved`, and `Blocked` unless a domain-specific state is required.
6. **Humans retain decision rights.** AI-assisted output is a draft or recommendation until an authorized user approves it.
7. **Customer language stays vendor-neutral.** Use `Governed AI assessment` in the product. Google and Gemini evidence belongs in technical architecture, trust, README, and hackathon submission materials.
8. **No decorative analytics.** Every number or chart must help the user decide, investigate, approve, or plan.
9. **Accessibility is part of the design.** Meet WCAG AA contrast, preserve keyboard order and visible focus, do not encode meaning by color alone, and respect reduced-motion preferences.
10. **Synthetic data is labelled.** Concept visuals and sandbox data must never appear to be a real customer's estate.

## Canonical MVP journey

`Align → Discover → Understand → Assess → Decide → Govern → Prioritize → Plan → Mobilize → Define Target State`

Product vision continues with:

`Execute → Validate → Transition → Measure Benefits → Learn → Reassess`

Mobilize is a governed handoff, not one of the canonical 15 lifecycle stages.

## Information architecture

| Workspace | Lifecycle coverage | Canonical route |
|---|---|---|
| Strategy & Portfolio | Align + Discover | `/app/portfolio` |
| Enterprise DNA | Understand | `/app/workloads/:id/dna` |
| Evidence & Economics | Understand + Assess | `/app/workloads/:id/evidence` |
| Assessment | Assess | `/app/workloads/:id/assessment` |
| Decisions & Governance | Decide + Govern | `/app/workloads/:id/decision` |
| Prioritization | Prioritize | `/app/portfolio/priorities` |
| Wave Plan & Mobilize | Plan + Mobilize | `/app/plan` |
| Target State | Define Target State | `/app/workloads/:id/target-state` |
| Decision history | Cross-cutting auditability | `/app/history` |

## Application shell

Every authenticated workspace inherits the same shell:

- EMOS brand and workspace navigation in a slim left rail.
- Page title and breadcrumbs in a stable top bar.
- Global search for portfolios, workloads, evidence, and decisions.
- Persistent portfolio context; workload context appears on workload routes.
- A compact lifecycle indicator showing completed, current, blocked, and upcoming stages.
- The compact indicator shows all five phases. Expanding it reveals every canonical stage, the Mobilize handoff, and every sub-stage.
- Unavailable stages are never hidden. They are greyed, non-interactive, and labelled `Building next` or `Product vision` so users can understand the complete operating model without mistaking roadmap scope for released capability.
- A right-aligned primary action that changes with the workspace.
- Evidence completeness and readiness are visible before a user commits a decision.
- Notifications, account menu, help, and environment state remain in fixed locations.

## Visual system

- Use the current EMOS product family: near-black/navy surfaces, restrained warm-gold brand accent, cyan only for information and active journey context, and green/amber/red only for semantic state.
- Use Plus Jakarta Sans for product UI. Serif typography is reserved for editorial landing-page moments, not dense application surfaces.
- Use an 8px spacing system, 12-column desktop grid, 10–12px component radii, and subtle 1px borders.
- Prefer flat surfaces and clear hierarchy over glass effects, neon glow, or ornamental gradients.
- Desktop concepts are 16:9, but every component must have an implementation path for tablet and mobile.

## Shared data continuity

All concept frames and implemented screens use the same synthetic portfolio:

- Portfolio: `Northstar Modernization Portfolio`
- Canonical workload: `Legacy Order Management`
- Workload ID: `WL-LOM-001`
- Business unit: `Supply Chain`
- Business criticality: `High`
- Evidence completeness: `61%`
- Readiness: `Needs evidence`
- Potential 6R disposition: `Replatform`
- Critical gaps: detailed dependency map, disaster-recovery plan, and current cost baseline

When the product shows a different value, it must represent an intentional state transition rather than a design inconsistency.

## Modernization economics

Cost assessment is not a standalone late-stage screen. It is a cross-cutting thread:

- Align: investment objectives and value targets.
- Understand: current run-cost baseline and cost confidence.
- Assess: TCO, migration cost, benefits, risk, and assumptions.
- Decide: economic comparison of viable 6R options.
- Prioritize: value, cost, effort, dependency, and risk scoring.
- Plan: wave budget, capacity, contingency, and cost-benefit baseline.
- Measure and Reassess, in the product vision: actuals, benefits realization, and refreshed assumptions.

A missing current cost baseline is a critical evidence gap and prevents `Decision ready` status.

## Higgsfield design rules

Higgsfield is used to explore and approve the interface system, visual storytelling, and motion language. Product truth remains in code and governed data.

- Generate at most two candidates for a screen; choose one and freeze it.
- Every prompt references this constitution and the approved master shell.
- Preserve the same shell, sample portfolio, workload, terminology, and state labels.
- Use targeted edits for local corrections. Do not regenerate an approved screen from scratch for minor text issues.
- Treat generated tables, numbers, calculations, forms, approvals, and audit records as visual proposals only.
- Rebuild approved experiences as accessible React components with tested interactions.
- Use real product captures for functional demos. Higgsfield may supply atmospheric hero media, transitions, and future-state storytelling.

## Release acceptance

A workspace is releasable only when:

- It has a stable canonical URL.
- The previous and next journey actions work.
- Refresh and direct navigation preserve context.
- Loading, empty, error, insufficient-evidence, and permission states are covered.
- Mobile and keyboard behavior are verified.
- No provider/model name leaks into customer-facing capability labels.
- Automated tests and security gates pass.
- The deployed commit, Cloud Run revision, smoke-test result, and rollback revision are recorded.
