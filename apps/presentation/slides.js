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
const pillars = (...items) =>
  `<div class="pillars">${items.map(([title, points]) => `<article><h3>${title}</h3><ul>${points.map((p) => `<li>${p}</li>`).join("")}</ul></article>`).join("")}</div>`;
/* Factory loop: clockwise from the top. Steps sit outside the ring; human checkpoints hang off it. */
const factoryStep = (x, y, anchor, text) =>
  `<text class="loop-step" x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;
const checkpoint = (dot, line, frame, text) =>
  `<circle class="loop-dot" cx="${dot[0]}" cy="${dot[1]}" r="9"/><path class="loop-link" d="M${dot[0]} ${dot[1]} L${line[0]} ${line[1]}"/><rect class="loop-check" x="${frame[0]}" y="${frame[1]}" width="290" height="50"/><text class="loop-check-text" x="${frame[0] + 145}" y="${frame[1] + 33}" text-anchor="middle">${text}</text>`;
/* Two loops: intake sources inside, agent signals and verification on the surrounding ring. */
const ringLabel = (x, y, text) =>
  `<rect class="ring-pill" x="${x - 120}" y="${y - 26}" width="240" height="52" rx="26"/><text class="ring-pill-text" x="${x}" y="${y + 8}" text-anchor="middle">${text}</text>`;
const twoLoops = `<svg viewBox="0 0 800 600" role="img" aria-labelledby="loops-title loops-desc"><title id="loops-title">Inner and outer loops</title><desc id="loops-desc">An inner loop of people asking, systems noticing and scheduled checks, surrounded by an outer loop of agent signals and agent verification.</desc><defs><marker id="ring-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L8 5 L1 9" class="loop-arrowhead"/></marker></defs><path class="loop-ring" d="M422.7 40.9 A260 260 0 1 1 390.9 40.2" marker-end="url(#ring-arrow)"/><circle class="ring-inner" cx="400" cy="300" r="150"/><text class="ring-heading" x="400" y="105" text-anchor="middle">OUTER LOOP</text><text class="ring-heading" x="400" y="205" text-anchor="middle">INNER LOOP</text><text class="ring-item" x="400" y="260" text-anchor="middle">People ask</text><text class="ring-item" x="400" y="305" text-anchor="middle">Systems notice</text><text class="ring-item" x="400" y="350" text-anchor="middle">Scheduled checks</text>${ringLabel(175, 430, "Agent signals")}${ringLabel(625, 430, "Agent verification")}</svg>`;
const factoryLoop = `<svg viewBox="0 0 1100 600" role="img" aria-labelledby="loop-title loop-desc"><title id="loop-title">A software factory loop</title><desc id="loop-desc">A new product idea or bug report enters the loop, which runs Triage, Spec, Implement, Verify, Ship and Monitor, then back to the start. People review the spec before implementation, the code after verification, and the product before it ships.</desc><defs><marker id="loop-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L8 5 L1 9" class="loop-arrowhead"/></marker></defs><text class="loop-entry" x="550" y="58" text-anchor="middle">New product idea</text><text class="loop-entry" x="550" y="90" text-anchor="middle">or bug reported</text><path class="loop-ring" d="M569.9 126 A190 190 0 1 1 543.4 125.1" marker-end="url(#loop-arrow)"/><text class="loop-centre" x="550" y="300" text-anchor="middle">A software</text><text class="loop-centre" x="550" y="350" text-anchor="middle">factory</text>${factoryStep(701, 135, "start", "Triage")}${factoryStep(777, 254, "start", "Spec")}${factoryStep(716, 481, "start", "Implement")}${factoryStep(384, 481, "end", "Verify")}${factoryStep(323, 254, "end", "Ship")}${factoryStep(399, 135, "end", "Monitor")}${checkpoint([737, 348], [790, 348], [790, 323], "Reviewing the spec")}${checkpoint([550, 505], [550, 540], [405, 540], "Reviewing the code")}${checkpoint([363, 348], [310, 348], [20, 323], "Reviewing the product")}</svg>`;
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
    id: "factory",
    section: "02 / The factory loop",
    title: "A software factory, with people at the checkpoints.",
    lead: "Agents move the work around the loop. People review the spec, the code and the product.",
    body: `<figure class="factory">${factoryLoop}</figure>${gate("Three human checkpoints", "Nothing reaches the next stretch of the loop until a person has reviewed it. Agents prepare the evidence; people make the call.")}`,
    notes:
      "Same loop for a new product idea, a bug report or a signal from production. Triage and spec turn the request into an agreed, testable piece of work. Implement and verify happen in an isolated sandbox with a preview link tied to the exact commit. Ship is a gradual rollout behind a feature flag with a rollback path. Monitor watches errors and agreed outcome measures and feeds anything unexpected back in as a new signal. The agent that wrote a change can never certify it as complete. Detail for technical questions is in the FigJam board.",
  },
  {
    id: "inputs",
    section: "02 / The factory loop",
    title: "Work comes in through one front door.",
    lead: "People and systems feed the inner loop. Agents run an outer loop around it.",
    body: `<div class="loops"><figure class="loops-figure">${twoLoops}</figure><div class="loops-key"><span class="eyebrow">Inner loop</span><p><b>People ask.</b> Product ideas, customer feedback, support threads and team requests.</p><p><b>Systems notice.</b> Production errors and failed checks, grouped so repeats don't pile up.</p><p><b>Scheduled checks.</b> Read-only scans on a timer, such as outdated dependencies.</p><span class="eyebrow">Outer loop</span><p><b>Agent signals.</b> Agents flag what they find while working, such as repeated failures or gaps in project skills.</p><p><b>Agent verification.</b> Agents independently check finished work and its outcomes, then feed results back in.</p></div></div>${gate("A request is not a permission", "Every item keeps its source and a named owner. Finding a problem never gives an agent new access; a person decides what happens next.")}`,
    notes:
      "Behind the scenes: each signal gets an ID, a source link and an access scope. An agent summarises the ask and separates observed facts from assumptions, but the original stays attached so the summary can be challenged. External text is treated as evidence, never as instructions. Scheduled checks start read-only with a named owner, budget, stop conditions and a kill switch; changes to cadence or rules need human approval. Start with a person accepting every proposed action; pre-authorise a narrow low-risk class only after measuring false positives and testing rollback.",
  },
  {
    id: "steps",
    section: "02 / The factory loop",
    title: "Agents do the work. People make the calls.",
    lead: "What happens at each step, and where a person signs off.",
    body:
      table(
        ["Step", "Agents do", "People decide"],
        [
          [
            "Triage",
            "Gather context, group duplicates, ask clarifying questions",
            "Is it worth doing? Who owns it?",
          ],
          [
            "Spec",
            "Draft the change with examples and a test plan",
            "<b>Review the spec:</b> scope, risk and what finished looks like",
          ],
          [
            "Implement",
            "Build a small change in its own sandbox with a preview link",
            "Engineers step in on hard problems",
          ],
          [
            "Verify",
            "Run automated checks, an independent review and real user flows",
            "<b>Review the code:</b> merge or send back",
          ],
          [
            "Ship",
            "Prepare the release and tell the person who asked",
            "<b>Review the product:</b> approve the rollout",
          ],
          [
            "Monitor",
            "Watch errors and outcomes; raise anything new as a signal",
            "What should we improve next?",
          ],
        ]
      ) +
      gate(
        "Evidence before every handoff",
        "Each step records what was checked. Missing or out-of-date evidence stops the line, and no agent can sign off its own work."
      ),
    notes:
      "Technical detail if asked. Triage: an accepted task has explicit criteria, a risk class and a validation plan; missing evidence means hold, not guess. Implement: own branch, worktree, sandbox and test data; pinned skill versions and budgets; a unique, access-controlled preview URL bound to the commit. Verify: types, lint, architecture rules, security scans and tests are required gates an agent cannot waive; a separate reviewer agent checks intent and failure cases; Playwright exercises the preview and captures assertions and traces; a new commit means fresh checks; retry limits stop endless churn. Ship: feature flags, health thresholds and a rollback path. Record commit SHA, environment, skill version and check results for every run. Native mobile changes also need device or simulator validation.",
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
    id: "risk",
    section: "04 / Risk & escalation",
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
    section: "05 / Team shape",
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
    section: "05 / What changes",
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
    id: "measure",
    section: "06 / Measure & improve",
    title: "You need to measure and improve.",
    lead: "Speed alone isn't the goal. Count what reached users against everything it took to get there.",
    body: `<div class="efficiency"><span class="efficiency-term">Factory efficiency</span><span class="efficiency-eq">=</span><span>Software shipped / (token cost + human cost)</span></div>${columns(["Software shipped", "Accepted changes that reach users and hold up in production."], ["Token cost", "What the AI models charge, including retries, reviews and failed attempts."], ["Human cost", "Time spent specifying, reviewing, fixing and supporting the work."])}`,
    notes:
      "Rework and escaped defects reduce software shipped, so cutting corners doesn't improve the number. Human cost includes review queues and shared specialists, not just the core squad. Compare like with like: median and p90 per work type. Improve one bottleneck at a time, then measure again.",
  },
  {
    id: "cost",
    section: "06 / Cost & observability",
    title: "Choose the pace. Measure the whole flow.",
    lead: "Cost rises with throughput, retries, context size and environment lifetime.",
    body: `${columns(["Budget before dispatch", "Set per-run token or spend ceilings, retry limits, concurrency and environment TTL. Alert near limits; pause at the cap."], ["Subscription-first option", "Use included capacity where provider terms and tooling permit. Queue work when limits are reached. Any metered overflow needs an explicit budget."], ["Compare like with like", "Track median and p90 cost, acceptance rate and review time per work type. Faster is useful only if quality and total cost hold."])}${gate("Pilot baseline → agreed operating ranges", "Example policy: alert at 80% of a run budget; stop at 100%; at most two repair attempts. These are proposed controls, not measured results.")}`,
    notes:
      "No fixed dollar estimate is credible before measuring representative runs and reviewing licences. Subscription usage still has finite limits and allocated seat cost. Do not equate API-equivalent estimates with billed spend. The synthetic demo estimates cost; real cloud execution, CI, previews and human effort must be instrumented. No automatic switch from subscription to paid API.",
  },
  {
    id: "debug",
    section: "06 / Debugging a run",
    title: "Follow one ID from signal to outcome.",
    lead: "A person should be able to explain why a run acted, failed or became expensive.",
    body: `<div class="trace"><span>Signal</span>→<span>Task</span>→<span>Run</span>→<span>Commit</span>→<span>Preview</span>→<span>Release</span></div>${columns(["What we record", "Prompt and skill versions; model; tool calls; tokens and cache; latency; retries; check results; approvals; preview and trace links."], ["Where we investigate", "A run timeline shows the first failing gate. Cost breakdown separates author, reviewer, repair attempts and environment time."], ["How we improve", "Reproduce with sanitised fixtures. Fix the failing rule or context. Add a regression case, review it and compare the next cohort."])}${gate("Example investigation", "Cost rises → find repeated repair attempts → inspect failing browser assertion → fix missing project context → rerun within the same cap.")}`,
    notes:
      "Production logs need access controls, redaction and retention limits. Do not collect secrets or all user research into one shared trace. Store the minimum authorised evidence needed to reproduce the issue. Track approval queue time and total cycle time alongside model latency.",
  },
  {
    id: "antiburn",
    section: "06 / Learn from actual usage",
    title: "Make token waste visible with Antiburn.",
    lead: "Use local session diagnostics to improve prompts, context and tool configuration.",
    body: `<div class="antiburn-panels"><article><span class="eyebrow">CONTEXT</span><div class="spark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><h3>Growth & compaction</h3><p>Inspect context depth, token traffic and subagent activity.</p></article><article><span class="eyebrow">COST</span><div class="cost-bars" aria-hidden="true"><i></i><i></i><i></i></div><h3>Where usage goes</h3><p>Break down parent/subagent usage and input, output and cache costs.</p></article><article><span class="eyebrow">TOOLS</span><div class="tool-lines" aria-hidden="true">Skills ▰▰▰<br>MCPs ▰▰<br>Tools ▰▰▰▰</div><h3>Loaded but unused</h3><p>Find skills, MCP servers and tools that consume context without being used.</p></article></div><p class="source-line">Conceptual feature illustration, not live usage. ${link("https://antiburn.com/", "View Antiburn features")} · Verified 28 September 2026.</p>${gate("Team practice we add", "Review redacted examples together; compare task outcomes before and after prompt changes. Antiburn is local diagnostics, not a verified team prompt-scoring platform.")}`,
    notes:
      "Official site describes a local, open-source app with context, cost and tools views, usage-limit meters and checks for wasteful settings. Its example savings use API-pricing equivalents. We should not present those as our savings. Aggregate team outcomes with consent; avoid treating token usage or prompt counts as individual productivity. Link opens the product site for a live feature walkthrough.",
  },
  {
    id: "pillars",
    section: "07 / Running it at scale",
    title: "What it takes to trust the factory.",
    lead: "Five foundations, built into the factory from day one. Together they earn trust.",
    body: pillars(
      [
        "Traceability",
        [
          "Trace every agent session end to end",
          "Log agent and developer tool calls",
          "Token usage and cost per pull request",
        ],
      ],
      [
        "Auditability",
        [
          "Who ran which tool, and when, for agents and developers alike",
          "Review sessions for drift from the agreed task",
          "A permanent record linked to every change",
        ],
      ],
      [
        "Governance",
        [
          "Processes, standards and guardrails that keep AI safe",
          "Meet regulatory requirements and protect sensitive data",
          "Decide who can run which workflows",
        ],
      ],
      [
        "Manageability",
        [
          "Run the same way across teams and products",
          "Shared templates, with local product ownership",
          "Budgets, permissions and skill versions managed in one place",
        ],
      ],
      [
        "Resilience",
        [
          "Not reliant on a single frontier model",
          "Regularly test against open-weight models",
          "Staged deployments with fallback and rollback",
        ],
      ],
      [
        "Trust",
        [
          "All five foundations working together",
          "Confidence that agents can do the work",
          "Agents earn more responsibility on our products over time",
        ],
      ]
    ),
    notes:
      "Traceability: one ID follows signal, task, run, commit and release, with tokens and cost rolled up per PR. Auditability: an append-only record of tool calls for people and agents; periodic session review catches agents drifting from instructions, scope or project rules. Governance: the processes, standards and guardrails that keep AI safe, guiding how we build and apply it. In practice: privacy and security designed into agent-first workflows, regulatory compliance, synthetic or redacted data by default, scoped short-lived credentials, role-based access to start or approve workflows, and retention limits on logs. Manageability: a central control plane for templates, budgets and permissions, with products owning their own domain skills. Resilience: keep an evaluation suite so we can swap or fall back between providers and open-weight models; roll out model and skill changes gradually. Trust is the outcome, not a separate control.",
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
