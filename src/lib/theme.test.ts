import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyTheme, getInitialTheme, storeTheme } from './theme'

function mockPrefersDark(matches: boolean) {
  vi.stubGlobal('matchMedia', () => ({ matches }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('theme', () => {
  it('prefers the stored choice over the OS setting', () => {
    mockPrefersDark(true)
    storeTheme('light')
    expect(getInitialTheme()).toBe('light')
  })

  it('falls back to the OS colour scheme', () => {
    mockPrefersDark(true)
    expect(getInitialTheme()).toBe('dark')
    mockPrefersDark(false)
    expect(getInitialTheme()).toBe('light')
  })

  it('toggles the dark class on <html>', () => {
    applyTheme('dark')
    expect(document.documentElement).toHaveClass('dark')
    applyTheme('light')
    expect(document.documentElement).not.toHaveClass('dark')
  })
})
