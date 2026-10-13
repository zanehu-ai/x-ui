import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../utils/cn'
import { useThemeSurface } from '../theme/ThemeProvider'

export type TooltipProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>
export type TooltipProviderProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>
export type TooltipTriggerProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
export type TooltipContentProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>

export function TooltipProvider(props: TooltipProviderProps) {
  return <TooltipPrimitive.Provider {...props} />
}

export function Tooltip(props: TooltipProps) {
  return <TooltipPrimitive.Root {...props} />
}

export const TooltipRoot = Tooltip

export const TooltipTrigger = forwardRef<ComponentRef<typeof TooltipPrimitive.Trigger>, TooltipTriggerProps>(
  function TooltipTrigger(props, ref) {
    return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} ref={ref} />
  },
)

export const TooltipContent = forwardRef<ComponentRef<typeof TooltipPrimitive.Content>, TooltipContentProps>(
  function TooltipContent({ className, style, sideOffset = 6, ...props }, ref) {
    const surface = useThemeSurface()
    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          {...surface}
          {...props}
          ref={ref}
          data-slot="tooltip-content"
          sideOffset={sideOffset}
          className={cn(
            'z-50 max-w-xs rounded-md border border-[var(--x-ui-border,#d1d5db)] bg-[var(--x-ui-surface,#ffffff)] px-3 py-1.5 text-xs text-[var(--x-ui-fg,#111827)] shadow-md',
            surface.className,
            className,
          )}
          style={{ ...surface.style, ...style }}
        />
      </TooltipPrimitive.Portal>
    )
  },
)
