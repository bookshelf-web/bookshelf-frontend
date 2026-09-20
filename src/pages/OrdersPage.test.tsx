import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OrdersPage } from './OrdersPage'
import { TestEnvironmentBanner } from '../components/TestEnvironmentBanner'
import { marketplaceService } from '../services/marketplace.service'
import { makeOrder, pageInfo } from '../test/marketplaceFixtures'

vi.mock('../services/marketplace.service', () => ({ marketplaceService: { purchases: vi.fn(), sales: vi.fn() } }))
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', name: 'Ana', roles: ['seller'] }, roles: ['seller'], hasRole: () => true, logout: vi.fn() }),
}))

const service = vi.mocked(marketplaceService)

const renderPage = (mode: 'purchases' | 'sales') =>
  render(
    <MemoryRouter>
      <OrdersPage mode={mode} />
    </MemoryRouter>,
  )

beforeEach(() => vi.clearAllMocks())

describe('OrdersPage', () => {
  it('lists my purchases with the seller and status', async () => {
    service.purchases.mockResolvedValue({ orders: [makeOrder()], pagination: pageInfo })
    renderPage('purchases')

    const row = await screen.findByTestId('order-row-order-1234-5678')
    expect(row).toHaveTextContent('Clean Code')
    expect(row).toHaveTextContent('Sebo da Ana')
    expect(row).toHaveTextContent('Aguardando pagamento')
    expect(service.sales).not.toHaveBeenCalled()
  })

  it('lists my sales with the buyer', async () => {
    service.sales.mockResolvedValue({ orders: [makeOrder({ status: 'paid' })], pagination: pageInfo })
    renderPage('sales')

    expect(await screen.findByTestId('order-row-order-1234-5678')).toHaveTextContent('Bia')
    expect(screen.getByTestId('sales-page')).toBeInTheDocument()
  })

  it.each([
    ['purchases', 'Você ainda não fez pedidos'],
    ['sales', 'Nenhuma venda ainda'],
  ] as const)('shows an empty state for %s', async (mode, text) => {
    service[mode].mockResolvedValue({ orders: [], pagination: { ...pageInfo, total: 0 } })
    renderPage(mode)

    expect(await screen.findByTestId('orders-empty')).toHaveTextContent(text)
  })

  it('shows a localised error when loading fails', async () => {
    service.purchases.mockRejectedValue({ response: { data: { code: 'ROLE_REQUIRED', error: 'x' } } })
    renderPage('purchases')

    expect(await screen.findByTestId('orders-error')).toHaveTextContent('Você não tem permissão')
  })
})

describe('TestEnvironmentBanner', () => {
  it('says that no real payment is made', () => {
    render(<TestEnvironmentBanner />)

    expect(screen.getByRole('note')).toHaveTextContent('nenhum pagamento real')
  })
})
