import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { authService } from '../services/auth.service'
import type { User } from '../types/auth'

vi.mock('../services/auth.service', () => ({
  authService: { login: vi.fn(), register: vi.fn() },
}))

const service = vi.mocked(authService)

const user = (roles: User['roles']): User => ({
  id: 'u1',
  name: 'Ana',
  email: 'ana@test.com',
  roles,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
})

function Probe() {
  const auth = useAuth()
  const location = useLocation()
  const [error, setError] = useState('')
  return (
    <div>
      <p data-testid="error">{error}</p>
      <p data-testid="path">{location.pathname}</p>
      <p data-testid="authenticated">{String(auth.isAuthenticated)}</p>
      <p data-testid="roles">{auth.roles.join(',')}</p>
      <p data-testid="is-seller">{String(auth.hasRole('seller'))}</p>
      <p data-testid="name">{auth.user?.name ?? ''}</p>
      <button onClick={() => auth.login('ana@test.com', 'secret1')}>login</button>
      <button onClick={() => auth.login('ana@test.com', 'x').catch((e: Error) => setError(e.message))}>
        login-catching
      </button>
      <button onClick={() => auth.register('Ana', 'ana@test.com', 'secret1', ['buyer'])}>register</button>
      <button onClick={() => auth.register('Ana', 'ana@test.com', 'secret1')}>register-default</button>
      <button onClick={() => auth.applySession({ user: user(['reader', 'seller']), token: 'fresh' })}>upgrade</button>
      <button onClick={auth.logout}>logout</button>
    </div>
  )
}

const renderProvider = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('AuthProvider', () => {
  it('starts signed out', () => {
    renderProvider()

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('roles')).toHaveTextContent('reader')
  })

  it('restores a stored session', () => {
    localStorage.setItem('token', 'stored')
    localStorage.setItem('user', JSON.stringify(user(['buyer'])))

    renderProvider()

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('roles')).toHaveTextContent('buyer')
    expect(screen.getByTestId('name')).toHaveTextContent('Ana')
  })

  it('drops a corrupted stored user instead of crashing', () => {
    localStorage.setItem('token', 'stored')
    localStorage.setItem('user', 'undefined')

    renderProvider()

    expect(screen.getByTestId('name')).toHaveTextContent('')
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('treats a stored session without roles as library-only', () => {
    localStorage.setItem('token', 'stored')
    localStorage.setItem('user', JSON.stringify({ id: 'u', name: 'Old', email: 'o@t.co' }))

    renderProvider()

    expect(screen.getByTestId('roles')).toHaveTextContent('reader')
  })

  it('signs in, stores the session and opens the library for readers', async () => {
    service.login.mockResolvedValue({ message: 'ok', token: 'abc', user: user(['reader']) })
    renderProvider()

    await userEvent.click(screen.getByText('login'))

    expect(await screen.findByText('/dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(localStorage.getItem('token')).toBe('abc')
    expect(JSON.parse(localStorage.getItem('user') as string).roles).toEqual(['reader'])
  })

  it('sends accounts without the reader role to their account page', async () => {
    service.login.mockResolvedValue({ message: 'ok', token: 'abc', user: user(['buyer']) })
    renderProvider()

    await userEvent.click(screen.getByText('login'))

    expect(await screen.findByText('/account')).toBeInTheDocument()
  })

  it('registers with the chosen roles', async () => {
    service.register.mockResolvedValue({ message: 'ok', token: 't', user: user(['buyer']) })
    renderProvider()

    await userEvent.click(screen.getByText('register'))

    expect(service.register).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@test.com',
      password: 'secret1',
      roles: ['buyer'],
    })
    expect(await screen.findByText('/account')).toBeInTheDocument()
  })

  it('registers without roles when none are given', async () => {
    service.register.mockResolvedValue({ message: 'ok', token: 't', user: user(['reader']) })
    renderProvider()

    await userEvent.click(screen.getByText('register-default'))

    expect(service.register).toHaveBeenCalledWith(expect.objectContaining({ roles: undefined }))
  })

  it('lets errors reach the caller and stays signed out', async () => {
    service.login.mockRejectedValue(new Error('bad credentials'))
    renderProvider()

    await userEvent.click(screen.getByText('login-catching'))

    expect(await screen.findByText('bad credentials')).toBeInTheDocument()
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })

  it('applies a fresh session after the roles change', async () => {
    localStorage.setItem('token', 'old')
    localStorage.setItem('user', JSON.stringify(user(['reader'])))
    renderProvider()
    expect(screen.getByTestId('is-seller')).toHaveTextContent('false')

    await userEvent.click(screen.getByText('upgrade'))

    expect(screen.getByTestId('is-seller')).toHaveTextContent('true')
    expect(localStorage.getItem('token')).toBe('fresh')
  })

  it('signs out, clears the storage and returns to the login page', async () => {
    localStorage.setItem('token', 'abc')
    localStorage.setItem('user', JSON.stringify(user(['reader'])))
    renderProvider()

    await userEvent.click(screen.getByText('logout'))

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(screen.getByTestId('path')).toHaveTextContent('/login')
  })
})

describe('useAuth', () => {
  it('fails loudly outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => render(<Probe />)).toThrow('useAuth must be used within an AuthProvider')

    spy.mockRestore()
  })
})
