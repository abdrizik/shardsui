import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import ElementTypes from './fixtures/element-types.svelte'
import MultilineControlledSwitch from './fixtures/multiline-controlled-switch.svelte'
import MultilineControlled from './fixtures/multiline-controlled.svelte'
import MultilineCustomAnchor from './fixtures/multiline-custom-anchor.svelte'
import MultilineTrigger from './fixtures/multiline-trigger.svelte'
import PositionerOffset from './fixtures/positioner-offset.svelte'
import PositionerViewport from './fixtures/positioner-viewport.svelte'
import PreviewCardPositionerOutsidePortal from './fixtures/preview-card-positioner-outside-portal.svelte'

const baselineX = 10

const baselineY = 36

const popupWidth = 52

const anchorWidth = 72

type RectLike = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

function expectWithin(actual: number, expected: number, tolerance = 2) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance)
}

function mockClientRects(element: Element, rects: RectLike[]) {
  const left = Math.min(...rects.map((rect) => rect.left))
  const top = Math.min(...rects.map((rect) => rect.top))
  const right = Math.max(...rects.map((rect) => rect.right))
  const bottom = Math.max(...rects.map((rect) => rect.bottom))
  const boundingRect = DOMRect.fromRect({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  })

  Object.defineProperty(element, 'getClientRects', {
    configurable: true,
    value: () =>
      rects.map((rect) =>
        DOMRect.fromRect({ x: rect.left, y: rect.top, width: rect.width, height: rect.height })
      )
  })
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => boundingRect
  })
}

