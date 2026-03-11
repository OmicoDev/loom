# Loom Task Specs

This directory expands each task from `specs/` into an implementation-oriented document.

## How to use

- Read `specs/README.md` first to understand the global phase order.
- Read the matching `TASK-*.md` file in this directory before implementing a task.
- Finish tasks in numeric order unless a task document explicitly says parallel work is safe.
- Treat these documents as Rust implementation guides, not as permission to change the product scope.

## Common Rust choices

- CLI: `clap`
- Error model: one explicit `AppError` using `thiserror`
- Persistence: `rusqlite` with handwritten SQL and migrations
- Serialization: `serde`, `toml`, `serde_json`
- Logging: `tracing`, `tracing-subscriber`
- Tests: `cargo test`, `tempfile`, `assert_cmd`
- Process execution: `std::process::Command`

## Directory conventions

- `src/domain/`: pure domain types, identifiers, enums, specs, policies
- `src/app/`: orchestration services and use cases
- `src/infra/db/`: SQLite repositories and migrations
- `src/infra/git/`: Git command wrappers and parsers
- `src/infra/materializer/`: backend-specific workspace realization
- `src/infra/runner/`: command execution and isolation backends
- `src/infra/logging/`: tracing setup and log sinks

## Task files

- `TASK-1-freeze-scope-and-write-architectural-adrs.md`
- `TASK-2-scaffold-rust-workspace-and-module-boundaries.md`
- `TASK-3-define-domain-model-and-typed-identifiers.md`
- `TASK-4-define-sqlite-schema-and-repository-interfaces.md`
- `TASK-5-lock-cli-contracts-config-and-capability-probing.md`
- `TASK-6-implement-git-native-source-management.md`
- `TASK-7-implement-workspace-spec-assembly-and-registry-writes.md`
- `TASK-8-implement-the-first-macos-materializer-path.md`
- `TASK-9-implement-the-first-runner-path-with-logs-and-diffs.md`
- `TASK-10-wire-the-end-to-end-macos-mvp-commands.md`
- `TASK-11-implement-shared-cache-modeling-and-mount-behavior.md`
- `TASK-12-implement-warmup-profiles-and-warm-state-layer.md`
- `TASK-13-implement-layer-manifests-export-and-promotion.md`
- `TASK-14-add-linux-capability-detection-and-portable-backend.md`
- `TASK-15-add-reflink-btrfs-linux-backend.md`
- `TASK-16-add-zfs-linux-backend.md`
- `TASK-17-add-windows-capability-detection-and-path-process-rules.md`
- `TASK-18-add-refs-and-vhdx-windows-backends.md`
- `TASK-19-harden-workspace-secret-network-and-resource-policies.md`
- `TASK-20-add-restricted-runners-and-optional-vm-backed-execution-seam.md`
- `TASK-21-stabilize-headless-service-apis-for-future-frontends.md`
- `TASK-22-build-the-first-gui-shell-without-gui-only-behavior.md`
