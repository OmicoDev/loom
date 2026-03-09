---
title: Add Linux capability detection and portable backend
source: specs/phase-3-linux-backends.md
depends_on:
  - TASK-5
  - TASK-13
---

# TASK-14 - Add Linux capability detection and portable backend

Source: `specs/phase-3-linux-backends.md`  
Depends on: `TASK-5`, `TASK-13`

## Goal

先让 Linux 在“无高级文件系统能力”的条件下也能稳定工作，再逐步叠加优化后端。

## Suggested modules

- `src/infra/platform/linux_probe.rs`
- `src/infra/materializer/portable_copy.rs`
- `src/app/doctor_service.rs`

## Core types

- `LinuxCapabilityProbe`
- `PortableCopyMaterializer`
- `BackendSelection`
- `FilesystemCapabilities`

## Implementation steps

1. 扩展 `doctor`，识别 Linux 平台、文件系统类型和必要工具可用性。
2. 实现 Linux 下的 `PortableCopyMaterializer`。
3. 用 capability selector 决定默认 backend。
4. 确保 portable backend 仍然返回与 macOS 相同的 `WorkspaceHandle` 和 layer 元数据。

## Rust-specific guidance

- probe 逻辑和 backend 逻辑分开，probe 返回数据，selector 再做决策。
- portable backend 不应该借助 Linux 特殊文件系统假设。
- 尽量将路径、权限、删除策略封装到 helper，减少平台分支散落。

## Testing

- 在 Linux 上做 portable materialize/destroy 集成测试。
- 测试 capability 不支持高级 backend 时的选择逻辑。
- 测试与 macOS path 在 app 层返回结构一致。

## Done when

- Linux 即使在普通目录复制策略下也能工作。
- 上层逻辑不需要知道它是否运行在优化 backend 上。
