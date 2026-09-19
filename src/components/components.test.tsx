import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import i18n from '../i18n'
import { AppHeader } from './AppHeader'
import { BookCover } from './BookCover'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { LanguageSwitcher } from './LanguageSwitcher'
import { RoleSelector } from './RoleSelector'
import { StarRating } from './StarRating'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '../hooks/useTheme'
import type { Role, SelfServiceRole } from '../types/auth'

const logout = vi.fn()
let roles: Role[] = ['reader']

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Ana', roles },
    roles,
    hasRole: (role: Role) => roles.includes(role),
    logout,
  }),
}))

beforeEach(async () => {
  vi.clearAllMocks()
  roles = ['reader']
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  await i18n.changeLanguage('pt-BR')
})

describe('AppHeader', () => {
  const renderHeader = () =>
    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )

  it('shows the user and links to the library and the account for readers', () => {
    renderHeader()

    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByTestId('nav-library')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByTestId('nav-account')).toHaveAttribute('href', '/account')
  })

  it('hides the library link for accounts without the reader role', () => {
    roles = ['buyer']
    renderHeader()

    expect(screen.queryByTestId('nav-library')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /bookshelf/i })).toHaveAttribute('href', '/account')
  })

  it('signs out', async () => {
    renderHeader()

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(logout).toHaveBeenCalledTimes(1)
  })
})

describe('RoleSelector', () => {
  it('toggles roles on and off', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<RoleSelector value={['reader']} onChange={onChange} />)

    await userEvent.click(screen.getByTestId('role-buyer'))
    expect(onChange).toHaveBeenLastCalledWith(['reader', 'buyer'])

    rerender(<RoleSelector value={['reader', 'buyer']} onChange={onChange} />)
    await userEvent.click(screen.getByTestId('role-reader'))
    expect(onChange).toHaveBeenLastCalledWith(['buyer'])
  })

  it('lists exactly the self-service roles, never admin', () => {
    render(<RoleSelector value={[]} onChange={vi.fn()} testIdPrefix="pick" />)

    const ids = screen.getAllByRole('checkbox').map((box) => box.getAttribute('data-testid'))
    expect(ids).toEqual(['pick-reader', 'pick-buyer', 'pick-seller'])
  })

  it('disables every option while busy and supports the dark variant', () => {
    const value: SelfServiceRole[] = ['seller']
    render(<RoleSelector value={value} onChange={vi.fn()} disabled variant="onDark" />)

    for (const box of screen.getAllByRole('checkbox')) expect(box).toBeDisabled()
  })
})

describe('ThemeToggle and useTheme', () => {
  it('switches between the light and dark themes and remembers the choice', async () => {
    render(<ThemeToggle />)
    const toggle = screen.getByTestId('theme-toggle')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    await userEvent.click(toggle)

    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('starts from the stored choice', () => {
    localStorage.setItem('theme', 'dark')

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
  })

  it('exposes a toggle function', () => {
    const { result } = renderHook(() => useTheme())

    act(() => result.current.toggleTheme())

    expect(result.current.theme).toBe('dark')
  })

  it('renders the dark variant', () => {
    render(<ThemeToggle variant="onDark" />)

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })
})

describe('LanguageSwitcher', () => {
  it('marks the current language and switches to the other one', async () => {
    render(<LanguageSwitcher />)
    expect(screen.getByTestId('lang-pt')).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByTestId('lang-en'))

    expect(i18n.language).toBe('en')
    expect(screen.getByTestId('lang-en')).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders on dark backgrounds too', () => {
    render(<LanguageSwitcher variant="onDark" />)

    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
  })
})

describe('BookCover', () => {
  it('shows the image', () => {
    render(<BookCover url="https://example.com/c.jpg" alt="Capa" testId="cover" />)

    expect(screen.getByTestId('cover')).toHaveAttribute('src', 'https://example.com/c.jpg')
  })

  it('falls back to a placeholder when the image fails to load', () => {
    render(<BookCover url="https://example.com/broken.jpg" alt="Capa" testId="cover" />)

    act(() => {
      screen.getByTestId('cover').dispatchEvent(new Event('error'))
    })

    expect(screen.queryByTestId('cover')).not.toBeInTheDocument()
  })

  it('tries again when the URL changes', () => {
    const { rerender } = render(<BookCover url="https://example.com/broken.jpg" alt="Capa" testId="cover" />)
    act(() => {
      screen.getByTestId('cover').dispatchEvent(new Event('error'))
    })

    rerender(<BookCover url="https://example.com/new.jpg" alt="Capa" testId="cover" />)

    expect(screen.getByTestId('cover')).toHaveAttribute('src', 'https://example.com/new.jpg')
  })
})

describe('StarRating', () => {
  it('describes the rating for assistive technology', () => {
    render(<StarRating rating={4} testId="stars" />)

    expect(screen.getByTestId('stars')).toHaveAttribute('aria-label', 'Nota 4 de 5')
  })
})

describe('DeleteConfirmModal', () => {
  it('renders nothing while closed', () => {
    render(<DeleteConfirmModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} bookTitle="X" loading={false} />)

    expect(screen.queryByTestId('delete-confirm-modal')).not.toBeInTheDocument()
  })

  it('names the book and confirms or cancels', async () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(<DeleteConfirmModal isOpen onClose={onClose} onConfirm={onConfirm} bookTitle="Dom Casmurro" loading={false} />)

    expect(screen.getByTestId('delete-confirm-modal')).toHaveTextContent('Dom Casmurro')
    await userEvent.click(screen.getByTestId('confirm-delete-button'))
    await userEvent.click(screen.getByTestId('cancel-delete-button'))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('locks both buttons while deleting', () => {
    render(<DeleteConfirmModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} bookTitle="X" loading />)

    expect(screen.getByTestId('confirm-delete-button')).toBeDisabled()
    expect(screen.getByTestId('cancel-delete-button')).toBeDisabled()
  })
})
