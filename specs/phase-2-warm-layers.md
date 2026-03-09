# Phase 2 - Warm Layers and Cache Policy

Phase 2 adds reuse. After the MVP proves the architecture, this phase makes repeated work cheaper without turning layers into a filesystem-only concept.

## TASK-11 - Implement shared cache modeling and mount behavior

Depends on: TASK-7, TASK-10

Goal:

- Model reusable caches explicitly so they can be attached safely and predictably across workspaces.

Work:

- Define cache identities, mount semantics, ownership rules, and invalidation boundaries.
- Implement `CacheLayer` metadata for common cache kinds such as Gradle, Cargo, Maven, and toolchain caches.
- Extend workspace creation so caches are attached through policy and capability-aware rules.
- Record cache usage in the registry for observability and cleanup.

Deliverables:

- Explicit cache model and registry entries.
- Workspace attach flow for shared caches.

Acceptance:

- Shared caches are visible in metadata, not hidden inside ad hoc mount logic.
- Cache behavior can be explained without talking about a specific filesystem backend.

## TASK-12 - Implement warmup profiles and `WarmStateLayer`

Depends on: TASK-11

Goal:

- Make project warmup behavior reusable and deterministic.

Work:

- Define warmup profiles at the project level, including command sequences and success criteria.
- Implement a workflow that runs warmup commands in a workspace and records the derived state as a `WarmStateLayer`.
- Distinguish reusable prepared state from disposable task state.
- Record warmup provenance so future runs know which base, cache inputs, and profile produced the warm state.

Deliverables:

- Warmup profile model.
- `WarmStateLayer` generation and lookup flow.

Acceptance:

- A warm layer can be reused only when its provenance still matches the requested base and warmup inputs.
- Warmup logic does not blur the line between reusable state and task-local writes.

## TASK-13 - Implement layer manifests, export, and promotion

Depends on: TASK-11, TASK-12

Goal:

- Make layers first-class logical artifacts that can be inspected, promoted, and reused.

Work:

- Define explicit layer manifests with identity, provenance, kind, backend details, and metadata.
- Implement `layer list` and `layer export` flows.
- Define promotion rules for when a `TaskWritableLayer` or warm result becomes an `ArtifactLayer`.
- Add retention and cleanup rules so exported layers do not accumulate without policy.

Deliverables:

- Layer manifest format and storage rules.
- Export and promotion workflow for reusable derived results.

Acceptance:

- Layers are inspectable as logical artifacts regardless of backend.
- Promotion is explicit; disposable task state is never silently turned into a reusable artifact.

## Phase 2 exit

- Cache reuse is policy-driven and visible in metadata.
- Warmup output can be generated, recorded, and reused safely.
- Layers are explicit enough to support later Linux and Windows backends without changing the conceptual model.
