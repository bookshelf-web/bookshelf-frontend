import { createContext, useContext, useState, ReactNode } from 'react'
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token')
  })
  
  const navigate = useNavigate()

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })
      
      setUser(response.user)
      setToken(response.token)
      
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('token', response.token)
      
      navigate('/dashboard')
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao fazer login')
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authService.register({ name, email, password })
      
      setUser(response.user)
      setToken(response.token)
      
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('token', response.token)
      
      navigate('/dashboard')
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao criar conta')
    }
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
      value={{ 
        user, 
        token, 
        login, 
        register, 
        logout, 
        isAuthenticated: !!token 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}