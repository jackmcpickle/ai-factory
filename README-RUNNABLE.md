# Qantas Applied AI delivery workflow: runnable, synthetic demonstration

This package is a **dry-run control plane**, not a Qantas App meal-preordering feature and not a real LLM-agent runtime. It shows a project-scoped, multi-team, multi-role workflow through typed inputs, policy-based routing, evidence checks, safety decisions and an inspectable event trace. `agents/roles.json` describes five bounded roles; the local program simulates their handoffs. It invokes no model, does not write to a Qantas system, has no credentials or passenger data, and cannot release or commit a meal order. This distinction is deliberate so the panel can run the demo offline and challenge the controls. A production version would replace bounded simulations with isolated agents and independently validated tool calls.

## Run in under a minute

Requires Node.js 22+ (tested with v22.23.3). No install, network or API key is needed.

```sh
npm run check
npm run demo
cat outputs/run.json
```

Expected: seven passing tests; dry run has two review-ready bounded candidates (`SIG-001`, `SIG-003`), two human-only (`SIG-002`, `SIG-005`), and one needing more information (`SIG-004`). The estimated cost is illustrative, **not a measured vendor bill**. Output is deterministic. `outputs/run.json` is a sample trace included in the ZIP.

## Project tenancy and agent loops

**Projects are the tenancy boundary.** Users and teams are global entities outside projects, then assigned to a project by ID; a team is not itself a tenant. `fixtures/workspace.json` makes this explicit. `packages/contracts/src.js` validates assignments and loop definitions. Inside a project, loops manage agent work. Each loop has one trigger type: `schedule` (an expression) or `webhook` (an event type). Dispatch only selects matching loops inside the requested project; a second synthetic project demonstrates that identical webhook event types do not cross project boundaries. A signal's team must be assigned to the project before processing. In production, project-level authorization, webhook signature verification, delivery deduplication, retry queues and scheduler ownership are required; this offline demo only matches synthetic trigger descriptors. It does not start a scheduler, serve a webhook endpoint or invoke an agent model.

The default `npm run demo` matches `meal-choice-demo`'s daily-review loop. To inspect the event path:

```sh
npm run demo -- --trigger webhook --event-type synthetic.feedback.received --out outputs/webhook-run.json
```

The `loopDispatches` in each trace say `execution: simulated` and `sideEffects: false`. This is a structural demonstration of loop selection, not a claim that a timed or incoming event actually fired. Global user and team records should stay outside a project's data partition; assign access only through scoped memberships. Real isolation and ACL tests remain production work.

### Live policy mutation

Change `policy.json`: add `"ui"` to `humanOnlyTags` and increment `version` to `demo-v2`, then run `npm run demo`. `SIG-001` shifts from review-ready to human-only. Run `npm run check` after changing it. Revert the file to restore the baseline. You can also pass `--policy /path/to/policy.json --fixtures /path/to/signals.json --out /path/to/output.json` after `npm run demo --`. The program rejects non-synthetic input.

## What the trace proves and does not prove

- `product-discovery` records a synthetic signal and baseline; PM owns problem and value judgment.
- `experience-design` sketches exception states; designer owns the journey and accessibility review.
- `bounded-implementation` represents an isolated proposal with input hash/retry cap; engineers own actual change and review. **No source code is generated or edited by an agent in this demo.**
- `independent-verification` gates on supplied test evidence; QE still needs to inspect real tests and negative cases. Fixture booleans are illustrative evidence, not proof that code passed CI. A production implementation must capture genuine command outputs and signed build provenance.
- `rollout-observer` records cost estimate and would watch pilot metrics; humans approve releases and rollback. There is no simulated production deployment.
- `safetyGate` fails closed on absent authoritative fields, mismatches, unavailable inventory/cutoff or replay. Passing yields only `ELIGIBLE_FOR_HUMAN_REVIEW`, never a booking/catering commitment.

The code and tests are fresh for this demo. Only the *monorepo shape* (`apps/*`, `packages/*`, pnpm workspace), package scripts and lint/test organization were inspired by Fisher Street Capital's BrdgIQ setup. No BrdgIQ application source was copied. Node's built-in syntax checker and test runner keep this small package reproducible without a dependency install; BrdgIQ's larger vite-plus stack is not installed here because it adds setup cost without improving this demonstration.

## Governance, stages and team shape

| Stage | Agent role | Required human owner/gate | Evidence before advancing |
|---|---|---|---|
| Discover | Product discovery clusters signals | PM defines problem, baseline and scope | Source provenance, hypothesis, baseline |
| Design | Experience design proposes exceptions | Designer, catering/dietary SME, accessibility | Reviewed journey, unknown states and handoffs |
| Build | Bounded implementation proposes minimal diff | App/platform engineer | Isolated branch, failing-then-passing reproduction, scoped diff |
| Prove | Independent verification checks evidence | QE and security/privacy | Contract, negative, replay, accessibility, load and trace |
| Pilot | Rollout observer collects measures | PM, QE, frontline/catering | Feature flag, stop threshold, rollback and sign-off |
| Release and learn | No autonomous commit | Release owner | Human approval, reconciliation and recurrence check |

Proposed slimmer team for this *one initiative*: PM, designer, two engineers (app/platform), QE, with part-time catering/dietary, security, change and delivery leads. That is five core people rather than a conventional ~ten-person squad, with specialists retained for real contracts and approval. It is a staffing hypothesis for discussion, not a claim about Qantas's actual roster. Agents reduce repeatable analysis, drafts and scaffolding; they do not remove domain accountability.

## Risk, cost and rollout

The irreversible point is a meal/booking or catering commitment. A model may propose work on the feature, never invent dietary truth or execute a customer commitment. In production, authoritative flight/passenger binding, catalogue/version, dietary attributes, inventory, cutoff and idempotency must be checked by a deterministic service with integration contract tests, negative/replay cases and operational reconciliation. Unknowns are held for human review; a release remains a human decision.

Track agent runs and acceptance by stage/team, tokens, elapsed time, retries, test cost, per-accepted-change cost, reproduction rate and escaped defects. Product outcomes: meal-choice misses, premium-cabin waste and consumption-data completeness, with p90 latency and exception rate as guardrails. Synthetic fixture values are **not Qantas baselines**. Budget and retry caps in `policy.json` are illustrative. Rollout: shadow/dry-run, limited internal supervised pilot, human-reviewed PRs, measured expansion; Change/Delivery Management trains mixed-adoption teams and tracks uptake, trust and support tickets. Stop if failures or cost exceed agreed thresholds.

## Intentional exclusions

No customer chatbot, production credentials, passenger records, real model calls, unattended code writing, auto-merge, airline integration or fabricated production metrics. Focus is a credible, changeable workflow artifact. For the existing context, diagrams and full challenge source, read `PLAN.md`, `DIAGRAMS.md` and `challenge-source.txt` in this repository; this ZIP includes a snapshot of those files for a single handoff. Demo on Jack's machine by screen share, or unzip and run on a Node 22+ machine.

## Repository path

The runnable source is in `apps/`, `packages/`, `agents/` and `fixtures/` in this repository. `outputs/` includes deterministic sample traces.
