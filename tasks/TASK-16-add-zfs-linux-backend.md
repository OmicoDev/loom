---
title: Add ZFS Linux backend
source: specs/phase-3-linux-backends.md
depends_on:
  - TASK-14
  - TASK-15
---

# TASK-16 - Add ZFS Linux backend

Source: `specs/phase-3-linux-backends.md`  
Depends on: `TASK-14`, `TASK-15`

## Goal

提供 Linux 高级后端，用 ZFS snapshot/clone 语义更贴近 layered lineage，但不改变对外逻辑模型。

## Suggested modules

- `src/infra/platform/zfs_probe.rs`
- `src/infra/materializer/zfs.rs`

## Core types

- `ZfsCloneMaterializer`
- `ZfsDatasetLayout`
- `ZfsCapabilities`

## Implementation steps

1. 定义 ZFS 运行前提，如 dataset 布局、权限、命令可用性。
2. 实现 ZFS probe，并让 `doctor` 能输出“可用 / 不可用 / 原因”。
3. 实现 snapshot、clone、destroy 等底层操作封装。
4. 保证这些操作最终仍收敛成统一的 `WorkspaceHandle` 与 `LayerManifest`。

## Rust-specific guidance

- ZFS 术语只留在 infra 层；app/domain 仍然只谈 layer/workspace。
- 建议用小的命令包装函数，把 `zfs` CLI 调用集中管理。
- 明确 cleanup 规则，防止 dataset 残留导致后续 workspace id 冲突。

## Testing

- 在具备 ZFS 的环境上做 backend 集成测试。
- 测试 clone/destroy/export 的一致性。
- 测试 `doctor` 能准确说明 ZFS backend 的可用性。

## Done when

- ZFS 成为 Linux 的高级可选 backend，而不是唯一策略。
- 使用 ZFS 时，上层服务不需要切换另一套逻辑模型。
