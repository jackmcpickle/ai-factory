# Meal choice delivery workspace

TanStack Start interface for the synthetic delivery dry run. Linear’s Orbiter design system is private, so the chrome uses shadcn/ui on Radix.

```sh
pnpm install
pnpm dev
```

The app calls `orchestrate` from `apps/orchestrator` against `fixtures/` and `policy.json`. Adding the `ui` human-only tag reruns that same function.
