import { chatT, type ChatLang } from './i18n'
import { cn } from './utils'
import { Button } from '../ui/Button'

// Backend §8.1 hard rule fires whenever the user message content matches one
// of the localized "find a human" phrases. The widget keeps no client-side
// keyword list — it just sends the localized phrase as a normal user
// message and the backend triggers escalation. Localized phrases come from
// the `transfer.label` chat-namespace key.
export interface TransferToHumanButtonProps {
  language?: ChatLang | string
  disabled?: boolean
  loading?: boolean
  onTransfer: (phrase: string) => void | Promise<void>
  className?: string
}

export function TransferToHumanButton({
  language = 'ru',
  disabled,
  loading,
  onTransfer,
  className,
}: TransferToHumanButtonProps) {
  const phrase = chatT(language, 'transfer.label')
  return (
    <Button
      type="button"
      disabled={Boolean(disabled || loading)}
      onClick={() => onTransfer(phrase)}
      className={cn(
        'border-[var(--x-ui-warning-border,var(--color-amber-300,#fcd34d))] bg-[var(--x-ui-warning-bg,var(--color-amber-50,#fffbeb))] font-semibold text-[color:var(--x-ui-warning-fg,var(--color-amber-900,#78350f))] hover:bg-[var(--x-ui-warning-bg,var(--color-amber-100,#fef3c7))] focus-visible:outline-amber-500 disabled:opacity-60',
        className,
      )}
      variant="outline"
    >
      {phrase}
    </Button>
  )
}
