import { cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../utils/cn'
import { Spinner } from './Feedback'

const variants = {
  default: 'bg-[var(--x-ui-primary,var(--color-blue-600,#2563eb))] text-[color:var(--x-ui-primary-fg,var(--color-white,#fff))] hover:bg-[var(--x-ui-primary-hover,var(--color-blue-700,#1d4ed8))]',
  primary: 'bg-[var(--x-ui-primary,var(--color-blue-600,#2563eb))] text-[color:var(--x-ui-primary-fg,var(--color-white,#fff))] hover:bg-[var(--x-ui-primary-hover,var(--color-blue-700,#1d4ed8))]',
  secondary: 'border border-[var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))] hover:bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))]',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-[var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))] hover:bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))]',
  ghost: 'text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))] hover:bg-[var(--x-ui-muted,var(--color-gray-100,#f3f4f6))]',
} as const

const sizes = {
  sm: 'h-8 min-w-16 px-3 text-sm',
  md: 'h-10 min-w-20 px-5 text-sm',
  lg: 'h-12 min-w-24 px-6 text-base',
  icon: 'h-10 w-10',
} as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
  asChild?: boolean
  children?: ReactNode
}

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, asChild, disabled, children, onClickCapture, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const loadingContent = (content: ReactNode) => (
      <>
        <span className="inline-flex items-center justify-center opacity-0" style={{ gap: 'inherit' }}>{content}</span>
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true"><Spinner decorative size="md" /></span>
      </>
    )
    const content = loading
      ? asChild && isValidElement<{ children?: ReactNode }>(children)
        ? cloneElement(children as ReactElement<{ children?: ReactNode }>, undefined, loadingContent(children.props.children))
        : loadingContent(children)
      : children
    return (
      <Comp
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-[var(--x-ui-button-radius,0.375rem)] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--x-ui-focus,var(--color-blue-500,#3b82f6))] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
        aria-busy={loading || props['aria-busy'] || undefined}
        aria-disabled={(asChild && (disabled || loading)) || props['aria-disabled'] || undefined}
        onClickCapture={(event) => {
          if (loading || (asChild && disabled)) {
            event.preventDefault()
            event.stopPropagation()
            return
          }
          onClickCapture?.(event)
        }}
      >
        {content}
      </Comp>
    )
  },
)

Button.displayName = 'Button'
