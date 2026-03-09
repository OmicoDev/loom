---
title: Freeze scope and write architectural ADRs
source: specs/phase-0-architecture-skeleton.md
depends_on: []
---

# TASK-1 - Freeze scope and write architectural ADRs

Source: `specs/phase-0-architecture-skeleton.md`
Depends on: none

## Goal

把 `plan.md` 里的核心判断固化成一组后续实现必须遵守的约束，避免 Rust 代码在早期被“容器化冲动”或“平台特性”带偏。

## Rust implementation focus

- 在仓库中创建 `docs/adr/`，用顺序编号管理 ADR。
- 在 `src/lib.rs` 或 `src/main.rs` 顶层模块注释里写明三条硬边界：
  - `SourceManager` 只负责 source lineage
  - `Materializer` 只负责 workspace realization
  - `Runner` 只负责 execution policy
- 在 `src/domain/` 中禁止直接出现 APFS、Btrfs、ZFS、ReFS 这类平台名；这些内容只能出现在 `src/infra/materializer/`。
- 在 `CONTRIBUTING` 或 `README` 中写出 early-phase non-goals，避免后续 PR 引入 remote registry、OCI 兼容或 GUI 优先实现。

## Suggested outputs

- `docs/adr/0001-product-scope.md`
- `docs/adr/0002-subsystem-boundaries.md`
- `docs/adr/0003-platform-strategy.md`
- `docs/adr/0004-early-phase-non-goals.md`

## Implementation steps

1. 从 `plan.md` 提取不可变的产品定义和非目标。
2. 把“逻辑模型统一，后端分平台实现”写成单独 ADR。
3. 把 early-phase 不做的内容写成一份否定清单。
4. 在代码骨架中预留与 ADR 对应的模块边界，确保文档和目录结构一致。
5. 给后续任务加上“违反 ADR 时必须新增 ADR 或修改 ADR”的规则。

## Rust-specific guidance

- 这个任务本身代码不多，但要为后续 Rust 实现立规矩。
- 推荐在 `src/domain/mod.rs` 顶部加简短注释，强调 domain 层不依赖 OS 和 shell。
- 推荐在 `src/infra/mod.rs` 顶部加简短注释，说明平台差异只能在 infra 层扩散。
- 不要为了“表达架构”引入复杂框架或宏系统，目录结构本身就应该足够表达设计。

## Testing and review

- 人工 review ADR 是否覆盖产品定义、边界、平台策略、非目标。
- 检查任务 2 到任务 5 的设计是否都能直接引用这些 ADR。
- 检查是否还有模糊表述，例如 “未来也许可以兼容 OCI” 这种没有约束条件的语句。

## Done when

- 新贡献者只看 ADR 就能知道 `loom` 是什么、不是什么。
- 后续任务实现时不需要重新争论 OCI、插件系统或分布式执行是否应该先做。
