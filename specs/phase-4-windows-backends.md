# Phase 4 - Windows Optimized Backends

Phase 4 adds Windows-specific realization strategies while preserving the same domain model and service APIs used on macOS and Linux.

## TASK-17 - Add Windows capability detection and path/process rules

Depends on: TASK-5, TASK-13

Goal:

- Prepare the system for Windows-specific behavior without leaking Windows assumptions into the core model.

Work:

- Extend capability probing to detect ReFS support, VHDX options, path constraints, and other Windows-relevant backend signals.
- Define path normalization, workspace-location rules, and process-execution constraints that the runner and materializer can consume.
- Verify that project registration, layer metadata, and workspace handles remain platform-neutral at the app layer.
- Expand `doctor` output to show Windows backend eligibility clearly.

Deliverables:

- Windows capability model and probe outputs.
- Platform-specific normalization rules behind infrastructure interfaces.

Acceptance:

- Windows support is represented as capability data and backend implementations, not domain-level branching everywhere.
- `doctor` can explain why a Windows backend is or is not available.

## TASK-18 - Add ReFS and VHDX Windows backends

Depends on: TASK-17

Goal:

- Offer optimized Windows workspace realization options that still obey the same workspace and layer semantics.

Work:

- Implement a ReFS-aware backend for environments where block-clone-friendly storage is available.
- Implement a VHDX-based backend for stronger base-plus-writable-layer semantics where that model fits better.
- Define backend selection and cleanup rules for both strategies.
- Validate that workspace create, exec, diff, export, and destroy flows behave consistently with other platforms.

Deliverables:

- Windows optimized materializers.
- Cross-platform conformance tests for workspace semantics.

Acceptance:

- Windows storage-model divergence remains hidden behind the `Materializer` contract.
- The same CLI and service workflows work on Windows without inventing Windows-only product concepts.

## Phase 4 exit

- Windows capability detection is explicit and debuggable.
- At least one optimized Windows materializer exists behind the shared contracts.
- Cross-platform behavior still reads as one product, not three unrelated tools.
