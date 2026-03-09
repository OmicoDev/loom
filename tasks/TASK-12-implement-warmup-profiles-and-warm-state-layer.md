---
title: Implement warmup profiles and `WarmStateLayer`
source: specs/phase-2-warm-layers.md
depends_on:
  - TASK-11
---

# TASK-12 - Implement warmup profiles and `WarmStateLayer`

Source: `specs/phase-2-warm-layers.md`  
Depends on: `TASK-11`

## Goal

把项目预热行为做成显式 profile，并把预热结果建模为可复用的 `WarmStateLayer`。

## Suggested modules

- `src/domain/project.rs`
- `src/domain/layer.rs`
- `src/app/layer_service.rs`
- `src/app/workspace_service.rs`

## Core types

- `WarmupProfile`
- `WarmupStep`
- `WarmStateLayer`
- `WarmupProvenance`
- `WarmupResult`

## Implementation steps

1. 在 `Project` 中加入 warmup profile 定义。
2. 让 `workspace warm` 命令能执行 profile 中的步骤。
3. 记录 warmup 输入，包括 base、cache inputs、profile version、toolchain fingerprint。
4. 生成 `WarmStateLayer` 元数据，并与 workspace、base 关联。
5. 下次创建 workspace 时优先命中匹配的 warm state。

## Rust-specific guidance

- warmup profile 用纯数据结构表达，不要把 shell 脚本硬编码在 service 里。
- 可以为 `WarmupStep` 定义 enum，例如 `Command`, `CheckFile`, `CheckExitCode`。
- provenance 要可序列化，方便后续做 layer manifest 和缓存命中判断。
- profile 更新后要能使旧 warm state 失效或降级。

## Testing

- 测试同一 profile 和同一 base 可以命中 warm state。
- 测试 profile 改动后不会错误复用旧状态。
- 测试 warmup 失败时不会污染已存在的可复用层。

## Done when

- 预热成为显式的产品概念，而不是隐藏在 README 或 shell 脚本里。
- `WarmStateLayer` 能被可靠地复用和失效。
