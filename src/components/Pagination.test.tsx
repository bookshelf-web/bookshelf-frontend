import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('disables previous on the first page and next on the last', () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByTestId('pagination-prev')).toBeDisabled()
    expect(screen.getByTestId('pagination-next')).toBeEnabled()
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('Página 1 de 3')

    rerender(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByTestId('pagination-next')).toBeDisabled()
  })

  it('requests the adjacent page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByTestId('pagination-next'))
    await userEvent.click(screen.getByTestId('pagination-prev'))
    expect(onPageChange).toHaveBeenNthCalledWith(1, 3)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1)
  })
})
