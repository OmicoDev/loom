---
title: Implement workspace spec assembly and registry writes
source: specs/phase-1-macos-mvp.md
depends_on:
  - TASK-4
  - TASK-5
  - TASK-6
---

# TASK-7 - Implement workspace spec assembly and registry writes

Source: `specs/phase-1-macos-mvp.md`  
Depends on: `TASK-4`, `TASK-5`, `TASK-6`

## Goal

在真正 materialize 之前，先把一个 workspace 的逻辑定义完整组装出来，并可靠写入 registry。

## Suggested modules

- `src/app/workspace_service.rs`
- `src/app/run_service.rs`
- `src/domain/workspace.rs`
- `src/infra/db/workspace_repository.rs`
- `src/infra/db/run_repository.rs`

## Key Rust types

- `WorkspaceSpec`
- `WorkspaceHandle`
- `WorkspaceStatus`
- `RunRecord`
- `WorkspaceCreationRequest`

## Implementation steps

1. 定义一个 app-level request DTO，例如 `WorkspaceCreationRequest`。
2. 从 project/base/policy/cache 组合出 `WorkspaceSpec`。
3. 在 materialize 前先写入 `workspaces` 表，状态设为 `Pending` 或 `Planned`。
4. materialize 成功后更新为 `Materialized`，失败则更新为 `Failed`。
5. 在运行前创建 `RunRecord`，运行结束后写回 timestamps、exit status、artifact path。

## Rust-specific guidance

- 用 builder 或显式构造函数来组装 `WorkspaceSpec`，不要在 service 里到处改字段。
- 状态转换建议集中在 domain 方法或 app service 内部，避免 repository 任意改状态。
- 对“写 registry + 调外部系统”这种流程，用明确的补偿逻辑处理失败路径。
- 为每个 workspace 生成稳定目录名和日志目录，不要用临时匿名路径。

## Data flow

1. CLI request
2. load project/base/policy
3. build `WorkspaceSpec`
4. persist planned workspace
5. call `Materializer`
6. persist handle/status
7. later runs attach to the same workspace id

## Testing

- service 集成测试覆盖创建成功、materialize 失败、重复创建、状态恢复。
- repository 测试覆盖 workspace/run 关联关系。
- crash-recovery 场景测试，确认中间状态可以被识别和清理。

## Done when

- 一个 workspace 在磁盘出现之前，逻辑身份和元数据已经完整存在。
- run 记录能可靠关联到 workspace、policy 和 artifact。
