# AI Workspace Sandbox Plan

## Status

Cross-platform layered workspace architecture
Primary authoring target: macOS-first, with Linux and Windows expansion paths
Implementation language: Rust

---

## 1. Goal

Build a **sandboxed workspace orchestrator for AI coding tasks**.

The system should provide:

- pre-initialized project baselines
- isolated task workspaces
- branch/workspace lifecycle management
- reusable warm caches and derived layers
- clear security boundaries
- clean architecture with long-term extensibility
- a design that works on macOS today and can expand to Linux and Windows later

The project should also serve as a practical vehicle for learning Rust through a real, architecture-heavy system.

---

## 2. Core Judgment

### Is an OCI-layer-like design a good idea here?

Yes — **as architectural inspiration**, not as a literal container image implementation.

Decision:

- v0–v2 will **not** implement OCI image/registry compatibility.
- Any future proposal to add OCI compatibility must include a concrete integrator/use-case and cost/benefit analysis.

The right target is an **OCI-inspired layered workspace model**:

- immutable base
- content-addressed derived artifacts where useful
- explicit layer manifests
- reusable warm layers
- a disposable writable task layer
- materialization decoupled from storage model

What should *not* be copied blindly:

- full OCI image format compatibility
- mandatory tar-based layer transport
- runtime union mount semantics as a hard requirement
- container-runtime-oriented assumptions

This system is not primarily a container engine.
It is a **workspace orchestrator for AI software work**.

---

## 3. Design Principles

### 3.1 Clarity over cleverness

The architecture must remain understandable without requiring filesystem-specific knowledge to understand the core model.

### 3.2 Platform abstraction without lowest-common-denominator damage

The domain model should be cross-platform.
Only the materialization strategy should vary by platform.

### 3.3 Immutable baseline, disposable task state

A task workspace should always be viewed as a derived writable view over stable baselines.

### 3.4 Git-native source management

Use Git and `git worktree` for source lineage and branch isolation.

### 3.5 Filesystem-aware optimization, not filesystem-coupled architecture

Use APFS, Btrfs, ZFS, ReFS, or VHDX where available — but never let the entire design collapse if a platform lacks advanced snapshot/clone support.

### 3.6 Security as a first-class concern

Workspace isolation, secret boundaries, allowed mounts, network policy, and execution policy must be explicit parts of the model.

### 3.7 Rust codebase quality

Prefer strong module boundaries, explicit domain types, low magic, and simple control flow.
Avoid “framework architecture”; prefer a small, explicit core.

---

## 4. Product Model

The system should be modeled around the following concepts.

### 4.1 Project

A registered codebase or template that can be used to create AI task workspaces.

Contains:

- repository location
- baseline branch or commit
- project kind
- warmup commands
- cache policy
- sandbox policy defaults
- materialization preferences

### 4.2 Base

An immutable source baseline.

Examples:

- Git commit
- baseline worktree state
- prepared tooling baseline

### 4.3 Layer

A logical reusable unit derived from a base.

Possible kinds:

- source baseline layer
- dependency cache layer
- tooling layer
- prepared build-state layer
- task writable layer

### 4.4 Workspace

A materialized environment for one AI task.

Contains:

- source view
- writable task state
- mounted/shared caches
- execution policy
- lineage metadata
- artifact/log path

### 4.5 Run

A concrete execution session inside a workspace.

Contains:

- command or agent invocation
- timestamps
- logs
- exit status
- produced patch/diff/artifacts

### 4.6 User Interfaces (Future)

The primary v0/v1 interface is a **CLI-first experience**.

Future direction:

- GUI support (native or web-based) is explicitly in scope as a later phase.
- The domain model and CLI APIs must remain stable enough that a GUI can be built as a thin layer over the existing orchestration core.

---

## 5. Recommended High-Level Architecture

Split the codebase into four major subsystems.

### 5.1 Registry

Stores durable metadata for:

