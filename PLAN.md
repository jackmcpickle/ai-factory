# Qantas Applied AI challenge: software delivery engine

25 September 2026 · Working plan for Jack, not a submitted challenge

**Thesis.** Show a small, inspectable "software factory" for the Qantas App meal-preorder initiative. It does not take or change a customer's order. It turns a synthetic signal into a reproducible engineering task, a reviewed change, and a measured rollout, while a human owns product judgment, dietary truth, catering commitment and release. This is the point of Steve's video, adapted for an airline rather than copied as an autonomous auto-merge policy.

**Decision to make first.** Build the _working vertical slice_, not an entire app or orchestration platform. A local CLI reading synthetic fixtures and producing structured artifacts is enough to demonstrate the loop and make a live rule change. Use Jack's machine and screen share; include a `README` with exact commands so the panel can also run it, but do not depend on Qantas credentials or a live service. Confirm this choice with Jack before it becomes the submission claim.

## What the linked video says

Steve's 17:34 video, "A deep dive into building autonomous software factories," describes feedback and telemetry flowing through a configurable collection policy. Small, clear, reproducible issues go to isolated agent worktrees. The agent must reproduce, fix and verify before a PR. PR babysitting addresses CI and review; a separate reviewer checks approval policy; unclear/risky cases go to humans. Watchdogs find stranded tasks/PRs, and periodic lookbacks detect a supposedly fixed issue recurring. He recommends strong inputs, beta before production, an incremental dry-run rollout, and says his own environment uses local/dedicated-machine agents. These are the creator's practices, not evidence that Qantas has adopted them. His spoken price/model and productivity numbers should not be presented as measured facts. The full timestamped, imperfect English auto-captions are in [the companion transcript](video-transcript.txt).

### Creator's related work and reposts

