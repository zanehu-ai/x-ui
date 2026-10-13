import * as React from 'react'
import { cn } from '../utils/cn'

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, value, ...props }, ref) => {
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    const hintId = hint ? `${textareaId}-hint` : undefined
    const errorId = error ? `${textareaId}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          data-slot="textarea"
          id={textareaId}
          aria-describedby={describedBy}
          value={value ?? undefined}
          className={cn(
            'min-h-16 w-full min-w-0 rounded-lg border border-[color:var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] px-3 py-2 text-sm transition-colors outline-none placeholder:text-[color:var(--x-ui-muted-fg,var(--color-gray-400,#9ca3af))] focus:border-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))] focus:ring-2 focus:ring-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
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
Textarea.displayName = 'Textarea'

export { Textarea }
