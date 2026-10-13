import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '../utils/cn'
import { useThemeSurface } from '../theme/ThemeProvider'



function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  const { className: themeClassName, style: themeStyle, ...themeAttrs } = useThemeSurface()
  return (
    <DialogPrimitive.Overlay
      {...themeAttrs}
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        themeClassName,
        className,
      )}
      style={{ ...themeStyle, ...style }}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  const { className: themeClassName, style: themeStyle, ...themeAttrs } = useThemeSurface()
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        {...themeAttrs}
        data-slot="dialog-overlay"
        className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0', themeClassName)}
        style={themeStyle}
      >
        <DialogPrimitive.Content
          {...themeAttrs}
          data-slot="dialog-content"
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            'relative z-50 w-full max-w-lg rounded-lg border bg-[var(--x-ui-surface,var(--color-white,#fff))] p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            themeClassName,
            themeClassName && 'border-[color:var(--x-ui-border)] text-[color:var(--x-ui-fg)]',
            className,
          )}
          style={{ ...themeStyle, ...style }}
          {...props}
        >
          {children}
          <DialogPrimitive.Close aria-label="Close dialog" className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-[color:var(--x-ui-surface,var(--color-white,#fff))] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))] focus:ring-offset-2">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-[color:var(--x-ui-muted-fg,var(--color-gray-500,#6b7280))]', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

/**
 * Simple Dialog wrapper that matches the existing 818-gaming admin API:
 * <SimpleDialog open={bool} onClose={fn} title="..." >content</SimpleDialog>
 */
function SimpleDialog({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={className} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  SimpleDialog,
}
