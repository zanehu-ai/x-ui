import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

const variants = {
  default: 'bg-[var(--x-ui-muted,var(--color-blue-100,#dbeafe))] text-[color:var(--x-ui-fg,var(--color-blue-800,#1e40af))]',
  neutral: 'bg-[var(--x-ui-muted,var(--color-slate-100,#f1f5f9))] text-[color:var(--x-ui-fg,var(--color-slate-800,#1e293b))]',
  success: 'bg-[var(--x-ui-success-bg,var(--color-green-100,#dcfce7))] text-[color:var(--x-ui-success-fg,var(--color-green-800,#166534))]',
  warning: 'bg-[var(--x-ui-warning-bg,var(--color-yellow-100,#fef9c3))] text-[color:var(--x-ui-warning-fg,var(--color-yellow-800,#854d0e))]',
  danger: 'bg-[var(--x-ui-danger-bg,var(--color-red-100,#fee2e2))] text-[color:var(--x-ui-danger-fg,var(--color-red-800,#991b1b))]',
  info: 'bg-[var(--x-ui-info-bg,var(--color-sky-100,#e0f2fe))] text-[color:var(--x-ui-info-fg,var(--color-sky-800,#075985))]',
  secondary: 'bg-[var(--x-ui-muted,var(--color-gray-100,#f3f4f6))] text-[color:var(--x-ui-fg,var(--color-gray-800,#1f2937))]',
} as const

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants
}

export type BadgeVariant = keyof typeof variants

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
