export const isJSDOM = typeof navigator !== 'undefined' && /jsdom/i.test(navigator?.userAgent ?? '')

export const isWebKit =
  typeof CSS === 'undefined' || !CSS.supports ? false : CSS.supports('-webkit-backdrop-filter:none')

export const isGecko = !isWebKit && (navigator?.userAgent ?? '').toLowerCase().includes('firefox')

type TouchPoint = { clientX: number; clientY: number }

export type TestTouch = Touch | (TouchPoint & { identifier: number; target: EventTarget })

// Desktop Firefox does not define `Touch`; desktop WebKit defines it but rejects `new`.
export function createTouch(target: EventTarget, point: TouchPoint, identifier = 1): TestTouch {
  try {
    return new Touch({ identifier, target, ...point })
  } catch {
    return { identifier, target, ...point }
  }
}

type TouchInit = {
  touches?: TestTouch[]
  changedTouches?: TestTouch[]
  cancelable?: boolean
}

// `fireEvent.touch*` builds a plain `Event` wherever `TouchEvent` is undefined, dropping `touches`
// with it, so the library never sees a touch. Desktop Firefox lands there.
export function fireTouch(
  element: Element,
  type: 'touchstart' | 'touchmove' | 'touchend',
  init: TouchInit = {}
): boolean {
  const event = new Event(type, { bubbles: true, cancelable: init.cancelable ?? true })
  for (const key of ['touches', 'changedTouches'] as const) {
    Object.defineProperty(event, key, { value: init[key] ?? [], configurable: true })
  }
  return element.dispatchEvent(event)
}
