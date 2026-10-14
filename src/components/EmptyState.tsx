import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))] px-4 py-8 text-center">
      <p className="text-sm font-semibold text-[color:var(--x-ui-fg,var(--color-gray-900,#111827))]">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-lg text-sm text-[color:var(--x-ui-muted-fg,var(--color-gray-600,#4b5563))]">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
