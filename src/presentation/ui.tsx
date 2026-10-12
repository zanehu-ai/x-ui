import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Badge as WebBadge } from '../ui/Badge'
import { Button as WebButton, type ButtonProps as WebButtonProps, type ButtonVariant as WebButtonVariant } from '../ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog'
import type { ToggleChipProps } from '../components/FormControls'

export type { ToggleChipProps } from '../components/FormControls'

// Compatibility presentation used by existing multi-product consoles. The root
// package components keep their original defaults; opt in through `presentation`.
export interface SimpleDialogProps {
  open: boolean
  title: ReactNode
  children: ReactNode
  onClose: () => void
  className?: string
  bodyClassName?: string
  /** Sticky footer below the scrollable body (e.g. 关闭 / 确认). */
  footer?: ReactNode
  modal?: boolean
}

export function SimpleDialog({
  open,
  title,
  children,
  onClose,
  className,
  bodyClassName,
  footer,
  modal = true,
}: SimpleDialogProps) {
  return (
    <Dialog modal={modal} open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <DialogContent
        aria-describedby={undefined}
        className={[
          'flex max-h-[90vh] flex-col overflow-hidden p-0',
          className ?? '',
        ].join(' ')}
        onInteractOutside={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="mb-0 shrink-0 border-b border-slate-200 px-5 py-4 pr-12">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className={['min-h-0 flex-1 p-5', bodyClassName ?? 'overflow-y-auto'].join(' ')}>
          {children}
        </div>
        {footer ? (
          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export interface BadgeProps {
  children?: ReactNode
  className?: string
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
}

export function Badge({ children, className, variant = 'secondary' }: BadgeProps) {
  return (
    <WebBadge className={className} variant={badgeVariant(variant)}>
      {children}
    </WebBadge>
  )
}

export interface StatusBadgeProps {
  status?: string | null
  children?: ReactNode
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const label = children ?? status ?? 'unknown'
  return <Badge variant={statusVariant(String(status ?? label))}>{label}</Badge>
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  size?: WebButtonProps['size']
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'
}

export function Button({
  children,
  disabled,
  loading,
  variant = 'default',
  ...props
}: ButtonProps) {
  return (
    <WebButton
      disabled={disabled || loading}
      variant={buttonVariant(variant)}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </WebButton>
  )
}

export function ToggleChip({
  active,
  children,
  className,
  disabled,
  onPressedChange,
}: ToggleChipProps) {
  return (
    <WebButton
      aria-pressed={active}
      className={[
        'h-8 border px-3 text-sm',
        active
          ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={onPressedChange}
      size="sm"
      type="button"
      variant={active ? 'default' : 'outline'}
    >
      {children}
    </WebButton>
  )
}

function badgeVariant(variant: NonNullable<BadgeProps['variant']>) {
  if (variant === 'default') return 'neutral'
  if (variant === 'secondary') return 'neutral'
  if (variant === 'outline') return 'neutral'
  return variant
}

function statusVariant(status: string): NonNullable<BadgeProps['variant']> {
  const normalized = status.toLowerCase()
  if (
    normalized.includes('active') ||
    normalized.includes('success') ||
    normalized.includes('settled') ||
    normalized.includes('read')
  ) {
    return 'success'
  }
  if (normalized.includes('pending') || normalized.includes('processing')) return 'warning'
  if (
    normalized.includes('fail') ||
    normalized.includes('cancel') ||
    normalized.includes('void') ||
    normalized.includes('error')
  ) {
    return 'danger'
  }
  return 'secondary'
}

function buttonVariant(variant: NonNullable<ButtonProps['variant']>): WebButtonVariant {
  if (variant === 'default') return 'primary'
  if (variant === 'destructive') return 'destructive'
  if (variant === 'ghost') return 'ghost'
  if (variant === 'secondary') return 'secondary'
  return 'outline'
}
