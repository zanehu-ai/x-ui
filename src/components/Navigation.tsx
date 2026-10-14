import type { ComponentType, ReactNode } from 'react'
import { cn } from '../utils/cn'

const navFocusClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--x-ui-focus,var(--color-blue-600,#2563eb))]'

export interface NavigationLinkProps {
  'aria-current'?: 'page'
  children: ReactNode
  className?: string
  to: string
}

export type NavigationLinkComponent = ComponentType<NavigationLinkProps>

export interface TopNavigationItem {
  id: string
  label: ReactNode
  to: string
}

export interface TopNavigationProps {
  activeId?: string
  ariaLabel?: string
  items: readonly TopNavigationItem[]
  LinkComponent: NavigationLinkComponent
}

export function TopNavigation({
  activeId,
  ariaLabel = 'Primary navigation',
  items,
  LinkComponent,
}: TopNavigationProps) {
  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap items-center gap-1">
      {items.map((item) => {
        const active = item.id === activeId
        return (
          <LinkComponent
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors',
              navFocusClass,
              active ? 'bg-[var(--x-ui-primary,var(--color-gray-950,#030712))] text-[color:var(--x-ui-primary-fg,var(--color-white,#fff))] shadow-sm' : 'text-[color:var(--x-ui-muted-fg,var(--color-gray-600,#4b5563))] hover:bg-[var(--x-ui-muted,var(--color-gray-100,#f3f4f6))] hover:text-[color:var(--x-ui-fg,var(--color-gray-950,#030712))]',
            )}
            key={item.id}
            to={item.to}
          >
            {item.label}
          </LinkComponent>
        )
      })}
    </nav>
  )
}

export interface SidebarNavigationItem {
  children?: readonly SidebarNavigationItem[]
  end?: boolean
  label: ReactNode
  to: string
}

export interface SidebarNavigationProps {
  activePath: string
  ariaLabel?: string
  groupLabel?: ReactNode
  items: readonly SidebarNavigationItem[]
  LinkComponent: NavigationLinkComponent
  notice?: ReactNode
}

export function SidebarNavigation({
  activePath,
  ariaLabel = 'Secondary navigation',
  groupLabel,
  items,
  LinkComponent,
  notice,
}: SidebarNavigationProps) {
  return (
    <nav aria-label={ariaLabel} className="space-y-3 text-sm text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))]">
      <div>
        {groupLabel ? (
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--x-ui-muted-fg,var(--color-gray-400,#9ca3af))]">
            {groupLabel}
          </p>
        ) : null}
        <div className="space-y-1">
          {items.map((item) => (
            <SidebarNavigationLink
              activePath={activePath}
              depth={0}
              item={item}
              key={item.to}
              LinkComponent={LinkComponent}
            />
          ))}
        </div>
      </div>
      {notice ? (
        <p className="rounded-md bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))] px-3 py-2 text-xs leading-5 text-[color:var(--x-ui-muted-fg,var(--color-gray-500,#6b7280))]">
          {notice}
        </p>
      ) : null}
    </nav>
  )
}

function SidebarNavigationLink({
  activePath,
  depth,
  item,
  LinkComponent,
}: {
  activePath: string
  depth: number
  item: SidebarNavigationItem
  LinkComponent: NavigationLinkComponent
}) {
  const active = isNavigationBranchActive(activePath, item)
  const selfActive = isNavigationTargetActive(activePath, item)
  const root = depth === 0
  return (
    <div>
      <LinkComponent
        aria-current={selfActive ? 'page' : undefined}
        className={cn(
          'flex items-center rounded-md font-medium transition-colors',
          root
            ? 'min-h-9 px-3 py-2 text-sm'
            : 'min-h-8 px-3 py-1.5 text-xs',
          navFocusClass,
          selfActive
            ? 'bg-[var(--x-ui-primary,var(--color-gray-950,#030712))] text-[color:var(--x-ui-primary-fg,var(--color-white,#fff))] shadow-sm'
            : active
              ? 'bg-[var(--x-ui-muted,var(--color-gray-100,#f3f4f6))] text-[color:var(--x-ui-fg,var(--color-gray-950,#030712))]'
              : root
                ? 'text-[color:var(--x-ui-muted-fg,var(--color-gray-600,#4b5563))] hover:bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))] hover:text-[color:var(--x-ui-fg,var(--color-gray-950,#030712))]'
                : 'text-[color:var(--x-ui-muted-fg,var(--color-gray-500,#6b7280))] hover:bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))] hover:text-[color:var(--x-ui-fg,var(--color-gray-950,#030712))]',
        )}
        to={item.to}
      >
        {item.label}
      </LinkComponent>
      {item.children?.length ? (
        <div className="ml-3 mt-1 space-y-1 border-l border-[var(--x-ui-border,var(--color-gray-200,#e5e7eb))] pl-2">
          {item.children.map((child) => (
            <SidebarNavigationLink
              activePath={activePath}
              depth={depth + 1}
              item={child}
              key={child.to}
              LinkComponent={LinkComponent}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function isNavigationBranchActive(activePath: string, item: SidebarNavigationItem): boolean {
  return (
    isNavigationTargetActive(activePath, item) ||
    Boolean(item.children?.some((child) => isNavigationBranchActive(activePath, child)))
  )
}

function isNavigationTargetActive(activePath: string, item: SidebarNavigationItem): boolean {
  const currentPath = activePath.split('#')[0]
  const targetPath = pathWithoutHash(item.to)
  if (item.end) return currentPath === targetPath
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

function pathWithoutHash(to: string): string {
  return to.split('#')[0] || '/'
}
