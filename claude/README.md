# EMOS continuation handoff

This directory is the compact, committed entry point for continuing EMOS in
Claude Code or another coding agent. Read the files in this order:

1. [`EMOS_RELEASE_HANDOFF.md`](./EMOS_RELEASE_HANDOFF.md) — authoritative human
   handoff, release gates, rollback and remaining work.
2. [`emos-handoff.json`](./emos-handoff.json) — machine-readable release state.
3. [`EMOS_CONTINUATION_PROMPT.md`](./EMOS_CONTINUATION_PROMPT.md) — copy-ready
   prompt for the next coding agent.
4. [`messaging-source.md`](./messaging-source.md) — canonical positioning and
   capability-claim rules.

The current integrated functional candidate is commit
`bff05ac93546ad1179a89a62f451c7a9c59dd45c`, tagged
`emos-integrated-mvp-20260920`. The handoff documents may be committed after
that candidate; use `git rev-parse HEAD` to identify the documentation commit.
Do not move the immutable release tags.
