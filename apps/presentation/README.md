# Applied AI delivery presentation

A dependency-free HTML slide sub-app covering the Applied AI Technical Challenge and the staged workflows in [Factor on FigJam](https://www.figma.com/board/tgOCNZD08i86wkTWWJk37X/Factor). It runs separately from the delivery UI and orchestrator.

## Run

From the repository root:

```sh
pnpm presentation
```

Open **http://localhost:4174**. No install, build, credentials or external assets are needed. It uses the repository's Node runtime (Node 24+ per the root manifest). To change the port:

```sh
PORT=4175 pnpm presentation
```

Alternatively open `apps/presentation/index.html` directly in a browser. The server binds to loopback and serves only the four presentation assets. External reference links require internet access; they open in a new tab. Nothing is sent automatically.

If a local Vite+ shim reports that `npm` is missing, select a working Node installation on your PATH first. In this workspace, validation used Node 24.20.0 from `~/.nvm/versions/node/v24.20.0/bin`. This is a local environment issue, not a presentation dependency.

## Present

- Arrow keys or Page Up / Page Down: previous / next slide.
- Home / End: first / last slide.
- **C** or Contents: jump to a slide.
- **N** or Notes: show speaker notes.
- Escape: close notes and contents.
- Print: all slides, landscape handout; notes and controls are omitted.
- Full screen: use the browser fullscreen API where supported.
- `#9` in the URL opens the verification slide. Each slide has a numbered deep link.

On narrow screens, diagrams stack vertically and the page scrolls, preserving text size. The default presentation targets a desktop or screen share. System-installed Avenir / Palatino families avoid font downloads; fallback fonts are supplied.

## Edit

- `slides.js`: content, role-labelled sub-boxes, source links and speaker notes.
- `styles.css`: layout, responsive behaviour, role colours and print rules.
- `app.js`: slide navigation, notes, contents and controls.
- `index.html`: application shell and design brief.
- `server.mjs`: small static development server; no app API or model calls.

The deck uses trusted, repository-authored HTML strings, not user-supplied content. Keep slide titles and bodies in this source; do not load unsanitised external markup into the renderer.

## Coverage of the challenge

| Requirement | Slides | What is addressed |
| --- | --- | --- |
| Workflow breakdown | 2–10 | Human-led discovery/design, recurring scans, system signals, five delivery stages, release and feedback |
| Context, skills, tools | 11 | Project-local standards shared by author/reviewer; factory or CI orchestration; maintenance and ownership |
| Objective quality | 9, 12 | Deterministic tests and lint, independent review, Playwright proof, commit-bound evidence |
| Risk and guardrails | 13 | Exact-payload approval for an external commitment, authoritative validation, idempotency and reconciliation |
| Team shape | 14–15 | Illustrative ten-to-six core squad, shared effort, learning, architecture and role changes |
| Cost and observability | 16–18 | Budget ranges, subscription constraints, whole-flow cost, run trace, Antiburn feature examples |
| Adoption and rollout | 19 | Product/team pilot, Change and Delivery Management, baseline and expansion gates |
| Tradeoffs | 20 | Narrow initial loops, deliberate exclusions and evidence before autonomy |
| Working demo | 21 | Existing synthetic CLI demo, live policy change and implementation limits |
| Sources | 22 | FigJam, BuildPass, Antiburn and repository evidence |

## Editorial decisions and evidence limits

- Workflows stay generic. One catering commitment example is retained to satisfy the challenge's specific safety requirement.
- Six core staff is a pilot hypothesis, not a measured saving. Shared specialists and cross-platform capacity must be counted.
- Costs and budget policies are proposals. There are no invented dollar savings or claimed throughput results.
- Subscription capacity is finite. Use only permitted tools and account entitlements; do not automatically spill into API billing.
- “Jev” from the request has not been identified. The deck describes strict rule-based linting without attributing capabilities to an unverified product. Update the verification slide after clarification.
- Antiburn's public homepage was inspected on 28 September 2026. It describes local session context/compaction views, parent/subagent and token/cache cost breakdowns, loaded-but-unused skill/MCP/tool diagnostics, usage-limit meters and configuration findings. Slide 18 is an original conceptual illustration of three views, not a product screenshot or live telemetry. Team prompt evaluation is our proposed practice, not an asserted Antiburn team feature. API-equivalent costs are not necessarily billed spend.
- The repository demo is a synthetic orchestration/control-plane slice. It does not run a live scheduler, real LLM fleet, cloud previews or airline integrations. Slides label those as proposed production capabilities.
- Challenge source: `../../challenge-source.txt`, extracted earlier from the supplied Applied AI Technical Challenge PDF. Its submission instructions do not authorise external submission.

## Validation

```sh
pnpm presentation:check
pnpm check
```

The first checks JavaScript syntax. The second runs lint, typecheck and the Vitest suites. Verification completed: syntax checks, the orchestrator tests, all 22 slides navigated at desktop and 390px mobile widths without horizontal page overflow, contents links, notes, Home-key navigation, and browser console review (no warnings or errors). Desktop workflow diagrams and the stacked mobile verification stage were visually inspected. Print CSS is included; printed output and fullscreen were not separately verified. This deck does not add a Playwright test harness; Playwright discussed in the slides is part of the proposed delivery validation system.

## Related material

- [Runnable workflow](../../README-RUNNABLE.md)
- [Panel walkthrough](../../DEMO.md)
- [Editable diagrams](../../DIAGRAMS.md)
- [Source notes](../../SOURCES.md)
- [FigJam workflows](https://www.figma.com/board/tgOCNZD08i86wkTWWJk37X/Factor)
- [BuildPass factory reference](https://company.buildpass.ai/labs/factory/building-an-effective-software-factory#one-bottleneck-at-a-time)
- [Antiburn features](https://antiburn.com/)
