---
title: Implement shared cache modeling and mount behavior
source: specs/phase-2-warm-layers.md
depends_on:
  - TASK-7
  - TASK-10
---

# TASK-11 - Implement shared cache modeling and mount behavior

Source: `specs/phase-2-warm-layers.md`  
Depends on: `TASK-7`, `TASK-10`

## Goal

把“共享缓存”从隐式目录技巧提升为显式模型，让 workspace 能安全、可观测地复用依赖缓存。

## Suggested modules

- `src/domain/layer.rs`
- `src/domain/policy.rs`
- `src/app/workspace_service.rs`
- `src/app/layer_service.rs`
- `src/infra/materializer/cache_mounts.rs`

## Core Rust types

- `CacheLayer`
- `CacheKind`
- `CacheMountSpec`
- `CacheAttachment`
- `CachePolicy`

## Implementation steps

1. 定义 cache kind，例如 `Gradle`, `CargoRegistry`, `CargoGit`, `Maven`, `Toolchain`。
2. 为每类 cache 定义 identity 和默认路径规则。
3. 在 `WorkspaceSpec` 中加入 cache attachment 列表。
4. materializer 根据 backend 把 attachment 映射成实际目录或挂载行为。
5. 把 cache 使用情况写回 registry，支持后续清理和观察。

## Rust-specific guidance

- cache 模型要放在 domain/app，实际 mount 行为才放 infra。
- 不要让业务层直接持有裸路径字符串，建议用 `PathBuf` 或专用 `CachePath` 包装。
- 为 cache 引入读写模式，如只读、读写、任务私有覆盖，后续安全策略会用到。
- cache attachment 失败时，错误要能指出是“policy 不允许”还是“backend 不支持”。

## Testing

- 测试 cache identity 生成稳定。
- 测试不同项目/不同 workspace 的 cache 复用规则。
- 测试 materializer 在无优化 backend 下也能正确附着 cache。

## Done when

- cache 不再是“某些目录顺手挂进来”的隐式行为。
- workspace 元数据能明确说明自己复用了哪些缓存。
