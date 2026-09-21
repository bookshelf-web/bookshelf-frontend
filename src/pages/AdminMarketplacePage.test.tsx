import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminMarketplacePage } from './AdminMarketplacePage'
import { adminMarketplaceService } from '../services/adminMarketplace.service'
import { makeListing, makeOrder, pageInfo } from '../test/marketplaceFixtures'

vi.mock('../services/adminMarketplace.service', () => ({
  adminMarketplaceService: { orders: vi.fn(), listings: vi.fn(), removeListing: vi.fn() },
}))
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'admin-1', name: 'Root', roles: ['admin'] }, roles: ['admin'], hasRole: () => true, logout: vi.fn() }),
}))

const service = vi.mocked(adminMarketplaceService)

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminMarketplacePage />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  service.orders.mockResolvedValue({ orders: [makeOrder()], pagination: pageInfo })
  service.listings.mockResolvedValue({ listings: [makeListing('l1'), makeListing('l2', { status: 'removed' })], pagination: pageInfo })
})

describe('AdminMarketplacePage orders', () => {
  it('lists orders with buyer, seller and status', async () => {
    renderPage()

    const row = await screen.findByTestId('market-order-order-1234-5678')
    expect(row).toHaveTextContent('Clean Code')
    expect(row).toHaveTextContent('Comprador: Bia')
    expect(row).toHaveTextContent('Aguardando pagamento')
  })

  it('filters by status and searches by order code', async () => {
    renderPage()
    await screen.findByTestId('market-order-order-1234-5678')

    await userEvent.selectOptions(screen.getByTestId('market-status'), 'paid')
    await waitFor(() => expect(service.orders).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'paid' })))

    await userEvent.type(screen.getByTestId('market-search'), 'abc')
    await waitFor(() => expect(service.orders).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'abc', page: 1 })))
  })

  it('shows an empty state and a localised error', async () => {
    service.orders.mockResolvedValue({ orders: [], pagination: { ...pageInfo, total: 0 } })
    renderPage()
    expect(await screen.findByTestId('market-orders-empty')).toBeInTheDocument()
  })

  it('shows a localised error when loading fails', async () => {
    service.orders.mockRejectedValue({ response: { data: { code: 'ROLE_REQUIRED', error: 'x' } } })
    renderPage()

    expect(await screen.findByTestId('market-error')).toHaveTextContent('Você não tem permissão')
  })
})

describe('AdminMarketplacePage listings', () => {
  const openListings = async () => {
    renderPage()
    await screen.findByTestId('market-order-order-1234-5678')
    await userEvent.click(screen.getByTestId('market-tab-listings'))
  }

  it('lists listings of every status, and only offers takedown for those not removed', async () => {
    await openListings()

    expect(await screen.findByTestId('market-listing-l1')).toHaveTextContent('Sebo da Ana')
    expect(screen.getByTestId('market-listing-status-l2')).toHaveTextContent('Removido')
    expect(screen.getByTestId('market-remove-l1')).toBeInTheDocument()
    expect(screen.queryByTestId('market-remove-l2')).not.toBeInTheDocument()
  })

  it('takes a listing down with the reason typed', async () => {
    service.removeListing.mockResolvedValue(makeListing('l1', { status: 'removed' }))
    await openListings()

    await userEvent.type(await screen.findByTestId('market-reason-l1'), 'Abuso')
    await userEvent.click(screen.getByTestId('market-remove-l1'))

    expect(service.removeListing).toHaveBeenCalledWith('l1', 'Abuso')
    await waitFor(() => expect(service.listings).toHaveBeenCalledTimes(2))
  })

  it('takes a listing down without a reason, and shows an error when it fails', async () => {
    service.removeListing.mockRejectedValue({ response: { data: { code: 'LISTING_NOT_FOUND', error: 'x' } } })
    await openListings()

    await userEvent.click(await screen.findByTestId('market-remove-l1'))

    expect(service.removeListing).toHaveBeenCalledWith('l1', undefined)
    expect(await screen.findByTestId('market-error')).toHaveTextContent('Anúncio não encontrado')
  })

  it('shows an empty state', async () => {
    service.listings.mockResolvedValue({ listings: [], pagination: { ...pageInfo, total: 0 } })
    await openListings()

    expect(await screen.findByTestId('market-listings-empty')).toBeInTheDocument()
  })
})
