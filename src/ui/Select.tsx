import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { cn } from '../utils/cn'
import { useThemeSurface } from '../theme/ThemeProvider'

export type SelectOption = {
  label: React.ReactNode
  value: string
  disabled?: boolean
}

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-lg border border-[color:var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] px-3 py-2 text-sm outline-none transition-colors placeholder:text-[color:var(--x-ui-muted-fg,var(--color-gray-400,#9ca3af))] focus:border-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))] focus:ring-2 focus:ring-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))]/20 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  style,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const { className: themeClassName, style: themeStyle, ...themeAttrs } = useThemeSurface()
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        {...themeAttrs}
        data-slot="select-content"
        className={cn(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border bg-[var(--x-ui-surface,var(--color-white,#fff))] text-[color:var(--x-ui-fg,var(--color-gray-900,#111827))] shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          themeClassName,
          themeClassName && 'border-[color:var(--x-ui-border)]',
          className,
        )}
        style={{ ...themeStyle, ...style }}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('px-2 py-1.5 text-sm font-medium', className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-none focus:bg-[var(--x-ui-muted,var(--color-blue-50,#eff6ff))] focus:text-[color:var(--x-ui-fg,var(--color-blue-900,#1e3a8a))] data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('-mx-1 my-1 h-px bg-[var(--x-ui-border,var(--color-gray-200,#e5e7eb))]', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export interface SelectFieldProps {
  'aria-label'?: string
  id?: string
  name?: string
  required?: boolean
  value: string
  onValueChange: (value: string) => void
  options: readonly SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: React.ReactNode
  hint?: React.ReactNode
}

const visuallyHiddenSelectStyle: React.CSSProperties = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
}

function SelectField({
  'aria-label': ariaLabel,
  id,
  name,
  required,
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
  label,
  hint,
}: SelectFieldProps) {
  const generatedId = React.useId()
  const triggerId = id ?? `${generatedId}-select`
  const labelId = `${triggerId}-label`
  const hintId = hint ? `${triggerId}-hint` : undefined
  const listboxId = `${triggerId}-listbox`
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const filteredOptions = React.useMemo(
    () =>
      options.filter(
        (option, index, arr) =>
          option.value !== '' && arr.findIndex((candidate) => candidate.value === option.value) === index,
      ),
    [options],
  )
  const selectedIndex = filteredOptions.findIndex((option) => option.value === value)
  const selectedOption = selectedIndex >= 0 ? filteredOptions[selectedIndex] : undefined
  const selectedLabel = selectedOption?.label
  const wrapperClass = React.useMemo(
    () =>
      cn(
        'relative',
        className?.includes('w-full') ? 'block w-full' : 'inline-block',
        !className?.includes('w-') && !className?.includes('min-w-') && 'min-w-32',
      ),
    [className],
  )

  React.useEffect(() => {
    if (!open) return
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  function selectValue(next: string) {
    const option = filteredOptions.find((candidate) => candidate.value === next)
    if (disabled || option?.disabled) return
    onValueChange(next)
    setOpen(false)
  }

  function moveSelection(delta: 1 | -1) {
    if (!filteredOptions.length) return
    const start = selectedIndex < 0 ? 0 : selectedIndex
    for (let step = 1; step <= filteredOptions.length; step += 1) {
      const nextIndex = (start + delta * step + filteredOptions.length) % filteredOptions.length
      const next = filteredOptions[nextIndex]
      if (!next?.disabled) {
        selectValue(next.value)
        return
      }
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) setOpen(true)
      else moveSelection(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) setOpen(true)
      else moveSelection(-1)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen((current) => !current)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const select = (
    <div className={wrapperClass} ref={rootRef}>
      {name && !disabled ? (
        <select
          aria-hidden="true"
          name={name}
          onChange={(event) => selectValue(event.currentTarget.value)}
          required={required}
          style={visuallyHiddenSelectStyle}
          tabIndex={-1}
          value={value}
        >
          <option value="" />
          {filteredOptions.map((option) => (
            <option disabled={option.disabled} key={option.value} value={option.value}>
              {typeof option.label === 'string' ? option.label : option.value}
            </option>
          ))}
        </select>
      ) : null}
      <button
        aria-controls={listboxId}
        aria-disabled={disabled || undefined}
        aria-expanded={open}
        aria-describedby={hintId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-labelledby={!ariaLabel && label ? labelId : undefined}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[color:var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] px-3 py-2 text-left text-sm text-[color:var(--x-ui-fg,var(--color-gray-950,#030712))] shadow-sm outline-none transition-colors placeholder:text-[color:var(--x-ui-muted-fg,var(--color-gray-400,#9ca3af))] focus:border-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))] focus:ring-2 focus:ring-[color:var(--x-ui-focus,var(--color-blue-500,#3b82f6))]/20 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        disabled={disabled}
        id={triggerId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        role="combobox"
        type="button"
      >
        <span className={cn('truncate', !selectedOption && 'text-[color:var(--x-ui-muted-fg,var(--color-gray-400,#9ca3af))]')}>
          {selectedOption ? selectedLabel : (placeholder ?? '')}
        </span>
        <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 text-[color:var(--x-ui-muted-fg,var(--color-gray-400,#9ca3af))]" />
      </button>
      {open ? (
        <div
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-[color:var(--x-ui-border,var(--color-gray-200,#e5e7eb))] bg-[var(--x-ui-surface,var(--color-white,#fff))] p-1 text-sm text-[color:var(--x-ui-fg,var(--color-gray-950,#030712))] shadow-lg"
          id={listboxId}
          role="listbox"
        >
          {filteredOptions.map((option) => {
            const selected = option.value === value
            return (
              <button
                aria-disabled={option.disabled || undefined}
                aria-selected={selected}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                  option.disabled
                    ? 'cursor-not-allowed text-[color:var(--x-ui-muted-fg,var(--color-gray-400,#9ca3af))]'
                    : 'text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))] hover:bg-[var(--x-ui-muted,var(--color-blue-50,#eff6ff))] hover:text-[color:var(--x-ui-fg,var(--color-blue-900,#1e3a8a))]',
                  selected && 'bg-[var(--x-ui-muted,var(--color-blue-50,#eff6ff))] text-[color:var(--x-ui-fg,var(--color-blue-900,#1e3a8a))]',
                )}
                disabled={option.disabled}
                key={option.value}
                onClick={() => selectValue(option.value)}
                role="option"
                type="button"
              >
                <span className="truncate">{option.label}</span>
                {selected ? <CheckIcon aria-hidden="true" className="size-4 shrink-0" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
  if (!label && !hint) return select
  return (
    <div className="block space-y-1 text-sm font-medium text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))]">
      {label ? <span id={labelId}>{label}</span> : null}
      {select}
      {hint ? <span id={hintId} className="block text-xs font-normal text-[color:var(--x-ui-muted-fg,var(--color-gray-500,#6b7280))]">{hint}</span> : null}
    </div>
  )
}

export {
  Select,
  SelectContent,
  SelectField,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
