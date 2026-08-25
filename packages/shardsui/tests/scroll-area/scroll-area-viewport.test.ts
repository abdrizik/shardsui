import { ScrollArea } from '$lib/components/scroll-area'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { tick } from 'svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AnimatedViewport from './fixtures/animated-viewport.svelte'
import BasicScrollArea from './fixtures/basic-scroll-area.svelte'
import ConfigurableArea from './fixtures/configurable-area.svelte'
import OverscrollArea from './fixtures/overscroll-area.svelte'
import PlainScrollArea from './fixtures/plain-scroll-area.svelte'
import { mockScrollX, mockScrollY, SCROLL_TIMEOUT, VIEWPORT_SIZE } from './fixtures/scroll-metrics'
import UnmountingViewport from './fixtures/unmounting-viewport.svelte'

async function advance(ms: number) {
  vi.advanceTimersByTime(ms)
  await tick()
}

describe('<ScrollArea.Viewport />', () => {
  it('renders a custom as element', () => {
    render(BasicScrollArea, { viewportAs: 'section' })
    expect(screen.getByTestId('viewport').tagName.toLowerCase()).toBe('section')
  })

  it('throws when rendered outside a ScrollArea.Root', () => {
    expect(() => render(ScrollArea.Viewport)).toThrow(
      'ShardsUI: this part must be rendered inside <ScrollArea.Root>.'
    )
  })

  it('handles a user scroll callback unmounting the viewport', async () => {
    render(UnmountingViewport, { on: 'scroll' })

    expect(() => fireEvent.scroll(screen.getByTestId('viewport'))).not.toThrow()
    expect(screen.queryByTestId('viewport')).toBe(null)
  })

  describe.skipIf(isJSDOM)('subtree animations', () => {
    it('recomputes overflow after a subtree animation finishes', async () => {
      let scrollWidth = 100
      let resolveAnimation: () => void = () => {}
      const finished = new Promise<void>((resolve) => {
        resolveAnimation = resolve
      })
      const getAnimations = vi.fn(() => [{ finished }])

      render(AnimatedViewport)

      const root = screen.getByTestId('root')
      Object.defineProperties(screen.getByTestId('viewport'), {
        clientHeight: { configurable: true, value: 100 },
        clientWidth: { configurable: true, value: 100 },
        scrollHeight: { configurable: true, value: 100 },
        scrollWidth: { configurable: true, get: () => scrollWidth },
        getAnimations: { configurable: true, value: getAnimations }
      })

      await waitFor(() => expect(getAnimations).toHaveBeenCalled())
      expect(root).not.toHaveAttribute('data-has-overflow-x')

      scrollWidth = 1000
      resolveAnimation()
      await finished

      await waitFor(() => expect(root).toHaveAttribute('data-has-overflow-x'))
    })

    it('ignores an animation finishing after its viewport unmounts', async () => {
      let resolveAnimation: () => void = () => {}
      const finished = new Promise<void>((resolve) => {
        resolveAnimation = resolve
      })
      const getAnimations = vi.fn(() => [{ finished }])

      const { rerender } = render(AnimatedViewport)

      Object.defineProperty(screen.getByTestId('viewport'), 'getAnimations', {
        configurable: true,
        value: getAnimations
      })

      await waitFor(() => expect(getAnimations).toHaveBeenCalled())

      await rerender({ mounted: false })
      expect(screen.queryByTestId('viewport')).toBe(null)

      resolveAnimation()
      await finished
      await tick()
    })
  })

  describe('data-scrolling attribute', () => {
    it('adds data-scrolling to viewport when scrolled vertically or horizontally', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        render(BasicScrollArea)
        const viewport = screen.getByTestId('viewport')

        expect(viewport).not.toHaveAttribute('data-scrolling')

        viewport.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
        mockScrollY(viewport, 1)
        viewport.dispatchEvent(new Event('scroll', { bubbles: false }))
        await tick()

        expect(viewport).toHaveAttribute('data-scrolling')

        vi.advanceTimersByTime(SCROLL_TIMEOUT)
        await tick()
        expect(viewport).not.toHaveAttribute('data-scrolling')

        viewport.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
        mockScrollX(viewport, 1)
        viewport.dispatchEvent(new Event('scroll', { bubbles: false }))
        await tick()

        expect(viewport).toHaveAttribute('data-scrolling')

        vi.advanceTimersByTime(SCROLL_TIMEOUT)
        await tick()
        expect(viewport).not.toHaveAttribute('data-scrolling')
      } finally {
        vi.useRealTimers()
      }
    })

    it('ignores data-scrolling during programmatic scroll', async () => {
      render(PlainScrollArea, { viewportStyle: 'pointer-events: none;' })
      const viewport = screen.getByTestId('viewport')

      mockScrollY(viewport, 1)
      await fireEvent.scroll(viewport)

      expect(viewport).not.toHaveAttribute('data-scrolling')
    })

    it('adds [data-scrolling] in touch modality even when the gesture delivers no events', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        render(PlainScrollArea)
        const viewport = screen.getByTestId('viewport')

        const down = new PointerEvent('pointerdown', { bubbles: true })
        Object.defineProperty(down, 'pointerType', { configurable: true, value: 'touch' })
        viewport.dispatchEvent(down)

        await advance(200)
        mockScrollY(viewport, 1)
        viewport.dispatchEvent(new Event('scroll', { bubbles: false }))
        await tick()

        expect(viewport).toHaveAttribute('data-scrolling')

        await advance(SCROLL_TIMEOUT)
        expect(viewport).not.toHaveAttribute('data-scrolling')
      } finally {
        vi.useRealTimers()
      }
    })

    it('keeps ignoring programmatic scrolls in mouse modality', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        render(PlainScrollArea, { viewportStyle: 'pointer-events: none;' })
        const viewport = screen.getByTestId('viewport')

        const down = new PointerEvent('pointerdown', { bubbles: true })
        Object.defineProperty(down, 'pointerType', { configurable: true, value: 'mouse' })
        viewport.dispatchEvent(down)

        await advance(200)
        mockScrollY(viewport, 1)
        viewport.dispatchEvent(new Event('scroll', { bubbles: false }))

        await advance(SCROLL_TIMEOUT)
        expect(viewport).not.toHaveAttribute('data-scrolling')
      } finally {
        vi.useRealTimers()
      }
    })

    it('restores programmatic scroll suppression after modality flips back to mouse', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        render(PlainScrollArea, { viewportStyle: 'pointer-events: none;' })
        const root = screen.getByTestId('root')
        const viewport = screen.getByTestId('viewport')

        const down = new PointerEvent('pointerdown', { bubbles: true })
        Object.defineProperty(down, 'pointerType', { configurable: true, value: 'touch' })
        viewport.dispatchEvent(down)
        mockScrollY(viewport, 1)
        viewport.dispatchEvent(new Event('scroll', { bubbles: false }))
        await tick()

        expect(viewport).toHaveAttribute('data-scrolling')

        await advance(SCROLL_TIMEOUT)
        expect(viewport).not.toHaveAttribute('data-scrolling')

        const move = new PointerEvent('pointermove', { bubbles: true })
        Object.defineProperty(move, 'pointerType', { configurable: true, value: 'mouse' })
        root.dispatchEvent(move)
        mockScrollY(viewport, 2)
        viewport.dispatchEvent(new Event('scroll', { bubbles: false }))
        await tick()

        expect(viewport).not.toHaveAttribute('data-scrolling')
      } finally {
        vi.useRealTimers()
      }
    })

    it('removes data-scrolling from viewport after timeout', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        render(BasicScrollArea)
        const viewport = screen.getByTestId('viewport')

        viewport.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
        mockScrollY(viewport, 1)
        viewport.dispatchEvent(new Event('scroll', { bubbles: false }))
        await tick()

        expect(viewport).toHaveAttribute('data-scrolling')

        vi.advanceTimersByTime(SCROLL_TIMEOUT - 1)
        await tick()
        expect(viewport).toHaveAttribute('data-scrolling')

        vi.advanceTimersByTime(1)
        await tick()
        expect(viewport).not.toHaveAttribute('data-scrolling')
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe.skipIf(isJSDOM)('overflow attributes', () => {
    it('applies data attributes on viewport (overflow)', async () => {
      render(ConfigurableArea, { horizontal: false })

      const viewport = screen.getByTestId('viewport')

      await waitFor(() => expect(viewport).toHaveAttribute('data-has-overflow-x'))
      expect(viewport).toHaveAttribute('data-has-overflow-y')
      expect(viewport).not.toHaveAttribute('data-overflow-x-start')
      expect(viewport).toHaveAttribute('data-overflow-x-end')
      expect(viewport).not.toHaveAttribute('data-overflow-y-start')
      expect(viewport).toHaveAttribute('data-overflow-y-end')
    })
  })

  // Only Safari reports an out-of-range `scrollTop`/`scrollLeft` while rubber-banding, and the
  // browser clamps the property on assignment, so the getter is mocked to emulate it against
  // real layout.
  describe.skipIf(isJSDOM)('overscroll feedback', () => {
    const CONTENT_SIZE = 1000
    const MAX_SCROLL = CONTENT_SIZE - VIEWPORT_SIZE

    async function renderScrollArea(
      orientation: 'vertical' | 'horizontal',
      direction: 'ltr' | 'rtl' = 'ltr'
    ) {
      render(OverscrollArea, { orientation, direction })

      const viewport = screen.getByTestId('viewport')
      const scrollbar = screen.getByTestId('scrollbar')
      const thumb = screen.getByTestId('thumb')
      const axis = orientation === 'vertical' ? 'height' : 'width'
      await waitFor(() => expect(thumb.getBoundingClientRect()[axis]).toBeGreaterThan(0))

      return { viewport, scrollbar, thumb }
    }

    function overscroll(viewport: HTMLElement, prop: 'scrollTop' | 'scrollLeft', value: number) {
      Object.defineProperty(viewport, prop, { configurable: true, get: () => value })
      fireEvent.scroll(viewport)
    }

    it('shrinks and pins the thumb to the start edge while overscrolling past the top', async () => {
      const { viewport, scrollbar, thumb } = await renderScrollArea('vertical')

      const restingHeight = thumb.getBoundingClientRect().height

      overscroll(viewport, 'scrollTop', -50)

      await waitFor(() => expect(thumb.getBoundingClientRect().height).toBeLessThan(restingHeight))
      expect(thumb.getBoundingClientRect().height).toBeGreaterThan(restingHeight * 0.9)
      expect(thumb.getBoundingClientRect().top).toBeCloseTo(
        scrollbar.getBoundingClientRect().top,
        0
      )
    })

    it('shrinks and pins the thumb to the end edge while overscrolling past the bottom', async () => {
      const { viewport, scrollbar, thumb } = await renderScrollArea('vertical')

      const restingHeight = thumb.getBoundingClientRect().height

      overscroll(viewport, 'scrollTop', MAX_SCROLL + 50)

      await waitFor(() => expect(thumb.getBoundingClientRect().height).toBeLessThan(restingHeight))
      expect(thumb.getBoundingClientRect().height).toBeGreaterThan(restingHeight * 0.9)
      expect(thumb.getBoundingClientRect().bottom).toBeCloseTo(
        scrollbar.getBoundingClientRect().bottom,
        0
      )
    })

    it('restores the resting thumb size once the viewport settles back into range', async () => {
      const { viewport, thumb } = await renderScrollArea('vertical')

      const restingHeight = thumb.getBoundingClientRect().height

      overscroll(viewport, 'scrollTop', -50)
      await waitFor(() => expect(thumb.getBoundingClientRect().height).toBeLessThan(restingHeight))

      overscroll(viewport, 'scrollTop', 100)
      await waitFor(() =>
        expect(thumb.getBoundingClientRect().height).toBeCloseTo(restingHeight, 0)
      )
    })

    it('shrinks and pins the horizontal thumb to the inline start while overscrolling (LTR)', async () => {
      const { viewport, scrollbar, thumb } = await renderScrollArea('horizontal')

      const restingWidth = thumb.getBoundingClientRect().width

      overscroll(viewport, 'scrollLeft', -50)

      await waitFor(() => expect(thumb.getBoundingClientRect().width).toBeLessThan(restingWidth))
      expect(thumb.getBoundingClientRect().width).toBeGreaterThan(restingWidth * 0.9)
      expect(thumb.getBoundingClientRect().left).toBeCloseTo(
        scrollbar.getBoundingClientRect().left,
        0
      )
    })

    it('shrinks and pins the horizontal thumb to the inline end while overscrolling (LTR)', async () => {
      const { viewport, scrollbar, thumb } = await renderScrollArea('horizontal')

      const restingWidth = thumb.getBoundingClientRect().width

      overscroll(viewport, 'scrollLeft', MAX_SCROLL + 50)

      await waitFor(() => expect(thumb.getBoundingClientRect().width).toBeLessThan(restingWidth))
      expect(thumb.getBoundingClientRect().width).toBeGreaterThan(restingWidth * 0.9)
      expect(thumb.getBoundingClientRect().right).toBeCloseTo(
        scrollbar.getBoundingClientRect().right,
        0
      )
    })

    it('shrinks and pins the horizontal thumb to the inline start while overscrolling (RTL)', async () => {
      const { viewport, scrollbar, thumb } = await renderScrollArea('horizontal', 'rtl')

      const restingWidth = thumb.getBoundingClientRect().width

      overscroll(viewport, 'scrollLeft', 50)

      await waitFor(() => expect(thumb.getBoundingClientRect().width).toBeLessThan(restingWidth))
      expect(thumb.getBoundingClientRect().width).toBeGreaterThan(restingWidth * 0.9)
      expect(thumb.getBoundingClientRect().right).toBeCloseTo(
        scrollbar.getBoundingClientRect().right,
        0
      )
    })

    it('shrinks and pins the horizontal thumb to the inline end while overscrolling (RTL)', async () => {
      const { viewport, scrollbar, thumb } = await renderScrollArea('horizontal', 'rtl')

      const restingWidth = thumb.getBoundingClientRect().width

      overscroll(viewport, 'scrollLeft', -(MAX_SCROLL + 50))

      await waitFor(() => expect(thumb.getBoundingClientRect().width).toBeLessThan(restingWidth))
      expect(thumb.getBoundingClientRect().width).toBeGreaterThan(restingWidth * 0.9)
      expect(thumb.getBoundingClientRect().left).toBeCloseTo(
        scrollbar.getBoundingClientRect().left,
        0
      )
    })
  })
})
