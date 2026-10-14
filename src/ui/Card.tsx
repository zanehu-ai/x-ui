import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-[color:var(--x-ui-border,var(--color-gray-200,#e5e7eb))] bg-[var(--x-ui-surface,var(--color-white,#fff))] shadow-sm', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between px-6 py-4 border-b border-[color:var(--x-ui-border,var(--color-gray-200,#e5e7eb))]', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-sm font-semibold text-[color:var(--x-ui-fg,var(--color-gray-900,#111827))] tracking-tight', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-4', className)} {...props} />
}
