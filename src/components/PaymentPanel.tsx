import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { TestEnvironmentBanner } from './TestEnvironmentBanner'
import { getApiErrorMessage } from '../lib/apiError'
import { formatBRL } from '../lib/money'
import { marketplaceService } from '../services/marketplace.service'
import type { Order, PaymentMethod } from '../types/marketplace'

interface PaymentPanelProps {
  order: Order
  onChange: (order: Order) => void
}

const FIELD =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent'

export function PaymentPanel({ order, onChange }: PaymentPanelProps) {
  const { t } = useTranslation()
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [cardNumber, setCardNumber] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const charge = order.payment
  const pendingPix = charge?.status === 'pending' && charge.method === 'pix' ? charge : null
  const failure = charge?.status === 'failed' ? charge.failureReason : null

  const run = async (action: () => Promise<Order>) => {
    setBusy(true)
    setError('')
    try {
      onChange(await action())
    } catch (err) {
      setError(getApiErrorMessage(err, 'payment.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm" data-testid="payment-panel">
      <h3 className="text-lg font-semibold text-gray-900">{t('payment.title')}</h3>
      <TestEnvironmentBanner />

      <div className="flex gap-2" role="tablist">
        {(['pix', 'card'] as const).map((key) => (
          <Button
            key={key}
            role="tab"
            aria-selected={method === key}
            variant={method === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMethod(key)}
            data-testid={`payment-method-${key}`}
          >
            {t(`payment.${key}`)}
          </Button>
        ))}
      </div>

      {method === 'pix' && (
        <div className="space-y-3">
          {pendingPix?.pix ? (
            <div className="space-y-2 rounded-lg border border-dashed border-gray-400 bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-600">{t('payment.pixCode')}</p>
              <p className="break-all font-mono text-sm text-gray-800" data-testid="pix-code">
                {pendingPix.pix.code}
              </p>
              <p className="text-xs text-red-700">{t('payment.pixNotice')}</p>
              <p className="text-xs text-gray-500">
                {t('payment.pixExpires', { time: new Date(pendingPix.pix.expiresAt).toLocaleTimeString() })}
              </p>
              <Button
                size="sm"
                onClick={() => run(() => marketplaceService.simulatePixPayment(order.id))}
                disabled={busy}
                data-testid="simulate-pix-button"
              >
                {t('payment.simulate')}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => run(() => marketplaceService.pay(order.id, 'pix'))}
              disabled={busy}
              data-testid="generate-pix-button"
            >
              {t('payment.generatePix')}
            </Button>
          )}
        </div>
      )}

      {method === 'card' && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            run(() => marketplaceService.pay(order.id, 'card', cardNumber))
          }}
        >
          <label className="block text-sm font-medium text-gray-700" htmlFor="card-number">
            {t('payment.cardNumber')}
          </label>
          <input
            id="card-number"
            className={FIELD}
            inputMode="numeric"
            autoComplete="off"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            data-testid="card-number-input"
          />
          <p className="text-xs text-gray-500">{t('payment.testCards')}</p>
          <Button type="submit" size="sm" disabled={busy || !cardNumber.trim()} data-testid="pay-card-button">
            {busy ? t('payment.paying') : t('payment.pay', { amount: formatBRL(order.totalCents) })}
          </Button>
        </form>
      )}

      {failure && (
        <p className="text-sm text-red-600" role="alert" data-testid="payment-failure">
          {t(`payment.failed.${failure}`)}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600" role="alert" data-testid="payment-error">
          {error}
        </p>
      )}
    </section>
  )
}
