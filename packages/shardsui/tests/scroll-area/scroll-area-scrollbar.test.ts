import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { tick } from 'svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicScrollArea from './fixtures/basic-scroll-area.svelte'
import ConfigurableArea from './fixtures/configurable-area.svelte'
import {
  mockScrollX,
  mockScrollY,
  SCROLL_TIMEOUT,
  SCROLLABLE_CONTENT_SIZE,
  VIEWPORT_SIZE
} from './fixtures/scroll-metrics'
import SnapScrollArea from './fixtures/snap-scroll-area.svelte'
import SnapTrackArea from './fixtures/snap-track-area.svelte'
import ViewportlessArea from './fixtures/viewportless-area.svelte'
import WheelScrollArea from './fixtures/wheel-scroll-area.svelte'

async function advance(ms: number) {
  vi.advanceTimersByTime(ms)
  await tick()
}

describe('<ScrollArea.Scrollbar />', () => {
  it('renders a custom as element', () => {
    render(BasicScrollArea, { scrollbarAs: 'section' })
    expect(screen.getByTestId('scrollbar-vertical').tagName.toLowerCase()).toBe('section')
  })

  describe('data-hovering attribute', () => {
    it('adds [data-hovering] when the pointer moves over the scroll area', async () => {
      render(BasicScrollArea)
      const root = screen.getByTestId('root')
      const viewport = screen.getByTestId('viewport')
      const verticalScrollbar = screen.getByTestId('scrollbar-vertical')

      expect(verticalScrollbar).not.toHaveAttribute('data-hovering')

      const event = new PointerEvent('pointermove', { bubbles: true })
      Object.defineProperty(event, 'pointerType', { configurable: true, value: 'mouse' })
      await fireEvent(viewport, event)

      expect(verticalScrollbar).toHaveAttribute('data-hovering', '')

      const leaveEvent = new PointerEvent('pointerleave')
      Object.defineProperty(leaveEvent, 'pointerType', { configurable: true, value: 'mouse' })
      await fireEvent(root, leaveEvent)

      expect(verticalScrollbar).not.toHaveAttribute('data-hovering')
    })

    it('detects a viewport that is already hovered on mount', async () => {
      const originalMatches = Element.prototype.matches
      const matchesSpy = vi.spyOn(Element.prototype, 'matches').mockImplementation(function matches(
        this: Element,
        selector: string
      ) {
        if (selector === ':hover' && this.getAttribute('data-testid') === 'viewport') {
          return true
        }
        return originalMatches.call(this, selector)
      })

      try {
        render(BasicScrollArea)

        await waitFor(() =>
          expect(screen.getByTestId('scrollbar-vertical')).toHaveAttribute('data-hovering')
        )
      } finally {
        matchesSpy.mockRestore()
      }
    })

    it('does not enter hover state for touch pointers', async () => {
      render(BasicScrollArea)
      const viewport = screen.getByTestId('viewport')
      const verticalScrollbar = screen.getByTestId('scrollbar-vertical')

      const event = new PointerEvent('pointerenter', { bubbles: true })
      Object.defineProperty(event, 'pointerType', { configurable: true, value: 'touch' })
      await fireEvent(viewport, event)

      expect(verticalScrollbar).not.toHaveAttribute('data-hovering')
    })
  })

  describe('data-scrolling attribute', () => {
    it('adds [data-scrolling] attribute when viewport is scrolled in the correct direction', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        render(BasicScrollArea)

        const verticalScrollbar = screen.getByTestId('scrollbar-vertical')
        const horizontalScrollbar = screen.getByTestId('scrollbar-horizontal')
        const viewport = screen.getByTestId('viewport')

        expect(verticalScrollbar).not.toHaveAttribute('data-scrolling')
        expect(horizontalScrollbar).not.toHaveAttribute('data-scrolling')

        await fireEvent.pointerEnter(viewport)
        mockScrollY(viewport, 1)
        await fireEvent.scroll(viewport)
        await tick()

        expect(verticalScrollbar).toHaveAttribute('data-scrolling', '')
        expect(horizontalScrollbar).not.toHaveAttribute('data-scrolling')

        await advance(SCROLL_TIMEOUT - 1)

        expect(verticalScrollbar).toHaveAttribute('data-scrolling', '')
        expect(horizontalScrollbar).not.toHaveAttribute('data-scrolling')

        await fireEvent.pointerEnter(viewport)
        mockScrollX(viewport, 1)
        await fireEvent.scroll(viewport)
        await tick()

        await advance(1)

        expect(verticalScrollbar).not.toHaveAttribute('data-scrolling')
        expect(horizontalScrollbar).toHaveAttribute('data-scrolling')

        await advance(SCROLL_TIMEOUT - 2)

        expect(verticalScrollbar).not.toHaveAttribute('data-scrolling')
        expect(horizontalScrollbar).toHaveAttribute('data-scrolling')

        await advance(1)

        expect(verticalScrollbar).not.toHaveAttribute('data-scrolling')
        expect(horizontalScrollbar).not.toHaveAttribute('data-scrolling')
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('track pointer down', () => {
    it('ignores non-primary pointer presses', async () => {
      render(SnapScrollArea)
      const viewport = screen.getByTestId('viewport') as HTMLDivElement

      await fireEvent(
        screen.getByTestId('scrollbar-vertical'),
        new PointerEvent('pointerdown', { bubbles: true, button: 2, clientY: 100, pointerId: 1 })
      )

      expect(viewport.scrollTop).toBe(0)
      expect(viewport.style.scrollSnapType).toBe('y mandatory')
    })

    it('handles a track press when no viewport is mounted', async () => {
      render(ViewportlessArea)
      const scrollbar = screen.getByTestId('scrollbar')

      await fireEvent(
        scrollbar,
        new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 100, pointerId: 1 })
      )

      expect(scrollbar).not.toHaveAttribute('data-scrolling')
    })

    it('ignores thumb pointerdown and does not scroll viewport', () => {
      render(BasicScrollArea)
      const viewport = screen.getByTestId('viewport') as HTMLDivElement
      const verticalScrollbar = screen.getByTestId('scrollbar-vertical')
      const thumb = screen.getByTestId('thumb-vertical')

      Object.defineProperties(viewport, {
        clientHeight: { configurable: true, value: 200 },
        scrollHeight: { configurable: true, value: 1000 },
        scrollTop: { configurable: true, writable: true, value: 0 }
      })
      Object.defineProperties(verticalScrollbar, {
        offsetHeight: { configurable: true, value: 200 },
        getBoundingClientRect: { configurable: true, value: () => ({ top: 0 }) }
      })
      Object.defineProperties(thumb, {
        offsetHeight: { configurable: true, value: 40 },
        setPointerCapture: { configurable: true, value: () => {} }
      })

      const event = new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        clientY: 160,
        pointerId: 1
      })

      fireEvent(thumb, event)

      expect(viewport.scrollTop).toBe(0)
    })

    it('marks the scroll area as scrolling when pressing the track', async () => {
      render(BasicScrollArea)
      const viewport = screen.getByTestId('viewport') as HTMLDivElement
      const verticalScrollbar = screen.getByTestId('scrollbar-vertical')
      const thumb = screen.getByTestId('thumb-vertical')

      Object.defineProperties(viewport, {
        clientHeight: { configurable: true, value: 200 },
        scrollHeight: { configurable: true, value: 1000 },
        scrollTop: { configurable: true, writable: true, value: 0 }
      })
      Object.defineProperties(verticalScrollbar, {
        offsetHeight: { configurable: true, value: 200 },
        getBoundingClientRect: { configurable: true, value: () => ({ top: 0 }) }
      })
      Object.defineProperties(thumb, {
        offsetHeight: { configurable: true, value: 40 },
        setPointerCapture: { configurable: true, value: () => {} }
      })

      await fireEvent(
        verticalScrollbar,
        new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 160, pointerId: 1 })
      )

      expect(viewport.scrollTop).not.toBe(0)
      await waitFor(() => expect(verticalScrollbar).toHaveAttribute('data-scrolling'))
    })

    it('does not jump the scroll when clicking a track whose thumb fills it', async () => {
      render(BasicScrollArea)
      const viewport = screen.getByTestId('viewport') as HTMLDivElement
      const verticalScrollbar = screen.getByTestId('scrollbar-vertical')
      const thumb = screen.getByTestId('thumb-vertical')

      Object.defineProperties(viewport, {
        clientHeight: { configurable: true, value: 200 },
        scrollHeight: { configurable: true, value: 210 },
        scrollTop: { configurable: true, writable: true, value: 10 }
      })
      Object.defineProperties(verticalScrollbar, {
        offsetHeight: { configurable: true, value: 200 },
        getBoundingClientRect: { configurable: true, value: () => ({ top: 0 }) }
      })
      Object.defineProperties(thumb, {
        offsetHeight: { configurable: true, value: 200 },
        setPointerCapture: { configurable: true, value: () => {} }
      })

      await fireEvent(
        verticalScrollbar,
        new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 100, pointerId: 1 })
      )

      expect(viewport.scrollTop).toBe(10)
    })

    it('does not start a track gesture without a thumb', async () => {
      render(SnapScrollArea, { thumb: false })
      const viewport = screen.getByTestId('viewport') as HTMLDivElement
      const verticalScrollbar = screen.getByTestId('scrollbar-vertical')

      await fireEvent(
        verticalScrollbar,
        new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 100, pointerId: 1 })
      )

      expect(viewport.scrollTop).toBe(0)
      expect(viewport.style.scrollSnapType).toBe('y mandatory')
    })

    it('clears track drag state on pointer cancel', async () => {
      render(BasicScrollArea)
      const viewport = screen.getByTestId('viewport') as HTMLDivElement
      const verticalScrollbar = screen.getByTestId('scrollbar-vertical')
      const thumb = screen.getByTestId('thumb-vertical')

      Object.defineProperties(viewport, {
        clientHeight: { configurable: true, value: 200 },
        scrollHeight: { configurable: true, value: 1000 },
        scrollTop: { configurable: true, writable: true, value: 0 }
      })
      Object.defineProperties(verticalScrollbar, {
        offsetHeight: { configurable: true, value: 200 },
        getBoundingClientRect: { configurable: true, value: () => ({ top: 0 }) }
      })
      Object.defineProperties(thumb, {
        offsetHeight: { configurable: true, value: 40 },
        setPointerCapture: { configurable: true, value: () => {} },
        hasPointerCapture: { configurable: true, value: () => false }
      })

      await fireEvent(
        verticalScrollbar,
        new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 160, pointerId: 1 })
      )

      const scrollTopAfterTrackPress = viewport.scrollTop

      await fireEvent(
        verticalScrollbar,
        new PointerEvent('pointercancel', { bubbles: true, pointerId: 1 })
      )
      await fireEvent(
        thumb,
        new PointerEvent('pointermove', { bubbles: true, clientY: 180, pointerId: 1, buttons: 1 })
      )

      expect(viewport.scrollTop).toBe(scrollTopAfterTrackPress)
    })
  })

  describe.skipIf(isJSDOM)('track click by axis', () => {
    async function renderAxisTrack(
      orientation: 'horizontal' | 'vertical',
      direction: 'ltr' | 'rtl'
    ) {
      render(ConfigurableArea, {
        direction,
        keepMounted: true,
        horizontal: orientation === 'horizontal',
        vScrollbarStyle: 'width: 10px;',
        hScrollbarStyle: 'height: 10px;'
      })

      const viewport = screen.getByTestId('viewport') as HTMLDivElement
      const scrollbar = screen.getByTestId(`scrollbar-${orientation}`)
      const thumb = screen.getByTestId(`thumb-${orientation}`)
      await waitFor(() => expect(thumb.offsetWidth + thumb.offsetHeight).toBeGreaterThan(0))

      return { viewport, scrollbar }
    }

    it('scrolls down when clicking below the thumb on a vertical track', async () => {
      const { viewport, scrollbar } = await renderAxisTrack('vertical', 'ltr')
      const rect = scrollbar.getBoundingClientRect()

      fireEvent.pointerDown(scrollbar, {
        button: 0,
        clientX: rect.left + rect.width / 2,
        clientY: rect.bottom - 5,
        pointerId: 1
      })

      expect(viewport.scrollTop).toBeGreaterThan(0)
    })

    it('scrolls right when clicking the end of a horizontal LTR track', async () => {
      const { viewport, scrollbar } = await renderAxisTrack('horizontal', 'ltr')
      const rect = scrollbar.getBoundingClientRect()

      fireEvent.pointerDown(scrollbar, {
        button: 0,
        clientX: rect.right - 5,
        clientY: rect.top + rect.height / 2,
        pointerId: 1
      })

      expect(viewport.scrollLeft).toBeGreaterThan(0)
    })

    it('scrolls into the negative RTL range when clicking a horizontal RTL track', async () => {
      const { viewport, scrollbar } = await renderAxisTrack('horizontal', 'rtl')
      const rect = scrollbar.getBoundingClientRect()

      fireEvent.pointerDown(scrollbar, {
        button: 0,
        clientX: rect.left + 5,
        clientY: rect.top + rect.height / 2,
        pointerId: 1
      })

      expect(viewport.scrollLeft).toBeLessThan(0)
    })
  })

  describe.skipIf(isJSDOM)('scroll snap on track press', () => {
    it('does not snap the initial jump-to-click position', async () => {
      render(SnapTrackArea)

      const viewport = screen.getByTestId('viewport') as HTMLDivElement
      const scrollbar = screen.getByTestId('scrollbar')
      const thumb = screen.getByTestId('thumb')
      await waitFor(() => expect(thumb.offsetWidth).toBeGreaterThan(0))

      const targetScroll = 900
      const maxScroll = viewport.scrollWidth - viewport.clientWidth
      const maxThumbOffset = scrollbar.offsetWidth - thumb.offsetWidth
      const rect = scrollbar.getBoundingClientRect()
      const clickX = rect.left + (targetScroll / maxScroll) * maxThumbOffset + thumb.offsetWidth / 2

      fireEvent.pointerDown(scrollbar, {
        button: 0,
        clientX: clickX,
        clientY: rect.top + rect.height / 2,
        pointerId: 1
      })

      expect(Math.abs(viewport.scrollLeft - targetScroll)).toBeLessThanOrEqual(1)

      fireEvent.pointerUp(scrollbar, { pointerId: 1 })
      await waitFor(() => expect(viewport.scrollLeft % 200).toBe(0))
    })
  })

  describe('non-positive thumb offset', () => {
    function renderShortTrack(trackSize: number, thumbSize: number) {
      render(BasicScrollArea)
      const viewport = screen.getByTestId('viewport') as HTMLDivElement
      const verticalScrollbar = screen.getByTestId('scrollbar-vertical')
      const thumb = screen.getByTestId('thumb-vertical')

      Object.defineProperties(viewport, {
        clientHeight: { configurable: true, value: 200 },
        scrollHeight: { configurable: true, value: 1000 },
        scrollTop: { configurable: true, writable: true, value: 400 }
      })
      Object.defineProperties(verticalScrollbar, {
        offsetHeight: { configurable: true, value: trackSize },
        getBoundingClientRect: { configurable: true, value: () => ({ top: 0 }) }
      })
      Object.defineProperties(thumb, {
        offsetHeight: { configurable: true, value: thumbSize },
        setPointerCapture: { configurable: true, value: () => {} },
        hasPointerCapture: { configurable: true, value: () => false }
      })

      return { viewport, verticalScrollbar, thumb }
    }

    async function dragThumb(thumb: HTMLElement) {
      await fireEvent(
        thumb,
        new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 0, pointerId: 1 })
      )
      await fireEvent(
        thumb,
        new PointerEvent('pointermove', { bubbles: true, clientY: 5, pointerId: 1, buttons: 1 })
      )
    }

    it('does not jump the scroll when dragging a thumb that fills the track', async () => {
      const { viewport, thumb } = renderShortTrack(16, 16)

      await dragThumb(thumb)

      expect(viewport.scrollTop).toBe(400)
    })

    it('does not jump the scroll when dragging a thumb taller than the track', async () => {
      const { viewport, thumb } = renderShortTrack(10, 20)

      await dragThumb(thumb)

      expect(viewport.scrollTop).toBe(400)
    })

    it('does not jump the scroll when clicking a track whose thumb is taller than the track', async () => {
      const { viewport, verticalScrollbar } = renderShortTrack(10, 20)

      await fireEvent(
        verticalScrollbar,
        new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 5, pointerId: 1 })
      )

      expect(viewport.scrollTop).toBe(400)
    })
  })

  describe('wheel', () => {
    async function renderWheelTest(props: {
      direction?: 'ltr' | 'rtl'
      orientation?: 'horizontal' | 'vertical'
      scrollLeft?: number
      scrollTop?: number
    }) {
      const { direction = 'ltr', orientation = 'horizontal', scrollLeft = 0, scrollTop = 0 } = props

      render(WheelScrollArea, { direction, orientation })

      const viewport = screen.getByTestId('viewport') as HTMLDivElement
      const scrollbar = screen.getByTestId('scrollbar')

      Object.defineProperties(viewport, {
        clientHeight: { configurable: true, value: 200 },
        clientWidth: { configurable: true, value: 200 },
        scrollHeight: { configurable: true, value: 1000 },
        scrollWidth: { configurable: true, value: 1000 },
        scrollLeft: { configurable: true, writable: true, value: scrollLeft },
        scrollTop: { configurable: true, writable: true, value: scrollTop }
      })

      return { viewport, scrollbar }
    }

    it('allows horizontal scrolling away from the RTL start edge', async () => {
      const { viewport, scrollbar } = await renderWheelTest({ direction: 'rtl' })

      fireEvent.wheel(scrollbar, { deltaX: -50 })

      expect(viewport.scrollLeft).toBeCloseTo(-50, 0)
    })

    it('clamps horizontal LTR wheel scrolling at both edges', async () => {
      const { viewport, scrollbar } = await renderWheelTest({ direction: 'ltr' })

      fireEvent.wheel(scrollbar, { deltaX: -50 })
      expect(viewport.scrollLeft).toBe(0)

      viewport.scrollLeft = 790
      fireEvent.wheel(scrollbar, { deltaX: 50 })
      expect(viewport.scrollLeft).toBe(800)

      fireEvent.wheel(scrollbar, { deltaX: 50 })
      expect(viewport.scrollLeft).toBe(800)
    })

    it('clamps horizontal RTL wheel scrolling at both edges', async () => {
      const { viewport, scrollbar } = await renderWheelTest({ direction: 'rtl' })

      fireEvent.wheel(scrollbar, { deltaX: 50 })
      expect(viewport.scrollLeft).toBe(0)

      viewport.scrollLeft = -100
      fireEvent.wheel(scrollbar, { deltaX: 50 })
      expect(viewport.scrollLeft).toBe(-50)

      viewport.scrollLeft = -790
      fireEvent.wheel(scrollbar, { deltaX: -50 })
      expect(viewport.scrollLeft).toBe(-800)

      fireEvent.wheel(scrollbar, { deltaX: -50 })
      expect(viewport.scrollLeft).toBe(-800)

      viewport.scrollLeft = -10
      fireEvent.wheel(scrollbar, { deltaX: 50 })
      expect(viewport.scrollLeft).toBe(0)
    })

    it('clamps vertical wheel scrolling at both edges', async () => {
      const { viewport, scrollbar } = await renderWheelTest({ orientation: 'vertical' })

      fireEvent.wheel(scrollbar, { deltaY: -50 })
      expect(viewport.scrollTop).toBe(0)

      viewport.scrollTop = 790
      fireEvent.wheel(scrollbar, { deltaY: 50 })
      expect(viewport.scrollTop).toBe(800)

      fireEvent.wheel(scrollbar, { deltaY: 50 })
      expect(viewport.scrollTop).toBe(800)
    })

    it('preventDefaults only when it consumes the scroll, allowing chaining at edges', async () => {
      const { viewport, scrollbar } = await renderWheelTest({ orientation: 'vertical' })

      viewport.scrollTop = 400
      expect(await fireEvent.wheel(scrollbar, { deltaY: 50 })).toBe(false)

      viewport.scrollTop = 800
      expect(await fireEvent.wheel(scrollbar, { deltaY: 50 })).toBe(true)

      viewport.scrollTop = 0
      expect(await fireEvent.wheel(scrollbar, { deltaY: -50 })).toBe(true)
    })

    it('ignores zero-delta wheel events', async () => {
      const { viewport, scrollbar } = await renderWheelTest({
        orientation: 'vertical',
        scrollTop: 400
      })

      expect(await fireEvent.wheel(scrollbar, { deltaY: 0 })).toBe(true)
      expect(viewport.scrollTop).toBe(400)
      expect(scrollbar).not.toHaveAttribute('data-scrolling')
    })

    it('does not intercept browser zoom gestures', async () => {
      const { viewport, scrollbar } = await renderWheelTest({
        orientation: 'vertical',
        scrollTop: 400
      })

      expect(await fireEvent.wheel(scrollbar, { ctrlKey: true, deltaY: 50 })).toBe(true)
      expect(viewport.scrollTop).toBe(400)
      expect(scrollbar).not.toHaveAttribute('data-scrolling')
    })

    it('marks the scroll area as scrolling when wheeling over the scrollbar', async () => {
      const { scrollbar } = await renderWheelTest({ orientation: 'vertical' })

      await fireEvent.wheel(scrollbar, { deltaY: 50 })

      await waitFor(() => expect(scrollbar).toHaveAttribute('data-scrolling'))
    })

    it('marks the scroll area as scrolling when wheeling over the horizontal scrollbar', async () => {
      const { scrollbar } = await renderWheelTest({ orientation: 'horizontal' })

      await fireEvent.wheel(scrollbar, { deltaX: 50 })

      await waitFor(() => expect(scrollbar).toHaveAttribute('data-scrolling'))
    })

    it('does not mark the scroll area as scrolling when chaining at an edge', async () => {
      const { viewport, scrollbar } = await renderWheelTest({ orientation: 'vertical' })

      viewport.scrollTop = 800
      await fireEvent.wheel(scrollbar, { deltaY: 50 })

      expect(scrollbar).not.toHaveAttribute('data-scrolling')
    })
  })

  describe.skipIf(isJSDOM)('overflow attributes', () => {
    it('wheel: registers after the horizontal scrollbar becomes visible (RTL)', async () => {
      render(ConfigurableArea, {
        direction: 'rtl',
        contentWidth: SCROLLABLE_CONTENT_SIZE,
        contentHeight: VIEWPORT_SIZE,
        horizontal: true
      })

      const viewport = screen.getByTestId('viewport')
      const horizontalScrollbar = await screen.findByTestId('scrollbar-horizontal')

      await waitFor(() => expect(horizontalScrollbar).toHaveAttribute('data-has-overflow-x'))

      fireEvent.wheel(horizontalScrollbar, { deltaX: -50 })

      expect(viewport.scrollLeft).toBeCloseTo(-50, 0)
    })

    it('data overflow attributes on vertical and horizontal scrollbars', async () => {
      render(ConfigurableArea)

      const viewport = screen.getByTestId('viewport')
      const vScrollbar = screen.getByTestId('scrollbar-vertical')
      const hScrollbar = screen.getByTestId('scrollbar-horizontal')

      await waitFor(() => expect(vScrollbar).toHaveAttribute('data-has-overflow-y'))
      expect(vScrollbar).not.toHaveAttribute('data-overflow-y-start')
      expect(vScrollbar).toHaveAttribute('data-overflow-y-end')
      expect(hScrollbar).toHaveAttribute('data-has-overflow-x')
      expect(hScrollbar).not.toHaveAttribute('data-overflow-x-start')
      expect(hScrollbar).toHaveAttribute('data-overflow-x-end')

      const halfY = (viewport.scrollHeight - viewport.clientHeight) / 2
      const halfX = (viewport.scrollWidth - viewport.clientWidth) / 2
      fireEvent.scroll(viewport, { target: { scrollTop: halfY, scrollLeft: halfX } })
      await Promise.resolve()

      expect(vScrollbar).toHaveAttribute('data-overflow-y-start')
      expect(vScrollbar).toHaveAttribute('data-overflow-y-end')
      expect(hScrollbar).toHaveAttribute('data-overflow-x-start')
      expect(hScrollbar).toHaveAttribute('data-overflow-x-end')
    })
  })
})
