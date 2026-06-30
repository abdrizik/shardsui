import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicScrollArea from './fixtures/basic-scroll-area.svelte'
import HorizontalDragArea from './fixtures/horizontal-drag-area.svelte'
import ScrollAreaThumbHandler from './fixtures/scroll-area-thumb-handler.svelte'
import { mockScrollX, mockScrollY, SCROLL_TIMEOUT } from './fixtures/scroll-metrics'
import SnapScrollArea from './fixtures/snap-scroll-area.svelte'
import ThumbOutsideScrollbar from './fixtures/thumb-outside-scrollbar.svelte'
import UnmountingScrollbar from './fixtures/unmounting-scrollbar.svelte'
import UnmountingViewport from './fixtures/unmounting-viewport.svelte'
import ViewportlessArea from './fixtures/viewportless-area.svelte'

async function advance(ms: number) {
  vi.advanceTimersByTime(ms)
  await tick()
}

describe('<ScrollArea.Thumb />', () => {
  it('renders a custom as element', () => {
    render(BasicScrollArea, { thumbAs: 'section' })
    expect(screen.getByTestId('thumb-vertical').tagName.toLowerCase()).toBe('section')
  })

  it('throws when rendered outside a ScrollArea.Scrollbar', () => {
    expect(() => render(ThumbOutsideScrollbar)).toThrow(
      'ShardsUI: this part must be rendered inside <ScrollArea.Scrollbar>.'
    )
  })

  it('handles a thumb gesture when no viewport is mounted', async () => {
    render(ViewportlessArea)

    const thumb = screen.getByTestId('thumb')
    Object.defineProperties(thumb, {
      setPointerCapture: { configurable: true, value: () => {} },
      hasPointerCapture: { configurable: true, value: () => false }
    })

    await fireEvent.pointerDown(thumb, { button: 0, clientY: 0, pointerId: 1 })
    await fireEvent.pointerMove(thumb, { clientY: 20, pointerId: 1, buttons: 1 })

    expect(thumb).not.toHaveAttribute('data-scrolling')
    expect(thumb.style.transform).toBe('')

    await fireEvent.pointerUp(thumb, { pointerId: 1 })
    expect(thumb).not.toHaveAttribute('data-scrolling')
  })

  it('handles the scrollbar unmounting from a user pointer-move callback', async () => {
    render(UnmountingScrollbar)

    const viewport = screen.getByTestId('viewport')
    const thumb = screen.getByTestId('thumb')
    Object.defineProperty(thumb, 'setPointerCapture', { configurable: true, value: () => {} })

    await fireEvent.pointerDown(thumb, { button: 0, clientY: 0, pointerId: 1 })
    expect(() =>
      fireEvent.pointerMove(thumb, { clientY: 20, pointerId: 1, buttons: 1 })
    ).not.toThrow()

    expect(screen.queryByTestId('scrollbar')).toBe(null)
    expect(viewport.scrollTop).toBe(0)
  })

  it('handles the viewport unmounting from a user pointer-up callback', async () => {
    render(UnmountingViewport)

    const viewport = screen.getByTestId('viewport')
    const thumb = screen.getByTestId('thumb')
    Object.defineProperties(thumb, {
      setPointerCapture: { configurable: true, value: () => {} },
      hasPointerCapture: { configurable: true, value: () => false }
    })

    await fireEvent.pointerDown(thumb, { button: 0, clientY: 0, pointerId: 1 })
    expect(viewport.style.scrollSnapType).toBe('none')

    expect(() => fireEvent.pointerUp(thumb, { pointerId: 1 })).not.toThrow()
    expect(screen.queryByTestId('viewport')).toBe(null)
  })

  describe.skipIf(isJSDOM)('horizontal dragging', () => {
    async function renderHorizontal(direction: 'ltr' | 'rtl') {
      const user = userEvent.setup()
      render(HorizontalDragArea, { direction })

      const viewport = screen.getByTestId('viewport')
      const scrollbar = screen.getByTestId('scrollbar')
      const thumb = screen.getByTestId('thumb')
      await waitFor(() => expect(thumb.offsetWidth).toBeGreaterThan(0))

      return { scrollbar, thumb, user, viewport }
    }

    it('updates LTR scroll position and pointer capture state', async () => {
      const { scrollbar, thumb, user, viewport } = await renderHorizontal('ltr')
      const setPointerCapture = vi.spyOn(thumb, 'setPointerCapture').mockImplementation(() => {})
      vi.spyOn(thumb, 'hasPointerCapture').mockReturnValue(true)
      const releasePointerCapture = vi
        .spyOn(thumb, 'releasePointerCapture')
        .mockImplementation(() => {})
      const rect = thumb.getBoundingClientRect()

      await user.pointer({
        target: thumb,
        coords: { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 },
        keys: '[MouseLeft>]'
      })
      await user.pointer({
        target: thumb,
        coords: { clientX: rect.left + rect.width / 2 + 20, clientY: rect.top + rect.height / 2 }
      })

      expect(setPointerCapture).toHaveBeenCalledTimes(1)
      expect(viewport.scrollLeft).toBeGreaterThan(0)
      expect(scrollbar).toHaveAttribute('data-scrolling')

      await user.pointer({ keys: '[/MouseLeft]' })

      expect(releasePointerCapture).toHaveBeenCalled()
    })

    it('uses the negative RTL range and clears scrolling on pointer cancel', async () => {
      const { scrollbar, thumb, user, viewport } = await renderHorizontal('rtl')
      const rect = thumb.getBoundingClientRect()

      await user.pointer({
        target: thumb,
        coords: { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 },
        keys: '[MouseLeft>]'
      })
      await user.pointer({
        target: thumb,
        coords: { clientX: rect.left + rect.width / 2 - 20, clientY: rect.top + rect.height / 2 }
      })

      expect(viewport.scrollLeft).toBeLessThan(0)
      expect(scrollbar).toHaveAttribute('data-scrolling')
      expect(() => fireEvent.pointerCancel(thumb, { pointerId: 1 })).not.toThrow()
      await waitFor(() => expect(scrollbar).not.toHaveAttribute('data-scrolling'))

      await user.pointer({ keys: '[/MouseLeft]' })
    })
  })

  it('calls a consumer pointer handler and still scrolls when dragging', () => {
    const onThumbPointerDown = vi.fn()
    const onThumbPointerMove = vi.fn()
    render(ScrollAreaThumbHandler, { onThumbPointerDown, onThumbPointerMove })

    const viewport = screen.getByTestId('viewport') as HTMLDivElement
    const thumb = screen.getByTestId('thumb-vertical')
    const scrollbar = screen.getByTestId('scrollbar-vertical')

    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 500 },
      scrollTop: { configurable: true, writable: true, value: 0 }
    })
    Object.defineProperties(scrollbar, {
      offsetHeight: { configurable: true, value: 100 },
      getBoundingClientRect: { configurable: true, value: () => ({ top: 0, left: 0 }) }
    })
    Object.defineProperty(thumb, 'offsetHeight', { configurable: true, value: 20 })
    Object.defineProperty(thumb, 'setPointerCapture', { configurable: true, value: () => {} })

    fireEvent(
      thumb,
      new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 10, pointerId: 1 })
    )
    expect(onThumbPointerDown).toHaveBeenCalledOnce()

    fireEvent(
      thumb,
      new PointerEvent('pointermove', { bubbles: true, clientY: 30, pointerId: 1, buttons: 1 })
    )
    expect(onThumbPointerMove).toHaveBeenCalledOnce()
    expect(viewport.scrollTop).toBeGreaterThan(0)
  })

  it('clears scrolling state on pointer cancel without releasing stale capture', async () => {
    render(BasicScrollArea)

    const viewport = screen.getByTestId('viewport') as HTMLDivElement
    const scrollbar = screen.getByTestId('scrollbar-vertical')
    const thumb = screen.getByTestId('thumb-vertical')

    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 1000 },
      scrollTop: { configurable: true, writable: true, value: 0 }
    })
    Object.defineProperties(scrollbar, {
      offsetHeight: { configurable: true, value: 200 }
    })
    Object.defineProperties(thumb, {
      offsetHeight: { configurable: true, value: 40 },
      setPointerCapture: { configurable: true, value: () => {} },
      hasPointerCapture: { configurable: true, value: () => false },
      releasePointerCapture: {
        configurable: true,
        value: () => {
          throw new Error('releasePointerCapture should not be called')
        }
      }
    })

    await fireEvent(
      thumb,
      new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 0, pointerId: 1 })
    )
    await fireEvent(
      thumb,
      new PointerEvent('pointermove', { bubbles: true, clientY: 20, pointerId: 1, buttons: 1 })
    )

    await waitFor(() => expect(scrollbar).toHaveAttribute('data-scrolling'))

    await fireEvent(thumb, new PointerEvent('pointercancel', { bubbles: true, pointerId: 1 }))

    await waitFor(() => expect(scrollbar).not.toHaveAttribute('data-scrolling'))
  })

  it('clears horizontal scrolling state on pointer cancel', async () => {
    render(BasicScrollArea)

    const viewport = screen.getByTestId('viewport') as HTMLDivElement
    const scrollbar = screen.getByTestId('scrollbar-horizontal')
    const thumb = screen.getByTestId('thumb-horizontal')

    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: 200 },
      scrollWidth: { configurable: true, value: 1000 },
      scrollLeft: { configurable: true, writable: true, value: 0 }
    })
    Object.defineProperties(scrollbar, {
      offsetWidth: { configurable: true, value: 200 }
    })
    Object.defineProperties(thumb, {
      offsetWidth: { configurable: true, value: 40 },
      setPointerCapture: { configurable: true, value: () => {} },
      hasPointerCapture: { configurable: true, value: () => false },
      releasePointerCapture: {
        configurable: true,
        value: () => {
          throw new Error('releasePointerCapture should not be called')
        }
      }
    })

    await fireEvent(
      thumb,
      new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: 0, pointerId: 1 })
    )
    await fireEvent(
      thumb,
      new PointerEvent('pointermove', { bubbles: true, clientX: 20, pointerId: 1, buttons: 1 })
    )

    await waitFor(() => expect(scrollbar).toHaveAttribute('data-scrolling'))

    await fireEvent(thumb, new PointerEvent('pointercancel', { bubbles: true, pointerId: 1 }))

    await waitFor(() => expect(scrollbar).not.toHaveAttribute('data-scrolling'))
  })

  describe('scroll snap', () => {
    function defineThumbPointerCapture(thumb: HTMLElement) {
      let capturedId: number | null = null
      Object.defineProperties(thumb, {
        setPointerCapture: {
          configurable: true,
          value: (pointerId: number) => {
            capturedId = pointerId
          }
        },
        hasPointerCapture: {
          configurable: true,
          value: (pointerId: number) => pointerId === capturedId
        },
        releasePointerCapture: {
          configurable: true,
          value: (pointerId: number) => {
            if (pointerId === capturedId) capturedId = null
          }
        }
      })
      return {
        dropCapture() {
          capturedId = null
        }
      }
    }

    it('disables viewport scroll snap while dragging and restores it on release', async () => {
      render(SnapScrollArea)
      const viewport = screen.getByTestId('viewport')
      const thumb = screen.getByTestId('thumb')
      defineThumbPointerCapture(thumb)

      await fireEvent.pointerDown(thumb, { button: 0, clientY: 0, pointerId: 1 })
      expect(viewport.style.scrollSnapType).toBe('none')

      await fireEvent.pointerUp(thumb, { pointerId: 1 })
      expect(viewport.style.scrollSnapType).toBe('y mandatory')
    })

    it('restores viewport scroll snap on pointer cancel', async () => {
      render(SnapScrollArea)
      const viewport = screen.getByTestId('viewport')
      const thumb = screen.getByTestId('thumb')
      defineThumbPointerCapture(thumb)

      await fireEvent.pointerDown(thumb, { button: 0, clientY: 0, pointerId: 1 })
      expect(viewport.style.scrollSnapType).toBe('none')

      await fireEvent.pointerCancel(thumb, { pointerId: 1 })
      expect(viewport.style.scrollSnapType).toBe('y mandatory')
    })

    it('ignores a second pointer while a drag is active', async () => {
      render(SnapScrollArea)
      const viewport = screen.getByTestId('viewport')
      const thumb = screen.getByTestId('thumb')
      defineThumbPointerCapture(thumb)

      await fireEvent.pointerDown(thumb, { button: 0, clientY: 0, pointerId: 1 })
      await fireEvent.pointerDown(thumb, { button: 0, clientY: 0, pointerId: 2 })
      expect(viewport.style.scrollSnapType).toBe('none')

      await fireEvent.pointerUp(thumb, { pointerId: 2 })
      expect(viewport.style.scrollSnapType).toBe('none')

      await fireEvent.pointerUp(thumb, { pointerId: 1 })
      expect(viewport.style.scrollSnapType).toBe('y mandatory')
    })

    it('lets a new pointer take over when capture was silently dropped', async () => {
      render(SnapScrollArea)
      const viewport = screen.getByTestId('viewport')
      const thumb = screen.getByTestId('thumb')
      const capture = defineThumbPointerCapture(thumb)

      await fireEvent.pointerDown(thumb, { button: 0, clientY: 0, pointerId: 1 })
      expect(viewport.style.scrollSnapType).toBe('none')

      capture.dropCapture()

      await fireEvent.pointerDown(thumb, { button: 0, clientY: 0, pointerId: 2 })
      await fireEvent.pointerUp(thumb, { pointerId: 2 })
      expect(viewport.style.scrollSnapType).toBe('y mandatory')
    })

    it('ignores non-primary pointer presses', async () => {
      render(SnapScrollArea)
      const viewport = screen.getByTestId('viewport')
      const thumb = screen.getByTestId('thumb')
      const setPointerCapture = vi.fn()
      Object.defineProperty(thumb, 'setPointerCapture', {
        configurable: true,
        value: setPointerCapture
      })

      await fireEvent.pointerDown(thumb, { button: 2, clientY: 0, pointerId: 1 })

      expect(viewport.style.scrollSnapType).toBe('y mandatory')
      expect(setPointerCapture).not.toHaveBeenCalled()
    })
  })

  it.skipIf(isJSDOM)(
    'ends a drag whose release was missed instead of scrolling on hover',
    async () => {
      render(SnapScrollArea)
      const viewport = screen.getByTestId('viewport')
      const thumb = screen.getByTestId('thumb')
      await waitFor(() => expect(thumb.offsetHeight).toBeGreaterThan(0))

      Object.defineProperties(thumb, {
        setPointerCapture: { configurable: true, value: () => {} },
        hasPointerCapture: { configurable: true, value: () => false }
      })

      await fireEvent.pointerDown(thumb, { button: 0, clientY: 0, pointerId: 1 })
      expect(viewport.style.scrollSnapType).toBe('none')

      await fireEvent.pointerMove(thumb, { clientY: 20, pointerId: 1, buttons: 1 })
      expect(viewport.scrollTop).toBeGreaterThan(0)
      const scrolled = viewport.scrollTop

      await fireEvent.pointerMove(thumb, { clientY: 60, pointerId: 2, buttons: 0 })
      expect(viewport.scrollTop).toBe(scrolled)
      expect(viewport.style.scrollSnapType).toBe('none')

      await fireEvent.pointerMove(thumb, { clientY: 60, pointerId: 1, buttons: 1 })
      expect(viewport.scrollTop).toBeGreaterThan(scrolled)
      const continuedScroll = viewport.scrollTop
      expect(thumb).toHaveAttribute('data-scrolling')

      await fireEvent.pointerMove(thumb, { clientY: 100, pointerId: 1, buttons: 0 })
      expect(viewport.scrollTop).toBe(continuedScroll)
      expect(viewport.style.scrollSnapType).toBe('y mandatory')
      expect(thumb).not.toHaveAttribute('data-scrolling')

      await fireEvent.pointerMove(thumb, { clientY: 140, pointerId: 1, buttons: 0 })
      expect(viewport.scrollTop).toBe(continuedScroll)
    }
  )

  describe('data-scrolling', () => {
    it('adds [data-scrolling] attribute when viewport is scrolled in the correct direction', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        render(BasicScrollArea)

        const verticalThumb = screen.getByTestId('thumb-vertical')
        const horizontalThumb = screen.getByTestId('thumb-horizontal')
        const viewport = screen.getByTestId('viewport')

        expect(verticalThumb).not.toHaveAttribute('data-scrolling')
        expect(horizontalThumb).not.toHaveAttribute('data-scrolling')

        await fireEvent.pointerEnter(viewport)
        mockScrollY(viewport, 1)
        await fireEvent.scroll(viewport)
        await tick()

        expect(verticalThumb).toHaveAttribute('data-scrolling', '')
        expect(horizontalThumb).not.toHaveAttribute('data-scrolling')

        await advance(SCROLL_TIMEOUT - 1)

        expect(verticalThumb).toHaveAttribute('data-scrolling', '')
        expect(horizontalThumb).not.toHaveAttribute('data-scrolling')

        await fireEvent.pointerEnter(viewport)
        mockScrollX(viewport, 1)
        await fireEvent.scroll(viewport)
        await tick()

        await advance(1)

        expect(verticalThumb).not.toHaveAttribute('data-scrolling')
        expect(horizontalThumb).toHaveAttribute('data-scrolling')

        await advance(SCROLL_TIMEOUT - 2)

        expect(verticalThumb).not.toHaveAttribute('data-scrolling')
        expect(horizontalThumb).toHaveAttribute('data-scrolling')

        await advance(1)

        expect(verticalThumb).not.toHaveAttribute('data-scrolling')
        expect(horizontalThumb).not.toHaveAttribute('data-scrolling')
      } finally {
        vi.useRealTimers()
      }
    })
  })
})
