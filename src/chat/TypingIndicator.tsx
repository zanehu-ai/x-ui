import { chatT, type ChatLang } from './i18n'
import { cn } from './utils'

export interface TypingIndicatorProps {
  who: 'ai' | 'agent'
  language?: ChatLang | string
  className?: string
}

export function TypingIndicator({ who, language = 'ru', className }: TypingIndicatorProps) {
  const label = chatT(language, `typing.${who}`)
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center gap-2 px-3 py-1', className)}
    >
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1.5',
          who === 'agent'
            ? 'bg-[var(--x-ui-success-bg,var(--color-emerald-50,#ecfdf5))] border border-[var(--x-ui-success-border,var(--color-emerald-200,#a7f3d0))]'
            : 'bg-[var(--x-ui-muted,var(--color-slate-100,#f1f5f9))]',
        )}
      >
        <span className="size-1.5 animate-bounce rounded-full bg-[var(--x-ui-muted-fg,var(--color-slate-500,#64748b))] [animation-delay:0ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-[var(--x-ui-muted-fg,var(--color-slate-500,#64748b))] [animation-delay:150ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-[var(--x-ui-muted-fg,var(--color-slate-500,#64748b))] [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-[color:var(--x-ui-muted-fg,var(--color-slate-500,#64748b))]">{label}</span>
    </div>
  )
}
