# CLAUDE.md

## 项目概述
x-ui — 跨产品前端共享组件库，为前端项目提供统一的 UI 组件、基础设施和国际化方案。仓库名为 `x-ui`，npm 包已迁移为 `@zanehu-ai/x-ui`。

## 技术栈
- React 18/19 + TypeScript 5
- Radix UI 原语组件
- shadcn/ui v4（new-york 变体）
- Tailwind CSS（clsx + tailwind-merge）
- class-variance-authority（组件变体）

## 架构
纯 npm library（无独立运行入口），按功能分目录：

本地 R&D 工作区归类到 `libraries/x-ui`。保留 `src/index.ts`、现有深层导出和 `dist` 发布路径；本次 npm 身份迁移为 `@zanehu-ai/x-ui`，尚未发布；0.1.8 消费方通过仅改身份的本地兼容包保留原始 dist。消费方通过声明的依赖安装 React 类型，不再从兄弟 `admin`/`portal` 目录建立类型符号链接。

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
推送 tag 触发 GitHub Actions 自动发布到 GitHub Packages npm：
```bash
npm version patch   # 或 minor / major
git push origin main --tags
```

## 消费方
- 818-cargo admin/portal（`npm install @zanehu-ai/x-ui`）
- 未来所有前端产品

## 规范
- 所有 UI 组件基于 Radix UI 原语 + shadcn/ui 模式
- 导出必须通过 src/index.ts 统一管理
- 版本通过 npm version + git tag 管理（语义版本）
- 合并 main 需 Albert 审批
