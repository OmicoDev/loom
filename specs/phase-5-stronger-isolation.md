# Phase 5 - Stronger Isolation

Phase 5 strengthens execution boundaries after the core workspace model, cache model, and backend model are already stable. This phase should harden the system without rewriting earlier architectural choices.

## TASK-19 - Harden workspace, secret, network, and resource policies

Depends on: TASK-10, TASK-13

Goal:

- Turn the security model from an MVP convention into enforceable product behavior.

Work:

- Implement explicit workspace-boundary rules for what a task can see by default.
- Implement secret policy inputs such as allowed environment variables, scoped credentials, temporary tokens, and no-secret mode.
- Implement network policy modes such as offline, allowlisted egress, and full network.
- Implement resource policy fields for runtime, memory, CPU, and log-size limits.
- Ensure all policy selections are recorded in runs and visible in the registry.

Deliverables:

- Full policy model wired into workspace creation and run execution.
- Auditable policy records for each run.

Acceptance:

- No run silently inherits unrestricted developer shell state.
- A reviewer can inspect a run and determine what workspace, secret, network, and resource boundaries were applied.

## TASK-20 - Add restricted runners and optional VM-backed execution seam

Depends on: TASK-19

Goal:

- Add stronger execution isolation without polluting storage architecture or the domain model.

Work:

- Implement one or more restricted runner variants behind the shared `Runner` contract.
- Define how restricted runners receive policy inputs and mount rules.
- Add an optional VM-backed execution seam for future stronger isolation without making it mandatory.
- Validate that run capture, logs, diffs, and artifact tracking still work across runner variants.

Deliverables:

- Restricted runner implementation.
- Optional VM-oriented runner seam and operator guidance.

Acceptance:

- Stronger isolation is an additive runner choice rather than a rewrite of the workspace system.
- The product still works in environments that do not use VM-backed execution.

## Phase 5 exit

- Policy enforcement is explicit, auditable, and materially stronger than the MVP.
- Runner variants can evolve independently from materializers.
- Future isolation work can continue behind the existing execution contract.
