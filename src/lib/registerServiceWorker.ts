export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  // Automated browsers (Playwright, Robot Framework) set navigator.webdriver.
  // A service worker there would cache assets between test runs and bypass
  // request interception, so it is only registered for real users.
  if (navigator.webdriver) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Offline support is an enhancement; the app works without it.
    })
  })
}
