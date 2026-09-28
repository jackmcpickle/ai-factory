# Qantas Applied AI delivery demo

Runnable, synthetic project-scoped delivery workflow for Jack's Senior Manager, Applied AI challenge. This is a private review package, not a submission to Qantas. No passenger data, model calls, airline integration or customer commitments.

Start with [README-RUNNABLE.md](README-RUNNABLE.md) for Node 24 setup, the simulated schedule/webhook loop model, tests and safety limits. [DEMO.md](DEMO.md) is the panel walkthrough. [PLAN.md](PLAN.md), [DIAGRAMS.md](DIAGRAMS.md) and [SOURCES.md](SOURCES.md) preserve the challenge context and editable Mermaid diagrams.

```sh
pnpm check
pnpm demo
pnpm demo --trigger webhook --out outputs/webhook-run.json
```

## Software factory web app

`apps/web` is the delivery workspace: a Linear-style UI over the same orchestrator the CLI runs. It is a TanStack Start app (Router, Query, Table) styled with shadcn/ui. Linear's Orbiter design system is not public, and shadcn sits on the same Radix primitives.

```sh
pnpm install
pnpm dev        # http://localhost:3000
```

Requires Node 24 (`.nvmrc`). No API keys, network services or model calls. On every load, a server function reads `fixtures/signals.json`, `fixtures/workspace.json`, `policy.json` and `agents/roles.json`, runs `orchestrate()` and `safetyGate()` from `apps/orchestrator`, and renders the result. Policy and trigger edits in the UI re-run the engine; they are held in memory and never written back to disk.

| Page | Route | What it shows |
| --- | --- | --- |
| Dashboard | `/` (home) | Sample delivery figures for the last 7 days (time to merge, deployments, token cost per PR, time in agent review, PRs merged, lead time) and token spend, cost and time for each agent section. Figures are illustrative sample data, not measurements. |
| Signals | `/issues` | Every synthetic signal as an issue, with status, priority, assignee and labels. Filter, sort, group and search via URL params; `⌘K` opens the command menu and `C` creates an issue. |
| Issue detail | `/issues/SIG-001` | The agent **Trace** (each role's event and its human owner), the **Supplied checks** evidence, activity and comments, and the **Safety gate**: four synthetic authority cases (complete, dietary mismatch, idempotency replay, missing key) that fail closed or stop at `ELIGIBLE_FOR_HUMAN_REVIEW`. Dietary, allergen and catering issues are flagged as human gates. |
| Inbox | `/inbox` | Signals the orchestrator produced an outcome for, with the reason and required human. |
| Views | `/views` | Saved filters: All signals, My issues, Review ready, Human only, Needs information. |
| Projects | `/projects` | The tenancy boundary. `meal-choice-demo` and `separate-sandbox` each have Overview, Signals and Loops tabs; Loops shows which schedule or webhook loop matched the active trigger, and the sandbox proves a webhook does not cross projects. |
| Teams | `/teams` | Global teams assigned into projects, with members and open signal counts. |
| Policy | `/policy` | Live policy mutation. Add or remove human-only tags (**Add ui** reproduces the demo: `SIG-001` moves from review-ready to human-only and the version becomes `demo-v2`), switch between the **Daily review** schedule and **Feedback webhook** triggers, and see the run summary, illustrative cost and `Release approved: no`. |
| Automations | `/automation` | Mock agent-loop editor: triggers, tools, agent instructions and run history, plus **Skill library**, **Rules**, **Validator** and **Integrations** subpages. Everything stays in the browser; no engine, service or model is called. |

The same run is available headless with `pnpm demo`; the UI and CLI share one engine, so a policy change produces the same outcome in both.

The program does not run a scheduler, serve a webhook or invoke an LLM; it selects project-local loop descriptors against synthetic trigger input. A passing check is not a meal commitment or release approval. The submitted ZIP and panel email still require Jack's review.

## HTML presentation

Run `pnpm presentation` and open **http://localhost:4174** for the 22-slide challenge presentation. It includes staged FigJam workflows, project skills, validation, human guardrails, team shape, cost and rollout. See [presentation setup and coverage](apps/presentation/README.md) for controls, speaker notes, editing and evidence limits.
