import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cn } from '../utils/cn'
import { useThemeSurface } from '../theme/ThemeProvider'


function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogContent({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  const { className: themeClassName, style: themeStyle, ...themeAttrs } = useThemeSurface()
  return (
    <AlertDialogPortal>
      <AlertDialogPrimitive.Overlay
        {...themeAttrs}
        data-slot="alert-dialog-overlay"
        className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0', themeClassName)}
        style={themeStyle}
      >
        <AlertDialogPrimitive.Content
          {...themeAttrs}
          data-slot="alert-dialog-content"
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            'relative z-50 grid w-full max-w-lg gap-4 rounded-xl border bg-[var(--x-ui-surface,var(--color-white,#fff))] p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            themeClassName,
            themeClassName && 'border-[color:var(--x-ui-border)] text-[color:var(--x-ui-fg)]',
            className,
          )}
          style={{ ...themeStyle, ...style }}
          {...props}
        >
          {children}
          <AlertDialogPrimitive.Cancel className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-[color:var(--x-ui-surface,var(--color-white,#fff))] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))] focus:ring-offset-2">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </AlertDialogPrimitive.Cancel>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Overlay>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-left', className)}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('whitespace-pre-line text-sm text-[color:var(--x-ui-muted-fg,var(--color-gray-500,#6b7280))]', className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-[var(--x-ui-primary,var(--color-blue-600,#2563eb))] px-5 text-sm font-medium text-[color:var(--x-ui-primary-fg,var(--color-white,#fff))] transition-colors hover:bg-[var(--x-ui-primary-hover,var(--color-blue-700,#1d4ed8))] focus:outline-none focus:ring-2 focus:ring-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md border border-[color:var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] px-5 text-sm font-medium text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))] transition-colors hover:bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))] focus:outline-none focus:ring-2 focus:ring-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
