import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import { createTouch, fireTouch as dispatchTouch, isJSDOM } from '../test-utils'
import DrawerSwipeAreaBackdrop from './fixtures/drawer-swipe-area-backdrop.svelte'
import DrawerSwipeAreaSized from './fixtures/drawer-swipe-area-sized.svelte'
import DrawerSwipeArea from './fixtures/drawer-swipe-area.svelte'

type Point = { x: number; y: number }

type SwipeOptions = {
  beforeRelease?: () => unknown | Promise<unknown>
  input?: 'pointer' | 'touch'
}

function fireTouch(
  element: HTMLElement,
  type: 'touchstart' | 'touchmove' | 'touchend',
  key: 'touches' | 'changedTouches',
  point: { clientX: number; clientY: number }
) {
  dispatchTouch(element, type, { [key]: [createTouch(element, point)] })
}

async function flush() {
  await Promise.resolve()
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function startSwipeOpen(swipeArea: HTMLElement) {
  fireEvent.pointerDown(swipeArea, {
    button: 0,
    buttons: 1,
    pointerId: 1,
    clientX: 10,
    clientY: 120,
    pointerType: 'mouse'
  })
  await flush()
  fireEvent.pointerMove(swipeArea, {
    buttons: 1,
    pointerId: 1,
    clientX: 10,
    clientY: 119,
    pointerType: 'mouse'
  })
  await flush()
  fireEvent.pointerMove(swipeArea, {
    buttons: 1,
    pointerId: 1,
    clientX: 10,
    clientY: 60,
    pointerType: 'mouse'
  })
  await flush()
}

async function pressOutside(target: Element = document.body) {
  fireEvent.pointerDown(target, { button: 0, buttons: 1, pointerType: 'mouse' })
  await flush()
  fireEvent.pointerUp(target, { button: 0, buttons: 0, pointerType: 'mouse' })
  await flush()
  fireEvent.click(target)
}

async function swipe(element: HTMLElement, start: Point, end: Point, options: SwipeOptions = {}) {
  const stepX = start.x + (end.x === start.x ? 0 : Math.sign(end.x - start.x))
  const stepY = start.y + (end.y === start.y ? 0 : Math.sign(end.y - start.y))
  const { beforeRelease, input = 'pointer' } = options

  if (input === 'touch') {
    fireTouch(element, 'touchstart', 'touches', { clientX: start.x, clientY: start.y })
    await flush()
    fireTouch(element, 'touchmove', 'touches', { clientX: stepX, clientY: stepY })
    await flush()
    fireTouch(element, 'touchmove', 'touches', { clientX: end.x, clientY: end.y })
    await flush()
    if (beforeRelease) {
      await beforeRelease()
      await flush()
    }
    fireTouch(element, 'touchend', 'changedTouches', { clientX: end.x, clientY: end.y })
    await flush()
    return
  }

  fireEvent.pointerDown(element, {
    button: 0,
    buttons: 1,
    pointerId: 1,
    clientX: start.x,
    clientY: start.y,
    pointerType: 'mouse'
  })
  await flush()
  fireEvent.pointerMove(element, {
    buttons: 1,
    pointerId: 1,
    clientX: stepX,
    clientY: stepY,
    pointerType: 'mouse'
  })
  await flush()
  fireEvent.pointerMove(element, {
    buttons: 1,
    pointerId: 1,
    clientX: end.x,
    clientY: end.y,
    pointerType: 'mouse'
  })
  await flush()
  if (beforeRelease) {
    await beforeRelease()
    await flush()
  }
  fireEvent.pointerUp(element, {
    pointerId: 1,
    clientX: end.x,
    clientY: end.y,
    pointerType: 'mouse'
  })
  await flush()
}

async function swipeUp(element: HTMLElement, startY: number, endY: number, options?: SwipeOptions) {
  return swipe(element, { x: 10, y: startY }, { x: 10, y: endY }, options)
}

async function swipeLeft(
  element: HTMLElement,
  startX: number,
  endX: number,
  options?: SwipeOptions
) {
  return swipe(element, { x: startX, y: 10 }, { x: endX, y: 10 }, options)
}

describe('<Drawer.SwipeArea />', () => {
  let originalPointerEvent: typeof PointerEvent | undefined

  beforeAll(() => {
    // PointerEvent is not fully implemented in jsdom, so fireEvent.pointer* ignores options.
    // https://github.com/jsdom/jsdom/issues/2527
    originalPointerEvent = (window as Window & { PointerEvent?: typeof PointerEvent }).PointerEvent
    ;(window as Window & { PointerEvent: typeof MouseEvent }).PointerEvent =
      window.MouseEvent as unknown as typeof PointerEvent
  })

  afterAll(() => {
    ;(window as Window & { PointerEvent?: typeof PointerEvent }).PointerEvent = originalPointerEvent
  })

  it('opens the drawer when swiped in the open direction', async () => {
    render(DrawerSwipeArea)

    const swipeArea = screen.getByTestId('swipe-area')
    expect(swipeArea).toHaveAttribute('data-closed', '')

    await swipeUp(swipeArea, 120, 40)

    expect(swipeArea).toHaveAttribute('data-open', '')
  })

  it('does not open when the swipe direction never locks to the open direction', async () => {
    const onOpenChange = vi.fn()
    render(DrawerSwipeArea, { onOpenChange })

    const swipeArea = screen.getByTestId('swipe-area')

    await swipe(swipeArea, { x: 10, y: 120 }, { x: 70, y: 118 })

    expect(swipeArea).toHaveAttribute('data-closed', '')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('prevents default pointer down for non-touch swipes', async () => {
    render(DrawerSwipeArea)

    const notCancelled = await fireEvent.pointerDown(screen.getByTestId('swipe-area'), {
      button: 0,
      buttons: 1,
      pointerId: 1,
      clientX: 10,
      clientY: 120,
      pointerType: 'mouse'
    })

    expect(notCancelled).toBe(false)
  })

  it('does not open the drawer when disabled', async () => {
    render(DrawerSwipeArea, { disabled: true })

    const swipeArea = screen.getByTestId('swipe-area')

    await swipeUp(swipeArea, 120, 40)

    expect(swipeArea).toHaveAttribute('data-closed', '')
  })

  it('respects custom swipeDirection', async () => {
    render(DrawerSwipeArea, { swipeDirection: 'left' })

    const swipeArea = screen.getByTestId('swipe-area')

    await swipeLeft(swipeArea, 120, 40)

    expect(swipeArea).toHaveAttribute('data-open', '')
  })

  it('opens the drawer when swiped with touch events', async () => {
    render(DrawerSwipeArea, { includePopup: true })

    const swipeArea = screen.getByTestId('swipe-area')

    await swipeUp(swipeArea, 120, 40, { input: 'touch' })

    expect(swipeArea).toHaveAttribute('data-open', '')
    expect(screen.getByTestId('popup')).toHaveAttribute('data-open', '')
  })

  it('opens on a quick flick that lands its whole travel in a single touch move', async () => {
    render(DrawerSwipeArea, { includePopup: true })

    const swipeArea = screen.getByTestId('swipe-area')

    fireTouch(swipeArea, 'touchstart', 'touches', { clientX: 10, clientY: 120 })
    await flush()

    fireTouch(swipeArea, 'touchmove', 'touches', { clientX: 10, clientY: 40 })
    await flush()

    fireTouch(swipeArea, 'touchend', 'changedTouches', { clientX: 10, clientY: 40 })
    await flush()

    expect(swipeArea).toHaveAttribute('data-open', '')
    expect(screen.getByTestId('popup')).toHaveAttribute('data-open', '')
  })

  it('applies data-swiping during an active swipe gesture', async () => {
    render(DrawerSwipeArea)

    const swipeArea = screen.getByTestId('swipe-area')

    await swipeUp(swipeArea, 120, 40, {
      beforeRelease() {
        expect(swipeArea).toHaveAttribute('data-swiping', '')
      }
    })

    expect(swipeArea).not.toHaveAttribute('data-swiping')
  })

  it('re-enables outside press dismissal after opening by swipe', async () => {
    render(DrawerSwipeArea, { includePopup: true })

    const swipeArea = screen.getByTestId('swipe-area')

    await swipeUp(swipeArea, 120, 40, { input: 'touch' })

    expect(screen.getByTestId('popup')).toHaveAttribute('data-open', '')

    await pressOutside()

    await waitFor(() => {
      expect(screen.queryByTestId('popup')).toBeNull()
    })

    expect(swipeArea).toHaveAttribute('data-closed', '')
  })

  it('cancels an active opening gesture when the swipe area becomes disabled', async () => {
    const { rerender } = render(DrawerSwipeArea, { includePopup: true })

    const swipeArea = screen.getByTestId('swipe-area')
    await startSwipeOpen(swipeArea)

    expect(screen.getByTestId('popup')).toHaveAttribute('data-open', '')

    await rerender({ includePopup: true, disabled: true })
    expect(swipeArea).toHaveAttribute('data-disabled', '')

    await pressOutside()

    await waitFor(() => {
      expect(screen.queryByTestId('popup')).toBeNull()
    })
  })

  it('keeps the drawer open when the release click follows a mid-gesture disable', async () => {
    const { rerender } = render(DrawerSwipeArea, { includePopup: true })

    const swipeArea = screen.getByTestId('swipe-area')
    await startSwipeOpen(swipeArea)

    expect(screen.getByTestId('popup')).toHaveAttribute('data-open', '')

    await rerender({ includePopup: true, disabled: true })

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
    await flush()

    expect(screen.getByTestId('popup')).toHaveAttribute('data-open', '')

    await pressOutside()

    await waitFor(() => {
      expect(screen.queryByTestId('popup')).toBeNull()
    })
  })

  it('re-enables outside press dismissal after an interrupted swipe-open gesture', async () => {
    render(DrawerSwipeArea, { includePopup: true })

    const swipeArea = screen.getByTestId('swipe-area')

    fireEvent.pointerDown(swipeArea, {
      button: 0,
      buttons: 1,
      pointerId: 1,
      clientX: 10,
      clientY: 120,
      pointerType: 'mouse'
    })
    await flush()
    fireEvent.pointerMove(swipeArea, {
      pointerId: 1,
      clientX: 10,
      clientY: 119,
      buttons: 1,
      pointerType: 'mouse'
    })
    await flush()
    fireEvent.pointerMove(swipeArea, {
      pointerId: 1,
      clientX: 10,
      clientY: 80,
      buttons: 1,
      pointerType: 'mouse'
    })
    await flush()

    expect(screen.getByTestId('popup')).toHaveAttribute('data-open', '')
    expect(swipeArea).toHaveAttribute('data-open', '')

    fireEvent.pointerMove(swipeArea, {
      pointerId: 1,
      clientX: 10,
      clientY: 60,
      buttons: 2,
      pointerType: 'mouse'
    })
    await flush()

    await pressOutside()

    await waitFor(() => {
      expect(screen.queryByTestId('popup')).toBeNull()
    })
    expect(swipeArea).toHaveAttribute('data-closed', '')
  })

  it('re-enables outside press dismissal after a context menu interrupts swipe-open', async () => {
    render(DrawerSwipeArea, { includePopup: true })

    const swipeArea = screen.getByTestId('swipe-area')

    fireEvent.pointerDown(swipeArea, {
      button: 0,
      buttons: 1,
      pointerId: 1,
      clientX: 10,
      clientY: 120,
      pointerType: 'mouse'
    })
    await flush()
    fireEvent.pointerMove(swipeArea, {
      pointerId: 1,
      clientX: 10,
      clientY: 119,
      buttons: 1,
      pointerType: 'mouse'
    })
    await flush()
    fireEvent.pointerMove(swipeArea, {
      pointerId: 1,
      clientX: 10,
      clientY: 80,
      buttons: 1,
      pointerType: 'mouse'
    })
    await flush()

    expect(screen.getByTestId('popup')).toHaveAttribute('data-open', '')

    fireEvent.pointerMove(swipeArea, {
      pointerId: 1,
      clientX: 10,
      clientY: 60,
      buttons: 2,
      pointerType: 'mouse'
    })
    await flush()

    fireEvent.contextMenu(swipeArea, { button: 2, clientX: 10, clientY: 60 })

    await pressOutside()

    await waitFor(() => {
      expect(screen.queryByTestId('popup')).toBeNull()
    })
  })

  it.skipIf(isJSDOM)('uses a size-based swipe threshold by default', async () => {
    render(DrawerSwipeAreaSized)

    const swipeArea = screen.getByTestId('swipe-area')
    const slowSwipe: SwipeOptions = {
      async beforeRelease() {
        const popup = await screen.findByTestId('popup')
        Object.defineProperty(popup, 'offsetHeight', { value: 200, configurable: true })
        await wait(81)
      }
    }

    await swipeUp(swipeArea, 200, 130, slowSwipe)

    expect(swipeArea).toHaveAttribute('data-closed', '')

    await swipeUp(swipeArea, 200, 80, slowSwipe)

    expect(swipeArea).toHaveAttribute('data-open', '')
  })

  it.skipIf(isJSDOM)(
    're-applies backdrop swipe vars when the popup height changes mid-gesture',
    async () => {
      render(DrawerSwipeAreaBackdrop)

      const swipeArea = screen.getByTestId('swipe-area')

      await startSwipeOpen(swipeArea)

      const popup = await screen.findByTestId('popup')
      const backdrop = await screen.findByTestId('backdrop')

      fireEvent.pointerMove(swipeArea, {
        buttons: 1,
        pointerId: 1,
        clientX: 10,
        clientY: 55,
        pointerType: 'mouse'
      })

      await waitFor(() => {
        expect(backdrop.style.getPropertyValue('--drawer-height')).toBe('200px')
      })

      popup.style.height = '300px'

      await waitFor(() => {
        expect(backdrop.style.getPropertyValue('--drawer-height')).toBe('300px')
      })

      fireEvent.pointerUp(swipeArea, {
        pointerId: 1,
        clientX: 10,
        clientY: 55,
        pointerType: 'mouse'
      })
    }
  )
})
