import type { ReactNode } from 'react'

import { StatusBadge } from './ui'

export function renderStatusBadge(value: unknown, label?: unknown): ReactNode {
  if (value === undefined || value === null || value === '') return '-'
  const text = String(value)
  const display = label === undefined || label === null || label === '' ? text : String(label)
  return <StatusBadge status={text}>{display}</StatusBadge>
}

// renderDateTime renders a backend timestamp in the viewer's LOCAL time as
// `YYYY-MM-DD HH:mm:ss`. The backend stores/serves UTC (DSN loc=UTC, Go
// time.Time → RFC3339 with a `Z`), so we must parse and convert — slicing the
// raw string would surface UTC wall-clock (8h behind CST) on every list page.
export function renderDateTime(value: unknown): ReactNode {
  if (value === undefined || value === null || value === '') return '-'
  const raw = String(value)
  // Only convert strings that actually look like a YYYY-MM-DD[ T]HH:MM timestamp.
  // Anything else (a bare number like 0, "abc", etc.) passes through untouched —
  // the lenient Date parser would otherwise coerce "0" into a bogus year.
  const slice = () => {
    const text = raw.replace('T', ' ')
    return text.length > 19 ? text.slice(0, 19) : text
  }
  if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(raw)) {
    return slice()
  }
  // If the string carries no timezone designator, assume UTC (backend default)
  // so a naive "2026-06-01 02:19:14" isn't parsed as local by the engine.
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(raw)
  const iso = hasTz ? raw : `${raw.replace(' ', 'T')}Z`
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return slice() // unparseable despite looking date-like
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function renderMoney(amount: unknown, currency?: unknown): ReactNode {
  if (amount === undefined || amount === null || amount === '') return '-'
  if (typeof amount === 'object' && amount !== null && 'amount' in amount) {
    return renderMoney((amount as { amount: unknown }).amount, currency)
  }

  const n = typeof amount === 'number' ? amount : Number(amount)
  if (Number.isNaN(n)) return String(amount)

  const cur = currency ? String(currency) : ''
  const formatted = n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return cur ? `${formatted} ${cur}` : formatted
}

export function renderBoolean(value: unknown): ReactNode {
  if (value === true) return '是'
  if (value === false) return '否'
  return '-'
}
