# Editable workflow diagrams

These diagrams adapt the creator's factory pattern to the Qantas meal-preorder *delivery workflow*, not a customer-facing agent. They are proposals, not depictions of current Qantas architecture.

## 1. Product signal to verified release

```mermaid
flowchart TD
  A["Signals: App feedback, errors, p90, meal-choice misses, waste"] --> B["Collect, deduplicate, reproduce, classify"]
  B -->|Unclear, high risk or not reproducible| H["Human product and engineering queue"]
  B -->|Small, bounded, reproducible| C["Agent in isolated worktree"]
  C --> D["Evidence gate: failing-then-passing test, trace, scoped diff"]
  D -->|Fails or uncertain| H
  D -->|Passes| E["PR, CI, independent review, address comments"]
  E --> F["Beta/pilot: QE and frontline checks"]
  F -->|Human release approval| G["Flagged production rollout and rollback owner"]
  G --> I["Watchdog for stranded work, lookback for repeated failures"]
  I --> A
```

## 2. Inception to production, with human ownership

```mermaid
flowchart TD
  D["Discover: PM owns problem and baseline; agent clusters signals"] --> X["Design: designer owns journey; agent prototypes exceptions"]
  X --> B["Build: engineers own contracts; agent handles bounded slices"]
  B --> Q["Prove: QE owns evidence; agent runs tests and traces"]
  Q --> L["Launch: humans approve safety, commitments and rollout"]
  L --> M["Learn: measure misses, waste, errors, consumption visibility"]
  M --> D
```

## 3. Fail-closed meal-preorder commitment

```mermaid
flowchart TD
  P["Agent proposes a change"] --> S["Validate schema and contract: flight, passenger, meal ID, dietary source version"]
  S --> C["Deterministic checks: cutoff, inventory, dietary attributes, booking state, idempotency"]
  C -->|Unknown or mismatch| H["Quarantine, human review and escalation"]
  C -->|All pass| R["Human-approved release; server-side customer commitment"]
  R --> A["Audit and reconciliation; rollback or compensate"]
  A -->|Drift| H
```

**Boundary:** an engineering agent may propose and test code, but it cannot infer allergen safety or commit a customer's meal. The live service and approved humans own authoritative data and irreversible changes.
