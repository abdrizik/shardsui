import { PreviewCard } from '$lib/components/preview-card'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect, type MockInstance, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import DetachedKeepMounted from './fixtures/detached-keep-mounted.svelte'
import DetachedRootHandoff from './fixtures/detached-root-handoff.svelte'
import DetachedRootRemount from './fixtures/detached-root-remount.svelte'
import DetachedTiming from './fixtures/detached-timing.svelte'
import DetachedTriggerAfterRoot from './fixtures/detached-trigger-after-root.svelte'
import DetachedUnmountTrigger from './fixtures/detached-unmount-trigger.svelte'
import DetachedUnmountVeto from './fixtures/detached-unmount-veto.svelte'
import MultiTrigger from './fixtures/multi-trigger.svelte'
import PreviewCardDetachedPayload from './fixtures/preview-card-detached-payload.svelte'
import PreviewCardDetachedSiblings from './fixtures/preview-card-detached-siblings.svelte'
import SharedHandleRoots from './fixtures/shared-handle-roots.svelte'
import UnmountTrigger from './fixtures/unmount-trigger.svelte'

const popup = () => screen.queryByTestId('popup')

const content = () => screen.queryByTestId('content')

const OPEN_DELAY = 600

const CLOSE_TRANSITION_MS = 50

const CLOSE_TRANSITION_TIMEOUT = 300

function warningsMatching(spy: MockInstance<typeof console.warn>, text: string) {
  return spy.mock.calls.filter(([message]) => typeof message === 'string' && message.includes(text))
}

function hover(trigger: HTMLElement) {
  fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
  fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
  fireEvent.mouseEnter(trigger)
}

