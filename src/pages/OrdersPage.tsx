import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppHeader } from '../components/AppHeader'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { Pagination } from '../components/Pagination'
import { getApiErrorMessage } from '../lib/apiError'
import { formatBRL } from '../lib/money'
import { marketplaceService } from '../services/marketplace.service'
import type { Paginated } from '../types/catalog'
import type { Order } from '../types/marketplace'

interface Loaded {
  key: string
  orders: Order[]
  pagination: Paginated | null
  error: string
}

/** The buyer's purchases, or (mode "sales") the orders placed with the seller. */
export function OrdersPage({ mode }: { mode: 'purchases' | 'sales' }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  const key = `${mode}:${page}`
  useEffect(() => {
    let cancelled = false
    const load = mode === 'sales' ? marketplaceService.sales : marketplaceService.purchases
    load(undefined, page)
      .then((data) => {
        if (!cancelled) setLoaded({ key, orders: data.orders, pagination: data.pagination, error: '' })
      })
      .catch((err) => {
        if (!cancelled) {
          setLoaded({ key, orders: [], pagination: null, error: getApiErrorMessage(err, `${mode === 'sales' ? 'sales' : 'orders'}.loadError`) })
        }
      })
    return () => {
      cancelled = true
    }
  }, [key, mode, page])

  const ready = loaded?.key === key
  const orders = loaded?.orders ?? []
  const other = (order: Order) => (mode === 'sales' ? order.buyer.name : order.seller.name)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid={`${mode}-page`}>
      <AppHeader />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900">{t(mode === 'sales' ? 'sales.title' : 'orders.title')}</h2>

        {loaded?.error && (
          <p className="text-sm text-red-600" role="alert" data-testid="orders-error">
            {loaded.error}
          </p>
        )}

        {ready && !loaded.error && orders.length === 0 && (
          <p className="text-gray-500" data-testid="orders-empty">
            {t(mode === 'sales' ? 'sales.empty' : 'orders.empty')}
          </p>
        )}

        <ul className="space-y-3" data-testid="orders-list">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm hover:shadow-md"
                data-testid={`order-row-${order.id}`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{order.items.map((item) => item.title).join(', ')}</p>
                  <p className="text-xs text-gray-500">
                    {other(order)} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-semibold text-gray-900">{formatBRL(order.totalCents)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Pagination page={page} totalPages={loaded?.pagination?.totalPages ?? 1} onPageChange={setPage} />
      </main>
    </div>
  )
}
