import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminUsersPage } from './AdminUsersPage'
import { adminUsersService } from '../services/adminUsers.service'
import type { AdminUser } from '../types/admin'

vi.mock('../services/adminUsers.service', () => ({
  adminUsersService: { list: vi.fn(), update: vi.fn() },
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', name: 'Root', roles: ['admin'] },
    roles: ['admin'],
    hasRole: () => true,
    logout: vi.fn(),
  }),
}))

const service = vi.mocked(adminUsersService)

const user = (id: string, overrides: Partial<AdminUser> = {}): AdminUser => ({
  id,
  name: `User ${id}`,
  email: `${id}@test.com`,
  roles: ['reader'],
  status: 'active',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  ...overrides,
})

const listResponse = (users: AdminUser[], page = 1, totalPages = 1, total = users.length) => ({
  users,
  pagination: { page, limit: 10, total, totalPages },
})

const lastParams = () => service.list.mock.calls.at(-1)?.[0]

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminUsersPage />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  service.list.mockResolvedValue(listResponse([user('u1'), user('admin-1', { roles: ['reader', 'admin'] })]))
})

describe('AdminUsersPage listing', () => {
  it('loads the first page and marks the current admin', async () => {
    renderPage()

    expect(await screen.findByTestId('admin-user-u1')).toHaveTextContent('User u1')
    expect(screen.getByTestId('admin-user-admin-1')).toHaveTextContent('você')
    expect(screen.getByTestId('admin-users-count')).toHaveTextContent('2 usuários')
    expect(lastParams()).toMatchObject({ page: 1, limit: 10 })
  })

  it('shows roles and account status', async () => {
    service.list.mockResolvedValue(listResponse([user('u2', { status: 'suspended', roles: ['seller', 'buyer'] })]))
    renderPage()

    const card = await screen.findByTestId('admin-user-u2')
    expect(card).toHaveTextContent('Vender no sebo')
    expect(screen.getByTestId('admin-user-status-u2')).toHaveTextContent('Suspenso')
  })

  it('debounces the search and resets the page', async () => {
    renderPage()
    await screen.findByTestId('admin-user-u1')

    await userEvent.type(screen.getByTestId('admin-users-search'), 'bia')

    await waitFor(() => expect(lastParams()).toMatchObject({ search: 'bia', page: 1 }))
    expect(service.list.mock.calls.filter(([params]) => params?.search)).toHaveLength(1)
  })

  it('filters by role and status', async () => {
    renderPage()
    await screen.findByTestId('admin-user-u1')

    await userEvent.selectOptions(screen.getByTestId('admin-users-role'), 'seller')
    await userEvent.selectOptions(screen.getByTestId('admin-users-status'), 'suspended')

    await waitFor(() => expect(lastParams()).toMatchObject({ role: 'seller', status: 'suspended' }))
  })

  it('paginates', async () => {
    service.list.mockResolvedValue(listResponse([user('u1')], 1, 3, 25))
    renderPage()
    expect(await screen.findByTestId('pagination-info')).toHaveTextContent('Página 1 de 3')

    service.list.mockResolvedValue(listResponse([user('u9')], 2, 3, 25))
    await userEvent.click(screen.getByTestId('pagination-next'))

    expect(await screen.findByTestId('admin-user-u9')).toBeInTheDocument()
    expect(lastParams()).toMatchObject({ page: 2 })
  })

  it('shows an empty state', async () => {
    service.list.mockResolvedValue(listResponse([]))
    renderPage()

    expect(await screen.findByTestId('admin-users-empty')).toBeInTheDocument()
  })

  it('shows a localised error when loading fails', async () => {
    service.list.mockRejectedValue({ response: { data: { code: 'ROLE_REQUIRED', error: 'x' } } })
    renderPage()

    expect(await screen.findByTestId('admin-users-error')).toHaveTextContent('Você não tem permissão')
  })
})

describe('AdminUsersPage editing', () => {
  const openEditor = async (id = 'u1') => {
    renderPage()
    await userEvent.click(await screen.findByTestId(`admin-user-edit-${id}`))
    return screen.findByTestId('edit-user-dialog')
  }

  it('opens with the current values', async () => {
    await openEditor()

    expect(screen.getByTestId('edit-user-name')).toHaveValue('User u1')
    expect(screen.getByTestId('edit-user-email')).toHaveValue('u1@test.com')
    expect(screen.getByTestId('edit-user-role-reader')).toBeChecked()
    expect(screen.getByTestId('edit-user-role-admin')).not.toBeChecked()
    expect(screen.getByTestId('edit-user-status')).toHaveValue('active')
  })

  it('sends only what changed and reloads the list', async () => {
    service.update.mockResolvedValue(user('u1', { name: 'Renamed' }))
    await openEditor()

    await userEvent.clear(screen.getByTestId('edit-user-name'))
    await userEvent.type(screen.getByTestId('edit-user-name'), 'Renamed')
    await userEvent.click(screen.getByTestId('edit-user-role-seller'))
    await userEvent.selectOptions(screen.getByTestId('edit-user-status'), 'suspended')
    const callsBefore = service.list.mock.calls.length
    await userEvent.click(screen.getByTestId('edit-user-save'))

    expect(service.update).toHaveBeenCalledWith('u1', {
      name: 'Renamed',
      status: 'suspended',
      roles: ['reader', 'seller'],
    })
    await waitFor(() => expect(screen.queryByTestId('edit-user-dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(service.list.mock.calls.length).toBeGreaterThan(callsBefore))
  })

  it('can grant the admin role', async () => {
    service.update.mockResolvedValue(user('u1'))
    await openEditor()

    await userEvent.click(screen.getByTestId('edit-user-role-admin'))
    await userEvent.click(screen.getByTestId('edit-user-save'))

    expect(service.update).toHaveBeenCalledWith('u1', { roles: ['reader', 'admin'] })
  })

  it('closes without calling the API when nothing changed', async () => {
    await openEditor()

    await userEvent.click(screen.getByTestId('edit-user-save'))

    expect(service.update).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByTestId('edit-user-dialog')).not.toBeInTheDocument())
  })

  it('will not save without any role', async () => {
    await openEditor()

    await userEvent.click(screen.getByTestId('edit-user-role-reader'))

    expect(screen.getByTestId('edit-user-save')).toBeDisabled()
  })

  it('shows the localised API error and stays open', async () => {
    service.update.mockRejectedValue({ response: { data: { code: 'LAST_ADMIN', error: 'x' } } })
    await openEditor('admin-1')

    await userEvent.click(screen.getByTestId('edit-user-role-admin'))
    await userEvent.click(screen.getByTestId('edit-user-save'))

    expect(await screen.findByTestId('edit-user-error')).toHaveTextContent('último administrador ativo')
    expect(screen.getByTestId('edit-user-dialog')).toBeInTheDocument()
  })

  it('cancels', async () => {
    await openEditor()

    await userEvent.click(screen.getByTestId('edit-user-cancel'))

    expect(screen.queryByTestId('edit-user-dialog')).not.toBeInTheDocument()
    expect(service.update).not.toHaveBeenCalled()
  })
})