The profile identifies Steve as CEO of Builder.io and links the [Agent Native repository](https://github.com/BuilderIO/agent-native). In the video he describes an open-source agent-native framework and apps for visual design, slides, analytics, mail and calendar, plus a configurable skills collection. The [BuilderIO/skills repository](https://github.com/BuilderIO/skills) is a source lead, not a Qantas dependency.

His TikTok reposts tab showed these relevant posts (by @zuchka__, reposted by Steve), inspected as profile links and captions, not transcribed videos:

- [Visual PR recap](https://www.tiktok.com/@zuchka__/video/7660163021032967437): visual evidence can make an agent-generated PR reviewable. Adapt as a concise change/evidence packet, not a substitute for tests.
- [Visual plan](https://www.tiktok.com/@zuchka__/video/7656866695277071629): render the proposed flow and gaps before coding. Adapt as a product/design review artifact.
- [Clips](https://www.tiktok.com/@zuchka__/video/7657969422656654606): agent-readable recordings for a bug or workflow. Adapt as a consented, redacted reproduction fixture; never ingest real passenger data into a demo.

The creator's own related TikToks visible beside the source include [agent-first apps](https://www.tiktok.com/@steve8708/video/7666140082520198413), [visual PR recap](https://www.tiktok.com/@steve8708/video/7657972387111013646) and [visual-plan codebase exploration](https://www.tiktok.com/@steve8708/video/7656164693781859597). These are context, not required watching for the case.

## Presentation structure, 8-10 minutes before discussion

1. **Problem and boundary (1 minute).** Preferred meals missed, premium-cabin waste, weak consumption visibility. We are designing the _delivery operating model_, not a customer meal chatbot. Name the actual product surfaces: Qantas App, catering/booking integration and Contact Centre exceptions. Do not claim access to their real systems or data.
2. **Factory loop (2 minutes).** Walk a synthetic "meal choice unavailable after confirmation" signal through collection, deduplication, severity, reproduction, isolated work, evidence, PR, pilot, release and lookback. Show the factory diagram.
3. **Lifecycle and team (2 minutes).** Walk discovery to production using the lifecycle diagram. Proposed initial team: PM, design lead, two cross-platform engineers, QE, and part-time catering/domain, security/privacy, change and delivery partners. This is a _hypothesis_ for a slimmer squad, not a staffing prescription. Keep specific platform specialists on call. Humans retain scope, contracts, safety, rollout, people decisions; agents do bounded synthesis, prototypes, test scaffolds and repeatable fixes.
4. **Guardrail and evidence (2 minutes).** At preorder confirmation, the agent cannot commit an order or infer allergen safety. A deterministic service checks passenger/flight/order binding, authoritative meal and dietary attributes, inventory, cutoff, idempotency and acknowledgement; unknowns go to human review. Show the guardrail diagram. QE verifies negative and replay cases, not just happy path.
5. **Working demo and adoption (2 minutes).** Run `collect -> classify -> prove -> review-packet` over synthetic fixtures; change one YAML policy (e.g. treat a dietary mismatch as always human) and rerun. Start with shadow/dry-run, then agent PRs with human review, then a limited internal pilot, not instant auto-merge. Show measures and cost. End with tradeoffs and questions.

## Build plan, 3-4 focused hours

| Timebox | Build | Proof to leave in ZIP |
| --- | --- | --- |
| 0:00-0:30 | Decide one synthetic scenario, explicit assumptions, contracts and no-go boundaries. Sketch flow. | README, assumptions, workflow diagrams |
| 0:30-1:30 | Implement local collector/classifier using `factory.yaml` and JSON fixtures. Separate `eligible`, `needs_info`, `human_only`. | Runnable CLI, unit tests, sample decision log |
| 1:30-2:20 | Add reproduce/verify contract: test that fails before a simulated fix, then passes; produce an evidence packet with input hash, test result, diff/PR proposal and owner. No real airline integration. | Before/after outputs, tests, trace sample |
| 2:20-3:00 | Add safety gate for dietary/booking/catering commitment with deny-by-default and idempotency replay test. | Guardrail negative tests and audit record |
| 3:00-3:40 | Add lightweight dashboard/report: signal-to-PR time, reproduction rate, false positives, escaped defects, manual escalations, token/tool cost per accepted change, p90, meal-choice misses, waste and consumption-data completeness. Dry-run a rollout rule change. | Demo script, metrics schema and sample output |
| 3:40-4:00 | Rehearse live mutation, scrub data, zip source and verify a fresh local run. | ZIP, checksum, exact run commands, screen-share needs |

**Quality gates.** Each stage emits a typed artifact with owner, timestamp, source provenance and acceptance criteria. Discovery requires a baseline and human sign-off on problem framing. Design requires a reviewed journey and explicit exceptions. Build requires reproducibility, tests and scoped diff. QE requires contract, negative, accessibility, resilience and human-in-loop tests. Pilot requires operational sign-off and guardrail telemetry. Production is a human release decision with flag, rollback and reconciliation. A model's self-evaluation alone is not a gate.

**Cost and observability.** Record runs by stage, model, tokens, elapsed time, browser/test cost, retries and outcome. Trace signal -> decision -> worktree -> tests -> PR -> deploy -> post-release metrics without passenger identifiers in agent logs. Budget per class of task; terminate noisy loops, cap retries, route ambiguous/high-cost work to a person. Compare cost per _accepted verified change_, not just cost per token. No cost figures should be invented without a measured run.

**Tradeoffs.** Start with local synthetic fixtures, not Qantas data or production credentials. Do not automate dietary claims, customer commitments, prod deployment or human staffing decisions. Do not make a monorepo or dedicated laptop a prerequisite. Steve's auto-merge practice is intentionally narrowed: first phase always human PR review and human release; any future low-risk automation needs measured evidence, change control and policy approval. Demo one scenario deeply rather than pretend to build the entire meal platform.

## Live pushback to be ready for

- **"A meal is unexpectedly unavailable."** Route to human/catering, reconcile with booking, preserve original request and give Contact Centre a clear exception state. Never hallucinate a substitution.
- **"The policy changes: dietary choices always require manual confirmation."** Edit YAML, rerun fixtures and show previously eligible case switches to `human_only`, with an audit trail and tests.
- **"The agent's PR passes tests but increases p90."** Pilot gate holds release; inspect trace and test the slower path; rollback flag if already deployed.
- **"How is this different from a release pipeline?"** The closed loop links real product signals, bounded autonomous engineering, independently checked evidence, explicit human control and measured post-release recurrence.

**Submission boundary.** The recruiter email and PDF specify an external deadline and recipients, but this plan is internal. Jack must review the final ZIP and exact recipient list/body together before any send. Tuesday Sep 29 interview is 9:30 AM Adelaide; two hours earlier is 7:30 AM Adelaide. First Buildkite interview is 12:30 PM the same day, so finish and rehearse before Tuesday morning rather than assume the 90-minute gap is free build time.

## Sources and caveat

- [Jack's exact TikTok](https://www.tiktok.com/@steve8708/video/7688793433128848653), 17:34 video, English auto-captions extracted Sep 25. Machine captions contain errors (e.g. product/tool names), so the accompanying transcript is a raw source aid, not a polished quote.
- [Steve's profile/reposts](https://www.tiktok.com/@steve8708), live page inspected Sep 25; related repost links above.
- [BuilderIO/agent-native](https://github.com/BuilderIO/agent-native) and [BuilderIO/skills](https://github.com/BuilderIO/skills), source leads for the creator's project.
- Michael Pulella's Qantas email, Sep 25, Gmail message `1a0d5e8250f23db2`, attachment `SM - Applied AI - Technical Challenge.pdf`; and Sep 23 interview confirmation `1a0cc0e256892cae`. Requirements above are from the actual attachment. All proposed architecture and staffing are our design, not assertions about Qantas's current systems.
