import { Popover } from '$lib/components/popover'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect, type MockInstance, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicPopover from './fixtures/basic-popover.svelte'
import PopoverConditionalTriggers from './fixtures/popover-conditional-triggers.svelte'
import PopoverContainedPayload from './fixtures/popover-contained-payload.svelte'
import PopoverDetachedAriaControlled from './fixtures/popover-detached-aria-controlled.svelte'
import PopoverDetachedControlled from './fixtures/popover-detached-controlled.svelte'
import PopoverDetachedImperative from './fixtures/popover-detached-imperative.svelte'
import PopoverDetachedPayload from './fixtures/popover-detached-payload.svelte'
import PopoverDetachedReparent from './fixtures/popover-detached-reparent.svelte'
import PopoverDetachedRootRemount from './fixtures/popover-detached-root-remount.svelte'
import PopoverHandleHandoff from './fixtures/popover-handle-handoff.svelte'
import PopoverOpenOnMount from './fixtures/popover-open-on-mount.svelte'
import PopoverProgrammaticTriggers from './fixtures/popover-programmatic-triggers.svelte'
import PopoverSharedHandleRoots from './fixtures/popover-shared-handle-roots.svelte'
import PopoverTriggerAfterRoot from './fixtures/popover-trigger-after-root.svelte'

function warningsMatching(spy: MockInstance<typeof console.warn>, text: string) {
  return spy.mock.calls.filter(([message]) => typeof message === 'string' && message.includes(text))
}

