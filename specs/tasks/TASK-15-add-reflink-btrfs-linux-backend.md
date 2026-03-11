---
title: Add reflink/Btrfs Linux backend
source: specs/phase-3-linux-backends.md
depends_on:
  - TASK-14
---

# TASK-15 - Add reflink/Btrfs Linux backend

Source: `specs/phase-3-linux-backends.md`  
Depends on: `TASK-14`

## Goal

为 Linux 提供默认优化路径，在支持 reflink 或 Btrfs 的环境里更高效地创建派生工作区。

## Suggested modules

- `src/infra/platform/linux_probe.rs`
- `src/infra/materializer/reflink.rs`
- `src/infra/materializer/btrfs.rs`

## Core types

- `ReflinkMaterializer`
- `BtrfsCapabilities`
- `CopyOnWriteStrategy`

## Implementation steps

1. 在 Linux probe 中识别 reflink/Btrfs 支持。
2. 实现 reflink-friendly materializer，优先走轻量复制。
3. 对 Btrfs 特性做 capability gating，避免误判。
4. selector 在支持时优先选择此 backend，否则回退到 portable。

## Rust-specific guidance

- 把“探测是否支持”与“如何执行优化复制”拆成两个模块。
- 对每次优化操作记录 backend 选择原因，便于 `doctor` 和 debug。
- 出错时自动回退必须小心，避免已创建的半成品目录残留。

## Testing

- 测试 selector 在支持和不支持环境下的行为。
- 用 backend contract tests 确保与 portable backend 语义一致。
- 测试失败回退和幂等清理。

## Done when

- Linux 默认优化 backend 已就位。
- 使用 Btrfs/reflink 只是性能优化，不改变逻辑契约。
