import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Button } from './ui/button'
import { googleBooksService, type BookSuggestion } from '../services/googleBooks.service'

interface GoogleBooksSearchProps {
  onSelect: (suggestion: BookSuggestion) => void
  disabled?: boolean
}

export function GoogleBooksSearch({ onSelect, disabled }: GoogleBooksSearchProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BookSuggestion[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(false)
    try {
      setResults(await googleBooksService.search(query))
    } catch {
      setResults(null)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // Enter would otherwise submit the surrounding book form.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void search()
    }
  }

  return (
    <section
      className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4"
      aria-labelledby="google-books-title"
      data-testid="google-books-search"
    >
      <h3 id="google-books-title" className="text-sm font-semibold text-gray-900">
        {t('bookForm.import.title')}
      </h3>
      <p className="mb-3 text-xs text-gray-500">{t('bookForm.import.hint')}</p>

      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('bookForm.import.placeholder')}
          aria-label={t('bookForm.import.ariaLabel')}
          data-testid="google-books-query"
          disabled={disabled}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => void search()}
          disabled={disabled || loading || !query.trim()}
          data-testid="google-books-search-button"
        >
          <Search className="mr-1 h-4 w-4" aria-hidden="true" />
          {loading ? t('bookForm.import.searching') : t('bookForm.import.search')}
        </Button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert" data-testid="google-books-error">
          {t('bookForm.import.error')}
        </p>
      )}

      {results && results.length === 0 && (
        <p className="mt-3 text-sm text-gray-500" data-testid="google-books-empty">
          {t('bookForm.import.empty')}
        </p>
      )}

      {results && results.length > 0 && (
        <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto" data-testid="google-books-results">
          {results.map((suggestion, index) => (
            <li key={suggestion.id}>
              <button
                type="button"
                onClick={() => onSelect(suggestion)}
                disabled={disabled}
                data-testid={`google-books-result-${index}`}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 text-left hover:border-purple-300 hover:bg-purple-50"
              >
                {suggestion.coverUrl ? (
                  <img src={suggestion.coverUrl} alt="" className="h-14 w-10 flex-shrink-0 rounded object-cover" />
                ) : (
                  <div className="h-14 w-10 flex-shrink-0 rounded bg-gray-100" aria-hidden="true" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-900">{suggestion.title}</span>
                  <span className="block truncate text-xs text-gray-500">
                    {suggestion.author || t('bookForm.import.unknownAuthor')}
                    {suggestion.publishedYear ? ` · ${suggestion.publishedYear}` : ''}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
