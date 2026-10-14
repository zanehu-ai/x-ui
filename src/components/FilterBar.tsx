import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export function FilterBar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-[var(--x-ui-border,var(--color-gray-200,#e5e7eb))] bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))] p-3 md:flex-row md:items-end',
        className,
      )}
      {...props}
    />
  )
}
