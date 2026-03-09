# Phase 1 - macOS-first MVP

Phase 1 delivers the first version of `loom` that is useful for daily local work on macOS. The target is a clean local orchestrator, not a fully locked-down sandbox.

## TASK-6 - Implement Git-native source management

Depends on: TASK-4, TASK-5

Goal:

- Make Git the source-of-truth for repository lineage, branch isolation, and patch generation.

Work:

- Implement project registration from a repository path and baseline ref.
- Implement baseline commit resolution and branch naming conventions for task workspaces.
- Implement `git worktree` create, inspect, reconcile, and cleanup flows.
- Implement diff and patch capture for completed runs.

Deliverables:

- `SourceManager` implementation with clear lifecycle APIs.
- Registry records for source lineage and worktree paths.

Acceptance:

- Source lineage is entirely owned by Git-facing code.
- Workspace materialization does not take over branch or commit responsibility.

## TASK-7 - Implement workspace spec assembly and registry writes

Depends on: TASK-4, TASK-5, TASK-6

Goal:

- Assemble the full logical workspace model before any platform-specific materialization happens.

Work:

- Implement application services that turn a project, base, selected layers, and policy defaults into a `WorkspaceSpec`.
- Persist workspace lineage, cache attachments, log locations, and run metadata.
- Define workspace status transitions such as created, materialized, running, completed, failed, and cleaned.
- Ensure run records reference both the workspace and the policy context used for execution.

Deliverables:

- `WorkspaceService` and `RunService` orchestration flow.
- Stable `WorkspaceSpec` and `WorkspaceHandle` lifecycle model.

Acceptance:

- A workspace can be described completely before the first directory or APFS clone is created.
- Registry writes are consistent enough to support cleanup and crash recovery later.

## TASK-8 - Implement the first macOS materializer path

Depends on: TASK-5, TASK-7

Goal:

- Create cheap derived workspaces on macOS while keeping the backend hidden behind the `Materializer` contract.

Work:

- Implement `ApfsMaterializer` for the first optimized macOS path.
- Add capability-based fallback behavior for environments where APFS clone-like features are unavailable.
- Materialize source view, writable task state, shared caches, and artifact/log directories.
- Implement workspace destroy and cleanup behavior.

Deliverables:

- First working `Materializer` implementation for macOS.
- Backend selection logic driven by capability data.

Acceptance:

- The materializer only decides how bits become directories or volumes.
- The workspace lifecycle can succeed without changing the domain model if the backend falls back to a less optimized path.

## TASK-9 - Implement the first runner path with logs and diffs

Depends on: TASK-5, TASK-7, TASK-8

Goal:

- Execute commands inside a materialized workspace without coupling execution policy to storage strategy.

Work:

- Implement `HostRunner` for the initial macOS path.
- Build run environment preparation, command execution, timestamps, exit-status handling, and log capture.
- Inject only explicit environment settings instead of inheriting full shell state by default.
- Capture post-run diff and artifact pointers for later inspection.

Deliverables:

- First runner implementation and `RunResult` capture flow.
- Structured log and exit-status records in the registry.

Acceptance:

- A run record contains command, timestamps, logs, exit status, and produced diffs or artifacts.
- Execution policy can be strengthened later without rewriting the materializer.

## TASK-10 - Wire the end-to-end macOS MVP commands

Depends on: TASK-6, TASK-7, TASK-8, TASK-9

Goal:

- Ship the smallest daily-usable version of `loom`.

Work:

- Wire `project add`, `project list`, `workspace create`, `workspace exec`, `workspace diff`, and `workspace clean`.
- Ensure command outputs are compact and explicit rather than magical.
- Add integration tests for project registration, workspace creation, command execution, diff capture, and cleanup.
- Document the macOS-first happy path and known limitations.

Deliverables:

- Working CLI for daily local usage on macOS.
- MVP test coverage and operator documentation.

Acceptance:

- A user can register a repo, create a task workspace, run a command, inspect the diff, and clean up the workspace using `loom`.
- The MVP does not depend on heavy sandboxing to be useful.

## Phase 1 exit

- `loom` is usable on macOS for real task work.
- Git lineage, workspace materialization, and command execution are separated in code and in behavior.
- Logs, statuses, and diffs are inspectable after each run.
