import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { isJSDOM } from '../test-utils'
import PositionerOffset from './fixtures/positioner-offset.svelte'

describe('<Select.Positioner />', () => {
  const popupWidth = 52
  const anchorWidth = 72

  function parseTranslate(transform: string) {
    const match = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(transform)
    if (!match) {
      throw new Error(`unexpected transform: ${transform}`)
    }
    return { x: Number(match[1]), y: Number(match[2]) }
  }

  async function settledTranslate() {
    const positioner = screen.getByTestId('positioner')
    let point = { x: 0, y: 0 }
    await waitFor(() => {
      point = parseTranslate(positioner.style.transform)
      expect(point).not.toEqual({ x: 0, y: 0 })
    })
    return point
  }

  async function baseline() {
    const { unmount } = render(PositionerOffset, {})
    const point = await settledTranslate()
    unmount()
    return point
  }

  describe.skipIf(isJSDOM)('prop: sideOffset', () => {
    it('offsets the side when a number is specified', async () => {
      const { x, y } = await baseline()
      render(PositionerOffset, { sideOffset: 7 })
      await waitFor(async () => {
        expect(await settledTranslate()).toEqual({ x, y: y + 7 })
      })
    })

    it('offsets the side when a function is specified', async () => {
      const { x, y } = await baseline()
      render(PositionerOffset, {
        sideOffset: (data: { positioner: { width: number }; anchor: { width: number } }) =>
          data.positioner.width + data.anchor.width
      })
      await waitFor(async () => {
        expect(await settledTranslate()).toEqual({ x, y: y + popupWidth + anchorWidth })
      })
    })

    it('can read the latest side inside sideOffset', async () => {
      let side = 'none'
      render(PositionerOffset, {
        side: 'left',
        align: 'center',
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
      const { x, y } = await baseline()
      render(PositionerOffset, { alignOffset: 7 })
      await waitFor(async () => {
        expect(await settledTranslate()).toEqual({ x: x + 7, y })
      })
    })

    it('offsets the align when a function is specified', async () => {
      const { x, y } = await baseline()
      render(PositionerOffset, {
        alignOffset: (data: { positioner: { width: number } }) => data.positioner.width
      })
      await waitFor(async () => {
        expect(await settledTranslate()).toEqual({ x: x + popupWidth, y })
      })
    })

    it('can read the latest side inside alignOffset', async () => {
      let side = 'none'
      render(PositionerOffset, {
        side: 'left',
        align: 'center',
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
  describe.skipIf(isJSDOM)('kept-mounted positioner', () => {
    it('does not retain stale coordinates while closed', async () => {
      const user = userEvent.setup()
      render(PositionerOffset, {})

      const positioner = screen.getByTestId('positioner')
      await waitFor(() => {
        expect(positioner.style.transform).not.toBe('')
      })

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.getByTestId('positioner').hidden).toBe(true)
      })

      const closedPositioner = screen.getByTestId('positioner')
      await waitFor(() => {
        expect(closedPositioner.style.position).toBe('fixed')
      })
      expect(closedPositioner.style.transform).toBe('')
      expect(closedPositioner.style.top).toBe('0px')
      expect(closedPositioner.style.left).toBe('0px')
    })
  })
})
