import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types/auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

/** Sends signed-in users without the role to `fallback` instead of showing a broken page. */
export function RequireRole({
  role,
  fallback = '/account',
  children,
}: {
  role: Role
  fallback?: string
  children: ReactNode
}) {
  const { isAuthenticated, hasRole } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" />
  return hasRole(role) ? <>{children}</> : <Navigate to={fallback} />
}
