import { Drawer } from '$lib/components/drawer'
import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicDrawer from './fixtures/basic-drawer.svelte'
import DrawerDetachedTriggers from './fixtures/drawer-detached-triggers.svelte'
import DrawerPopupOutsideRoot from './fixtures/drawer-popup-outside-root.svelte'
import DrawerRootSwipeSimple from './fixtures/drawer-root-swipe-simple.svelte'
import DrawerRootSwipeSnap from './fixtures/drawer-root-swipe-snap.svelte'
import DrawerVetoCloseSnapPoints from './fixtures/drawer-veto-close-snap-points.svelte'
import DrawerVetoSwipeCloseSnapPoint from './fixtures/drawer-veto-swipe-close-snap-point.svelte'
import DrawerVetoSwipeClose from './fixtures/drawer-veto-swipe-close.svelte'
import DrawerWithDefaultSnapPoint from './fixtures/drawer-with-default-snap-point.svelte'
import DrawerWithSnapPoints from './fixtures/drawer-with-snap-points.svelte'

async function flush() {
  await Promise.resolve()
}

function mockResizeObserver() {
  const original = globalThis.ResizeObserver
  if (original) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
  return () => {
    if (original) {
      globalThis.ResizeObserver = original
    }
  }
}

function setupSwipeTestEnv() {
  const originalElementFromPoint = document.elementFromPoint
  const restoreResizeObserver = mockResizeObserver()
  return {
    pointAt(element: Element) {
      document.elementFromPoint = () => element
    },
    cleanup() {
      document.elementFromPoint = originalElementFromPoint
      restoreResizeObserver()
    }
  }
}

// Swipe velocity is computed from `event.timeStamp`, a monotonic clock `vi.setSystemTime` cannot
// control, so the intended time is stamped onto the dispatched event instead.
function firePointerAtTime(
  element: HTMLElement,
  type: 'pointerDown' | 'pointerMove' | 'pointerUp',
  init: PointerEventInit,
  time: number
) {
  vi.setSystemTime(new Date(time))
  const event = createEvent[type](element, { ...init, bubbles: true, pointerType: 'mouse' })
  Object.defineProperty(event, 'timeStamp', { value: time, configurable: true })
  fireEvent(element, event)
}

async function simulateTimedRightSwipe(
  element: HTMLElement,
  startX: number,
  endX: number,
  startTime: number,
  moveTime: number,
  endTime: number
) {
  firePointerAtTime(
    element,
    'pointerDown',
    { button: 0, buttons: 1, pointerId: 1, clientX: startX, clientY: 100 },
    startTime
  )
  await flush()
  firePointerAtTime(
    element,
    'pointerMove',
    { pointerId: 1, buttons: 1, clientX: startX + 1, clientY: 100 },
    moveTime
  )
  await flush()
  firePointerAtTime(
    element,
    'pointerMove',
    { pointerId: 1, buttons: 1, clientX: endX, clientY: 100 },
    endTime - 1
  )
  await flush()
  firePointerAtTime(element, 'pointerUp', { pointerId: 1, clientX: endX, clientY: 100 }, endTime)
  await flush()
}

async function simulateTimedDownSwipe(
  element: HTMLElement,
  startY: number,
  endY: number,
  startTime: number,
  moveTime: number,
  endTime: number,
  settleTime?: number
) {
  const resolvedSettleTime =
    settleTime !== undefined && Number.isFinite(settleTime) ? settleTime : null
  const settleY = endY - 1

  firePointerAtTime(
    element,
    'pointerDown',
    { button: 0, buttons: 1, pointerId: 1, clientX: 100, clientY: startY },
    startTime
  )
  await flush()
  firePointerAtTime(
    element,
    'pointerMove',
    { pointerId: 1, buttons: 1, clientX: 100, clientY: startY + 1 },
    moveTime
  )
  await flush()
  if (resolvedSettleTime !== null) {
    firePointerAtTime(
      element,
      'pointerMove',
      { pointerId: 1, buttons: 1, clientX: 100, clientY: settleY },
      resolvedSettleTime
    )
    await flush()
  }
  firePointerAtTime(
    element,
    'pointerMove',
    { pointerId: 1, buttons: 1, clientX: 100, clientY: endY },
    endTime - 1
  )
  await flush()
  firePointerAtTime(element, 'pointerUp', { pointerId: 1, clientX: 100, clientY: endY }, endTime)
  await flush()
}

type TimedSwipeStep = { type: 'down' | 'move' | 'up'; x: number; y: number; time: number }

