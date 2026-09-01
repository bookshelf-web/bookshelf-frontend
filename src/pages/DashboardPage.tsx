import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, BookMarked, TrendingUp, BookOpenCheck, Edit, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { BookModal } from '../components/BookModal'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { useAuth } from '../contexts/AuthContext'
import { booksService } from '../services/books.service'
import { getApiErrorMessage } from '../lib/apiError'
import type { Book, Stats as StatsType } from '../types/book'

export function DashboardPage() {
  const { t } = useTranslation()
  const { logout, user } = useAuth()
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<StatsType['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [booksData, statsData] = await Promise.all([
        booksService.getBooks(),
        booksService.getStats(),
      ])
      setBooks(booksData.books)
      setStats(statsData.stats)
    } catch (err) {
      setError(getApiErrorMessage(err, 'dashboard.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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
      await booksService.deleteBook(bookToDelete.id)
      await loadData()
      setBookToDelete(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'dashboard.deleteError'))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid="dashboard-page">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('common.appName')}</h1>
              {user && <p className="text-xs text-gray-500">{user.name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="outline" size="sm" onClick={logout} className="hover:bg-gray-50">
              {t('dashboard.logout')}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.greeting', { name: user?.name || t('dashboard.greetingFallbackName') })}
          </h2>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>

        {error && (
          <div
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            data-testid="dashboard-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading ? (
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
                    {books.length === 0 ? t('dashboard.cta.titleEmpty') : t('dashboard.cta.titleMore')}
                  </h3>
                  <p className="text-white/90 mb-4">
                    {books.length === 0
                      ? t('dashboard.cta.subtitleEmpty')
                      : t('dashboard.cta.subtitleMore')}
                  </p>
                  <Button
                    onClick={handleAddBook}
                    className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                    data-testid="add-book-button"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {books.length === 0
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

            {books.length === 0 ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.map((book) => (
                    <div
                      key={book.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      data-testid={`book-item-${book.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{book.title}</h4>
                          <p className="text-sm text-gray-600">{book.author}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditBook(book)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            data-testid={`edit-book-${book.id}`}
                            aria-label={t('dashboard.bookList.editAriaLabel')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setBookToDelete(book)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            data-testid={`delete-book-${book.id}`}
                            aria-label={t('dashboard.bookList.deleteAriaLabel')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {book.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{book.description}</p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {book.isbn && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {t('dashboard.bookList.isbnBadge', { isbn: book.isbn })}
                          </span>
                        )}
                        {book.publishedYear && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{book.publishedYear}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
        onSuccess={loadData}
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
