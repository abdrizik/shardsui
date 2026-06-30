import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import PositionerOffset from './fixtures/positioner-offset.svelte'
import PositionerViewport from './fixtures/positioner-viewport.svelte'
import TooltipPositionerOutsidePortal from './fixtures/tooltip-positioner-outside-portal.svelte'
import TooltipPositionerOutsideRoot from './fixtures/tooltip-positioner-outside-root.svelte'
import TrackCursor from './fixtures/track-cursor.svelte'

const baselineX = 10

const baselineY = 36

const popupWidth = 52

const anchorWidth = 72

describe('<Tooltip.Positioner />', () => {
  it('throws a descriptive error when rendered outside <Tooltip.Root>', () => {
    expect(() => render(TooltipPositionerOutsideRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <Tooltip.Root>.'
    )
  })

  it('throws a descriptive error when rendered outside <Tooltip.Portal>', () => {
    expect(() => render(TooltipPositionerOutsidePortal)).toThrow(
      'ShardsUI: this part must be rendered inside <*.Portal>.'
    )
  })

  describe.skipIf(isJSDOM)('prop: trackCursorAxis', () => {
    it('tracks the cursor on the first delayed hover when trackCursorAxis is x', async () => {
      render(TrackCursor, { trackCursorAxis: 'x' })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      const triggerRect = trigger.getBoundingClientRect()
      const cursorX = triggerRect.left + 240
      const cursorY = triggerRect.top + 20

      fireEvent.pointerDown(trigger, { pointerType: 'mouse', clientX: cursorX, clientY: cursorY })
      fireEvent.mouseEnter(trigger, { clientX: cursorX, clientY: cursorY })
      fireEvent.mouseMove(trigger, { clientX: cursorX, clientY: cursorY })

      const positioner = await screen.findByTestId('positioner')
      await waitFor(() => {
        const rect = positioner.getBoundingClientRect()
        expect(Math.abs(rect.left + rect.width / 2 - cursorX)).toBeLessThanOrEqual(2)
      })
    })

    it('stops tracking the cursor after trackCursorAxis is disabled while closed', async () => {
      const { rerender } = render(TrackCursor, { trackCursorAxis: 'x' })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      const triggerRect = trigger.getBoundingClientRect()
      const cursorX = triggerRect.left + 240
      const cursorY = triggerRect.top + 20

      fireEvent.pointerDown(trigger, { pointerType: 'mouse', clientX: cursorX, clientY: cursorY })
      fireEvent.mouseEnter(trigger, { clientX: cursorX, clientY: cursorY })
      fireEvent.mouseMove(trigger, { clientX: cursorX, clientY: cursorY })

      const tracked = await screen.findByTestId('positioner')
      await waitFor(() => {
        const rect = tracked.getBoundingClientRect()
        expect(Math.abs(rect.left + rect.width / 2 - cursorX)).toBeLessThanOrEqual(2)
      })

      fireEvent.mouseLeave(trigger)
      await waitFor(() => expect(screen.queryByTestId('positioner')).toBeNull())

      await rerender({ trackCursorAxis: 'none' })

      fireEvent.mouseEnter(trigger, { clientX: cursorX, clientY: cursorY })
      fireEvent.mouseMove(trigger, { clientX: cursorX, clientY: cursorY })

      const untracked = await screen.findByTestId('positioner')
      await waitFor(() => {
        const rect = untracked.getBoundingClientRect()
        const triggerCenterX = triggerRect.left + triggerRect.width / 2
        expect(Math.abs(rect.left + rect.width / 2 - triggerCenterX)).toBeLessThanOrEqual(2)
      })
    })

    it('updates the tracked cursor position after closing and reopening', async () => {
      render(TrackCursor, { trackCursorAxis: 'x' })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      const triggerRect = trigger.getBoundingClientRect()
      const firstCursorX = triggerRect.left + 240
      const secondCursorX = triggerRect.left + 60
      const cursorY = triggerRect.top + 20

      fireEvent.pointerDown(trigger, {
        pointerType: 'mouse',
        clientX: firstCursorX,
        clientY: cursorY
      })
      fireEvent.mouseEnter(trigger, { clientX: firstCursorX, clientY: cursorY })
      fireEvent.mouseMove(trigger, { clientX: firstCursorX, clientY: cursorY })

      const first = await screen.findByTestId('positioner')
      await waitFor(() => {
        const rect = first.getBoundingClientRect()
        expect(Math.abs(rect.left + rect.width / 2 - firstCursorX)).toBeLessThanOrEqual(2)
      })

      fireEvent.mouseLeave(trigger)
      await waitFor(() => expect(screen.queryByTestId('positioner')).toBeNull())

      fireEvent.mouseEnter(trigger, { clientX: secondCursorX, clientY: cursorY })
      fireEvent.mouseMove(trigger, { clientX: secondCursorX, clientY: cursorY })

      const second = await screen.findByTestId('positioner')
      await waitFor(() => {
        const rect = second.getBoundingClientRect()
        expect(Math.abs(rect.left + rect.width / 2 - secondCursorX)).toBeLessThanOrEqual(2)
      })
    })
  })

  describe.skipIf(isJSDOM)('prop: sideOffset', () => {
    it('offsets the side when a number is specified', async () => {
      render(PositionerOffset, { sideOffset: 7 })
      await waitFor(() =>
        expect(screen.getByTestId('positioner').getBoundingClientRect()).toMatchObject({
          x: baselineX,
          y: baselineY + 7
        })
      )
    })

    it('offsets the side when a function is specified', async () => {
      render(PositionerOffset, {
        sideOffset: (data: { positioner: { width: number }; anchor: { width: number } }) =>
          data.positioner.width + data.anchor.width
      })
      await waitFor(() =>
        expect(screen.getByTestId('positioner').getBoundingClientRect()).toMatchObject({
          x: baselineX,
          y: baselineY + popupWidth + anchorWidth
        })
      )
    })

    it('can read the latest side inside sideOffset', async () => {
      let side = 'none'
      render(PositionerOffset, {
        side: 'left',
        sideOffset: (data: { side: string }) => {
          side = data.side
          return 0
        }
      })
      await waitFor(() => expect(side).toBe('right'))
    })

    it('can read the latest align inside sideOffset', async () => {
      let align = 'none'
      render(PositionerOffset, {
        side: 'right',
        align: 'start',
        sideOffset: (data: { align: string }) => {
          align = data.align
          return 0
        }
      })
      await waitFor(() => expect(align).toBe('end'))
    })

    it('reads logical side inside sideOffset', async () => {
      let side = 'none'
      render(PositionerOffset, {
        side: 'inline-start',
        sideOffset: (data: { side: string }) => {
          side = data.side
          return 0
        }
      })
      await waitFor(() => expect(side).toBe('inline-end'))
    })
  })

  describe.skipIf(isJSDOM)('prop: alignOffset', () => {
    it('offsets the align when a number is specified', async () => {
      render(PositionerOffset, { alignOffset: 7 })
      await waitFor(() =>
        expect(screen.getByTestId('positioner').getBoundingClientRect()).toMatchObject({
          x: baselineX + 7,
          y: baselineY
        })
      )
    })

    it('offsets the align when a function is specified', async () => {
      render(PositionerOffset, {
        alignOffset: (data: { positioner: { width: number } }) => data.positioner.width
      })
      await waitFor(() =>
        expect(screen.getByTestId('positioner').getBoundingClientRect()).toMatchObject({
          x: baselineX + popupWidth,
          y: baselineY
        })
      )
    })

    it('can read the latest side inside alignOffset', async () => {
      let side = 'none'
      render(PositionerOffset, {
        side: 'left',
        alignOffset: (data: { side: string }) => {
          side = data.side
          return 0
        }
      })
      await waitFor(() => expect(side).toBe('right'))
    })

    it('can read the latest align inside alignOffset', async () => {
      let align = 'none'
      render(PositionerOffset, {
        side: 'right',
        align: 'start',
        alignOffset: (data: { align: string }) => {
          align = data.align
          return 0
        }
      })
      await waitFor(() => expect(align).toBe('end'))
    })

    it('reads logical side inside alignOffset', async () => {
      let side = 'none'
      render(PositionerOffset, {
        side: 'inline-start',
        alignOffset: (data: { side: string }) => {
          side = data.side
          return 0
        }
      })
      await waitFor(() => expect(side).toBe('inline-end'))
    })
  })

  describe.skipIf(isJSDOM)('Viewport positioning', () => {
    it('uses transform positioning without Viewport', async () => {
      render(PositionerViewport, { withViewport: false })
      const positioner = screen.getByTestId('positioner')
      await waitFor(() => expect(positioner.style.transform).not.toBe(''))
    })

    it('uses top/left positioning with Viewport', async () => {
      render(PositionerViewport, { withViewport: true })
      const positioner = screen.getByTestId('positioner')
      await waitFor(() => expect(positioner.style.transform).toBe(''))
    })

    it('updates positioning when Viewport mounts and unmounts', async () => {
      const { rerender } = render(PositionerViewport, { withViewport: false })
      const positioner = screen.getByTestId('positioner')

      await waitFor(() => expect(positioner.style.transform).not.toBe(''))

      await rerender({ withViewport: true })
      await waitFor(() => expect(positioner.style.transform).toBe(''))

      await rerender({ withViewport: false })
      await waitFor(() => expect(positioner.style.transform).not.toBe(''))
    })
  })
})
