import { chatI18n, chatT, type ChatLang } from './i18n'
import { cn } from './utils'
import { SelectField } from '../ui/Select'

export interface LanguageSwitcherProps {
  value: ChatLang
  onChange: (next: ChatLang) => void
  className?: string
}

const LANGS = Object.keys(chatI18n) as ChatLang[]

export function LanguageSwitcher({ value, onChange, className }: LanguageSwitcherProps) {
  return (
    <label
      className={cn('inline-flex items-center gap-2 text-xs text-[color:var(--x-ui-muted-fg,var(--color-slate-600,#475569))]', className)}
    >
      <span className="sr-only">{chatT(value, 'language-switcher.label')}</span>
      <SelectField
        aria-label={chatT(value, 'language-switcher.label')}
        className="h-8 w-auto min-w-0 px-2 text-xs text-[color:var(--x-ui-fg,var(--color-slate-900,#0f172a))]"
        options={LANGS.map((lang) => ({
          label: chatT(value, `language-switcher.${lang}`),
          value: lang,
        }))}
        value={value}
        onValueChange={(next) => onChange(next as ChatLang)}
      />
    </label>
  )
}
