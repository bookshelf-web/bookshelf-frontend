import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import api from './api'

const respond =
  (status: number): AxiosAdapter =>
  async (config: InternalAxiosRequestConfig) => {
    const response = { data: { ok: status < 400 }, status, statusText: '', headers: {}, config }
    if (status >= 400) {
      throw Object.assign(new Error(`HTTP ${status}`), { response, config, isAxiosError: true })
    }
    return response
  }

describe('shared axios instance', () => {
  const originalAdapter = api.defaults.adapter
  const originalLocation = window.location

  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window, 'location', { value: { href: '' }, writable: true, configurable: true })
  })

  afterEach(() => {
    api.defaults.adapter = originalAdapter
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true })
  })

  it('uses the /api proxy outside production', () => {
    expect(api.defaults.baseURL).toBe('/api')
  })

  it('sends the stored token as a bearer header', async () => {
    localStorage.setItem('token', 'abc')
    let sent: string | undefined
    api.defaults.adapter = async (config) => {
      sent = config.headers.get('Authorization') as string
      return { data: {}, status: 200, statusText: '', headers: {}, config }
    }

    await api.get('/books')

    expect(sent).toBe('Bearer abc')
  })

  it('sends no Authorization header without a token', async () => {
    let sent: unknown = 'unset'
    api.defaults.adapter = async (config) => {
      sent = config.headers.get('Authorization')
      return { data: {}, status: 200, statusText: '', headers: {}, config }
    }

    await api.get('/auth/login')

    expect(sent).toBeUndefined()
  })

  it('clears the session and goes to the login page on 401', async () => {
    localStorage.setItem('token', 'expired')
    localStorage.setItem('user', '{}')
    api.defaults.adapter = respond(401)

    await expect(api.get('/books')).rejects.toBeTruthy()

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(window.location.href).toBe(`${import.meta.env.BASE_URL}login`)
  })

  it('leaves the session alone on other errors', async () => {
    localStorage.setItem('token', 'still-valid')
    api.defaults.adapter = respond(403)

    await expect(api.get('/companies')).rejects.toBeTruthy()

    expect(localStorage.getItem('token')).toBe('still-valid')
    expect(window.location.href).toBe('')
  })
})
