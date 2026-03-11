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

## Directory overview

- **`src/`** — 程序入口与横切关注点。只依赖 `domain`、`app`、`infra`，不包含业务规则；负责启动、配置加载、CLI 解析与错误类型。
- **`src/domain/`** — 纯领域模型与词汇。不含 I/O、不含平台类型；定义 `Project`、`Layer`、`Workspace`、`Run`、`Policy`、`Capability` 等概念及类型 ID，供 `app` 与后续 `infra` 实现使用。不依赖 `app` 或 `infra`。
- **`src/app/`** — 应用服务层。编排领域对象与基础设施调用，实现用例；每个 service 对应一组 CLI 命令或内部流程。依赖 `domain` 和 `infra` 的 trait/接口，不依赖具体 backend 实现细节。
- **`src/infra/`** — 基础设施与平台实现。实现持久化、Git 操作、工作区物化、执行器、日志等；通过 trait 或明确接口向 `app` 暴露，内部按 backend 分子模块（`db/`、`git/`、`materializer/`、`runner/`、`logging/`）。不依赖 `app`；可依赖 `domain` 中的类型。

依赖方向：`main/cli → app → domain` 且 `app → infra`；禁止 `domain → app`、`domain → infra`、`infra → app`。

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

## Module and file descriptions

### 根目录

- **`main.rs`** — 入口：解析配置、构建 CLI、根据子命令分发到对应 app service；不包含业务逻辑。
- **`cli.rs`** — CLI 命令树（基于 `clap`）：子命令定义、参数、帮助文案；调用 `app` 层接口，不直接操作 `infra` 或 domain 持久化。
- **`config.rs`** — 配置模型与加载：路径、默认值、环境变量；供 `main` 和 `app` 使用。
- **`error.rs`** — 应用级错误类型（建议 `thiserror`）：`AppError` 及变体，供全栈统一处理与日志。

**`domain/`**

- **`mod.rs`** — 聚合并 re-export 各 domain 子模块，保证 `domain` 对外是一个清晰边界。
- **`project.rs`** — 项目概念：注册代码库/模板、基线、策略默认值等；对应 plan 中的 Project。
- **`layer.rs`** — 层概念：来源基线层、缓存层、预热状态层、任务可写层、产物层等种类；对应 plan 中的 Layer。
- **`workspace.rs`** — 工作区概念：物化环境、源视图、可写任务状态、挂载与执行策略；对应 plan 中的 Workspace。
- **`run.rs`** — 单次执行会话：命令/agent 调用、时间戳、退出状态、产物；对应 plan 中的 Run。
- **`policy.rs`** — 策略与安全相关：沙箱策略、挂载、网络、执行策略等；与 Runner/Materializer 的“策略”语义对齐。
- **`capability.rs`** — 能力模型：平台/backend 支持描述（如是否支持克隆、快照等），供 doctor 与后端选择使用；不包含具体探测逻辑。

**`app/`**

- **`mod.rs`** — 聚合各 service，对外暴露统一的应用层入口。
- **`project_service.rs`** — 项目用例：添加/列出项目等；依赖 `domain` 的 Project 与 `infra` 的 db/git 接口。
- **`workspace_service.rs`** — 工作区用例：创建、预热、执行、diff、清理等；依赖 `domain` 的 Workspace/Layer 与 `infra` 的 materializer、runner。
- **`run_service.rs`** — 执行用例：如 `run agent`；依赖 `domain` 的 Run 与 `infra` 的 runner。
- **`layer_service.rs`** — 层管理用例：列出层、导出 manifest 等；依赖 `domain` 的 Layer 与 `infra` 的 materializer/db。
- **`doctor_service.rs`** — 能力与健康检查：汇总 capability 与各 backend 状态，供 `doctor` 命令输出；依赖 `infra` 的 capability 探测接口。

**`infra/`**

- **`mod.rs`** — 聚合各 backend 子模块，向 `app` 暴露 trait 或 facade，隐藏具体实现。infra 可以依赖 `domain` 中的类型，但不能反向调用 app 层逻辑。
- **`db/`** — 持久化：SQLite 与 repository 接口占位，是 Registry 的主要后端；后续 TASK-4 实现 schema 与具体 repository。repository trait 应定义在 `domain` 或单独的数据层，由 `infra/db` 实现，避免 domain 反向依赖 infra。
- **`git/`** — Git 操作：worktree、基线、分支等；对应 SourceManager 的底层实现占位。只提供 Git/工作副本相关原语，不承载“什么是 Base/Layer/Workspace”的领域规则。
- **`materializer/`** — 工作区物化：根据 Layer/Workspace 在磁盘上创建视图；对应 Materializer 占位，不在此任务实现 APFS/克隆等。策略层在 domain/app，materializer 只做具体物化动作。
- **`runner/`** — 执行策略与运行：在指定工作区内执行命令；对应 Runner 占位，不在此任务实现沙箱细节。执行策略由 domain/app 决定，runner 负责在给定约束下实际执行。
- **`logging/`** — 日志输出与诊断；占位，便于后续统一替换为具体实现。

## Implementation steps

1. 初始化 Cargo 项目，先保证 `cargo check` 通过。
2. 建立上面的目录结构和 `mod.rs`。
3. 在 `main.rs` 中只做启动、配置加载、CLI 分发。
4. 在 `cli.rs` 中先定义空命令树，不实现真实逻辑，并为每个命令组（如 `project`、`workspace`、`layer`、`run`、`doctor`）预留与对应 service 的映射。
5. 在 `app/` 中只定义 service struct 和方法签名，每个 CLI 命令组优先通过单一 service 作为入口，不在 CLI 中堆业务分支。
6. 在 `infra/` 中只定义占位接口和 backend module，不在此任务中实现具体 APFS、Git、SQLite 或沙箱细节。

## Suggested Rust choices

- 用 `clap` 管 CLI。
- 用 `thiserror` 定义 `AppError`，在 app 层统一承接 infra 与 domain 抛出的错误。
- 暂时不要引入 async runtime，所有 service 方法先用同步签名。
- 用 `pub(crate)` 默认收紧可见性，只暴露真正需要跨模块访问的类型；infra backend 细节尽量保持 `pub(crate)`，通过 trait/facade 暴露给 app。

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
