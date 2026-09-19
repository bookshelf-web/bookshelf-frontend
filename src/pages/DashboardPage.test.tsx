import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render as rtlRender, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { DashboardPage } from './DashboardPage'
import { booksService } from '../services/books.service'
import type { Book, BookStatus } from '../types/book'

vi.mock('../services/books.service', () => ({
  booksService: {
    getBooks: vi.fn(),
    getStats: vi.fn(),
    updateBookStatus: vi.fn(),
    deleteBook: vi.fn(),
    createBook: vi.fn(),
    updateBook: vi.fn(),
  },
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Ana', email: 'ana@example.com', roles: ['reader'] },
    roles: ['reader'],
    hasRole: (role: string) => role === 'reader',
    logout: vi.fn(),
  }),
}))

// The header links to other pages, so the dashboard needs a router around it.
const render = (ui: React.ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>)

const service = vi.mocked(booksService)

function makeBook(id: string, overrides: Partial<Book> = {}): Book {
  return {
    id,
    title: `Book ${id}`,
    author: 'Author',
    status: 'to_read',
    userId: 'u1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function statsFor(toRead: number, reading = 0, read = 0) {
  return {
    stats: {
      total: toRead + reading + read,
      byStatus: { toRead, reading, read },
      averageRating: 0,
      totalPages: 0,
      booksWithRating: 0,
    },
  }
}

function listResponse(books: Book[], page = 1, totalPages = 1, total = books.length) {
  return { books, pagination: { page, limit: 9, total, totalPages } }
}

function lastGetBooksParams() {
  return service.getBooks.mock.calls.at(-1)?.[0]
}

beforeEach(() => {
  vi.clearAllMocks()
  service.getStats.mockResolvedValue(statsFor(2))
  service.getBooks.mockResolvedValue(listResponse([makeBook('1'), makeBook('2')]))
})

describe('DashboardPage', () => {
  it('shows the empty state and hides the filters for an empty library', async () => {
    service.getStats.mockResolvedValue(statsFor(0))
    service.getBooks.mockResolvedValue(listResponse([]))
    render(<DashboardPage />)

    expect(await screen.findByText('Nenhum livro ainda')).toBeInTheDocument()
    expect(screen.queryByTestId('book-filters')).not.toBeInTheDocument()
  })

  it('lists books and requests the first page with the default sort', async () => {
    render(<DashboardPage />)

    expect(await screen.findByTestId('book-item-1')).toBeInTheDocument()
    expect(lastGetBooksParams()).toMatchObject({
      page: 1,
      limit: 9,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    })
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  it('debounces the search and resets to the first page', async () => {
    render(<DashboardPage />)
    await screen.findByTestId('book-item-1')

    await userEvent.type(screen.getByTestId('book-search-input'), 'dom')

    await waitFor(() => expect(lastGetBooksParams()).toMatchObject({ search: 'dom', page: 1 }))
    // Typing three characters must not have produced one request per keystroke.
    const searchCalls = service.getBooks.mock.calls.filter(([params]) => params?.search)
    expect(searchCalls).toHaveLength(1)
  })

  it('applies status, rating and sort filters and can clear them', async () => {
    render(<DashboardPage />)
    await screen.findByTestId('book-item-1')

    await userEvent.selectOptions(screen.getByTestId('book-filter-status'), 'reading')
    await userEvent.selectOptions(screen.getByTestId('book-filter-rating'), '4')
    await userEvent.selectOptions(screen.getByTestId('book-sort'), 'title')

    await waitFor(() =>
      expect(lastGetBooksParams()).toMatchObject({
        status: 'reading',
        rating: 4,
        sortBy: 'title',
        sortOrder: 'ASC',
      }),
    )

    await userEvent.click(screen.getByTestId('book-filters-clear'))
    await waitFor(() => {
      const params = lastGetBooksParams()
      expect(params?.status).toBeUndefined()
      expect(params?.rating).toBeUndefined()
    })
  })

  it('shows a no-results message when a filter matches nothing', async () => {
    render(<DashboardPage />)
    await screen.findByTestId('book-item-1')

    service.getBooks.mockResolvedValue(listResponse([], 1, 0, 0))
    await userEvent.selectOptions(screen.getByTestId('book-filter-status'), 'read')

    expect(await screen.findByTestId('book-no-results')).toBeInTheDocument()
  })

  it('paginates through the API', async () => {
    service.getBooks.mockResolvedValue(listResponse([makeBook('1')], 1, 3, 25))
    render(<DashboardPage />)

    expect(await screen.findByTestId('pagination-info')).toHaveTextContent('Página 1 de 3')
    expect(screen.getByTestId('book-results-count')).toHaveTextContent('25 livros encontrados')

    service.getBooks.mockResolvedValue(listResponse([makeBook('10')], 2, 3, 25))
    await userEvent.click(screen.getByTestId('pagination-next'))

    await waitFor(() => expect(lastGetBooksParams()).toMatchObject({ page: 2 }))
    expect(await screen.findByTestId('book-item-10')).toBeInTheDocument()
  })

  it('does not let the search debounce undo a quick page change', async () => {
    service.getBooks.mockResolvedValue(listResponse([makeBook('1')], 1, 2, 10))
    render(<DashboardPage />)
    await screen.findByTestId('book-item-1')

    service.getBooks.mockResolvedValue(listResponse([makeBook('10')], 2, 2, 10))
    await userEvent.click(screen.getByTestId('pagination-next'))
    await screen.findByTestId('book-item-10')

    // Let the initial debounce timer fire.
    await new Promise((resolve) => setTimeout(resolve, 450))

    expect(lastGetBooksParams()).toMatchObject({ page: 2 })
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('Página 2 de 2')
  })

  it('updates the status and the counters immediately, then confirms with the API', async () => {
    let resolveUpdate: (book: Book) => void = () => {}
    service.updateBookStatus.mockImplementation(
      () => new Promise((resolve) => (resolveUpdate = (book) => resolve({ message: 'ok', book }))),
    )
    render(<DashboardPage />)
    const select = await screen.findByTestId('book-status-1')

    await userEvent.selectOptions(select, 'reading')

    // Optimistic: visible before the request resolves.
    expect(screen.getByTestId('book-status-1')).toHaveValue('reading')
    expect(screen.getByTestId('stats-reading')).toHaveTextContent('1')
    expect(screen.getByTestId('stats-to-read')).toHaveTextContent('1')
    expect(service.updateBookStatus).toHaveBeenCalledWith('1', 'reading')

    resolveUpdate(makeBook('1', { status: 'reading' as BookStatus }))
    await waitFor(() => expect(screen.getByTestId('book-status-1')).toHaveValue('reading'))
  })

  it('reloads and reports an error when the status update fails', async () => {
    service.updateBookStatus.mockRejectedValue(new Error('boom'))
    render(<DashboardPage />)
    await userEvent.selectOptions(await screen.findByTestId('book-status-1'), 'read')

    expect(await screen.findByTestId('dashboard-error')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('book-status-1')).toHaveValue('to_read'))
  })

  it('steps back a page after deleting the only book on the last page', async () => {
    service.getBooks.mockResolvedValue(listResponse([makeBook('1')], 1, 2, 10))
    service.deleteBook.mockResolvedValue({ message: 'deleted' })
    render(<DashboardPage />)
    await screen.findByTestId('book-item-1')

    service.getBooks.mockResolvedValue(listResponse([makeBook('10')], 2, 2, 10))
    await userEvent.click(screen.getByTestId('pagination-next'))
    await screen.findByTestId('book-item-10')
    expect(lastGetBooksParams()).toMatchObject({ page: 2 })

    service.getBooks.mockResolvedValue(listResponse([makeBook('1')], 1, 1, 1))
    await userEvent.click(screen.getByTestId('delete-book-10'))
    await userEvent.click(await screen.findByTestId('confirm-delete-button'))

    await waitFor(() => expect(service.deleteBook).toHaveBeenCalledWith('10'))
    await waitFor(() => expect(lastGetBooksParams()).toMatchObject({ page: 1 }))
  })
})
