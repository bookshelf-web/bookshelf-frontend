import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { OrderPage } from './OrderPage'
import { marketplaceService } from '../services/marketplace.service'
import { makeCharge, makeOrder } from '../test/marketplaceFixtures'

vi.mock('../services/marketplace.service', () => ({
  marketplaceService: {
    getOrder: vi.fn(),
    pay: vi.fn(),
    simulatePixPayment: vi.fn(),
    cancel: vi.fn(),
    ship: vi.fn(),
    deliver: vi.fn(),
  },
}))

let userId = 'buyer-1'
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: userId, name: 'Someone', roles: ['buyer', 'seller'] }, roles: ['buyer', 'seller'], hasRole: () => true, logout: vi.fn() }),
}))

const service = vi.mocked(marketplaceService)

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/orders/order-1234-5678']}>
      <Routes>
        <Route path="/orders/:id" element={<OrderPage />} />
      </Routes>
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  userId = 'buyer-1'
})

describe('OrderPage as the buyer', () => {
  it('shows the items, totals and address', async () => {
    service.getOrder.mockResolvedValue(makeOrder())
    renderPage()

    expect(await screen.findByTestId('order-items')).toHaveTextContent('Clean Code')
    expect(screen.getByTestId('order-total').textContent?.replace(/\s/g, ' ')).toBe('R$ 37,00')
    expect(screen.getByTestId('order-address')).toHaveTextContent('Curitiba/PR')
    expect(screen.getByTestId('order-status')).toHaveTextContent('Aguardando pagamento')
  })

  it('always shows the test environment banner next to the payment', async () => {
    service.getOrder.mockResolvedValue(makeOrder())
    renderPage()

    expect(await screen.findByTestId('test-environment-banner')).toHaveTextContent('AMBIENTE DE TESTE')
  })

  it('generates a Pix that is clearly not payable and simulates its payment', async () => {
    service.getOrder.mockResolvedValue(makeOrder())
    service.pay.mockResolvedValue(makeOrder({ payment: makeCharge() }))
    service.simulatePixPayment.mockResolvedValue(
      makeOrder({ status: 'paid', paidAt: '2026-01-01T12:05:00Z', payment: makeCharge({ status: 'paid' }) }),
    )
    renderPage()

    await userEvent.click(await screen.findByTestId('generate-pix-button'))
    const code = await screen.findByTestId('pix-code')
    expect(code).toHaveTextContent('SIMULADO-NAO-PAGUE-')
    expect(screen.getByTestId('payment-panel')).toHaveTextContent('não pode ser pago no seu banco')

    await userEvent.click(screen.getByTestId('simulate-pix-button'))

    expect(await screen.findByTestId('order-paid-note')).toHaveTextContent('Pagamento aprovado')
    expect(screen.getByTestId('order-status')).toHaveTextContent('Pago')
    expect(screen.queryByTestId('payment-panel')).not.toBeInTheDocument()
  })

  it('pays with a test card', async () => {
    service.getOrder.mockResolvedValue(makeOrder())
    service.pay.mockResolvedValue(
      makeOrder({ status: 'paid', payment: makeCharge({ method: 'card', status: 'paid', pix: null, card: { brand: 'visa', last4: '4242' } }) }),
    )
    renderPage()

    await userEvent.click(await screen.findByTestId('payment-method-card'))
    expect(screen.getByTestId('pay-card-button')).toBeDisabled()
    await userEvent.type(screen.getByTestId('card-number-input'), '4242424242424242')
    await userEvent.click(screen.getByTestId('pay-card-button'))

    expect(service.pay).toHaveBeenCalledWith('order-1234-5678', 'card', '4242424242424242')
    expect(await screen.findByTestId('order-paid-note')).toHaveTextContent('visa final 4242')
  })

  it.each([
    ['declined', 'Cartão recusado'],
    ['insufficient_funds', 'Saldo insuficiente'],
    ['not_a_test_card', 'Cartões reais não são aceitos'],
  ] as const)('explains a failed card (%s) and lets the buyer try again', async (failureReason, text) => {
    service.getOrder.mockResolvedValue(makeOrder())
    service.pay.mockResolvedValue(makeOrder({ payment: makeCharge({ method: 'card', status: 'failed', failureReason, pix: null }) }))
    renderPage()

    await userEvent.click(await screen.findByTestId('payment-method-card'))
    await userEvent.type(screen.getByTestId('card-number-input'), '4000000000000002')
    await userEvent.click(screen.getByTestId('pay-card-button'))

    expect(await screen.findByTestId('payment-failure')).toHaveTextContent(text)
    expect(screen.getByTestId('pay-card-button')).toBeEnabled()
  })

  it('shows the localised error when the payment cannot be processed', async () => {
    service.getOrder.mockResolvedValue(makeOrder())
    service.pay.mockRejectedValue({ response: { data: { code: 'PAYMENTS_DISABLED', error: 'x' } } })
    renderPage()

    await userEvent.click(await screen.findByTestId('generate-pix-button'))

    expect(await screen.findByTestId('payment-error')).toHaveTextContent('desativados')
  })

  it('cancels an unpaid order', async () => {
    service.getOrder.mockResolvedValue(makeOrder())
    service.cancel.mockResolvedValue(makeOrder({ status: 'cancelled', cancelReason: 'buyer' }))
    renderPage()

    await userEvent.click(await screen.findByTestId('cancel-order-button'))

    expect(await screen.findByTestId('order-cancel-reason')).toHaveTextContent('pedido do comprador')
    expect(screen.queryByTestId('cancel-order-button')).not.toBeInTheDocument()
  })

  it('confirms receipt of a shipped order', async () => {
    service.getOrder.mockResolvedValue(makeOrder({ status: 'shipped', trackingCode: 'BR123' }))
    service.deliver.mockResolvedValue(makeOrder({ status: 'delivered', trackingCode: 'BR123' }))
    renderPage()

    expect(await screen.findByTestId('order-tracking')).toHaveTextContent('BR123')
    await userEvent.click(screen.getByTestId('confirm-delivery-button'))

    expect(await screen.findByTestId('order-status')).toHaveTextContent('Entregue')
  })

  it('shows an action error', async () => {
    service.getOrder.mockResolvedValue(makeOrder())
    service.cancel.mockRejectedValue({ response: { data: { code: 'ORDER_NOT_CANCELLABLE', error: 'x' } } })
    renderPage()

    await userEvent.click(await screen.findByTestId('cancel-order-button'))

    expect(await screen.findByTestId('order-action-error')).toHaveTextContent('aguardando pagamento')
  })

  it('says so when the order does not exist', async () => {
    service.getOrder.mockRejectedValue({ response: { data: { code: 'ORDER_NOT_FOUND', error: 'x' } } })
    renderPage()

    expect(await screen.findByTestId('order-error')).toHaveTextContent('Pedido não encontrado')
  })

  it('explains an order that expired', async () => {
    service.getOrder.mockResolvedValue(makeOrder({ status: 'cancelled', cancelReason: 'expired' }))
    renderPage()

    expect(await screen.findByTestId('order-cancel-reason')).toHaveTextContent('falta de pagamento')
  })
})

