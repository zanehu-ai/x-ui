import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'
import { TransferToHumanButton } from './TransferToHumanButton'
import { chatT, type ChatLang } from './i18n'
import type { ChatMessage } from './types'
import { cn } from './utils'

// Polling interval for message refresh. ADR-010 §5 explicitly forbids
// WebSocket / Server-Sent Events on the V1 web widget — short polling is
// the only allowed transport.
const POLL_INTERVAL_MS = 2_500

// Module-level frozen empty array reused across all renders so the
// `data ?? EMPTY_MESSAGES` fallback doesn't allocate a new [] every poll.
// Combined with React Query's default structuralSharing, this keeps the
// MessageList prop ref stable across no-op polls.
const EMPTY_MESSAGES: readonly ChatMessage[] = Object.freeze([])

export interface ConversationFetcher {
  /** List messages for the conversation. */
  listMessages: (params: {
    tenantId: string
    conversationId: string
    language: ChatLang | string
  }) => Promise<ChatMessage[]>
  /**
   * Send a user message via the one-shot dispatch endpoint.
   * Backend §8.1 hard rule fires when content matches a "find a human" phrase.
   */
  sendUserMessage: (params: {
    tenantId: string
    conversationId: string
    language: ChatLang | string
    content: string
  }) => Promise<void>
}

export interface ConversationViewProps {
  tenantId: string
  conversationId: string
  language: ChatLang
  /** Provided by the host app; lets us stay decoupled from any HTTP client. */
  fetcher: ConversationFetcher
  /** Called when user picks a different language in the switcher. */
  onLanguageChange?: (next: ChatLang) => void
  /** Whether the conversation is closed; disables input. */
  closed?: boolean
  /** Optional indicator of who is generating right now. */
  typing?: 'ai' | 'agent' | null
  className?: string
}

export function ConversationView({
  tenantId,
  conversationId,
  language,
  fetcher,
  onLanguageChange,
  closed,
  typing,
  className,
}: ConversationViewProps) {
  const [localLang, setLocalLang] = useState<ChatLang>(language)

  useEffect(() => {
    setLocalLang(language)
  }, [language])

  const messagesQuery = useQuery({
    queryKey: ['chat', 'messages', tenantId, conversationId, localLang],
    queryFn: () =>
      fetcher.listMessages({ tenantId, conversationId, language: localLang }),
    refetchInterval: closed ? false : POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    enabled: Boolean(tenantId && conversationId),
  })

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      fetcher.sendUserMessage({
        tenantId,
        conversationId,
        language: localLang,
        content,
      }),
    onSuccess: () => {
      void messagesQuery.refetch()
    },
  })

  const handleSend = useCallback(
    (content: string) => sendMutation.mutateAsync(content),
    [sendMutation],
  )

  const handleLangChange = useCallback(
    (next: ChatLang) => {
      setLocalLang(next)
      onLanguageChange?.(next)
    },
    [onLanguageChange],
  )

  return (
    <div
      className={cn(
        'flex h-full max-h-[640px] min-h-[400px] flex-col overflow-hidden rounded-lg border border-[var(--x-ui-border,var(--color-slate-200,#e2e8f0))] bg-[var(--x-ui-surface,var(--color-white,#fff))] shadow-sm',
        className,
      )}
      data-testid="chat-conversation-view"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--x-ui-border,var(--color-slate-200,#e2e8f0))] bg-[var(--x-ui-muted,var(--color-slate-50,#f8fafc))] px-3 py-2">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[color:var(--x-ui-fg,var(--color-slate-900,#0f172a))]">
            {chatT(localLang, 'roles.ai')}
          </span>
          <span className="font-mono text-[10px] text-[color:var(--x-ui-muted-fg,var(--color-slate-500,#64748b))]">{conversationId}</span>
        </div>
        <div className="flex items-center gap-2">
          <TransferToHumanButton
            language={localLang}
            disabled={closed}
            loading={sendMutation.isPending}
            onTransfer={(phrase) => handleSend(phrase)}
            className="!h-8 !px-3 text-xs"
          />
          <LanguageSwitcher value={localLang} onChange={handleLangChange} />
        </div>
      </div>

      <MessageList
        messages={messagesQuery.data ?? EMPTY_MESSAGES}
        language={localLang}
        loading={messagesQuery.isLoading}
        typing={typing ?? null}
      />

      <MessageInput
        language={localLang}
        disabled={Boolean(closed)}
        sending={sendMutation.isPending}
        onSend={handleSend}
      />
    </div>
  )
}
