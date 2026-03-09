---
title: Wire the end-to-end macOS MVP commands
source: specs/phase-1-macos-mvp.md
depends_on:
  - TASK-6
  - TASK-7
  - TASK-8
  - TASK-9
---

# TASK-10 - Wire the end-to-end macOS MVP commands

Source: `specs/phase-1-macos-mvp.md`  
Depends on: `TASK-6`, `TASK-7`, `TASK-8`, `TASK-9`

## Goal

把前面已经具备的 Git、registry、materializer、runner 串成真正可用的 macOS MVP CLI。

## Commands to wire

- `loom project add`
- `loom project list`
- `loom workspace create`
- `loom workspace exec`
- `loom workspace diff`
- `loom workspace clean`

## Suggested architecture

- `cli.rs` 负责参数解析和展示
- `app/*_service.rs` 负责业务编排
- `infra/*` 负责系统交互

不要让 CLI 直接碰数据库或 shell 命令。

## Implementation steps

1. 为每个 CLI 子命令定义 handler。
2. 在 handler 中构造 app request DTO，并调用对应 service。
3. 统一 command 输出格式，至少保证 human-readable 模式简洁清楚。
4. 补齐 help text、错误信息和退出码。
5. 写一条 end-to-end happy path 文档，作为 MVP operator guide。

## Rust-specific guidance

- 可以在 `main.rs` 中创建一个 `AppContext`，集中持有 config、repositories、services。
- 使用 `Display` 为核心实体定义面向 CLI 的输出。
- 输出层尽量独立，便于后续增加 JSON 输出而不改 service。
- 对外错误文案要短，对日志错误要详细，两者不要混在一起。

## Testing

- 用 `assert_cmd` 做 CLI 集成测试。
- 覆盖 register project -> create workspace -> exec -> diff -> clean 的 happy path。
- 覆盖常见错误路径，如 project 不存在、workspace 已清理、命令执行失败。

## Done when

- `loom` 已经能在 macOS 上完成真实的本地任务工作流。
- 用户不需要手动拼 Git worktree、执行命令和收集 diff。
