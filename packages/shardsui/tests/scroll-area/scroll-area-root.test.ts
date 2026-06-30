import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicScrollArea from './fixtures/basic-scroll-area.svelte'
import ConfigurableArea from './fixtures/configurable-area.svelte'
import ContentToggle from './fixtures/content-toggle.svelte'
import CornerSizeProbeArea from './fixtures/corner-size-probe-area.svelte'
import ScrollAreaHandlers from './fixtures/scroll-area-handlers.svelte'
import {
  mockScrollX,
  mockScrollY,
  SCROLL_TIMEOUT,
  SCROLLABLE_CONTENT_SIZE,
  VIEWPORT_SIZE
} from './fixtures/scroll-metrics'
import VisibilityToggle from './fixtures/visibility-toggle.svelte'

async function withMockResizeObserver(test: (notifyResizeObserver: () => void) => Promise<void>) {
  const originalResizeObserver = window.ResizeObserver
  const observers = new Set<ResizeObserverMock>()

  class ResizeObserverMock implements ResizeObserver {
    callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
    }
    observe() {
      observers.add(this)
    }
    unobserve() {}
    disconnect() {
      observers.delete(this)
    }
    takeRecords() {
      return []
    }
  }

  window.ResizeObserver = ResizeObserverMock
  try {
    await test(() => {
      expect(observers.size).toBeGreaterThan(0)
      observers.forEach((observer) => observer.callback([], observer))
    })
  } finally {
    window.ResizeObserver = originalResizeObserver
  }
}

