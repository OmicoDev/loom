---
title: Scaffold the Rust workspace and module boundaries
source: specs/phase-0-architecture-skeleton.md
depends_on:
  - TASK-1
---

# TASK-2 - Scaffold the Rust workspace and module boundaries

Source: `specs/phase-0-architecture-skeleton.md`  
Depends on: `TASK-1`

## Goal

创建一个可编译的 Rust 项目骨架，让后续实现可以直接落到明确的模块边界里，而不是在早期把 domain、app、infra 混在一起。

## Rust module layout

```text
src/
  main.rs
  cli.rs
  config.rs
  error.rs
  domain/
    mod.rs
    project.rs
    layer.rs
    workspace.rs
    run.rs
    policy.rs
    capability.rs
  app/
    mod.rs
    project_service.rs
    workspace_service.rs
    run_service.rs
    layer_service.rs
    doctor_service.rs
  infra/
    mod.rs
    db/
    git/
    materializer/
    runner/
    logging/
```

## Implementation steps

1. 初始化 Cargo 项目，先保证 `cargo check` 通过。
2. 建立上面的目录结构和 `mod.rs`。
3. 在 `main.rs` 中只做启动、配置加载、CLI 分发。
4. 在 `cli.rs` 中先定义空命令树，不实现真实逻辑。
5. 在 `app/` 中只定义 service struct 和方法签名。
6. 在 `infra/` 中只定义占位接口和 backend module。

## Suggested Rust choices

- 用 `clap` 管 CLI。
- 用 `thiserror` 定义 `AppError`。
- 暂时不要引入 async runtime，所有 service 方法先用同步签名。
- 用 `pub(crate)` 默认收紧可见性，只暴露真正需要跨模块访问的类型。

## Key interfaces to stub

- `ProjectService`
- `WorkspaceService`
- `RunService`
- `LayerService`
- `DoctorService`
- `Materializer`
- `Runner`

## What not to do

- 不要在这个任务里实现 APFS、Git、SQLite 细节。
- 不要把 CLI 直接绑定到 `rusqlite` 或 `std::process::Command`。
- 不要为了省事把所有东西放进 `main.rs`。

## Testing

- `cargo check`
- 一个最小 CLI smoke test，确认 `loom --help` 可以跑通。
- 检查模块依赖方向是否始终是 `main -> cli/app -> domain/infra`，而不是反过来。

## Done when

- 项目可以编译。
- 目录结构已经能容纳后续所有任务。
- 新增功能时不需要先重构目录才能继续做。
