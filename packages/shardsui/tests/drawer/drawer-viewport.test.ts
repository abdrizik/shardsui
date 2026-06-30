import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import { createTouch, fireTouch as dispatchTouch, isJSDOM } from '../test-utils'
import DrawerCombobox from './fixtures/drawer-combobox.svelte'
import DrawerScroll from './fixtures/drawer-scroll.svelte'
import DrawerSnapPointsDismiss from './fixtures/drawer-snap-points-dismiss.svelte'
import DrawerTwoScroll from './fixtures/drawer-two-scroll.svelte'
import DrawerViewportContentButton from './fixtures/drawer-viewport-content-button.svelte'
import DrawerViewportContentTarget from './fixtures/drawer-viewport-content-target.svelte'
import DrawerViewportInteractive from './fixtures/drawer-viewport-interactive.svelte'
import DrawerViewportPopupContent from './fixtures/drawer-viewport-popup-content.svelte'
import DrawerViewportRange from './fixtures/drawer-viewport-range.svelte'
import DrawerViewportScroll from './fixtures/drawer-viewport-scroll.svelte'
import DrawerViewportSelectionInput from './fixtures/drawer-viewport-selection-input.svelte'
import NestedDownDrawer from './fixtures/nested-down-drawer.svelte'

function fireTouch(
  element: Element,
  type: 'touchstart' | 'touchmove' | 'touchend',
  key: 'touches' | 'changedTouches',
  point: { clientX: number; clientY: number }
): boolean {
  return dispatchTouch(element, type, { [key]: [createTouch(element, point)] })
}

function fireNonCancelableTouchMove(
  element: Element,
  point: { clientX: number; clientY: number }
): boolean {
  return dispatchTouch(element, 'touchmove', {
    touches: [createTouch(element, point)],
    cancelable: false
  })
}

function advanceRealClock(ms: number) {
  const end = performance.now() + ms
  while (performance.now() < end) {
    /* spin */
  }
}

async function flush() {
  await Promise.resolve()
}

