import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SellPage } from './SellPage'
import { catalogService } from '../services/catalog.service'
import { companiesService } from '../services/companies.service'
import { marketplaceService } from '../services/marketplace.service'
import { makeListing, pageInfo } from '../test/marketplaceFixtures'
import type { CatalogBook } from '../types/catalog'
import type { Company } from '../types/company'

vi.mock('../services/marketplace.service', () => ({
  marketplaceService: { myListings: vi.fn(), createListing: vi.fn(), updateListing: vi.fn(), removeListing: vi.fn() },
}))
vi.mock('../services/catalog.service', () => ({ catalogService: { search: vi.fn() } }))
vi.mock('../services/companies.service', () => ({ companiesService: { listMine: vi.fn() } }))
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 's1', name: 'Ana', roles: ['seller'] }, roles: ['seller'], hasRole: () => true, logout: vi.fn() }),
}))

const market = vi.mocked(marketplaceService)
const catalog = vi.mocked(catalogService)
const companies = vi.mocked(companiesService)

const book: CatalogBook = {
  id: 'cb1',
  isbn: '9780132350884',
  title: 'Clean Code',
  author: 'Robert Martin',
  status: 'active',
  reviewStatus: 'reviewed',
  createdAt: '2026-01-01T00:00:00Z',
}

const company = (verified: boolean): Company =>
  ({ id: 'c1', legalName: 'Sebo LTDA', tradeName: 'Sebo da Ana', cnpj: '11222333000181', verified }) as Company

const renderPage = () =>
  render(
    <MemoryRouter>
      <SellPage />
    </MemoryRouter>,
  )

const pickBook = async () => {
  await userEvent.type(screen.getByTestId('catalog-search-input'), 'clean')
  await userEvent.click(screen.getByTestId('catalog-search-button'))
  await userEvent.click(await screen.findByTestId('catalog-result-cb1'))
}

beforeEach(() => {
  vi.clearAllMocks()
  market.myListings.mockResolvedValue({ listings: [], pagination: pageInfo })
  companies.listMine.mockResolvedValue([])
  catalog.search.mockResolvedValue({ books: [book], pagination: pageInfo })
})

