import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '../utils/cn'

type GroupProps = ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
/** Every group needs an accessible name through label, aria-label or aria-labelledby. */
export type SegmentedControlProps = GroupProps & (
  | { label: string }
  | { label?: string; 'aria-label': string }
  | { label?: string; 'aria-labelledby': string }
)
export type SegmentedControlItemProps = ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>

export const SegmentedControl = forwardRef<ComponentRef<typeof RadioGroupPrimitive.Root>, SegmentedControlProps>(
  function SegmentedControl({ label, className, orientation = 'horizontal', 'aria-label': ariaLabel, ...props }, ref) {
    return (
      <RadioGroupPrimitive.Root
        {...props}
        ref={ref}
        data-slot="segmented-control"
        data-orientation={orientation}
        orientation={orientation}
        aria-label={ariaLabel ?? label}
        className={cn(
          'inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-[var(--x-ui-border,#d1d5db)] bg-[var(--x-ui-muted,#f3f4f6)] p-1 data-[orientation=vertical]:flex-col',
          className,
        )}
      />
    )
  },
)

export const SegmentedControlItem = forwardRef<ComponentRef<typeof RadioGroupPrimitive.Item>, SegmentedControlItemProps>(
  function SegmentedControlItem({ className, ...props }, ref) {
    return (
      <RadioGroupPrimitive.Item
        {...props}
        ref={ref}
        data-slot="segmented-control-item"
        className={cn(
          'inline-flex min-h-9 items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-[var(--x-ui-muted-fg,#6b7280)] outline-none transition-colors hover:text-[var(--x-ui-fg,#111827)] focus-visible:ring-2 focus-visible:ring-[var(--x-ui-focus,#2563eb)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--x-ui-surface,#ffffff)] data-[state=checked]:bg-[var(--x-ui-surface,#ffffff)] data-[state=checked]:text-[var(--x-ui-fg,#111827)] data-[state=checked]:shadow-sm disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      />
    )
  },
)
