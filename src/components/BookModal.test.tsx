import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookModal } from './BookModal'
import { booksService } from '../services/books.service'
import { googleBooksService } from '../services/googleBooks.service'
import type { Book } from '../types/book'

vi.mock('../services/books.service', () => ({
  booksService: { createBook: vi.fn(), updateBook: vi.fn() },
}))

vi.mock('../services/googleBooks.service', () => ({
  googleBooksService: { search: vi.fn() },
}))

const service = vi.mocked(booksService)

const existing: Book = {
  id: 'b1',
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  isbn: '978-0',
  rating: 5,
  notes: 'Ler de novo',
  status: 'read',
  userId: 'u1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  service.createBook.mockResolvedValue({ message: 'ok', book: existing })
  service.updateBook.mockResolvedValue({ message: 'ok', book: existing })
})

function setup(bookToEdit: Book | null = null) {
  const onClose = vi.fn()
  const onSuccess = vi.fn()
  render(<BookModal isOpen onClose={onClose} onSuccess={onSuccess} bookToEdit={bookToEdit} />)
  return { onClose, onSuccess }
}

describe('BookModal', () => {
  it('renders nothing while closed', () => {
    render(<BookModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.queryByTestId('book-modal')).not.toBeInTheDocument()
  })

  it('creates a book with rating and notes, omitting empty fields', async () => {
    const { onSuccess, onClose } = setup()

    await userEvent.type(screen.getByLabelText(/Título/), 'A Hora da Estrela')
    await userEvent.type(screen.getByLabelText(/Autor/), 'Clarice Lispector')
    await userEvent.selectOptions(screen.getByTestId('book-rating-input'), '4')
    await userEvent.type(screen.getByTestId('book-notes-input'), 'Curto e intenso')
    await userEvent.click(screen.getByTestId('save-book-button'))

    await waitFor(() => expect(service.createBook).toHaveBeenCalled())
    expect(service.createBook).toHaveBeenCalledWith({
      title: 'A Hora da Estrela',
      author: 'Clarice Lispector',
      rating: 4,
      notes: 'Curto e intenso',
    })
    expect(onSuccess).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('pre-fills the form when editing', () => {
    setup(existing)
    expect(screen.getByLabelText(/Título/)).toHaveValue('Dom Casmurro')
    expect(screen.getByTestId('book-rating-input')).toHaveValue('5')
    expect(screen.getByTestId('book-notes-input')).toHaveValue('Ler de novo')
  })

  it('sends null for fields the user cleared while editing', async () => {
    setup(existing)

    await userEvent.selectOptions(screen.getByTestId('book-rating-input'), '')
    await userEvent.clear(screen.getByTestId('book-notes-input'))
    await userEvent.clear(screen.getByLabelText(/ISBN/))
    await userEvent.click(screen.getByTestId('save-book-button'))

    await waitFor(() => expect(service.updateBook).toHaveBeenCalled())
    expect(service.updateBook).toHaveBeenCalledWith(
      'b1',
      expect.objectContaining({ rating: null, notes: null, isbn: null, title: 'Dom Casmurro' }),
    )
  })

  it('fills the form from a Google Books result and saves it with the cover', async () => {
    vi.mocked(googleBooksService.search).mockResolvedValue([
      {
        id: 'g1',
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        isbn: '9788535914849',
        publishedYear: 2016,
        pages: 256,
        language: 'pt',
        coverUrl: 'https://books.google.com/cover.jpg',
      },
    ])
    setup()

    await userEvent.type(screen.getByTestId('google-books-query'), 'dom casmurro')
    await userEvent.click(screen.getByTestId('google-books-search-button'))
    await userEvent.click(await screen.findByTestId('google-books-result-0'))

    expect(screen.getByLabelText(/Título/)).toHaveValue('Dom Casmurro')
    expect(screen.getByLabelText(/Autor/)).toHaveValue('Machado de Assis')
    expect(screen.getByTestId('book-cover-input')).toHaveValue('https://books.google.com/cover.jpg')

    await userEvent.click(screen.getByTestId('save-book-button'))

    await waitFor(() => expect(service.createBook).toHaveBeenCalled())
    expect(service.createBook).toHaveBeenCalledWith({
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      isbn: '9788535914849',
      publishedYear: 2016,
      pages: 256,
      language: 'pt',
      coverUrl: 'https://books.google.com/cover.jpg',
    })
  })

  it('reports that the edit awaits approval when the API answers with a pending revision', async () => {
    service.updateBook.mockResolvedValue({
      message: 'ok',
      book: { ...existing, pendingRevision: { id: 'r1', changes: {} } },
    })
    const { onSuccess } = setup(existing)

    await userEvent.clear(screen.getByLabelText(/Título/))
    await userEvent.type(screen.getByLabelText(/Título/), 'Outro título')
    await userEvent.click(screen.getByTestId('save-book-button'))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ pending: true }))
  })

  it('reports a plain save as not pending', async () => {
    const { onSuccess } = setup(existing)

    await userEvent.click(screen.getByTestId('save-book-button'))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ pending: false }))
  })

  it('sends the edition when creating and clears it when emptied on edit', async () => {
    const { onSuccess } = setup()
    await userEvent.type(screen.getByLabelText(/Título/), 'T')
    await userEvent.type(screen.getByLabelText(/Autor/), 'A')
    await userEvent.type(screen.getByTestId('book-edition-input'), '2ª edição')
    await userEvent.click(screen.getByTestId('save-book-button'))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(service.createBook).toHaveBeenCalledWith(expect.objectContaining({ edition: '2ª edição' }))
  })

  it('does not offer the import when editing', () => {
    setup(existing)
    expect(screen.queryByTestId('google-books-search')).not.toBeInTheDocument()
  })

  it('clears the cover on edit when the URL is emptied', async () => {
    setup({ ...existing, coverUrl: 'https://example.com/c.jpg' })

    await userEvent.clear(screen.getByTestId('book-cover-input'))
    await userEvent.click(screen.getByTestId('save-book-button'))

    await waitFor(() => expect(service.updateBook).toHaveBeenCalled())
    expect(service.updateBook).toHaveBeenCalledWith('b1', expect.objectContaining({ coverUrl: null }))
  })

  it('shows the localised API error and stays open', async () => {
    service.createBook.mockRejectedValue({
      response: { data: { code: 'ISBN_ALREADY_REGISTERED', error: 'dup' } },
    })
    const { onClose } = setup()

    await userEvent.type(screen.getByLabelText(/Título/), 'X')
    await userEvent.type(screen.getByLabelText(/Autor/), 'Y')
    await userEvent.click(screen.getByTestId('save-book-button'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe um livro com este ISBN.')
    expect(onClose).not.toHaveBeenCalled()
  })
})