describe('SellPage', () => {
  it('lists a catalog book for sale', async () => {
    market.createListing.mockResolvedValue(makeListing('l1'))
    renderPage()
    await screen.findByTestId('my-listings-empty')

    await pickBook()
    expect(screen.getByTestId('selected-book')).toHaveTextContent('Clean Code')
    await userEvent.type(screen.getByTestId('listing-price-input'), '25,90')
    await userEvent.selectOptions(screen.getByTestId('listing-condition-input'), 'like_new')
    await userEvent.clear(screen.getByTestId('listing-quantity-input'))
    await userEvent.type(screen.getByTestId('listing-quantity-input'), '2')
    await userEvent.clear(screen.getByTestId('listing-shipping-input'))
    await userEvent.type(screen.getByTestId('listing-shipping-input'), '12')
    await userEvent.click(screen.getByTestId('listing-pickup-input'))
    await userEvent.type(screen.getByTestId('listing-pickup-note-input'), 'Centro')
    await userEvent.click(screen.getByTestId('publish-listing-button'))

    await waitFor(() =>
      expect(market.createListing).toHaveBeenCalledWith({
        catalogBookId: 'cb1',
        priceCents: 2590,
        condition: 'like_new',
        quantity: 2,
        shippingFeeCents: 1200,
        pickupAvailable: true,
        pickupNote: 'Centro',
        companyId: null,
      }),
    )
    expect(await screen.findByTestId('sell-notice')).toHaveTextContent('Anúncio publicado')
    expect(market.myListings).toHaveBeenCalledTimes(2)
  })

  it('needs a book and a valid price', async () => {
    renderPage()
    await screen.findByTestId('my-listings-empty')

    await userEvent.click(screen.getByTestId('publish-listing-button'))
    expect(await screen.findByTestId('sell-error')).toHaveTextContent('Escolha um livro')

    await pickBook()
    await userEvent.type(screen.getByTestId('listing-price-input'), '0,50')
    await userEvent.click(screen.getByTestId('publish-listing-button'))
    expect(await screen.findByTestId('sell-error')).toHaveTextContent('preço válido')
    expect(market.createListing).not.toHaveBeenCalled()
  })

  it('offers only verified companies to sell as', async () => {
    companies.listMine.mockResolvedValue([company(true), { ...company(false), id: 'c2', tradeName: 'Não verificada' }])
    market.createListing.mockResolvedValue(makeListing('l1'))
    renderPage()

    const select = await screen.findByTestId('listing-company-input')
    expect(select).toHaveTextContent('Sebo da Ana')
    expect(select).not.toHaveTextContent('Não verificada')

    await pickBook()
    await userEvent.selectOptions(select, 'c1')
    await userEvent.type(screen.getByTestId('listing-price-input'), '10')
    await userEvent.click(screen.getByTestId('publish-listing-button'))

    await waitFor(() => expect(market.createListing).toHaveBeenCalledWith(expect.objectContaining({ companyId: 'c1' })))
  })

  it('hides the company selector when there is no verified company', async () => {
    companies.listMine.mockResolvedValue([company(false)])
    renderPage()
    await screen.findByTestId('my-listings-empty')

    expect(screen.queryByTestId('listing-company-input')).not.toBeInTheDocument()
  })

  it('says so when the catalog has no match', async () => {
    catalog.search.mockResolvedValue({ books: [], pagination: pageInfo })
    renderPage()
    await screen.findByTestId('my-listings-empty')

    await userEvent.type(screen.getByTestId('catalog-search-input'), 'nothing')
    await userEvent.click(screen.getByTestId('catalog-search-button'))

    expect(await screen.findByTestId('catalog-no-results')).toBeInTheDocument()
  })

  it('does not search for a blank query, and shows a search error', async () => {
    renderPage()
    await screen.findByTestId('my-listings-empty')

    await userEvent.click(screen.getByTestId('catalog-search-button'))
    expect(catalog.search).not.toHaveBeenCalled()

    catalog.search.mockRejectedValue({ response: { data: { code: 'ROLE_REQUIRED', error: 'x' } } })
    await userEvent.type(screen.getByTestId('catalog-search-input'), 'x')
    await userEvent.click(screen.getByTestId('catalog-search-button'))
    expect(await screen.findByTestId('sell-error')).toHaveTextContent('Você não tem permissão')
  })

  it('shows the localised error when publishing fails', async () => {
    market.createListing.mockRejectedValue({ response: { data: { code: 'COMPANY_NOT_VERIFIED', error: 'x' } } })
    renderPage()
    await screen.findByTestId('my-listings-empty')

    await pickBook()
    await userEvent.type(screen.getByTestId('listing-price-input'), '10')
    await userEvent.click(screen.getByTestId('publish-listing-button'))

    expect(await screen.findByTestId('sell-error')).toHaveTextContent('não foi verificada')
  })

  it('pauses, resumes and removes my listings', async () => {
    market.myListings.mockResolvedValue({
      listings: [makeListing('l1'), makeListing('l2', { status: 'paused' })],
      pagination: pageInfo,
    })
    market.updateListing.mockResolvedValue(makeListing('l1'))
    market.removeListing.mockResolvedValue()
    renderPage()

    await userEvent.click(await screen.findByTestId('toggle-listing-l1'))
    expect(market.updateListing).toHaveBeenCalledWith('l1', { status: 'paused' })

    await userEvent.click(screen.getByTestId('toggle-listing-l2'))
    expect(market.updateListing).toHaveBeenCalledWith('l2', { status: 'active' })
    expect(screen.getByTestId('my-listing-l2')).toHaveTextContent('Pausado')

    await userEvent.click(screen.getByTestId('remove-listing-l1'))
    expect(market.removeListing).toHaveBeenCalledWith('l1')
  })

  it('shows an error when a listing action fails, and when loading fails', async () => {
    market.myListings.mockResolvedValue({ listings: [makeListing('l1')], pagination: pageInfo })
    market.removeListing.mockRejectedValue({ response: { data: { code: 'NOT_LISTING_OWNER', error: 'x' } } })
    renderPage()

    await userEvent.click(await screen.findByTestId('remove-listing-l1'))
    expect(await screen.findByTestId('sell-error')).toHaveTextContent('outro vendedor')
  })

  it('shows a localised error when the listings cannot be loaded', async () => {
    market.myListings.mockRejectedValue({ response: { data: { code: 'ROLE_REQUIRED', error: 'x' } } })
    renderPage()

    expect(await screen.findByTestId('sell-load-error')).toHaveTextContent('Você não tem permissão')
  })
})
