# EMOS UX Constitution

Status: approved working baseline for the MVP through Define Target State.

## Product promise

EMOS helps an enterprise move from strategic intent and incomplete estate data to evidence-backed modernization decisions, a governed plan, and an implementation-ready target state.

The planned MVP ends at **Define Target State**. Availability is verified per stage and sub-stage; Define Target State is currently Building next. The product does not claim to execute migrations.

## Experience principles

1. **One connected journey.** Every workspace shows where the user is in the modernization lifecycle, what evidence is available, and what the next governed action is.
2. **Evidence before recommendation.** Recommendations expose their supporting evidence, gaps, assumptions, economics, and confidence.
3. **Progressive disclosure.** Portfolio summaries lead to workload detail; workload detail leads to evidence, assessment, decision, plan, and target state.
4. **One primary action per view.** Secondary actions remain visually subordinate.
5. **Status is consistent everywhere.** Workflow states use `Needs evidence`, `In review`, `Decision ready`, `Approved`, and `Blocked` where implemented. Capability availability uses the separate vocabulary `Available`, `Building next`, and `Planned`. An active stage is indicated through selection styling and accessible navigation, not a `Current` availability badge. Never show `Approved` without a human approval record.
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
| Command Center | Cross-stage portfolio overview | `/app` |
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
- Unavailable stages are never hidden. They use neutral grey surfaces, remain non-interactive, and are labelled `Building next` or `Planned`. Maintain readable contrast. Incomplete sub-stages within available stages are individually labelled `Building next`.
- A right-aligned primary action that changes with the workspace.
- Evidence completeness and readiness are visible before a user commits a decision.
- Notifications, account menu, help, and environment state remain in fixed locations.

## Visual system

- Use the current EMOS product family: near-black/navy surfaces, restrained warm-gold brand accent, cyan only for information and active journey context, and green/amber/red only for semantic state.
- Use Plus Jakarta Sans for product UI. Serif typography is reserved for editorial landing-page moments, not dense application surfaces.
- Use an 8px spacing system, 12-column desktop grid, 10–12px component radii, and subtle 1px borders.
- Prefer flat surfaces and clear hierarchy over glass effects, neon glow, or ornamental gradients.
- Desktop concepts are 16:9, but every component must have an implementation path for tablet and mobile.

## Adaptive device experience

EMOS serves the same user identity, portfolio, permissions, and journey state across devices. Device class changes the interaction model and information density; it does not create a different kind of user or a separate product.

### Mobile — act and capture

Primary jobs:

- Review alerts, readiness, evidence gaps, and assigned actions.
- Capture or upload evidence while working with stakeholders.
- Add comments, confirm ownership, and complete simple approvals.
- Check portfolio or workload status and continue the next recommended action.

Experience rules:

- Single-column cards, bottom or compact navigation, large touch targets, and full-screen sheets.
- Tables transform into prioritized workload cards.
- Dependency maps start as summaries and open into focused drill-down views.
- Never require horizontal scrolling to complete a primary task.

### Tablet — review and facilitate

Primary jobs:

- Run assessment and architecture workshops.
- Review Enterprise DNA, evidence, economics, and 6R comparisons with stakeholders.
- Annotate dependencies, evaluate gaps, and review wave options.

Experience rules:

- One or two content panes depending on orientation.
- Touch-friendly controls with persistent portfolio and workload context.
- Landscape mode may show a list-detail or evidence-comparison layout.
- Dense tables remain simplified; advanced bulk operations move to laptop.

### Laptop and desktop — analyze and govern

Primary jobs:

- Import and manage portfolios in bulk.
- Perform evidence, economics, assessment, 6R comparison, governance, prioritization, and wave planning.
- Design target state, inspect dependency graphs, export decision packs, and administer controls.

Experience rules:

- Full application navigation, multi-column workbenches, dense accessible tables, and bulk actions.
- Side-by-side comparison and persistent contextual panels are allowed when they improve decisions.
- Keyboard navigation and shortcuts complement pointer input.

### Cross-device continuity

- Preserve the same canonical URLs, selected portfolio/workload, saved evidence, and decision history.
- Allow a user to begin on one device and continue on another without losing context.
- Prefer responsive layout and input-capability detection over user-agent-specific forks.
- Mobile and tablet do not expose unavailable capabilities merely because a larger layout exists elsewhere.

## Appearance preference

The product supports three explicit choices: `Light`, `Dark`, and `System`.

- `System` is the default for a new browser and follows operating-system preference changes.
- The selected preference is stored locally today so it survives refresh and return visits.
- Signed-in cross-device synchronization is planned: the preference should be stored on the user profile while retaining local fallback before authentication.
- Every component, chart, status, generated illustration, focus state, and disabled state must pass contrast and legibility checks in both resolved themes.
- Theme selection must never change product data, workflow state, or availability.

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

### Packet 1 implementation boundary — 20 September 2026

The existing top-navigation IA is retained and extended with Overview / Command Center. A left rail, global search and notifications remain future shell work; they are not simulated. History has its own page instead of occupying every workspace. URL state preserves the selected portfolio, workload, stage and assessment. Local unsaved form drafts are not synchronized across devices or refreshes.

Implemented routes: `/app`, `/app/portfolio`, `/app/workloads/:id/dna`, `/app/workloads/:id/assessment`, `/app/workloads/:id/decision`, `/app/assessment`, `/app/decision`, `/app/plan`, `/app/history`. Use `?stage=align` and `?stage=mobilize` for planning sub-sections. `portfolio=imported`, `workload=<id>` and `assessment=<id>` preserve relevant context. The route matrix above remains the broader MVP design; unimplemented evidence/target-state/prioritization routes must not be advertised as available.

Earlier Higgsfield frames are visual references, not approval of unsupported functionality. The accepted packet plan implements the functional shell now; new Higgsfield media is scheduled for packets 8 and 9 after the workflows and copy stabilize.

A workspace is releasable only when:

- It has a stable canonical URL.
- The previous and next journey actions work.
- Refresh and direct navigation preserve context.
- Loading, empty, error, insufficient-evidence, and permission states are covered.
- Mobile and keyboard behavior are verified.
- No provider/model name leaks into customer-facing capability labels.
- Automated tests and security gates pass.
- The deployed commit, Cloud Run revision, smoke-test result, and rollback revision are recorded.
