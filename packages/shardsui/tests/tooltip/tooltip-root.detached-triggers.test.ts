import { Tooltip } from '$lib/components/tooltip'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect, type MockInstance, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import DetachedDisabled from './fixtures/detached-disabled.svelte'
import DetachedHover from './fixtures/detached-hover.svelte'
import DetachedRootHandoff from './fixtures/detached-root-handoff.svelte'
import DetachedRootRemount from './fixtures/detached-root-remount.svelte'
import DetachedTriggerAfterRoot from './fixtures/detached-trigger-after-root.svelte'
import DetachedUnmountVeto from './fixtures/detached-unmount-veto.svelte'
import DetachedUnmount from './fixtures/detached-unmount.svelte'
import SharedHandleRoots from './fixtures/shared-handle-roots.svelte'
import TooltipDetachedControlled from './fixtures/tooltip-detached-controlled.svelte'
import TooltipDetachedPayload from './fixtures/tooltip-detached-payload.svelte'

function warningsMatching(spy: MockInstance<typeof console.warn>, text: string) {
  return spy.mock.calls.filter(([message]) => typeof message === 'string' && message.includes(text))
}

describe('<Tooltip.Root />', () => {
  describe.skipIf(isJSDOM)('handle-backed root ownership', () => {
    it('ignores imperative handle calls made before a root is attached', async () => {
      const handle = new Tooltip.Handle<number>()

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
      const handle = new Tooltip.Handle<number>()
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
      const handle = new Tooltip.Handle<number>()
      render(DetachedRootRemount, { handle })
      await tick()

      expect(() => handle.open('missing')).toThrow('No trigger found with id "missing"')
      expect(handle.isOpen).toBe(false)
    })

    it('registers a detached trigger declared after the root', async () => {
      const handle = new Tooltip.Handle()
      render(DetachedTriggerAfterRoot, { handle })
      await tick()

      handle.open('trigger')

      await waitFor(() => expect(screen.getByTestId('content')).toBeVisible())
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-popup-open')
    })

    it('warns when a handle stays attached to more than one mounted root', async () => {
      const handle = new Tooltip.Handle()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      render(SharedHandleRoots, { handle })
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      expect(warningsMatching(warnSpy, 'more than one mounted root')).toHaveLength(1)
      warnSpy.mockRestore()
    })

    it('resolves a trigger still registered to the previous root during a transient overlap', async () => {
      const handle = new Tooltip.Handle()
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

  describe.skipIf(isJSDOM)('multiple detached triggers', () => {
    it('open the tooltip with any trigger on hover', async () => {
      const user = userEvent.setup({ delay: null })
      const handle = new Tooltip.Handle()
      render(DetachedHover, { handle })
      await tick()

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')
      const trigger3 = screen.getByTestId('trigger-3')

      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      await user.unhover(trigger1)
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      await user.hover(trigger2)
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      await user.unhover(trigger2)
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      await user.hover(trigger3)
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      await user.unhover(trigger3)
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
    })

    it('open the tooltip with any trigger on focus', async () => {
      const handle = new Tooltip.Handle()
      render(DetachedHover, { handle })
      await tick()

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')
      const trigger3 = screen.getByTestId('trigger-3')

      expect(screen.queryByTestId('popup')).toBeNull()

      trigger1.focus()
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      trigger1.blur()
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      trigger2.focus()
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      trigger2.blur()
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      trigger3.focus()
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      trigger3.blur()
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
    })

    it('close when focusing a disabled trigger while another trigger is open', async () => {
      const handle = new Tooltip.Handle<number>()
      render(DetachedDisabled, { handle })
      await tick()

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      trigger1.focus()
      await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('1'))

      trigger2.focus()
      await waitFor(() => expect(screen.queryByTestId('content')).toBeNull())
      expect(trigger2).not.toHaveAttribute('data-popup-open')
    })

    it('close when the active detached trigger unmounts', async () => {
      const handle = new Tooltip.Handle<number>()
      render(DetachedUnmount, { handle, open: true })
      await tick()

      await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('1'))

      await fireEvent.click(screen.getByTestId('remove-first'))

      const trigger2 = screen.getByTestId('trigger-2')
      await waitFor(() => expect(screen.queryByTestId('trigger-1')).toBeNull())
      await waitFor(() => expect(trigger2).not.toHaveAttribute('data-popup-open'))
      await waitFor(() => expect(screen.queryByTestId('content')).toBeNull())
    })

    it('keeps the popup on the original trigger when the unmount close is refused', async () => {
      const handle = new Tooltip.Handle<number>()
      render(DetachedUnmountVeto, { handle })
      await tick()

      await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('1'))

      await fireEvent.click(screen.getByTestId('remove-first'))
      await waitFor(() => expect(screen.queryByTestId('trigger-1')).toBeNull())

      expect(screen.getByTestId('content')).toHaveTextContent('1')
      expect(screen.getByTestId('trigger-2')).not.toHaveAttribute('data-popup-open')
    })

    it('close when hovering a disabled trigger while another trigger is open', async () => {
      const user = userEvent.setup({ delay: null })
      const handle = new Tooltip.Handle<number>()
      render(DetachedDisabled, { handle })
      await tick()

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('1'))

      await user.hover(trigger2)
      await waitFor(() => expect(screen.queryByTestId('content')).toBeNull())
      expect(trigger2).not.toHaveAttribute('data-popup-open')
    })

    it('not have inline scale style after switching triggers', async () => {
      const user = userEvent.setup({ delay: null })
      const handle = new Tooltip.Handle()
      render(DetachedHover, { handle })
      await tick()

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())

      await user.unhover(trigger1)
      await user.hover(trigger2)
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())

      expect(screen.getByTestId('popup').style.scale).toBe('')
    })
  })

  describe.skipIf(isJSDOM)('detached triggers — controlled and imperative', () => {
    describe('controlled payload content', () => {
      it('updates the content when switching the active trigger', async () => {
        const handle = new Tooltip.Handle<number>()
        const { rerender } = render(TooltipDetachedPayload, {
          handle,
          open: true,
          triggerId: 'trigger-1'
        })

        await tick()
        await waitFor(() => {
          expect(screen.getByTestId('content').textContent).toBe('1')
        })

        await waitFor(() => {
          expect(
            Math.abs(
              screen.getByTestId('positioner').getBoundingClientRect().left -
                screen.getByTestId('trigger-1').getBoundingClientRect().left
            )
          ).toBeLessThanOrEqual(1)
        })

        await rerender({ handle, open: true, triggerId: 'trigger-2' })
        await tick()

        await waitFor(() => {
          expect(screen.getByTestId('content').textContent).toBe('2')
        })
        expect(handle.state.payload).toBe(2)

        await waitFor(() => {
          expect(
            Math.abs(
              screen.getByTestId('positioner').getBoundingClientRect().left -
                screen.getByTestId('trigger-2').getBoundingClientRect().left
            )
          ).toBeLessThanOrEqual(1)
        })
      })
    })

    describe('controlled trigger switch reuses popup DOM', () => {
      it('keeps the same popup and positioner nodes', async () => {
        const handle = new Tooltip.Handle<number>()
        const { rerender } = render(TooltipDetachedPayload, {
          handle,
          open: true,
          triggerId: 'trigger-1'
        })

        await tick()
        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

        const popupElement = screen.getByTestId('popup')
        const positionerElement = screen.getByTestId('positioner')

        await rerender({ handle, open: true, triggerId: 'trigger-2' })
        await tick()

        await waitFor(() => {
          expect(screen.getByTestId('content').textContent).toBe('2')
        })
        expect(screen.getByTestId('popup')).toBe(popupElement)
        expect(screen.getByTestId('positioner')).toBe(positionerElement)
      })
    })

    describe('imperative handle', () => {
      it('open(id) opens the popup and close() closes it; isOpen reflects state', async () => {
        const handle = new Tooltip.Handle<number>()
        render(TooltipDetachedControlled, { handle })

        await tick()
        expect(screen.queryByTestId('popup')).toBeNull()
        expect(handle.isOpen).toBe(false)

        handle.open('trigger-2')

        await waitFor(() => {
          expect(screen.getByTestId('popup')).toBeInTheDocument()
        })
        expect(handle.isOpen).toBe(true)
        expect(screen.getByTestId('trigger-2')).toHaveAttribute('data-popup-open')

        handle.close()

        await waitFor(() => {
          expect(screen.queryByTestId('popup')).toBeNull()
        })
        expect(handle.isOpen).toBe(false)
        expect(screen.getByTestId('trigger-2')).not.toHaveAttribute('data-popup-open')
      })

      it('open(id) sets the payload associated with the trigger', async () => {
        const handle = new Tooltip.Handle<number>()
        render(TooltipDetachedPayload, { handle })

        await tick()
        expect(screen.queryByTestId('popup')).toBeNull()

        handle.open('trigger-2')

        await waitFor(() => {
          expect(screen.getByTestId('content').textContent).toBe('2')
        })
        expect(handle.state.payload).toBe(2)
        expect(screen.getByTestId('trigger-2')).toHaveAttribute('data-popup-open')
        expect(screen.getByTestId('trigger-1')).not.toHaveAttribute('data-popup-open')
      })
    })

    describe('controlled initially open', () => {
      it('renders the popup on mount when open + triggerId are set', async () => {
        const handle = new Tooltip.Handle<number>()
        render(TooltipDetachedPayload, { handle, open: true, triggerId: 'trigger-2' })

        await tick()

        await waitFor(() => {
          expect(screen.getByTestId('popup')).toBeInTheDocument()
        })
        expect(screen.getByTestId('content').textContent).toBe('2')
        expect(screen.getByTestId('trigger-2')).toHaveAttribute('data-popup-open')
      })
    })
  })
})
