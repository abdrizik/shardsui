import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import { popupConformanceTests } from '../popup-conformance'
import { isJSDOM } from '../test-utils'
import PreviewCardConformance from './fixtures/conformance.svelte'
import Nested from './fixtures/nested.svelte'
import OpenVeto from './fixtures/open-veto.svelte'
import PreviewCardArrangements from './fixtures/preview-card-arrangements.svelte'

function hover(trigger: HTMLElement) {
  fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
  fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
  fireEvent.mouseEnter(trigger)
}

const popup = () => screen.queryByTestId('popup')

describe('<PreviewCard.Root />', () => {
  popupConformanceTests({
    component: PreviewCardConformance,
    triggerMouseAction: 'hover'
  })

  describe.for([
    { name: 'contained triggers', arrangement: 'contained' },
    { name: 'detached triggers', arrangement: 'detached' },
    { name: 'multiple detached triggers', arrangement: 'multiple-detached' }
  ] as const)('when using $name', ({ arrangement }) => {
    describe('uncontrolled open', () => {
      it('shows popup with content immediately when open=true', async () => {
        render(PreviewCardArrangements, { arrangement, open: true })
        await waitFor(() => {
          expect(screen.getByTestId('popup')).toBeInTheDocument()
          expect(screen.getByText('Content')).toBeInTheDocument()
        })
      })

      it('opens on trigger hover (delay=0)', async () => {
        render(PreviewCardArrangements, { arrangement, open: false, delay: 0 })
        hover(screen.getByTestId('trigger'))
        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
      })

      it('closes when pointer leaves trigger (closeDelay=0)', async () => {
        render(PreviewCardArrangements, { arrangement, open: false, delay: 0, closeDelay: 0 })
        const trigger = screen.getByTestId('trigger')

        hover(trigger)
        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

        fireEvent.mouseLeave(trigger)
        await waitFor(() => expect(popup()).toBeNull())
      })

      it('fires onOpenChange(true) on open and (false) on close', async () => {
        const onOpenChange = vi.fn()
        render(PreviewCardArrangements, {
          arrangement,
          open: false,
          delay: 0,
          closeDelay: 0,
          onOpenChange
        })
        const trigger = screen.getByTestId('trigger')

        hover(trigger)
        await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true))

        onOpenChange.mockClear()
        fireEvent.mouseLeave(trigger)
        await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
      })
    })

    describe('initially open, uncontrolled', () => {
      it('closes when the pointer leaves the trigger', async () => {
        render(PreviewCardArrangements, { arrangement, open: true, delay: 0, closeDelay: 0 })
        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

        fireEvent.mouseLeave(screen.getByTestId('trigger'))
        await waitFor(() => expect(popup()).toBeNull())
      })

      it('does not close after hovering out of the positioner', async () => {
        render(PreviewCardArrangements, { arrangement, open: true, delay: 0, closeDelay: 0 })
        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

        const positioner = screen.getByTestId('positioner')
        fireEvent.mouseEnter(positioner)
        fireEvent.mouseLeave(positioner)

        await new Promise((r) => setTimeout(r, 50))
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })
    })

    describe('data attributes', () => {
      it('popup and positioner are unmounted when closed', () => {
        render(PreviewCardArrangements, { arrangement, open: false })
        expect(popup()).toBeNull()
        expect(screen.queryByTestId('positioner')).toBeNull()
      })
    })

    describe('focus interactions', () => {
      it('opens when the trigger is focused (delay=0)', async () => {
        render(PreviewCardArrangements, { arrangement, open: false, delay: 0 })

        const trigger = screen.getByTestId('trigger')
        trigger.focus()

        await waitFor(() => {
          expect(screen.getByTestId('popup')).toBeInTheDocument()
        })
      })

      it('closes when the trigger is blurred (closeDelay=0)', async () => {
        render(PreviewCardArrangements, { arrangement, open: false, delay: 0, closeDelay: 0 })

        const trigger = screen.getByTestId('trigger')
        trigger.focus()

        await waitFor(() => {
          expect(screen.getByTestId('popup')).toBeInTheDocument()
        })

        trigger.blur()

        await waitFor(() => {
          expect(popup()).toBeNull()
        })
      })
    })

    describe('prop: delay', () => {
      it('opens after the delay elapses', async () => {
        vi.useFakeTimers()
        try {
          render(PreviewCardArrangements, { arrangement, open: false, delay: 100 })

          const trigger = screen.getByTestId('trigger')
          hover(trigger)

          expect(popup()).toBeNull()

          await vi.advanceTimersByTimeAsync(100)

          expect(screen.getByTestId('popup')).toBeInTheDocument()
        } finally {
          vi.useRealTimers()
        }
      })
    })

    describe('prop: closeDelay', () => {
      it('closes after the close delay elapses', async () => {
        vi.useFakeTimers()
        try {
          render(PreviewCardArrangements, { arrangement, open: false, delay: 0, closeDelay: 100 })

          const trigger = screen.getByTestId('trigger')
          hover(trigger)
          await vi.advanceTimersByTimeAsync(0)

          expect(screen.getByTestId('popup')).toBeInTheDocument()

          fireEvent.mouseLeave(trigger)
          expect(screen.getByTestId('popup')).toBeInTheDocument()

          await vi.advanceTimersByTimeAsync(100)

          expect(popup()).toBeNull()
        } finally {
          vi.useRealTimers()
        }
      })
    })

    describe('dismissal: reopen after Escape', () => {
      it('reopens on hover after Escape closes it', async () => {
        render(PreviewCardArrangements, { arrangement, open: false, delay: 0, closeDelay: 0 })

        const trigger = screen.getByTestId('trigger')
        hover(trigger)

        await waitFor(() => {
          expect(screen.getByTestId('popup')).toBeInTheDocument()
        })

        fireEvent.keyDown(document.body, { key: 'Escape' })

        await waitFor(() => {
          expect(popup()).toBeNull()
        })

        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)

        await waitFor(() => {
          expect(screen.getByTestId('popup')).toBeInTheDocument()
        })
      })
    })

    describe('prop: onOpenChange', () => {
      it('does not call onOpenChange when the open state does not change', async () => {
        const onOpenChange = vi.fn()
        render(PreviewCardArrangements, { arrangement, open: false, delay: 0, onOpenChange })

        const trigger = screen.getByTestId('trigger')

        hover(trigger)
        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

        expect(onOpenChange).toHaveBeenCalledTimes(1)
        expect(onOpenChange).toHaveBeenCalledWith(true)

        hover(trigger)
        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

        expect(onOpenChange).toHaveBeenCalledTimes(1)
      })
    })

    describe('prop: onOpenChange, positioner hover-out', () => {
      it('does not close after hovering out of a popup opened externally', async () => {
        render(PreviewCardArrangements, { arrangement, delay: 0, closeDelay: 0 })

        fireEvent.click(screen.getByText('Open'))
        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

        const positioner = screen.getByTestId('positioner')
        fireEvent.mouseEnter(positioner)
        fireEvent.mouseLeave(positioner)

        await new Promise((r) => setTimeout(r, 50))
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })

      it('closes after hovering out of a popup opened by its trigger', async () => {
        render(PreviewCardArrangements, { arrangement, open: false, delay: 0, closeDelay: 0 })

        const trigger = screen.getByTestId('trigger')
        hover(trigger)
        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

        const floating = screen.getByTestId('popup')
        fireEvent.mouseEnter(floating)
        fireEvent.mouseLeave(floating)

        await waitFor(() => expect(popup()).toBeNull())
      })
    })

    describe.skipIf(isJSDOM)('prop: onOpenChangeComplete', () => {
      it('does not get called on mount when not open', async () => {
        const onOpenChangeComplete = vi.fn()
        render(PreviewCardArrangements, { arrangement, open: false, onOpenChangeComplete })
        await new Promise((r) => setTimeout(r, 20))
        expect(onOpenChangeComplete.mock.calls.length).toBe(0)
      })

      it('is called on open when there is no enter animation defined', async () => {
        const onOpenChangeComplete = vi.fn()
        render(PreviewCardArrangements, { arrangement, open: false, onOpenChangeComplete })

        fireEvent.click(screen.getByText('Open'))
        await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())

        await waitFor(() => expect(onOpenChangeComplete).toHaveBeenCalledWith(true))
      })

      it('is called on close when there is no exit animation defined', async () => {
        const onOpenChangeComplete = vi.fn()
        render(PreviewCardArrangements, { arrangement, open: true, onOpenChangeComplete })

        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

        fireEvent.click(screen.getByText('Close'))
        await waitFor(() => expect(popup()).toBeNull())

        expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true)
        expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
      })

      describe('with animations', () => {
        const injectedStyles: HTMLStyleElement[] = []

        function injectAnimation(css: string) {
          const style = document.createElement('style')
          style.textContent = css
          document.head.appendChild(style)
          injectedStyles.push(style)
        }

        beforeEach(() => {
          globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
        })

        afterEach(() => {
          injectedStyles.forEach((style) => style.remove())
          injectedStyles.length = 0
        })

        it('is called on close only once the exit animation finishes', async () => {
          injectAnimation(`
            @keyframes preview-card-complete-exit { to { opacity: 0; } }
            .animation-test-indicator[data-ending-style] {
              animation: preview-card-complete-exit 1ms;
            }
          `)

          const onOpenChangeComplete = vi.fn()
          render(PreviewCardArrangements, {
            arrangement,
            open: true,
            onOpenChangeComplete,
            popupClass: 'animation-test-indicator'
          })

          await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
          await waitFor(() => expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true))

          fireEvent.click(screen.getByText('Close'))
          await waitFor(() => expect(popup()).toBeNull())

          expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
        })

        it('is called on open only once the enter animation finishes', async () => {
          injectAnimation(`
            @keyframes preview-card-complete-enter { from { opacity: 0; } }
            .animation-test-indicator[data-starting-style] {
              animation: preview-card-complete-enter 1ms;
            }
          `)

          const onOpenChangeComplete = vi.fn()
          render(PreviewCardArrangements, {
            arrangement,
            open: false,
            onOpenChangeComplete,
            popupClass: 'animation-test-indicator'
          })

          fireEvent.click(screen.getByText('Open'))
          await waitFor(() => expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true))
          expect(popup()).not.toBeNull()
        })
      })
    })
  })

  describe('prop: onOpenChange, vetoed', () => {
    it('does not open when the controlled open change is vetoed', async () => {
      render(OpenVeto)

      const trigger = screen.getByTestId('trigger')
      hover(trigger)

      await new Promise((r) => setTimeout(r, 50))

      expect(popup()).toBeNull()
      expect(trigger).not.toHaveAttribute('data-popup-open')
    })
  })

  describe('nested preview card interactions', () => {
    it('keeps the parent preview card open when clicking nested trigger', async () => {
      render(Nested, { parentOpen: true })

      expect(screen.queryByTestId('parent-popup')).not.toBeNull()

      const childTrigger = screen.getByTestId('child-trigger')
      fireEvent.click(childTrigger)

      await new Promise((r) => setTimeout(r, 20))
      expect(screen.queryByTestId('parent-popup')).not.toBeNull()
    })

    it('keeps parent open when press starts in nested popup and ends outside', async () => {
      render(Nested, { parentOpen: true, childOpen: true })

      expect(screen.queryByTestId('parent-popup')).not.toBeNull()
      expect(screen.queryByTestId('child-popup')).not.toBeNull()

      const childPopup = screen.getByTestId('child-popup')
      const outside = screen.getByTestId('outside')

      fireEvent.pointerDown(childPopup, { pointerType: 'mouse', button: 0 })
      fireEvent.click(outside)

      await waitFor(() => expect(screen.queryByTestId('parent-popup')).not.toBeNull())
      expect(screen.queryByTestId('child-popup')).not.toBeNull()
    })

    it('keeps the parent preview card open when hovering nested trigger', async () => {
      render(Nested, { parentOpen: true })

      expect(screen.queryByTestId('parent-popup')).not.toBeNull()

      const childTrigger = screen.getByTestId('child-trigger')
      fireEvent.pointerDown(childTrigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(childTrigger)
      fireEvent.mouseMove(childTrigger)

      await new Promise((r) => setTimeout(r, 20))
      expect(screen.queryByTestId('parent-popup')).not.toBeNull()
    })

    it('parent popup closes as soon as the child popup closes', async () => {
      render(Nested, { parentOpen: false, closeDelay: 0 })

      const parentTrigger = screen.getByTestId('parent-trigger')
      hover(parentTrigger)
      await waitFor(() => expect(screen.queryByTestId('parent-popup')).not.toBeNull())

      const parentPopup = screen.getByTestId('parent-popup')
      const childTrigger = screen.getByTestId('child-trigger')

      fireEvent.mouseLeave(parentTrigger, { relatedTarget: parentPopup })
      fireEvent.mouseEnter(parentPopup)
      hover(childTrigger)
      await waitFor(() => expect(screen.queryByTestId('child-popup')).not.toBeNull())

      const childPopup = screen.getByTestId('child-popup')

      fireEvent.mouseLeave(childTrigger, { relatedTarget: childPopup })
      fireEvent.mouseLeave(parentPopup, { relatedTarget: childPopup })
      fireEvent.mouseEnter(childPopup)
      fireEvent.mouseLeave(childPopup)
      fireEvent.mouseMove(document.body)

      await waitFor(() => expect(screen.queryByTestId('child-popup')).toBeNull())
      await waitFor(() => expect(screen.queryByTestId('parent-popup')).toBeNull())
    })

    it('keeps parent open and re-opens child when re-entering after partial close', async () => {
      render(Nested, { parentOpen: true, closeDelay: 120 })

      const parentPopup = screen.getByTestId('parent-popup')
      const childTrigger = screen.getByTestId('child-trigger')

      hover(childTrigger)
      await waitFor(() => expect(screen.queryByTestId('child-popup')).not.toBeNull())

      let childPopup = screen.getByTestId('child-popup')

      fireEvent.mouseLeave(childPopup)
      fireEvent.mouseLeave(parentPopup)
      fireEvent.mouseMove(document.body)

      await new Promise((r) => setTimeout(r, 40))
      fireEvent.mouseEnter(parentPopup)

      await waitFor(() => expect(screen.queryByTestId('child-popup')).toBeNull())
      expect(screen.queryByTestId('parent-popup')).not.toBeNull()

      hover(childTrigger)
      await waitFor(() => expect(screen.queryByTestId('child-popup')).not.toBeNull())

      childPopup = screen.getByTestId('child-popup')
      fireEvent.mouseLeave(childTrigger, { relatedTarget: childPopup })
      fireEvent.mouseLeave(parentPopup, { relatedTarget: childPopup })
      fireEvent.mouseEnter(childPopup)

      expect(screen.queryByTestId('parent-popup')).not.toBeNull()
      expect(screen.queryByTestId('child-popup')).not.toBeNull()
    })
  })
})
