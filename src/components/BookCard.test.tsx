import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookCard } from './BookCard'
import type { Book } from '../types/book'

const book: Book = {
  id: 'b1',
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  status: 'to_read',
  rating: 4,
  notes: 'Ler de novo',
  userId: 'u1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

function setup(overrides: Partial<Book> = {}) {
  const handlers = { onEdit: vi.fn(), onDelete: vi.fn(), onStatusChange: vi.fn() }
  render(<BookCard book={{ ...book, ...overrides }} {...handlers} />)
  return handlers
}

describe('BookCard', () => {
  it('starts with the title (E2E suites read the first line of the card)', () => {
    setup()
    expect(screen.getByTestId('book-item-b1').textContent?.startsWith('Dom Casmurro')).toBe(true)
  })

  it('shows the rating and notes when present', () => {
    setup()
    expect(screen.getByTestId('book-rating-b1')).toHaveAttribute('data-rating', '4')
    expect(screen.getByTestId('book-notes-b1')).toHaveTextContent('Ler de novo')
  })

  it('omits rating and notes when absent', () => {
    setup({ rating: undefined, notes: undefined })
    expect(screen.queryByTestId('book-rating-b1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('book-notes-b1')).not.toBeInTheDocument()
  })

  it('reflects the status and reports changes', async () => {
    const { onStatusChange } = setup()
    const select = screen.getByTestId('book-status-b1')
    expect(select).toHaveValue('to_read')
    await userEvent.selectOptions(select, 'reading')
    expect(onStatusChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'b1' }), 'reading')
  })

  it('triggers edit and delete', async () => {
    const { onEdit, onDelete } = setup()
    await userEvent.click(screen.getByTestId('edit-book-b1'))
    await userEvent.click(screen.getByTestId('delete-book-b1'))
    expect(onEdit).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalled()
  })
})
