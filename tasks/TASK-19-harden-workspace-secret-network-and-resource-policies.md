---
title: Harden workspace, secret, network, and resource policies
source: specs/phase-5-stronger-isolation.md
depends_on:
  - TASK-10
  - TASK-13
---

# TASK-19 - Harden workspace, secret, network, and resource policies

Source: `specs/phase-5-stronger-isolation.md`  
Depends on: `TASK-10`, `TASK-13`

## Goal

把安全模型落成明确的 Rust 策略对象和执行前检查逻辑，而不是只在文档里写“默认更安全”。

## Suggested modules

- `src/domain/policy.rs`
- `src/app/policy_service.rs`
- `src/infra/runner/policy_enforcer.rs`

## Core types

- `WorkspaceBoundaryPolicy`
- `SecretPolicy`
- `NetworkPolicy`
- `ResourcePolicy`
- `PolicyBundle`

## Implementation steps

1. 把四类策略做成 domain 对象。
2. 给 `WorkspaceSpec` 和 `RunContext` 增加策略引用或内联快照。
3. runner 在执行前做策略校验和归一化。
4. 把实际应用的策略快照记录到 run record。
5. 为 no-secret、offline、resource limits 提供明确默认值。

## Rust-specific guidance

- 策略既要能配置，也要能持久化和回显，因此必须可序列化。
- 不要把策略判断散落在多个 runner 中，先收敛到 policy enforcer。
- secret policy 建议采用 allowlist，不采用“默认继承全部环境变量”。
- resource policy 先定义模型和可执行接口，不必一次覆盖所有平台细节。

## Testing

- 测试策略序列化和默认值。
- 测试不同策略组合下的运行前校验。
- 测试 run record 能完整反映当次执行使用的策略。

## Done when

- 执行边界、secret、network、resource 已经是产品一等概念。
- 任何一次 run 都能被审计出当时应用了什么策略。
