# Phase 3 - Linux Optimized Backends

Phase 3 extends the same logical workspace model to Linux. The order matters: deliver the portable backend first, then add optimized storage-aware backends.

## TASK-14 - Add Linux capability detection and portable backend

Depends on: TASK-5, TASK-13

Goal:

- Make Linux usable everywhere before chasing advanced copy-on-write features.

Work:

- Extend capability probing to detect Linux filesystem and privilege features relevant to workspace materialization.
- Implement `PortableCopyMaterializer` as the Linux baseline.
- Define backend selection rules so portable behavior is always available when optimized backends are not.
- Validate that layer manifests and workspace lineage remain unchanged when the backend changes.

Deliverables:

- Linux capability probe output.
- Portable Linux materializer.

Acceptance:

- Linux can materialize and destroy workspaces without Btrfs or ZFS.
- The logical model remains identical to the macOS path.

## TASK-15 - Add reflink/Btrfs Linux backend

Depends on: TASK-14

Goal:

- Provide the default optimized Linux path for quick derived workspaces.

Work:

- Implement a reflink-oriented materializer for Linux environments that support cheap copy-on-write duplication.
- Add Btrfs-friendly optimizations where capability probing confirms support.
- Define failure and fallback behavior when reflink assumptions are not met.
- Benchmark correctness and workspace lifecycle behavior against the portable backend.

Deliverables:

- `ReflinkMaterializer` or equivalent Btrfs-friendly backend.
- Capability-gated backend selection and fallback coverage.

Acceptance:

- Optimized Linux workspaces preserve the same lineage and policy semantics as the portable backend.
- Fallback behavior is explicit and does not corrupt workspace state.

## TASK-16 - Add ZFS Linux backend

Depends on: TASK-14, TASK-15

Goal:

- Provide the advanced Linux backend for environments that intentionally choose dataset-native lineage.

Work:

- Implement `ZfsCloneMaterializer` using snapshot/clone semantics.
- Map layer lineage to dataset lifecycle operations without changing the public workspace model.
- Define advanced-only operational constraints such as dataset layout, cleanup rules, and capability reporting.
- Verify that exported layer metadata still reads as logical artifacts instead of filesystem jargon.

Deliverables:

- ZFS materializer and operator guidance.
- Capability reports that distinguish default and advanced Linux paths.

Acceptance:

- ZFS support is an additive backend, not the only Linux strategy.
- A caller using workspace services does not need a new logical contract to use the ZFS backend.

## Phase 3 exit

- Linux supports one portable path and at least one optimized path.
- Btrfs/reflink is the default optimized Linux strategy.
- ZFS is available as an advanced backend without redefining the architecture.
