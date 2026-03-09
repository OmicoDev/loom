# Phase 0 - Architecture Skeleton

Phase 0 turns `plan.md` into a compilable Rust skeleton with explicit architecture boundaries. Nothing in this phase should depend on APFS, Btrfs, ZFS, ReFS, or any runner sandbox trick.

## TASK-1 - Freeze scope and write architectural ADRs

Depends on: none

Goal:

- Turn the plan's major judgments into a small set of non-negotiable decisions that later tasks must follow.

Work:

- Record the product definition: `loom` is a cross-platform, OCI-inspired, Git-native workspace sandbox orchestrator.
- Record the negative space: no OCI image compatibility, no remote registry protocol, no distributed execution, no mandatory microVMs, no advanced UI in early phases.
- Record the architectural seams: `SourceManager` owns source lineage, `Materializer` owns workspace realization, `Runner` owns execution policy.
- Record platform strategy: one logical model, multiple backend implementations.

Deliverables:

- ADR set covering scope, non-goals, subsystem boundaries, platform strategy, and early-phase exclusions.
- Phase gates for Phase 0 and Phase 1.

Acceptance:

- A new contributor can explain what `loom` is and what it is not after reading the ADRs.
- No early-phase task requires revisiting the OCI or plugin question.

## TASK-2 - Scaffold the Rust workspace and module boundaries

Depends on: TASK-1

Goal:

- Create a minimal codebase that mirrors the intended architecture before real behavior is implemented.

Work:

- Create `main.rs`, `cli.rs`, `config.rs`, and `error.rs`.
- Create the domain-first layout: `domain/`, `app/`, and `infra/`.
- Add placeholder modules for `db`, `git`, `materializer`, `runner`, and `logging`.
- Keep the skeleton synchronous by default; do not introduce async runtimes yet.

Deliverables:

- A compilable Cargo project with empty or stubbed implementations.
- Clear ownership boundaries between domain, application services, and infrastructure.

Acceptance:

- `cargo check` passes.
- Platform-specific code exists only under infrastructure-facing modules.
- No framework-heavy architecture or hidden magic is introduced.

## TASK-3 - Define the domain model and typed identifiers

Depends on: TASK-2

Goal:

- Encode the core product concepts so every later task builds on the same vocabulary.

Work:

- Define typed models for `Project`, `Base`, `Layer`, `Workspace`, `Run`, `Policy`, and `Capability`.
- Define typed IDs and lineage references instead of passing raw strings around the system.
- Model layer kinds explicitly: `SourceBaseLayer`, `CacheLayer`, `WarmStateLayer`, `TaskWritableLayer`, `ArtifactLayer`.
- Define `WorkspaceSpec`, `RunContext`, and result types at the domain boundary.

Deliverables:

- Stable domain structs and enums.
- Shared vocabulary for application services and repositories.

Acceptance:

- The model can express all concepts listed in sections 4, 10, 11, 12, and 13 of `plan.md`.
- The domain model does not depend on APFS, Git CLI output, or OS-specific types.

## TASK-4 - Define SQLite schema and repository interfaces

Depends on: TASK-3

Goal:

- Persist the core entities with a small explicit data layer.

Work:

- Design SQLite tables for projects, bases, layers, workspaces, runs, policies, and capabilities.
- Define repository traits or small explicit repository structs without using an ORM.
- Encode lineage metadata, artifact paths, timestamps, status fields, and backend selection data.
- Define migration strategy and bootstrapping rules for initializing a fresh registry database.

Deliverables:

- Initial schema and migrations.
- Repository interfaces or concrete repository layer used by application services.

Acceptance:

- All core entities can be created and fetched without ad hoc JSON blobs standing in for the data model.
- The persistence layer is small enough that a maintainer can inspect it quickly.

## TASK-5 - Lock CLI contracts, config model, and capability probing

Depends on: TASK-2, TASK-3, TASK-4

Goal:

- Freeze the main user-facing entry points and the machine-facing capability model before feature work expands.

Work:

- Define the initial CLI tree: `project add`, `project list`, `workspace create`, `workspace warm`, `workspace exec`, `workspace diff`, `workspace clean`, `run agent`, `layer list`, `layer export`, and `doctor`.
- Define a small typed config model with explicit defaults and predictable file locations.
- Define capability probing output that later materializers and runners can consume.
- Decide what the `doctor` command reports in Phase 0 even if some probes are still stubbed.

Deliverables:

- Stable CLI command contracts and help text.
- Config schema and loading rules.
- Capability model that describes platform/backend support without hardcoding it into the domain layer.

Acceptance:

- A user can inspect the CLI and understand the product shape before the MVP is finished.
- Capability probing is represented as data, not as scattered conditionals.

## Phase 0 exit

- The Rust project compiles.
- The domain model, repository model, and CLI surface are defined.
- The architecture guardrails are documented and can be referenced by later implementation tasks.
