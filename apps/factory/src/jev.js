import { choice, noul, score } from "@typesafe-ai/sdk";

// Jev answers are probabilities. A noul at or above PASS counts as "yes";
// inside the UNSURE band the answer is treated as low confidence.
const PASS = 0.6;
const UNSURE = [0.3, 0.7];
const MIN_CHOICE_CONFIDENCE = 0.6;

const BACKEND_PATH =
  /^(?:apps\/orchestrator|packages\/contracts|apps\/web\/src\/server)\//u;
const FRONTEND_PATH = /^apps\/web\/src\//u;

// Changes here always need a person: guardrails, policy, contracts, CI and fixtures.
const PROTECTED_PATH =
  /^(?:policy\.json|agents\/|packages\/contracts\/|apps\/orchestrator\/|\.agents\/hooks\/|\.claude\/|\.github\/|fixtures\/|outputs\/)/u;
const MAX_REVIEWABLE_LINES = 300;

const SAFETY_DOMAIN =
  "Does this involve dietary or allergen truth, committing or changing a meal order, a booking or a catering change, or real passenger data?";

export const triageQuestions = {
  kind: choice("What kind of ticket is this?", {
    bug: "Existing behaviour is broken or wrong",
    feature: "Asks for new behaviour or a product change",
    question: "Asks for information, not a change",
  }),
  severity: score("How severe is the impact on users?", [
    "Cosmetic: no functional impact",
    "Minor: a workaround exists",
    "Major: a core flow is wrong for some users",
    "Critical: a core flow is broken for most users",
  ]),
  reproducible: noul(
    "Does the ticket give steps a developer could follow to reproduce the problem?"
  ),
  expectedActual: noul(
    "Does the ticket state both the expected and the actual behaviour?"
  ),
  locatable: noul(
    "Does the ticket name the screen, route or feature that is affected?"
  ),
  smallFix: noul(
    "Could this plausibly be fixed with one small, self-contained code change?"
  ),
  safetyDomain: noul(SAFETY_DOMAIN),
};

const CLARITY = {
  expectedActual: "expected vs actual behaviour",
  locatable: "the affected screen or route",
  reproducible: "reproduction steps",
  smallFix: "a scope small enough for one change",
};

export async function triage(client, ticket) {
  const { answers, model, usage } = await client.systemOne({
    questions: triageQuestions,
    state: { body: ticket.body, id: ticket.id, title: ticket.title },
  });
  return { ...decideTriage(answers), answers, model, usage };
}

export function decideTriage(answers) {
  if (answers.safetyDomain.noul >= PASS) {
    return {
      reasons: ["Touches dietary, booking, catering or passenger data"],
      route: "human_only",
    };
  }
  if (answers.kind.confidence < MIN_CHOICE_CONFIDENCE) {
    return {
      reasons: ["Unsure what kind of ticket this is"],
      route: "needs_info",
    };
  }
  if (answers.kind.choice !== "bug") {
    return {
      reasons: [`A ${answers.kind.choice} needs a product decision, not a fix`],
      route: "human_only",
    };
  }
  const missing = Object.entries(CLARITY)
    .filter(([key]) => answers[key].noul < PASS)
    .map(([, label]) => `Missing ${label}`);
  if (missing.length > 0) {
    return { reasons: missing, route: "needs_info" };
  }
  return { reasons: ["Clear, reproducible, small bug"], route: "eligible" };
}

export const reviewRouteQuestions = {
  backend: noul(
    "Do these changes touch backend code: server functions in apps/web/src/server, the orchestrator in apps/orchestrator, or shared contracts in packages/contracts?"
  ),
  frontend: noul(
    "Do these changes touch React UI code under apps/web/src (components, routes, hooks, lib, styles or their tests), excluding apps/web/src/server?"
  ),
};

export async function routeReviews(
  client,
  { changedFiles, diffStat, handoff }
) {
  const { answers, model, usage } = await client.systemOne({
    questions: reviewRouteQuestions,
    state: { changedFiles, diffStat, surfacesFromRca: handoff.surfaces },
  });
  return { ...decideReviews(answers, changedFiles), answers, model, usage };
}

