# Meal choice delivery workspace

TanStack Start interface for the synthetic delivery dry run. Linear’s Orbiter design system is private, so the chrome uses shadcn/ui on Radix.

```sh
pnpm install
pnpm dev
```

The app calls `orchestrate` from `apps/orchestrator` against `fixtures/` and `policy.json`. Adding the `ui` human-only tag reruns that same function.

The automation mock is a separate page at `/automation`. Skill library, validator, rules, and integrations are linked from that screen. Those pages keep their state in memory only.
