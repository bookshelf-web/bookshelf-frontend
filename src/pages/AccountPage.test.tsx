import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AccountPage } from './AccountPage'
import { meService } from '../services/me.service'
import type { Role, User } from '../types/auth'
import type { Company } from '../types/company'

vi.mock('../services/me.service', () => ({
  meService: { getProfile: vi.fn(), updateRoles: vi.fn() },
}))

const applySession = vi.fn()
let roles: Role[] = ['reader']

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Ana', email: 'ana@test.com', roles },
    roles,
    hasRole: (role: Role) => roles.includes(role),
    logout: vi.fn(),
    applySession,
  }),
}))

const service = vi.mocked(meService)

const company = (overrides: Partial<Company> = {}): Company => ({
  id: 'c1',
  legalName: 'Sebo Página Viva LTDA',
  tradeName: 'Sebo Página Viva',
  cnpj: '11222333000181',
  email: 'a@b.co',
  address: { street: 'R', number: '1', district: 'C', city: 'Recife', state: 'PE', zip: '50000000' },
  verified: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  myRole: 'owner',
  ...overrides,
})

const session = (nextRoles: Role[]) => ({
  message: 'ok',
  token: 'fresh',
  user: { id: 'u1', name: 'Ana', email: 'ana@test.com', roles: nextRoles } as User,
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <AccountPage />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  roles = ['reader']
  service.getProfile.mockResolvedValue({ user: session(['reader']).user, companies: [] })
})

describe('AccountPage roles', () => {
  it('shows the current roles as selected and nothing to save yet', async () => {
    roles = ['reader', 'buyer']
    renderPage()

    expect(screen.getByTestId('account-role-reader')).toBeChecked()
    expect(screen.getByTestId('account-role-buyer')).toBeChecked()
    expect(screen.getByTestId('account-role-seller')).not.toBeChecked()
    expect(screen.getByTestId('save-roles-button')).toBeDisabled()
  })

  it('sends only the difference and applies the fresh session', async () => {
    service.updateRoles.mockResolvedValue(session(['reader', 'buyer', 'seller']))
    renderPage()

    await userEvent.click(screen.getByTestId('account-role-seller'))
    await userEvent.click(screen.getByTestId('save-roles-button'))

    expect(service.updateRoles).toHaveBeenCalledWith({ add: ['seller'], remove: [] })
    expect(applySession).toHaveBeenCalledWith(expect.objectContaining({ token: 'fresh' }))
    expect(await screen.findByTestId('account-saved')).toBeInTheDocument()
  })

  it('can remove a role while adding another', async () => {
    service.updateRoles.mockResolvedValue(session(['buyer']))
    renderPage()

    await userEvent.click(screen.getByTestId('account-role-buyer'))
    await userEvent.click(screen.getByTestId('account-role-reader'))
    await userEvent.click(screen.getByTestId('save-roles-button'))

    expect(service.updateRoles).toHaveBeenCalledWith({ add: ['buyer'], remove: ['reader'] })
  })

  it('will not save an empty selection', async () => {
    renderPage()

    await userEvent.click(screen.getByTestId('account-role-reader'))

    expect(screen.getByTestId('save-roles-button')).toBeDisabled()
  })

  it('shows the localised error when saving fails', async () => {
    service.updateRoles.mockRejectedValue({ response: { data: { code: 'ROLE_REQUIRED_MINIMUM', error: 'x' } } })
    renderPage()

    await userEvent.click(screen.getByTestId('account-role-buyer'))
    await userEvent.click(screen.getByTestId('save-roles-button'))

    expect(await screen.findByTestId('account-error')).toHaveTextContent('A conta precisa de pelo menos um uso ativo.')
    expect(applySession).not.toHaveBeenCalled()
  })

  it('warns when the personal library is turned off', () => {
    roles = ['buyer']
    renderPage()

    expect(screen.getByTestId('library-off-notice')).toBeInTheDocument()
  })

  it('does not warn readers', () => {
    renderPage()

    expect(screen.queryByTestId('library-off-notice')).not.toBeInTheDocument()
  })
})

describe('AccountPage companies', () => {
  it('tells non-sellers how to unlock companies', () => {
    renderPage()

    expect(screen.getByTestId('companies-seller-only')).toBeInTheDocument()
    expect(screen.queryByTestId('add-company-link')).not.toBeInTheDocument()
  })

  it('invites sellers to register their first company', async () => {
    roles = ['reader', 'buyer', 'seller']
    renderPage()

    expect(await screen.findByTestId('companies-empty')).toBeInTheDocument()
    expect(screen.getByTestId('add-company-link')).toHaveAttribute('href', '/companies/new')
  })

  it('lists the companies with their verification status', async () => {
    roles = ['seller']
    service.getProfile.mockResolvedValue({
      user: session(['seller']).user,
      companies: [company(), company({ id: 'c2', tradeName: null, legalName: 'Outra LTDA', verified: true, myRole: 'staff' })],
    })
    renderPage()

    expect(await screen.findByTestId('company-c1')).toHaveTextContent('Sebo Página Viva')
    expect(screen.getByTestId('company-c1')).toHaveTextContent('11.222.333/0001-81')
    expect(screen.getByTestId('company-c1')).toHaveTextContent('Recife/PE')
    expect(screen.getByTestId('company-status-c1')).toHaveTextContent('Aguardando verificação')
    expect(screen.getByTestId('company-c2')).toHaveTextContent('Outra LTDA')
    expect(screen.getByTestId('company-status-c2')).toHaveTextContent('Verificada')
    expect(screen.getByTestId('company-c2')).toHaveTextContent('Equipe')
  })

  it('shows an error when the profile cannot be loaded', async () => {
    roles = ['seller']
    service.getProfile.mockRejectedValue(new Error('offline'))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('offline')
  })
})

describe('AccountPage administration', () => {
  it('links admins to the company verification page', async () => {
    roles = ['reader', 'admin']
    renderPage()

    await waitFor(() => expect(screen.getByTestId('admin-companies-link')).toHaveAttribute('href', '/admin/companies'))
  })

  it('hides the administration section from everyone else', () => {
    renderPage()

    expect(screen.queryByTestId('admin-companies-link')).not.toBeInTheDocument()
  })
})
