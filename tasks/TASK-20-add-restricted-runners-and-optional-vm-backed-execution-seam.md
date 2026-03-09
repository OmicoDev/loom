---
title: Add restricted runners and optional VM-backed execution seam
source: specs/phase-5-stronger-isolation.md
depends_on:
  - TASK-19
---

# TASK-20 - Add restricted runners and optional VM-backed execution seam

Source: `specs/phase-5-stronger-isolation.md`  
Depends on: `TASK-19`

## Goal

在不重写 workspace 架构的前提下，引入更强隔离 runner，并为未来 VM-backed 执行预留稳定接口。

## Suggested modules

- `src/infra/runner/restricted_host.rs`
- `src/infra/runner/vm.rs`
- `src/infra/runner/selector.rs`

## Core types

- `RestrictedHostRunner`
- `VmRunner`
- `RunnerSelection`
- `IsolationLevel`

## Implementation steps

1. 基于现有 `Runner` trait 实现更受限的 host runner。
2. 把 mount、network、secret、resource policy 接入 restricted runner。
3. 定义 `VmRunner` 占位实现或接口层，不要求本阶段完成完整 VM 栈。
4. 新增 runner selector，根据 policy 和 capability 选择执行后端。

## Rust-specific guidance

- 关键点是“复用同一 `RunContext` 和 `RunResult`”，不要再造一套 VM 专用模型。
- runner selector 应该在 app/infra 边界附近，不应出现在 CLI。
- VM 相关复杂细节应藏在 `infra/runner/vm.rs`，上层只看到 `Runner` trait。

## Testing

- contract tests 确保不同 runner 都返回兼容的 `RunResult`。
- 测试 policy 对 runner 选择的影响。
- 测试在没有 VM 能力时系统仍可回退到非 VM runner。

## Done when

- 更强隔离是 runner 选择问题，而不是架构重写问题。
- `loom` 在没有 VM 支持的机器上仍然可以正常工作。
