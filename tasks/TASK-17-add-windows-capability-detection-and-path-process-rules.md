---
title: Add Windows capability detection and path/process rules
source: specs/phase-4-windows-backends.md
depends_on:
  - TASK-5
  - TASK-13
---

# TASK-17 - Add Windows capability detection and path/process rules

Source: `specs/phase-4-windows-backends.md`  
Depends on: `TASK-5`, `TASK-13`

## Goal

为 Windows 引入明确的 capability 探测和路径/进程规则，同时保持 app/domain 层的跨平台一致性。

## Suggested modules

- `src/infra/platform/windows_probe.rs`
- `src/infra/platform/windows_paths.rs`
- `src/infra/platform/windows_process.rs`

## Core types

- `WindowsCapabilityProbe`
- `WindowsPathRules`
- `WindowsProcessRules`
- `PathNormalizationResult`

## Implementation steps

1. 识别 ReFS、VHDX、路径长度、shell 执行模型等能力。
2. 抽象 Windows 路径归一化和 workspace root 规则。
3. 定义 Windows 进程执行约束，供 runner/backend 共用。
4. 把结果整合进 `doctor` 输出。

## Rust-specific guidance

- 优先把 Windows 特殊性限制在 `infra/platform/`。
- 路径处理统一用 `PathBuf` 和 helper，不要在业务代码中手写反斜杠规则。
- capability 报告要结构化，便于 selector 和 CLI 同时使用。

## Testing

- 路径归一化单元测试。
- capability probe 测试，确认缺失能力时能给出明确原因。
- 与现有 app service 的兼容测试，确保不需要 domain 分支。

## Done when

- Windows 支持已具备明确的可观测前置条件。
- app/domain 层没有因为 Windows 引入额外产品概念。
