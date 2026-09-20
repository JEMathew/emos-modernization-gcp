# Copy-ready Claude Code continuation prompt

Paste the text below into Claude Code with this repository open.

---
You are the continuation engineer and release-quality reviewer for EMOS. Resume
the existing integrated MVP; do not restart it, reorganize it into packets, or
replace the coded product with generated images.

First read, in order:

1. `claude/README.md`
2. `claude/EMOS_RELEASE_HANDOFF.md`
3. `claude/emos-handoff.json`
4. `docs/product/IMPLEMENTATION_STATE.md`
5. `work_results/EMOS-INTEGRATED-MVP-20260920-result.md`
6. `docs/product/EMOS_UX_CONSTITUTION.md`
7. `docs/product/HACKATHON_RELEASE_SCORECARD.md`
8. `docs/AI_STUDIO_SECURITY_CONSTITUTION.md`
9. `claude/messaging-source.md`

Then inspect `git status --short`, the current branch, HEAD, recent commits,
tags and remotes. The integrated functional candidate must include commit
`bff05ac93546ad1179a89a62f451c7a9c59dd45c`, tagged
`emos-integrated-mvp-20260920`. Preserve all existing/user changes. Do not
reset, force-push, move tags, rewrite history, expose secrets, or silently mark
blocked/partial gates as passed.

Objective: finish the controlled GitHub and Google Cloud release, production
smoke evidence, and real-product media refresh for
`https://emos-modernization.ai.studio`, while preserving the present IA, UX
constitution, security boundaries, deterministic controls and honest
capability states.

Required order:

1. Re-run lint, all tests and the production build; run Firestore emulator tests
   in Java 21 CI or a Java-enabled environment.
2. Push the branch and immutable tags using secure interactive/operator
   authentication. Never embed a token in commands or Git URLs.
3. Record the current healthy Cloud Run revision and traffic split.
4. Deploy and verify Firestore rules before the client.
5. Deploy to service `gemini-reflection-journal`, project `codev-0326`, region
   `asia-southeast1`, using Secret Manager for server secrets.
6. Smoke-test the exact production revision: public landing; auth boundary;
   safe CSV/JSON intake; save/reopen; DNA/evidence; assessment; multi-turn
   follow-up/history; named human decision; governance; prioritization;
   plan/mobilize; target-state save/reopen; responsive and appearance modes.
7. On failure, restore traffic to the recorded prior healthy revision and retain
   evidence for diagnosis.
8. Only after production smoke passes, capture the real product and use
   Higgsfield/Higgsedit to refresh the landing visuals and demo video. Do not
   generate fictional screens. Preserve the approved four source assets and
   verify their hashes.
9. Update the implementation state, integrated result, evidence index,
   hackathon scorecard and demo documentation with exact commit/revision/URLs,
   evidence and remaining gaps.

The shipped MVP ends at Define Target State. Stages Execute through Reassess
remain Planned and inert. A true enterprise knowledge graph, live connectors,
organization tenancy/RBAC and autonomous approvals are not shipped; do not add
or imply them during release work. Customer-facing product copy remains
provider-neutral, while Google/Firebase/Gemini/Cloud Run implementation evidence
belongs in technical and hackathon documentation.

Report progress by release gate. At completion, provide the pushed commit and
tags, CI results, deployed and rollback revisions, route-by-route production
evidence, media outputs, hackathon rubric deltas, and any honest blockers.

---
