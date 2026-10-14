import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '../utils/cn'
import { useThemeSurface } from '../theme/ThemeProvider'

export type PopoverProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>
export type PopoverTriggerProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
export type PopoverContentProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
export type PopoverCloseProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>

export function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root {...props} />
}

export const PopoverRoot = Popover

export const PopoverTrigger = forwardRef<ComponentRef<typeof PopoverPrimitive.Trigger>, PopoverTriggerProps>(
  function PopoverTrigger(props, ref) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} ref={ref} />
  },
)

export const PopoverClose = forwardRef<ComponentRef<typeof PopoverPrimitive.Close>, PopoverCloseProps>(
  function PopoverClose(props, ref) {
    return <PopoverPrimitive.Close data-slot="popover-close" {...props} ref={ref} />
  },
)

export const PopoverContent = forwardRef<ComponentRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(
  function PopoverContent({ className, style, sideOffset = 6, align = 'center', ...props }, ref) {
    const surface = useThemeSurface()
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          {...surface}
          {...props}
          ref={ref}
          data-slot="popover-content"
          sideOffset={sideOffset}
          align={align}
          className={cn(
            'z-50 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-[var(--x-ui-border,#d1d5db)] bg-[var(--x-ui-surface,#ffffff)] p-4 text-sm text-[var(--x-ui-fg,#111827)] shadow-lg outline-none',
            surface.className,
            className,
          )}
          style={{ ...surface.style, ...style }}
        />
      </PopoverPrimitive.Portal>
    )
  },
)
