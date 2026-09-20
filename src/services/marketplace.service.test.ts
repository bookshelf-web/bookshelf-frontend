import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import api from './api'
import { catalogService } from './catalog.service'
import { marketplaceService } from './marketplace.service'

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const http = api as unknown as Record<'get' | 'post' | 'patch' | 'delete', Mock>

beforeEach(() => vi.clearAllMocks())

describe('marketplaceService', () => {
  it('browses listings with the given filters', async () => {
    http.get.mockResolvedValue({ data: { listings: [], pagination: {} } })

    await marketplaceService.browse({ search: 'clean', sort: 'price_asc' })

    expect(http.get).toHaveBeenCalledWith('/marketplace/listings', { params: { search: 'clean', sort: 'price_asc' } })
  })

  it('lists my listings', async () => {
    http.get.mockResolvedValue({ data: { listings: [] } })
    await marketplaceService.myListings()
    expect(http.get).toHaveBeenCalledWith('/marketplace/listings/mine', { params: { page: 1, limit: 50 } })
  })

  it('creates, updates and removes a listing', async () => {
    http.post.mockResolvedValue({ data: { listing: { id: 'l1' } } })
    http.patch.mockResolvedValue({ data: { listing: { id: 'l1', status: 'paused' } } })
    http.delete.mockResolvedValue({})

    expect(await marketplaceService.createListing({ catalogBookId: 'b', priceCents: 100, condition: 'good', quantity: 1, shippingFeeCents: 0, pickupAvailable: false })).toEqual({ id: 'l1' })
    expect((await marketplaceService.updateListing('l1', { status: 'paused' })).status).toBe('paused')
    await marketplaceService.removeListing('l1')

    expect(http.post).toHaveBeenCalledWith('/marketplace/listings', expect.objectContaining({ catalogBookId: 'b' }))
    expect(http.patch).toHaveBeenCalledWith('/marketplace/listings/l1', { status: 'paused' })
    expect(http.delete).toHaveBeenCalledWith('/marketplace/listings/l1')
  })

  it('places an order and reads purchases, sales and one order', async () => {
    http.post.mockResolvedValue({ data: { order: { id: 'o1' } } })
    http.get.mockResolvedValue({ data: { orders: [], order: { id: 'o1' } } })

    await marketplaceService.createOrder({ items: [{ listingId: 'l1', quantity: 1 }], shippingMethod: 'pickup' })
    await marketplaceService.purchases('paid', 2)
    await marketplaceService.sales()
    const order = await marketplaceService.getOrder('o1')

    expect(http.post).toHaveBeenCalledWith('/marketplace/orders', expect.objectContaining({ shippingMethod: 'pickup' }))
    expect(http.get).toHaveBeenCalledWith('/marketplace/orders', { params: { page: 2, limit: 20, status: 'paid' } })
    expect(http.get).toHaveBeenCalledWith('/marketplace/sales', { params: { page: 1, limit: 20 } })
    expect(order).toEqual({ id: 'o1' })
  })

  it('pays with Pix or a card, simulates the Pix, cancels, ships and delivers', async () => {
    http.post.mockResolvedValue({ data: { order: { id: 'o1' } } })

    await marketplaceService.pay('o1', 'pix')
    await marketplaceService.pay('o1', 'card', '4242424242424242')
    await marketplaceService.simulatePixPayment('o1')
    await marketplaceService.cancel('o1')
    await marketplaceService.ship('o1', 'BR123')
    await marketplaceService.deliver('o1')

    expect(http.post).toHaveBeenCalledWith('/marketplace/orders/o1/pay', { method: 'pix' })
    expect(http.post).toHaveBeenCalledWith('/marketplace/orders/o1/pay', { method: 'card', cardNumber: '4242424242424242' })
    expect(http.post).toHaveBeenCalledWith('/marketplace/orders/o1/simulate-pix-payment')
    expect(http.post).toHaveBeenCalledWith('/marketplace/orders/o1/cancel')
    expect(http.post).toHaveBeenCalledWith('/marketplace/orders/o1/ship', { trackingCode: 'BR123' })
    expect(http.post).toHaveBeenCalledWith('/marketplace/orders/o1/deliver')
  })
})

describe('catalogService', () => {
  it('searches the shared catalog', async () => {
    http.get.mockResolvedValue({ data: { books: [], pagination: {} } })

    await catalogService.search('clean code')

    expect(http.get).toHaveBeenCalledWith('/catalog/books', { params: { search: 'clean code', limit: 8 } })
  })
})
