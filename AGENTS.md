# AGENTS.md

Instructions for coding agents (Claude Code, Cursor, Codex, Copilot) working in this repo. `CLAUDE.md` is a symlink to this file.

## Repo map

| Area | Paths | Stack |
| --- | --- | --- |
| React | `apps/web/src/**` (except `apps/web/src/server`) | TanStack Start, React 19, Tailwind v4, shadcn |
| Backend | `apps/orchestrator`, `packages/contracts`, `apps/web/src/server` | Plain ESM JS, `createServerFn` |
| Presentation | `apps/presentation` | Classic `<script defer>` JS, no build step |
| Data | `fixtures/`, `policy.json`, `agents/roles.json` | Synthetic only, never real passenger data |
| Generated | `outputs/`, `apps/web/src/routeTree.gen.ts`, `apps/web/src/components/ui` | Do not hand-edit (shadcn ui may be regenerated) |

Node 24 (`.nvmrc`), pnpm (version pinned by `packageManager`).

## Commands

```sh
pnpm lint              # ultracite check (oxlint + oxfmt)
pnpm format            # ultracite fix
pnpm typecheck         # tsc --noEmit for apps/web
pnpm test              # vitest: unit (node) + web (jsdom) projects
pnpm test:integration  # vitest: *.integration.test.tsx against the real engine
pnpm taste             # taste-lint mechanical UI/copy checks on apps/web/src
pnpm run react-doctor  # React Doctor over apps/web (note: `pnpm doctor` is a pnpm builtin)
pnpm sums              # regenerate outputs/SHA256SUMS.txt
```

`pnpm check` runs lint, typecheck, test and integration in sequence. CI (`.github/workflows/ci.yml`) runs all of the above plus a gitleaks secret scan.

## Testing conventions

- Vitest for everything. React Testing Library + `@testing-library/user-event` for components. No Playwright, no `node:test`.
- Query by role, label and text. Avoid test IDs and implementation details.
- Unit tests: `*.test.{js,ts,tsx}` next to the code. Integration tests: `*.integration.test.tsx`.
- Integration tests use real fixture and engine output (`buildFactoryResult`). Mock only the server-function boundary (`#/server/factory`), never the orchestrator.
- Resolve file paths with `import.meta.dirname`, never the cwd.

## Review process (required)

Skills live in `.agents/skills/` (symlinked to `.claude/skills/`).

1. **React changes** (anything under `apps/web/src` except `src/server`): review with the `elite-react` skill, then run the `react-doctor` skill (`pnpm run react-doctor`) and fix every error. For visual or copy work, also review with `elite-style` and make `pnpm taste` pass.
2. **Backend changes** (`apps/orchestrator`, `packages/contracts`, `apps/web/src/server`): review with the `elite-backend` skill.
3. **Ready for PR**: once the feature or bug fix is complete, run the `elite-testing` skill over the whole change (`git diff main...`) and add the missing tests. Then do a final pass with `elite-review`.
4. **Open the PR and babysit it** with the `elite-merge` skill: address review comments, keep CI green (lint, taste, types, tests, integration, secrets, React Doctor) and see it through to merge.

Run `pnpm check` before every commit you hand back. The husky pre-commit hook runs `ultracite fix` on staged files via lint-staged.

## Guardrails

- **Never read secrets.** `.agents/hooks/secureRead.ts` blocks `.env*` (except `.env.example`), `.git/`, keys and certificates, `credentials.json`, SSH keys, `.npmrc`, `*.tfvars` and path traversal. It is wired into `.claude/settings.json` and `.cursor/hooks.json`. Do not work around it; ask a human instead.
- **Never bypass hooks.** No `git commit --no-verify`, no disabling lint rules to get green. If a rule is wrong for one line, use an inline disable with a reason.
- **Never hand-edit `outputs/`.** Regenerate trace files with `pnpm demo` and checksums with `pnpm sums`.
- **Synthetic data only.** The orchestrator rejects non-synthetic input; do not add real flight, passenger or booking data to fixtures.
- **No autonomous release.** `safetyGate` returns at most `ELIGIBLE_FOR_HUMAN_REVIEW`. Do not add code paths that commit a meal order, booking or catering change.
