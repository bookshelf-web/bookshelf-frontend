import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, BookMarked, TrendingUp, BookOpenCheck, SearchX } from 'lucide-react'
import { Button } from '../components/ui/button'
import { AppHeader } from '../components/AppHeader'
import { BookModal } from '../components/BookModal'
import { BookCard } from '../components/BookCard'
import { BookFilters } from '../components/BookFilters'
import { Pagination } from '../components/Pagination'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { useAuth } from '../contexts/AuthContext'
import { useBookLibrary } from '../hooks/useBookLibrary'
import { booksService } from '../services/books.service'
import { getApiErrorMessage } from '../lib/apiError'
import { SORT_OPTIONS, type SortKey } from '../lib/bookOptions'
import type { Book, BookStatus } from '../types/book'

const PAGE_SIZE = 9
const SEARCH_DEBOUNCE_MS = 300

export function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BookStatus | ''>('')
  const [rating, setRating] = useState<number | ''>('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [page, setPage] = useState(1)

  // Only a real change of the search text may reset the page; otherwise the debounce
  // timer that fires right after mount would undo a quick page change.
  const appliedSearch = useRef('')
  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchInput.trim()
      if (next === appliedSearch.current) return
      appliedSearch.current = next
      setSearch(next)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [searchInput])

  const { books, pagination, stats, loading, initialLoading, error, reload, changeStatus } =
    useBookLibrary({
      page,
      limit: PAGE_SIZE,
      status: status || undefined,
      rating: rating || undefined,
      search: search || undefined,
      ...SORT_OPTIONS[sort],
    })

  const hasActiveFilters = searchInput !== '' || status !== '' || rating !== ''
  const libraryEmpty = (stats?.total ?? 0) === 0

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    appliedSearch.current = ''
    setStatus('')
    setRating('')
    setPage(1)
  }

  const handleAddBook = () => {
    setBookToEdit(null)
    setShowAddBookModal(true)
  }

  const handleEditBook = (book: Book) => {
    setBookToEdit(book)
    setShowAddBookModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return

    try {
      setDeleteLoading(true)
      setDeleteError('')
      await booksService.deleteBook(bookToDelete.id)
      // Deleting the last book of a page would leave it empty; step back.
      if (books.length === 1 && page > 1) setPage(page - 1)
      reload()
      setBookToDelete(null)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'dashboard.deleteError'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const visibleError = error || deleteError

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid="dashboard-page">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.greeting', { name: user?.name || t('dashboard.greetingFallbackName') })}
          </h2>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>

        {visibleError && (
          <div
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            data-testid="dashboard-error"
            role="alert"
          >
            {visibleError}
          </div>
        )}

        {initialLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('dashboard.loading')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group cursor-pointer"
                data-testid="stats-total"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 text-sm font-medium">{t('dashboard.stats.totalLabel')}</p>
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-purple-50 transition-colors">
                    <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">{stats?.total || 0}</p>
                <p className="text-xs text-gray-500">{t('dashboard.stats.totalCaption')}</p>
              </div>

              <div
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-200 group cursor-pointer"
                data-testid="stats-to-read"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-blue-700 text-sm font-medium">{t('dashboard.stats.toReadLabel')}</p>
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <BookMarked className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-blue-900 mb-2">{stats?.byStatus.toRead || 0}</p>
                <p className="text-xs text-blue-600">{t('dashboard.stats.toReadCaption')}</p>
              </div>

              <div
                className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-amber-200 group cursor-pointer"
                data-testid="stats-reading"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-amber-700 text-sm font-medium">{t('dashboard.stats.readingLabel')}</p>
                  <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <BookOpenCheck className="w-5 h-5 text-amber-500 group-hover:text-amber-600 transition-colors" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-amber-900 mb-2">{stats?.byStatus.reading || 0}</p>
                <p className="text-xs text-amber-600">{t('dashboard.stats.readingCaption')}</p>
              </div>

              <div
                className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-green-200 group cursor-pointer"
                data-testid="stats-read"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-green-700 text-sm font-medium">{t('dashboard.stats.readLabel')}</p>
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="w-5 h-5 text-green-500 group-hover:text-green-600 transition-colors" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-green-900 mb-2">{stats?.byStatus.read || 0}</p>
                <p className="text-xs text-green-600">{t('dashboard.stats.readCaption')}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-2xl shadow-xl text-white mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">
                    {libraryEmpty ? t('dashboard.cta.titleEmpty') : t('dashboard.cta.titleMore')}
                  </h3>
                  <p className="text-white/90 mb-4">
                    {libraryEmpty
                      ? t('dashboard.cta.subtitleEmpty')
                      : t('dashboard.cta.subtitleMore')}
                  </p>
                  <Button
                    onClick={handleAddBook}
                    className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                    data-testid="add-book-button"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {libraryEmpty
                      ? t('dashboard.cta.buttonEmpty')
                      : t('dashboard.cta.buttonMore')}
                  </Button>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {libraryEmpty ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('dashboard.empty.title')}</h3>
                  <p className="text-gray-600 mb-6">{t('dashboard.empty.description')}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.bookList.heading')}</h3>

                <BookFilters
                  search={searchInput}
                  status={status}
                  rating={rating}
                  sort={sort}
                  hasActiveFilters={hasActiveFilters}
                  onSearchChange={setSearchInput}
                  onStatusChange={(value) => {
                    setStatus(value)
                    setPage(1)
                  }}
                  onRatingChange={(value) => {
                    setRating(value)
                    setPage(1)
                  }}
                  onSortChange={(value) => {
                    setSort(value)
                    setPage(1)
                  }}
                  onClear={clearFilters}
                />

                {pagination && (
                  <p className="mb-4 text-sm text-gray-500" data-testid="book-results-count" aria-live="polite">
                    {t('dashboard.bookList.resultsCount', { count: pagination.total })}
                  </p>
                )}

                {!loading && books.length === 0 ? (
                  <div className="py-12 text-center" data-testid="book-no-results">
                    <SearchX className="mx-auto mb-3 h-10 w-10 text-gray-400" aria-hidden="true" />
                    <h4 className="text-lg font-semibold text-gray-900">{t('dashboard.filters.noResultsTitle')}</h4>
                    <p className="text-gray-600">{t('dashboard.filters.noResultsDescription')}</p>
                  </div>
                ) : (
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity ${
                      loading ? 'opacity-60' : ''
                    }`}
                    aria-busy={loading}
                    data-testid="book-list"
                  >
                    {books.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onEdit={handleEditBook}
                        onDelete={(book) => {
                          setDeleteError('')
                          setBookToDelete(book)
                        }}
                        onStatusChange={changeStatus}
                      />
                    ))}
                  </div>
                )}

                <Pagination
                  page={pagination?.page ?? page}
                  totalPages={pagination?.totalPages ?? 1}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <BookModal
        isOpen={showAddBookModal}
        onClose={() => {
          setShowAddBookModal(false)
          setBookToEdit(null)
        }}
        bookToEdit={bookToEdit}
        onSuccess={reload}
      />

      <DeleteConfirmModal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={handleDeleteConfirm}
        bookTitle={bookToDelete?.title || ''}
        loading={deleteLoading}
      />
    </div>
  )
}