describe('OrderPage as the seller', () => {
  beforeEach(() => {
    userId = 'seller-1'
  })

  it('ships a paid order with a tracking code', async () => {
    service.getOrder.mockResolvedValue(makeOrder({ status: 'paid', payment: makeCharge({ status: 'paid' }) }))
    service.ship.mockResolvedValue(makeOrder({ status: 'shipped', trackingCode: 'BR123456' }))
    renderPage()

    expect(await screen.findByTestId('ship-button')).toBeDisabled()
    expect(screen.queryByTestId('payment-panel')).not.toBeInTheDocument()
    await userEvent.type(screen.getByTestId('tracking-input'), 'BR123456')
    await userEvent.click(screen.getByTestId('ship-button'))

    expect(service.ship).toHaveBeenCalledWith('order-1234-5678', 'BR123456')
    expect(await screen.findByTestId('order-tracking')).toHaveTextContent('BR123456')
  })

  it('hands over a paid pickup order', async () => {
    service.getOrder.mockResolvedValue(makeOrder({ status: 'paid', shippingMethod: 'pickup', shippingAddress: null }))
    service.deliver.mockResolvedValue(makeOrder({ status: 'delivered', shippingMethod: 'pickup', shippingAddress: null }))
    renderPage()

    await userEvent.click(await screen.findByTestId('handover-button'))

    expect(await screen.findByTestId('order-status')).toHaveTextContent('Entregue')
  })
})
