import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StorePage } from './StorePage'
import { CartProvider, useCart } from '../contexts/CartContext'
import { marketplaceService } from '../services/marketplace.service'
import { makeListing, pageInfo } from '../test/marketplaceFixtures'

vi.mock('../services/marketplace.service', () => ({ marketplaceService: { browse: vi.fn() } }))
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'buyer-1', name: 'Bia', roles: ['buyer'] }, roles: ['buyer'], hasRole: () => true, logout: vi.fn() }),
}))

const service = vi.mocked(marketplaceService)

function CartProbe() {
  const { count } = useCart()
  return <span data-testid="probe">{count}</span>
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <StorePage />
        <CartProbe />
      </CartProvider>
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  service.browse.mockResolvedValue({ listings: [makeListing('l1')], pagination: pageInfo })
})

describe('StorePage', () => {
  it('lists what is for sale with price, condition and seller', async () => {
    renderPage()

    const card = await screen.findByTestId('listing-card-l1')
    expect(card).toHaveTextContent('Book l1')
    expect(card).toHaveTextContent('Bom')
    expect(card).toHaveTextContent('Vendido por Sebo da Ana')
    expect(card).toHaveTextContent('Empresa')
    expect(card).toHaveTextContent('Retirada disponível')
    expect(screen.getByTestId('listing-price-l1').textContent?.replace(/\s/g, ' ')).toBe('R$ 25,00')
  })

  it('adds to the cart, and stops at the stock', async () => {
    service.browse.mockResolvedValue({ listings: [makeListing('l1', { quantity: 1 })], pagination: pageInfo })
    renderPage()

    await userEvent.click(await screen.findByTestId('add-to-cart-l1'))

    expect(screen.getByTestId('probe')).toHaveTextContent('1')
    expect(screen.getByTestId('add-to-cart-l1')).toBeDisabled()
  })

  it('searches after a pause and resets to the first page', async () => {
    renderPage()
    await screen.findByTestId('listing-card-l1')

    await userEvent.type(screen.getByTestId('store-search'), 'clean')

    await waitFor(() => expect(service.browse).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'clean', page: 1 })))
  })

  it('filters by condition and sorts', async () => {
    renderPage()
    await screen.findByTestId('listing-card-l1')

    await userEvent.selectOptions(screen.getByTestId('store-condition'), 'new')
    await waitFor(() => expect(service.browse).toHaveBeenLastCalledWith(expect.objectContaining({ condition: 'new' })))

    await userEvent.selectOptions(screen.getByTestId('store-sort'), 'price_asc')
    await waitFor(() => expect(service.browse).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'price_asc' })))
  })

  it('shows an empty state', async () => {
    service.browse.mockResolvedValue({ listings: [], pagination: { ...pageInfo, total: 0 } })
    renderPage()

    expect(await screen.findByTestId('store-empty')).toBeInTheDocument()
  })

  it('shows a localised error when loading fails', async () => {
    service.browse.mockRejectedValue({ response: { data: { code: 'ROLE_REQUIRED', error: 'x' } } })
    renderPage()

    expect(await screen.findByTestId('store-error')).toHaveTextContent('Você não tem permissão')
  })
})
