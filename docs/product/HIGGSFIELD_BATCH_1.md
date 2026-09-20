# Higgsfield Batch 1 — Shell, Strategy & Portfolio, Enterprise DNA

## Objective

Approve one reusable EMOS application shell and two connected MVP workspaces before implementation begins.

Batch 1 covers:

1. Strategy & Portfolio — Align + Discover.
2. Enterprise DNA — Understand.

The approved designs must visibly belong to the same product and use the shared data in `EMOS_UX_CONSTITUTION.md`.

## Generation 1 — Strategy & Portfolio

- Higgsfield job: `d496a0da-27e9-46d3-97c0-213460e10790`
- Model: `GPT Image 2.5`
- Aspect ratio: `16:9`
- Visual reference: `public/assets/emos/emos-command-center-dashboard-v1.png`
- Result: `https://d8j0ntlcm91z4.cloudfront.net/user_3JEVTCrX56NXzvJUn52TpgJj8TI/hf_20260920_093250_d496a0da-27e9-46d3-97c0-213460e10790.png`
- Status: generated; pending product-owner visual acceptance and close-read text QA.

### Acceptance checklist

- [ ] Shell is calmer and more legible than the existing Command Center concept.
- [ ] Strategy & Portfolio is the active workspace.
- [ ] Align and Discover are highlighted in the journey indicator.
- [ ] One primary action, `Add evidence`, is visually dominant.
- [ ] Strategic outcomes, estate composition, evidence alerts, and portfolio discovery each support a clear user decision.
- [ ] Status chips use the approved vocabulary.
- [ ] The exact synthetic portfolio and workload values are preserved.
- [ ] There is no provider or model branding.
- [ ] Text passes close-read QA; no corrupted words or invented metrics remain.

## Generation 2 — Enterprise DNA refinement

- Higgsfield job: `80758012-7e1a-4724-8fad-3f3cd412e8bc`
- Model: `GPT Image 2.5`
- Aspect ratio: `16:9`
- Shell reference: Generation 1
- Content reference: `public/assets/emos/emos-enterprise-dna-v1.png`
- Result: `https://d8j0ntlcm91z4.cloudfront.net/user_3JEVTCrX56NXzvJUn52TpgJj8TI/hf_20260920_093638_80758012-7e1a-4724-8fad-3f3cd412e8bc.png`
- Status: generated; pending product-owner visual acceptance and close-read text QA.

The Enterprise DNA frame must inherit the approved navigation, top bar, lifecycle indicator, spacing, typography, semantic colors, and portfolio context. It should refine—not simply reproduce—the existing `emos-enterprise-dna-v1.png` concept.

Required content:

- Breadcrumb: `Northstar Portfolio / Legacy Order Management`
- Stage: `3 Understand`
- Primary action: `Add evidence`
- Workload profile with owner, criticality, business process, technology, and current hosting.
- Dependency view grouped by upstream, downstream, data platform, and external provider.
- Evidence panel showing `61%`, `Needs evidence`, and the three critical gaps.
- Economics summary showing that the current cost baseline is missing.
- A potential `Replatform` disposition clearly labelled as provisional, not approved.
- Next action leading to Evidence & Economics.

Do not introduce approval controls or final 6R decision language on this screen; those belong later in the journey.

### Acceptance checklist

- [ ] Shell, navigation, typography, spacing, and lifecycle indicator match Generation 1.
- [ ] `3 Understand` is the active stage and the earlier stages read as complete.
- [ ] `Add evidence` is the only primary action.
- [ ] Evidence gaps are more prominent than the provisional 6R direction.
- [ ] The current cost baseline is explicitly missing and blocks economic comparison.
- [ ] `Replatform` is clearly provisional and `Not decision ready`.
- [ ] The next action leads to Evidence & Economics.
- [ ] There is no approval control, final decision, execution claim, or provider branding.
- [ ] Text passes close-read QA; no corrupted words or invented metrics remain.

## Implementation gate

Once both frames pass the checklists:

1. Implement the master shell as reusable React layout components.
2. Add canonical routes for Strategy & Portfolio and Enterprise DNA.
3. Connect the routes to the shared synthetic portfolio data.
4. Add responsive, keyboard, loading, empty, error, and evidence-blocked states.
5. Replace landing-page concept captures with real product screenshots only after the coded screens pass tests.
6. Record the commit, deployed Cloud Run revision, smoke-test results, and rollback target.

## Generation 3 — Complete lifecycle navigation

- Higgsfield job: `aed15184-c3b0-4744-8fa8-494b7cd96614`
- Model: `GPT Image 2.5`
- Aspect ratio: `16:9`
- Shell reference: Generation 1
- Result: `https://d8j0ntlcm91z4.cloudfront.net/user_3JEVTCrX56NXzvJUn52TpgJj8TI/hf_20260920_094306_aed15184-c3b0-4744-8fa8-494b7cd96614.png`
- Status: generated as a product-navigation concept; the coded lifecycle manifest is the source of truth for all stage names, sub-stages, and delivery states.

The shared lifecycle interaction uses two levels:

1. A persistent compact bar showing the five phases and the current phase.
2. An expandable panel showing all 15 canonical stages, the Mobilize handoff, every sub-stage, and the delivery state of each stage.

Unavailable stages remain visible but are greyed, non-interactive, and explicitly labelled `Next` or `Vision`. Released stages are labelled `Beta`; the current stage receives the active accent.
