import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../utils/cn'

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))]/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--x-ui-primary,var(--color-blue-600,#2563eb))] data-[state=unchecked]:bg-[var(--x-ui-muted,var(--color-gray-200,#e5e7eb))]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-5 rounded-full bg-[var(--x-ui-primary-fg,var(--color-white,#fff))] ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
