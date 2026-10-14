import * as React from 'react'
import { CheckIcon } from 'lucide-react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '../utils/cn'

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-[color:var(--x-ui-border,var(--color-input))] shadow-sm transition-shadow outline-none focus-visible:border-[color:var(--x-ui-focus,var(--color-ring))] focus-visible:ring-[3px] focus-visible:ring-[color:var(--x-ui-focus,var(--color-ring))]/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[color:var(--x-ui-danger,var(--color-destructive))] aria-invalid:ring-[color:var(--x-ui-danger,var(--color-destructive))]/20 data-[state=checked]:border-[color:var(--x-ui-primary,var(--color-primary))] data-[state=checked]:bg-[var(--x-ui-primary,var(--color-primary))] data-[state=checked]:text-[color:var(--x-ui-primary-fg,var(--color-primary-foreground))] dark:bg-[var(--x-ui-surface,var(--color-input))]/30 dark:aria-invalid:ring-[color:var(--x-ui-danger,var(--color-destructive))]/40 dark:data-[state=checked]:bg-[var(--x-ui-primary,var(--color-primary))]",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
