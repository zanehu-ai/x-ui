import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { chatT, type ChatLang } from './i18n'
import type { ChatMessage } from './types'
import { cn } from './utils'

export interface MessageListProps {
  messages: readonly ChatMessage[]
  language?: ChatLang | string
  loading?: boolean
  typing?: 'ai' | 'agent' | null
  className?: string
}

export function MessageList({
  messages,
  language = 'ru',
  loading,
  typing,
  className,
}: MessageListProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to bottom on each new message / typing toggle.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length, typing])

  return (
    <div
      ref={ref}
      className={cn(
        'flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-[var(--x-ui-surface,var(--color-white,#fff))]',
        className,
      )}
    >
      {loading ? (
        <p className="text-center text-xs text-[color:var(--x-ui-muted-fg,var(--color-slate-500,#64748b))]">
          {chatT(language, 'messages.loading')}
        </p>
      ) : null}
      {!loading && messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="max-w-xs text-center text-sm text-[color:var(--x-ui-muted-fg,var(--color-slate-500,#64748b))]">
            {chatT(language, 'messages.empty')}
          </p>
        </div>
      ) : null}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} language={language} />
      ))}
      {typing ? <TypingIndicator who={typing} language={language} /> : null}
    </div>
  )
}
