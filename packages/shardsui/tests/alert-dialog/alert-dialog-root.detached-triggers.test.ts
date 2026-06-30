import { AlertDialog } from '$lib/components/alert-dialog'
import { render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import DetachedInitialOpen from './fixtures/detached-initial-open.svelte'
import DetachedRootRemount from './fixtures/detached-root-remount.svelte'
import DetachedTriggerReparenting from './fixtures/detached-trigger-reparenting.svelte'
import ThreeDetachedTriggers from './fixtures/three-detached-triggers.svelte'
import TwoDetachedTriggers from './fixtures/two-detached-triggers.svelte'

describe('<AlertDialog.Root />', () => {
  it('synchronizes detached trigger ARIA attributes when initially open with a handle', async () => {
    const handle = new AlertDialog.Handle()
    render(DetachedInitialOpen, { handle })

    const trigger = screen.getByText('Open')
    const popup = screen.getByRole('alertdialog')

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger.getAttribute('aria-controls')).toBe(popup.getAttribute('id'))
    expect(handle.isOpen).toBe(true)
  })

  describe.skipIf(isJSDOM)('multiple detached triggers', () => {
    async function openAndCloseDialog(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', { name: 'Trigger' }))
      await waitFor(() => expect(screen.getByText('Alert dialog content')).toBeVisible())
      await user.click(screen.getByText('Close'))
      await waitFor(() => expect(screen.queryByText('Alert dialog content')).toBe(null))
    }

    it('opens the alert dialog with any trigger', async () => {
      const user = userEvent.setup()
      const handle = new AlertDialog.Handle()
      render(ThreeDetachedTriggers, { handle })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      const trigger3 = screen.getByRole('button', { name: 'Trigger 3' })

      expect(screen.queryByText('Alert dialog content')).toBe(null)

      await user.click(trigger1)
      await waitFor(() => expect(screen.queryByText('Alert dialog content')).not.toBe(null))
      await user.click(screen.getByText('Close'))
      await waitFor(() => expect(screen.queryByText('Alert dialog content')).toBe(null))

      await user.click(trigger2)
      await waitFor(() => expect(screen.queryByText('Alert dialog content')).not.toBe(null))
      await user.click(screen.getByText('Close'))
      await waitFor(() => expect(screen.queryByText('Alert dialog content')).toBe(null))

      await user.click(trigger3)
      await waitFor(() => expect(screen.queryByText('Alert dialog content')).not.toBe(null))
    })

    it('attaches fresh root state when the root remounts after being unmounted while open', async () => {
      const user = userEvent.setup()
      const handle = new AlertDialog.Handle()
      render(DetachedRootRemount, { handle })

      const trigger = screen.getByRole('button', { name: 'Trigger' })

      await user.click(trigger)

      let popup = await screen.findByRole('alertdialog')
      expect(trigger.getAttribute('aria-controls')).toBe(popup.getAttribute('id'))

      await user.click(within(popup).getByRole('button', { name: 'Unmount root' }))
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBe(null))

      await user.click(screen.getByRole('button', { name: 'Remount root' }))
      expect(screen.queryByRole('alertdialog')).toBe(null)

      await user.click(trigger)

      popup = await screen.findByRole('alertdialog')
      expect(trigger.getAttribute('aria-controls')).toBe(popup.getAttribute('id'))

      await user.click(screen.getByRole('presentation', { hidden: true }))
      await tick()

      expect(screen.queryByRole('alertdialog')).not.toBe(null)
      expect(handle.isOpen).toBe(true)
    })

    it('stays clickable while wrappers are removed around the trigger', async () => {
      const user = userEvent.setup()
      const handle = new AlertDialog.Handle()
      const { rerender } = render(DetachedTriggerReparenting, { handle, nesting: 3 })

      await openAndCloseDialog(user)

      await rerender({ handle, nesting: 2 })
      await openAndCloseDialog(user)

      await rerender({ handle, nesting: 1 })
      await openAndCloseDialog(user)

      await rerender({ handle, nesting: 0 })
      await openAndCloseDialog(user)
    })

    it('stays clickable while wrappers are added around the trigger', async () => {
      const user = userEvent.setup()
      const handle = new AlertDialog.Handle()
      const { rerender } = render(DetachedTriggerReparenting, { handle, nesting: 0 })

      await openAndCloseDialog(user)

      await rerender({ handle, nesting: 1 })
      await openAndCloseDialog(user)

      await rerender({ handle, nesting: 2 })
      await openAndCloseDialog(user)

      await rerender({ handle, nesting: 3 })
      await openAndCloseDialog(user)
    })

    it('stays clickable when the handle instance is swapped out', async () => {
      const user = userEvent.setup()
      const { rerender } = render(DetachedTriggerReparenting, {
        handle: new AlertDialog.Handle(),
        nesting: 0
      })

      await openAndCloseDialog(user)

      await rerender({ handle: new AlertDialog.Handle(), nesting: 0 })
      await openAndCloseDialog(user)

      await rerender({ handle: new AlertDialog.Handle(), nesting: 0 })
      await openAndCloseDialog(user)
    })

    it('stays clickable when the handle instance is swapped out while reparenting', async () => {
      const user = userEvent.setup()
      const { rerender } = render(DetachedTriggerReparenting, {
        handle: new AlertDialog.Handle(),
        nesting: 3
      })

      await openAndCloseDialog(user)

      await rerender({ handle: new AlertDialog.Handle(), nesting: 2 })
      await openAndCloseDialog(user)

      await rerender({ handle: new AlertDialog.Handle(), nesting: 1 })
      await openAndCloseDialog(user)

      await rerender({ handle: new AlertDialog.Handle(), nesting: 0 })
      await openAndCloseDialog(user)
    })

    it('sets the payload and renders content based on its value', async () => {
      const user = userEvent.setup()
      const handle = new AlertDialog.Handle<number>()
      render(TwoDetachedTriggers, { handle })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      await user.click(trigger1)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      await user.click(trigger2)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
    })

    it('reuses the popup DOM node when switching triggers', async () => {
      const user = userEvent.setup()
      const handle = new AlertDialog.Handle<number>()
      render(TwoDetachedTriggers, { handle })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      await user.click(trigger1)
      const popupElement = screen.getByTestId('alert-dialog-popup')

      await user.click(trigger2)
      expect(screen.getByTestId('alert-dialog-popup')).toBe(popupElement)
    })
  })
})
