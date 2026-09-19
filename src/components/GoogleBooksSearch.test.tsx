import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoogleBooksSearch } from './GoogleBooksSearch'
import { googleBooksService, type BookSuggestion } from '../services/googleBooks.service'

vi.mock('../services/googleBooks.service', () => ({
  googleBooksService: { search: vi.fn() },
}))

const search = vi.mocked(googleBooksService.search)

const suggestion: BookSuggestion = {
  id: 'v1',
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  publishedYear: 1899,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GoogleBooksSearch', () => {
  it('searches and lists the results', async () => {
    search.mockResolvedValue([suggestion])
    render(<GoogleBooksSearch onSelect={vi.fn()} />)

    await userEvent.type(screen.getByTestId('google-books-query'), 'dom casmurro')
    await userEvent.click(screen.getByTestId('google-books-search-button'))

    expect(search).toHaveBeenCalledWith('dom casmurro')
    expect(await screen.findByTestId('google-books-result-0')).toHaveTextContent('Dom Casmurro')
    expect(screen.getByTestId('google-books-result-0')).toHaveTextContent('Machado de Assis · 1899')
  })

  it('searches on Enter without submitting a surrounding form', async () => {
    search.mockResolvedValue([suggestion])
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <GoogleBooksSearch onSelect={vi.fn()} />
      </form>,
    )

    await userEvent.type(screen.getByTestId('google-books-query'), 'dom{Enter}')

    expect(await screen.findByTestId('google-books-result-0')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('reports the chosen suggestion', async () => {
    search.mockResolvedValue([suggestion])
    const onSelect = vi.fn()
    render(<GoogleBooksSearch onSelect={onSelect} />)

    await userEvent.type(screen.getByTestId('google-books-query'), 'dom')
    await userEvent.click(screen.getByTestId('google-books-search-button'))
    await userEvent.click(await screen.findByTestId('google-books-result-0'))

    expect(onSelect).toHaveBeenCalledWith(suggestion)
  })

  it('shows an empty state and an error state', async () => {
    search.mockResolvedValueOnce([])
    render(<GoogleBooksSearch onSelect={vi.fn()} />)
    await userEvent.type(screen.getByTestId('google-books-query'), 'nada')
    await userEvent.click(screen.getByTestId('google-books-search-button'))
    expect(await screen.findByTestId('google-books-empty')).toBeInTheDocument()

    search.mockRejectedValueOnce(new Error('offline'))
    await userEvent.click(screen.getByTestId('google-books-search-button'))
    expect(await screen.findByTestId('google-books-error')).toBeInTheDocument()
    expect(screen.queryByTestId('google-books-empty')).not.toBeInTheDocument()
  })

  it('does not search for a blank query', () => {
    render(<GoogleBooksSearch onSelect={vi.fn()} />)
    expect(screen.getByTestId('google-books-search-button')).toBeDisabled()
  })
})
