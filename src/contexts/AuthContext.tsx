import { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import type { User } from '../types/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function persistSession(user: User | undefined, token: string | undefined): void {
  // Never store the literal string "undefined" when the response is incomplete.
  if (user) localStorage.setItem('user', JSON.stringify(user))
  if (token) localStorage.setItem('token', token)
}

function readStoredUser(): User | null {
  const savedUser = localStorage.getItem('user')
  if (!savedUser) return null
  try {
    return JSON.parse(savedUser) as User
  } catch {
    // Corrupted value (e.g. "undefined" written by mistake) — drop it and move on.
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const navigate = useNavigate()

  // Errors bubble up to the calling page, which localises them via getApiErrorMessage.
  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    setUser(response.user)
    setToken(response.token)
    persistSession(response.user, response.token)
    navigate('/dashboard')
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await authService.register({ name, email, password })
    setUser(response.user)
    setToken(response.token)
    persistSession(response.user, response.token)
    navigate('/dashboard')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
