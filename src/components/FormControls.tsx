import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { cn } from '../utils/cn'

export interface CheckboxFieldProps {
  checked: boolean
  className?: string
  disabled?: boolean
  hint?: ReactNode
  label: ReactNode
  onCheckedChange: (checked: boolean) => void
}

export function CheckboxField({
  checked,
  className,
  disabled,
  hint,
  label,
  onCheckedChange,
}: CheckboxFieldProps) {
  return (
    <label
      className={cn(
        'flex items-start gap-2 rounded-sm text-sm text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))]',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <Checkbox
        checked={checked}
        className="mt-0.5 border-[var(--x-ui-border,var(--color-gray-300,#d1d5db))] data-[state=checked]:border-[var(--x-ui-primary,var(--color-blue-600,#2563eb))] data-[state=checked]:bg-[var(--x-ui-primary,var(--color-blue-600,#2563eb))] data-[state=checked]:text-[color:var(--x-ui-primary-fg,var(--color-white,#fff))]"
        disabled={disabled}
        onCheckedChange={(next) => onCheckedChange(next === true)}
      />
      <span>
        <span className="font-medium">{label}</span>
        {hint ? <span className="mt-1 block text-xs font-normal text-[color:var(--x-ui-muted-fg,var(--color-gray-500,#6b7280))]">{hint}</span> : null}
      </span>
    </label>
  )
}

export interface ToggleChipProps {
  active: boolean
  children: ReactNode
  className?: string
  disabled?: boolean
  onPressedChange: () => void
}

export function ToggleChip({
  active,
  children,
  className,
  disabled,
  onPressedChange,
}: ToggleChipProps) {
  return (
    <Button
      aria-pressed={active}
      className={cn(
        'h-8 border px-3 text-sm',
        active
          ? 'border-[var(--x-ui-primary,var(--color-blue-600,#2563eb))] bg-[var(--x-ui-primary,var(--color-blue-600,#2563eb))] text-[color:var(--x-ui-primary-fg,var(--color-white,#fff))] hover:bg-[var(--x-ui-primary-hover,var(--color-blue-700,#1d4ed8))]'
          : 'border-[var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))] hover:bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))]',
        className,
      )}
      disabled={disabled}
      onClick={onPressedChange}
      size="sm"
      variant={active ? 'default' : 'outline'}
    >
      {children}
    </Button>
  )
}

export interface RangeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  hint?: ReactNode
}

export function RangeInput({ className, hint, label, ...props }: RangeInputProps) {
  const range = (
    <input
      className={cn(
        'h-2 w-full cursor-pointer accent-[var(--x-ui-primary,var(--color-blue-600,#2563eb))] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      type="range"
      {...props}
    />
  )
  if (!label && !hint) return range
  return (
    <label className="block space-y-1 text-sm font-medium text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))]">
      {label ? <span>{label}</span> : null}
      {range}
      {hint ? <span className="block text-xs font-normal text-[color:var(--x-ui-muted-fg,var(--color-gray-500,#6b7280))]">{hint}</span> : null}
    </label>
  )
}

export type FileInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'block w-full rounded-md border border-[var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] text-sm text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))] shadow-sm transition-colors file:mr-3 file:h-10 file:border-0 file:border-r file:border-[var(--x-ui-border,var(--color-gray-200,#e5e7eb))] file:bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))] file:px-3 file:text-sm file:font-medium file:text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))] hover:file:bg-[var(--x-ui-muted,var(--color-gray-100,#f3f4f6))] focus:border-[var(--x-ui-focus,var(--color-blue-500,#3b82f6))] focus:outline-none focus:ring-2 focus:ring-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))]/20 disabled:cursor-not-allowed disabled:bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))] disabled:text-[color:var(--x-ui-muted-fg,var(--color-gray-500,#6b7280))]',
        className,
      )}
      type="file"
      {...props}
    />
  )
})
