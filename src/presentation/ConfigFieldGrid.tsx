import type { ReactNode } from 'react'

export interface ConfigField<T> {
  key: keyof T | string
  label: ReactNode
  render?: (row: T) => ReactNode
  /** Hint shown under the value as small helper text. */
  hint?: ReactNode
}

export interface ConfigFieldLabels {
  emptyValue: ReactNode
  yes: ReactNode
  no: ReactNode
}

export interface ConfigFieldGridProps<T extends Record<string, unknown>> {
  fields: ConfigField<T>[]
  row: T
  /** Pass labels from the host locale; no translation provider is required. */
  labels: ConfigFieldLabels
}

export function ConfigFieldGrid<T extends Record<string, unknown>>({
  fields,
  row,
  labels,
}: ConfigFieldGridProps<T>) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map((field) => {
        const value = field.render
          ? field.render(row)
          : formatConfigScalar(row[field.key as string], labels)

        return (
          <div key={String(field.key)} className="space-y-1">
            <dt className="text-xs font-medium text-[color:var(--x-ui-muted-fg,var(--color-slate-500,#64748b))]">{field.label}</dt>
            <dd className="text-sm text-[color:var(--x-ui-fg,var(--color-slate-900,#0f172a))]">{value}</dd>
            {field.hint ? <p className="text-xs text-[color:var(--x-ui-muted-fg,var(--color-slate-400,#94a3b8))]">{field.hint}</p> : null}
          </div>
        )
      })}
    </dl>
  )
}

function formatConfigScalar(value: unknown, labels: ConfigFieldLabels): ReactNode {
  if (value === null || value === undefined || value === '') return labels.emptyValue
  if (typeof value === 'boolean') return value ? labels.yes : labels.no
  if (typeof value === 'object') {
    try {
      return (
        <code className="block whitespace-pre-wrap rounded bg-[var(--x-ui-muted,var(--color-slate-50,#f8fafc))] px-2 py-1 font-mono text-xs text-[color:var(--x-ui-fg,var(--color-slate-700,#334155))]">
          {JSON.stringify(value, null, 2)}
        </code>
      )
    } catch {
      return String(value)
    }
  }
  return String(value)
}
