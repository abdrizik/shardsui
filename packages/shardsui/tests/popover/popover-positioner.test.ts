import { render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import PopoverPositionerOutsidePortal from './fixtures/popover-positioner-outside-portal.svelte'
import PopoverWithViewport from './fixtures/popover-with-viewport.svelte'
import PositionerAnchorTracking from './fixtures/positioner-anchor-tracking.svelte'
import PositionerCollisionPadding from './fixtures/positioner-collision-padding.svelte'
import PositionerCustomAnchor from './fixtures/positioner-custom-anchor.svelte'
import PositionerOffsetProbe from './fixtures/positioner-offset-probe.svelte'
import Positioner from './fixtures/positioner.svelte'

describe('<Popover.Positioner />', () => {
  it('throws a descriptive error when rendered outside <Popover.Portal>', () => {
    expect(() => render(PopoverPositionerOutsidePortal)).toThrow(
      'ShardsUI: this part must be rendered inside <*.Portal>.'
    )
  })

  describe.skipIf(isJSDOM)('Positioner offsets', () => {
    function getRects() {
      const anchor = screen.getByTestId('trigger').getBoundingClientRect()
      const positioner = screen.getByTestId('positioner').getBoundingClientRect()
      return { anchor, positioner }
    }

    it('offsets the side when a number is specified', async () => {
      render(Positioner, { side: 'bottom', sideOffset: 10 })
      await waitFor(() => {
        const { anchor, positioner } = getRects()
        expect(Math.round(positioner.top - anchor.bottom)).toBe(10)
      })
    })

    it('offsets the side when a function is specified', async () => {
      render(Positioner, { side: 'bottom', sideOffset: () => 10 })
      await waitFor(() => {
        const { anchor, positioner } = getRects()
        expect(Math.round(positioner.top - anchor.bottom)).toBe(10)
      })
    })

    it('offsets the align when a number is specified', async () => {
      render(Positioner, { side: 'bottom', align: 'start', alignOffset: 10 })
      await waitFor(() => {
        const { anchor, positioner } = getRects()
        expect(Math.round(positioner.left - anchor.left)).toBe(10)
      })
    })

    it('offsets the align when a function is specified', async () => {
      render(Positioner, { side: 'bottom', align: 'start', alignOffset: () => 10 })
      await waitFor(() => {
        const { anchor, positioner } = getRects()
        expect(Math.round(positioner.left - anchor.left)).toBe(10)
      })
    })
  })

  describe.skipIf(isJSDOM)('offset function data', () => {
    it('reads the flipped side inside sideOffset', async () => {
      let side = 'none'
      render(PositionerOffsetProbe, {
        side: 'left',
        sideOffset: (data: { side: string }) => {
          side = data.side
          return 0
        }
      })

      await waitFor(() => expect(side).toBe('right'))
    })

    it('reads the flipped align inside sideOffset', async () => {
      let align = 'none'
      render(PositionerOffsetProbe, {
        side: 'right',
        align: 'start',
        sideOffset: (data: { align: string }) => {
          align = data.align
          return 0
        }
      })

      await waitFor(() => expect(align).toBe('end'))
    })

    it('reads the logical side inside sideOffset', async () => {
      let side = 'none'
      render(PositionerOffsetProbe, {
        side: 'inline-start',
        sideOffset: (data: { side: string }) => {
          side = data.side
          return 0
        }
      })

      await waitFor(() => expect(side).toBe('inline-end'))
    })

    it('reads the logical side inside sideOffset in RTL mode', async () => {
      let side = 'none'
      render(PositionerOffsetProbe, {
        side: 'inline-start',
        direction: 'rtl',
        sideOffset: (data: { side: string }) => {
          side = data.side
          return 0
        }
      })

      await waitFor(() => expect(side).toBe('inline-start'))
    })

    it('reads the flipped side inside alignOffset', async () => {
      let side = 'none'
      render(PositionerOffsetProbe, {
        side: 'left',
        alignOffset: (data: { side: string }) => {
          side = data.side
          return 0
        }
      })

      await waitFor(() => expect(side).toBe('right'))
    })

    it('reads the flipped align inside alignOffset', async () => {
      let align = 'none'
      render(PositionerOffsetProbe, {
        side: 'right',
        align: 'start',
        alignOffset: (data: { align: string }) => {
          align = data.align
          return 0
        }
      })

      await waitFor(() => expect(align).toBe('end'))
    })

    it('reads the logical side inside alignOffset', async () => {
      let side = 'none'
      render(PositionerOffsetProbe, {
        side: 'inline-start',
        alignOffset: (data: { side: string }) => {
          side = data.side
          return 0
        }
      })

      await waitFor(() => expect(side).toBe('inline-end'))
    })
  })

  describe.skipIf(isJSDOM)('anchor tracking', () => {
    it.each([false, true])('remains anchored when keepMounted=%s', async (keepMounted) => {
      const { rerender } = render(PositionerAnchorTracking, { top: 0, keepMounted })

      const positioner = screen.getByTestId('positioner')
      const initial = { x: 5, y: 100 }

      await waitFor(() => expect(positioner.getBoundingClientRect()).toMatchObject(initial))

      await rerender({ top: 100, keepMounted })

      await waitFor(() =>
        expect(positioner.getBoundingClientRect()).toMatchObject({ x: 5, y: 200 })
      )
    })

    it('observes a custom anchor for keepMounted auto-updates', async () => {
      const originalResizeObserver = window.ResizeObserver
      const observedElements: Element[] = []

      class TestResizeObserver implements ResizeObserver {
        observe(element: Element) {
          observedElements.push(element)
        }

        unobserve() {}

        disconnect() {}
      }

      window.ResizeObserver = TestResizeObserver

      try {
        render(PositionerCustomAnchor)
        const anchor = screen.getByTestId('custom-anchor')

        await waitFor(() => expect(observedElements).toContain(anchor))
      } finally {
        window.ResizeObserver = originalResizeObserver
      }
    })
  })

  it.skipIf(isJSDOM)('rests exactly at collisionPadding from the colliding edge', async () => {
    const collisionPadding = 12
    const { rerender } = render(PositionerCollisionPadding, { open: false, collisionPadding })

    await rerender({ open: true, collisionPadding })

    const positioner = screen.getByTestId('positioner')
    await waitFor(() => expect(positioner).toHaveAttribute('data-side', 'top'))

    await waitFor(() =>
      expect(Math.round(positioner.getBoundingClientRect().top)).toBe(collisionPadding)
    )
  })

  it.skipIf(isJSDOM)('uses transform positioning without Viewport', async () => {
    render(Positioner, { side: 'bottom' })

    const positioner = screen.getByTestId('positioner')
    await waitFor(() => expect(positioner.style.transform).not.toBe(''))
  })

  it.skipIf(isJSDOM)('uses top/left positioning with Viewport', async () => {
    render(PopoverWithViewport, { open: true })

    const positioner = screen.getByTestId('positioner')
    await waitFor(() => expect(positioner).toBeVisible())
    expect(positioner.style.transform).toBe('')
  })
})
