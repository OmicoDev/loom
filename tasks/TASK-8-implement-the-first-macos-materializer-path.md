---
title: Implement the first macOS materializer path
source: specs/phase-1-macos-mvp.md
depends_on:
  - TASK-5
  - TASK-7
---

# TASK-8 - Implement the first macOS materializer path

Source: `specs/phase-1-macos-mvp.md`  
Depends on: `TASK-5`, `TASK-7`

## Goal

提供首个 macOS workspace materializer，让 `loom` 能在不污染逻辑模型的前提下创建便宜、可清理的派生工作区。

## Suggested modules

- `src/infra/materializer/mod.rs`
- `src/infra/materializer/materializer.rs`
- `src/infra/materializer/apfs.rs`
- `src/infra/materializer/portable_copy.rs`

## Core trait

建议先固定 trait 形状：

- `fn materialize(&self, spec: &WorkspaceSpec) -> Result<WorkspaceHandle, AppError>`
- `fn export_layer(&self, handle: &WorkspaceHandle) -> Result<Option<DerivedLayer>, AppError>`
- `fn destroy(&self, handle: WorkspaceHandle) -> Result<(), AppError>`

## Implementation steps

1. 先实现 `Materializer` trait 和 backend selector。
2. 实现 macOS probe，识别是否能走 APFS 优化路径。
3. 实现 `ApfsMaterializer`，负责目录准备、源视图组装、writable layer、日志目录。
4. 同时保留 `PortableCopyMaterializer` 作为 fallback。
5. 把 materializer 输出统一成 `WorkspaceHandle`，不要向上暴露 APFS 细节。

## Rust-specific guidance

- `WorkspaceHandle` 至少要包含 workspace id、root path、backend kind、cleanup metadata。
- backend selector 不要散落在 CLI 中，集中在 app 或 infra factory。
- 如果 APFS 操作需要 shell 命令，统一通过 infra 命令包装执行并记录 stderr。
- domain 层只知道“materialized workspace”，不知道“APFS clone”。

## Filesystem concerns

- 单独定义 `WorkspacePaths` 之类的 helper 来管理目录布局。
- 明确 source view、task writable、cache mount、artifacts、logs 的路径规则。
- destroy 行为必须幂等，支持重复清理。

## Testing

- 抽象出 backend 合约测试，确保 APFS 和 portable backend 都满足同一行为。
- 测试 materialize/destroy 的成功和失败路径。
- 测试 fallback 逻辑，确认 APFS 不可用时仍可工作。

## Done when

- macOS 上能创建和销毁 workspace。
- backend 切换不会改变上层 service 和 CLI 的数据契约。
