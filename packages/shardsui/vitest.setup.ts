import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/svelte'
import { afterEach } from 'vitest'

// Unmount rendered components between tests so DOM from one test doesn't leak into the next.
afterEach(() => {
  cleanup()
})

// Skip animation waits in all tests.
globalThis.SHARDSUI_ANIMATIONS_DISABLED = true

// A real <form> submit triggers jsdom's unimplemented navigation; no test wants a real
// navigation, so cancel the default action globally. The form's own submit handler still
// runs — preventDefault here doesn't stop other listeners.
document.addEventListener('submit', (event) => event.preventDefault(), true)

// Clicking a real <a href> navigates the page in a browser (jsdom is a no-op). No test wants
// a real navigation, so cancel it globally. Component click handlers still run — preventDefault
// only stops the browser's navigation, not other listeners.
document.addEventListener(
  'click',
  (event) => {
    if ((event.target as Element | null)?.closest?.('a')?.getAttribute('href')) {
      event.preventDefault()
    }
  },
  true
)

// jsdom doesn't ship ResizeObserver.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

if (typeof Element.prototype.getAnimations === 'undefined') {
  Element.prototype.getAnimations = function getAnimations() {
    return []
  }
}

// scrollIntoView is not implemented in jsdom
if (typeof Element.prototype.scrollIntoView === 'undefined') {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}

// Pointer capture is not implemented in jsdom
if (typeof Element.prototype.setPointerCapture === 'undefined') {
  Element.prototype.setPointerCapture = function setPointerCapture() {}
  Element.prototype.releasePointerCapture = function releasePointerCapture() {}
  Element.prototype.hasPointerCapture = function hasPointerCapture() {
    return false
  }
}