describe('<Drawer.Viewport />', () => {
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

  it('clears text selection on swipe start', async () => {
    render(DrawerViewportContentTarget, { swipeDirection: 'down' })

    const text = screen.getByTestId('text')
    expect(text.firstChild).toBeTruthy()

    const selection = window.getSelection()
    expect(selection).not.toBeNull()
    if (!selection || !text.firstChild) return

    const range = document.createRange()
    range.setStart(text.firstChild, 0)
    range.setEnd(text.firstChild, 5)
    selection.removeAllRanges()
    selection.addRange(range)
    expect(selection.isCollapsed).toBe(false)

    const popup = screen.getByTestId('popup')
    const viewport = screen.getByTestId('viewport')

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => popup

    try {
      fireEvent.pointerDown(viewport, {
        button: 0,
        buttons: 1,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
        pointerType: 'mouse'
      })
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }

    expect(selection.rangeCount).toBe(0)
  })

  it('does not clear text selection on touch swipe start', async () => {
    render(DrawerViewportContentTarget, { swipeDirection: 'down' })

    const text = screen.getByTestId('text')
    const selection = window.getSelection()
    if (!selection || !text.firstChild) return

    const range = document.createRange()
    range.setStart(text.firstChild, 0)
    range.setEnd(text.firstChild, 5)
    selection.removeAllRanges()
    selection.addRange(range)
    expect(selection.isCollapsed).toBe(false)

    const popup = screen.getByTestId('popup')
    const viewport = screen.getByTestId('viewport')

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => popup

    try {
      fireTouch(viewport, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }

    expect(selection.rangeCount).toBe(1)
  })

  it('starts touch swipes from interactive elements', async () => {
    render(DrawerViewportInteractive)

    const button = screen.getByTestId('button')
    const backdrop = screen.getByTestId('backdrop')

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => button

    try {
      fireTouch(button, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      await flush()
      fireTouch(button, 'touchmove', 'touches', { clientX: 0, clientY: 40 })
      await flush()

      expect(backdrop).toHaveAttribute('data-swiping', '')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('clears the backdrop data-swiping attribute when the drawer unmounts mid-swipe', async () => {
    const { unmount } = render(DrawerViewportInteractive)

    const button = screen.getByTestId('button')
    const backdrop = screen.getByTestId('backdrop')

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => button

    try {
      fireTouch(button, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      await flush()
      fireTouch(button, 'touchmove', 'touches', { clientX: 0, clientY: 40 })
      await flush()
      expect(backdrop).toHaveAttribute('data-swiping', '')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }

    unmount()

    expect(backdrop).not.toHaveAttribute('data-swiping')
  })

  it('uses the event target for non-keyboard touch scroll arbitration', async () => {
    render(DrawerTwoScroll)

    const button = screen.getByTestId('button')
    const scroll = screen.getByTestId('scroll')
    const otherScroll = screen.getByTestId('other-scroll')
    const backdrop = screen.getByTestId('backdrop')

    Object.defineProperty(scroll, 'scrollHeight', { value: 160, configurable: true })
    Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
    scroll.scrollTop = 0
    Object.defineProperty(otherScroll, 'scrollHeight', { value: 160, configurable: true })
    Object.defineProperty(otherScroll, 'clientHeight', { value: 40, configurable: true })
    otherScroll.scrollTop = 40

    const originalElementFromPoint = document.elementFromPoint
    let hitTestCount = 0
    document.elementFromPoint = () => {
      hitTestCount += 1
      return hitTestCount === 1 ? otherScroll : button
    }

    try {
      fireTouch(button, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      fireTouch(button, 'touchmove', 'touches', { clientX: 0, clientY: 40 })
      await flush()
      expect(backdrop).toHaveAttribute('data-swiping', '')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('allows clicks on non-interactive elements without data-shards-ui-swipe-ignore', async () => {
    const handleClick = vi.fn()
    const handleOpenChange = vi.fn()

    render(DrawerViewportContentTarget, {
      onOpenChange: handleOpenChange,
      onTargetClick: handleClick
    })

    const target = screen.getByTestId('target')
    const backdrop = screen.getByTestId('backdrop')

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => target

    try {
      fireTouch(target, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      fireEvent.pointerDown(target, { pointerType: 'touch' })
      fireTouch(target, 'touchend', 'changedTouches', { clientX: 0, clientY: 0 })
      fireEvent.click(target, { detail: 1 })
      await flush()
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleOpenChange).not.toHaveBeenCalled()
    expect(backdrop).not.toHaveAttribute('data-swiping')
  })

  it('does not start touch swipes from elements with data-shards-ui-swipe-ignore', async () => {
    const handleOpenChange = vi.fn()

    render(DrawerViewportContentTarget, {
      onOpenChange: handleOpenChange,
      swipeIgnore: true
    })

    const target = screen.getByTestId('target')
    const backdrop = screen.getByTestId('backdrop')

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => target

    try {
      fireTouch(target, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      fireTouch(target, 'touchmove', 'touches', { clientX: 0, clientY: 40 })
      fireTouch(target, 'touchend', 'changedTouches', { clientX: 0, clientY: 40 })
      await flush()
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }

    expect(backdrop).not.toHaveAttribute('data-swiping')
    expect(handleOpenChange).not.toHaveBeenCalled()
  })

  it('does not prevent native touch scrolling in portaled descendants', async () => {
    render(DrawerViewportInteractive)

    const portaledPopup = document.createElement('div')
    portaledPopup.setAttribute('data-testid', 'portaled-popup')
    document.body.append(portaledPopup)

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => portaledPopup

    try {
      fireTouch(portaledPopup, 'touchstart', 'touches', { clientX: 0, clientY: 0 })

      const notPrevented = dispatchTouch(portaledPopup, 'touchmove', {
        touches: [createTouch(portaledPopup, { clientX: 0, clientY: 40 })]
      })

      expect(notPrevented).toBe(true)
    } finally {
      document.elementFromPoint = originalElementFromPoint
      portaledPopup.remove()
    }
  })

  it.skipIf(isJSDOM)(
    'allows touch gestures on a portaled combobox popup without starting drawer swipe',
    async () => {
      const handleOpenChange = vi.fn()
      render(DrawerCombobox, { onOpenChange: handleOpenChange })

      const listbox = await screen.findByRole('listbox', { hidden: true })
      const backdrop = screen.getByTestId('backdrop')
      await waitFor(() => {
        expect(listbox.scrollHeight).toBeGreaterThan(listbox.clientHeight)
      })

      const originalElementFromPoint = document.elementFromPoint
      document.elementFromPoint = () => listbox

      try {
        const rect = listbox.getBoundingClientRect()
        fireTouch(listbox, 'touchstart', 'touches', {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height - 8
        })
        fireTouch(listbox, 'touchmove', 'touches', {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2
        })
        fireTouch(listbox, 'touchmove', 'touches', {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + 8
        })
        fireTouch(listbox, 'touchend', 'changedTouches', {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + 8
        })
        await flush()

        expect(backdrop).not.toHaveAttribute('data-swiping')
        expect(handleOpenChange).not.toHaveBeenCalled()
        await waitFor(() => expect(listbox).toBeVisible())
      } finally {
        document.elementFromPoint = originalElementFromPoint
      }
    }
  )

  it('does not start non-touch swipes from Drawer.Content', async () => {
    render(DrawerViewportContentTarget, { swipeDirection: 'down' })

    const target = screen.getByTestId('target')
    const backdrop = screen.getByTestId('backdrop')

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => target

    try {
      fireEvent.pointerDown(target, {
        button: 0,
        buttons: 1,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
        pointerType: 'mouse'
      })
      await flush()
      expect(backdrop).not.toHaveAttribute('data-swiping')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('does not jump when touch starts outside the popup and then enters it', async () => {
    render(DrawerViewportPopupContent, { swipeDirection: 'down' })

    const viewport = screen.getByTestId('viewport')
    const popup = screen.getByTestId('popup')
    const backdrop = screen.getByTestId('backdrop')
    Object.defineProperty(popup, 'offsetHeight', { value: 200, configurable: true })

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = ((_x: number, y: number) =>
      y < 100 ? viewport : popup) as typeof document.elementFromPoint

    try {
      fireTouch(viewport, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      fireTouch(viewport, 'touchmove', 'touches', { clientX: 0, clientY: 120 })
      await flush()

      expect(backdrop).toHaveAttribute('data-swiping', '')
      expect(Number.parseFloat(popup.style.getPropertyValue('--drawer-swipe-movement-y'))).toBe(0)
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('dismisses when touch starts outside the popup, then continues swiping down inside it', async () => {
    const handleOpenChange = vi.fn()
    render(DrawerViewportPopupContent, {
      swipeDirection: 'down',
      onOpenChange: handleOpenChange
    })

    const viewport = screen.getByTestId('viewport')
    const popup = screen.getByTestId('popup')
    Object.defineProperty(popup, 'offsetHeight', { value: 200, configurable: true })

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = ((_x: number, y: number) =>
      y < 100 ? viewport : popup) as typeof document.elementFromPoint

    try {
      fireTouch(viewport, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      fireTouch(viewport, 'touchmove', 'touches', { clientX: 0, clientY: 120 })
      // Chrome coarsens `TouchEvent.timeStamp` to 0.1ms, so two events dispatched back to back can
      // carry the same value and compute a zero velocity. Spin the clock to separate them.
      advanceRealClock(1)
      fireTouch(viewport, 'touchmove', 'touches', { clientX: 0, clientY: 170 })
      fireTouch(viewport, 'touchend', 'changedTouches', { clientX: 0, clientY: 170 })
      await flush()
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }

    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('treats pen interactions on Drawer.Content as non-touch swipes', async () => {
    render(DrawerViewportContentButton)

    const button = screen.getByTestId('button')
    const backdrop = screen.getByTestId('backdrop')

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => button

    try {
      const pointerDownEvent = new Event('pointerdown', {
        bubbles: true,
        cancelable: true
      }) as PointerEvent

      Object.defineProperties(pointerDownEvent, {
        button: { value: 0 },
        buttons: { value: 1 },
        pointerId: { value: 1 },
        pointerType: { value: 'pen' },
        clientX: { value: 0 },
        clientY: { value: 0 }
      })

      fireEvent(button, pointerDownEvent)

      fireTouch(button, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      await flush()

      expect(backdrop).not.toHaveAttribute('data-swiping')

      const dispatched = fireTouch(button, 'touchmove', 'touches', { clientX: 0, clientY: 10 })

      expect(dispatched).toBe(true)
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('does not mark nested drawers as swiping until movement passes the threshold', async () => {
    render(NestedDownDrawer)

    const parentPopup = screen.getByTestId('parent-popup')
    const childPopup = screen.getByTestId('child-popup')
    const parentViewport = screen.getByTestId('parent-viewport')
    const childViewport = screen.getByTestId('child-viewport')
    const button = screen.getByTestId('child-button')
    Object.defineProperty(childPopup, 'offsetHeight', { value: 200, configurable: true })

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => childPopup

    try {
      fireTouch(button, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      await flush()

      expect(parentViewport).not.toHaveAttribute('data-nested-dialog-open')
      expect(childViewport).not.toHaveAttribute('data-nested-dialog-open')
      expect(parentPopup).not.toHaveAttribute('data-nested-drawer-swiping')

      fireTouch(button, 'touchmove', 'touches', { clientX: 0, clientY: 5 })
      fireTouch(button, 'touchmove', 'touches', { clientX: 0, clientY: 20 })
      await flush()

      expect(parentPopup).toHaveAttribute('data-nested-drawer-swiping', '')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('clears nested swiping when a nested drawer swipe is reversed before release', async () => {
    render(NestedDownDrawer)

    const parentPopup = screen.getByTestId('parent-popup')
    const childPopup = screen.getByTestId('child-popup')
    const button = screen.getByTestId('child-button')
    Object.defineProperty(childPopup, 'offsetHeight', { value: 200, configurable: true })

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => childPopup

    try {
      fireTouch(button, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      await flush()

      fireTouch(button, 'touchmove', 'touches', { clientX: 0, clientY: 5 })
      fireTouch(button, 'touchmove', 'touches', { clientX: 0, clientY: 20 })
      await flush()

      expect(parentPopup).toHaveAttribute('data-nested-drawer-swiping', '')

      fireTouch(button, 'touchmove', 'touches', { clientX: 0, clientY: 0 })
      await flush()

      expect(parentPopup).not.toHaveAttribute('data-nested-drawer-swiping')
      expect(parentPopup.style.getPropertyValue('--drawer-swipe-progress')).toBe('0')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('prevents touchmove at scroll top when swiping down on scrollable content', async () => {
    render(DrawerViewportScroll, { swipeDirection: 'down', variant: 'inner' })

    const scroll = screen.getByTestId('scroll')
    Object.defineProperty(scroll, 'scrollHeight', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
    scroll.scrollTop = 0

    fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
    const dispatched = fireTouch(scroll, 'touchmove', 'touches', { clientX: 0, clientY: 10 })

    expect(dispatched).toBe(false)
  })

  it('prevents touchmove at scroll bottom when swiping up on scrollable content', async () => {
    render(DrawerViewportScroll, { swipeDirection: 'up', variant: 'inner' })

    const scroll = screen.getByTestId('scroll')
    Object.defineProperty(scroll, 'scrollHeight', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
    scroll.scrollTop = 80

    fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 20 })
    const dispatched = fireTouch(scroll, 'touchmove', 'touches', { clientX: 0, clientY: 10 })

    expect(dispatched).toBe(false)
  })

  it('prevents touchmove when a scrollable ancestor wraps the popup at the top', async () => {
    render(DrawerViewportScroll, { swipeDirection: 'down', variant: 'ancestor' })

    const scroll = screen.getByTestId('scroll')
    Object.defineProperty(scroll, 'scrollHeight', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
    scroll.scrollTop = 0

    const item = screen.getByTestId('item')
    fireTouch(item, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
    const dispatched = fireTouch(item, 'touchmove', 'touches', { clientX: 0, clientY: 10 })

    expect(dispatched).toBe(false)
  })

  it('prevents touchmove when there is no scroll container', async () => {
    render(DrawerViewportScroll, { swipeDirection: 'down', variant: 'none' })

    const popup = screen.getByTestId('popup')
    fireTouch(popup, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
    const dispatched = fireTouch(popup, 'touchmove', 'touches', { clientX: 0, clientY: 10 })

    expect(dispatched).toBe(false)
  })

  it('does not block touchmove on native range inputs', async () => {
    render(DrawerViewportRange, { variant: 'native' })

    const range = screen.getByTestId('range')
    const backdrop = screen.getByTestId('backdrop')

    fireTouch(range, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
    const dispatched = fireTouch(range, 'touchmove', 'touches', { clientX: 20, clientY: 0 })

    await waitFor(() => {
      expect(dispatched).toBe(true)
      expect(backdrop).not.toHaveAttribute('data-swiping')
    })
  })

  it('does not block touchmove on slider thumb range inputs', async () => {
    render(DrawerViewportRange, { variant: 'slider' })

    const sliderInput = screen.getByRole('slider')
    const backdrop = screen.getByTestId('backdrop')

    fireTouch(sliderInput, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
    const dispatched = fireTouch(sliderInput, 'touchmove', 'touches', { clientX: 20, clientY: 0 })

    await flush()

    expect(dispatched).toBe(true)
    expect(backdrop).not.toHaveAttribute('data-swiping')
  })

  it('does not start swiping when adjusting input selection handles', async () => {
    render(DrawerViewportSelectionInput)

    const input = screen.getByTestId('input') as HTMLInputElement
    const popup = screen.getByTestId('popup')
    const backdrop = screen.getByTestId('backdrop')

    input.focus()
    input.setSelectionRange(0, 5)

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => popup

    try {
      fireTouch(popup, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      expect(backdrop).not.toHaveAttribute('data-swiping')

      const dispatched = fireTouch(popup, 'touchmove', 'touches', { clientX: 0, clientY: 10 })
      await flush()

      expect(dispatched).toBe(true)
      expect(backdrop).not.toHaveAttribute('data-swiping')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('does not start swiping when adjusting textarea selection handles', async () => {
    render(DrawerViewportSelectionInput, { variant: 'textarea' })

    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement
    const popup = screen.getByTestId('popup')
    const backdrop = screen.getByTestId('backdrop')

    textarea.focus()
    textarea.setSelectionRange(0, 5)

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => popup

    try {
      fireTouch(popup, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      expect(backdrop).not.toHaveAttribute('data-swiping')

      const dispatched = fireTouch(popup, 'touchmove', 'touches', { clientX: 0, clientY: 10 })
      await flush()

      expect(dispatched).toBe(true)
      expect(backdrop).not.toHaveAttribute('data-swiping')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('does not start swiping when adjusting contenteditable selection handles', async () => {
    render(DrawerViewportSelectionInput, { variant: 'contenteditable' })

    const editable = screen.getByTestId('editable')
    const popup = screen.getByTestId('popup')
    const backdrop = screen.getByTestId('backdrop')
    const selection = window.getSelection()
    expect(selection).not.toBeNull()
    expect(editable.firstChild).toBeTruthy()
    if (!selection || !editable.firstChild) return

    editable.focus()
    const range = document.createRange()
    range.setStart(editable.firstChild, 0)
    range.setEnd(editable.firstChild, 5)
    selection.removeAllRanges()
    selection.addRange(range)

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => popup

    try {
      fireTouch(popup, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      expect(backdrop).not.toHaveAttribute('data-swiping')

      const dispatched = fireTouch(popup, 'touchmove', 'touches', { clientX: 0, clientY: 10 })
      await flush()

      expect(dispatched).toBe(true)
      expect(backdrop).not.toHaveAttribute('data-swiping')
    } finally {
      document.elementFromPoint = originalElementFromPoint
      selection.removeAllRanges()
    }
  })

  it('does not start swiping when adjusting regular text selection handles', async () => {
    render(DrawerViewportSelectionInput, { variant: 'text' })

    const text = screen.getByTestId('text')
    const popup = screen.getByTestId('popup')
    const backdrop = screen.getByTestId('backdrop')
    const selection = window.getSelection()
    expect(selection).not.toBeNull()
    expect(text.firstChild).toBeTruthy()
    if (!selection || !text.firstChild) return

    const range = document.createRange()
    range.setStart(text.firstChild, 0)
    range.setEnd(text.firstChild, 5)
    selection.removeAllRanges()
    selection.addRange(range)

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => popup

    try {
      fireTouch(popup, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      expect(backdrop).not.toHaveAttribute('data-swiping')

      const dispatched = fireTouch(popup, 'touchmove', 'touches', { clientX: 0, clientY: 10 })
      await flush()

      expect(dispatched).toBe(true)
      expect(backdrop).not.toHaveAttribute('data-swiping')
    } finally {
      document.elementFromPoint = originalElementFromPoint
      selection.removeAllRanges()
    }
  })

  it('allows touchmove when scrolling down from scroll top', async () => {
    render(DrawerViewportScroll, { swipeDirection: 'down', variant: 'inner' })

    const scroll = screen.getByTestId('scroll')
    Object.defineProperty(scroll, 'scrollHeight', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
    scroll.scrollTop = 0

    fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
    const dispatched = fireTouch(scroll, 'touchmove', 'touches', { clientX: 0, clientY: -10 })

    expect(dispatched).toBe(true)
  })

  it('does not start an opposite-direction swipe from scroll bottom for down drawers with snap points', async () => {
    render(DrawerScroll, { swipeDirection: 'down', axis: 'y', snapPoints: ['100px', 1] })

    const scroll = screen.getByTestId('scroll')
    const backdrop = screen.getByTestId('backdrop')
    Object.defineProperty(scroll, 'scrollHeight', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
    scroll.scrollTop = 80

    fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 40 })
    const moveAllowed = fireTouch(scroll, 'touchmove', 'touches', { clientX: 0, clientY: 20 })
    await flush()

    expect(moveAllowed).toBe(true)
    expect(backdrop).not.toHaveAttribute('data-swiping')
  })

  it('does not start an opposite-direction swipe from scroll right edge for right drawers', async () => {
    render(DrawerScroll, { swipeDirection: 'right', axis: 'x' })

    const scroll = screen.getByTestId('scroll')
    const backdrop = screen.getByTestId('backdrop')
    Object.defineProperty(scroll, 'scrollWidth', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientWidth', { value: 40, configurable: true })
    scroll.scrollLeft = 80

    fireTouch(scroll, 'touchstart', 'touches', { clientX: 40, clientY: 0 })
    const moveAllowed = fireTouch(scroll, 'touchmove', 'touches', { clientX: 20, clientY: 0 })
    await flush()

    expect(moveAllowed).toBe(true)
    expect(backdrop).not.toHaveAttribute('data-swiping')
  })

  it('starts swipe-to-dismiss after a scrollable container reaches the dismiss edge', async () => {
    render(DrawerScroll, { swipeDirection: 'down', axis: 'y' })

    const scroll = screen.getByTestId('scroll')
    const backdrop = screen.getByTestId('backdrop')
    Object.defineProperty(scroll, 'scrollHeight', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
    scroll.scrollTop = 30

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => scroll

    try {
      fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 30 })
      const firstMovePrevented = fireTouch(scroll, 'touchmove', 'touches', {
        clientX: 0,
        clientY: 40
      })

      expect(firstMovePrevented).toBe(true)
      expect(backdrop).not.toHaveAttribute('data-swiping')

      scroll.scrollTop = 0

      const secondMovePrevented = fireTouch(scroll, 'touchmove', 'touches', {
        clientX: 0,
        clientY: 50
      })
      expect(secondMovePrevented).toBe(false)

      await flush()
      expect(backdrop).toHaveAttribute('data-swiping', '')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('dismisses from a top-edge scroll container with a touch swipe down', async () => {
    const handleOpenChange = vi.fn()
    render(DrawerScroll, {
      swipeDirection: 'down',
      axis: 'y',
      onOpenChange: handleOpenChange
    })

    const scroll = screen.getByTestId('scroll')
    const backdrop = screen.getByTestId('backdrop')
    const popup = screen.getByTestId('popup')
    Object.defineProperty(scroll, 'scrollHeight', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
    scroll.scrollTop = 0
    Object.defineProperty(popup, 'offsetHeight', { value: 200, configurable: true })

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => scroll

    try {
      fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      fireTouch(scroll, 'touchmove', 'touches', { clientX: 0, clientY: 140 })

      expect(backdrop).toHaveAttribute('data-swiping', '')

      fireTouch(scroll, 'touchend', 'changedTouches', { clientX: 0, clientY: 140 })
      await flush()
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }

    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('dismisses from a bottom-edge scroll container with a touch swipe up', async () => {
    const handleOpenChange = vi.fn()
    render(DrawerScroll, {
      swipeDirection: 'up',
      axis: 'y',
      onOpenChange: handleOpenChange
    })

    const scroll = screen.getByTestId('scroll')
    const backdrop = screen.getByTestId('backdrop')
    const popup = screen.getByTestId('popup')
    Object.defineProperty(scroll, 'scrollHeight', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
    scroll.scrollTop = 80
    Object.defineProperty(popup, 'offsetHeight', { value: 200, configurable: true })

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => scroll

    try {
      fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 140 })
      fireTouch(scroll, 'touchmove', 'touches', { clientX: 0, clientY: 0 })

      expect(backdrop).toHaveAttribute('data-swiping', '')

      fireTouch(scroll, 'touchend', 'changedTouches', { clientX: 0, clientY: 0 })
      await flush()
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }

    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('dismisses from a left-edge horizontal scroll container with a touch swipe right', async () => {
    const handleOpenChange = vi.fn()
    render(DrawerScroll, {
      swipeDirection: 'right',
      axis: 'x',
      onOpenChange: handleOpenChange
    })

    const scroll = screen.getByTestId('scroll')
    const backdrop = screen.getByTestId('backdrop')
    const popup = screen.getByTestId('popup')
    Object.defineProperty(scroll, 'scrollWidth', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientWidth', { value: 40, configurable: true })
    scroll.scrollLeft = 0
    Object.defineProperty(popup, 'offsetWidth', { value: 200, configurable: true })

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => scroll

    try {
      fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      fireTouch(scroll, 'touchmove', 'touches', { clientX: 140, clientY: 0 })

      expect(backdrop).toHaveAttribute('data-swiping', '')

      fireTouch(scroll, 'touchend', 'changedTouches', { clientX: 140, clientY: 0 })
      await flush()
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }

    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('dismisses from a right-edge horizontal scroll container with a touch swipe left', async () => {
    const handleOpenChange = vi.fn()
    render(DrawerScroll, {
      swipeDirection: 'left',
      axis: 'x',
      onOpenChange: handleOpenChange
    })

    const scroll = screen.getByTestId('scroll')
    const backdrop = screen.getByTestId('backdrop')
    const popup = screen.getByTestId('popup')
    Object.defineProperty(scroll, 'scrollWidth', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientWidth', { value: 40, configurable: true })
    scroll.scrollLeft = 80
    Object.defineProperty(popup, 'offsetWidth', { value: 200, configurable: true })

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => scroll

    try {
      fireTouch(scroll, 'touchstart', 'touches', { clientX: 140, clientY: 0 })
      fireTouch(scroll, 'touchmove', 'touches', { clientX: 0, clientY: 0 })

      expect(backdrop).toHaveAttribute('data-swiping', '')

      fireTouch(scroll, 'touchend', 'changedTouches', { clientX: 0, clientY: 0 })
      await flush()
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }

    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('allows horizontal swipe dismiss from a vertical scroll container', async () => {
    render(DrawerScroll, { swipeDirection: 'right', axis: 'y' })

    const scroll = screen.getByTestId('scroll')
    const backdrop = screen.getByTestId('backdrop')
    Object.defineProperty(scroll, 'scrollHeight', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
    scroll.scrollTop = 20

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => scroll

    try {
      fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 20 })
      fireTouch(scroll, 'touchmove', 'touches', { clientX: 20, clientY: 20 })
      await flush()

      expect(backdrop).toHaveAttribute('data-swiping', '')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('does not lock vertical swipe after minor cross-axis jitter in down drawers', async () => {
    render(DrawerScroll, { swipeDirection: 'down', axis: 'x' })

    const scroll = screen.getByTestId('scroll')
    const backdrop = screen.getByTestId('backdrop')
    Object.defineProperty(scroll, 'scrollWidth', { value: 120, configurable: true })
    Object.defineProperty(scroll, 'clientWidth', { value: 40, configurable: true })
    scroll.scrollLeft = 0

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => scroll

    try {
      fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 0 })
      fireTouch(scroll, 'touchmove', 'touches', { clientX: 4, clientY: 3 })
      fireTouch(scroll, 'touchmove', 'touches', { clientX: 4, clientY: 28 })
      await flush()

      expect(backdrop).toHaveAttribute('data-swiping', '')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it.skipIf(isJSDOM)(
    'does not hijack cross-axis gestures from mixed-axis scroll containers',
    async () => {
      render(DrawerScroll, { swipeDirection: 'down', axis: 'both' })

      const scroll = screen.getByTestId('scroll')
      const backdrop = screen.getByTestId('backdrop')
      Object.defineProperty(scroll, 'scrollHeight', { value: 120, configurable: true })
      Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
      Object.defineProperty(scroll, 'scrollWidth', { value: 120, configurable: true })
      Object.defineProperty(scroll, 'clientWidth', { value: 40, configurable: true })
      scroll.scrollTop = 0
      scroll.scrollLeft = 40

      const originalElementFromPoint = document.elementFromPoint
      document.elementFromPoint = () => scroll

      try {
        fireTouch(scroll, 'touchstart', 'touches', { clientX: 40, clientY: 0 })
        fireTouch(scroll, 'touchmove', 'touches', { clientX: 10, clientY: 20 })
        await flush()

        expect(backdrop).not.toHaveAttribute('data-swiping')
      } finally {
        document.elementFromPoint = originalElementFromPoint
      }
    }
  )

  it.skipIf(isJSDOM)(
    'does not block vertical scrolling in right drawers when only vertical overflow exists',
    async () => {
      render(DrawerScroll, { swipeDirection: 'right', axis: 'y' })

      const scroll = screen.getByTestId('scroll')
      const backdrop = screen.getByTestId('backdrop')

      fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 20 })
      const dispatched = fireTouch(scroll, 'touchmove', 'touches', { clientX: 0, clientY: 0 })
      await flush()

      expect(dispatched).toBe(true)
      expect(backdrop).not.toHaveAttribute('data-swiping')
    }
  )

  it.skipIf(isJSDOM)(
    'does not block vertical scrolling in left drawers when only vertical overflow exists',
    async () => {
      render(DrawerScroll, { swipeDirection: 'left', axis: 'y' })

      const scroll = screen.getByTestId('scroll')
      const backdrop = screen.getByTestId('backdrop')

      fireTouch(scroll, 'touchstart', 'touches', { clientX: 0, clientY: 20 })
      const dispatched = fireTouch(scroll, 'touchmove', 'touches', { clientX: 0, clientY: 0 })
      await flush()

      expect(dispatched).toBe(true)
      expect(backdrop).not.toHaveAttribute('data-swiping')
    }
  )

  it.skipIf(isJSDOM)(
    'does not block horizontal scrolling in down drawers when only horizontal overflow exists',
    async () => {
      render(DrawerScroll, { swipeDirection: 'down', axis: 'x' })

      const scroll = screen.getByTestId('scroll')
      const backdrop = screen.getByTestId('backdrop')

      fireTouch(scroll, 'touchstart', 'touches', { clientX: 20, clientY: 0 })
      const dispatched = fireTouch(scroll, 'touchmove', 'touches', { clientX: 0, clientY: 0 })
      await flush()

      expect(dispatched).toBe(true)
      expect(backdrop).not.toHaveAttribute('data-swiping')
    }
  )

  it.skipIf(isJSDOM)(
    'does not block horizontal scrolling in up drawers when only horizontal overflow exists',
    async () => {
      render(DrawerScroll, { swipeDirection: 'up', axis: 'x' })

      const scroll = screen.getByTestId('scroll')
      const backdrop = screen.getByTestId('backdrop')

      fireTouch(scroll, 'touchstart', 'touches', { clientX: 20, clientY: 0 })
      const dispatched = fireTouch(scroll, 'touchmove', 'touches', { clientX: 0, clientY: 0 })
      await flush()

      expect(dispatched).toBe(true)
      expect(backdrop).not.toHaveAttribute('data-swiping')
    }
  )

  it('toggles data-swiping on the backdrop while swiping', async () => {
    render(DrawerViewportInteractive)

    const viewport = screen.getByTestId('viewport')
    const popup = screen.getByTestId('popup')
    const backdrop = screen.getByTestId('backdrop')

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => popup

    try {
      fireEvent.pointerDown(viewport, {
        button: 0,
        buttons: 1,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
        pointerType: 'mouse'
      })
      await flush()

      fireEvent.pointerMove(viewport, {
        buttons: 1,
        pointerId: 1,
        clientX: 0,
        clientY: 8,
        pointerType: 'mouse'
      })
      await flush()

      expect(backdrop).toHaveAttribute('data-swiping', '')

      fireEvent.pointerUp(viewport, {
        pointerId: 1,
        clientX: 0,
        clientY: 8,
        pointerType: 'mouse'
      })
      await flush()

      expect(backdrop).not.toHaveAttribute('data-swiping')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })

  it('does not resolve snap points before the popup has a measurable height', async () => {
    const onOpenChange = vi.fn()
    render(DrawerSnapPointsDismiss, {
      snapPoints: ['100px', '200px'],
      swipeDirection: 'down',
      onOpenChange
    })

    const viewport = screen.getByTestId('viewport')
    const popup = screen.getByTestId('popup')
    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => popup

    try {
      fireEvent.pointerDown(viewport, {
        button: 0,
        buttons: 1,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
        pointerType: 'mouse'
      })
      fireEvent.pointerMove(viewport, {
        buttons: 1,
        pointerId: 1,
        clientX: 0,
        clientY: 1,
        pointerType: 'mouse'
      })
      fireEvent.pointerMove(viewport, {
        buttons: 1,
        pointerId: 1,
        clientX: 0,
        clientY: 40,
        pointerType: 'mouse'
      })
      fireEvent.pointerUp(viewport, {
        pointerId: 1,
        clientX: 0,
        clientY: 40,
        pointerType: 'mouse'
      })
      await flush()
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('ends swipe drag when the primary mouse button is released mid-gesture', async () => {
    render(DrawerViewportInteractive)

    const viewport = screen.getByTestId('viewport')
    const popup = screen.getByTestId('popup')
    const backdrop = screen.getByTestId('backdrop')

    const originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = () => popup

    try {
      fireEvent.pointerDown(viewport, {
        button: 0,
        buttons: 1,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
        pointerType: 'mouse'
      })
      await flush()

      fireEvent.pointerMove(viewport, {
        pointerId: 1,
        clientX: 0,
        clientY: 8,
        buttons: 1,
        pointerType: 'mouse'
      })
      await flush()

      expect(backdrop).toHaveAttribute('data-swiping', '')

      fireEvent.pointerMove(viewport, {
        pointerId: 1,
        clientX: 0,
        clientY: 12,
        buttons: 2,
        pointerType: 'mouse'
      })
      await flush()

      expect(backdrop).not.toHaveAttribute('data-swiping')

      fireEvent.pointerMove(viewport, {
        pointerId: 1,
        clientX: 0,
        clientY: 30,
        buttons: 0,
        pointerType: 'mouse'
      })
      await flush()

      expect(backdrop).not.toHaveAttribute('data-swiping')
    } finally {
      document.elementFromPoint = originalElementFromPoint
    }
  })
  describe('cross-axis slop arbitration', () => {
    function mockCrossAxisScroll() {
      const scroll = screen.getByTestId('scroll')
      Object.defineProperty(scroll, 'scrollHeight', { value: 120, configurable: true })
      Object.defineProperty(scroll, 'clientHeight', { value: 40, configurable: true })
      return scroll
    }

    it('does not prevent a sub-slop first touchmove over cross-axis scrollable content', async () => {
      render(DrawerScroll, { swipeDirection: 'right', axis: 'y' })
      const scroll = mockCrossAxisScroll()

      const originalElementFromPoint = document.elementFromPoint
      document.elementFromPoint = () => scroll

      try {
        fireTouch(scroll, 'touchstart', 'touches', { clientX: 100, clientY: 100 })

        expect(fireTouch(scroll, 'touchmove', 'touches', { clientX: 100, clientY: 97 })).toBe(true)

        expect(fireTouch(scroll, 'touchmove', 'touches', { clientX: 100, clientY: 60 })).toBe(true)

        fireTouch(scroll, 'touchend', 'changedTouches', { clientX: 100, clientY: 60 })
        await flush()
      } finally {
        document.elementFromPoint = originalElementFromPoint
      }
    })

    it('claims the gesture once the drawer axis passes the slop over cross-axis scrollable content', async () => {
      render(DrawerScroll, { swipeDirection: 'right', axis: 'y' })
      const scroll = mockCrossAxisScroll()

      const originalElementFromPoint = document.elementFromPoint
      document.elementFromPoint = () => scroll

      try {
        fireTouch(scroll, 'touchstart', 'touches', { clientX: 100, clientY: 100 })

        expect(fireTouch(scroll, 'touchmove', 'touches', { clientX: 103, clientY: 101 })).toBe(true)
        expect(fireTouch(scroll, 'touchmove', 'touches', { clientX: 112, clientY: 101 })).toBe(
          false
        )

        fireTouch(scroll, 'touchend', 'changedTouches', { clientX: 112, clientY: 101 })
        await flush()
      } finally {
        document.elementFromPoint = originalElementFromPoint
      }
    })

    it('yields the gesture when the browser commits to a native cross-axis scroll', async () => {
      render(DrawerScroll, { swipeDirection: 'right', axis: 'y' })
      const scroll = mockCrossAxisScroll()

      const originalElementFromPoint = document.elementFromPoint
      document.elementFromPoint = () => scroll

      try {
        fireTouch(scroll, 'touchstart', 'touches', { clientX: 100, clientY: 100 })
        fireTouch(scroll, 'touchmove', 'touches', { clientX: 100, clientY: 97 })

        fireNonCancelableTouchMove(scroll, { clientX: 100, clientY: 96 })

        expect(fireTouch(scroll, 'touchmove', 'touches', { clientX: 140, clientY: 96 })).toBe(true)

        fireTouch(scroll, 'touchend', 'changedTouches', { clientX: 140, clientY: 96 })
        await flush()
      } finally {
        document.elementFromPoint = originalElementFromPoint
      }
    })

    it('keeps tracking the finger when a claimed drag returns inside the slop', async () => {
      render(DrawerScroll, { swipeDirection: 'right', axis: 'y' })
      const scroll = mockCrossAxisScroll()
      const popup = screen.getByTestId('popup')

      const originalElementFromPoint = document.elementFromPoint
      document.elementFromPoint = () => scroll

      try {
        fireTouch(scroll, 'touchstart', 'touches', { clientX: 100, clientY: 100 })
        fireTouch(scroll, 'touchmove', 'touches', { clientX: 120, clientY: 100 })
        fireTouch(scroll, 'touchmove', 'touches', { clientX: 150, clientY: 100 })
        await flush()

        expect(popup.style.getPropertyValue('--drawer-swipe-movement-x')).toBe('30px')

        expect(fireTouch(scroll, 'touchmove', 'touches', { clientX: 103, clientY: 100 })).toBe(
          false
        )
        await flush()
        expect(
          Number.parseFloat(popup.style.getPropertyValue('--drawer-swipe-movement-x'))
        ).toBeLessThan(0)

        fireTouch(scroll, 'touchend', 'changedTouches', { clientX: 103, clientY: 100 })
        await flush()
      } finally {
        document.elementFromPoint = originalElementFromPoint
      }
    })

    it('keeps driving a claimed drag through a non-cancelable touchmove', async () => {
      render(DrawerScroll, { swipeDirection: 'right', axis: 'y' })
      const scroll = mockCrossAxisScroll()
      const popup = screen.getByTestId('popup')

      const originalElementFromPoint = document.elementFromPoint
      document.elementFromPoint = () => scroll

      try {
        fireTouch(scroll, 'touchstart', 'touches', { clientX: 100, clientY: 100 })
        fireTouch(scroll, 'touchmove', 'touches', { clientX: 150, clientY: 100 })
        fireTouch(scroll, 'touchmove', 'touches', { clientX: 200, clientY: 100 })
        await flush()

        expect(popup.style.getPropertyValue('--drawer-swipe-movement-x')).toBe('50px')

        fireNonCancelableTouchMove(scroll, { clientX: 250, clientY: 100 })
        await flush()
        expect(popup.style.getPropertyValue('--drawer-swipe-movement-x')).toBe('100px')

        expect(fireTouch(scroll, 'touchmove', 'touches', { clientX: 300, clientY: 100 })).toBe(
          false
        )
        await flush()
        expect(popup.style.getPropertyValue('--drawer-swipe-movement-x')).toBe('150px')

        fireTouch(scroll, 'touchend', 'changedTouches', { clientX: 300, clientY: 100 })
        await flush()
      } finally {
        document.elementFromPoint = originalElementFromPoint
      }
    })
  })
})
