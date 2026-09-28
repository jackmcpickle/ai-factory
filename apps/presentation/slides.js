/* Editable presentation content. Role labels communicate ownership without relying on colour. */
const figjam = "https://www.figma.com/board/tgOCNZD08i86wkTWWJk37X/Factor";
const box = (role, title, detail) =>
  `<div class="action ${role.toLowerCase()}"><span class="role">${role}</span><h3>${title}</h3><p>${detail}</p></div>`;
const stage = (name, items) =>
  `<div class="stage"><h3 class="stage-name">${name}</h3>${items.join("")}</div>`;
const flow = (...stages) =>
  `<div class="flow cols-${stages.length}">${stages.join('<span class="arrow" aria-label="then">→</span>')}</div>`;
const gate = (title, text) =>
  `<div class="gate"><strong>${title}</strong><span>${text}</span></div>`;
const columns = (...items) =>
  `<div class="columns cols-${items.length}">${items.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}</div>`;
const table = (heads, rows) =>
  `<div class="table-wrap"><table><thead><tr>${heads.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((v, i) => (i === 0 ? `<th scope="row">${v}</th>` : `<td>${v}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`;
const link = (url, text) =>
  `<a href="${url}" target="_blank" rel="noopener noreferrer">${text} ↗</a>`;
const slides = [
  {
    id: "direction",
    section: "The operating model",
    title: "Human direction.<br>Agent execution.",
    className: "cover",
    lead: "A smaller squad, with evidence at every handoff.",
    body: `<div class="cover-bottom"><p>Applied AI technical challenge<br><strong>Product Innovation Centre</strong></p><div class="loop-mark" aria-hidden="true">↻</div><p class="cover-thesis">Start with one useful loop.<br>Keep decisions accountable.<br>Expand when the evidence holds.</p></div>`,
    notes:
      "The initiative is the Qantas App pre-order capability. This presentation focuses on how we deliver software, with generic workflows that can be reused across products. The runnable repository demonstrates control flow using synthetic inputs; the production agent fleet is a proposal.",
  },
  {
    id: "boundaries",
    section: "01 / Human ownership",
    title: "Core product work stays hands-on.",
    lead: "Agents help us explore and implement. People own intent, experience and consequential decisions.",
    body:
      columns(
        [
          "Human-led discovery",
          "PM and designer speak to users, frame the problem, choose outcomes and resolve competing needs. Agents synthesize research with traceable sources.",
        ],
        [
          "Human-led design",
          "Designer and engineers prototype with agents, inspect real interactions and test assumptions. People approve the experience and architecture.",
        ],
        [
          "Bounded agent delivery",
          "Agents take accepted, testable work through build and verification. Humans retain scope, risk acceptance, merge and release authority.",
        ]
      ) +
      gate(
        "Human-only decisions",
        "Product priority · research consent · domain truth · architecture exceptions · irreversible commitments"
      ),
    notes:
      "For this initiative, discovery tests whether the proposed capability addresses preference availability, waste and visibility. We do not delegate the product strategy to the delivery loop. Human-only refers to decision authority; agents may prepare options and evidence.",
  },
  {
    id: "map",
    section: "02 / Workflows",
    title: "Three loops. One delivery standard.",
    lead: "The FigJam model, separated into readable stages and nested actions.",
    body: `<div class="loop-list"><a href="#4"><b>01</b><div><h3>Recurring work</h3><p>Define → Validate → Enable → Run & review</p></div><span>Scans and checks ↗</span></a><a href="#5"><b>02</b><div><h3>System signals</h3><p>Detect → Triage → Act → Close & learn</p></div><span>Evidence into work ↗</span></a><a href="#6"><b>03</b><div><h3>Signals to delivery</h3><p>Intake → Triage → Build → Verify → Close the loop</p></div><span>Accepted work ↗</span></a></div><div class="legend"><span class="role human">Human</span><span class="role agent">Agent</span><span class="role system">System</span><span>Labels identify responsibility; arrows show handoffs.</span>${link(figjam, "Open editable FigJam")}</div>`,
    notes:
      "These loops match the Factor FigJam. Recurring work produces signals. Signals enter the same delivery path as requests from people. Agents can propose improvements to schedules and skills, but a person approves those changes.",
  },
  {
    id: "recurring",
    section: "02 / Loop 1 · Recurring work",
    title: "The smallest loop: a scheduled check.",
    lead: "Begin with an observable, read-only task and a named owner.",
    body:
      flow(
        stage("1 / Define", [
          box(
            "Human",
            "Purpose & owner",
            "What to check, why it matters, who acts."
          ),
          box(
            "Human",
            "Cadence & limits",
            "Frequency, scope, budget, stop conditions."
          ),
        ]),
        stage("2 / Validate", [
          box(
            "Agent",
            "Draft schedule",
            "Propose instructions and expected output."
          ),
          box(
            "System",
            "Dry run",
            "Check permissions, timeout and sample result."
          ),
        ]),
        stage("3 / Enable", [
          box(
            "Human",
            "Approve evidence",
            "Accept scope and useful signal quality."
          ),
          box(
            "System",
            "Activate & pause",
            "Version schedule; expose a kill switch."
          ),
        ]),
        stage("4 / Run & review", [
          box("System", "Trigger run", "Create isolated run with a unique ID."),
          box(
            "Agent",
            "Check & report",
            "Return evidence or an explicit failure."
          ),
        ])
      ) +
      gate(
        "Repeat at the next scheduled time",
        "Human owner reviews noise, cost and failures. Findings enter the signals loop; changes to cadence need approval."
      ),
    notes:
      "Example: a recurring dependency or error-pattern scan. A timer is deterministic system behaviour; interpreting the findings may use an agent. A scan never receives production write access merely because its schedule is approved. Pause on repeated failures or budget exhaustion.",
  },
  {
    id: "signals",
    section: "02 / Loop 2 · System signals",
    title: "Turn a signal into a bounded decision.",
    lead: "Production errors and factory scans share the same intake discipline.",
    body:
      flow(
        stage("1 / Detect", [
          box(
            "System",
            "Capture evidence",
            "Source, time, affected flow and severity."
          ),
          box(
            "System",
            "Deduplicate",
            "Group recurrence; retain source links."
          ),
        ]),
        stage("2 / Triage", [
          box(
            "Agent",
            "Gather context",
            "Inspect relevant docs, code and prior work."
          ),
          box(
            "Human",
            "Resolve uncertainty",
            "Answer questions; validate impact."
          ),
        ]),
        stage("3 / Act", [
          box(
            "Human",
            "Accept, hold or close",
            "Choose priority and authorised scope."
          ),
          box(
            "Agent",
            "Route accepted work",
            "Create a task for build and verify."
          ),
        ]),
        stage("4 / Close & learn", [
          box(
            "System",
            "Record outcome",
            "Link change, checks and recurrence."
          ),
          box(
            "Human",
            "Improve checks",
            "Approve proposed rule or schedule updates."
          ),
        ])
      ) +
      gate(
        "No silent self-expansion",
        "A finding does not grant new permissions. Verified outcomes feed the next scan; uncertain or risky work goes to a person."
      ),
    notes:
      "Start with human acceptance of all proposed actions. A future pilot may pre-authorise a narrow low-risk class, but only after measuring false positives and validating rollback. Monitoring and failure detection remain deterministic wherever possible.",
  },
  {
    id: "intake",
    section: "02 / Delivery stage 1 of 5",
    title: "Intake: preserve the original signal.",
    lead: "People and systems arrive through different doors, then use one work record.",
    body:
      flow(
        stage("Sources", [
          box(
            "Human",
            "From people",
            "Feedback, support threads and requests."
          ),
          box("System", "From systems", "Production errors, scans and checks."),
        ]),
        stage("Capture", [
          box(
            "System",
            "Create the record",
            "Signal ID, reporter, evidence and access scope."
          ),
          box(
            "Agent",
            "Summarise the ask",
            "Separate observed facts from assumptions."
          ),
        ]),
        stage("Ready for triage", [
          box(
            "Human",
            "Own the outcome",
            "Assign an accountable product or technical owner."
          ),
          box(
            "System",
            "Keep provenance",
            "Source links remain attached to the task."
          ),
        ])
      ) +
      gate(
        "Exit evidence",
        "A deduplicated signal with a source, an owner and enough context to ask useful questions."
      ),
    notes:
      "Treat external text as evidence, not as instructions that can change agent permissions. Redact secrets and limit context retrieval to authorised sources. The original request remains available so summaries can be challenged.",
  },
  {
    id: "triage",
    section: "02 / Delivery stage 2 of 5",
    title: "Triage: clarify before building.",
    lead: "A confident-sounding answer is not an acceptance criterion.",
    body:
      flow(
        stage("Understand", [
          box(
            "Agent",
            "Clarify intent",
            "Describe the outcome behind the request."
          ),
          box(
            "Agent",
            "Gather context",
            "Read project docs, code and prior decisions."
          ),
        ]),
        stage("Challenge", [
          box(
            "Agent",
            "Apply criteria",
            "Check fit, confidence, risk and testability."
          ),
          box(
            "Human",
            "Answer uncertainty",
            "Return missing information to context gathering."
          ),
        ]),
        stage("Accept", [
          box(
            "Human",
            "Approve scope",
            "Choose the smallest useful change and exclusions."
          ),
          box(
            "Human",
            "Agree acceptance",
            "Define examples, failure cases and measurable proof."
          ),
        ])
      ) +
      gate(
        "Exit evidence",
        "An accepted task with explicit criteria, risk class and a validation plan. Missing evidence means hold, not guess."
      ),
    notes:
      "The human remains hands-on when the work changes the product experience. For routine engineering work, standard acceptance templates can make this short. Agent disagreement about scope, domain rules or safety creates an escalation, not another unbounded debate.",
  },
  {
    id: "build",
    section: "02 / Delivery stage 3 of 5",
    title: "Build: give each agent its own space.",
    lead: "A bounded task, a pinned context version and an isolated environment.",
    body:
      flow(
        stage("Queue", [
          box(
            "System",
            "Dispatch accepted task",
            "Attach criteria, skill versions and budgets."
          ),
          box(
            "System",
            "Provision isolation",
            "Own branch, worktree, sandbox and test data."
          ),
        ]),
        stage("Implement", [
          box(
            "Agent",
            "Make a small change",
            "Follow the same project rules as reviewers."
          ),
          box(
            "Agent",
            "Prepare evidence",
            "Diff, tests, assumptions and unresolved issues."
          ),
        ]),
        stage("Preview", [
          box(
            "System",
            "Publish unique URL",
            "Bind environment and build to the commit."
          ),
          box(
            "System",
            "Limit lifetime",
            "Scoped credentials, expiry and cleanup."
          ),
        ])
      ) +
      gate(
        "Exit evidence",
        "A reviewable diff and an accessible preview for the exact commit. Product owners can inspect core experiences during the work."
      ),
    notes:
      "Production proposal: cloud agents should be able to start an isolated app and expose a unique, access-controlled preview URL. A URL alone proves nothing; it must map to the tested build. Web flows use Playwright; native mobile changes need platform-specific device or simulator validation as well.",
  },
  {
    id: "verify",
    section: "02 / Delivery stage 4 of 5",
    title: "Verify: prove the change works.",
    lead: "Independent review and real interaction evidence precede the human merge decision.",
    body:
      flow(
        stage("1 / Checks", [
          box(
            "System",
            "Enforce rules",
            "Types, lint, architecture rules, security and tests."
          ),
          box(
            "System",
            "Block failures",
            "Required gates cannot be waived by an agent."
          ),
        ]),
        stage("2 / Review", [
          box(
            "Agent",
            "Review independently",
            "Inspect intent, diff and failure cases."
          ),
          box(
            "Human",
            "Resolve conflicts",
            "Assess review disputes or risky changes."
          ),
        ]),
        stage("3 / Browser", [
          box(
            "Agent",
            "Exercise real flows",
            "Playwright against the isolated preview."
          ),
          box(
            "System",
            "Capture proof",
            "Assertions, trace, console and persisted outcome."
          ),
        ]),
        stage("4 / Decision", [
          box(
            "Human",
            "Merge or revise",
            "Read the signal, change and evidence."
          ),
          box(
            "System",
            "Refresh evidence",
            "New commit means fresh required checks."
          ),
        ])
      ) +
      gate(
        "Revision loop → Build",
        "Failed checks, inadequate evidence or unresolved disagreement return the task to implementation. Retry limits prevent endless churn."
      ),
    notes:
      "The agent that wrote the change cannot certify itself as complete. Deterministic assertions must establish expected outcomes. Screenshots complement assertions; they do not replace them. Rule-based linting tooling is deliberately generic pending clarification of the requested “Jev” tool.",
  },
  {
    id: "close",
    section: "02 / Delivery stage 5 of 5",
    title: "Close the loop after release.",
    lead: "Merged code is a delivery event. The outcome must still be observed.",
    body:
      flow(
        stage("Release", [
          box(
            "Human",
            "Approve rollout",
            "Check operational readiness and residual risk."
          ),
          box(
            "System",
            "Deploy gradually",
            "Feature flag, health thresholds and rollback path."
          ),
        ]),
        stage("Communicate", [
          box(
            "Agent",
            "Reply to the reporter",
            "Explain what changed and link the evidence."
          ),
          box(
            "System",
            "Record the chain",
            "Signal → task → commit → release → outcome."
          ),
        ]),
        stage("Learn", [
          box(
            "System",
            "Observe behaviour",
            "Check recurrence, errors and agreed outcome metrics."
          ),
          box(
            "Human",
            "Refine the workflow",
            "Approve updates to skills, rules and schedules."
          ),
        ])
      ) +
      gate(
        "Feedback → Intake",
        "Unexpected results create a new signal. Release regressions trigger the agreed stop or rollback policy."
      ),
    notes:
      "Launch needs its own human owner and evidence, beyond merge approval. For the initiative, agree product measures such as successful fulfilment, availability and waste with domain owners; instrumentation and data quality must be established before claiming improvement.",
  },
  {
    id: "skills",
    section: "03 / Context, skills & tools",
    title: "Project knowledge stays with the project.",
    lead: "Developer and review agents follow the same versioned contract.",
    body: `<div class="ownership"><article><span class="eyebrow">INSIDE THE PROJECT</span><h3>What good work means</h3><ul><li>Domain language, architecture and decisions</li><li>Core skills and worked examples</li><li>Acceptance rules, tests and lint constraints</li><li>Run commands, fixtures and validation recipes</li></ul><p class="small">Maintained through reviewed changes, named owners and regression examples.</p></article><article><span class="eyebrow">FACTORY OR CI</span><h3>How work moves</h3><ul><li>Triggers, queues and stage routing</li><li>Agent assignment and independent review</li><li>Environment lifecycle and scoped access</li><li>Budgets, retries, escalation and evidence gates</li></ul><p class="small">Reusable orchestration loads a pinned project context version per run.</p></article></div>${gate("A shared standard, independent judgement", "Reviewer agents use the project skills too. They independently assess the change and may challenge the author’s assumptions.")}`,
    notes:
      "The CoE maintains reusable templates; product teams own their local domain truth. Chapter leads review shared patterns. Promote a correction into a skill only after a reviewed example or evaluation shows improvement. Workflow definitions can be housed in a factory service or CI configuration, but are separate from project skills. Existing repo loop descriptors are a demonstrator of this separation, not a production control plane.",
  },
  {
    id: "quality",
    section: "04 / Quality contract",
    title: "Each stage earns its next handoff.",
    lead: "Define observable pass conditions before an agent starts.",
    body:
      table(
        ["Stage", "Required evidence", "Accountable decision"],
        [
          [
            "Discovery & design",
            "Traceable research, tested prototype, explicit acceptance examples",
            "PM + designer approve intent and experience",
          ],
          [
            "Triage",
            "Known scope, risk class, owner, test plan",
            "Human accepts or asks for clarification",
          ],
          [
            "Build",
            "Small diff, rule-based lint, types, tests, security checks",
            "CI rejects incomplete or failing evidence",
          ],
          [
            "Verify",
            "Independent review + Playwright assertions on current preview",
            "Human resolves risk and review disagreement",
          ],
          [
            "Launch & learn",
            "Release readiness, health checks, rollback test, outcome measures",
            "Release owner approves; team reviews results",
          ],
        ]
      ) +
      gate(
        "Completion is evidence-bound",
        "Record commit SHA, environment, skill version and check results. Stale, missing or contradictory evidence blocks progress."
      ),
    notes:
      "For non-web surfaces add platform-specific validators, contract tests and device coverage. Track escaped defects and false pass rates, not just green checks. The actual repository demo uses synthetic evidence flags; production must obtain these results from trusted CI and test runners.",
  },
  {
    id: "risk",
    section: "05 / Risk & escalation",
    title: "One hard boundary: an external commitment.",
    lead: "For the challenge: committing a customer’s selection to a downstream catering system.",
    body:
      flow(
        stage("Prepare", [
          box(
            "Agent",
            "Propose the change",
            "No production commitment credentials."
          ),
          box(
            "System",
            "Validate authoritative data",
            "Check catalogue version, eligibility and dietary rules."
          ),
        ]),
        stage("Approve", [
          box(
            "Human",
            "Approve exact payload",
            "Authorised owner sees consequences and evidence."
          ),
          box(
            "System",
            "Bind approval",
            "Payload hash, approver, expiry and idempotency key."
          ),
        ]),
        stage("Commit", [
          box(
            "System",
            "Revalidate & execute",
            "Reject changed data, stale approval or duplicate requests."
          ),
          box(
            "System",
            "Audit & reconcile",
            "Record receipt; uncertain status requires reconciliation."
          ),
        ])
      ) +
      gate(
        "Fail closed; raise to a person",
        "Domain conflict, agent disagreement, missing evidence or uncertain downstream state stops the operation. Never blindly retry an ambiguous commitment."
      ),
    notes:
      "This is the one domain-specific guardrail example required by the brief. A deterministic service, not an LLM, enforces the rules and writes to the authoritative system. Pilot approval is per exact commitment payload; future batch or policy approval needs explicit domain review. A transport failure after execution is not proof of failure: query status using the idempotency key before retrying. The repository safety gate is a synthetic demonstration, not an airline integration.",
  },
  {
    id: "team",
    section: "06 / Team shape",
    title: "Pilot a six-person core squad.",
    lead: "A staffing hypothesis to test, with shared specialist effort counted explicitly.",
    body: `<div class="team-layout">${table(
      ["Role", "Traditional", "Pilot"],
      [
        ["Product manager", "1", "1"],
        ["Product designer", "1", "1"],
        ["Technical lead", "1", "1"],
        ["Engineers", "4", "2"],
        ["Quality engineer", "2", "1"],
        ["Iteration manager", "1", "Shared"],
        ["Core squad", "10", "6"],
      ]
    )}<div class="team-aside"><p class="big-number">10<span>→</span>6</p><h3>Keep judgement close to the work.</h3><p>Two engineers cover the initial app/backend slice. Expand capacity when platform coverage or integration demands it.</p><p class="small">Shared: delivery coordination, platform, security, domain expertise, Change Management and chapter support.</p></div></div>`,
    notes:
      "Do not promise a 40% saving. Six core people plus shared capacity must be measured as a total. The traditional allocation is illustrative, since the brief specifies about ten people rather than an exact composition. Validate this against the initiative’s iOS, Android and backend scope; a small first slice is essential. If review load, reliability or delivery flow worsens, adjust staffing or narrow scope.",
  },
  {
    id: "roles",
    section: "06 / What changes",
    title: "More learning, architecture and sharing.",
    lead: "The retained roles spend more time making the work legible and checking its consequences.",
    body:
      columns(
        [
          "Product & design",
          "Sharper outcome definitions, direct user contact and rapid prototype critique. Spend saved drafting time on discovery and validation.",
        ],
        [
          "Engineering & architecture",
          "Own interfaces, constraints and difficult integration. Delegate bounded changes; inspect evidence. Teach agents through maintained project skills.",
        ],
        [
          "Quality & delivery",
          "QE builds validators and adversarial cases. Delivery Management removes dependencies and watches review queues. Everyone owns quality.",
        ]
      ) +
      gate(
        "Make learning part of capacity",
        "Weekly evidence review · paired working sessions · shared failure examples · chapter-led skill reviews · protected architecture time"
      ),
    notes:
      "The technical lead owns architectural coherence, not every line of generated code. Engineers still need implementation depth to detect subtle errors. The PM and designer stay close to users. QE moves from repeatedly executing cases toward designing independent validation and investigating escapes. Change Management and People & Culture support role clarity and learning; prompt counts are not a performance ranking.",
  },
  {
    id: "cost",
    section: "07 / Cost & observability",
    title: "Choose the pace. Measure the whole flow.",
    lead: "Cost rises with throughput, retries, context size and environment lifetime.",
    body: `<div class="formula">Cost per accepted change <span>=</span><div>agent usage + CI / previews + human review + shared support<br><hr>accepted changes</div></div>${columns(["Budget before dispatch", "Set per-run token or spend ceilings, retry limits, concurrency and environment TTL. Alert near limits; pause at the cap."], ["Subscription-first option", "Use included capacity where provider terms and tooling permit. Queue work when limits are reached. Any metered overflow needs an explicit budget."], ["Compare like with like", "Track median and p90 cost, acceptance rate and review time per work type. Faster is useful only if quality and total cost hold."])}${gate("Pilot baseline → agreed operating ranges", "Example policy: alert at 80% of a run budget; stop at 100%; at most two repair attempts. These are proposed controls, not measured results.")}`,
    notes:
      "No fixed dollar estimate is credible before measuring representative runs and reviewing licences. Subscription usage still has finite limits and allocated seat cost. Do not equate API-equivalent estimates with billed spend. The synthetic demo estimates cost; real cloud execution, CI, previews and human effort must be instrumented. No automatic switch from subscription to paid API.",
  },
  {
    id: "debug",
    section: "07 / Debugging a run",
    title: "Follow one ID from signal to outcome.",
    lead: "A person should be able to explain why a run acted, failed or became expensive.",
    body: `<div class="trace"><span>Signal</span>→<span>Task</span>→<span>Run</span>→<span>Commit</span>→<span>Preview</span>→<span>Release</span></div>${columns(["What we record", "Prompt and skill versions; model; tool calls; tokens and cache; latency; retries; check results; approvals; preview and trace links."], ["Where we investigate", "A run timeline shows the first failing gate. Cost breakdown separates author, reviewer, repair attempts and environment time."], ["How we improve", "Reproduce with sanitised fixtures. Fix the failing rule or context. Add a regression case, review it and compare the next cohort."])}${gate("Example investigation", "Cost rises → find repeated repair attempts → inspect failing browser assertion → fix missing project context → rerun within the same cap.")}`,
    notes:
      "Production logs need access controls, redaction and retention limits. Do not collect secrets or all user research into one shared trace. Store the minimum authorised evidence needed to reproduce the issue. Track approval queue time and total cycle time alongside model latency.",
  },
  {
    id: "antiburn",
    section: "08 / Learn from actual usage",
    title: "Make token waste visible with Antiburn.",
    lead: "Use local session diagnostics to improve prompts, context and tool configuration.",
    body: `<div class="antiburn-panels"><article><span class="eyebrow">CONTEXT</span><div class="spark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><h3>Growth & compaction</h3><p>Inspect context depth, token traffic and subagent activity.</p></article><article><span class="eyebrow">COST</span><div class="cost-bars" aria-hidden="true"><i></i><i></i><i></i></div><h3>Where usage goes</h3><p>Break down parent/subagent usage and input, output and cache costs.</p></article><article><span class="eyebrow">TOOLS</span><div class="tool-lines" aria-hidden="true">Skills ▰▰▰<br>MCPs ▰▰<br>Tools ▰▰▰▰</div><h3>Loaded but unused</h3><p>Find skills, MCP servers and tools that consume context without being used.</p></article></div><p class="source-line">Conceptual feature illustration, not live usage. ${link("https://antiburn.com/", "View Antiburn features")} · Verified 28 September 2026.</p>${gate("Team practice we add", "Review redacted examples together; compare task outcomes before and after prompt changes. Antiburn is local diagnostics, not a verified team prompt-scoring platform.")}`,
    notes:
      "Official site describes a local, open-source app with context, cost and tools views, usage-limit meters and checks for wasteful settings. Its example savings use API-pricing equivalents. We should not present those as our savings. Aggregate team outcomes with consent; avoid treating token usage or prompt counts as individual productivity. Link opens the product site for a live feature walkthrough.",
  },
  {
    id: "rollout",
    section: "08 / Rollout",
    title: "One product. One team. One useful loop.",
    lead: "Expand through evidence gates, at the team’s pace.",
    body:
      flow(
        stage("1 / Baseline", [
          box(
            "Human",
            "Listen & map",
            "Change + Delivery assess needs and adoption."
          ),
          box(
            "Human",
            "Choose a pilot",
            "Name owners; baseline cost, flow and quality."
          ),
        ]),
        stage("2 / Shadow", [
          box(
            "Agent",
            "Run scans only",
            "Produce proposals with no write permissions."
          ),
          box(
            "Human",
            "Coach & compare",
            "Pair on prompts; review noise and missed cases."
          ),
        ]),
        stage("3 / Bounded delivery", [
          box(
            "System",
            "Enable tasks",
            "Isolated previews and strict validators."
          ),
          box("Human", "Review changes", "Refine skills from real failures."),
        ]),
        stage("4 / Expand", [
          box(
            "Human",
            "Check outcomes",
            "Scale when quality and review load hold."
          ),
          box(
            "Human",
            "Share learning",
            "Chapter templates; local product ownership."
          ),
        ])
      ) +
      gate(
        "Pilot scorecard",
        "Cycle time · escaped defects · rework · reviewer load · cost per accepted change · adoption confidence. Define acceptable ranges with the team before the pilot."
      ),
    notes:
      "Change Management supports listening, training and feedback. Delivery Management protects capacity and resolves dependencies. Chapter leads maintain reusable patterns; People & Culture supports role development. Baseline first, then agree measurable thresholds such as no deterioration in escaped defects and sustainable review workload. Pause or narrow automation if thresholds fail. Avoid a big-bang rollout or a utilisation target.",
  },
  {
    id: "scope",
    section: "09 / Priorities & tradeoffs",
    title: "Build trust before increasing autonomy.",
    lead: "The first release of the operating model should be small enough to inspect and change live.",
    body:
      columns(
        [
          "Prioritise now",
          "A recurring read-only loop; common signal intake; versioned project skills; independent review; reliable validators; human escalation.",
        ],
        [
          "Deliberately leave out",
          "Autonomous product strategy, automatic high-risk merges, production commitments by agents, broad self-modifying workflows and unbounded parallelism.",
        ],
        [
          "Earn the next step",
          "Measure the bottleneck. Improve a validator or skill. Add one bounded capability, then verify that cost, quality and team confidence still hold.",
        ]
      ) +
      gate(
        "Tradeoff",
        "Some human review slows the first pilot. It gives us labelled failures, domain understanding and evidence for safely reducing friction later."
      ),
    notes:
      "A six-person squad is only viable with narrow initial scope and working platform support. Under a three-to-four-hour challenge constraint, the repository prioritises an executable control-flow demonstration over pretending to integrate real agents and airline systems.",
  },
  {
    id: "demo",
    section: "10 / Working demonstration",
    title: "Change a policy. See the workflow change.",
    lead: "The repository makes routing, escalation and limits concrete using synthetic inputs.",
    body: `<div class="demo-layout"><div class="terminal"><span>LOCAL DEMO</span><pre><code>npm run check
npm run demo
npm run demo -- --trigger webhook \
  --out outputs/webhook-run.json</code></pre></div><div><h3>Walkthrough</h3><ol><li>Run checks and inspect the schedule-triggered output.</li><li>Compare webhook-triggered routing.</li><li>Add <code>ui</code> to the human-only policy and rerun.</li><li>Inspect the synthetic safety gate and retry budget.</li></ol></div></div>${gate("Implemented vs proposed", "Working: local orchestration demo, synthetic fixtures and policy checks. Proposed: live scheduler, LLM fleet, real CI evidence, cloud previews and production integrations.")}`,
    notes:
      "See README-RUNNABLE.md and DEMO.md in the repo. Use your own machine or screen share; the synthetic CLI needs no Qantas account. The web UI is a separate app on port 3000. This presentation is on port 4174. Do not claim supplied check flags are actual test evidence. Verify the source paths before the live policy edit.",
  },
  {
    id: "references",
    section: "Sources & discussion",
    title: "The operating model is inspectable.",
    lead: "Use the board to discuss the workflow and the repository to challenge its behaviour.",
    body: `<div class="reference-list"><p><b>01 / Working board</b>${link(figjam, "Factor · editable FigJam workflows")}</p><p><b>02 / Factory reference</b>${link("https://company.buildpass.ai/labs/factory/building-an-effective-software-factory#one-bottleneck-at-a-time", "BuildPass · one bottleneck at a time")}</p><p><b>03 / Usage diagnostics</b>${link("https://antiburn.com/", "Antiburn · official feature overview")}</p><p><b>04 / Challenge and implementation</b><span>Challenge text, README-RUNNABLE.md, DEMO.md and presentation documentation in this repository.</span></p></div><p class="closing">Start small.<br><em>Make the proof repeatable.</em></p>`,
    notes:
      "The challenge defines the requirements. BuildPass informs workflow structure, not a productivity guarantee. Antiburn claims are limited to its public feature descriptions observed on 28 September 2026. Staffing, budget thresholds and rollout gates in this deck are proposed pilot decisions, not measured outcomes.",
  },
];
