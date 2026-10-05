import { gate, routeReviews, triage } from "./jev.js";
import { MODELS } from "./models.js";
import { fixSchema, handoffSchema, reviewSchema } from "./schemas.js";

const REVIEWERS = {
  backend: {
    extra: "",
    skill: "elite-backend",
  },
  frontend: {
    extra:
      "Then run `pnpm run react-doctor` and fix every error it reports in files this branch touched.",
    skill: "elite-react",
  },
};

/**
 * ticket -> Jev triage -> Sonnet root cause -> Opus fix -> Jev review routing
 * -> Opus reviews -> Jev merge gate -> PR -> human, or Opus + elite-merge.
 *
 * Every dependency is injected so the flow can be tested without models,
 * Docker or GitHub. `record` persists each step's artifact.
 */
export async function runFactory(deps) {
  const { agents, base, branch, git, jev, log, openPr, record, ticket } = deps;
  log("triage", "Jev is triaging the ticket");
  const triaged = await triage(jev, ticket);
  await record("triage", triaged);
  log("triage", `${triaged.route}: ${triaged.reasons.join("; ")}`);
  if (triaged.route !== "eligible") {
    return { reasons: triaged.reasons, status: triaged.route };
  }

  log("sandbox", "Starting the sandbox and running pnpm install (minutes)");
  const sandbox = await agents.openSandbox(branch);
  let built;
  try {
    built = await build(deps, sandbox, triaged);
  } finally {
    await sandbox.close();
  }
  if (built.stop) {
    return built.stop;
  }

  log("gate", "Jev is deciding whether a person must review");
  const changes = await git.changes(base, branch);
  const verdict = await gate(jev, { ...built, ...changes, ticket });
  await record("gate", verdict);

  if (!openPr) {
    return { branch, reasons: verdict.reasons, status: "branch_ready" };
  }
  log("pr", "Opening the pull request");
  const prUrl = await git.openPr({
    base,
    body: prBody({ ...built, changes, ticket, triaged, verdict }),
    branch,
    humanReview: verdict.humanReview,
    title: `fix: ${ticket.title} (${ticket.id})`,
  });
  await record("pr", { url: prUrl });
  if (verdict.humanReview) {
    return { branch, prUrl, reasons: verdict.reasons, status: "human_review" };
  }

  log("merge", `${MODELS.engineer} is babysitting the PR with elite-merge`);
  const merged = await agents.merge({
    args: { BRANCH: branch, PR_URL: prUrl, TICKET_ID: ticket.id },
    branch,
  });
  await record("merge", merged);
  return { branch, prUrl, reasons: [merged.reason], status: merged.status };
}

/** The Claude steps, all inside one sandbox on one branch. */
async function build(
  { agents, base, branch, git, jev, log, record, ticket },
  sandbox,
  triaged
) {
  const shared = {
    TICKET_BODY: ticket.body,
    TICKET_ID: ticket.id,
    TICKET_TITLE: ticket.title,
  };

  log("rca", `${MODELS.analyst} is finding the root cause`);
  const { output: handoff } = await agents.step(sandbox, {
    args: {
      ...shared,
      TRIAGE: JSON.stringify({
        reasons: triaged.reasons,
        route: triaged.route,
      }),
    },
    model: MODELS.analyst,
    name: "rca",
    prompt: "rca.md",
    schema: handoffSchema,
    tag: "handoff",
  });
  await record("handoff", handoff);

  log("fix", `${MODELS.engineer} is making the minimum fix`);
  const { commits, output: fix } = await agents.step(sandbox, {
    args: {
      ...shared,
      BRANCH: branch,
      HANDOFF: JSON.stringify(handoff, null, 2),
    },
    model: MODELS.engineer,
    name: "fix",
    prompt: "fix.md",
    schema: fixSchema,
    tag: "fix",
  });
  await record("fix", { ...fix, commits });
  if (commits.length === 0) {
    return {
      stop: { reasons: ["The fix agent made no commits"], status: "no_fix" },
    };
  }

  log("route", "Jev is choosing reviewers");
  const route = await routeReviews(jev, {
    ...(await git.changes(base, branch)),
    handoff,
  });
  await record("route", route);

  const reviews = [];
  for (const kind of ["backend", "frontend"]) {
    if (!route[kind].needed) {
      continue;
    }
    const reviewer = REVIEWERS[kind];
    log(
      `review-${kind}`,
      `${MODELS.engineer} is reviewing with ${reviewer.skill}`
    );
    // oxlint-disable-next-line no-await-in-loop -- both reviewers commit to the same worktree, so they must not overlap
    const review = await agents.step(sandbox, {
      args: {
        ...shared,
        BASE: base,
        BRANCH: branch,
        EXTRA: reviewer.extra,
        FIX_SUMMARY: fix.summary,
        KIND: kind,
        ROOT_CAUSE: handoff.rootCause,
        SKILL: reviewer.skill,
      },
      model: MODELS.engineer,
      name: `review-${kind}`,
      prompt: "review.md",
      schema: reviewSchema,
      tag: "review",
    });
    reviews.push({ commits: review.commits, kind, result: review.output });
    // oxlint-disable-next-line no-await-in-loop -- recorded as each review lands so a crash keeps earlier artifacts
    await record(`review-${kind}`, {
      ...review.output,
      commits: review.commits,
    });
  }
  return { fix, handoff, reviews, route };
}

const list = (items) => items.map((item) => `- ${item}`).join("\n");
const yesNo = ({ needed, source }) => `${needed ? "yes" : "no"} (${source})`;

function reviewLine({ kind, result }) {
  const fixed = result.findings.filter((finding) => finding.fixed).length;
  const open =
    result.unresolved.length > 0
      ? `; unresolved: ${result.unresolved.join("; ")}`
      : "";
  return `- **${kind}**: ${result.verdict}, ${result.findings.length} finding(s), ${fixed} fixed${open}`;
}

export function prBody({
  changes,
  fix,
  handoff,
  reviews,
  route,
  ticket,
  triaged,
  verdict,
}) {
  const why = verdict.humanReview
    ? `### Why a person must review\n\n${list(verdict.reasons)}\n\n`
    : "";
  return `## ${ticket.id}: ${ticket.title}

${fix.summary}

### Root cause (${MODELS.analyst}, ${handoff.confidence} confidence)

${handoff.rootCause}

### Pipeline

| Step | Result |
| --- | --- |
| Jev triage | ${triaged.route}: ${triaged.reasons.join("; ")} |
| Fix checks | lint ${fix.checks.lint}, typecheck ${fix.checks.typecheck}, test ${fix.checks.test} |
| Review routing | backend ${yesNo(route.backend)}, frontend ${yesNo(route.frontend)} |
| Jev merge gate | ${verdict.humanReview ? "**needs human review**" : "cleared for automated merge"} |

${why}### Reviews

${reviews.map(reviewLine).join("\n")}

### Tests added

${list(fix.testsAdded)}

### Changed files

\`\`\`
${changes.diffStat}
\`\`\`

Opened by the factory CLI (\`pnpm factory\`) from a synthetic ticket.
`;
}