describe('<ScrollArea.Root />', () => {
  it('renders a custom as element', () => {
    render(BasicScrollArea, { rootAs: 'section' })
    expect(screen.getByTestId('root').tagName.toLowerCase()).toBe('section')
  })

  describe('data-scrolling attribute', () => {
    it('adds data-scrolling to root when the viewport is scrolled and removes it after the timeout', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        render(BasicScrollArea)
        const root = screen.getByTestId('root')
        const viewport = screen.getByTestId('viewport')

        expect(root).not.toHaveAttribute('data-scrolling')

        viewport.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
        mockScrollY(viewport, 1)
        viewport.dispatchEvent(new Event('scroll', { bubbles: false }))
        await tick()

        expect(root).toHaveAttribute('data-scrolling')

        vi.advanceTimersByTime(SCROLL_TIMEOUT - 1)
        await tick()
        expect(root).toHaveAttribute('data-scrolling')

        vi.advanceTimersByTime(1)
        await tick()
        expect(root).not.toHaveAttribute('data-scrolling')

        viewport.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
        mockScrollX(viewport, 1)
        viewport.dispatchEvent(new Event('scroll', { bubbles: false }))
        await tick()

        expect(root).toHaveAttribute('data-scrolling')

        vi.advanceTimersByTime(SCROLL_TIMEOUT)
        await tick()
        expect(root).not.toHaveAttribute('data-scrolling')
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('consumer event handler chaining', () => {
    it('calls a consumer viewport scroll handler and still marks the area as scrolling', async () => {
      const onRootPointerMove = vi.fn()
      const onViewportScroll = vi.fn()
      render(ScrollAreaHandlers, { onRootPointerMove, onViewportScroll })

      const root = screen.getByTestId('root')
      const viewport = screen.getByTestId('viewport')

      const moveEvent = new PointerEvent('pointermove', { bubbles: true })
      Object.defineProperty(moveEvent, 'pointerType', { configurable: true, value: 'mouse' })
      await fireEvent(viewport, moveEvent)
      expect(onRootPointerMove).toHaveBeenCalledOnce()
      expect(screen.getByTestId('scrollbar-vertical')).toHaveAttribute('data-hovering', '')

      mockScrollY(viewport, 1)
      await fireEvent.scroll(viewport)

      expect(onViewportScroll).toHaveBeenCalledOnce()
      expect(root).toHaveAttribute('data-scrolling')
    })

    it('calls a consumer scrollbar pointer handler and still scrolls on track press', async () => {
      const onScrollbarPointerDown = vi.fn()
      render(ScrollAreaHandlers, { onScrollbarPointerDown })

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

      expect(onScrollbarPointerDown).toHaveBeenCalledOnce()
      expect(viewport.scrollTop).not.toBe(0)
    })
  })

  describe.skipIf(isJSDOM)('sizing', () => {
    it('recomputes thumb size when becoming visible without requiring scroll', async () => {
      const user = userEvent.setup()
      render(VisibilityToggle)

      await user.click(screen.getByRole('button', { name: 'show' }))

      const verticalThumb = await screen.findByTestId('vertical-thumb')

      await waitFor(() => {
        expect(
          getComputedStyle(verticalThumb).getPropertyValue('--scroll-area-thumb-height')
        ).not.toBe('0px')
      })
    })

    it('shows scrollbars after mount compute before the first ResizeObserver measurement', async () => {
      await withMockResizeObserver(async (notifyResizeObserver) => {
        render(ConfigurableArea, { horizontal: false })

        const verticalScrollbar = await screen.findByTestId('scrollbar-vertical')

        await waitFor(() => {
          expect(getComputedStyle(verticalScrollbar).visibility).toBe('visible')
        })

        notifyResizeObserver()
        await tick()

        await waitFor(() => {
          expect(getComputedStyle(verticalScrollbar).visibility).toBe('visible')
        })
      })
    })

    it('shows keepMounted scrollbar track and thumb after mount compute', async () => {
      await withMockResizeObserver(async (notifyResizeObserver) => {
        render(ConfigurableArea, { horizontal: false, keepMounted: true })

        const verticalScrollbar = await screen.findByTestId('scrollbar-vertical')
        const verticalThumb = await screen.findByTestId('thumb-vertical')

        await waitFor(() => {
          expect(getComputedStyle(verticalScrollbar).visibility).toBe('visible')
        })
        await waitFor(() => {
          expect(getComputedStyle(verticalThumb).visibility).toBe('visible')
        })

        notifyResizeObserver()
        await tick()

        await waitFor(() => {
          expect(getComputedStyle(verticalScrollbar).visibility).toBe('visible')
        })
        await waitFor(() => {
          expect(getComputedStyle(verticalThumb).visibility).toBe('visible')
        })
      })
    })

    it('recomputes corner size when content starts overflowing', async () => {
      await withMockResizeObserver(async (notifyResizeObserver) => {
        const { rerender } = render(ConfigurableArea, {
          contentWidth: VIEWPORT_SIZE / 2,
          contentHeight: VIEWPORT_SIZE / 2,
          corner: true,
          vScrollbarStyle: 'width: 11px;',
          hScrollbarStyle: 'height: 13px;'
        })

        notifyResizeObserver()
        await tick()

        expect(screen.queryByTestId('corner')).toBe(null)

        await rerender({
          contentWidth: SCROLLABLE_CONTENT_SIZE,
          contentHeight: SCROLLABLE_CONTENT_SIZE,
          corner: true,
          vScrollbarStyle: 'width: 11px;',
          hScrollbarStyle: 'height: 13px;'
        })

        notifyResizeObserver()
        await tick()

        await waitFor(() => {
          const style = getComputedStyle(screen.getByTestId('corner'))
          expect(style.getPropertyValue('--scroll-area-corner-width')).toBe('11px')
        })
        expect(
          getComputedStyle(screen.getByTestId('corner')).getPropertyValue(
            '--scroll-area-corner-height'
          )
        ).toBe('13px')
      })
    })

    it('clears corner, overflow attributes, and metrics when content stops overflowing', async () => {
      await withMockResizeObserver(async (notifyResizeObserver) => {
        const overflowing = {
          contentWidth: SCROLLABLE_CONTENT_SIZE,
          contentHeight: SCROLLABLE_CONTENT_SIZE,
          corner: true,
          keepMounted: true,
          vScrollbarStyle: 'width: 11px;',
          hScrollbarStyle: 'height: 13px;'
        }
        const { rerender } = render(ConfigurableArea, overflowing)

        const root = screen.getByTestId('root')
        const viewport = screen.getByTestId('viewport')

        await waitFor(() => expect(root).toHaveAttribute('data-has-overflow-x'))
        await waitFor(() => expect(root).toHaveAttribute('data-has-overflow-y'))
        expect(screen.getByTestId('corner')).toBeInTheDocument()
        expect(viewport.style.getPropertyValue('--scroll-area-overflow-x-end')).not.toBe('0px')
        expect(viewport.style.getPropertyValue('--scroll-area-overflow-y-end')).not.toBe('0px')

        await rerender({
          ...overflowing,
          contentWidth: VIEWPORT_SIZE / 2,
          contentHeight: VIEWPORT_SIZE / 2
        })

        notifyResizeObserver()
        await tick()

        await waitFor(() => expect(root).not.toHaveAttribute('data-has-overflow-x'))
        await waitFor(() => expect(root).not.toHaveAttribute('data-has-overflow-y'))
        expect(screen.queryByTestId('corner')).toBe(null)
        expect(viewport.style.getPropertyValue('--scroll-area-overflow-x-start')).toBe('0px')
        expect(viewport.style.getPropertyValue('--scroll-area-overflow-x-end')).toBe('0px')
        expect(viewport.style.getPropertyValue('--scroll-area-overflow-y-start')).toBe('0px')
        expect(viewport.style.getPropertyValue('--scroll-area-overflow-y-end')).toBe('0px')
      })
    })

    it('correctly set thumb height and width based on scrollable content', async () => {
      render(ConfigurableArea)

      const verticalThumb = screen.getByTestId('thumb-vertical')
      const horizontalThumb = screen.getByTestId('thumb-horizontal')

      await waitFor(() => {
        expect(getComputedStyle(verticalThumb).getPropertyValue('--scroll-area-thumb-height')).toBe(
          `${(VIEWPORT_SIZE / SCROLLABLE_CONTENT_SIZE) * VIEWPORT_SIZE}px`
        )
      })
      expect(getComputedStyle(horizontalThumb).getPropertyValue('--scroll-area-thumb-width')).toBe(
        `${(VIEWPORT_SIZE / SCROLLABLE_CONTENT_SIZE) * VIEWPORT_SIZE}px`
      )
    })

    it('does not add padding for overlay scrollbars', async () => {
      render(ConfigurableArea, {
        content: true,
        vScrollbarStyle: 'width: 10px; height: 100%;',
        hScrollbarStyle: 'height: 10px; width: 100%;'
      })

      const contentWrapper = screen.getByTestId('viewport').firstElementChild as HTMLElement
      const style = getComputedStyle(contentWrapper)

      expect(style.paddingLeft).toBe('0px')
      expect(style.paddingRight).toBe('0px')
      expect(style.paddingBottom).toBe('0px')
    })

    it('accounts for scrollbar padding', async () => {
      const PADDING = 8
      render(ConfigurableArea, {
        vScrollbarStyle: `padding-block: ${PADDING}px;`,
        hScrollbarStyle: `padding-inline: ${PADDING}px;`
      })

      const verticalThumb = screen.getByTestId('thumb-vertical')
      const horizontalThumb = screen.getByTestId('thumb-horizontal')

      await waitFor(() => {
        expect(getComputedStyle(verticalThumb).getPropertyValue('--scroll-area-thumb-height')).toBe(
          `${(VIEWPORT_SIZE - PADDING * 2) * (VIEWPORT_SIZE / SCROLLABLE_CONTENT_SIZE)}px`
        )
      })
      expect(getComputedStyle(horizontalThumb).getPropertyValue('--scroll-area-thumb-width')).toBe(
        `${(VIEWPORT_SIZE - PADDING * 2) * (VIEWPORT_SIZE / SCROLLABLE_CONTENT_SIZE)}px`
      )
    })

    it('accounts for scrollbar margin', async () => {
      const margin = 11
      const viewportSize = 390
      render(ConfigurableArea, {
        viewportSize,
        vScrollbarStyle: `margin-inline: ${margin}px;`,
        hScrollbarStyle: `margin-block: ${margin}px;`
      })

      const verticalThumb = screen.getByTestId('thumb-vertical')
      const horizontalThumb = screen.getByTestId('thumb-horizontal')

      await waitFor(() => {
        expect(getComputedStyle(verticalThumb).getPropertyValue('--scroll-area-thumb-height')).toBe(
          `${viewportSize * (viewportSize / SCROLLABLE_CONTENT_SIZE)}px`
        )
      })
      expect(getComputedStyle(horizontalThumb).getPropertyValue('--scroll-area-thumb-width')).toBe(
        `${viewportSize * (viewportSize / SCROLLABLE_CONTENT_SIZE)}px`
      )
    })

    it('accounts for thumb margin', async () => {
      const MARGIN = 8
      render(ConfigurableArea, {
        vThumbStyle: `margin-block: ${MARGIN}px;`,
        hThumbStyle: `margin-inline: ${MARGIN}px;`
      })

      const verticalThumb = screen.getByTestId('thumb-vertical')
      const horizontalThumb = screen.getByTestId('thumb-horizontal')

      await waitFor(() => {
        expect(getComputedStyle(verticalThumb).getPropertyValue('--scroll-area-thumb-height')).toBe(
          `${(VIEWPORT_SIZE - MARGIN * 2) * (VIEWPORT_SIZE / SCROLLABLE_CONTENT_SIZE)}px`
        )
      })
      expect(getComputedStyle(horizontalThumb).getPropertyValue('--scroll-area-thumb-width')).toBe(
        `${(VIEWPORT_SIZE - MARGIN * 2) * (VIEWPORT_SIZE / SCROLLABLE_CONTENT_SIZE)}px`
      )
    })
  })

  describe.skipIf(isJSDOM)('overflow data attributes', () => {
    it('recomputes horizontal overflow edges when direction changes', async () => {
      const { rerender } = render(ConfigurableArea, {
        direction: 'ltr',
        contentWidth: SCROLLABLE_CONTENT_SIZE,
        contentHeight: VIEWPORT_SIZE,
        horizontal: true
      })

      const root = screen.getByTestId('root')
      const viewport = screen.getByTestId('viewport')

      await waitFor(() => expect(root).toHaveAttribute('data-has-overflow-x'))

      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth

      fireEvent.scroll(viewport, { target: { scrollLeft: maxScrollLeft / 2 } })

      await waitFor(() => expect(root).toHaveAttribute('data-overflow-x-start'))
      expect(root).toHaveAttribute('data-overflow-x-end')

      await rerender({
        direction: 'rtl',
        contentWidth: SCROLLABLE_CONTENT_SIZE,
        contentHeight: VIEWPORT_SIZE,
        horizontal: true
      })

      viewport.scrollLeft = -maxScrollLeft
      fireEvent.scroll(viewport, { target: { scrollLeft: -maxScrollLeft } })

      await waitFor(() => expect(root).toHaveAttribute('data-overflow-x-start'))
      expect(root).not.toHaveAttribute('data-overflow-x-end')
    })

    it('measures content mounted after the viewport initial measurement', async () => {
      const user = userEvent.setup()
      render(ContentToggle)

      const root = screen.getByTestId('root')
      const viewport = screen.getByTestId('viewport')

      await waitFor(() => expect(root).not.toHaveAttribute('data-has-overflow-y'))
      expect(viewport).toHaveAttribute('tabindex', '-1')

      await user.click(screen.getByText('show'))

      await waitFor(() => expect(root).toHaveAttribute('data-has-overflow-x'))
      await waitFor(() => expect(root).toHaveAttribute('data-has-overflow-y'))
      await waitFor(() => expect(viewport).toHaveAttribute('tabindex', '0'))
    })

    it('applies data attributes on root, viewport and scrollbars based on overflow and edges', async () => {
      render(ConfigurableArea, { content: true })

      const root = screen.getByTestId('root')
      const viewport = screen.getByTestId('viewport')
      const content = screen.getByTestId('content')
      const vScrollbar = screen.getByTestId('scrollbar-vertical')
      const hScrollbar = screen.getByTestId('scrollbar-horizontal')

      await waitFor(() => expect(root).toHaveAttribute('data-has-overflow-x'))
      expect(root).toHaveAttribute('data-has-overflow-y')
      expect(root).not.toHaveAttribute('data-overflow-x-start')
      expect(root).toHaveAttribute('data-overflow-x-end')
      expect(root).not.toHaveAttribute('data-overflow-y-start')
      expect(root).toHaveAttribute('data-overflow-y-end')

      expect(viewport).toHaveAttribute('data-has-overflow-x')
      expect(viewport).toHaveAttribute('data-has-overflow-y')
      expect(viewport).not.toHaveAttribute('data-overflow-x-start')
      expect(viewport).toHaveAttribute('data-overflow-x-end')
      expect(viewport).not.toHaveAttribute('data-overflow-y-start')
      expect(viewport).toHaveAttribute('data-overflow-y-end')
      expect(content).toHaveAttribute('data-has-overflow-x')
      expect(content).toHaveAttribute('data-has-overflow-y')
      expect(content).not.toHaveAttribute('data-overflow-x-start')
      expect(content).toHaveAttribute('data-overflow-x-end')
      expect(content).not.toHaveAttribute('data-overflow-y-start')
      expect(content).toHaveAttribute('data-overflow-y-end')

      expect(vScrollbar).toHaveAttribute('data-has-overflow-y')
      expect(vScrollbar).not.toHaveAttribute('data-overflow-y-start')
      expect(vScrollbar).toHaveAttribute('data-overflow-y-end')
      expect(hScrollbar).toHaveAttribute('data-has-overflow-x')
      expect(hScrollbar).not.toHaveAttribute('data-overflow-x-start')
      expect(hScrollbar).toHaveAttribute('data-overflow-x-end')
      const halfY = (viewport.scrollHeight - viewport.clientHeight) / 2
      const halfX = (viewport.scrollWidth - viewport.clientWidth) / 2
      fireEvent.scroll(viewport, { target: { scrollTop: halfY, scrollLeft: halfX } })
      await Promise.resolve()

      expect(root).toHaveAttribute('data-overflow-y-start')
      expect(root).toHaveAttribute('data-overflow-y-end')
      expect(root).toHaveAttribute('data-overflow-x-start')
      expect(root).toHaveAttribute('data-overflow-x-end')

      expect(viewport).toHaveAttribute('data-overflow-y-start')
      expect(viewport).toHaveAttribute('data-overflow-y-end')
      expect(viewport).toHaveAttribute('data-overflow-x-start')
      expect(viewport).toHaveAttribute('data-overflow-x-end')
      expect(content).toHaveAttribute('data-overflow-y-start')
      expect(content).toHaveAttribute('data-overflow-y-end')
      expect(content).toHaveAttribute('data-overflow-x-start')
      expect(content).toHaveAttribute('data-overflow-x-end')

      expect(vScrollbar).toHaveAttribute('data-overflow-y-start')
      expect(vScrollbar).toHaveAttribute('data-overflow-y-end')
      expect(hScrollbar).toHaveAttribute('data-overflow-x-start')
      expect(hScrollbar).toHaveAttribute('data-overflow-x-end')
      fireEvent.scroll(viewport, {
        target: {
          scrollTop: viewport.scrollHeight - viewport.clientHeight,
          scrollLeft: viewport.scrollWidth - viewport.clientWidth
        }
      })
      await Promise.resolve()

      expect(root).toHaveAttribute('data-overflow-y-start')
      expect(root).not.toHaveAttribute('data-overflow-y-end')
      expect(root).toHaveAttribute('data-overflow-x-start')
      expect(root).not.toHaveAttribute('data-overflow-x-end')

      expect(viewport).toHaveAttribute('data-overflow-y-start')
      expect(viewport).not.toHaveAttribute('data-overflow-y-end')
      expect(viewport).toHaveAttribute('data-overflow-x-start')
      expect(viewport).not.toHaveAttribute('data-overflow-x-end')
      expect(content).toHaveAttribute('data-overflow-y-start')
      expect(content).not.toHaveAttribute('data-overflow-y-end')
      expect(content).toHaveAttribute('data-overflow-x-start')
      expect(content).not.toHaveAttribute('data-overflow-x-end')

      expect(vScrollbar).toHaveAttribute('data-overflow-y-start')
      expect(vScrollbar).not.toHaveAttribute('data-overflow-y-end')
      expect(hScrollbar).toHaveAttribute('data-overflow-x-start')
      expect(hScrollbar).not.toHaveAttribute('data-overflow-x-end')
    })

    it('treats near-edge scroll offsets as fully scrolled', async () => {
      render(ConfigurableArea, { content: true })

      const root = screen.getByTestId('root')
      const viewport = screen.getByTestId('viewport')

      const maxScrollTop = viewport.scrollHeight - viewport.clientHeight
      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth

      fireEvent.scroll(viewport, {
        target: { scrollTop: maxScrollTop - 0.5, scrollLeft: maxScrollLeft - 0.5 }
      })
      await Promise.resolve()

      expect(root).toHaveAttribute('data-overflow-y-start')
      expect(root).not.toHaveAttribute('data-overflow-y-end')
      expect(root).toHaveAttribute('data-overflow-x-start')
      expect(root).not.toHaveAttribute('data-overflow-x-end')
    })

    it('respects overflowEdgeThreshold and exposes scroll metrics', async () => {
      render(ConfigurableArea, { content: true, overflowEdgeThreshold: { xStart: 20, yStart: 5 } })

      const viewport = screen.getByTestId('viewport')

      fireEvent.scroll(viewport, { target: { scrollLeft: 15, scrollTop: 7 } })

      await waitFor(() => expect(viewport).not.toHaveAttribute('data-overflow-x-start'))
      expect(viewport).toHaveAttribute('data-overflow-y-start')

      fireEvent.scroll(viewport, { target: { scrollLeft: 35, scrollTop: 7 } })

      await waitFor(() => expect(viewport).toHaveAttribute('data-overflow-x-start'))

      const startPx = viewport.style.getPropertyValue('--scroll-area-overflow-x-start')
      expect(parseFloat(startPx)).toBeCloseTo(viewport.scrollLeft, 1)

      const horizontalEndPx = viewport.style.getPropertyValue('--scroll-area-overflow-x-end')
      expect(horizontalEndPx).not.toBe('')
      expect(horizontalEndPx).not.toBe('0px')
    })

    it('applies numeric overflowEdgeThreshold to every edge', async () => {
      render(ConfigurableArea, { content: true, overflowEdgeThreshold: 20 })

      const viewport = screen.getByTestId('viewport')

      await waitFor(() => expect(viewport).toHaveAttribute('data-has-overflow-x'))

      fireEvent.scroll(viewport, { target: { scrollLeft: 15, scrollTop: 15 } })

      await waitFor(() => {
        expect(viewport).not.toHaveAttribute('data-overflow-x-start')
        expect(viewport).not.toHaveAttribute('data-overflow-y-start')
        expect(viewport).toHaveAttribute('data-overflow-x-end')
        expect(viewport).toHaveAttribute('data-overflow-y-end')
      })

      fireEvent.scroll(viewport, {
        target: {
          scrollLeft: viewport.scrollWidth - viewport.clientWidth - 15,
          scrollTop: viewport.scrollHeight - viewport.clientHeight - 15
        }
      })

      await waitFor(() => {
        expect(viewport).toHaveAttribute('data-overflow-x-start')
        expect(viewport).toHaveAttribute('data-overflow-y-start')
        expect(viewport).not.toHaveAttribute('data-overflow-x-end')
        expect(viewport).not.toHaveAttribute('data-overflow-y-end')
      })
    })

    it('recomputes overflow edges when overflowEdgeThreshold changes', async () => {
      const { rerender } = render(ConfigurableArea, {
        content: true,
        horizontal: false,
        overflowEdgeThreshold: { yStart: 5 }
      })

      const viewport = screen.getByTestId('viewport')

      fireEvent.scroll(viewport, { target: { scrollTop: 10 } })
      await waitFor(() => expect(viewport).toHaveAttribute('data-overflow-y-start'))

      await rerender({ content: true, horizontal: false, overflowEdgeThreshold: { yStart: 20 } })
      await waitFor(() => expect(viewport).not.toHaveAttribute('data-overflow-y-start'))
    })

    it('does not add state attributes when content does not overflow', async () => {
      render(ConfigurableArea, {
        content: true,
        keepMounted: true,
        contentWidth: VIEWPORT_SIZE / 2,
        contentHeight: VIEWPORT_SIZE / 2
      })

      const root = screen.getByTestId('root')
      const viewport = screen.getByTestId('viewport')
      const content = screen.getByTestId('content')
      const vScrollbar = screen.getByTestId('scrollbar-vertical')
      const hScrollbar = screen.getByTestId('scrollbar-horizontal')

      expect(root).not.toHaveAttribute('data-has-overflow-x')
      expect(root).not.toHaveAttribute('data-has-overflow-y')
      expect(root).not.toHaveAttribute('data-overflow-x-start')
      expect(root).not.toHaveAttribute('data-overflow-x-end')
      expect(root).not.toHaveAttribute('data-overflow-y-start')
      expect(root).not.toHaveAttribute('data-overflow-y-end')

      expect(viewport).not.toHaveAttribute('data-overflow-x-start')
      expect(viewport).not.toHaveAttribute('data-overflow-x-end')
      expect(viewport).not.toHaveAttribute('data-overflow-y-start')
      expect(viewport).not.toHaveAttribute('data-overflow-y-end')
      expect(content).not.toHaveAttribute('data-overflow-x-start')
      expect(content).not.toHaveAttribute('data-overflow-x-end')
      expect(content).not.toHaveAttribute('data-overflow-y-start')
      expect(content).not.toHaveAttribute('data-overflow-y-end')

      expect(vScrollbar).not.toHaveAttribute('data-overflow-y-start')
      expect(vScrollbar).not.toHaveAttribute('data-overflow-y-end')
      expect(hScrollbar).not.toHaveAttribute('data-overflow-x-start')
      expect(hScrollbar).not.toHaveAttribute('data-overflow-x-end')
    })

    it('correctly handles RTL', async () => {
      render(ConfigurableArea, {
        direction: 'rtl',
        contentWidth: SCROLLABLE_CONTENT_SIZE,
        contentHeight: VIEWPORT_SIZE,
        horizontal: true
      })

      const root = screen.getByTestId('root')
      const viewport = screen.getByTestId('viewport')

      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth
      fireEvent.scroll(viewport, { target: { scrollLeft: 0 } })

      await waitFor(() => expect(root).toHaveAttribute('data-has-overflow-x'))
      expect(root).not.toHaveAttribute('data-overflow-x-start')
      expect(root).toHaveAttribute('data-overflow-x-end')

      fireEvent.scroll(viewport, { target: { scrollLeft: -maxScrollLeft / 2 } })

      await waitFor(() => expect(root).toHaveAttribute('data-overflow-x-start'))
      expect(root).toHaveAttribute('data-overflow-x-end')

      fireEvent.scroll(viewport, { target: { scrollLeft: -maxScrollLeft } })

      await waitFor(() => expect(root).toHaveAttribute('data-overflow-x-start'))
      expect(root).not.toHaveAttribute('data-overflow-x-end')
    })
  })

  describe.skipIf(isJSDOM)('context stability', () => {
    it('does not re-render parts on scroll when the corner size is unchanged', async () => {
      const onRead = vi.fn()
      render(CornerSizeProbeArea, { onRead })

      const viewport = screen.getByTestId('viewport')

      await waitFor(() => {
        expect(
          getComputedStyle(screen.getByTestId('corner')).getPropertyValue(
            '--scroll-area-corner-width'
          )
        ).toBe('10px')
      })
      await tick()

      const countBeforeScroll = onRead.mock.calls.length

      for (let i = 0; i < 3; i += 1) {
        fireEvent.scroll(viewport, { target: { scrollTop: 0, scrollLeft: 0 } })
      }
      await tick()

      expect(onRead).toHaveBeenCalledTimes(countBeforeScroll)
    })
  })
})
