import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import TooltipGroupAnimated from './fixtures/tooltip-group-animated.svelte'
import TooltipGroupRemovable from './fixtures/tooltip-group-removable.svelte'
import TooltipGroup from './fixtures/tooltip-group.svelte'
import TooltipProvider from './fixtures/tooltip-provider.svelte'

function open(trigger: HTMLElement) {
  fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
  fireEvent.mouseEnter(trigger)
  fireEvent.mouseMove(trigger)
}

function captureFirstFrameInstant(testId: string) {
  let firstFrame: { instant: string | null; starting: boolean } | undefined

  const matches = (n: Node): HTMLElement | null => {
    if (!(n instanceof HTMLElement)) return null
    if (n.getAttribute('data-testid') === testId) return n
    return n.querySelector<HTMLElement>(`[data-testid="${testId}"]`)
  }

  const observer = new MutationObserver((records) => {
    if (firstFrame) return
    for (const record of records) {
      for (const node of record.addedNodes) {
        const el = matches(node)
        if (el) {
          firstFrame = {
            instant: el.getAttribute('data-instant'),
            starting: el.hasAttribute('data-starting-style')
          }
          return
        }
      }
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  return {
    get value() {
      return firstFrame
    },
    stop() {
      observer.disconnect()
    }
  }
}

describe('<Tooltip.Provider />', () => {
  describe('prop: delay', () => {
    it('respects delay=0 on provider (opens immediately)', async () => {
      render(TooltipProvider, { providerDelay: 0 })

      const trigger = screen.getByTestId('trigger')
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeInTheDocument()
      })
    })

    it('waits for provider delay before showing tooltip', async () => {
      vi.useFakeTimers()
      try {
        render(TooltipProvider, { providerDelay: 200 })

        const trigger = screen.getByTestId('trigger')
        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)

        expect(screen.queryByTestId('popup')).toBeNull()

        await vi.advanceTimersByTimeAsync(200)

        expect(screen.queryByTestId('popup')).toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })

    it('respects trigger delay prop over provider delay prop', async () => {
      vi.useFakeTimers()
      try {
        render(TooltipProvider, { providerDelay: 10, triggerDelay: 100 })

        const trigger = screen.getByTestId('trigger')
        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)

        expect(screen.queryByTestId('popup')).toBeNull()

        await vi.advanceTimersByTimeAsync(50)
        expect(screen.queryByTestId('popup')).toBeNull()

        await vi.advanceTimersByTimeAsync(50)

        expect(screen.queryByTestId('popup')).toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('prop: closeDelay', () => {
    it('waits for closeDelay before hiding tooltip', async () => {
      vi.useFakeTimers()
      try {
        render(TooltipProvider, { providerDelay: 0, providerCloseDelay: 200 })

        const trigger = screen.getByTestId('trigger')
        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)
        await vi.advanceTimersByTimeAsync(0)

        expect(screen.queryByTestId('popup')).toBeInTheDocument()

        fireEvent.mouseLeave(trigger)

        expect(screen.queryByTestId('popup')).toBeInTheDocument()

        await vi.advanceTimersByTimeAsync(100)
        expect(screen.queryByTestId('popup')).toBeInTheDocument()

        await vi.advanceTimersByTimeAsync(100)
        expect(screen.queryByTestId('popup')).toBeNull()
      } finally {
        vi.useRealTimers()
      }
    })

    it('uses the latest closeDelay after the prop updates', async () => {
      const { rerender } = render(TooltipProvider, {
        providerDelay: 0,
        providerCloseDelay: 400
      })

      const trigger = screen.getByTestId('trigger')
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

      await rerender({ providerDelay: 0, providerCloseDelay: 1000 })

      fireEvent.mouseLeave(trigger)

      await new Promise((r) => setTimeout(r, 600))
      expect(screen.getByTestId('popup')).toBeInTheDocument()

      await new Promise((r) => setTimeout(r, 500))
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
    })
  })

  describe('prop: timeout', () => {
    it('opens an adjacent tooltip instantly while the group is active', async () => {
      render(TooltipGroup, { delay: 100, closeDelay: 0, timeout: 400 })

      const first = screen.getByTestId('trigger-1')
      const second = screen.getByTestId('trigger-2')

      fireEvent.mouseEnter(first)
      fireEvent.mouseMove(first)

      await waitFor(() => expect(screen.getByTestId('popup-1')).toBeInTheDocument())

      fireEvent.mouseLeave(first)
      fireEvent.mouseEnter(second)
      fireEvent.mouseMove(second)

      await new Promise((r) => setTimeout(r, 30))

      expect(screen.getByTestId('popup-2')).toBeInTheDocument()
      expect(screen.queryByTestId('popup-1')).toBeNull()
    })

    it('requires the full delay again once the timeout elapses', async () => {
      render(TooltipGroup, { delay: 100, closeDelay: 0, timeout: 200 })

      const first = screen.getByTestId('trigger-1')
      const second = screen.getByTestId('trigger-2')

      fireEvent.mouseEnter(first)
      fireEvent.mouseMove(first)

      await waitFor(() => expect(screen.getByTestId('popup-1')).toBeInTheDocument())

      fireEvent.mouseLeave(first)
      await new Promise((r) => setTimeout(r, 300))

      fireEvent.mouseEnter(second)
      fireEvent.mouseMove(second)

      await new Promise((r) => setTimeout(r, 30))
      expect(screen.queryByTestId('popup-2')).toBeNull()

      await waitFor(() => expect(screen.getByTestId('popup-2')).toBeInTheDocument())
    })

    it('picks up a timeout changed after the provider mounted', async () => {
      const { rerender } = render(TooltipGroup, { delay: 100, closeDelay: 0, timeout: 0 })

      const first = screen.getByTestId('trigger-1')
      const second = screen.getByTestId('trigger-2')

      await rerender({ delay: 100, closeDelay: 0, timeout: 400 })

      fireEvent.mouseEnter(first)
      fireEvent.mouseMove(first)

      await waitFor(() => expect(screen.getByTestId('popup-1')).toBeInTheDocument())

      fireEvent.mouseLeave(first)
      fireEvent.mouseEnter(second)
      fireEvent.mouseMove(second)

      await new Promise((r) => setTimeout(r, 30))

      expect(screen.getByTestId('popup-2')).toBeInTheDocument()
    })

    it('releases the group when the open tooltip is unmounted', async () => {
      const { rerender } = render(TooltipGroupRemovable, {
        delay: 100,
        closeDelay: 0,
        timeout: 5000
      })

      const first = screen.getByTestId('trigger-1')

      fireEvent.mouseEnter(first)
      fireEvent.mouseMove(first)

      await waitFor(() => expect(screen.getByTestId('popup-1')).toBeInTheDocument())

      await rerender({ delay: 100, closeDelay: 0, timeout: 5000, showFirst: false })
      expect(screen.queryByTestId('popup-1')).toBeNull()

      const second = screen.getByTestId('trigger-2')
      fireEvent.mouseEnter(second)
      fireEvent.mouseMove(second)

      expect(screen.queryByTestId('popup-2')).toBeNull()

      await waitFor(() => expect(screen.getByTestId('popup-2')).toBeInTheDocument())
    })
  })

  describe('delay-group instant phase', () => {
    it('first tooltip animates (no data-instant); adjacent tooltip opens instantly on its first frame', async () => {
      render(TooltipGroup, { delay: 0, closeDelay: 0, timeout: 400 })

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      const popup1FirstFrame = captureFirstFrameInstant('popup-1')
      open(trigger1)
      await waitFor(() => {
        expect(screen.getByTestId('popup-1')).toBeInTheDocument()
      })
      popup1FirstFrame.stop()

      expect(popup1FirstFrame.value).toBeDefined()
      expect(popup1FirstFrame.value!.instant).toBeNull()
      expect(popup1FirstFrame.value!.starting).toBe(true)

      const popup2FirstFrame = captureFirstFrameInstant('popup-2')
      fireEvent.mouseLeave(trigger1)
      open(trigger2)

      await waitFor(() => {
        expect(screen.getByTestId('popup-2')).toBeInTheDocument()
      })
      popup2FirstFrame.stop()

      expect(popup2FirstFrame.value).toBeDefined()
      expect(popup2FirstFrame.value!.instant).toBe('delay')
      expect(popup2FirstFrame.value!.starting).toBe(true)
    })

    it.skipIf(isJSDOM)('drops data-instant again once the adjacent tooltip closes', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      try {
        const user = userEvent.setup({ delay: null })
        render(TooltipGroupAnimated)

        const firstTrigger = screen.getByTestId('trigger-1')
        const secondTrigger = screen.getByTestId('trigger-2')

        await user.hover(firstTrigger)

        const firstPopup = await screen.findByTestId('popup-1')
        expect(firstPopup.dataset.instant).toBe(undefined)

        await user.unhover(firstTrigger)
        await user.hover(secondTrigger)

        const secondPopup = await screen.findByTestId('popup-2')

        await waitFor(() => {
          expect(secondPopup.dataset.instant).toBe('delay')
          expect(secondPopup.getAnimations().length).toBe(0)
        })

        await waitFor(() => {
          expect(secondPopup.dataset.startingStyle).toBe(undefined)
        })

        await user.unhover(secondTrigger)

        await waitFor(() => {
          expect(secondPopup.dataset.endingStyle).toBe('')
          expect(secondPopup.dataset.instant).toBe(undefined)
          expect(secondPopup.getAnimations().length).toBe(1)
        })
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })
  })
})
