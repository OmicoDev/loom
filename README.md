# loom

> Cross-platform, OCI-inspired, Git-native workspace sandbox orchestrator for AI coding tasks.

## Status

- This repository is currently planning-first and documentation-driven.
- The first implementation target is a macOS-first CLI.
- The intended implementation language is Rust.
- A runnable Rust workspace and CLI have not landed yet.
- Early usable versions are expected to be clean local orchestrators, not fully hardened sandboxes.

`loom` is being designed as a practical system for creating isolated, reusable, policy-aware task workspaces for AI-assisted software work. The goal is to make workspace lifecycle, cache reuse, source lineage, and execution boundaries explicit without turning the product into a container engine.

In plain terms, the first usable shape of `loom` is a local-first CLI that can register a repository, create a task workspace, run commands or agents inside it, capture logs and diffs, and clean everything up afterward.

## Why This Project Exists

AI coding workflows benefit from fast, disposable task environments, but most existing approaches either overfit to container infrastructure or leave workspace state, caches, and security boundaries implicit.

`loom` aims to provide:

- pre-initialized project baselines
- isolated task workspaces
- branch and workspace lifecycle management
- reusable warm caches and derived layers
- explicit execution, secret, network, and resource policies
- a clean architecture that starts on macOS and expands to Linux and Windows later

The project is also intentionally architecture-heavy so it can serve as a real Rust learning vehicle instead of a toy codebase.

## Product Definition

`loom` is a:

> cross-platform, OCI-inspired, Git-native workspace sandbox orchestrator

That means:

- it borrows the layering mindset from OCI systems without trying to become an OCI implementation
- it treats Git as the source of truth for repository lineage and task isolation
- it keeps the logical workspace model stable while allowing platform-specific materialization backends
- it keeps execution policy separate from storage strategy

## What `loom` Is Not

Early phases explicitly do not try to build:

- full OCI image compatibility
- a remote registry protocol
- distributed execution
- mandatory microVM infrastructure
- an advanced GUI before the headless core is stable
- a plugin platform or framework-heavy architecture

Stronger sandboxing and stricter secret, network, and resource isolation are planned later, after the core workspace model and MVP workflows are stable.

## Core Concepts

The project model is built around a small set of durable concepts:

- `Project`: a registered repository or template with defaults for warmup, cache, policy, and materialization behavior
- `Base`: an immutable source baseline such as a commit or prepared baseline state
- `Layer`: a reusable logical artifact such as source, cache, warm state, or exported task output
- `Workspace`: a materialized environment for one AI task
- `Run`: a concrete execution session inside a workspace with logs, status, diffs, and artifacts

## Architecture

The high-level architecture is intentionally split into clear subsystems:

- `Registry`: durable metadata for projects, bases, layers, workspaces, runs, policies, and capabilities
- `SourceManager`: Git-native source handling, branch management, worktrees, and diff capture
- `Materializer`: platform-aware workspace realization and layer attachment
- `Runner`: command or agent execution, environment setup, policy enforcement, and log capture

Two boundaries matter from day one:

- `SourceManager`, `Materializer`, and `Runner` should remain separate concerns
- platform-specific behavior should live in infrastructure backends, not in the domain model

## Platform Strategy

The guiding rule is:

> unify the logical workspace model, specialize the materialization backend per platform

Current platform direction:

- macOS is the first optimized path, with APFS-friendly materialization as the initial focus
- Linux support follows with a portable backend first, then reflink/Btrfs and ZFS variants
- Windows support follows with capability-driven ReFS and VHDX-oriented backends

## Planned CLI Shape

The CLI is planned to stay compact and explicit.

```text
loom project add
loom project list
loom workspace create
loom workspace warm
loom workspace exec
loom workspace diff
loom workspace clean
loom run agent
loom layer list
loom layer export
loom doctor
```

Illustrative future usage:

```bash
loom workspace create my-app --task fix-login
loom workspace exec my-app/fix-login -- ./gradlew test
loom layer export my-app/fix-login
```

These commands are planned interfaces, not implemented commands in the current repository state.

## Roadmap

The build plan is organized into linear phases:

- `Phase 0`: freeze scope, record architectural decisions, scaffold the Rust workspace, define domain model, schema, config, and CLI contracts
- `Phase 1`: deliver a macOS-first MVP with Git-native source management, workspace materialization, command execution, logs, and diffs
- `Phase 2`: add reusable caches, warmup profiles, warm state layers, and explicit layer manifests
- `Phase 3`: extend the model to Linux with portable and optimized backends
- `Phase 4`: add Windows capability detection and optimized materialization strategies
- `Phase 5`: harden secret, network, resource, and workspace isolation policies
- `Phase 6`: stabilize headless APIs and build the first GUI shell on top of the existing orchestration core

The first daily-usable milestone is the end of `Phase 1`, where a user should be able to register a repository, create a task workspace, run commands, inspect diffs, and clean up the workspace on macOS.

## Repository Layout

This repository currently contains the planning and execution documents for that roadmap:

- `plan.md`: the canonical high-level architecture and product plan
- `specs/README.md`: the linear phase order and phase guardrails
- `specs/phase-*.md`: phase-by-phase specifications
- `tasks/README.md`: implementation-oriented task guidance
- `tasks/TASK-*.md`: detailed task breakdowns and acceptance criteria
- `.cursor/rules/markdown.mdc`: Markdown authoring rules for this repository

Some task and spec documents still mention `plan.md`. In this repository, that file is `plan.md`.

## Start Here

If you want the shortest path into the project, start with:

- `plan.md`
- `specs/phase-0-architecture-skeleton.md`
- `tasks/TASK-1-freeze-scope-and-write-architectural-adrs.md`

## Suggested Reading Order

If you are new to the project, read in this order:

- `plan.md`
- `specs/README.md`
- the relevant `specs/phase-*.md` file
- the matching `tasks/TASK-*.md` documents

If you are implementing work, follow the task order unless a task document explicitly states that parallel work is safe.

## Implementation Guardrails

Changes should preserve the current architectural commitments:

- keep the product definition fixed: `loom` is a workspace sandbox orchestrator, not a container runtime
- keep `SourceManager`, `Materializer`, and `Runner` separated
- treat layers as logical artifacts rather than filesystem-specific tricks
- optimize for macOS first without damaging the cross-platform model
- prefer a small, explicit Rust codebase with typed config, SQLite repositories, and low magic

If future work needs to violate one of these guardrails, the design docs should be updated first instead of letting the implementation drift silently.

## Current State

Today, this repository is best read as an executable design package:

- the product scope is defined
- the phase plan is linearized
- the implementation tasks are decomposed
- the codebase itself is still to be scaffolded

That is intentional. The project is trying to lock architecture and scope before Rust implementation starts expanding.
