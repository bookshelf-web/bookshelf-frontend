import type { Charge, Listing, Order } from '../types/marketplace'

export const pageInfo = { page: 1, limit: 20, total: 1, totalPages: 1 }

export const makeListing = (id: string, overrides: Partial<Listing> = {}): Listing => ({
  id,
  book: { id: `book-${id}`, title: `Book ${id}`, author: 'Author', isbn: '9780132350884', coverUrl: null },
  priceCents: 2500,
  condition: 'good',
  quantity: 3,
  shippingFeeCents: 1200,
  pickupAvailable: true,
  pickupNote: null,
  description: null,
  status: 'active',
  seller: { id: 'seller-1', name: 'Sebo da Ana', company: true },
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

export const makeCharge = (overrides: Partial<Charge> = {}): Charge => ({
  id: 'charge-1',
  simulated: true,
  method: 'pix',
  status: 'pending',
  amountCents: 3700,
  failureReason: null,
  pix: { code: 'SIMULADO-NAO-PAGUE-ABC', expiresAt: '2026-01-01T12:30:00Z' },
  card: null,
  createdAt: '2026-01-01T12:00:00Z',
  ...overrides,
})

export const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'order-1234-5678',
  status: 'awaiting_payment',
  shippingMethod: 'ship',
  shippingAddress: {
    recipient: 'Bia',
    street: 'Rua das Flores',
    number: '10',
    district: 'Centro',
    city: 'Curitiba',
    state: 'PR',
    zip: '80000000',
  },
  subtotalCents: 2500,
  shippingCents: 1200,
  totalCents: 3700,
  trackingCode: null,
  cancelReason: null,
  items: [
    {
      id: 'item-1',
      listingId: 'l1',
      catalogBookId: 'book-l1',
      title: 'Clean Code',
      author: 'Robert Martin',
      unitPriceCents: 2500,
      quantity: 1,
    },
  ],
  buyer: { id: 'buyer-1', name: 'Bia' },
  seller: { id: 'seller-1', name: 'Sebo da Ana' },
  payment: null,
  paidAt: null,
  shippedAt: null,
  deliveredAt: null,
  createdAt: '2026-01-01T12:00:00Z',
  ...overrides,
})
