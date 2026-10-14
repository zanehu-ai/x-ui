import { cn } from '../utils/cn'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
  labels?: {
    total?: string
    page?: string
    prev?: string
    next?: string
    perPage?: string
  }
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  className,
  labels,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (total <= pageSize && !pageSizeOptions) return null

  const totalLabel = labels?.total ?? 'Total {total}, Page {page}/{pages}'
  const prevLabel = labels?.prev ?? 'Prev'
  const nextLabel = labels?.next ?? 'Next'
  const perPageLabel = labels?.perPage ?? '{size} / page'

  const summary = totalLabel
    .replace('{total}', String(total))
    .replace('{page}', String(page))
    .replace('{pages}', String(totalPages))

  return (
    <div className={cn('flex items-center justify-between border-t border-[var(--x-ui-border,var(--color-gray-200,#e5e7eb))] px-4 py-3', className)}>
      <span className="text-sm text-[color:var(--x-ui-muted-fg,var(--color-gray-500,#6b7280))]">{summary}</span>
      <div className="flex items-center gap-2">
        {onPageSizeChange && pageSizeOptions && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-[var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] px-2 text-sm text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))]"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {perPageLabel.replace('{size}', String(size))}
              </option>
            ))}
          </select>
        )}
        <button
          className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] px-3 text-sm text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))] hover:bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))] disabled:pointer-events-none disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {prevLabel}
        </button>
        <button
          className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--x-ui-border,var(--color-gray-300,#d1d5db))] bg-[var(--x-ui-surface,var(--color-white,#fff))] px-3 text-sm text-[color:var(--x-ui-fg,var(--color-gray-700,#374151))] hover:bg-[var(--x-ui-muted,var(--color-gray-50,#f9fafb))] disabled:pointer-events-none disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
