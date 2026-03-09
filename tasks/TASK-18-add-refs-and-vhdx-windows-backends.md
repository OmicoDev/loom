---
title: Add ReFS and VHDX Windows backends
source: specs/phase-4-windows-backends.md
depends_on:
  - TASK-17
---

# TASK-18 - Add ReFS and VHDX Windows backends

Source: `specs/phase-4-windows-backends.md`  
Depends on: `TASK-17`

## Goal

在 Windows 上提供优化 materializer，实现 ReFS 和 VHDX 两条路径，同时继续复用统一的 workspace 语义。

## Suggested modules

- `src/infra/materializer/windows_refs.rs`
- `src/infra/materializer/windows_vhdx.rs`
- `src/infra/materializer/windows_selector.rs`

## Core types

- `WindowsBlockCloneMaterializer`
- `VhdxMaterializer`
- `WindowsBackendSelection`

## Implementation steps

1. 定义 ReFS backend 的能力要求和底层操作接口。
2. 定义 VHDX backend 的能力要求和生命周期接口。
3. 为两者实现统一的 `Materializer` trait。
4. 编写 selector，根据 capability 报告选择最适合的 Windows backend。
5. 验证 create/exec/diff/export/destroy 全流程与其他平台行为一致。

## Rust-specific guidance

- backend 之间共享公共 helper，例如路径布局、日志目录、错误映射。
- 不要把 Windows 的存储实现差异向上暴露为新的 domain 类型。
- 对外统一成 `WorkspaceHandle { backend_kind, root_path, ... }`。

## Testing

- backend contract tests 复用 macOS/Linux 的行为断言。
- selector 测试覆盖 ReFS 可用、仅 VHDX 可用、都不可用三种情况。
- 销毁和清理测试要重点覆盖资源残留场景。

## Done when

- Windows 至少有一个优化 backend 可用。
- 用户面对的 CLI 仍然是同一个 `loom`，不是 Windows 专用子产品。
