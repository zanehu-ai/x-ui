# CLAUDE.md

## 项目概述
synapse-ui — 跨产品前端共享组件库，为所有前端项目提供统一的 UI 组件、基础设施和国际化方案。

## 技术栈
- React 18/19 + TypeScript 5
- Radix UI 原语组件
- shadcn/ui v4（new-york 变体）
- Tailwind CSS（clsx + tailwind-merge）
- class-variance-authority（组件变体）

## 架构
纯 npm library（无独立运行入口），按功能分目录：

```
src/
├── ui/           → 20 个 Radix UI 原语封装（Button/Badge/Card/Dialog/Select...）
├── components/   → 复合组件（DataTable/Pagination/ErrorBoundary）
├── hooks/        → 自定义 Hooks（usePagination）
├── api/          → Axios API 工厂（createClient）
├── store/        → Zustand 认证 store 工厂（createAuthStore）
├── i18n/         → 国际化（I18nProvider/useT）
├── utils/        → 工具函数（cn/formatters）
├── types/        → 共享类型（ApiResponse/PaginatedData）
└── index.ts      → 统一导出
```

## 常用命令
```bash
make typecheck    # TypeScript 类型检查
make clean        # 清理产物
```

## 发布
发布流程以 [docs/RELEASE.md](docs/RELEASE.md) 为准。版本采用 `YYYY.M.N`（月份不补零，计数从 1 开始），tag 为 `x-ui-vYYYY.M.N`；tag 去掉 `x-ui-v` 后必须与已提交的 `package.json` 版本一致。

先通过版本变更 PR 更新 `package.json`、lockfile 及相关生成文件，完成检查和 Albert 的 main 合并审批。当前 `0.1.8` 不可直接用于日历版本发布。

完成 `docs/RELEASE.md` 的 tag ruleset、`release` environment、R2 及凭证配置要求，并获得 Zane 对本次发布的明确许可后，才可手动创建并单独推送匹配的 `x-ui-vYYYY.M.N` tag；tag 必须指向 main 上的已审查提交。工作流不会自动改写版本，每个 release environment job 仍需各自审批。不要使用 `npm version patch/minor/major` 或批量 `--tags` 推送来代替这些步骤。

## 消费方
- 818-cargo admin/portal（`npm install @zanehu-ai/synapse-ui`）
- 未来所有前端产品

## 规范
- 所有 UI 组件基于 Radix UI 原语 + shadcn/ui 模式
- 导出必须通过 src/index.ts 统一管理
- 版本通过已审查的版本变更 PR 和手动 `x-ui-vYYYY.M.N` tag 管理；遵循 docs/RELEASE.md 及 Zane 的明确发布许可
- 合并 main 需 Albert 审批