describe('<PreviewCard.Root />', () => {
  describe.skipIf(isJSDOM)('handle-backed root ownership', () => {
    it('keeps an initially open root open while a detached trigger declared after it registers', async () => {
      const handle = new PreviewCard.Handle<number>()
      const onOpenChange = vi.fn()

      render(DetachedTriggerAfterRoot, {
        handle,
        open: true,
        triggerId: 'trigger',
        onOpenChange
      })

      await waitFor(() => {
        expect(screen.getByTestId('trigger')).toHaveAttribute('data-popup-open')
      })
      expect(screen.getByTestId('popup')).toHaveAttribute('data-open')
      expect(handle.isOpen).toBe(true)
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('ignores imperative handle calls made before a root is attached', async () => {
      const handle = new PreviewCard.Handle<number>()

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      handle.open('trigger')
      handle.close()
      expect(handle.isOpen).toBe(false)
      expect(warningsMatching(warnSpy, 'no root using this handle is mounted')).toHaveLength(2)
      warnSpy.mockRestore()

      render(DetachedRootRemount, { handle })
      await tick()

      expect(screen.queryByTestId('popup')).toBeNull()
      expect(screen.getByTestId('payload').textContent).toBe('No payload')

      handle.open('trigger')
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      expect(screen.getByTestId('payload').textContent).toBe('1')
    })

    it('ignores imperative handle calls made after the root is detached', async () => {
      const handle = new PreviewCard.Handle<number>()
      const { rerender } = render(DetachedRootRemount, { handle })
      await tick()

      handle.open('trigger')
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      expect(screen.getByTestId('payload').textContent).toBe('1')

      await rerender({ handle, rootMounted: false })
      expect(handle.isOpen).toBe(false)
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      handle.open('trigger')
      handle.close()
      await tick()
      expect(handle.isOpen).toBe(false)
      expect(screen.queryByTestId('popup')).toBeNull()

      await rerender({ handle, rootMounted: true })
      expect(screen.queryByTestId('popup')).toBeNull()
      expect(screen.getByTestId('payload').textContent).toBe('No payload')

      handle.open('trigger')
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      expect(screen.getByTestId('payload').textContent).toBe('1')
    })

    it('throws when called with an unregistered trigger id', async () => {
      const handle = new PreviewCard.Handle<number>()
      render(DetachedRootRemount, { handle })
      await tick()

      expect(() => handle.open('missing')).toThrow('No trigger found with id "missing"')
      expect(handle.isOpen).toBe(false)
    })

    it('warns when a handle stays attached to more than one mounted root', async () => {
      const handle = new PreviewCard.Handle()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      render(SharedHandleRoots, { handle })
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      expect(warningsMatching(warnSpy, 'more than one mounted root')).toHaveLength(1)
      warnSpy.mockRestore()
    })

    it('resolves a trigger still registered to the previous root during a transient overlap', async () => {
      const handle = new PreviewCard.Handle()
      const openErrors: unknown[] = []
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { rerender } = render(DetachedRootHandoff, {
        handle,
        phase: 'outgoing',
        onOpenError: (error: unknown) => openErrors.push(error)
      })
      await tick()

      await rerender({ handle, phase: 'overlap', onOpenError: (e: unknown) => openErrors.push(e) })
      await tick()

      expect(openErrors).toHaveLength(0)
      await waitFor(() => expect(handle.isOpen).toBe(true))
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-popup-open')

      await rerender({ handle, phase: 'incoming', onOpenError: (e: unknown) => openErrors.push(e) })
      await tick()

      expect(handle.isOpen).toBe(true)
      warnSpy.mockRestore()
    })
  })

  describe.skipIf(isJSDOM)('controlled detached triggers', () => {
    describe('controlled open with triggerId', () => {
      it('renders the popup content for the active trigger payload', async () => {
        const { rerender } = render(PreviewCardDetachedPayload, {
          open: true,
          triggerId: 'trigger-1'
        })

        await waitFor(() => {
          expect(content()).not.toBeNull()
        })
        expect(content()!.textContent).toBe('1')

        await rerender({ open: true, triggerId: 'trigger-2' })
        await waitFor(() => {
          expect(content()!.textContent).toBe('2')
        })

        await rerender({ open: false, triggerId: 'trigger-2' })
        await waitFor(() => {
          expect(content()).toBeNull()
        })
      })

      it('reuses the popup and positioner DOM nodes when switching triggers', async () => {
        const { rerender } = render(PreviewCardDetachedPayload, {
          open: true,
          triggerId: 'trigger-1'
        })

        await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())
        const popupElement = screen.getByTestId('popup')
        const positionerElement = screen.getByTestId('positioner')

        await rerender({ open: true, triggerId: 'trigger-2' })
        await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))

        expect(screen.getByTestId('popup')).toBe(popupElement)
        expect(screen.getByTestId('positioner')).toBe(positionerElement)
      })
    })

    describe('uncontrolled initial open with triggerId', () => {
      it('anchors an initially open card to triggerId', async () => {
        render(PreviewCardDetachedPayload, { open: true, triggerId: 'trigger-2' })

        await waitFor(() => {
          expect(screen.getByTestId('popup').textContent).toBe('2')
        })
        expect(screen.getByTestId('trigger-2')).toHaveAttribute('data-popup-open')
        expect(screen.getByTestId('trigger-1')).not.toHaveAttribute('data-popup-open')
      })

      it('anchors an initially open card to triggerId with detached triggers', async () => {
        const handle = new PreviewCard.Handle<number>()
        render(PreviewCardDetachedSiblings, { handle, open: true, triggerId: 'trigger-2' })

        await waitFor(() => {
          expect(screen.getByTestId('popup').textContent).toBe('2')
        })
      })
    })

    describe('imperative actions on the handle', () => {
      it('opens via handle.open(id) — reflects isOpen — and closes via handle.close()', async () => {
        const handle = new PreviewCard.Handle<number>()
        render(PreviewCardDetachedPayload, { handle })
        await tick()

        expect(popup()).toBeNull()
        expect(handle.isOpen).toBe(false)

        handle.open('trigger-2')
        await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())

        expect(handle.isOpen).toBe(true)
        expect(screen.getByTestId('content').textContent).toBe('2')
        expect(screen.getByTestId('trigger-2')).toHaveAttribute('data-popup-open')
        expect(screen.getByTestId('trigger-1')).not.toHaveAttribute('data-popup-open')

        handle.close()
        await waitFor(() => expect(popup()).toBeNull())

        expect(handle.isOpen).toBe(false)
        expect(screen.getByTestId('trigger-2')).not.toHaveAttribute('data-popup-open')
      })

      it('switches the active trigger when opened against a different id', async () => {
        const handle = new PreviewCard.Handle<number>()
        render(PreviewCardDetachedPayload, { handle })
        await tick()

        handle.open('trigger-1')
        await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))
        expect(screen.getByTestId('trigger-1')).toHaveAttribute('data-popup-open')

        handle.open('trigger-2')
        await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
        expect(screen.getByTestId('trigger-2')).toHaveAttribute('data-popup-open')
        expect(screen.getByTestId('trigger-1')).not.toHaveAttribute('data-popup-open')
      })
    })

    describe('detached sibling triggers (handle on Trigger, outside Root)', () => {
      it('opens a detached sibling trigger via handle.open(id) and renders its payload', async () => {
        const handle = new PreviewCard.Handle<number>()
        render(PreviewCardDetachedSiblings, { handle })
        await tick()

        expect(popup()).toBeNull()

        handle.open('trigger-2')
        await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())

        expect(screen.getByTestId('content').textContent).toBe('2')
        expect(screen.getByTestId('trigger-2')).toHaveAttribute('data-popup-open')
        expect(screen.getByTestId('trigger-1')).not.toHaveAttribute('data-popup-open')

        handle.close()
        await waitFor(() => expect(popup()).toBeNull())
      })

      it('drives detached siblings via controlled open + triggerId', async () => {
        const handle = new PreviewCard.Handle<number>()
        const { rerender } = render(PreviewCardDetachedSiblings, {
          handle,
          open: true,
          triggerId: 'trigger-1'
        })

        await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))
        expect(screen.getByTestId('trigger-1')).toHaveAttribute('data-popup-open')
        await waitFor(() =>
          expect(
            Math.abs(
              screen.getByTestId('positioner').getBoundingClientRect().left -
                screen.getByTestId('trigger-1').getBoundingClientRect().left
            )
          ).toBeLessThanOrEqual(1)
        )

        await rerender({ handle, open: true, triggerId: 'trigger-2' })
        await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
        expect(screen.getByTestId('trigger-2')).toHaveAttribute('data-popup-open')
        expect(screen.getByTestId('trigger-1')).not.toHaveAttribute('data-popup-open')
        await waitFor(() =>
          expect(
            Math.abs(
              screen.getByTestId('positioner').getBoundingClientRect().left -
                screen.getByTestId('trigger-2').getBoundingClientRect().left
            )
          ).toBeLessThanOrEqual(1)
        )

        await rerender({ handle, open: false, triggerId: 'trigger-2' })
        await waitFor(() => expect(content()).toBeNull())
      })

      it('registers a detached trigger declared after the Root', async () => {
        const handle = new PreviewCard.Handle<number>()
        render(DetachedTriggerAfterRoot, { handle })
        await tick()

        handle.open('trigger')
        await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())

        expect(screen.getByTestId('content').textContent).toBe('1')
        expect(screen.getByTestId('trigger')).toHaveAttribute('data-popup-open')
      })

      it('opens on hover with any detached trigger', async () => {
        const handle = new PreviewCard.Handle<number>()
        const user = userEvent.setup()
        render(PreviewCardDetachedSiblings, { handle })
        await tick()

        for (const id of ['trigger-1', 'trigger-2', 'trigger-3']) {
          const trigger = screen.getByTestId(id)
          await user.hover(trigger)
          await waitFor(() => expect(screen.queryByTestId('popup')).toBeVisible())

          await user.unhover(trigger)
          await waitFor(() => expect(popup()).toBeNull())
        }
      })

      it('opens on focus with any detached trigger and closes on blur', async () => {
        const handle = new PreviewCard.Handle<number>()
        render(PreviewCardDetachedSiblings, { handle })
        await tick()

        expect(popup()).toBeNull()

        for (const id of ['trigger-1', 'trigger-2', 'trigger-3']) {
          const trigger = screen.getByTestId(id)
          trigger.focus()
          await waitFor(() => expect(screen.queryByTestId('popup')).toBeVisible())

          trigger.blur()
          await waitFor(() => expect(popup()).toBeNull())
        }
      })

      it('reuses the popup and positioner DOM nodes when switching detached triggers', async () => {
        const handle = new PreviewCard.Handle<number>()
        render(PreviewCardDetachedSiblings, { handle })
        await tick()

        screen.getByTestId('trigger-1').focus()
        await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())

        const popupElement = screen.getByTestId('popup')
        const positionerElement = screen.getByTestId('positioner')

        screen.getByTestId('trigger-2').focus()
        await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))

        expect(screen.getByTestId('popup')).toBe(popupElement)
        expect(screen.getByTestId('positioner')).toBe(positionerElement)
      })

      it('closes when the active detached trigger unmounts', async () => {
        const handle = new PreviewCard.Handle<number>()
        const { rerender } = render(DetachedUnmountTrigger, { handle, showFirstTrigger: true })

        await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('1'))

        await rerender({ handle, showFirstTrigger: false })

        await waitFor(() => expect(screen.queryByTestId('trigger-1')).toBeNull())
        const trigger2 = screen.getByTestId('trigger-2')
        await waitFor(() => expect(trigger2).not.toHaveAttribute('data-popup-open'))
        await waitFor(() => expect(screen.queryByTestId('content')).toBeNull())
      })

      it('remains open on the original trigger when the unmount close is canceled', async () => {
        const handle = new PreviewCard.Handle<number>()
        render(DetachedUnmountVeto, { handle })
        await tick()

        await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('1'))

        await fireEvent.click(screen.getByTestId('remove-first'))
        await waitFor(() => expect(screen.queryByTestId('trigger-1')).toBeNull())

        expect(screen.getByTestId('content')).toHaveTextContent('1')
        expect(screen.getByTestId('trigger-2')).not.toHaveAttribute('data-popup-open')
      })

      it('repositions to the other trigger when reopened with keepMounted', async () => {
        const handle = new PreviewCard.Handle<number>()
        const user = userEvent.setup()
        render(DetachedKeepMounted, { handle })
        await tick()

        const trigger1 = screen.getByTestId('trigger1')
        const trigger2 = screen.getByTestId('trigger2')
        const positioner = screen.getByTestId('positioner')

        await user.hover(trigger1)
        await waitFor(() => expect(screen.getByText('Content')).toBeVisible())
        await waitFor(() =>
          expect(
            Math.abs(
              positioner.getBoundingClientRect().left - trigger1.getBoundingClientRect().left
            )
          ).toBeLessThanOrEqual(1)
        )

        await user.unhover(trigger1)
        await waitFor(() => expect(positioner).toHaveAttribute('hidden'))

        await user.hover(trigger2)
        await waitFor(() => expect(screen.getByText('Content')).toBeVisible())
        await waitFor(() =>
          expect(
            Math.abs(
              positioner.getBoundingClientRect().left - trigger2.getBoundingClientRect().left
            )
          ).toBeLessThanOrEqual(1)
        )
      })
    })
  })

  describe.skipIf(isJSDOM)('detached trigger close-transition timing', () => {
    const injectedStyles: HTMLStyleElement[] = []

    function injectPopupCloseAnimation(name: string) {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes ${name} { from { opacity: 1; } to { opacity: 0.01; } }
        [data-testid="popup"][data-ending-style] {
          animation: ${name} ${CLOSE_TRANSITION_MS}ms linear forwards;
        }
      `
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

    it('opens immediately when entering trigger B during trigger A close transition', async () => {
      injectPopupCloseAnimation('preview-card-a-to-b-close')
      const handle = new PreviewCard.Handle<number>()
      const user = userEvent.setup()
      render(DetachedTiming, { handle, delay1: 0, delay2: OPEN_DELAY })
      await tick()

      const trigger1 = screen.getByTestId('trigger1')
      const trigger2 = screen.getByTestId('trigger2')

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      await user.unhover(trigger1)
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-ending-style'))

      await user.hover(trigger2)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'), {
        timeout: 200
      })
    })

    it('still respects trigger B open delay after trigger A close transition finishes', async () => {
      injectPopupCloseAnimation('preview-card-a-to-b-post-close-delay')
      const handle = new PreviewCard.Handle<number>()
      const user = userEvent.setup()
      render(DetachedTiming, { handle, delay1: 0, delay2: OPEN_DELAY })
      await tick()

      const trigger1 = screen.getByTestId('trigger1')
      const trigger2 = screen.getByTestId('trigger2')

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      await user.unhover(trigger1)
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-ending-style'))

      await waitFor(
        () => expect(screen.getByTestId('popup')).not.toHaveAttribute('data-ending-style'),
        { timeout: CLOSE_TRANSITION_TIMEOUT }
      )
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-closed'))

      await user.hover(trigger2)
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-closed'), {
        timeout: 200
      })
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-open'))
    })

    it('reopens immediately when re-hovering trigger A during its close transition', async () => {
      injectPopupCloseAnimation('preview-card-reopen-during-close')
      const handle = new PreviewCard.Handle<number>()
      const user = userEvent.setup()
      render(DetachedTiming, { handle, delay1: OPEN_DELAY })
      await tick()

      const trigger1 = screen.getByTestId('trigger1')

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      await user.unhover(trigger1)
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-ending-style'))

      await user.hover(trigger1)
      await waitFor(
        () => {
          expect(screen.getByTestId('popup')).toHaveAttribute('data-open')
          expect(screen.getByTestId('popup')).not.toHaveAttribute('data-closed')
        },
        { timeout: 200 }
      )
    })

    it('respects open delay on later same-trigger hovers after close lifecycle finishes', async () => {
      injectPopupCloseAnimation('preview-card-reopen-during-close-delay')
      const handle = new PreviewCard.Handle<number>()
      const user = userEvent.setup()
      render(DetachedTiming, { handle, delay1: OPEN_DELAY })
      await tick()

      const trigger1 = screen.getByTestId('trigger1')

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))
      await user.unhover(trigger1)
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-ending-style'))
      await user.hover(trigger1)
      await waitFor(
        () => {
          expect(screen.getByTestId('popup')).toHaveAttribute('data-open')
          expect(screen.getByTestId('popup')).not.toHaveAttribute('data-closed')
        },
        { timeout: 200 }
      )

      await user.unhover(trigger1)
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-closed'))
      await waitFor(
        () => expect(screen.getByTestId('popup')).not.toHaveAttribute('data-ending-style'),
        { timeout: CLOSE_TRANSITION_TIMEOUT }
      )

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-closed'), {
        timeout: 200
      })
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-open'))
    })
  })

  describe.skipIf(isJSDOM)('multiple triggers within Root', () => {
    it('opens the preview card with any trigger on hover', async () => {
      render(MultiTrigger)

      for (const id of ['trigger1', 'trigger2', 'trigger3']) {
        const trigger = screen.getByTestId(id)
        hover(trigger)
        await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())

        fireEvent.mouseLeave(trigger)
        fireEvent.mouseMove(document.body)
        await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
      }
    })

    it('opens the preview card immediately when hovering another trigger', async () => {
      render(MultiTrigger, { delay2: 2000 })

      const trigger1 = screen.getByTestId('trigger1')
      const trigger2 = screen.getByTestId('trigger2')

      hover(trigger1)
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())
      expect(screen.getByTestId('content').textContent).toBe('1')

      fireEvent.mouseLeave(trigger1, { relatedTarget: trigger2 })
      hover(trigger2)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
    })

    it('opens the preview card with any trigger on focus', async () => {
      render(MultiTrigger)

      expect(screen.queryByTestId('popup')).toBeNull()

      for (const id of ['trigger1', 'trigger2', 'trigger3']) {
        const trigger = screen.getByTestId(id)
        trigger.focus()
        await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())
        trigger.blur()
        await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
      }
    })

    it('opens again after escape when focusing another trigger', async () => {
      render(MultiTrigger)

      const trigger1 = screen.getByTestId('trigger1')
      const trigger2 = screen.getByTestId('trigger2')

      trigger1.focus()
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())

      fireEvent.keyDown(document.body, { key: 'Escape' })
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      trigger2.focus()
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())
    })

    it('switches immediately when focusing another trigger while open', async () => {
      render(MultiTrigger, { delay2: 2000 })

      const trigger1 = screen.getByTestId('trigger1')
      const trigger2 = screen.getByTestId('trigger2')

      trigger1.focus()
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      fireEvent.blur(trigger1, { relatedTarget: trigger2 })
      trigger2.focus()
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
    })

    it('reuses the popup and positioner DOM nodes when switching triggers', async () => {
      render(MultiTrigger)

      const trigger1 = screen.getByTestId('trigger1')
      const trigger2 = screen.getByTestId('trigger2')

      trigger1.focus()
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull())

      const popupElement = screen.getByTestId('popup')
      const positionerElement = screen.getByTestId('positioner')

      trigger2.focus()
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))

      expect(screen.getByTestId('positioner')).toBe(positionerElement)
      expect(screen.getByTestId('popup')).toBe(popupElement)
    })

    it('sets the payload and renders content based on its value', async () => {
      render(MultiTrigger)

      const trigger1 = screen.getByTestId('trigger1')
      const trigger2 = screen.getByTestId('trigger2')

      hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      fireEvent.mouseLeave(trigger1)
      fireEvent.mouseMove(document.body)
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      hover(trigger2)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
    })

    it('closes when the active trigger unmounts', async () => {
      const { rerender } = render(UnmountTrigger, { showFirstTrigger: true })

      await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('1'))

      await rerender({ showFirstTrigger: false })

      await waitFor(() => expect(screen.queryByTestId('trigger-1')).toBeNull())
      const trigger2 = screen.getByTestId('trigger-2')
      await waitFor(() => expect(trigger2).not.toHaveAttribute('data-popup-open'))
      await waitFor(() => expect(screen.queryByTestId('content')).toBeNull())
    })
  })
})
