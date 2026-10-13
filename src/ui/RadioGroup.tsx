import * as React from 'react'
import { CircleIcon } from 'lucide-react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '../utils/cn'

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border border-[color:var(--x-ui-border,var(--color-input))] text-[color:var(--x-ui-primary,var(--color-primary))] shadow-sm transition-[color,box-shadow] outline-none focus-visible:border-[color:var(--x-ui-focus,var(--color-ring))] focus-visible:ring-[3px] focus-visible:ring-[color:var(--x-ui-focus,var(--color-ring))]/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[color:var(--x-ui-danger,var(--color-destructive))] aria-invalid:ring-[color:var(--x-ui-danger,var(--color-destructive))]/20 dark:bg-[var(--x-ui-surface,var(--color-input))]/30 dark:aria-invalid:ring-[color:var(--x-ui-danger,var(--color-destructive))]/40",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-[var(--x-ui-primary,var(--color-primary))]" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
