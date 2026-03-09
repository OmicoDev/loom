---
title: Lock CLI contracts, config model, and capability probing
source: specs/phase-0-architecture-skeleton.md
depends_on:
  - TASK-2
  - TASK-3
  - TASK-4
---

# TASK-5 - Lock CLI contracts, config model, and capability probing

Source: `specs/phase-0-architecture-skeleton.md`  
Depends on: `TASK-2`, `TASK-3`, `TASK-4`

## Goal

在大规模实现前先固定 CLI 形状、配置格式和 capability 模型，避免后面一边写功能一边重命名命令和配置键。

## CLI design

用 `clap` 定义这些 command family：

- `project add`
- `project list`
- `workspace create`
- `workspace warm`
- `workspace exec`
- `workspace diff`
- `workspace clean`
- `run agent`
- `layer list`
- `layer export`
- `doctor`

## Config model

建议在 `src/config.rs` 中定义：

- `AppConfig`
- `RegistryConfig`
- `WorkspaceRootConfig`
- `DefaultPolicyConfig`
- `LoggingConfig`

配置文件可以用 TOML，例如 `loom.toml`。

## Capability probing

定义统一的 capability 输出，不要让调用方依赖平台探测细节。建议：

- `struct CapabilityReport`
- `struct FilesystemCapabilities`
- `struct GitCapabilities`
- `struct RunnerCapabilities`
- `enum PlatformKind`

## Implementation steps

1. 用 `clap` 写出完整命令树和参数类型。
2. 为配置文件定义 serde 模型和默认值。
3. 实现配置加载顺序：默认值 -> 文件 -> CLI 覆盖。
4. 在 `app/doctor_service.rs` 定义 capability probe 输出结构。
5. 在 `infra/` 下分别实现 probe 逻辑和纯数据结构转换。

## Rust-specific guidance

- CLI struct 和业务 command DTO 分开，避免 `clap` 宏类型渗透到 app 层。
- 配置模型要可序列化和可测试，避免“隐式环境变量决定行为”。
- `doctor` 返回结构化结果，CLI 再决定打印为 table、json 或 plain text。
- capability probe 可以用 `cfg(target_os)` 分文件实现，但统一返回相同 domain/app 类型。

## Testing

- CLI parse tests，确认命令和参数能稳定解析。
- 配置 precedence tests，确认 CLI 覆盖文件配置。
- `doctor` snapshot tests，确认输出结构稳定。

## Done when

- 用户只看 `loom --help` 就能理解产品轮廓。
- capability 信息已经是结构化数据，可被 materializer 和 runner 复用。
