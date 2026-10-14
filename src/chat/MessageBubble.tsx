import { useMemo, useState } from 'react'
import { chatT, type ChatLang } from './i18n'
import type { ChatMessage } from './types'
import { cn } from './utils'

export interface MessageBubbleProps {
  message: ChatMessage
  language?: ChatLang | string
  className?: string
}

export function MessageBubble({ message, language = 'ru', className }: MessageBubbleProps) {
  const [hovered, setHovered] = useState(false)
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  const containerClass = useMemo(() => {
    if (isSystem) return 'flex justify-center'
    return isUser ? 'flex justify-end' : 'flex justify-start'
  }, [isSystem, isUser])

  const bubbleClass = useMemo(() => {
    if (isSystem) {
      return 'rounded-md bg-[var(--x-ui-muted,var(--color-slate-100,#f1f5f9))] px-3 py-1.5 text-xs text-[color:var(--x-ui-muted-fg,var(--color-slate-600,#475569))]'
    }
    if (isUser) {
      return 'max-w-[78%] rounded-2xl rounded-br-sm bg-[var(--x-ui-message-bg,var(--color-sky-600,#0284c7))] px-4 py-2 text-sm text-[color:var(--x-ui-message-fg,var(--color-white,#fff))] shadow-sm'
    }
    if (message.role === 'agent') {
      return 'max-w-[78%] rounded-2xl rounded-bl-sm bg-[var(--x-ui-success-bg,var(--color-emerald-50,#ecfdf5))] px-4 py-2 text-sm text-[color:var(--x-ui-success-fg,var(--color-emerald-950,#022c22))] shadow-sm border border-[var(--x-ui-success-border,var(--color-emerald-200,#a7f3d0))]'
    }
    return 'max-w-[78%] rounded-2xl rounded-bl-sm bg-[var(--x-ui-muted,var(--color-slate-100,#f1f5f9))] px-4 py-2 text-sm text-[color:var(--x-ui-fg,var(--color-slate-900,#0f172a))] shadow-sm'
  }, [isSystem, isUser, message.role])

  const roleLabel = chatT(language, `roles.${message.role}`)
  const timestamp = formatTimestamp(message.createdAt)

  return (
    <div
      className={cn(containerClass, className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex max-w-full flex-col gap-1">
        {!isSystem ? (
          <span
            className={cn(
              'text-xs text-[color:var(--x-ui-muted-fg,var(--color-slate-500,#64748b))]',
              isUser ? 'self-end' : 'self-start',
            )}
          >
            {roleLabel}
          </span>
        ) : null}
        <div className={bubbleClass}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        {timestamp && hovered && !isSystem ? (
          <span
            className={cn(
              'text-[10px] text-[color:var(--x-ui-muted-fg,var(--color-slate-400,#94a3b8))]',
              isUser ? 'self-end' : 'self-start',
            )}
          >
            {timestamp}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function formatTimestamp(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}
