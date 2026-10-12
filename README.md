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

推送 tag 触发 GitHub Actions 自动发布到 GitHub Packages：

```bash
npm version patch  # 或 minor / major
git push origin main --tags
```

## Opt-in detail and configuration presentation

The `presentation` namespace provides reusable presentation blocks extracted
from the X-core console. Use it for the existing Cargo and Game screen behavior:

```tsx
import { presentation } from '@zanehu-ai/synapse-ui'

const { SimpleDialog, DescriptionSection, DescriptionItem, ConfigFieldGrid } = presentation

<SimpleDialog
  open={open}
  title="Details"
  onClose={close}
  footer={<button onClick={close}>Close</button>}
>
  <DescriptionSection title="Account">
    <DescriptionItem label="Balance">{presentation.renderMoney(balance, 'USD')}</DescriptionItem>
  </DescriptionSection>
  <ConfigFieldGrid
    fields={[{ key: 'enabled', label: 'Enabled' }]}
    row={{ enabled: true }}
    labels={{ emptyValue: '-', yes: 'Yes', no: 'No' }}
  />
</SimpleDialog>
```

This is an additive API. The existing root `SimpleDialog`, `StatusBadge`,
`Button`, `Badge`, `ToggleChip`, and `format*` functions retain their defaults.
The namespace intentionally preserves the consuming console's behavior:

- `SimpleDialog` has a scrollable body, optional `bodyClassName`, sticky `footer`,
  and `modal` (default `true`). Outside pointer/focus interaction does not close
  the dialog. Escape and the close control still call `onClose`.
- `StatusBadge` supports a custom child label with color chosen from `status`.
  `Badge` uses neutral styling for default/secondary/outline variants; `Button`
  disables itself and displays `Loading...` while loading. `ToggleChip` preserves
  the existing pressed-state callback and explicit button type.
- `DescriptionSection`, `DescriptionItem`, and `DescriptionSummary` render detail
  layouts; empty item values use an em dash while numeric zero stays visible.
- `ConfigFieldGrid` requires explicit `labels` (`emptyValue`, `yes`, `no`) from
  the host locale. It needs no translation provider and retains field renderers,
  hints, and JSON display.
- `renderDateTime` treats timezone-less backend timestamps as UTC and displays
  viewer-local `YYYY-MM-DD HH:mm:ss`. Non-date and invalid values retain their
  former display behavior. `renderMoney` accepts decimal objects, appends an
  optional currency code, and preserves missing/invalid values. These functions
  are deliberately distinct from the existing `formatDateTime`/`formatMoney`.

Consumers must include this package's `dist/**/*.js` in their Tailwind source
scan, as for the existing components. No CSS runtime or additional provider is
introduced.

### Consumer migration after release

This checkout keeps its existing package version. The new API must be published
in a new release before a consumer commits a dependency on it; published `0.1.8`
does not include `presentation`. A local `npm pack` artifact is for validation
only and must not become a committed file path dependency.

Replace generic implementations with package re-exports. For example:

```tsx
import { presentation } from '@zanehu-ai/synapse-ui'

export const { Badge, Button, SimpleDialog, StatusBadge, ToggleChip } = presentation
export type BadgeProps = presentation.BadgeProps
export type ButtonProps = presentation.ButtonProps
export type SimpleDialogProps = presentation.SimpleDialogProps
export type StatusBadgeProps = presentation.StatusBadgeProps
```

Keep only the host's locale adapter around `ConfigFieldGrid`; pass the existing
translations rather than changing locale behavior. Preserve optional explicit
host labels for independently hosted product features:

```tsx
import { presentation } from '@zanehu-ai/synapse-ui'
import { useTranslation } from '../i18n'

export type ConfigField<T> = presentation.ConfigField<T>
type Props<T extends Record<string, unknown>> = Omit<presentation.ConfigFieldGridProps<T>, 'labels'> & { labels?: presentation.ConfigFieldLabels }

export function ConfigFieldGrid<T extends Record<string, unknown>>({ labels, ...props }: Props<T>) {
  const { t } = useTranslation()
  return <presentation.ConfigFieldGrid {...props} labels={labels ?? {
    emptyValue: t('common.empty-value'), yes: t('common.yes'), no: t('common.no'),
  }} />
}
```

Cargo detail pages and Game configuration pages already use these blocks.
Application auth, tenant selection, permission checks, and API transport stay
with the host; this presentation extraction does not replace them.

Run `npm test` to build the published entry and exercise the presentation
contracts, including the unchanged root defaults, with Node's test runner.
