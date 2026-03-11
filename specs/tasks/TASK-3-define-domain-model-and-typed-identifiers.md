---
title: Define the domain model and typed identifiers
source: specs/phase-0-architecture-skeleton.md
depends_on:
  - TASK-2
---

# TASK-3 - Define the domain model and typed identifiers

Source: `specs/phase-0-architecture-skeleton.md`  
Depends on: `TASK-2`

## Goal

把产品概念落成纯 Rust 的领域模型，让后续 repository、service、materializer、runner 都围绕统一 vocabulary 工作。

## Core types

- `Project`
- `Base`
- `Layer`
- `Workspace`
- `Run`
- `PolicyBundle`
- `CapabilityReport`
- `WorkspaceSpec`
- `WorkspaceHandle`
- `RunContext`
- `RunResult`

## Typed identifiers

建议为核心实体定义 newtype，而不是到处传 `String`：

- `ProjectId`
- `BaseId`
- `LayerId`
- `WorkspaceId`
- `RunId`

Rust 上可以写成：

- `struct ProjectId(String);`
- `struct WorkspaceId(String);`

并为它们实现 `Clone`, `Debug`, `Eq`, `Hash`, `Serialize`, `Deserialize`。

## Layer modeling

用 enum 明确 layer kind：

- `SourceBaseLayer`
- `CacheLayer`
- `WarmStateLayer`
- `TaskWritableLayer`
- `ArtifactLayer`

推荐结构：

- `enum LayerKind`
- `struct LayerMetadata`
- `struct LayerProvenance`
- `struct Layer`

## Implementation steps

1. 在 `src/domain/` 中按实体拆文件，而不是一个超大 `types.rs`。
2. 定义实体字段时优先表达业务语义，例如 `baseline_ref`、`workspace_status`、`policy_id`。
3. 用 enum 表达生命周期状态，例如 `WorkspaceStatus`、`RunStatus`。
4. 定义 `WorkspaceSpec` 作为 materializer 输入，确保它不包含平台实现细节。
5. 定义 `RunContext` 作为 runner 输入，包含 command、env、policy、workspace handle。

## Rust-specific guidance

- domain 层只使用 `std`、`serde`、`time` 之类轻量依赖。
- 不要在 domain 层出现 `rusqlite::Row`、`git` CLI 输出结构、文件系统 probe 结果原始文本。
- 为重要 enum 实现 `Display`，这样 CLI 和日志输出更清晰。
- 如果 ID 需要生成，优先在 app 层或 infra 层生成，再注入 domain。

## Suggested files

- `src/domain/project.rs`
- `src/domain/layer.rs`
- `src/domain/workspace.rs`
- `src/domain/run.rs`
- `src/domain/policy.rs`
- `src/domain/capability.rs`

## Testing

- domain 单元测试覆盖状态转换和 spec 构建。
- 序列化测试，确保核心类型能稳定序列化到配置和 manifest。
- equality/hash 测试，保证 typed ID 可安全用于 `HashMap`/`BTreeMap`。

## Done when

- `specs/` 中提到的产品概念都能被 domain 层表达。
- 代码里不再需要用“原始字符串 + 注释”表达业务含义。
