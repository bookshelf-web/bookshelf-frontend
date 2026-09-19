import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'

const login = vi.fn()
const register = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login, register }),
}))

const renderPage = (page: React.ReactElement) => render(<MemoryRouter>{page}</MemoryRouter>)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('signs in with the typed credentials', async () => {
    login.mockResolvedValue(undefined)
    renderPage(<LoginPage />)

    await userEvent.type(screen.getByTestId('email-input'), 'ana@test.com')
    await userEvent.type(screen.getByTestId('password-input'), 'secret1')
    await userEvent.click(screen.getByTestId('login-button'))

    expect(login).toHaveBeenCalledWith('ana@test.com', 'secret1')
  })

  it('shows the localised API error and re-enables the button', async () => {
    login.mockRejectedValue({ response: { data: { code: 'INVALID_CREDENTIALS', error: 'x' } } })
    renderPage(<LoginPage />)

    await userEvent.type(screen.getByTestId('email-input'), 'ana@test.com')
    await userEvent.type(screen.getByTestId('password-input'), 'nope')
    await userEvent.click(screen.getByTestId('login-button'))

    expect(await screen.findByTestId('error-message')).toHaveTextContent('E-mail ou senha incorretos.')
    await waitFor(() => expect(screen.getByTestId('login-button')).toBeEnabled())
  })

  it('links to the registration page', () => {
    renderPage(<LoginPage />)

    expect(screen.getByRole('link', { name: /cadastre-se/i })).toHaveAttribute('href', '/register')
  })
})

describe('RegisterPage', () => {
  const fillAccount = async () => {
    await userEvent.type(screen.getByTestId('name-input'), 'Ana Silva')
    await userEvent.type(screen.getByTestId('email-input'), 'ana@test.com')
    await userEvent.type(screen.getByTestId('password-input'), 'secret1')
  }

  it('starts with the library selected, as before roles existed', () => {
    renderPage(<RegisterPage />)

    expect(screen.getByTestId('register-role-reader')).toBeChecked()
    expect(screen.getByTestId('register-role-buyer')).not.toBeChecked()
    expect(screen.getByTestId('register-role-seller')).not.toBeChecked()
  })

  it('registers as library-only by default', async () => {
    register.mockResolvedValue(undefined)
    renderPage(<RegisterPage />)

    await fillAccount()
    await userEvent.click(screen.getByTestId('register-button'))

    expect(register).toHaveBeenCalledWith('Ana Silva', 'ana@test.com', 'secret1', ['reader'])
  })

  it('registers with every chosen role', async () => {
    register.mockResolvedValue(undefined)
    renderPage(<RegisterPage />)

    await fillAccount()
    await userEvent.click(screen.getByTestId('register-role-buyer'))
    await userEvent.click(screen.getByTestId('register-role-seller'))
    await userEvent.click(screen.getByTestId('register-button'))

    expect(register).toHaveBeenCalledWith('Ana Silva', 'ana@test.com', 'secret1', ['reader', 'buyer', 'seller'])
  })

  it('does not submit without any role and explains why', async () => {
    renderPage(<RegisterPage />)

    await fillAccount()
    await userEvent.click(screen.getByTestId('register-role-reader'))
    await userEvent.click(screen.getByTestId('register-button'))

    expect(register).not.toHaveBeenCalled()
    expect(screen.getByTestId('error-message')).toHaveTextContent('Escolha pelo menos uma opção')
  })

  it('shows the localised API error', async () => {
    register.mockRejectedValue({ response: { data: { code: 'EMAIL_ALREADY_REGISTERED', error: 'x' } } })
    renderPage(<RegisterPage />)

    await fillAccount()
    await userEvent.click(screen.getByTestId('register-button'))

    expect(await screen.findByTestId('error-message')).toHaveTextContent('Este e-mail já está cadastrado.')
  })
})
