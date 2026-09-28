# Applied AI delivery workflow: design notes

This repository demonstrates a bounded, inspectable software-delivery loop. It is a synthetic dry run, not a live customer service, autonomous coding fleet, scheduler or webhook server.

## The loop

1. Collect a synthetic product signal with source, owner and baseline.
2. Classify reproducibility and risk. Unclear or safety-related work goes to a person.
3. Prepare a bounded change proposal with a scoped diff and trace.
4. Independently check the reproduction, tests, contract and failure cases before review.
5. Pilot with measured outcomes, a stop threshold, rollback owner and human release decision.
6. Look back for recurring problems and stranded work.

The [editable diagrams](DIAGRAMS.md) show the signal-to-release flow, human ownership across stages, the fail-closed meal-commitment guardrail, and project-local schedule/webhook loop selection. The [main README](README.md) explains how to run the web app, CLI and presentation.

## Safety and evidence

Agents may summarize signals, propose designs and prepare test evidence. They do not infer dietary safety, commit orders, approve deployments or make staffing decisions. Authoritative service data and human review are required for any customer commitment. The supplied fixture checks in this repository are examples, not production test results.

Track cost and outcomes by stage: elapsed time, retries, model and tool use, test cost, accepted changes, recurrence, p90 latency and customer-facing exceptions. The sample values are illustrative, not measured operational baselines. Start in shadow mode, then supervised pilot, then expand only with evidence and named owners.
