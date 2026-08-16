import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect, vi } from 'vitest'
import { popupConformanceTests } from '../popup-conformance'
import { isJSDOM } from '../test-utils'
import BasicTooltip from './fixtures/basic-tooltip.svelte'
import TooltipConformance from './fixtures/conformance.svelte'
import HoverableTooltip from './fixtures/hoverable-tooltip.svelte'
import InstantFocus from './fixtures/instant-focus.svelte'
import TooltipDisabled from './fixtures/tooltip-disabled.svelte'
import TooltipGroupExiting from './fixtures/tooltip-group-exiting.svelte'
import TooltipLifecycle from './fixtures/tooltip-lifecycle.svelte'
import TooltipWithDelay from './fixtures/tooltip-with-delay.svelte'
import VetoOpen from './fixtures/veto-open.svelte'

describe('<Tooltip.Root />', () => {
  popupConformanceTests({
    component: TooltipConformance,
    triggerMouseAction: 'hover'
  })

  describe('hover interactions', () => {
    it('opens on trigger pointerenter + mousemove', async () => {
      render(BasicTooltip, { delay: 0 })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })
    })

    it('closes when trigger is unhovered', async () => {
      render(BasicTooltip, { delay: 0 })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })

      fireEvent.mouseLeave(trigger)

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })
    })
  })

  describe('focus interactions', () => {
    it.skipIf(isJSDOM)('opens when trigger is focused', async () => {
      render(BasicTooltip, { delay: 0 })

      const trigger = screen.getByTestId('trigger')
      trigger.focus()

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })
    })

    it('closes when trigger is blurred', async () => {
      render(BasicTooltip, { delay: 0 })

      const trigger = screen.getByTestId('trigger')
      trigger.focus()

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })

      trigger.blur()

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })
    })
  })

  describe('initial open', () => {
    it('popup is visible when open is true', async () => {
      render(BasicTooltip, { open: true, delay: 0 })

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })
    })

    it('does not open when open is false', async () => {
      render(BasicTooltip, { open: false, delay: 0 })

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })
    })
  })

  describe('prop: delay, trigger', () => {
    it('opens after the delay elapses', async () => {
      vi.useFakeTimers()
      try {
        render(TooltipWithDelay, { delay: 100 })

        const trigger = screen.getByTestId('trigger')
        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)

        expect(screen.queryByTestId('popup')).toBeNull()

        await vi.advanceTimersByTimeAsync(100)

        expect(screen.getByTestId('popup')).toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('prop: closeDelay, trigger', () => {
    it('closes after closeDelay elapses', async () => {
      vi.useFakeTimers()
      try {
        render(TooltipWithDelay, { delay: 0, closeDelay: 100 })

        const trigger = screen.getByTestId('trigger')
        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)
        await vi.advanceTimersByTimeAsync(0)

        expect(screen.getByTestId('popup')).toBeInTheDocument()

        fireEvent.mouseLeave(trigger)

        expect(screen.queryByTestId('popup')).toBeInTheDocument()

        await vi.advanceTimersByTimeAsync(100)

        expect(screen.queryByTestId('popup')).toBeNull()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('prop: disabled', () => {
    it('does not open when disabled=true on Root', async () => {
      render(TooltipDisabled, { disabled: true })

      const trigger = screen.getByTestId('trigger')
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await new Promise((r) => setTimeout(r, 10))

      expect(screen.queryByTestId('popup')).toBeNull()
    })

    it('does not open when trigger is focused and disabled=true on Root', async () => {
      render(TooltipDisabled, { disabled: true })

      const trigger = screen.getByTestId('trigger')
      trigger.focus()

      await new Promise((r) => setTimeout(r, 10))

      expect(screen.queryByTestId('popup')).toBeNull()
    })

    it('does not open when disabled=true on Trigger', async () => {
      render(TooltipDisabled, { triggerDisabled: true })

      const trigger = screen.getByTestId('trigger')
      trigger.focus()

      await new Promise((r) => setTimeout(r, 10))

      expect(screen.queryByTestId('popup')).toBeNull()
    })

    it('closes if open when becoming disabled', async () => {
      render(TooltipDisabled, { open: true })

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('disable'))

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })
    })

    it('does not throw error when combined with initial open', async () => {
      expect(() => render(TooltipDisabled, { open: true, disabled: true })).not.toThrow()
      expect(screen.queryByTestId('popup')).toBeNull()
    })

    it('marks the trigger as disabled when the root is disabled', async () => {
      render(TooltipDisabled, { disabled: true })

      expect(screen.getByTestId('trigger')).toHaveAttribute('data-trigger-disabled')
    })

    it('keeps the tooltip disabled when the root is disabled and the trigger opts back in', async () => {
      render(TooltipDisabled, { disabled: true, triggerDisabled: false })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).not.toHaveAttribute('data-trigger-disabled')

      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await new Promise((r) => setTimeout(r, 10))

      expect(screen.queryByTestId('popup')).toBeNull()
    })
  })

  describe('prop: trackCursorAxis', () => {
    it('makes the positioner inert when tracking both axes', async () => {
      render(TooltipDisabled, { trackCursorAxis: 'both' })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('positioner').style.pointerEvents).toBe('none')
      })
    })

    it('keeps the positioner hoverable when tracking a single axis', async () => {
      render(TooltipDisabled, { trackCursorAxis: 'x' })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })
      expect(screen.getByTestId('positioner').style.pointerEvents).toBe('')
    })
  })

  describe('prop: disableHoverablePopup', () => {
    it('applies pointer-events: none to the positioner when disableHoverablePopup=true', async () => {
      render(BasicTooltip, { delay: 0, disableHoverablePopup: true })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('positioner').style.pointerEvents).toBe('none')
      })
    })

    it('does not apply pointer-events: none to the positioner when disableHoverablePopup=false', async () => {
      render(BasicTooltip, { delay: 0, disableHoverablePopup: false })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('positioner').style.pointerEvents).toBe('')
      })
    })
  })

  describe('closeOnClick behaviour', () => {
    it('closes when trigger is clicked after tooltip is open', async () => {
      const user = userEvent.setup()
      render(TooltipWithDelay, { delay: 0 })

      const trigger = screen.getByTestId('trigger')
      await user.pointer([{ target: trigger }, { target: trigger }])

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })

      fireEvent.pointerDown(trigger, { pointerType: 'mouse', button: 0 })

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })
    })

    it('does not close when closeOnClick=false and trigger is clicked while open', async () => {
      render(TooltipWithDelay, { delay: 0, closeOnClick: false })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })

      fireEvent.click(trigger)

      expect(screen.getByTestId('popup')).toBeInTheDocument()
    })

    it('reopens on hover after the trigger is clicked closed', async () => {
      vi.useFakeTimers()
      try {
        render(TooltipWithDelay, { delay: 0 })

        const trigger = screen.getByTestId('trigger')
        fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)
        await vi.advanceTimersByTimeAsync(0)

        expect(screen.getByTestId('popup')).toBeInTheDocument()

        fireEvent.click(trigger)
        await vi.advanceTimersByTimeAsync(0)

        expect(screen.queryByTestId('popup')).toBeNull()

        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)
        await vi.advanceTimersByTimeAsync(0)

        expect(screen.getByTestId('popup')).toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('veto', () => {
    it('a setter that refuses true keeps the tooltip closed on hover', async () => {
      render(VetoOpen)

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await new Promise((r) => setTimeout(r, 10))

      expect(screen.queryByTestId('popup')).toBeNull()
      expect(trigger).not.toHaveAttribute('data-popup-open')
    })
  })

  describe('Escape key dismissal', () => {
    it('closes the tooltip when Escape is pressed', async () => {
      render(BasicTooltip, { open: true, delay: 0 })

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })

      fireEvent.keyDown(document.body, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })
    })
  })

  describe('onOpenChange: not called when state does not change', () => {
    it('is called exactly once when opening via hover (no extra calls)', async () => {
      const onOpenChange = vi.fn()
      render(TooltipWithDelay, { delay: 0, onOpenChange })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })

      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })
  })

  describe('onOpenChange from focus and blur', () => {
    it('calls onOpenChange on open and again on close (not when state is unchanged)', async () => {
      const onOpenChange = vi.fn()
      render(BasicTooltip, { delay: 0, onOpenChange })

      const trigger = screen.getByTestId('trigger')

      trigger.focus()
      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })
      expect(onOpenChange).toHaveBeenCalledWith(true)

      trigger.blur()
      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
      expect(onOpenChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('uncontrolled initial open', () => {
    it('opens on mount when uncontrolled and closes on mouseLeave', async () => {
      render(BasicTooltip, { open: true, delay: 0 })

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })

      const trigger = screen.getByTestId('trigger')
      fireEvent.mouseLeave(trigger)

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })
    })
  })

  describe('dismissal', () => {
    it('does not open when the trigger was clicked before the delay duration', async () => {
      render(TooltipWithDelay, { delay: 200 })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await new Promise((r) => setTimeout(r, 100))

      fireEvent.click(trigger)

      await new Promise((r) => setTimeout(r, 150))

      expect(screen.queryByTestId('popup')).toBeNull()
    })

    it('does not open when the trigger receives pointerdown before the delay duration', async () => {
      render(TooltipWithDelay, { delay: 200 })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })

      await new Promise((r) => setTimeout(r, 10))
      expect(screen.queryByTestId('popup')).toBeNull()
    })

    it('opens when the trigger is clicked before the delay duration and closeOnClick is false', async () => {
      render(TooltipWithDelay, { delay: 0, closeOnClick: false })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })
    })
  })

  describe.skipIf(isJSDOM)('onOpenChangeComplete: mount behaviour', () => {
    it('does not get called on mount when not open', async () => {
      const onOpenChangeComplete = vi.fn()
      render(TooltipLifecycle, { open: false, onOpenChangeComplete })

      await new Promise((r) => setTimeout(r, 10))
      expect(onOpenChangeComplete).not.toHaveBeenCalled()
    })
  })

  describe.skipIf(isJSDOM)('prop: onOpenChangeComplete', () => {
    it('is called on close when there is no exit animation defined', async () => {
      const onOpenChangeComplete = vi.fn()
      render(TooltipLifecycle, { open: true, onOpenChangeComplete })

      await waitFor(() => expect(onOpenChangeComplete).toHaveBeenCalledWith(true))

      // The portalled popup renders at top/left:0 in jsdom and overlays the Toggle
      // button, so drive the click with fireEvent (no hit-testing).
      await fireEvent.click(screen.getByText('Toggle'))

      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
      expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
    })

    it('is called on open when there is no enter animation defined', async () => {
      const onOpenChangeComplete = vi.fn()
      render(TooltipLifecycle, { open: false, onOpenChangeComplete })

      await fireEvent.click(screen.getByText('Toggle'))

      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())
      await waitFor(() => expect(onOpenChangeComplete).toHaveBeenCalledWith(true))
    })

    it('is called on close when the exit animation finishes', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      const onOpenChangeComplete = vi.fn()
      render(TooltipLifecycle, { open: true, animated: true, onOpenChangeComplete })

      await waitFor(() => expect(onOpenChangeComplete).toHaveBeenCalledWith(true))

      await fireEvent.click(screen.getByText('Toggle'))
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
      expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
    })

    it('is called on open when the enter animation finishes', async () => {
      const user = userEvent.setup({ delay: null })
      const onOpenChangeComplete = vi.fn()
      render(TooltipLifecycle, { open: false, animated: true, onOpenChangeComplete })

      await user.click(screen.getByText('Toggle'))
      await waitFor(() => expect(onOpenChangeComplete).toHaveBeenCalledWith(true))
      expect(screen.queryByTestId('popup')).not.toBeNull()
    })
  })

  describe.skipIf(isJSDOM)('animations', () => {
    it('unmounts an exiting tooltip when another tooltip opens', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      const user = userEvent.setup({ delay: null })
      render(TooltipGroupExiting)

      const firstTrigger = screen.getByTestId('trigger-1')
      const secondTrigger = screen.getByTestId('trigger-2')

      await user.hover(firstTrigger)
      const firstPopup = await screen.findByTestId('popup-1')

      await user.unhover(firstTrigger)
      await waitFor(() => {
        expect(firstPopup.getAnimations().length).toBe(1)
      })

      await user.hover(secondTrigger)
      await screen.findByTestId('popup-2')

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).toBeNull()
      })
    })
  })

  describe.skipIf(isJSDOM)('instant animations', () => {
    it('marks the popup as instant when opened by focus, but not when opened by hover', async () => {
      render(InstantFocus)

      const trigger = screen.getByTestId('trigger')

      trigger.focus()
      await waitFor(() => {
        expect(screen.getByTestId('popup')).toHaveAttribute('data-instant', 'focus')
      })

      trigger.blur()
      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })

      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).not.toBeNull()
      })
      expect(screen.getByTestId('popup')).not.toHaveAttribute('data-instant')
    })
  })

  describe.skipIf(isJSDOM)('hoverable popup', () => {
    async function openByHover() {
      const trigger = screen.getByText('Trigger')

      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      const popup = await screen.findByTestId('popup')
      await waitFor(() => {
        expect(screen.getByTestId('positioner').style.transform).not.toBe('')
      })
      return { trigger, popup }
    }

    function center(element: Element) {
      const rect = element.getBoundingClientRect()
      return { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 }
    }

    it('survives the trip from the trigger to the popup, then closes after leaving it', async () => {
      render(HoverableTooltip)

      const { trigger, popup } = await openByHover()

      fireEvent.mouseLeave(trigger, center(popup))
      fireEvent.mouseEnter(popup)
      await tick()

      expect(screen.queryByTestId('popup')).not.toBeNull()

      fireEvent.mouseLeave(popup, {
        relatedTarget: document.body,
        ...center(screen.getByTestId('outside'))
      })

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })
    })

    it('closes on that same trip when disableHoverablePopup is set', async () => {
      render(HoverableTooltip, { disableHoverablePopup: true })

      const { trigger, popup } = await openByHover()

      fireEvent.mouseLeave(trigger, center(popup))
      fireEvent.mouseEnter(popup)

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })
    })
  })
})
