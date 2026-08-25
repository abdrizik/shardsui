import { fireEvent } from '@testing-library/svelte'

export const OPEN_DELAY = 50
export const PATIENT_CLICK_THRESHOLD = 500

export const falsyValueCases: ReadonlyArray<[string, 0 | '' | false]> = [
  ['0', 0],
  ['empty string', ''],
  ['false', false]
]

export function hoverOpen(element: HTMLElement) {
  fireEvent.mouseEnter(element)
  fireEvent.mouseMove(element)
}

export const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

export function defineOffsetSize(
  element: HTMLElement,
  width: () => number,
  height: () => number
): void {
  Object.defineProperty(element, 'offsetWidth', { configurable: true, get: width })
  Object.defineProperty(element, 'offsetHeight', { configurable: true, get: height })
}

export function mockBoundingClientRect(
  element: Element,
  rect: { x: number; y: number; width: number; height: number }
) {
  const domRect = {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    top: rect.y,
    left: rect.x,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height,
    toJSON: () => ({})
  }
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => domRect
  })
}

export function mockResizeObserver() {
  const original = globalThis.ResizeObserver
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  return () => {
    globalThis.ResizeObserver = original
  }
}

export type MockAnimation = { finished: Promise<void>; resolve: (() => void) | null }

export function mockAnimations(element: HTMLElement) {
  let active: MockAnimation[] = []
  function create(): MockAnimation {
    let resolve: (() => void) | null = null
    const finished = new Promise<void>((r) => {
      resolve = r
    })
    return { finished, resolve }
  }
  let current = create()
  Object.defineProperty(element, 'getAnimations', {
    configurable: true,
    value: () => active.map((a) => ({ finished: a.finished }))
  })
  return {
    start() {
      current = create()
      active.push(current)
      return current
    },
    finish(animation: MockAnimation = current) {
      const finished = animation.finished
      animation.resolve?.()
      animation.resolve = null
      active = active.filter((a) => a !== animation)
      return finished
    }
  }
}

export function primeOpenPopupSize(
  popupRoot: HTMLElement,
  positioner: HTMLElement,
  width: number,
  height: number
) {
  popupRoot.style.setProperty('--popup-width', 'auto')
  popupRoot.style.setProperty('--popup-height', 'auto')
  positioner.style.setProperty('--positioner-width', `${width}px`)
  positioner.style.setProperty('--positioner-height', `${height}px`)
}
