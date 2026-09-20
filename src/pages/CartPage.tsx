import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/button'
import { AppHeader } from '../components/AppHeader'
import { useCart, type CartLine } from '../contexts/CartContext'
import { getApiErrorMessage } from '../lib/apiError'
import { formatBRL } from '../lib/money'
import { marketplaceService } from '../services/marketplace.service'
import type { ShippingAddress, ShippingMethod } from '../types/marketplace'

const FIELD =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent'

const EMPTY_ADDRESS: ShippingAddress = {
  recipient: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
  zip: '',
}

const ADDRESS_FIELDS = ['recipient', 'street', 'number', 'complement', 'district', 'city', 'state', 'zip'] as const

/** One purchase is always from a single seller, so the cart is checked out seller by seller. */
function groupBySeller(lines: CartLine[]): Array<{ sellerId: string; sellerName: string; lines: CartLine[] }> {
  const groups = new Map<string, { sellerId: string; sellerName: string; lines: CartLine[] }>()
  for (const line of lines) {
    const { id, name } = line.listing.seller
    const group = groups.get(id) ?? { sellerId: id, sellerName: name, lines: [] }
    group.lines.push(line)
    groups.set(id, group)
  }
  return [...groups.values()]
}

function SellerCheckout({ sellerId, sellerName, lines }: { sellerId: string; sellerName: string; lines: CartLine[] }) {
  const { t } = useTranslation()
  const cart = useCart()
  const navigate = useNavigate()

  const canPickUp = lines.every((line) => line.listing.pickupAvailable)
  const [method, setMethod] = useState<ShippingMethod>('ship')
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const subtotal = lines.reduce((sum, line) => sum + line.listing.priceCents * line.quantity, 0)
  const shipping = method === 'pickup' ? 0 : lines.reduce((sum, line) => sum + line.listing.shippingFeeCents, 0)

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const order = await marketplaceService.createOrder({
        items: lines.map((line) => ({ listingId: line.listing.id, quantity: line.quantity })),
        shippingMethod: method,
        ...(method === 'ship' && { shippingAddress: { ...address, complement: address.complement || null } }),
      })
      cart.clearSeller(sellerId)
      navigate(`/orders/${order.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'cart.placeError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={placeOrder}
      className="space-y-4 rounded-xl bg-white p-4 shadow-sm"
      data-testid={`cart-seller-${sellerId}`}
    >
      <h3 className="font-semibold text-gray-900">{t('cart.seller', { name: sellerName })}</h3>

      <ul className="divide-y divide-gray-100">
        {lines.map(({ listing, quantity }) => (
          <li
            key={listing.id}
            className="flex flex-wrap items-center justify-between gap-3 py-2"
            data-testid={`cart-item-${listing.id}`}
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{listing.book.title}</p>
              <p className="text-xs text-gray-500">{formatBRL(listing.priceCents)}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={listing.quantity}
                value={quantity}
                onChange={(e) => cart.setQuantity(listing.id, Number(e.target.value) || 1)}
                aria-label={t('cart.quantity')}
                className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                data-testid={`cart-quantity-${listing.id}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cart.remove(listing.id)}
                data-testid={`cart-remove-${listing.id}`}
              >
                {t('cart.remove')}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">{t('cart.shippingMethod')}</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={`method-${sellerId}`}
            checked={method === 'ship'}
            onChange={() => setMethod('ship')}
            data-testid={`cart-method-ship-${sellerId}`}
          />
          {t('cart.ship')}
        </label>
        <label className={`flex items-center gap-2 text-sm ${canPickUp ? '' : 'text-gray-400'}`}>
          <input
            type="radio"
            name={`method-${sellerId}`}
            checked={method === 'pickup'}
            disabled={!canPickUp}
            onChange={() => setMethod('pickup')}
            data-testid={`cart-method-pickup-${sellerId}`}
          />
          {t('cart.pickup')}
        </label>
        {!canPickUp && <p className="text-xs text-gray-500">{t('cart.pickupUnavailable')}</p>}
      </fieldset>

      {method === 'ship' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {ADDRESS_FIELDS.map((field) => (
            <label key={field} className="text-sm text-gray-700">
              {t(`cart.address.${field}`)}
              <input
                className={FIELD}
                value={address[field] ?? ''}
                required={field !== 'complement'}
                maxLength={field === 'state' ? 2 : undefined}
                onChange={(e) => setAddress((current) => ({ ...current, [field]: e.target.value }))}
                data-testid={`address-${field}-${sellerId}`}
              />
            </label>
          ))}
        </div>
      )}

      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt>{t('cart.subtotal')}</dt>
          <dd>{formatBRL(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{t('cart.shipping')}</dt>
          <dd>{shipping === 0 ? t('cart.free') : formatBRL(shipping)}</dd>
        </div>
        <div className="flex justify-between text-base font-bold">
          <dt>{t('cart.total')}</dt>
          <dd data-testid={`cart-total-${sellerId}`}>{formatBRL(subtotal + shipping)}</dd>
        </div>
      </dl>

      {error && (
        <p className="text-sm text-red-600" role="alert" data-testid={`cart-error-${sellerId}`}>
          {error}
        </p>
      )}

      <Button type="submit" disabled={busy} data-testid={`cart-checkout-${sellerId}`}>
        {busy ? t('cart.placing') : t('cart.placeOrder')}
      </Button>
    </form>
  )
}

export function CartPage() {
  const { t } = useTranslation()
  const { lines } = useCart()
  const groups = groupBySeller(lines)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid="cart-page">
      <AppHeader />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900">{t('cart.title')}</h2>

        {groups.length === 0 ? (
          <div className="space-y-3">
            <p className="text-gray-500" data-testid="cart-empty">
              {t('cart.empty')}
            </p>
            <Link to="/store" className="text-sm font-medium text-purple-600 hover:underline">
              {t('cart.goToStore')}
            </Link>
          </div>
        ) : (
          groups.map((group) => <SellerCheckout key={group.sellerId} {...group} />)
        )}
      </main>
    </div>
  )
}
