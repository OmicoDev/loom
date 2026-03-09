---
title: Implement layer manifests, export, and promotion
source: specs/phase-2-warm-layers.md
depends_on:
  - TASK-11
  - TASK-12
---

# TASK-13 - Implement layer manifests, export, and promotion

Source: `specs/phase-2-warm-layers.md`  
Depends on: `TASK-11`, `TASK-12`

## Goal

让 layer 成为可检查、可导出、可提升的逻辑工件，而不是仅存在于内存中的临时概念。

## Suggested modules

- `src/domain/layer.rs`
- `src/app/layer_service.rs`
- `src/infra/db/layer_repository.rs`
- `src/infra/materializer/export.rs`

## Core types

- `LayerManifest`
- `LayerKind`
- `LayerProvenance`
- `DerivedLayer`
- `PromotionRequest`

## Implementation steps

1. 为 layer 定义 manifest 结构，至少包含 id、kind、inputs、backend、created_at。
2. 选择一种稳定序列化格式，推荐 JSON 或 TOML。
3. 实现 `layer list` 和 `layer export` 的 service 与 CLI。
4. 明确 promotion 规则，何时允许把 task writable state 提升成 artifact。
5. 加入 retention 字段或 cleanup policy，避免层无限堆积。

## Rust-specific guidance

- manifest 是逻辑视图，不要泄露过多 backend 内部细节。
- 对外暴露 `LayerSummary` 这类较小 DTO，避免 CLI 直接打印完整 domain 对象。
- 导出行为由 materializer 执行，但导出策略由 app/layer service 决定。
- promotion 是显式命令，不要在 run 结束时自动发生。

## Testing

- 测试 manifest round-trip 和兼容性。
- 测试 layer export 对不同 kind 的行为。
- 测试 promotion 的许可边界，确保 disposable state 不会被误提升。

## Done when

- layer 已经具备稳定元数据和可导出的生命周期。
- CLI 能列出并导出可复用层。
