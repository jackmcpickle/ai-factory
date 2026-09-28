# Eight-minute panel walkthrough

1. **Scope (1 min).** “This is the software-delivery operating model, not a meal-ordering bot. Everything here is synthetic. Human owners keep the irreversible decisions.” Show project tenancy in `fixtures/workspace.json`, the loops in `packages/contracts/src.js`, `agents/roles.json` and the six-stage table in `README-RUNNABLE.md`.
2. **Run (2 min).** `npm run check && npm run demo`; inspect `outputs/run.json` project ID, schedule loop dispatch, summary, three team IDs and event sequence. Then run `npm run demo -- --trigger webhook --out outputs/webhook-run.json` and contrast the webhook loop. Explain app/platform/safety routing and the difference between a supplied check flag and actual CI evidence.
3. **Safety (1 min).** Open `safetyGate` and its tests. Alter a dietary attribute or replay key: it fails closed and never commits. Ask panel what real catalogue and catering contract must be authoritative.
4. **Live change (1 min).** Add `ui` to `humanOnlyTags`, bump policy version, rerun. SIG-001 shifts to human-only. Revert. This is a policy-driven change, not an agent modifying airline data.
5. **Team/quality (1 min).** PM/designer/two engineers/QE plus part-time specialists. Agents prepare small bounded work; independent QE and release owner gate it. Production would need real tests, trace signing and source ACLs.
6. **Costs/rollout (1 min).** Inspect estimated cost and retry budget, mark it as illustrative. Name cost per accepted change, p90, choice misses, waste and recurrence as pilot measures. Shadow run before any automation.
7. **Tradeoff (1 min).** “I left out actual agent model calls and a fake Qantas integration. The goal is a runnable orchestration/control-plane slice that exposes what remains human.” Invite a live policy or fixture change.

No Qantas account or network is required. This is intentionally a demo harness, not a running scheduler, webhook server or end-to-end LLM agent fleet.
