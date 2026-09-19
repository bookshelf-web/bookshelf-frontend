import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminCompaniesPage } from './AdminCompaniesPage'
import { companiesService } from '../services/companies.service'
import type { Company } from '../types/company'

vi.mock('../services/companies.service', () => ({
  companiesService: { listForAdmin: vi.fn(), setVerified: vi.fn() },
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Root', roles: ['admin'] },
    roles: ['admin'],
    hasRole: () => true,
    logout: vi.fn(),
  }),
}))

const service = vi.mocked(companiesService)

const company = (id: string, verified: boolean): Company => ({
  id,
  legalName: `Razão ${id}`,
  tradeName: `Fantasia ${id}`,
  cnpj: '11222333000181',
  email: `${id}@b.co`,
  address: { street: 'R', number: '1', district: 'C', city: 'Recife', state: 'PE', zip: '50000000' },
  verified,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminCompaniesPage />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  service.listForAdmin.mockResolvedValue([company('c1', false)])
})

describe('AdminCompaniesPage', () => {
  it('starts with the pending companies', async () => {
    renderPage()

    expect(await screen.findByTestId('admin-company-c1')).toHaveTextContent('Fantasia c1')
    expect(service.listForAdmin).toHaveBeenCalledWith(false)
    expect(screen.getByTestId('admin-filter-pending')).toHaveAttribute('aria-pressed', 'true')
  })

  it('reloads with the chosen filter', async () => {
    renderPage()
    await screen.findByTestId('admin-company-c1')
    service.listForAdmin.mockResolvedValue([company('c2', true)])

    await userEvent.click(screen.getByTestId('admin-filter-verified'))
    expect(await screen.findByTestId('admin-company-c2')).toBeInTheDocument()
    expect(service.listForAdmin).toHaveBeenLastCalledWith(true)

    service.listForAdmin.mockResolvedValue([])
    await userEvent.click(screen.getByTestId('admin-filter-all'))
    await waitFor(() => expect(service.listForAdmin).toHaveBeenLastCalledWith(undefined))
  })

  it('shows an empty state', async () => {
    service.listForAdmin.mockResolvedValue([])
    renderPage()

    expect(await screen.findByTestId('admin-companies-empty')).toBeInTheDocument()
  })

  it('verifies a company and drops it from the pending list', async () => {
    service.setVerified.mockResolvedValue(company('c1', true))
    renderPage()

    await userEvent.click(await screen.findByTestId('verify-company-c1'))

    expect(service.setVerified).toHaveBeenCalledWith('c1', true)
    await waitFor(() => expect(screen.queryByTestId('admin-company-c1')).not.toBeInTheDocument())
  })

  it('keeps a revoked company in the "all" list with the opposite action', async () => {
    service.listForAdmin.mockResolvedValue([company('c1', true)])
    service.setVerified.mockResolvedValue(company('c1', false))
    renderPage()
    await userEvent.click(screen.getByTestId('admin-filter-all'))

    const button = await screen.findByTestId('verify-company-c1')
    expect(button).toHaveTextContent('Revogar')
    await userEvent.click(button)

    expect(service.setVerified).toHaveBeenCalledWith('c1', false)
    await waitFor(() => expect(screen.getByTestId('verify-company-c1')).toHaveTextContent('Verificar'))
  })

  it('shows an error when loading fails', async () => {
    service.listForAdmin.mockRejectedValue({ response: { data: { code: 'ROLE_REQUIRED', error: 'x' } } })
    renderPage()

    expect(await screen.findByTestId('admin-error')).toHaveTextContent('Você não tem permissão para acessar esta área.')
  })

  it('shows an error when the update fails and keeps the company listed', async () => {
    service.setVerified.mockRejectedValue(new Error('offline'))
    renderPage()

    await userEvent.click(await screen.findByTestId('verify-company-c1'))

    expect(await screen.findByTestId('admin-error')).toHaveTextContent('offline')
    expect(screen.getByTestId('admin-company-c1')).toBeInTheDocument()
  })
})
