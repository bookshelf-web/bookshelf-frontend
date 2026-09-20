import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Button } from '../components/ui/button'
import { AppHeader } from '../components/AppHeader'
import { getApiErrorMessage } from '../lib/apiError'
import { adminCatalogService } from '../services/adminCatalog.service'
import type { CatalogBook, CatalogRevision } from '../types/catalog'

type Tab = 'books' | 'revisions'

const FIELD_KEYS = [
  'title',
  'author',
  'isbn',
  'publisher',
  'publishedYear',
  'edition',
  'pages',
  'language',
  'description',
  'coverUrl',
] as const

type FieldKey = (typeof FIELD_KEYS)[number]

const isFieldKey = (value: string): value is FieldKey => (FIELD_KEYS as readonly string[]).includes(value)

interface Loaded {
  books: CatalogBook[]
  revisions: CatalogRevision[]
  error: string
}

export function AdminCatalogPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('books')
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [version, setVersion] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [notes, setNotes] = useState<Record<string, string>>({})

  const appliedSearch = useRef('')
  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchInput.trim()
      if (next === appliedSearch.current) return
      appliedSearch.current = next
      setSearch(next)
    }, 300)
    return () => clearTimeout(id)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false
    Promise.all([adminCatalogService.listPendingBooks(search), adminCatalogService.listPendingRevisions()])
      .then(([books, revisions]) => {
        if (!cancelled) setLoaded({ books: books.books, revisions: revisions.revisions, error: '' })
      })
      .catch((err) => {
        if (!cancelled) {
          setLoaded({ books: [], revisions: [], error: getApiErrorMessage(err, 'adminCatalog.loadError') })
        }
      })
    return () => {
      cancelled = true
    }
  }, [version, search])

  const run = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id)
    setActionError('')
    try {
      await action()
      setVersion((v) => v + 1)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'adminCatalog.actionError'))
    } finally {
      setBusyId(null)
    }
  }

  const books = loaded?.books ?? []
  const revisions = loaded?.revisions ?? []
  const error = actionError || loaded?.error || ''

  const display = (value: unknown) =>
    value === null || value === undefined || value === '' ? t('adminCatalog.empty') : String(value)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid="admin-catalog-page">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{t('adminCatalog.title')}</h2>
          <p className="text-gray-600">{t('adminCatalog.subtitle')}</p>
        </div>

        <div className="flex gap-2" role="tablist">
          {(['books', 'revisions'] as const).map((key) => (
            <Button
              key={key}
              role="tab"
              aria-selected={tab === key}
              variant={tab === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab(key)}
              data-testid={`catalog-tab-${key}`}
            >
              {key === 'books' ? t('adminCatalog.tabBooks') : t('adminCatalog.tabRevisions')}
              {loaded && ` (${key === 'books' ? books.length : revisions.length})`}
            </Button>
          ))}
        </div>

        {tab === 'books' && (
          <div className="relative" role="search">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('adminCatalog.searchPlaceholder')}
              aria-label={t('adminCatalog.searchPlaceholder')}
              data-testid="catalog-search"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600" role="alert" data-testid="catalog-error">
            {error}
          </p>
        )}

        {tab === 'books' &&
          (loaded && books.length === 0 && !error ? (
            <p className="text-gray-500" data-testid="catalog-books-empty">
              {t('adminCatalog.booksEmpty')}
            </p>
          ) : (
            <ul className="space-y-3" data-testid="catalog-books-list">
              {books.map((book) => (
                <li
                  key={book.id}
                  className="bg-white rounded-xl shadow-sm p-4 flex items-start justify-between gap-4"
                  data-testid={`catalog-book-${book.id}`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-xs text-gray-500">
                      {book.isbn ? t('adminCatalog.isbn', { isbn: book.isbn }) : t('adminCatalog.noIsbn')}
                      {book.publisher ? ` · ${book.publisher}` : ''}
                      {book.publishedYear ? ` · ${book.publishedYear}` : ''}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t('adminCatalog.registeredBy', { date: new Date(book.createdAt).toLocaleDateString() })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => run(book.id, () => adminCatalogService.confirmBook(book.id))}
                      disabled={busyId === book.id}
                      data-testid={`catalog-confirm-${book.id}`}
                    >
                      {t('adminCatalog.confirm')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => run(book.id, () => adminCatalogService.setHidden(book.id, true))}
                      disabled={busyId === book.id}
                      data-testid={`catalog-hide-${book.id}`}
                    >
                      {t('adminCatalog.hide')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'revisions' &&
          (loaded && revisions.length === 0 && !error ? (
            <p className="text-gray-500" data-testid="catalog-revisions-empty">
              {t('adminCatalog.revisionsEmpty')}
            </p>
          ) : (
            <ul className="space-y-3" data-testid="catalog-revisions-list">
              {revisions.map((revision) => (
                <li
                  key={revision.id}
                  className="bg-white rounded-xl shadow-sm p-4 space-y-3"
                  data-testid={`catalog-revision-${revision.id}`}
                >
                  <div>
                    <p className="font-semibold text-gray-900">{revision.book?.title ?? revision.catalogBookId}</p>
                    <p className="text-xs text-gray-400">
                      {t('adminCatalog.proposedOn', { date: new Date(revision.createdAt).toLocaleDateString() })}
                    </p>
                  </div>

                  <dl className="space-y-1 text-sm" data-testid={`catalog-revision-changes-${revision.id}`}>
                    {Object.entries(revision.changes).map(([field, change]) => (
                      <div key={field} className="flex flex-wrap gap-x-2">
                        <dt className="font-medium text-gray-700">
                          {isFieldKey(field) ? t(`adminCatalog.fields.${field}`) : field}:
                        </dt>
                        <dd className="text-gray-600">
                          {t('adminCatalog.fieldFrom')} <span className="line-through">{display(change.from)}</span>{' '}
                          {t('adminCatalog.fieldTo')} <strong>{display(change.to)}</strong>
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      value={notes[revision.id] ?? ''}
                      onChange={(e) => setNotes((current) => ({ ...current, [revision.id]: e.target.value }))}
                      placeholder={t('adminCatalog.noteLabel')}
                      aria-label={t('adminCatalog.noteLabel')}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      data-testid={`catalog-note-${revision.id}`}
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        run(revision.id, () =>
                          adminCatalogService.decideRevision(revision.id, 'approve', notes[revision.id]),
                        )
                      }
                      disabled={busyId === revision.id}
                      data-testid={`catalog-approve-${revision.id}`}
                    >
                      {t('adminCatalog.approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        run(revision.id, () =>
                          adminCatalogService.decideRevision(revision.id, 'reject', notes[revision.id]),
                        )
                      }
                      disabled={busyId === revision.id}
                      data-testid={`catalog-reject-${revision.id}`}
                    >
                      {t('adminCatalog.reject')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ))}
      </main>
    </div>
  )
}
