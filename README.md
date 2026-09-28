# Qantas Applied AI delivery demo

Runnable, synthetic project-scoped delivery workflow for Jack's Senior Manager, Applied AI challenge. This is a private review package, not a submission to Qantas. No passenger data, model calls, airline integration or customer commitments.

Start with [README-RUNNABLE.md](README-RUNNABLE.md) for Node 22+ setup, the simulated schedule/webhook loop model, tests and safety limits. [DEMO.md](DEMO.md) is the panel walkthrough. [PLAN.md](PLAN.md), [DIAGRAMS.md](DIAGRAMS.md) and [SOURCES.md](SOURCES.md) preserve the challenge context and editable Mermaid diagrams.

```sh
npm run check
npm run demo
npm run demo -- --trigger webhook --out outputs/webhook-run.json
```

The delivery workspace UI is a TanStack Start app in `apps/web` (Router, Query, and Table) styled with shadcn/ui. Linear’s Orbiter design system is not public, and shadcn sits on the same Radix primitives. It reads the fixtures and calls the orchestrator, including the live `ui` human-only policy change.

```sh
cd apps/web
pnpm install
pnpm dev
```

The program does not run a scheduler, serve a webhook or invoke an LLM; it selects project-local loop descriptors against synthetic trigger input. A passing check is not a meal commitment or release approval. The submitted ZIP and panel email still require Jack's review.
