import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const hintId = hint ? `${inputId}-hint` : undefined
    const errorId = error ? `${inputId}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={describedBy}
          className={cn(
            'flex h-10 w-full rounded-md border border-[color:var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] px-3 py-2 text-sm placeholder:text-[color:var(--x-ui-muted-fg,var(--color-gray-400,#9ca3af))] focus:border-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))] focus:outline-none focus:ring-2 focus:ring-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))]/20 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[color:var(--x-ui-danger,var(--color-red-500,#ef4444))] focus:border-[color:var(--x-ui-danger,var(--color-red-500,#ef4444))] focus:ring-[color:var(--x-ui-danger,var(--color-red-500,#ef4444))]/20',
            className,
          )}
          {...props}
        />
        {hint && <p id={hintId} className="text-xs text-[color:var(--x-ui-muted-fg,var(--color-gray-500,#6b7280))]">{hint}</p>}
        {error && <p id={errorId} className="text-sm text-[color:var(--x-ui-danger,var(--color-red-500,#ef4444))]">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
