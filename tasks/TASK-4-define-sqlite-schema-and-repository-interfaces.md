---
title: Define SQLite schema and repository interfaces
source: specs/phase-0-architecture-skeleton.md
depends_on:
  - TASK-3
---

# TASK-4 - Define SQLite schema and repository interfaces

Source: `specs/phase-0-architecture-skeleton.md`  
Depends on: `TASK-3`

## Goal

为核心实体建立清晰的 SQLite 存储模型，并用小而显式的 repository 层把 SQL 与 app service 隔开。

## Recommended Rust stack

- `rusqlite` 作为 SQLite 访问层
- 手写 migration SQL 文件
- 每个 repository 一个小文件，不用 ORM

## Suggested schema

- `projects`
- `bases`
- `layers`
- `workspaces`
- `runs`
- `policies`
- `capabilities`

必要字段包括：

- stable id
- timestamps
- status
- lineage references
- backend/materializer/runner kind
- metadata JSON 仅用于少量扩展字段，不要拿它替代表结构

## Suggested repository split

- `project_repository.rs`
- `workspace_repository.rs`
- `run_repository.rs`
- `layer_repository.rs`
- `policy_repository.rs`
- `capability_repository.rs`

## Implementation steps

1. 定义 migration 目录，例如 `src/infra/db/migrations/`。
2. 编写初始化逻辑，在首次运行时创建数据库和 schema version。
3. 为每个实体定义 row mapper，避免在 service 层写 SQL。
4. 为复杂查询定义专门方法，例如 `list_workspaces_by_project`、`latest_run_for_workspace`。
5. 为事务型写操作提供一个集中入口，避免 service 层手动拼事务。

## Rust-specific guidance

- 定义一个 `Db` 或 `SqlitePool` 包装类型，负责连接初始化和 pragma 设置。
- repository 的输入输出尽量还是 domain 类型，不要泄露 `rusqlite::Row`。
- 对外暴露 `Result<T, AppError>`，在 infra 层完成数据库错误到应用错误的映射。
- migration 执行要幂等，便于本地重复初始化。

## Testing

- 用 `tempfile` 创建临时数据库。
- migration 测试确认空库可以升到最新 schema。
- repository round-trip 测试确认 domain -> DB -> domain 不丢字段。
- 失败路径测试，如唯一键冲突、外键不满足、缺失记录。

## Done when

- app 层不需要直接写 SQL。
- 数据库 schema 能完整支撑 `Project`、`Workspace`、`Run`、`Layer` 生命周期。
