import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookModal } from './BookModal'
import { booksService } from '../services/books.service'
import type { Book } from '../types/book'

vi.mock('../services/books.service', () => ({
  booksService: { createBook: vi.fn(), updateBook: vi.fn() },
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
