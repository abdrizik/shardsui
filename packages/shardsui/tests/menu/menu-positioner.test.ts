import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import ControlledParentSubmenu from './fixtures/controlled-parent-submenu.svelte'
import PositionerAnchorToggle from './fixtures/positioner-anchor-toggle.svelte'
import PositionerAnchor from './fixtures/positioner-anchor.svelte'
import PositionerOffset from './fixtures/positioner-offset.svelte'
import PositionerOutsidePortal from './fixtures/positioner-outside-portal.svelte'
import PositionerViewportToggle from './fixtures/positioner-viewport-toggle.svelte'
import PositionerVirtualAnchor from './fixtures/positioner-virtual-anchor.svelte'

const baselineX = 10

const baselineY = 36

const popupWidth = 52

const anchorWidth = 72

function roundByDPR(value: number) {
  const dpr = window.devicePixelRatio || 1
  return Math.round(value * dpr) / dpr
}

describe('<Menu.Positioner />', () => {
  it('throws a descriptive error when rendered outside <Menu.Portal>', () => {
    expect(() => render(PositionerOutsidePortal)).toThrow(
      'ShardsUI: this part must be rendered inside <*.Portal>.'
    )
  })

  describe.skipIf(isJSDOM)('prop: anchor', () => {
    it('is placed near the specified element', async () => {
      render(PositionerAnchor)

      const positioner = screen.getByTestId('positioner')
      const anchor = screen.getByTestId('anchor')
      const anchorPosition = anchor.getBoundingClientRect()

      await waitFor(() =>
        expect(positioner.style.getPropertyValue('transform')).toBe(
          `translate(${anchorPosition.left}px, ${anchorPosition.bottom}px)`
        )
      )
    })

    it('is placed at the specified position', async () => {
      const boundingRect = {
        x: 200,
        y: 100,
        top: 100,
        left: 200,
        bottom: 100,
        right: 200,
        height: 0,
        width: 0,
        toJSON: () => {}
      } as DOMRect

      render(PositionerVirtualAnchor, {
        props: { anchor: { getBoundingClientRect: () => boundingRect } }
      })

      await waitFor(() =>
        expect(screen.getByTestId('positioner').style.getPropertyValue('transform')).toBe(
          'translate(200px, 100px)'
        )
      )
    })

    it('reacts to the anchor changing to undefined and back', async () => {
      const user = userEvent.setup()
      render(PositionerAnchorToggle)

      const positioner = screen.getByTestId('positioner')
      const anchorElement = screen.getByTestId('anchor')

      const setUndefinedButton = screen.getByRole('button', { name: 'undefined' })
      const setRefButton = screen.getByRole('button', { name: 'ref' })
      const trigger = screen.getByRole('button', { name: 'trigger' })

      let anchorRect = anchorElement.getBoundingClientRect()
      await waitFor(() =>
        expect(positioner.style.getPropertyValue('transform')).toBe(
          `translate(${roundByDPR(anchorRect.left)}px, ${roundByDPR(anchorRect.bottom)}px)`
        )
      )

      await user.click(setUndefinedButton)

      const triggerRect = trigger.getBoundingClientRect()
      await waitFor(() =>
        expect(positioner.style.getPropertyValue('transform')).toBe(
          `translate(${roundByDPR(triggerRect.left)}px, ${roundByDPR(triggerRect.bottom)}px)`
        )
      )

      await user.click(setRefButton)

      anchorRect = anchorElement.getBoundingClientRect()
      await waitFor(() =>
        expect(positioner.style.getPropertyValue('transform')).toBe(
          `translate(${roundByDPR(anchorRect.left)}px, ${roundByDPR(anchorRect.bottom)}px)`
        )
      )
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

  it('closes an open submenu when its controlled parent closes', async () => {
    const onSubmenuOpenChange = vi.fn()
    const { rerender } = render(ControlledParentSubmenu, { open: true, onSubmenuOpenChange })

    expect(screen.queryByTestId('submenu-popup')).not.toBe(null)

    await rerender({ open: false, onSubmenuOpenChange })

    await waitFor(() => expect(onSubmenuOpenChange.mock.lastCall?.[0]).toBe(false))
    await waitFor(() => expect(screen.queryByTestId('submenu-popup')).toBe(null))
  })

  describe.skipIf(isJSDOM)('adaptive origin', () => {
    it('uses transform positioning without a Viewport', async () => {
      render(PositionerViewportToggle)

      const positioner = screen.getByTestId('positioner')
      await waitFor(() => expect(positioner.style.transform).not.toBe(''))
    })

    it('uses top/left positioning with a Viewport', async () => {
      render(PositionerViewportToggle, { viewport: true })

      const positioner = screen.getByTestId('positioner')
      await waitFor(() => expect(positioner.style.position).toBe('absolute'))
      expect(positioner.style.transform).toBe('')
      expect(positioner.style.top).not.toBe('0')
    })
  })
})
