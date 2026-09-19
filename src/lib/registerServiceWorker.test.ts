import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { registerServiceWorker } from './registerServiceWorker'

// Capture the load handlers instead of attaching them to the shared window, so one test
// cannot fire another test's registration.
let loadHandlers: Array<() => void> = []

beforeEach(() => {
  loadHandlers = []
  vi.spyOn(window, 'addEventListener').mockImplementation(((type: string, handler: () => void) => {
    if (type === 'load') loadHandlers.push(handler)
  }) as typeof window.addEventListener)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  Reflect.deleteProperty(navigator, 'serviceWorker')
  Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true })
})

function fakeServiceWorker(register = vi.fn().mockResolvedValue({})) {
  Object.defineProperty(navigator, 'serviceWorker', { value: { register }, configurable: true })
  return register
}

const fireLoad = () => loadHandlers.forEach((handler) => handler())

describe('registerServiceWorker', () => {
  it('does nothing outside production builds', () => {
    const register = fakeServiceWorker()

    registerServiceWorker()
    fireLoad()

    expect(register).not.toHaveBeenCalled()
  })

  it('registers the worker after load in production', () => {
    vi.stubEnv('PROD', true)
    const register = fakeServiceWorker()

    registerServiceWorker()
    fireLoad()

    expect(register).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}sw.js`)
  })

  it('is skipped for automated browsers so E2E runs are not cached or intercepted', () => {
    vi.stubEnv('PROD', true)
    Object.defineProperty(navigator, 'webdriver', { value: true, configurable: true })
    const register = fakeServiceWorker()

    registerServiceWorker()
    fireLoad()

    expect(register).not.toHaveBeenCalled()
  })

  it('does nothing when the browser has no service worker support', () => {
    vi.stubEnv('PROD', true)

    expect(() => {
      registerServiceWorker()
      fireLoad()
    }).not.toThrow()
  })

  it('ignores a failed registration', async () => {
    vi.stubEnv('PROD', true)
    const register = fakeServiceWorker(vi.fn().mockRejectedValue(new Error('blocked')))

    registerServiceWorker()
    fireLoad()
    await Promise.resolve()

    expect(register).toHaveBeenCalled()
  })
})
