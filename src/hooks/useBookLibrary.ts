import { useCallback, useEffect, useState } from 'react'
import { booksService } from '../services/books.service'
import { getApiErrorMessage } from '../lib/apiError'
import type { Book, BookStatus, BooksListResponse, Stats } from '../types/book'

export interface BookQuery {
  page: number
  limit: number
  status?: BookStatus
  rating?: number
  search?: string
  sortBy: string
  sortOrder: 'ASC' | 'DESC'
}

type LibraryStats = Stats['stats']
type Pagination = BooksListResponse['pagination']

interface ListState {
  key: string
  books: Book[]
  pagination: Pagination | null
  error: string
}

const STATUS_TO_STATS_KEY = {
  to_read: 'toRead',
  reading: 'reading',
  read: 'read',
} as const

/**
 * Loads the (filtered, paginated) book list plus the overall reading stats.
 * Status changes are applied optimistically so counters and selects update
 * immediately; any failure falls back to a fresh reload.
 */
export function useBookLibrary(query: BookQuery) {
  const [version, setVersion] = useState(0)
  const [list, setList] = useState<ListState | null>(null)
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [statsError, setStatsError] = useState('')
  const [actionError, setActionError] = useState('')

  const listKey = `${version}:${JSON.stringify(query)}`

  useEffect(() => {
    let cancelled = false
    booksService
      .getBooks(query)
      .then((data) => {
        if (!cancelled) {
          setList({ key: listKey, books: data.books, pagination: data.pagination, error: '' })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setList({
            key: listKey,
            books: [],
            pagination: null,
            error: getApiErrorMessage(err, 'dashboard.loadError'),
          })
        }
      })
    return () => {
      cancelled = true
    }
    // `listKey` already encodes `query`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey])

  useEffect(() => {
    let cancelled = false
    booksService
      .getStats()
      .then((data) => {
        if (!cancelled) {
          setStats(data.stats)
          setStatsError('')
        }
      })
      .catch((err) => {
        if (!cancelled) setStatsError(getApiErrorMessage(err, 'dashboard.loadError'))
      })
    return () => {
      cancelled = true
    }
  }, [version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const changeStatus = useCallback(
    async (book: Book, status: BookStatus) => {
      if (book.status === status) return
      setActionError('')
      setList((prev) =>
        prev
          ? { ...prev, books: prev.books.map((b) => (b.id === book.id ? { ...b, status } : b)) }
          : prev,
      )
      const from = STATUS_TO_STATS_KEY[book.status]
      const to = STATUS_TO_STATS_KEY[status]
      setStats((prev) =>
        prev
          ? { ...prev, byStatus: { ...prev.byStatus, [from]: prev.byStatus[from] - 1, [to]: prev.byStatus[to] + 1 } }
          : prev,
      )
      try {
        const { book: updated } = await booksService.updateBookStatus(book.id, status)
        setList((prev) =>
          prev
            ? { ...prev, books: prev.books.map((b) => (b.id === updated.id ? updated : b)) }
            : prev,
        )
        // A status filter may no longer match the book.
        if (query.status) reload()
      } catch (err) {
        setActionError(getApiErrorMessage(err, 'dashboard.statusError'))
        reload()
      }
    },
    [query.status, reload],
  )

  const loading = list === null || list.key !== listKey

  return {
    books: list?.books ?? [],
    pagination: list?.pagination ?? null,
    stats,
    loading,
    initialLoading: (list === null || stats === null) && !list?.error && !statsError,
    error: list?.error || statsError || actionError,
    reload,
    changeStatus,
  }
}