- projects
- bases
- layers
- workspaces
- runs
- policies
- capabilities

Suggested implementation:

- SQLite
- small explicit repository layer
- no ORM

### 5.2 Source Manager

Responsible for Git-native source handling.

Responsibilities:

- baseline commit selection
- branch creation
- `git worktree` lifecycle
- diff/patch generation
- cleanup and reconciliation

### 5.3 Materialization Engine

Responsible for turning logical layer stacks into real workspaces.

Responsibilities:

- selecting backend by platform/capability
- creating materialized workspace directories or volumes
- attaching caches
- preparing writable task layer
- exporting or committing reusable derived layers

This is where platform-specific complexity should live.

### 5.4 Runner

Responsible for execution inside a workspace.

Responsibilities:

- command execution
- agent execution
- environment preparation
- mount policy
- network policy
- secret injection
- timeout/resource policy
- log capture

---

## 6. Cross-Platform Strategy

The correct strategy is:

> **Unify the logical workspace model.
> Specialize the materialization backend per platform.**

Do not try to force all platforms into one identical filesystem trick.

### 6.1 macOS

Recommended role: **primary development platform / first optimized implementation**

Best-fit mechanisms:

- Git worktree for source isolation
- APFS clone/snapshot/space-sharing style capabilities for efficient workspace materialization
- light isolation at first, stronger sandboxing later through an abstract runner boundary

Why this is good:

- excellent local developer ergonomics
- very strong fit for “cheap derived workspaces”
- natural first implementation for your daily environment

### 6.2 Linux

Recommended role: **most flexible and eventually strongest runtime platform**

Use multiple backend tiers.

#### Tier 1 — Portable Linux

- normal directory copy
- optional hardlink-assisted strategies
- zero special filesystem assumptions

#### Tier 2 — Native CoW Linux

- reflink-oriented backends
- Btrfs-friendly optimization
- suitable as the default optimized Linux backend

#### Tier 3 — Dataset-native Linux

- ZFS snapshot/clone-oriented backend
- strongest semantic fit for layered workspace lineage
- better as an advanced backend than as the only Linux strategy

### 6.3 Windows

Recommended role: **future optimized enterprise-capable backend**

Suggested direction:

- source lineage still based on Git
- ReFS block-clone-friendly backend when available
- VHDX differencing-disk-style backend for stronger “base + writable derived layer” semantics

This may diverge from directory-based materialization, which is acceptable as long as the logical model remains consistent.

---

## 7. Linux Recommendation: Btrfs vs ZFS

### 7.1 Btrfs

Best positioned as the **default optimized Linux backend**.

Reasons:

- native Linux CoW mindset
- lower conceptual/operational friction than ZFS
- strong fit for quick derived workspaces
- good default when the goal is broad practicality

### 7.2 ZFS

Best positioned as the **advanced Linux backend**.

Reasons:

- snapshot / clone / promote semantics map very well to layer lineage
- strong conceptual match for OCI-inspired workspace layering
- excellent fit when the deployment intentionally chooses a dataset-native storage model

### 7.3 Final Linux stance

Use both, but with different roles:

- **Default**: Btrfs/reflink-friendly backend
- **Advanced**: ZFS clone-oriented backend

This preserves both elegance and practicality.

---

## 8. Recommended Capability Matrix

| Platform | Default backend | Advanced backend | Notes |
| --- | --- | --- | --- |
| macOS | APFS materializer | future stronger runner/sandbox | Best first implementation |
| Linux | Portable copy or Btrfs/reflink | ZFS snapshot/clone | Keep both paths |
| Windows | Portable copy | ReFS block clone / VHDX differencing | Accept storage-model divergence |

---

## 9. Source Strategy

Use `git worktree` as the primary source isolation primitive.

Why:

- natural fit for one-task-one-branch workflows
- avoids branch-switch churn
- preserves Git-native review model
- clearly separates source lineage from filesystem materialization