/**
 * Trust Jev when it is confident; fall back to the changed paths when it is not.
 * At least one review always runs, defaulting to frontend because the factory
 * targets the web app.
 */
export function decideReviews(answers, changedFiles) {
  const byPath = reviewsByPath(changedFiles);
  const pick = (key) => {
    const p = answers[key].noul;
    const unsure = p > UNSURE[0] && p < UNSURE[1];
    return unsure
      ? { needed: byPath[key], source: "paths" }
      : { needed: p >= UNSURE[1], source: "jev" };
  };
  const backend = pick("backend");
  const frontend = pick("frontend");
  if (!backend.needed && !frontend.needed) {
    return { backend, frontend: { needed: true, source: "default" } };
  }
  return { backend, frontend };
}

export function reviewsByPath(changedFiles) {
  return {
    backend: changedFiles.some((file) => BACKEND_PATH.test(file)),
    frontend: changedFiles.some(
      (file) => FRONTEND_PATH.test(file) && !BACKEND_PATH.test(file)
    ),
  };
}

export const gateQuestions = {
  requiresHuman: noul("Should a person review this change before it merges?", {
    false:
      "A small, well-tested bug fix that matches the ticket and the root cause, with reviewers satisfied",
    true: "The change is broad, risky, off-ticket, weakly tested, or reviewers left open concerns",
  }),
  reviewersSatisfied: noul(
    "Did the reviewers approve or fix everything they found, leaving no open concerns?"
  ),
  risk: score("How risky is it to merge this change?", [
    "Trivial: isolated, covered by tests",
    "Low: small and tested, limited blast radius",
    "Medium: touches shared code or behaviour other features rely on",
    "High: broad, cross-cutting, or hard to roll back",
  ]),
  safetyDomain: noul(SAFETY_DOMAIN),
};

export async function gate(client, evidence) {
  const { answers, model, usage } = await client.systemOne({
    questions: gateQuestions,
    state: {
      changedFiles: evidence.changedFiles,
      diff: evidence.diff,
      fix: evidence.fix,
      reviews: evidence.reviews,
      rootCause: evidence.handoff.rootCause,
      ticket: evidence.ticket.body,
    },
  });
  return { ...decideGate(answers, evidence), answers, model, usage };
}

export function decideGate(answers, evidence) {
  const reasons = [
    ...ruleReasons(evidence),
    answers.requiresHuman.noul >= PASS && "Jev flagged the change for a person",
    answers.safetyDomain.noul >= PASS &&
      "Jev flagged dietary, booking, catering or passenger impact",
    answers.reviewersSatisfied.noul < PASS &&
      "Jev is not satisfied the reviews are resolved",
    answers.risk.score >= 2 &&
      `Jev rated merge risk ${answers.risk.score.toFixed(1)} of 3`,
  ].filter(Boolean);
  return { humanReview: reasons.length > 0, reasons };
}

function ruleReasons({ changedFiles, diffLines, fix, reviews }) {
  const protectedFiles = changedFiles.filter((file) =>
    PROTECTED_PATH.test(file)
  );
  const failedChecks = Object.entries(fix.checks)
    .filter(([, status]) => status !== "pass")
    .map(([name]) => name);
  const openReviews = reviews.filter(
    ({ result }) =>
      result.verdict === "concerns" || result.unresolved.length > 0
  );
  return [
    protectedFiles.length > 0 &&
      `Touches protected paths: ${protectedFiles.join(", ")}`,
    failedChecks.length > 0 && `Checks not passing: ${failedChecks.join(", ")}`,
    openReviews.length > 0 &&
      `Open review concerns from: ${openReviews.map(({ kind }) => kind).join(", ")}`,
    diffLines > MAX_REVIEWABLE_LINES &&
      `Diff is ${diffLines} lines, over the ${MAX_REVIEWABLE_LINES} line limit`,
  ];
}
