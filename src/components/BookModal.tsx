import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, X } from 'lucide-react'
import { Button } from './ui/button'
import { booksService } from '../services/books.service'
import { getApiErrorMessage } from '../lib/apiError'
import type { Book, CreateBookRequest } from '../types/book'

interface BookModalProps {
  isOpen: boolean
  onClose: () => void
  bookToEdit?: Book | null
  onSuccess: () => void
}

export function BookModal({ isOpen, onClose, bookToEdit, onSuccess }: BookModalProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [publisher, setPublisher] = useState('')
  const [publishedYear, setPublishedYear] = useState('')
  const [pages, setPages] = useState('')
  const [language, setLanguage] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title)
      setAuthor(bookToEdit.author)
      setIsbn(bookToEdit.isbn || '')
      setPublisher(bookToEdit.publisher || '')
      setPublishedYear(bookToEdit.publishedYear?.toString() || '')
      setPages(bookToEdit.pages?.toString() || '')
      setLanguage(bookToEdit.language || '')
      setDescription(bookToEdit.description || '')
    } else {
      setTitle('')
      setAuthor('')
      setIsbn('')
      setPublisher('')
      setPublishedYear('')
      setPages('')
      setLanguage('')
      setDescription('')
    }
    setError('')
  }, [bookToEdit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const bookData: CreateBookRequest = {
        title,
        author,
        ...(isbn && { isbn }),
        ...(publisher && { publisher }),
        ...(publishedYear && { publishedYear: parseInt(publishedYear) }),
        ...(pages && { pages: parseInt(pages) }),
        ...(language && { language }),
        ...(description && { description }),
      }

      if (bookToEdit) {
        await booksService.updateBook(bookToEdit.id, bookData)
      } else {
        await booksService.createBook(bookData)
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'bookForm.genericError'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" data-testid="book-modal">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative animate-fadeIn my-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          data-testid="modal-close-button"
          aria-label={t('bookForm.close')}
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {bookToEdit ? t('bookForm.editTitle') : t('bookForm.createTitle')}
          </h2>
          <p className="text-gray-600 text-sm mt-1">{t('bookForm.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bookForm.fields.title')} *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('bookForm.fields.titlePlaceholder')}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bookForm.fields.author')} *
              </label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('bookForm.fields.authorPlaceholder')}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bookForm.fields.isbn')}
              </label>
              <input
                id="isbn"
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('bookForm.fields.isbnPlaceholder')}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bookForm.fields.publisher')}
              </label>
              <input
                id="publisher"
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('bookForm.fields.publisherPlaceholder')}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="publishedYear" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bookForm.fields.publishedYear')}
              </label>
              <input
                id="publishedYear"
                type="number"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('bookForm.fields.publishedYearPlaceholder')}
                min="1000"
                max="2100"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bookForm.fields.pages')}
              </label>
              <input
                id="pages"
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('bookForm.fields.pagesPlaceholder')}
                min="1"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bookForm.fields.language')}
              </label>
              <input
                id="language"
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('bookForm.fields.languagePlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('bookForm.fields.description')}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
              placeholder={t('bookForm.fields.descriptionPlaceholder')}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
              data-testid="cancel-button"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={loading}
              data-testid="save-book-button"
            >
              {loading
                ? t('bookForm.submitting')
                : bookToEdit
                  ? t('bookForm.submitEdit')
                  : t('bookForm.submitCreate')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
