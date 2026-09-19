import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { BOOK_STATUSES, SORT_OPTIONS, type SortKey } from '../lib/bookOptions'
import type { BookStatus } from '../types/book'

const SORT_LABEL_KEYS = {
  newest: 'dashboard.filters.sortNewest',
  oldest: 'dashboard.filters.sortOldest',
  title: 'dashboard.filters.sortTitle',
  author: 'dashboard.filters.sortAuthor',
  rating: 'dashboard.filters.sortRating',
} as const

interface BookFiltersProps {
  search: string
  status: BookStatus | ''
  rating: number | ''
  sort: SortKey
  hasActiveFilters: boolean
  onSearchChange: (value: string) => void
  onStatusChange: (value: BookStatus | '') => void
  onRatingChange: (value: number | '') => void
  onSortChange: (value: SortKey) => void
  onClear: () => void
}

const CONTROL_CLASS =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent'

export function BookFilters({
  search,
  status,
  rating,
  sort,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onRatingChange,
  onSortChange,
  onClear,
}: BookFiltersProps) {
  const { t } = useTranslation()

  return (
    <div
      className="mb-4 flex flex-col gap-3 md:flex-row md:items-center"
      role="search"
      aria-label={t('dashboard.filters.label')}
      data-testid="book-filters"
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('dashboard.filters.searchPlaceholder')}
          aria-label={t('dashboard.filters.searchAriaLabel')}
          data-testid="book-search-input"
          className={`w-full pl-9 ${CONTROL_CLASS}`}
        />
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as BookStatus | '')}
        aria-label={t('dashboard.filters.statusAriaLabel')}
        data-testid="book-filter-status"
        className={CONTROL_CLASS}
      >
        <option value="">{t('dashboard.filters.statusAll')}</option>
        {BOOK_STATUSES.map((value) => (
          <option key={value} value={value}>
            {t(`bookStatus.${value}`)}
          </option>
        ))}
      </select>

      <select
        value={rating}
        onChange={(e) => onRatingChange(e.target.value ? Number(e.target.value) : '')}
        aria-label={t('dashboard.filters.ratingAriaLabel')}
        data-testid="book-filter-rating"
        className={CONTROL_CLASS}
      >
        <option value="">{t('dashboard.filters.ratingAll')}</option>
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>
            {t('dashboard.filters.ratingOption', { count: value })}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        aria-label={t('dashboard.filters.sortAriaLabel')}
        data-testid="book-sort"
        className={CONTROL_CLASS}
      >
        {(Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => (
          <option key={key} value={key}>
            {t(SORT_LABEL_KEYS[key])}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          data-testid="book-filters-clear"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-purple-600 hover:bg-purple-50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          {t('dashboard.filters.clear')}
        </button>
      )}
    </div>
  )
}
