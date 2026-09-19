import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const { t } = useTranslation()

  if (totalPages <= 1) return null

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-4"
      aria-label={t('dashboard.pagination.label')}
      data-testid="pagination"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        data-testid="pagination-prev"
      >
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
        {t('dashboard.pagination.previous')}
      </Button>
      <span className="text-sm text-gray-600" data-testid="pagination-info" aria-live="polite">
        {t('dashboard.pagination.info', { page, total: totalPages })}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        data-testid="pagination-next"
      >
        {t('dashboard.pagination.next')}
        <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}