async function simulateTimedSwipe(element: HTMLElement, steps: TimedSwipeStep[]) {
  for (const step of steps) {
    const baseEvent = { pointerId: 1, clientX: step.x, clientY: step.y }
    if (step.type === 'down') {
      firePointerAtTime(element, 'pointerDown', { ...baseEvent, button: 0, buttons: 1 }, step.time)
    } else if (step.type === 'move') {
      firePointerAtTime(element, 'pointerMove', { ...baseEvent, buttons: 1 }, step.time)
    } else {
      firePointerAtTime(element, 'pointerUp', baseEvent, step.time)
    }
    await flush()
  }
}

describe('<Drawer.Root />', () => {
  beforeAll(() => {
    // PointerEvent is not fully implemented in jsdom, so fireEvent.pointer* ignores options.
    // https://github.com/jsdom/jsdom/issues/2527
    vi.stubGlobal('PointerEvent', window.MouseEvent)
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it.skipIf(isJSDOM)('uses a size-based swipe threshold', async () => {
    const handleOpenChange = vi.fn()
    render(DrawerRootSwipeSimple, {
      swipeDirection: 'right',
      mode: 'controlled',
      onOpenChange: handleOpenChange
    })
    await flush()

    const viewport = screen.getByTestId('viewport')
    const popup = screen.getByTestId('popup')
    popup.style.width = '200px'
    await flush()

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => popup

    try {
      await simulateTimedRightSwipe(viewport, 100, 190, 1000, 1100, 1600)
      expect(handleOpenChange).not.toHaveBeenCalled()

      await simulateTimedRightSwipe(viewport, 100, 220, 2000, 2100, 2600)
      expect(handleOpenChange).toHaveBeenCalledWith(false)
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('throws a descriptive error when the root context is missing', () => {
    expect(() => render(DrawerPopupOutsideRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <Drawer.Root>.'
    )
  })

  it('supports detached triggers with handles', async () => {
    const user = userEvent.setup()
    const handle = new Drawer.Handle<number>()
    render(DrawerDetachedTriggers, { handle })

    expect(screen.queryByTestId('payload')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Trigger 1' }))
    await waitFor(() => {
      expect(screen.getByTestId('payload')).toHaveTextContent('1')
    })

    await user.click(screen.getByText('Close'))
    await waitFor(() => {
      expect(screen.queryByTestId('payload')).toBeNull()
    })

    await user.click(screen.getByRole('button', { name: 'Trigger 2' }))
    await waitFor(() => {
      expect(screen.getByTestId('payload')).toHaveTextContent('2')
    })
  })

  it('synchronizes trigger aria-controls with the popup id', async () => {
    const user = userEvent.setup()
    render(BasicDrawer, { open: false })

    const trigger = screen.getByRole('button', { name: 'Open Drawer' })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).not.toBeNull()
    })

    const popup = screen.getByRole('dialog')
    expect(trigger.getAttribute('aria-controls')).toBe(popup.getAttribute('id'))
  })

  it('resets the active snap point when closing', async () => {
    const user = userEvent.setup()
    render(DrawerWithSnapPoints)

    expect(screen.getByTestId('active-snap')).toHaveTextContent('100px')

    await user.click(screen.getByTestId('expand'))
    expect(screen.getByTestId('active-snap')).toHaveTextContent('1')

    await user.click(screen.getByTestId('close'))

    await waitFor(() => {
      expect(screen.getByTestId('active-snap')).toHaveTextContent('100px')
    })
  })

  it('resets to the initial snap point when provided', async () => {
    const user = userEvent.setup()
    render(DrawerWithDefaultSnapPoint)

    await waitFor(() => {
      expect(screen.getByTestId('active-snap')).toHaveTextContent('300px')
    })

    await user.click(screen.getByTestId('close'))

    await waitFor(() => {
      expect(screen.getByTestId('active-snap')).toHaveTextContent('300px')
    })
  })

  it('does not reset the snap point when a close is vetoed', async () => {
    render(DrawerVetoCloseSnapPoints)
    await flush()

    expect(screen.getByTestId('active-snap')).toHaveTextContent('1')

    fireEvent.click(screen.getByTestId('close'))
    await flush()

    expect(screen.getByTestId('active-snap')).toHaveTextContent('1')
  })

  it.skipIf(isJSDOM)('clears swipe-dismiss styles when a swipe close is vetoed', async () => {
    const env = setupSwipeTestEnv()
    try {
      render(DrawerVetoSwipeClose)
      await flush()

      const viewport = screen.getByTestId('viewport')
      const popup = screen.getByTestId('popup')
      const backdrop = screen.getByTestId('backdrop')

      Object.defineProperty(popup, 'offsetHeight', { value: 200, configurable: true })
      env.pointAt(popup)

      await simulateTimedDownSwipe(viewport, 100, 250, 1000, 1010, 1040)

      await waitFor(() => expect(popup).not.toHaveAttribute('data-swipe-dismiss'))
      expect(backdrop).not.toHaveAttribute('data-swipe-dismiss')
      expect(popup).not.toHaveAttribute('data-ending-style')
      expect(backdrop).not.toHaveAttribute('data-swiping')
      expect(popup).toHaveAttribute('data-open', '')
      expect(popup.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px')
    } finally {
      env.cleanup()
    }
  })

  it.skipIf(isJSDOM)(
    'does not dismiss a controlled drawer via swipe when open is always true',
    async () => {
      const handleOpenChange = vi.fn()
      const env = setupSwipeTestEnv()
      try {
        render(DrawerRootSwipeSimple, {
          swipeDirection: 'down',
          mode: 'alwaysOpen',
          onOpenChange: handleOpenChange
        })
        await flush()

        const viewport = screen.getByTestId('viewport')
        const popup = screen.getByTestId('popup')
        const backdrop = screen.getByTestId('backdrop')
        Object.defineProperty(popup, 'offsetHeight', { value: 200, configurable: true })
        env.pointAt(popup)

        await simulateTimedDownSwipe(viewport, 100, 250, 1000, 1010, 1040)

        expect(handleOpenChange).toHaveBeenCalledWith(false)

        await waitFor(() => expect(popup).not.toHaveAttribute('data-swipe-dismiss'))
        expect(backdrop).not.toHaveAttribute('data-swipe-dismiss')
        expect(popup).not.toHaveAttribute('data-ending-style')
        expect(popup).toHaveAttribute('data-open', '')
      } finally {
        env.cleanup()
      }
    }
  )

  it.skipIf(isJSDOM)(
    'resets the snap point to the initial value when a swipe close is accepted by the parent',
    async () => {
      const env = setupSwipeTestEnv()
      try {
        render(DrawerRootSwipeSnap, {
          initialSnapPoint: '300px',
          showActiveSnap: true,
          swipeDirection: 'down'
        })
        await flush()

        const viewport = screen.getByTestId('viewport')
        const popup = screen.getByTestId('popup')
        env.pointAt(popup)

        fireEvent.click(screen.getByTestId('snap-to-first'))
        await flush()
        expect(screen.getByTestId('active-snap').textContent).toBe('100px')

        await simulateTimedDownSwipe(viewport, 100, 260, 1000, 1010, 1040)
        expect(screen.getByTestId('active-snap').textContent).toBe('300px')
      } finally {
        env.cleanup()
      }
    }
  )

  it.skipIf(isJSDOM)(
    'restores snap point and swipe offsets when a swipe close is vetoed',
    async () => {
      const env = setupSwipeTestEnv()
      try {
        render(DrawerVetoSwipeCloseSnapPoint)
        await flush()

        const viewport = screen.getByTestId('viewport')
        const popup = screen.getByTestId('popup')
        env.pointAt(popup)

        await simulateTimedDownSwipe(viewport, 100, 260, 1000, 1010, 1040)

        await waitFor(() => expect(popup).not.toHaveAttribute('data-swipe-dismiss'))
        expect(screen.getByTestId('active-snap')).toHaveTextContent('100px')
        expect(popup).toHaveAttribute('data-open', '')
        expect(popup).not.toHaveAttribute('data-ending-style')
        expect(popup.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px')
      } finally {
        env.cleanup()
      }
    }
  )

  it.skipIf(isJSDOM)(
    'damps active snap point overshoot after the swipe direction is established',
    async () => {
      const env = setupSwipeTestEnv()
      try {
        render(DrawerRootSwipeSnap, {
          initialSnapPoint: 1,
          snapPoints: ['100px', 1],
          withBackdrop: false,
          viewportHeight: 400,
          popupHeight: 400,
          swipeDirection: 'down'
        })

        const viewport = screen.getByTestId('viewport')
        const popup = screen.getByTestId('popup')
        env.pointAt(popup)

        fireEvent.pointerDown(viewport, {
          button: 0,
          buttons: 1,
          pointerId: 1,
          clientX: 100,
          clientY: 200,
          bubbles: true,
          pointerType: 'mouse'
        })
        await flush()
        fireEvent.pointerMove(viewport, {
          buttons: 1,
          pointerId: 1,
          clientX: 100,
          clientY: 200,
          bubbles: true,
          pointerType: 'mouse'
        })
        await flush()
        fireEvent.pointerMove(viewport, {
          buttons: 1,
          pointerId: 1,
          clientX: 100,
          clientY: 100,
          bubbles: true,
          pointerType: 'mouse'
        })
        await flush()
        fireEvent.pointerMove(viewport, {
          buttons: 1,
          pointerId: 1,
          clientX: 100,
          clientY: 50,
          bubbles: true,
          pointerType: 'mouse'
        })
        await flush()

        expect(popup.style.transform).toBe('')
        expect(
          Number.parseFloat(popup.style.getPropertyValue('--drawer-swipe-movement-y'))
        ).toBeCloseTo(-Math.sqrt(150))
      } finally {
        env.cleanup()
      }
    }
  )

  it.skipIf(isJSDOM)(
    'allows dragging past a snap point when snapToSequentialPoints is enabled',
    async () => {
      const env = setupSwipeTestEnv()
      try {
        render(DrawerRootSwipeSnap, {
          initialSnapPoint: '100px',
          snapToSequentialPoints: true,
          withBackdrop: false,
          showActiveSnap: true,
          swipeDirection: 'down'
        })
        await flush()

        const viewport = screen.getByTestId('viewport')
        const popup = screen.getByTestId('popup')
        env.pointAt(popup)

        await simulateTimedDownSwipe(viewport, 500, 50, 1000, 1010, 1040)
        expect(screen.getByTestId('active-snap').textContent).toBe('1')
      } finally {
        env.cleanup()
      }
    }
  )

  it.skipIf(isJSDOM)(
    'advances to the next snap point on fast flicks when snapToSequentialPoints is enabled',
    async () => {
      const env = setupSwipeTestEnv()
      try {
        render(DrawerRootSwipeSnap, {
          initialSnapPoint: '100px',
          snapToSequentialPoints: true,
          withBackdrop: false,
          showActiveSnap: true,
          swipeDirection: 'down'
        })
        await flush()

        const viewport = screen.getByTestId('viewport')
        const popup = screen.getByTestId('popup')
        env.pointAt(popup)

        await simulateTimedDownSwipe(viewport, 500, 460, 2000, 2010, 2050)
        expect(screen.getByTestId('active-snap').textContent).toBe('300px')
      } finally {
        env.cleanup()
      }
    }
  )

  it.skipIf(isJSDOM)('keeps the drawer open on low-velocity swipes near a snap point', async () => {
    const handleOpenChange = vi.fn()
    const env = setupSwipeTestEnv()
    try {
      render(DrawerRootSwipeSnap, {
        initialSnapPoint: '100px',
        withBackdrop: false,
        showActiveSnap: true,
        swipeDirection: 'down',
        onOpenChange: handleOpenChange
      })
      await flush()

      const viewport = screen.getByTestId('viewport')
      const popup = screen.getByTestId('popup')
      env.pointAt(popup)

      await simulateTimedDownSwipe(viewport, 100, 120, 1000, 1005, 1035, 1015)

      expect(handleOpenChange).not.toHaveBeenCalledWith(false)
      expect(screen.getByTestId('active-snap').textContent).toBe('100px')
    } finally {
      env.cleanup()
    }
  })

  it.skipIf(isJSDOM)(
    'keeps the drawer open when the release velocity reverses during an upward swipe',
    async () => {
      const handleOpenChange = vi.fn()
      const env = setupSwipeTestEnv()
      try {
        render(DrawerRootSwipeSnap, {
          initialSnapPoint: '100px',
          withBackdrop: false,
          showActiveSnap: true,
          swipeDirection: 'down',
          onOpenChange: handleOpenChange
        })
        await flush()

        const viewport = screen.getByTestId('viewport')
        const popup = screen.getByTestId('popup')
        env.pointAt(popup)

        await simulateTimedSwipe(viewport, [
          { type: 'down', x: 100, y: 300, time: 1000 },
          { type: 'move', x: 100, y: 299, time: 1003 },
          { type: 'move', x: 100, y: 120, time: 1010 },
          { type: 'move', x: 100, y: 140, time: 1015 },
          { type: 'up', x: 100, y: 140, time: 1025 }
        ])

        expect(handleOpenChange).not.toHaveBeenCalledWith(false)
      } finally {
        env.cleanup()
      }
    }
  )
})
