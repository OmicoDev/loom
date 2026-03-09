---
title: Build the first GUI shell without introducing GUI-only behavior
source: specs/phase-6-gui-surfaces.md
depends_on:
  - TASK-21
---

# TASK-22 - Build the first GUI shell without introducing GUI-only behavior

Source: `specs/phase-6-gui-surfaces.md`  
Depends on: `TASK-21`

## Goal

构建第一层 GUI 壳，但保证它只是 `loom` orchestration core 的前端，而不是另一套分叉实现。

## Recommended implementation direction

Rust 侧重点不是 UI 框架本身，而是把 core 暴露为稳定服务：

- 如果做 desktop，可以考虑 Tauri 或原生桌面壳
- 如果做 web，可以考虑单独前端调用 Rust 提供的本地 API/IPC

不管 UI 选型如何，Rust 核心都应保持 headless。

## Suggested modules

- `src/app/*` 继续作为唯一业务入口
- 如需 IPC，可新增 `src/interface/` 或 `src/api/`
- 不要把 GUI 逻辑塞进 `main.rs`

## Implementation steps

1. 选定第一种 GUI 形态，但不改变核心命令模型。
2. 暴露项目、workspace、run、layer、doctor 对应的服务接口。
3. 让 GUI 调这些服务，而不是自己拼 Git 命令和数据库查询。
4. 保留 CLI parity，GUI 能做的事，CLI 也必须能做。

## Rust-specific guidance

- GUI 集成层应尽量薄，只负责参数转换、状态同步和错误展示。
- app service 继续返回结构化 DTO，GUI 直接消费。
- 若引入异步 IPC，只在接口层使用，不要把整个 core 改成 async-first。

## Testing

- 核心逻辑仍以 service 和 CLI 测试为主。
- GUI 只做最小端到端冒烟验证，重点检查是否复用了既有 API。
- review 检查是否出现 GUI-only 功能或 GUI-only 数据结构。

## Done when

- GUI 成为 `loom` 的一个入口，而不是第二份实现。
- orchestration core 仍然可以在无 GUI 环境下独立运行和测试。
