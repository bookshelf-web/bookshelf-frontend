import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/button'
import { AppHeader } from '../components/AppHeader'
import { getApiErrorMessage } from '../lib/apiError'
import { formatBRL, parseBRLToCents } from '../lib/money'
import { catalogService } from '../services/catalog.service'
import { companiesService } from '../services/companies.service'
import { marketplaceService } from '../services/marketplace.service'
import type { CatalogBook } from '../types/catalog'
import type { Company } from '../types/company'
import { LISTING_CONDITIONS, type Listing, type ListingCondition } from '../types/marketplace'

const FIELD =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent'

interface Loaded {
  version: number
  listings: Listing[]
  companies: Company[]
  error: string
}

export function SellPage() {
  const { t } = useTranslation()
  const [version, setVersion] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CatalogBook[] | null>(null)
  const [book, setBook] = useState<CatalogBook | null>(null)
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState<ListingCondition>('good')
  const [quantity, setQuantity] = useState('1')
  const [shippingFee, setShippingFee] = useState('0')
  const [pickup, setPickup] = useState(false)
  const [pickupNote, setPickupNote] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([marketplaceService.myListings(), companiesService.listMine()])
      .then(([mine, companies]) => {
        if (!cancelled) setLoaded({ version, listings: mine.listings, companies, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setLoaded({ version, listings: [], companies: [], error: getApiErrorMessage(err, 'sell.loadError') })
      })
    return () => {
      cancelled = true
    }
  }, [version])

  const searchCatalog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      setResults((await catalogService.search(query.trim())).books)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'sell.loadError'))
    }
  }

  const publish = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setNotice('')
    if (!book) return setFormError(t('sell.pickBook'))
    const priceCents = parseBRLToCents(price)
    const shippingFeeCents = parseBRLToCents(shippingFee || '0')
    if (priceCents === null || priceCents < 100 || shippingFeeCents === null) {
      return setFormError(t('sell.invalidPrice'))
    }

    setBusy(true)
    try {
      await marketplaceService.createListing({
        catalogBookId: book.id,
        priceCents,
        condition,
        quantity: Math.max(1, Number(quantity) || 1),
        shippingFeeCents,
        pickupAvailable: pickup,
        pickupNote: pickup ? pickupNote || null : null,
        companyId: companyId || null,
      })
      setNotice(t('sell.created'))
      setBook(null)
      setResults(null)
      setQuery('')
      setPrice('')
      setVersion((v) => v + 1)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'sell.actionError'))
    } finally {
      setBusy(false)
    }
  }

  const change = async (action: () => Promise<unknown>) => {
    setFormError('')
    try {
      await action()
      setVersion((v) => v + 1)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'sell.actionError'))
    }
  }

  const verifiedCompanies = (loaded?.companies ?? []).filter((company) => company.verified)
  const listings = loaded?.listings ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid="sell-page">
      <AppHeader />

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h2 className="mb-1 text-3xl font-bold text-gray-900">{t('sell.title')}</h2>
          <p className="text-gray-600">{t('sell.subtitle')}</p>
        </div>

        <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
          <form onSubmit={searchCatalog} className="flex gap-2" role="search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('sell.searchPlaceholder')}
              aria-label={t('sell.searchBook')}
              className={FIELD}
              data-testid="catalog-search-input"
            />
            <Button type="submit" size="sm" variant="outline" data-testid="catalog-search-button">
              {t('sell.searchBook')}
            </Button>
          </form>

          {results && results.length === 0 && (
            <p className="text-sm text-gray-500" data-testid="catalog-no-results">
              {t('sell.noResults')}
            </p>
          )}
          {results && results.length > 0 && (
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => setBook(result)}
                    data-testid={`catalog-result-${result.id}`}
                  >
                    <span className="font-medium">{result.title}</span> — {result.author}
                    {result.isbn ? ` (${result.isbn})` : ''}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {book && (
            <p className="text-sm font-medium text-purple-700" data-testid="selected-book">
              {t('sell.selected', { title: book.title })}
            </p>
          )}

          <form onSubmit={publish} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-gray-700">
              {t('sell.price')}
              <input className={FIELD} value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" data-testid="listing-price-input" />
            </label>
            <label className="text-sm text-gray-700">
              {t('sell.condition')}
              <select className={FIELD} value={condition} onChange={(e) => setCondition(e.target.value as ListingCondition)} data-testid="listing-condition-input">
                {LISTING_CONDITIONS.map((value) => (
                  <option key={value} value={value}>
                    {t(`listingCondition.${value}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-gray-700">
              {t('sell.quantity')}
              <input className={FIELD} type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} data-testid="listing-quantity-input" />
            </label>
            <label className="text-sm text-gray-700">
              {t('sell.shippingFee')}
              <input className={FIELD} value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} inputMode="decimal" data-testid="listing-shipping-input" />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} data-testid="listing-pickup-input" />
              {t('sell.pickup')}
            </label>
            {pickup && (
              <label className="text-sm text-gray-700">
                {t('sell.pickupNote')}
                <input className={FIELD} value={pickupNote} onChange={(e) => setPickupNote(e.target.value)} data-testid="listing-pickup-note-input" />
              </label>
            )}
            {verifiedCompanies.length > 0 && (
              <label className="text-sm text-gray-700 sm:col-span-2">
                {t('sell.seller')}
                <select className={FIELD} value={companyId} onChange={(e) => setCompanyId(e.target.value)} data-testid="listing-company-input">
                  <option value="">{t('sell.asPerson')}</option>
                  {verifiedCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.tradeName || company.legalName}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy} data-testid="publish-listing-button">
                {t('sell.publish')}
              </Button>
            </div>
          </form>

          {formError && (
            <p className="text-sm text-red-600" role="alert" data-testid="sell-error">
              {formError}
            </p>
          )}
          {notice && (
            <p className="text-sm text-green-700" role="status" data-testid="sell-notice">
              {notice}
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900">{t('sell.mine')}</h3>
          {loaded?.error && (
            <p className="text-sm text-red-600" role="alert" data-testid="sell-load-error">
              {loaded.error}
            </p>
          )}
          {loaded && !loaded.error && listings.length === 0 && (
            <p className="text-gray-500" data-testid="my-listings-empty">
              {t('sell.none')}
            </p>
          )}
          <ul className="space-y-3" data-testid="my-listings">
            {listings.map((listing) => (
              <li key={listing.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm" data-testid={`my-listing-${listing.id}`}>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{listing.book.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatBRL(listing.priceCents)} · {t(`listingCondition.${listing.condition}`)} · {t('store.stock', { count: listing.quantity })}
                    {listing.status === 'paused' ? ` · ${t('sell.paused')}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => change(() => marketplaceService.updateListing(listing.id, { status: listing.status === 'paused' ? 'active' : 'paused' }))}
                    data-testid={`toggle-listing-${listing.id}`}
                  >
                    {listing.status === 'paused' ? t('sell.resume') : t('sell.pause')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => change(() => marketplaceService.removeListing(listing.id))} data-testid={`remove-listing-${listing.id}`}>
                    {t('sell.remove')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