describe('<PreviewCard.Positioner />', () => {
  it('throws a descriptive error when rendered outside <PreviewCard.Portal>', () => {
    expect(() => render(PreviewCardPositionerOutsidePortal)).toThrow(
      'ShardsUI: this part must be rendered inside <*.Portal>.'
    )
  })

  it('renders a custom as element', () => {
    render(ElementTypes, { positionerAs: 'section' })
    expect(screen.getByTestId('positioner').tagName.toLowerCase()).toBe('section')
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
  })

  describe.skipIf(isJSDOM)('multiline inline trigger', () => {
    const injectedStyles: HTMLStyleElement[] = []

    afterEach(() => {
      injectedStyles.forEach((style) => style.remove())
      injectedStyles.length = 0
      window.scrollTo(0, 0)
      document.documentElement.style.height = ''
      document.body.style.height = ''
      document.body.style.margin = ''
    })

    it('positions the popup relative to the hovered line of a multiline trigger', async () => {
      const user = userEvent.setup()
      render(MultilineTrigger, { side: 'bottom', sideOffset: 5, delay: 0 })

      const trigger = screen.getByTestId('trigger')
      const triggerRects = trigger.getClientRects()
      expect(triggerRects.length).toBeGreaterThan(2)

      const secondLineRect = triggerRects[1]
      await user.pointer([
        { target: document.body },
        {
          target: trigger,
          coords: {
            clientX: secondLineRect.left + secondLineRect.width / 2,
            clientY: secondLineRect.top + secondLineRect.height / 2
          }
        }
      ])

      const positioner = screen.getByTestId('positioner')
      await waitFor(() => expect(positioner).toBeVisible())

      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, secondLineRect.bottom + 5)
      })

      const { x: positionerX } = positioner.getBoundingClientRect()
      expect(positionerX).toBeGreaterThanOrEqual(secondLineRect.left - 10)
      expect(positionerX).toBeLessThanOrEqual(secondLineRect.right + 10)
    })

    it('uses the latest hovered line when opening after a delay', async () => {
      const user = userEvent.setup()
      render(MultilineTrigger, { side: 'bottom', sideOffset: 5, delay: 100 })

      const trigger = screen.getByTestId('trigger')
      const triggerRects = trigger.getClientRects()
      expect(triggerRects.length).toBeGreaterThan(2)

      const firstLineRect = triggerRects[0]
      const secondLineRect = triggerRects[1]

      await user.pointer([
        { target: document.body },
        {
          target: trigger,
          coords: {
            clientX: firstLineRect.left + firstLineRect.width / 2,
            clientY: firstLineRect.top + firstLineRect.height / 2
          }
        }
      ])
      await user.pointer([
        {
          target: trigger,
          coords: {
            clientX: secondLineRect.left + secondLineRect.width / 2,
            clientY: secondLineRect.top + secondLineRect.height / 2
          }
        }
      ])

      const positioner = await screen.findByTestId('positioner')
      await waitFor(() => expect(positioner).toBeVisible())
      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, secondLineRect.bottom + 5)
      })
    })

    it('keeps the popup aligned after page scroll', async () => {
      document.documentElement.style.height = '4000px'
      document.body.style.height = '4000px'
      document.body.style.margin = '0'

      const user = userEvent.setup()
      render(MultilineTrigger, { side: 'bottom', sideOffset: 5, delay: 0, scrollSpacers: true })

      window.scrollTo(0, 1000)
      await waitFor(() => expect(window.scrollY).toBe(1000))

      const trigger = screen.getByTestId('trigger')
      const triggerRects = trigger.getClientRects()
      expect(triggerRects.length).toBeGreaterThan(1)

      const secondLineRect = triggerRects[1]
      await user.pointer([
        { target: document.body },
        {
          target: trigger,
          coords: {
            clientX: secondLineRect.left + secondLineRect.width / 2,
            clientY: secondLineRect.top + secondLineRect.height / 2
          }
        }
      ])

      const positioner = screen.getByTestId('positioner')
      await waitFor(() => expect(positioner).toBeVisible())
      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, secondLineRect.bottom + 5)
      })

      const { x: positionerX } = positioner.getBoundingClientRect()
      expect(positionerX).toBeGreaterThanOrEqual(secondLineRect.left - 10)
      expect(positionerX).toBeLessThanOrEqual(secondLineRect.right + 10)
    })

    it('stays anchored to the opened line while already open', async () => {
      let positionUpdateCount = 0
      const user = userEvent.setup()
      render(MultilineTrigger, {
        side: 'bottom',
        delay: 0,
        sideOffset: () => {
          positionUpdateCount += 1
          return 5
        }
      })

      const trigger = screen.getByTestId('trigger')
      const triggerRects = trigger.getClientRects()
      expect(triggerRects.length).toBeGreaterThan(2)

      const firstLineRect = triggerRects[0]
      const secondLineRect = triggerRects[1]

      await user.pointer([
        { target: document.body },
        {
          target: trigger,
          coords: {
            clientX: firstLineRect.left + firstLineRect.width / 2,
            clientY: firstLineRect.top + firstLineRect.height / 2
          }
        }
      ])

      const positioner = screen.getByTestId('positioner')
      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, firstLineRect.bottom + 5)
      })
      const countBeforeReentry = positionUpdateCount

      await user.pointer([
        { target: document.body },
        {
          target: trigger,
          coords: {
            clientX: secondLineRect.left + secondLineRect.width / 2,
            clientY: secondLineRect.top + secondLineRect.height / 2
          }
        }
      ])

      window.dispatchEvent(new Event('resize'))
      await waitFor(() => expect(positionUpdateCount).toBeGreaterThan(countBeforeReentry))

      expectWithin(positioner.getBoundingClientRect().y, firstLineRect.bottom + 5)
    })

    it('re-anchors to a newly entered line while reopening during close transition', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      const style = document.createElement('style')
      style.textContent = `
        @keyframes preview-card-inline-reentry-close { from { opacity: 1; } to { opacity: 0.01; } }
        [data-testid="popup"][data-ending-style] {
          animation: preview-card-inline-reentry-close 50ms linear forwards;
        }
      `
      document.head.appendChild(style)
      injectedStyles.push(style)

      const user = userEvent.setup()
      render(MultilineTrigger, { side: 'bottom', sideOffset: 5, delay: 0 })

      const trigger = screen.getByTestId('trigger')
      const triggerRects = trigger.getClientRects()
      expect(triggerRects.length).toBeGreaterThan(2)

      const firstLineRect = triggerRects[0]
      const secondLineRect = triggerRects[1]

      await user.pointer([
        { target: document.body },
        {
          target: trigger,
          coords: {
            clientX: firstLineRect.left + firstLineRect.width / 2,
            clientY: firstLineRect.top + firstLineRect.height / 2
          }
        }
      ])

      const positioner = screen.getByTestId('positioner')
      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, firstLineRect.bottom + 5)
      })

      await user.pointer([{ target: document.body, coords: { clientX: 300, clientY: 300 } }])
      await waitFor(() => {
        expect(screen.getByTestId('popup')).toHaveAttribute('data-ending-style')
      })

      await user.pointer([
        {
          target: trigger,
          coords: {
            clientX: secondLineRect.left + secondLineRect.width / 2,
            clientY: secondLineRect.top + secondLineRect.height / 2
          }
        }
      ])

      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, secondLineRect.bottom + 5)
      })
    })

    it('positions the popup relative to the side-aligned rect when open is controlled', async () => {
      const sideOffset = 5
      render(MultilineTrigger, { open: true, side: 'bottom', sideOffset, delay: 0 })

      const trigger = screen.getByTestId('trigger')
      const triggerRects = trigger.getClientRects()
      expect(triggerRects.length).toBeGreaterThan(1)

      const targetRect = triggerRects[triggerRects.length - 1]
      const positioner = screen.getByTestId('positioner')

      await waitFor(() => expect(positioner).toBeVisible())
      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, targetRect.bottom + sideOffset)
      })

      const { x: positionerX } = positioner.getBoundingClientRect()
      expect(positionerX).toBeGreaterThanOrEqual(targetRect.left - 10)
      expect(positionerX).toBeLessThanOrEqual(targetRect.right + 10)
    })

    it('positions the popup relative to the side-aligned rect when opened via focus', async () => {
      const sideOffset = 5
      const popupHeight = 40
      const user = userEvent.setup()
      render(MultilineTrigger, {
        side: 'top',
        sideOffset,
        delay: 0,
        tabindex: 0,
        marginTop: 100,
        popupHeight
      })

      const trigger = screen.getByTestId('trigger')
      const triggerRects = trigger.getClientRects()
      expect(triggerRects.length).toBeGreaterThan(1)

      const targetRect = triggerRects[0]
      const expectedY = targetRect.top - popupHeight - sideOffset

      await user.tab()

      const positioner = screen.getByTestId('positioner')
      await waitFor(() => expect(positioner).toBeVisible())
      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, expectedY)
      })

      const { x: positionerX } = positioner.getBoundingClientRect()
      expect(positionerX).toBeGreaterThanOrEqual(targetRect.left - 10)
      expect(positionerX).toBeLessThanOrEqual(targetRect.right + 10)
    })

    it('clears hovered-line coords when opened via focus', async () => {
      const sideOffset = 5
      const popupHeight = 40
      const user = userEvent.setup()
      render(MultilineTrigger, {
        side: 'top',
        sideOffset,
        delay: 300,
        tabindex: 0,
        marginTop: 100,
        popupHeight
      })

      const trigger = screen.getByTestId('trigger')
      const triggerRects = trigger.getClientRects()
      expect(triggerRects.length).toBeGreaterThan(2)

      const secondLineRect = triggerRects[1]
      await user.pointer([
        { target: document.body },
        {
          target: trigger,
          coords: {
            clientX: secondLineRect.left + secondLineRect.width / 2,
            clientY: secondLineRect.top + secondLineRect.height / 2
          }
        }
      ])

      const targetRect = triggerRects[0]
      const expectedY = targetRect.top - popupHeight - sideOffset

      await user.tab()

      const positioner = await screen.findByTestId('positioner')
      await waitFor(() => expect(positioner).toBeVisible())
      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, expectedY)
      })
    })

    it('clears hovered-line coords after close before controlled reopen of the same trigger', async () => {
      const sideOffset = 5
      const user = userEvent.setup()
      render(MultilineControlled)

      const trigger = screen.getByTestId('trigger')
      const triggerRects = trigger.getClientRects()
      expect(triggerRects.length).toBeGreaterThan(2)

      const secondLineRect = triggerRects[1]
      await user.pointer([
        { target: document.body },
        {
          target: trigger,
          coords: {
            clientX: secondLineRect.left + secondLineRect.width / 2,
            clientY: secondLineRect.top + secondLineRect.height / 2
          }
        }
      ])

      const positioner = screen.getByTestId('positioner')
      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, secondLineRect.bottom + sideOffset)
      })

      await user.click(screen.getByRole('button', { name: 'Close' }))
      await waitFor(() => expect(positioner).toHaveAttribute('hidden'))

      await user.click(screen.getByRole('button', { name: 'Open' }))

      const targetRect = triggerRects[triggerRects.length - 1]
      await waitFor(() => expect(positioner).toBeVisible())
      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, targetRect.bottom + sideOffset)
      })
    })

    it('ignores stale hovered-line coords when a controlled trigger switch reuses the popup', async () => {
      const user = userEvent.setup()
      render(MultilineControlledSwitch)

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      mockClientRects(trigger1, [
        { left: 180, top: 0, right: 220, bottom: 10, width: 40, height: 10 },
        { left: 100, top: 20, right: 160, bottom: 30, width: 60, height: 10 }
      ])
      mockClientRects(trigger2, [
        { left: 180, top: 100, right: 220, bottom: 110, width: 40, height: 10 },
        { left: 100, top: 120, right: 160, bottom: 130, width: 60, height: 10 }
      ])

      await user.pointer([
        { target: document.body },
        { target: trigger1, coords: { clientX: 200, clientY: 5 } }
      ])

      await waitFor(() => expect(screen.getByTestId('positioner')).toBeVisible())

      await user.click(screen.getByRole('button', { name: 'Switch' }))

      const positioner = screen.getByTestId('positioner')
      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, 135)
      })

      const { x: positionerX } = positioner.getBoundingClientRect()
      expect(positionerX).toBeGreaterThanOrEqual(90)
      expect(positionerX).toBeLessThanOrEqual(170)
    })

    it('uses the hovered line with a custom anchor in a clipped keepMounted portal', async () => {
      document.body.style.margin = '0'
      const user = userEvent.setup()
      render(MultilineCustomAnchor)

      const portalContainer = screen.getByTestId('portal-container')
      const trigger = screen.getByTestId('trigger')
      const positioner = screen.getByTestId('positioner')

      mockClientRects(trigger, [
        { left: 180, top: 80, right: 220, bottom: 90, width: 40, height: 10 },
        { left: 0, top: 100, right: 60, bottom: 110, width: 60, height: 10 }
      ])

      await user.pointer([
        { target: document.body },
        { target: trigger, coords: { clientX: 30, clientY: 105 } }
      ])

      await waitFor(() => expect(positioner).toBeVisible())
      expect(portalContainer).toContainElement(positioner)
      await waitFor(() => expect(positioner).toHaveAttribute('data-side', 'top'))
      await waitFor(() => {
        expectWithin(positioner.getBoundingClientRect().y, 55)
      })
    })
  })
})
