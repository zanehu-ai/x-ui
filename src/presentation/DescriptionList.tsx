import type { ReactNode } from 'react'

function isEmptyValue(value: ReactNode): boolean {
  return value == null || value === false || value === ''
}

export function DescriptionSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <span className="h-4 w-0.5 rounded-full bg-indigo-500" aria-hidden="true" />
        {title}
      </h3>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <dl className="grid sm:grid-cols-2">{children}</dl>
      </div>
    </section>
  )
}

export function DescriptionItem({
  label,
  children,
  span = 1,
}: {
  label: ReactNode
  children?: ReactNode
  span?: 1 | 2
}) {
  return (
    <div
      className={[
        'flex min-w-0 border-b border-slate-200 sm:border-r',
        span === 2 ? 'sm:col-span-2 sm:border-r-0' : '',
      ].join(' ')}
    >
      <dt className="w-[7.5rem] shrink-0 bg-slate-50 px-3 py-2.5 text-xs font-medium leading-5 text-slate-500">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 px-3 py-2.5 text-sm leading-5 text-slate-900 break-words">
        {isEmptyValue(children) ? <span className="text-slate-400">—</span> : children}
      </dd>
    </div>
  )
}

export function DescriptionSummary({
  title,
  subtitle,
  extra,
}: {
  title: ReactNode
  subtitle?: ReactNode
  extra?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-indigo-100 bg-indigo-50/70 px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-base font-semibold text-slate-900">{title}</div>
        {subtitle ? <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div> : null}
      </div>
      {extra ? <div className="shrink-0">{extra}</div> : null}
    </div>
  )
}