Important design stance:

> Git worktree should own **source lineage**.
> Materializers should own **workspace realization**.

Do not blur these two responsibilities.

---

## 10. Layer Model

Definitions:

- **Base**: the immutable origin state (e.g., Git commit, prepared baseline).
- **Layer**: a reusable, derived logical artifact built from a base and other layers.
- **Workspace**: a materialized view over one base plus zero or more reusable layers and a disposable writable task layer.
- **Run**: a recorded execution inside a workspace, with full lineage and results.

Treat “layer” as a **logical artifact**, not necessarily a mountable filesystem layer.

Suggested layer kinds:

### 10.1 SourceBaseLayer

Immutable source baseline.

Identity may include:

- repo identity
- commit hash
- relevant repo preparation metadata

### 10.2 CacheLayer

Reusable dependency/tool cache.

Examples:

- Gradle dependency cache
- Cargo registry/git cache
- Maven cache
- toolchain cache

### 10.3 WarmStateLayer

Optional prepared state derived from executing warmup steps.

Examples:

- dependency resolution completed
- project sync completed
- initial build metadata prepared

### 10.4 TaskWritableLayer

Per-task mutable state.

Always disposable unless explicitly promoted.

### 10.5 ArtifactLayer

Optional exported reusable result.

Examples:

- reusable warmed environment
- generated SDK or prepared environment output
- sharable derived base

---

## 11. Materialization Model

The system should not assume all platforms materialize workspaces the same way.

Instead, define a unified contract.

### 11.1 Desired trait shape

```rust
pub trait Materializer {
    fn materialize(&self, spec: &WorkspaceSpec) -> Result<WorkspaceHandle>;
    fn export_layer(&self, handle: &WorkspaceHandle) -> Result<Option<DerivedLayer>>;
    fn destroy(&self, handle: WorkspaceHandle) -> Result<()>;
}
```

Conceptually:

- A `Materializer` defines **how bits become directories/volumes** for a workspace.

### 11.2 Recommended implementations

- `PortableCopyMaterializer`
- `ApfsMaterializer`
- `ReflinkMaterializer`
- `ZfsCloneMaterializer`
- `WindowsBlockCloneMaterializer`
- `VhdxMaterializer`

Not all implementations are needed at first.

---

## 12. Runner Model

Define execution separately from materialization.

```rust
pub trait Runner {
    fn exec(&self, ctx: &RunContext) -> Result<RunResult>;
}
```

Conceptually:

- A `Runner` defines **how commands run inside a materialized workspace**, including policy (network, secrets, resource limits) but not storage details.

Possible runner implementations:

- `HostRunner`
- `RestrictedHostRunner`
- `FutureMacRunner`
- `FutureLinuxSandboxRunner`
- `FutureVmRunner`

This separation ensures that:

- workspace creation is independent from execution policy
- platform sandbox limitations do not pollute storage architecture
- stronger isolation can be added later without rewriting workspace logic

---

## 13. Security Model

Even the first version should model security explicitly.

### 13.1 Workspace boundary

A task should only see:

- its own workspace
- explicitly mounted shared caches
- explicitly allowed tools/resources

### 13.2 Secret boundary

Never inherit full developer shell state by default.

Use explicit secret policy:

- allowed env vars
- temporary tokens
- scoped credentials
- optional no-secret mode

### 13.3 Network policy

Support policy modes such as:

- offline
- allowlisted egress
- full network

### 13.4 Resource policy

Support:

- max runtime
- memory budget
- CPU limits where possible
- log size limits

---

## 14. What Not to Build First

Avoid these in v0/v1:

- full OCI image compatibility
- remote registry protocol
- distributed execution
- mandatory microVM infrastructure
- platform-perfect isolation
- advanced UI
- over-general plugin system

Constraint:

- Any proposal that adds items from this list into an early phase (v0/v1/v2) must provide a clear, concrete use-case and cost/benefit analysis, and should not expand the core domain model.

