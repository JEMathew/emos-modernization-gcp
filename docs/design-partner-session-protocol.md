# EMOS Design-Partner Evaluation Protocol

## Purpose

Collect comparable evidence about whether an enterprise practitioner can use EMOS to create a defensible modernization decision and whether a buyer can defend the resulting investment.

## Participants

Run five moderated task-based sessions per meaningful release across enterprise architects, portfolio managers, transformation leaders and technology executives. Use the same tasks each time, observe silently and administer SUS at the end. Record role and context; do not combine different roles into one undifferentiated score.

## Data Boundary

Use the synthetic Apex portfolio or sanitized representative data. Do not collect credentials, secrets, regulated production records or confidential customer data during research sessions.

## Moderator Rules

- Use the same task wording and order for every participant.
- Ask the participant to think aloud, but do not explain the interface.
- Observe silently unless the participant is blocked for more than two minutes.
- Record what happened, not what the moderator believes they intended.
- Separate current Beta v1.0 behavior from reactions to the long-term vision.

## Tasks

1. From the landing page, explain what EMOS does, who it is for and why vendor neutrality matters.
2. Open the public Apex sandbox without signing in and identify the business initiative, blocking workload and evidence state.
3. Decide whether the workload is ready for approval and explain the 70% threshold and critical-gap rule.
4. Identify the next evidence-gathering action and explain why Replatform or Refactor is not yet approved.
5. Download or print the sample Executive Decision Brief and describe whether it could enter an architecture or investment-governance review.
6. In the authenticated beta, locate the portfolio template, identify the three required fields and explain how partial evidence is treated.
7. Find the Trust and Evaluation page and identify what is stored, what an AI provider may see and the current beta limitations.
8. Locate the design-partner path and explain what commitment is being requested.

## Start Architecture-Review Recruitment in Parallel

Recruit at least one person who currently participates in an architecture review board while the authenticated handoff and Decision Brief are being improved. The eventual test is artifact-first, not demo-first: give the reviewer the brief without the product walkthrough and ask whether they can approve, reject or request the next evidence from that artifact alone.

## Separate Conformance From Real-World Accuracy

The public readiness-gate suite demonstrates that the deterministic implementation conforms to EMOS's published rules. It is not evidence that those rules are accurate for enterprise decisions.

For the first design-partner accuracy experiment:

1. Ask the partner's architect to select about twenty representative or sanitized workloads.
2. Before showing EMOS output, have that architect label each workload `should block` or `should pass`, record the rationale and identify any critical gaps.
3. Run the same records through EMOS without changing the labels.
4. Compare the blind external labels with EMOS outcomes and review every disagreement.
5. Report the sample, label source, confusion matrix and limitations. Do not generalize beyond the observed cases.

Labels authored by the EMOS founder remain conformance cases regardless of how many are added; only independent blind labels can begin to test decision accuracy.

## Observation Sheet

For each task capture:

- completed without help: yes/no;
- time to completion;
- first click;
- hesitation or wrong turn;
- words the participant uses to describe the result;
- trust concern raised;
- missing information;
- whether the output would survive their governance process;
- buyer, budget owner and willingness-to-pay evidence when volunteered.

## Interim Measures Before Traffic

- Four of five participants can restate the problem and vendor-neutral distinction after the first screen.
- Four of five reach the readiness conclusion without moderator explanation.
- No participant interprets `NEEDS EVIDENCE` as an application failure.
- Median time from sandbox entry to readiness conclusion is under five minutes.
- At least three participants can name the required next evidence.
- At least three say who would receive the Decision Brief in their organization.

## SUS Follow-Up

After the tasks, administer the standard ten-item System Usability Scale without altering its wording. Report the raw participant responses and aggregate score with the participant count; do not present it as statistically representative.

## Release Decision

Prioritize observed blockers that prevent task completion, create an unsafe interpretation or stop the artifact entering governance. Treat feature requests without a demonstrated workflow or buyer consequence as hypotheses, not commitments.

The current beta is ready for design-partner conversations once the authenticated sandbox-to-product handoff is verified. It is not yet evidence of real-world decision accuracy or production readiness.
