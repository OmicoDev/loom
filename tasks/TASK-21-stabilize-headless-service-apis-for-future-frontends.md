---
title: Stabilize headless service APIs for future frontends
source: specs/phase-6-gui-surfaces.md
depends_on:
  - TASK-10
  - TASK-13
  - TASK-20
---

# TASK-21 - Stabilize headless service APIs for future frontends

Source: `specs/phase-6-gui-surfaces.md`  
Depends on: `TASK-10`, `TASK-13`, `TASK-20`

## Goal

在引入 GUI 之前，先把 orchestration core 的 app/service API 稳定下来，确保未来前端只是消费者而不是重写者。

## Suggested modules

- `src/app/project_service.rs`
- `src/app/workspace_service.rs`
- `src/app/run_service.rs`
- `src/app/layer_service.rs`
- `src/app/doctor_service.rs`

## API design focus

每个 service 都应暴露稳定的 request/response DTO，例如：

- `AddProjectRequest` / `ProjectSummary`
- `CreateWorkspaceRequest` / `WorkspaceSummary`
- `ExecRunRequest` / `RunSummary`
- `ExportLayerRequest` / `LayerSummary`

## Implementation steps

1. 审查 CLI 是否直接依赖 domain 内部结构或 infra 类型。
2. 为主要 use case 定义 app-level DTO。
3. 让 CLI 仅依赖 service 和 DTO，不依赖 repository/infra 细节。
4. 统一错误映射和输出模型，为 GUI 后续调用打基础。

## Rust-specific guidance

- DTO 与 domain type 分离，避免 GUI 未来被 domain 内部字段绑死。
- service 返回的数据要偏摘要型，适合 CLI 和 GUI 同时消费。
- 如果未来要提供 IPC/HTTP API，这些 DTO 可以直接复用或轻改。

## Testing

- service-level tests 覆盖主要 request/response 流程。
- CLI smoke tests 确认迁移到 DTO 后行为不变。
- review 检查 GUI 是否还能绕过 app 层直接碰 infra，如果能，说明接口还不够稳。

## Done when

- CLI 已经是 orchestration core 的消费者。
- 未来 GUI 不需要直接操作数据库、Git 命令或 materializer。