describe('<Popover.Root />', () => {
  it('opens by trigger from a descendant effect on initial mount', async () => {
    const handle = new Popover.Handle()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(PopoverOpenOnMount, { handle })
    await tick()

    const detachedWarnings = warningsMatching(warnSpy, 'no root using this handle is mounted')
    warnSpy.mockRestore()

    expect(detachedWarnings).toHaveLength(0)
    expect(handle.isOpen).toBe(true)
    expect(screen.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'true')
  })

  it.skipIf(isJSDOM)('not have inline scale style after switching triggers', async () => {
    const user = userEvent.setup()
    const handle = new Popover.Handle<number>()
    render(PopoverDetachedPayload, { handle })

    await user.click(screen.getByTestId('trigger-1'))
    await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

    await user.click(screen.getByTestId('trigger-2'))
    await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))

    const popup = screen.getByTestId('popup')
    expect(popup.style.scale).toBe('')
  })

  describe.skipIf(isJSDOM)('handle-backed root ownership', () => {
    it('ignores imperative handle calls made before a root is attached', async () => {
      const user = userEvent.setup()
      const handle = new Popover.Handle<number>()

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      handle.open('trigger')
      handle.close()
      expect(handle.isOpen).toBe(false)
      expect(warningsMatching(warnSpy, 'no root using this handle is mounted')).toHaveLength(2)
      warnSpy.mockRestore()

      render(PopoverDetachedRootRemount, { handle })
      await tick()

      expect(screen.queryByTestId('popup')).toBeNull()
      expect(screen.getByTestId('payload').textContent).toBe('No payload')

      await user.click(screen.getByTestId('trigger'))
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      expect(screen.getByTestId('payload').textContent).toBe('1')
    })

    it('ignores imperative handle calls made after the root is detached', async () => {
      const user = userEvent.setup()
      const handle = new Popover.Handle<number>()
      const { rerender } = render(PopoverDetachedRootRemount, { handle })

      await user.click(screen.getByTestId('trigger'))
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

      await user.click(screen.getByTestId('trigger'))
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      expect(screen.getByTestId('payload').textContent).toBe('1')
    })

    it('throws when called with an unregistered trigger id', async () => {
      const handle = new Popover.Handle<number>()
      render(PopoverDetachedRootRemount, { handle })
      await tick()

      expect(() => handle.open('missing')).toThrow('No trigger found with id "missing"')
      expect(handle.isOpen).toBe(false)
    })

    it('warns when a handle stays attached to more than one mounted root', async () => {
      const handle = new Popover.Handle()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      render(PopoverSharedHandleRoots, { handle })
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      expect(warningsMatching(warnSpy, 'more than one mounted root')).toHaveLength(1)
      warnSpy.mockRestore()
    })

    it('resolves a trigger still registered to the previous root during a transient overlap', async () => {
      const handle = new Popover.Handle()
      const { rerender } = render(PopoverHandleHandoff, { handle, phase: 'outgoing' })
      await tick()

      await rerender({ handle, phase: 'overlap' })
      await tick()

      expect(handle.isOpen).toBe(true)
      await waitFor(() =>
        expect(screen.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'true')
      )

      await rerender({ handle, phase: 'incoming' })
      await tick()
      expect(handle.isOpen).toBe(true)
    })
  })

  describe.skipIf(isJSDOM)('multiple detached triggers', () => {
    it('sets the payload and renders content based on the opened trigger', async () => {
      const handle = new Popover.Handle<number>()
      render(PopoverDetachedPayload, { handle })
      await tick()

      handle.open('trigger-1')
      await tick()
      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
      expect(screen.getByTestId('content').textContent).toBe('1')

      handle.open('trigger-2')
      await tick()
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
    })

    it('switches to another trigger by clicking it while open', async () => {
      const handle = new Popover.Handle<number>()
      render(PopoverDetachedPayload, { handle })
      await tick()

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      fireEvent.click(trigger1)
      await tick()
      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
      expect(screen.getByTestId('content').textContent).toBe('1')

      fireEvent.click(trigger2)
      await tick()
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
      expect(handle.isOpen).toBe(true)
    })

    it('reuses the popup DOM node when switching triggers', async () => {
      const handle = new Popover.Handle<number>()
      render(PopoverDetachedPayload, { handle })
      await tick()

      handle.open('trigger-1')
      await tick()
      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
      const popupElement = screen.getByTestId('popup')
      const positionerElement = screen.getByTestId('positioner')

      handle.open('trigger-2')
      await tick()
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))

      expect(screen.getByTestId('popup')).toBe(popupElement)
      expect(screen.getByTestId('positioner')).toBe(positionerElement)
    })

    it('synchronizes ARIA attributes with controlled open', async () => {
      const handle = new Popover.Handle()
      render(PopoverDetachedAriaControlled, { handle })
      await tick()

      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')
      const popup = screen.getByTestId('popup')

      expect(trigger2).toHaveAttribute('aria-expanded', 'true')
      expect(trigger2).toHaveAttribute('aria-controls', popup.id)
      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      expect(trigger1).not.toHaveAttribute('aria-controls')
    })

    it('synchronizes ARIA attributes for controlled open on a single trigger without triggerId', async () => {
      render(BasicPopover, { open: true })

      const trigger = screen.getByTestId('trigger')
      await waitFor(() => expect(screen.getByTestId('popover-popup')).toBeInTheDocument())
      const popup = screen.getByTestId('popover-popup')

      await waitFor(() =>
        expect(trigger.getAttribute('aria-controls')).toBe(popup.getAttribute('id'))
      )
    })

    it('opens and closes imperatively via the handle', async () => {
      const handle = new Popover.Handle()
      render(PopoverDetachedImperative, { handle })
      await tick()

      expect(screen.queryByTestId('popup')).toBeNull()
      expect(handle.isOpen).toBe(false)

      handle.open('trigger')
      await tick()
      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
      expect(handle.isOpen).toBe(true)
      expect(screen.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'true')

      handle.close()
      await tick()
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
      expect(handle.isOpen).toBe(false)
      expect(screen.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'false')
    })

    it('renders an initially open popover with the active trigger payload', async () => {
      const handle = new Popover.Handle<number>()
      render(PopoverDetachedPayload, { handle, open: true, triggerId: 'trigger-2' })
      await tick()

      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
      expect(handle.isOpen).toBe(true)
      expect(screen.getByTestId('content').textContent).toBe('2')
    })
  })

  describe.skipIf(isJSDOM)(
    'Popover.Handle — controlled mode with multiple detached triggers',
    () => {
      it('opens the popup anchored to the trigger matching the given id', async () => {
        const handle = new Popover.Handle()
        render(PopoverDetachedControlled, { handle })

        await tick()

        expect(screen.queryByTestId('popup')).toBeNull()

        handle.open('trigger-2')

        await waitFor(() => {
          expect(screen.getByTestId('popup')).toBeInTheDocument()
        })
        expect(handle.isOpen).toBe(true)
        expect(screen.getByTestId('trigger-2')).toHaveAttribute('data-popup-open')
      })

      it('opens with any of the detached triggers and closes from the popup', async () => {
        const user = userEvent.setup()
        const handle = new Popover.Handle()
        render(PopoverDetachedControlled, { handle })
        await tick()

        expect(screen.queryByTestId('popup')).toBeNull()

        for (const testId of ['trigger-1', 'trigger-2', 'trigger-3']) {
          await user.click(screen.getByTestId(testId))
          await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())

          await user.click(screen.getByTestId('close'))
          await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
        }
      })

      it('switches the active trigger when opened against a different id', async () => {
        const handle = new Popover.Handle()
        render(PopoverDetachedControlled, { handle })
        await tick()

        handle.open('trigger-1')
        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
        expect(screen.getByTestId('trigger-1')).toHaveAttribute('data-popup-open')

        handle.open('trigger-3')
        await tick()
        expect(screen.getByTestId('trigger-3')).toHaveAttribute('data-popup-open')
      })
    }
  )

  describe('handle-backed root ownership: trigger registration', () => {
    it('registers a detached trigger declared after the root', async () => {
      const user = userEvent.setup()
      const handle = new Popover.Handle()
      render(PopoverTriggerAfterRoot, { handle })
      await tick()

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)

      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe.skipIf(isJSDOM)('detached triggers — reparenting', () => {
    async function openAndClose() {
      const user = userEvent.setup()
      await user.click(screen.getByTestId('trigger'))
      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
      await user.click(screen.getByTestId('close'))
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
    }

    it('stays clickable when wrappers are removed around the trigger', async () => {
      const handle = new Popover.Handle()
      const { rerender } = render(PopoverDetachedReparent, { handle, nesting: 3 })

      await openAndClose()

      for (const nesting of [2, 1, 0] as const) {
        await rerender({ handle, nesting })
        await openAndClose()
      }
    })

    it('stays clickable when wrappers are added around the trigger', async () => {
      const handle = new Popover.Handle()
      const { rerender } = render(PopoverDetachedReparent, { handle, nesting: 0 })

      await openAndClose()

      for (const nesting of [1, 2, 3] as const) {
        await rerender({ handle, nesting })
        await openAndClose()
      }
    })
  })

  describe('contained triggers', () => {
    it('sets the payload and renders content based on the opened trigger', async () => {
      const user = userEvent.setup()
      render(PopoverContainedPayload)

      await user.click(screen.getByTestId('trigger-1'))
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      await user.click(screen.getByTestId('trigger-2'))
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
    })
  })

  describe('controlled open + triggerId', () => {
    it('switches the rendered payload between contained triggers', async () => {
      const user = userEvent.setup()
      render(PopoverProgrammaticTriggers)

      await user.click(screen.getByTestId('open-1'))
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      await user.click(screen.getByTestId('open-2'))
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))

      await user.click(screen.getByTestId('close'))
      await waitFor(() => expect(screen.queryByTestId('content')).toBeNull())
    })

    it.skipIf(isJSDOM)(
      'returns focus to the last opener when the active trigger was switched while open',
      async () => {
        const user = userEvent.setup()
        render(PopoverProgrammaticTriggers)

        await user.click(screen.getByTestId('open-1'))
        await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

        await user.click(screen.getByTestId('open-2'))
        await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))

        await user.click(screen.getByTestId('close'))
        await waitFor(() => expect(screen.queryByTestId('content')).toBeNull())

        await waitFor(() => expect(screen.getByTestId('open-2')).toHaveFocus())
      }
    )

    it.skipIf(isJSDOM)(
      'anchors to the active detached trigger and drops its guards on close',
      async () => {
        const user = userEvent.setup()
        const handle = new Popover.Handle<number>()
        render(PopoverProgrammaticTriggers, { handle, detached: true })
        await tick()

        const trigger1 = screen.getByTestId('trigger-1')
        const trigger2 = screen.getByTestId('trigger-2')

        await user.click(screen.getByTestId('open-1'))
        await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))
        await waitFor(() => {
          const positioner = screen.getByTestId('positioner').getBoundingClientRect()
          const anchor = trigger1.getBoundingClientRect()
          expect(Math.abs(positioner.left - anchor.left)).toBeLessThanOrEqual(1)
        })

        await user.click(screen.getByTestId('open-2'))
        await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
        await waitFor(() => {
          const positioner = screen.getByTestId('positioner').getBoundingClientRect()
          const anchor = trigger2.getBoundingClientRect()
          expect(Math.abs(positioner.left - anchor.left)).toBeLessThanOrEqual(1)
        })
        expect(trigger2.previousElementSibling).toHaveAttribute('data-shards-ui-focus-guard')
        expect(trigger2.nextElementSibling).toHaveAttribute('data-shards-ui-focus-guard')

        await user.click(screen.getByTestId('close'))

        await waitFor(() => expect(screen.queryByTestId('content')).toBeNull())
        expect(trigger2.previousElementSibling).not.toHaveAttribute('data-shards-ui-focus-guard')
        expect(trigger2.nextElementSibling).not.toHaveAttribute('data-shards-ui-focus-guard')
      }
    )
  })

  describe.skipIf(isJSDOM)('detached triggers — positioning', () => {
    it('stays anchored when conditional triggers unmount and the tree remounts', async () => {
      const user = userEvent.setup()
      const handle = new Popover.Handle()
      render(PopoverConditionalTriggers, { handle })

      await waitFor(() => {
        const positioner = screen.getByTestId('positioner').getBoundingClientRect()
        const trigger = screen.getByTestId('trigger-0').getBoundingClientRect()
        expect(Math.abs(positioner.left - trigger.left)).toBeLessThanOrEqual(1)
      })

      await user.click(screen.getByTestId('toggle'))

      await waitFor(() => {
        const positioner = screen.getByTestId('positioner').getBoundingClientRect()
        const trigger = screen.getByTestId('trigger-0').getBoundingClientRect()
        expect(Math.abs(positioner.left - trigger.left)).toBeLessThanOrEqual(1)
      })
    })
  })
})
