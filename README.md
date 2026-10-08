# @zanehu-ai/synapse-ui

跨产品前端共享组件库。为 admin、portal 等前端项目提供统一的 UI 组件和基础设施。

## 安装

```bash
# 配置 GitHub Packages npm registry
echo "@zanehu-ai:registry=https://npm.pkg.github.com" >> .npmrc

# 安装
npm install @zanehu-ai/synapse-ui
```

## 使用

```tsx
import { Button, Badge, Card, cn } from '@zanehu-ai/synapse-ui'
import { I18nProvider, useT } from '@zanehu-ai/synapse-ui'
import { createClient } from '@zanehu-ai/synapse-ui'
```

## 技术栈

- React 18/19 + TypeScript 5
- Radix UI 原语组件
- shadcn/ui v4（new-york 变体）官方源码
- Tailwind CSS（clsx + tailwind-merge）
- class-variance-authority（组件变体）

## UI 组件

所有 UI 组件基于 shadcn/ui v4 官方源码，使用 Radix UI 原语实现：

| 组件 | 说明 |
|------|------|
| Button | 按钮（default/destructive/outline/ghost + loading + asChild） |
| Badge | 徽章（default/success/warning/danger/secondary） |
| Alert | 页面提示（neutral/success/warning/danger/info） |
| Card | 卡片（Card/CardHeader/CardTitle/CardContent） |
| Input | 输入框（含 label/hint/error 提示） |
| Dialog | 对话框 |
| Select | 下拉选择 |
| Tabs | 标签页（default/line 变体，支持水平/垂直方向） |
| Switch | 开关 |
| Checkbox | 复选框 |
| RadioGroup | 单选组 |
| Avatar | 头像（Image + Fallback） |
| Accordion | 手风琴折叠面板 |
| DropdownMenu | 下拉菜单 |
| AlertDialog | 确认对话框 |
| ScrollArea | 滚动区域 |
| Separator | 分隔线 |
| Table | 表格 |
| Textarea | 多行文本（含 label/hint/error 提示） |
| AspectRatio | 宽高比容器 |
| Toolbar | 工具栏 |

## 共享基础设施

| 模块 | 说明 |
|------|------|
| `createClient` | Axios API 工厂（拦截器、错误处理、Token 管理） |
| `createAuthStore` | Zustand 认证 store 工厂（登录/登出/Token 持久化） |
| `I18nProvider` + `useT` | 国际化方案 |
| `cn` | clsx + tailwind-merge 样式合并工具 |

## 共享组件

| 组件 | 说明 |
|------|------|
| `DataTable` | TanStack Table 封装 + legacy `Column<T>` adapter + 分页 |
| `ErrorBoundary` | React 错误边界 |
| `Pagination` | 分页组件 |
| `PageHeader` | 页面标题、说明和操作区 |
| `FilterBar` | 筛选条容器 |
| `EmptyState` | 空状态 |
| `StatusBadge` | 状态徽章 |
| `ConfirmDialog` | 通用确认弹窗 |
| `ConfirmButton` | 按钮 + 确认弹窗组合 |
| `RowActions` | 表格行操作按钮组 |

## Peer Dependencies

| 包 | 版本 | 必需 |
|---|------|------|
| react | ^18.3 \|\| ^19.0 | 是 |
| react-dom | ^18.3 \|\| ^19.0 | 是 |
| axios | ^1.7 | 是 |
| zustand | ^5.0 | 是 |
| lucide-react | >=0.300 | 是 |
| @tanstack/react-query | ^5.0 | 是 |
| @tanstack/react-table | ^8.20 | 是 |

## 发布

发布流程以 [docs/RELEASE.md](docs/RELEASE.md) 为准。版本采用 `YYYY.M.N`（月份不补零，计数从 1 开始），tag 为 `x-ui-vYYYY.M.N`；tag 去掉 `x-ui-v` 后必须与已提交的 `package.json` 版本一致。

先通过版本变更 PR 更新 `package.json`、lockfile 及相关生成文件，并完成检查和 Albert 的 main 合并审批。当前 `0.1.8` 不可直接用于日历版本发布。

完成 `docs/RELEASE.md` 的 tag ruleset、`release` environment、R2 及凭证配置要求，并获得 Zane 对本次发布的明确许可后，才可手动创建并单独推送匹配的 `x-ui-vYYYY.M.N` tag；tag 必须指向 main 上的已审查提交。工作流不会自动改写版本，每个 release environment job 仍需各自审批。不要使用 `npm version patch/minor/major` 或批量 `--tags` 推送来代替这些步骤。
