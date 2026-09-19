import { useTranslation } from 'react-i18next'
import { Edit, Trash2 } from 'lucide-react'
import { StarRating } from './StarRating'
import { BOOK_STATUSES } from '../lib/bookOptions'
import type { Book, BookStatus } from '../types/book'

interface BookCardProps {
  book: Book
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
  onStatusChange: (book: Book, status: BookStatus) => void
}

// The title must stay the first text in the card: the E2E suites read it from
// the first line of the card's text.
export function BookCard({ book, onEdit, onDelete, onStatusChange }: BookCardProps) {
  const { t } = useTranslation()

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col"
      data-testid={`book-item-${book.id}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{book.title}</h4>
          <p className="text-sm text-gray-600">{book.author}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(book)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            data-testid={`edit-book-${book.id}`}
            aria-label={t('dashboard.bookList.editAriaLabel')}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(book)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            data-testid={`delete-book-${book.id}`}
            aria-label={t('dashboard.bookList.deleteAriaLabel')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {book.rating ? (
        <div className="mb-2">
          <StarRating rating={book.rating} testId={`book-rating-${book.id}`} />
        </div>
      ) : null}

      {book.description && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{book.description}</p>
      )}

      {book.notes && (
        <p
          className="text-sm text-gray-500 italic line-clamp-2 mb-2"
          data-testid={`book-notes-${book.id}`}
          title={t('dashboard.bookList.notesLabel')}
        >
          &ldquo;{book.notes}&rdquo;
        </p>
      )}

      <div className="flex gap-2 flex-wrap mb-3">
        {book.isbn && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {t('dashboard.bookList.isbnBadge', { isbn: book.isbn })}
          </span>
        )}
        {book.publishedYear && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{book.publishedYear}</span>
        )}
      </div>

      <select
        value={book.status}
        onChange={(e) => onStatusChange(book, e.target.value as BookStatus)}
        aria-label={t('dashboard.bookList.statusAriaLabel', { title: book.title })}
        data-testid={`book-status-${book.id}`}
        className="mt-auto w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        {BOOK_STATUSES.map((status) => (
          <option key={status} value={status}>
            {t(`bookStatus.${status}`)}
          </option>
        ))}
      </select>
    </div>
  )
}