The first goal is a **clean local orchestrator**.

---

## 15. Rust Architecture Guidance

### 15.1 Structure

Prefer a domain-first module layout.

Suggested shape:

```text
src/
  main.rs
  cli.rs
  error.rs
  config.rs

  domain/
    project.rs
    layer.rs
    workspace.rs
    run.rs
    policy.rs

  app/
    project_service.rs
    workspace_service.rs
    run_service.rs

  infra/
    db/
    git/
    materializer/
    runner/
    logging/
```

### 15.2 Error handling

Use a single explicit application error type with well-defined domain/infra conversion.

### 15.3 State persistence

Use SQLite with small clear repositories.
Avoid premature abstraction layers.

### 15.4 Async

Do not start with async everywhere.
Prefer synchronous code first.
Add async only when concurrency requirements become concrete.

### 15.5 Config

Prefer:

- small typed config model
- explicit defaults
- predictable file locations
- no dynamic magic

---

## 16. Delivery Phases

### Phase 0 — Architecture skeleton

Goal:

- define domain model
- define traits
- define CLI commands
- define persistence schema

Deliverables:

- compilable Rust skeleton
- registry schema
- basic CLI layout
- ADR documents

### Phase 1 — macOS-first MVP

Goal:

- register project
- create task workspace
- manage Git worktree
- materialize APFS-friendly workspace
- execute commands
- collect logs and diffs

Deliverables:

- working local tool for daily use
- no heavy sandbox requirement yet

### Phase 2 — Warm layers and cache policy

Goal:

- shared cache model
- warmup profiles
- reusable derived layers
- explicit layer metadata

### Phase 3 — Linux optimized backends

Goal:

- portable backend
- reflink/Btrfs backend
- ZFS backend

### Phase 4 — Windows optimized backends

Goal:

- ReFS-aware or VHDX-aware materializer
- Windows-specific capability probing
- preserved logical model

### Phase 5 — Stronger isolation

Goal:

- more restricted runner implementations
- optional VM-backed execution
- stronger secret/network isolation

### Phase 6 — GUI surfaces (future)

Goal:

- provide one or more GUI experiences (desktop or web) built on top of the existing CLI and domain model
- avoid introducing GUI-only behavior that cannot be expressed via the CLI
- keep the orchestration core headless and testable without any GUI

---

## 17. CLI Direction

The CLI should remain compact and explicit.

Suggested command families:

```text
tool project add
tool project list
tool workspace create
tool workspace warm
tool workspace exec
tool workspace diff
tool workspace clean
tool run agent
tool layer list
tool layer export
tool doctor
```

Naming should favor:

- short
- pronounceable
- not overloaded with existing ecosystem meaning
- suitable as both project name and command name

---

## 18. Naming

Use **only** `loom`:

- **project name**: `loom`
- **CLI command**: `loom`

Why `loom`:

- short, easy to type, calm and clean
- not obviously tied to one platform
- flexible enough for a workspace/layer/sandbox tool
- feels suitable for a CLI command

Example CLI:

```bash
loom workspace create my-app --task fix-login
loom workspace exec my-app/fix-login -- ./gradlew test
loom layer export my-app/fix-login
```

---

## 19. Final Recommendation

Build this as a:

> **cross-platform, OCI-inspired, Git-native workspace sandbox orchestrator**

with these implementation priorities:

1. **macOS-first**
2. **Git worktree for source lineage**
3. **APFS materializer first**
4. **layer model as logical architecture**
5. **Btrfs as default optimized Linux backend**
6. **ZFS as advanced Linux backend**
7. **ReFS + VHDX as advanced Windows direction**
8. **Runner/materializer separation from day one**
9. **small, explicit, clean Rust codebase**

This gives you:

- a system that is elegant
- a system you can actually build
- a system that can grow into a serious tool
- a project that is excellent for learning Rust the right way
