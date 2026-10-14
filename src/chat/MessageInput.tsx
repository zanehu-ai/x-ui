import { useState, type KeyboardEvent } from 'react'
import { chatT, type ChatLang } from './i18n'
import { cn } from './utils'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'

export interface MessageInputProps {
  language?: ChatLang | string
  disabled?: boolean
  sending?: boolean
  onSend: (content: string) => void | Promise<void>
  className?: string
}

export function MessageInput({
  language = 'ru',
  disabled,
  sending,
  onSend,
  className,
}: MessageInputProps) {
  const [draft, setDraft] = useState('')

  async function flush() {
    const trimmed = draft.trim()
    if (!trimmed) return
    try {
      await onSend(trimmed)
      setDraft('')
    } catch (error) {
      console.error('Failed to send chat message', error)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void flush()
    }
  }

  const isDisabled = Boolean(disabled || sending)

  return (
    <div
      className={cn(
        'flex items-end gap-2 border-t border-[var(--x-ui-border,var(--color-slate-200,#e2e8f0))] bg-[var(--x-ui-surface,var(--color-white,#fff))] p-3',
        className,
      )}
    >
      <Textarea
        className="min-h-[44px] max-h-40 flex-1 resize-none text-[color:var(--x-ui-fg,var(--color-slate-900,#0f172a))]"
        rows={1}
        placeholder={
          isDisabled
            ? chatT(language, 'input.disabled-closed')
            : chatT(language, 'input.placeholder')
        }
        value={draft}
        disabled={isDisabled}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        aria-label={chatT(language, 'input.placeholder')}
      />
      <Button
        type="button"
        className="h-10 px-4"
        disabled={isDisabled || !draft.trim()}
        onClick={() => void flush()}
      >
        {chatT(language, 'input.send')}
      </Button>
    </div>
  )
}
