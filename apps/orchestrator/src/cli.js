import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { orchestrate } from "./engine.js";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const n = args.indexOf(name);
  return n === -1 ? fallback : args[n + 1];
};
const fixture = path.resolve(option("--fixtures", "fixtures/signals.json"));
const policyFile = path.resolve(option("--policy", "policy.json"));
const output = path.resolve(option("--out", "outputs/run.json"));
try {
  const signals = JSON.parse(await readFile(fixture, "utf-8"));
  const policy = JSON.parse(await readFile(policyFile, "utf-8"));
  const workspace = JSON.parse(
    await readFile(
      path.resolve(option("--workspace", "fixtures/workspace.json")),
      "utf-8"
    )
  );
  const triggerType = option("--trigger", "schedule");
  const trigger =
    triggerType === "webhook"
      ? {
          type: "webhook",
          eventType: option("--event-type", "synthetic.feedback.received"),
        }
      : {
          type: "schedule",
          expression: option("--expression", "daily-review"),
        };
  const report = orchestrate(
    signals,
    policy,
    workspace,
    trigger,
    option("--project", "meal-choice-demo")
  );
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Dry-run ${report.runId}: ${report.summary.reviewReady} ready for human review, ${report.summary.humanOnly} human-only, ${report.summary.needsInfo} needs-info; illustrative cost $${report.summary.estimatedUsd}. Output: ${output}`
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
