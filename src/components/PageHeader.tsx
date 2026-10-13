import type { ReactNode } from 'react'

export interface PageHeaderProps {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--x-ui-border,var(--color-gray-200,#e5e7eb))] pb-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase text-[color:var(--x-ui-muted-fg,var(--color-gray-500,#6b7280))]">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold text-[color:var(--x-ui-fg,var(--color-gray-950,#030712))]">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm text-[color:var(--x-ui-muted-fg,var(--color-gray-600,#4b5563))]">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
