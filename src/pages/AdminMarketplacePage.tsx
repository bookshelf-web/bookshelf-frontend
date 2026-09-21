import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Button } from '../components/ui/button'
import { AppHeader } from '../components/AppHeader'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { Pagination } from '../components/Pagination'
import { getApiErrorMessage } from '../lib/apiError'
import { formatBRL } from '../lib/money'
import { adminMarketplaceService } from '../services/adminMarketplace.service'
import type { Paginated } from '../types/catalog'
import type { Listing, Order, OrderStatus } from '../types/marketplace'

type Tab = 'orders' | 'listings'

const ORDER_STATUSES: OrderStatus[] = ['awaiting_payment', 'paid', 'shipped', 'delivered', 'cancelled']
const FIELD =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent'

interface Loaded {
  key: string
  orders: Order[]
  listings: Listing[]
  pagination: Paginated | null
  error: string
}

export function AdminMarketplacePage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('orders')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [actionError, setActionError] = useState('')

  const appliedSearch = useRef('')
  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchInput.trim()
      if (next === appliedSearch.current) return
      appliedSearch.current = next
      setSearch(next)
      setPage(1)
    }, 300)
    return () => clearTimeout(id)
  }, [searchInput])

  const key = JSON.stringify({ tab, status, search, page, version })
  useEffect(() => {
    let cancelled = false
    const request =
      tab === 'orders'
        ? adminMarketplaceService
            .orders({ status: status || undefined, search: search || undefined, page })
            .then((data) => ({ orders: data.orders, listings: [], pagination: data.pagination }))
        : adminMarketplaceService
            .listings(undefined, page)
            .then((data) => ({ orders: [], listings: data.listings, pagination: data.pagination }))
    request
      .then((data) => {
        if (!cancelled) setLoaded({ key, ...data, error: '' })
      })
      .catch((err) => {
        if (!cancelled) {
          setLoaded({ key, orders: [], listings: [], pagination: null, error: getApiErrorMessage(err, 'adminMarket.loadError') })
        }
      })
    return () => {
      cancelled = true
    }
  }, [key, tab, status, search, page])

  const removeListing = async (id: string) => {
    setActionError('')
    try {
      await adminMarketplaceService.removeListing(id, reasons[id]?.trim() || undefined)
      setVersion((v) => v + 1)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'adminMarket.actionError'))
    }
  }

  const ready = loaded?.key === key
  const orders = loaded?.orders ?? []
  const listings = loaded?.listings ?? []
  const error = actionError || loaded?.error || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid="admin-marketplace-page">
      <AppHeader />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h2 className="mb-1 text-3xl font-bold text-gray-900">{t('adminMarket.title')}</h2>
          <p className="text-gray-600">{t('adminMarket.subtitle')}</p>
        </div>

        <div className="flex gap-2" role="tablist">
          {(['orders', 'listings'] as const).map((value) => (
            <Button
              key={value}
              role="tab"
              aria-selected={tab === value}
              variant={tab === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTab(value)
                setPage(1)
              }}
              data-testid={`market-tab-${value}`}
            >
              {t(`adminMarket.tab.${value}`)}
            </Button>
          ))}
        </div>

        {tab === 'orders' && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1" role="search">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('adminMarket.searchPlaceholder')}
                aria-label={t('adminMarket.searchPlaceholder')}
                className={`${FIELD} w-full pl-9`}
                data-testid="market-search"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as OrderStatus | '')
                setPage(1)
              }}
              aria-label={t('adminMarket.allStatuses')}
              className={FIELD}
              data-testid="market-status"
            >
              <option value="">{t('adminMarket.allStatuses')}</option>
              {ORDER_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {t(`orderStatus.${value}`)}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600" role="alert" data-testid="market-error">
            {error}
          </p>
        )}

        {ready && !error && tab === 'orders' && orders.length === 0 && (
          <p className="text-gray-500" data-testid="market-orders-empty">
            {t('adminMarket.ordersEmpty')}
          </p>
        )}
        {ready && !error && tab === 'listings' && listings.length === 0 && (
          <p className="text-gray-500" data-testid="market-listings-empty">
            {t('adminMarket.listingsEmpty')}
          </p>
        )}

        {tab === 'orders' && (
          <ul className="space-y-3" data-testid="market-orders">
            {orders.map((order) => (
              <li key={order.id} className="rounded-xl bg-white p-4 shadow-sm" data-testid={`market-order-${order.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{order.items.map((item) => item.title).join(', ')}</p>
                    <p className="text-xs text-gray-500">
                      {t('adminMarket.parties', { buyer: order.buyer.name, seller: order.seller.name })}
                    </p>
                    <p className="font-mono text-xs text-gray-400">{order.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-gray-900">{formatBRL(order.totalCents)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'listings' && (
          <ul className="space-y-3" data-testid="market-listings">
            {listings.map((listing) => (
              <li key={listing.id} className="space-y-2 rounded-xl bg-white p-4 shadow-sm" data-testid={`market-listing-${listing.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{listing.book.title}</p>
                    <p className="text-xs text-gray-500">
                      {listing.seller.name} · {formatBRL(listing.priceCents)} · {t('store.stock', { count: listing.quantity })}
                    </p>
                  </div>
                  <span className="text-xs text-gray-600" data-testid={`market-listing-status-${listing.id}`}>
                    {t(`adminMarket.listingStatus.${listing.status}`)}
                  </span>
                </div>
                {listing.status !== 'removed' && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={reasons[listing.id] ?? ''}
                      onChange={(e) => setReasons((current) => ({ ...current, [listing.id]: e.target.value }))}
                      placeholder={t('adminMarket.reason')}
                      aria-label={t('adminMarket.reason')}
                      className={`${FIELD} flex-1`}
                      data-testid={`market-reason-${listing.id}`}
                    />
                    <Button size="sm" variant="outline" onClick={() => removeListing(listing.id)} data-testid={`market-remove-${listing.id}`}>
                      {t('adminMarket.remove')}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <Pagination page={page} totalPages={loaded?.pagination?.totalPages ?? 1} onPageChange={setPage} />
      </main>
    </div>
  )
}
