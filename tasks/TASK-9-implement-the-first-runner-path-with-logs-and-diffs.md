---
title: Implement the first runner path with logs and diffs
source: specs/phase-1-macos-mvp.md
depends_on:
  - TASK-5
  - TASK-7
  - TASK-8
---

# TASK-9 - Implement the first runner path with logs and diffs

Source: `specs/phase-1-macos-mvp.md`  
Depends on: `TASK-5`, `TASK-7`, `TASK-8`

## Goal

实现第一个 runner，使 `loom` 能在 materialized workspace 内执行命令、捕获日志、记录退出状态，并在结束后导出 diff。

## Suggested modules

- `src/infra/runner/mod.rs`
- `src/infra/runner/runner.rs`
- `src/infra/runner/host.rs`
- `src/infra/logging/run_logs.rs`

## Core types

- `Runner`
- `HostRunner`
- `RunContext`
- `RunResult`
- `RunLogHandle`

## Implementation steps

1. 固定 `Runner` trait 和 `RunContext` 输入结构。
2. 在 `HostRunner` 中封装 `std::process::Command`。
3. 明确 cwd、env、stdio、timeout、log file path 的处理方式。
4. 运行后写回 `RunResult`，包含 exit code、timings、stdout/stderr 路径、artifact 路径。
5. 调用 Git 模块生成 diff 并关联到 run record。

## Rust-specific guidance

- 推荐用 `std::process::Stdio` 将 stdout/stderr 重定向到文件，而不是把大日志全部读入内存。
- timeout 可以先用简单轮询或子进程等待方案，不必过早引入 async。
- env 注入要显式，以 allowlist 为主。
- runner 只关心如何执行，不应决定 workspace 如何 materialize。

## Error handling

建议区分：

- process spawn 失败
- command 非零退出
- timeout
- log capture 失败
- diff 导出失败

这样 CLI 可以更准确地提示用户。

## Testing

- 测试成功执行、失败执行、超时、日志落盘。
- 测试大输出命令不会导致内存膨胀。
- 测试 run record 与 diff artifact 正确关联。

## Done when

- 可以在 workspace 中稳定执行命令。
- 每次运行后都能看到日志、退出状态和 diff。
