# Loom Linear Specs

This directory rewrites `plan.md` (in this directory) into a build order that can be executed from top to bottom.

## How to use this folder

- Read this file first to understand the global sequence.
- Execute tasks in task-ID order unless a task explicitly states otherwise.
- Treat each phase file as the detailed spec for the tasks listed here.
- Do not pull later-phase work into earlier phases unless the phase file explicitly calls for it.

## Global guardrails

- Keep the product definition fixed: `loom` is a Git-native workspace sandbox orchestrator, not a container engine.
- Keep `SourceManager`, `Materializer`, and `Runner` separated from day one.
- Treat layers as logical artifacts; do not require OCI compatibility or union-mount semantics.
- Optimize for macOS first, then add Linux and Windows backends without changing the logical model.
- Keep v0-v2 free of remote registry work, distributed execution, mandatory microVMs, advanced UI, and plugin-platform ambitions.
- Prefer a small Rust codebase with explicit modules, typed config, SQLite repositories, and synchronous control flow until concurrency is required.

## Phase files

- `phase-0-architecture-skeleton.md`
- `phase-1-macos-mvp.md`
- `phase-2-warm-layers.md`
- `phase-3-linux-backends.md`
- `phase-4-windows-backends.md`
- `phase-5-stronger-isolation.md`
- `phase-6-gui-surfaces.md`

## Linear task list

| ID | Phase | Task | Depends on |
| --- | --- | --- | --- |
| TASK-1 | 0 | Freeze scope and write architectural ADRs | - |
| TASK-2 | 0 | Scaffold the Rust workspace and module boundaries | TASK-1 |
| TASK-3 | 0 | Define the domain model and typed identifiers | TASK-2 |
| TASK-4 | 0 | Define SQLite schema and repository interfaces | TASK-3 |
| TASK-5 | 0 | Lock CLI contracts, config model, and capability probing | TASK-2, TASK-3, TASK-4 |
| TASK-6 | 1 | Implement Git-native source management | TASK-4, TASK-5 |
| TASK-7 | 1 | Implement workspace spec assembly and registry writes | TASK-4, TASK-5, TASK-6 |
| TASK-8 | 1 | Implement the first macOS materializer path | TASK-5, TASK-7 |
| TASK-9 | 1 | Implement the first runner path with logs and diffs | TASK-5, TASK-7, TASK-8 |
| TASK-10 | 1 | Wire the end-to-end macOS MVP commands | TASK-6, TASK-7, TASK-8, TASK-9 |
| TASK-11 | 2 | Implement shared cache modeling and mount behavior | TASK-7, TASK-10 |
| TASK-12 | 2 | Implement warmup profiles and `WarmStateLayer` | TASK-11 |
| TASK-13 | 2 | Implement layer manifests, export, and promotion | TASK-11, TASK-12 |
| TASK-14 | 3 | Add Linux capability detection and portable backend | TASK-5, TASK-13 |
| TASK-15 | 3 | Add reflink/Btrfs Linux backend | TASK-14 |
| TASK-16 | 3 | Add ZFS Linux backend | TASK-14, TASK-15 |
| TASK-17 | 4 | Add Windows capability detection and path/process rules | TASK-5, TASK-13 |
| TASK-18 | 4 | Add ReFS and VHDX Windows backends | TASK-17 |
| TASK-19 | 5 | Harden workspace, secret, network, and resource policies | TASK-10, TASK-13 |
| TASK-20 | 5 | Add restricted runners and optional VM-backed execution seam | TASK-19 |
| TASK-21 | 6 | Stabilize headless service APIs for future frontends | TASK-10, TASK-13, TASK-20 |
| TASK-22 | 6 | Build the first GUI shell without introducing GUI-only behavior | TASK-21 |

## Suggested execution rhythm

- Finish all acceptance criteria for a task before starting the next task.
- After each phase, run a short review: check whether any phase output violated the guardrails above.
- Write ADRs only when a new architectural commitment is made; do not create speculative design docs for optional future work.
- Treat platform-specific code as backend implementations behind stable domain and app-layer contracts.

## Phase exits

- Phase 0 exits when the project compiles, the schema exists, the CLI tree exists, and the architecture decisions are documented.
- Phase 1 exits when `loom` is usable for daily local work on macOS.
- Phase 2 exits when caches, warm state, and reusable derived layers are explicit and inspectable.
- Phase 3 exits when Linux has both portable and optimized materializers without changing the logical model.
- Phase 4 exits when Windows backends preserve the same workspace semantics behind Windows-specific storage strategies.
- Phase 5 exits when policy enforcement is materially stronger than the MVP and does not collapse the architecture.
- Phase 6 exits when a GUI can sit on top of the existing orchestration core instead of reimplementing it.
