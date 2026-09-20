import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminCatalogPage } from './AdminCatalogPage'
import { adminCatalogService } from '../services/adminCatalog.service'
import type { CatalogBook, CatalogRevision } from '../types/catalog'

vi.mock('../services/adminCatalog.service', () => ({
  adminCatalogService: {
    listPendingBooks: vi.fn(),
    confirmBook: vi.fn(),
    setHidden: vi.fn(),
    listPendingRevisions: vi.fn(),
    decideRevision: vi.fn(),
  },
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', name: 'Root', roles: ['admin'] },
    roles: ['admin'],
    hasRole: () => true,
    logout: vi.fn(),
  }),
}))

const service = vi.mocked(adminCatalogService)

const book = (id: string, overrides: Partial<CatalogBook> = {}): CatalogBook => ({
  id,
  isbn: '9780132350884',
  title: `Book ${id}`,
  author: 'Author',
  publisher: 'Prentice Hall',
  publishedYear: 2008,
  status: 'active',
  reviewStatus: 'pending_review',
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

const revision = (id: string, overrides: Partial<CatalogRevision> = {}): CatalogRevision => ({
  id,
  catalogBookId: 'c1',
  proposedBy: 'u2',
  changes: { title: { from: 'Old Title', to: 'New Title' }, publisher: { from: null, to: 'Acme' } },
  status: 'pending',
  createdAt: '2026-01-02T00:00:00Z',
  book: book('c1', { title: 'Old Title' }),
  ...overrides,
})

const pageInfo = { page: 1, limit: 50, total: 1, totalPages: 1 }

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminCatalogPage />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  service.listPendingBooks.mockResolvedValue({ books: [book('b1')], pagination: pageInfo })
  service.listPendingRevisions.mockResolvedValue({ revisions: [revision('r1')], pagination: pageInfo })
})

describe('AdminCatalogPage new registrations', () => {
  it('lists books waiting for review with their identity', async () => {
    renderPage()

    const item = await screen.findByTestId('catalog-book-b1')
    expect(item).toHaveTextContent('Book b1')
    expect(item).toHaveTextContent('ISBN: 9780132350884')
    expect(item).toHaveTextContent('Prentice Hall')
    expect(screen.getByTestId('catalog-tab-books')).toHaveTextContent('(1)')
    expect(screen.getByTestId('catalog-tab-revisions')).toHaveTextContent('(1)')
  })

  it('says so when a book has no ISBN', async () => {
    service.listPendingBooks.mockResolvedValue({ books: [book('b2', { isbn: null })], pagination: pageInfo })
    renderPage()

    expect(await screen.findByTestId('catalog-book-b2')).toHaveTextContent('Sem ISBN')
  })

  it('confirms a book and reloads the queue', async () => {
    service.confirmBook.mockResolvedValue(book('b1', { reviewStatus: 'reviewed' }))
    renderPage()
    await userEvent.click(await screen.findByTestId('catalog-confirm-b1'))

    expect(service.confirmBook).toHaveBeenCalledWith('b1')
    await waitFor(() => expect(service.listPendingBooks).toHaveBeenCalledTimes(2))
  })

  it('hides a book', async () => {
    service.setHidden.mockResolvedValue(book('b1', { status: 'hidden' }))
    renderPage()
    await userEvent.click(await screen.findByTestId('catalog-hide-b1'))

    expect(service.setHidden).toHaveBeenCalledWith('b1', true)
  })

  it('shows an empty state', async () => {
    service.listPendingBooks.mockResolvedValue({ books: [], pagination: pageInfo })
    renderPage()

    expect(await screen.findByTestId('catalog-books-empty')).toBeInTheDocument()
  })
})

describe('AdminCatalogPage proposed edits', () => {
  const openRevisions = async () => {
    renderPage()
    await screen.findByTestId('catalog-book-b1')
    await userEvent.click(screen.getByTestId('catalog-tab-revisions'))
  }

  it('shows each change from the old to the new value, with readable field names', async () => {
    await openRevisions()

    const changes = await screen.findByTestId('catalog-revision-changes-r1')
    expect(changes).toHaveTextContent('Título')
    expect(changes).toHaveTextContent('Old Title')
    expect(changes).toHaveTextContent('New Title')
    expect(changes).toHaveTextContent('(vazio)')
    expect(changes).toHaveTextContent('Acme')
  })

  it('approves with the note the admin typed', async () => {
    service.decideRevision.mockResolvedValue(revision('r1', { status: 'approved' }))
    await openRevisions()

    await userEvent.type(await screen.findByTestId('catalog-note-r1'), 'confere')
    await userEvent.click(screen.getByTestId('catalog-approve-r1'))

    expect(service.decideRevision).toHaveBeenCalledWith('r1', 'approve', 'confere')
    await waitFor(() => expect(service.listPendingRevisions).toHaveBeenCalledTimes(2))
  })

  it('rejects without a note', async () => {
    service.decideRevision.mockResolvedValue(revision('r1', { status: 'rejected' }))
    await openRevisions()

    await userEvent.click(await screen.findByTestId('catalog-reject-r1'))

    expect(service.decideRevision).toHaveBeenCalledWith('r1', 'reject', undefined)
  })

  it('shows the localised error when a decision fails', async () => {
    service.decideRevision.mockRejectedValue({ response: { data: { code: 'CATALOG_DUPLICATE', error: 'x' } } })
    await openRevisions()

    await userEvent.click(await screen.findByTestId('catalog-approve-r1'))

    expect(await screen.findByTestId('catalog-error')).toHaveTextContent('Já existe outro livro no catálogo')
    expect(screen.getByTestId('catalog-revision-r1')).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    service.listPendingRevisions.mockResolvedValue({ revisions: [], pagination: pageInfo })
    await openRevisions()

    expect(await screen.findByTestId('catalog-revisions-empty')).toBeInTheDocument()
  })
})

describe('AdminCatalogPage errors', () => {
  it('shows a localised error when loading fails', async () => {
    service.listPendingBooks.mockRejectedValue({ response: { data: { code: 'ROLE_REQUIRED', error: 'x' } } })
    renderPage()

    expect(await screen.findByTestId('catalog-error')).toHaveTextContent('Você não tem permissão')
  })
})
