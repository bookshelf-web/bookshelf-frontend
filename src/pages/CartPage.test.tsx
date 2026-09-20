import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CartPage } from './CartPage'
import { CartProvider } from '../contexts/CartContext'
import { marketplaceService } from '../services/marketplace.service'
import { makeListing, makeOrder } from '../test/marketplaceFixtures'

vi.mock('../services/marketplace.service', () => ({ marketplaceService: { createOrder: vi.fn() } }))
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'buyer-1', name: 'Bia', roles: ['buyer'] }, roles: ['buyer'], hasRole: () => true, logout: vi.fn() }),
}))

const service = vi.mocked(marketplaceService)

const seed = (...listings: ReturnType<typeof makeListing>[]) =>
  localStorage.setItem('cart', JSON.stringify(listings.map((listing) => ({ listing, quantity: 1 }))))

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/cart']}>
      <CartProvider>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders/:id" element={<p data-testid="order-opened">order</p>} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  )

const fillAddress = async (sellerId = 'seller-1') => {
  const values = { recipient: 'Bia', street: 'Rua A', number: '10', district: 'Centro', city: 'Curitiba', state: 'PR', zip: '80000-000' }
  for (const [field, value] of Object.entries(values)) {
    await userEvent.type(screen.getByTestId(`address-${field}-${sellerId}`), value)
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('CartPage', () => {
  it('shows an empty cart', () => {
    renderPage()

    expect(screen.getByTestId('cart-empty')).toBeInTheDocument()
  })

  it('totals the items with a flat shipping fee per listing', () => {
    seed(makeListing('l1'), makeListing('l2', { shippingFeeCents: 800 }))
    renderPage()

    expect(screen.getByTestId('cart-total-seller-1').textContent?.replace(/\s/g, ' ')).toBe('R$ 70,00')
  })

  it('drops the shipping fee when picking up', async () => {
    seed(makeListing('l1'))
    renderPage()

    await userEvent.click(screen.getByTestId('cart-method-pickup-seller-1'))

    expect(screen.getByTestId('cart-total-seller-1').textContent?.replace(/\s/g, ' ')).toBe('R$ 25,00')
    expect(screen.queryByTestId('address-street-seller-1')).not.toBeInTheDocument()
  })

  it('disables pickup when a listing does not offer it', () => {
    seed(makeListing('l1', { pickupAvailable: false }))
    renderPage()

    expect(screen.getByTestId('cart-method-pickup-seller-1')).toBeDisabled()
  })

  it('changes and removes items', async () => {
    seed(makeListing('l1'))
    renderPage()

    fireEvent.change(screen.getByTestId('cart-quantity-l1'), { target: { value: '2' } })
    expect(screen.getByTestId('cart-total-seller-1').textContent?.replace(/\s/g, ' ')).toBe('R$ 62,00')

    await userEvent.click(screen.getByTestId('cart-remove-l1'))
    expect(screen.getByTestId('cart-empty')).toBeInTheDocument()
  })

  it('places one order per seller, and clears only that seller from the cart', async () => {
    seed(makeListing('l1'), makeListing('l2', { seller: { id: 'seller-2', name: 'Outro', company: false } }))
    service.createOrder.mockResolvedValue(makeOrder())
    renderPage()

    await fillAddress('seller-1')
    await userEvent.click(screen.getByTestId('cart-checkout-seller-1'))

    await waitFor(() =>
      expect(service.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [{ listingId: 'l1', quantity: 1 }],
          shippingMethod: 'ship',
          shippingAddress: expect.objectContaining({ city: 'Curitiba', complement: null }),
        }),
      ),
    )
    expect(await screen.findByTestId('order-opened')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('cart') ?? '[]')).toHaveLength(1)
  })

  it('places a pickup order without an address', async () => {
    seed(makeListing('l1'))
    service.createOrder.mockResolvedValue(makeOrder())
    renderPage()

    await userEvent.click(screen.getByTestId('cart-method-pickup-seller-1'))
    await userEvent.click(screen.getByTestId('cart-checkout-seller-1'))

    await waitFor(() => expect(service.createOrder).toHaveBeenCalledWith({ items: [{ listingId: 'l1', quantity: 1 }], shippingMethod: 'pickup' }))
  })

  it('shows the localised error and keeps the cart when the order fails', async () => {
    seed(makeListing('l1'))
    service.createOrder.mockRejectedValue({ response: { data: { code: 'INSUFFICIENT_STOCK', error: 'x' } } })
    renderPage()

    await userEvent.click(screen.getByTestId('cart-method-pickup-seller-1'))
    await userEvent.click(screen.getByTestId('cart-checkout-seller-1'))

    expect(await screen.findByTestId('cart-error-seller-1')).toHaveTextContent('estoque suficiente')
    expect(screen.getByTestId('cart-item-l1')).toBeInTheDocument()
  })
})
