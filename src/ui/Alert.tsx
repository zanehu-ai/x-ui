import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

const variants = {
  neutral: 'border-[color:var(--x-ui-border,var(--color-gray-200,#e5e7eb))] bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))] text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))]',
  success: 'border-[color:var(--x-ui-success-border,var(--color-green-200,#bbf7d0))] bg-[var(--x-ui-success-bg,var(--color-green-50,#f0fdf4))] text-[color:var(--x-ui-success-fg,var(--color-green-800,#166534))]',
  warning: 'border-[color:var(--x-ui-warning-border,var(--color-yellow-200,#fef08a))] bg-[var(--x-ui-warning-bg,var(--color-yellow-50,#fefce8))] text-[color:var(--x-ui-warning-fg,var(--color-yellow-900,#713f12))]',
  danger: 'border-[color:var(--x-ui-danger-border,var(--color-red-200,#fecaca))] bg-[var(--x-ui-danger-bg,var(--color-red-50,#fef2f2))] text-[color:var(--x-ui-danger-fg,var(--color-red-700,#b91c1c))]',
  info: 'border-[color:var(--x-ui-info-border,var(--color-blue-200,#bfdbfe))] bg-[var(--x-ui-info-bg,var(--color-blue-50,#eff6ff))] text-[color:var(--x-ui-info-fg,var(--color-blue-800,#1e40af))]',
} as const

export type AlertVariant = keyof typeof variants

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
}

export function Alert({
  className,
  role,
  variant = 'neutral',
  ...props
}: AlertProps) {
  return (
    <div
      role={role ?? (variant === 'danger' ? 'alert' : 'status')}
      className={cn(
        'rounded-md border px-3 py-2 text-sm leading-6',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
