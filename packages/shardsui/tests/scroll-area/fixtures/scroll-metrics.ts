export const SCROLL_TIMEOUT = 500

/** `ConfigurableArea`'s default viewport edge length. */
export const VIEWPORT_SIZE = 200

/** `ConfigurableArea`'s default content edge length. */
export const SCROLLABLE_CONTENT_SIZE = 1000

/** Gives an element overflow in both axes so scrollbars and the corner mount without layout. */
export function mockOverflowMetrics(element: HTMLElement) {
  const metrics = { clientHeight: 100, scrollHeight: 1000, clientWidth: 100, scrollWidth: 1000 }

  for (const [key, value] of Object.entries(metrics)) {
    const descriptor = Object.getOwnPropertyDescriptor(element, key)
    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(element, key, { value, configurable: true })
    }
  }
}

export function mockScrollY(element: HTMLElement, value: number) {
  Object.defineProperty(element, 'scrollTop', { configurable: true, writable: true, value })
}

export function mockScrollX(element: HTMLElement, value: number) {
  Object.defineProperty(element, 'scrollLeft', { configurable: true, writable: true, value })
}
