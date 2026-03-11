---
title: Implement Git-native source management
source: specs/phase-1-macos-mvp.md
depends_on:
  - TASK-4
  - TASK-5
---

# TASK-6 - Implement Git-native source management

Source: `specs/phase-1-macos-mvp.md`  
Depends on: `TASK-4`, `TASK-5`

## Goal

让 Git 成为 source lineage 的唯一事实来源，包括 baseline 解析、branch 命名、`git worktree` 生命周期和 diff 采集。

## Rust implementation strategy

推荐优先封装系统 `git` CLI，而不是一开始就引入 libgit2：

- worktree 支持更直接
- 行为更接近用户本地 Git
- 调试和排障更简单

## Suggested modules

- `src/infra/git/mod.rs`
- `src/infra/git/git_command.rs`
- `src/infra/git/source_manager.rs`
- `src/infra/git/parsers.rs`

## Key types

- `struct GitSourceManager`
- `struct RegisteredRepo`
- `struct BaselineSelection`
- `struct WorktreeHandle`
- `struct GitDiffArtifact`

## Implementation steps

1. 包装 `std::process::Command` 执行 `git`。
2. 实现仓库校验、baseline ref 解析和 commit hash 归一化。
3. 实现 task branch 命名规则，例如 `loom/<task-slug>`。
4. 实现 `git worktree add/list/remove/prune` 的封装。
5. 实现 diff/patch 导出，优先使用 `git diff --binary` 或统一 patch 输出。
6. 把结果落到 repository 层，记录 worktree path、branch、base commit。

## Rust-specific guidance

- 定义一个通用 `CommandRunner`，Git probe、Git 操作、平台探测都能复用。
- 为 Git stderr/stdout 建立解析函数，避免 service 层做字符串处理。
- 失败时返回明确错误，如 `RepoNotFound`、`BaselineRefInvalid`、`WorktreeAlreadyExists`。
- 不要让 `WorkspaceService` 直接拼 Git 命令。

## Testing

- 用临时 Git 仓库做集成测试。
- 测试 baseline 解析、worktree 创建、重复创建、清理、diff 导出。
- 测试异常路径，如未安装 Git、非法 ref、工作树残留。

## Done when

- source lineage 完全由 Git 模块维护。
- materializer 不再关心 branch、commit、worktree 内部细节。
