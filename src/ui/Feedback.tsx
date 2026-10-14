import { forwardRef, useCallback, type CSSProperties, type HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Keep the content mounted and preserve its dimensions while loading. */
  loading?: boolean
  width?: CSSProperties['width']
  height?: CSSProperties['height']
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { loading = true, width, height, children, className, style, ...props },
  ref,
) {
  // Attribute assignment works with both supported React 18 and React 19.
  // Server output still hides this subtree visually and from assistive technology.
  const setContentRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    if (loading) node.setAttribute('inert', '')
    else node.removeAttribute('inert')
  }, [loading])

  return (
    <div
      {...props}
      ref={ref}
      data-slot="skeleton"
      data-state={loading ? 'loading' : 'ready'}
      aria-busy={loading}
      className={cn(
        'relative rounded-md',
        loading && 'x-ui-skeleton bg-[var(--x-ui-muted,#f3f4f6)]',
        loading && children == null && 'h-4 w-full',
        className,
      )}
      style={{ width, height, ...style }}
    >
      {children != null && (
        <div
          ref={setContentRef}
          aria-hidden={loading ? true : undefined}
          style={loading ? { visibility: 'hidden', pointerEvents: 'none' } : undefined}
        >
          {children}
        </div>
      )}
    </div>
  )
})

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Accessible name; use the host's translated loading text. */
  label?: string
  /** Hide from assistive technology when nearby content already announces loading. */
  decorative?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const spinnerSizes = { sm: 12, md: 16, lg: 24 } as const

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { label = 'Loading', decorative = false, size = 'md', className, style, 'aria-label': ariaLabel, ...props },
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      data-slot="spinner"
      role={decorative ? undefined : 'status'}
      aria-label={decorative ? undefined : ariaLabel ?? label}
      aria-hidden={decorative ? true : undefined}
      className={cn(
        'x-ui-spinner inline-block shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent align-middle motion-reduce:animate-none',
        className,
      )}
      style={{ width: spinnerSizes[size], height: spinnerSizes[size], ...style }}
    />
  )
})

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** A finite percentage is clamped to 0–100; omitted/null/nonfinite is indeterminate. */
  value?: number | null
  /** Accessible name; a caller can instead pass aria-label or aria-labelledby. */
  label?: string
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, label = 'Progress', className, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy, ...props },
  ref,
) {
  const percentage = typeof value === 'number' && Number.isFinite(value)
    ? Math.min(100, Math.max(0, value))
    : undefined
  const indeterminate = percentage === undefined

  return (
    <div
      {...props}
      ref={ref}
      data-slot="progress"
      data-state={indeterminate ? 'indeterminate' : percentage === 100 ? 'complete' : 'loading'}
      role="progressbar"
      aria-label={ariaLabel ?? (labelledBy ? undefined : label)}
      aria-labelledby={labelledBy}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-[var(--x-ui-muted,#f3f4f6)]', className)}
    >
      <div
        data-slot="progress-indicator"
        aria-hidden="true"
        className={cn('h-full rounded-full bg-[var(--x-ui-fg,#111827)]', indeterminate && 'x-ui-progress-indeterminate')}
        style={{ width: indeterminate ? '40%' : `${percentage}%` }}
      />
    </div>
  )
})
