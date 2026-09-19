import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireRole } from './RouteGuards'
import type { Role } from '../types/auth'

let session = { isAuthenticated: false, roles: [] as Role[] }

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: session.isAuthenticated,
    hasRole: (role: Role) => session.roles.includes(role),
  }),
}))

function renderAt(path: string, element: React.ReactElement) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/secret" element={element} />
        <Route path="/login" element={<p>login page</p>} />
        <Route path="/account" element={<p>account page</p>} />
        <Route path="/elsewhere" element={<p>elsewhere page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  it('shows the page to a signed-in user', () => {
    session = { isAuthenticated: true, roles: [] }
    renderAt('/secret', <RequireAuth><p>secret</p></RequireAuth>)

    expect(screen.getByText('secret')).toBeInTheDocument()
  })

  it('sends a signed-out visitor to the login page', () => {
    session = { isAuthenticated: false, roles: [] }
    renderAt('/secret', <RequireAuth><p>secret</p></RequireAuth>)

    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })
})

describe('RequireRole', () => {
  it('shows the page to a user with the role', () => {
    session = { isAuthenticated: true, roles: ['seller'] }
    renderAt('/secret', <RequireRole role="seller"><p>secret</p></RequireRole>)

    expect(screen.getByText('secret')).toBeInTheDocument()
  })

  it('sends a user without the role to the account page', () => {
    session = { isAuthenticated: true, roles: ['buyer'] }
    renderAt('/secret', <RequireRole role="seller"><p>secret</p></RequireRole>)

    expect(screen.getByText('account page')).toBeInTheDocument()
  })

  it('honours a custom fallback', () => {
    session = { isAuthenticated: true, roles: [] }
    renderAt('/secret', <RequireRole role="admin" fallback="/elsewhere"><p>secret</p></RequireRole>)

    expect(screen.getByText('elsewhere page')).toBeInTheDocument()
  })

  it('sends a signed-out visitor to the login page', () => {
    session = { isAuthenticated: false, roles: ['seller'] }
    renderAt('/secret', <RequireRole role="seller"><p>secret</p></RequireRole>)

    expect(screen.getByText('login page')).toBeInTheDocument()
  })
})
