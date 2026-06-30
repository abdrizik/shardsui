import { AlertDialog } from '$lib/components/alert-dialog'
import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect, vi } from 'vitest'
import { popupConformanceTests } from '../popup-conformance'
import { isJSDOM } from '../test-utils'
import BasicAlertDialog from './fixtures/basic-alert-dialog.svelte'
import Conformance from './fixtures/conformance.svelte'
import DetachedHandleState from './fixtures/detached-handle-state.svelte'
import DetachedTriggerAlertDialog from './fixtures/detached-trigger-alert-dialog.svelte'
import HandleInitialOpen from './fixtures/handle-initial-open.svelte'
import ImperativeSingle from './fixtures/imperative-single.svelte'
import OpenChangeCompleteAnim from './fixtures/open-change-complete-anim.svelte'
import OpenChangeComplete from './fixtures/open-change-complete.svelte'
import ThreeTriggers from './fixtures/three-triggers.svelte'
import TwoDetachedTriggers from './fixtures/two-detached-triggers.svelte'
import TwoTriggers from './fixtures/two-triggers.svelte'
import VetoClose from './fixtures/veto-close.svelte'
import ViewportAlertDialog from './fixtures/viewport-alert-dialog.svelte'

describe('<AlertDialog.Root />', () => {
  popupConformanceTests({
    component: Conformance,
    triggerMouseAction: 'click',
    expectedPopupRole: 'alertdialog',
    expectedAriaHasPopupValue: 'dialog'
  })

  it('links the popup to its Title and Description ids', () => {
    render(BasicAlertDialog, { open: true })

    const popup = screen.getByRole('alertdialog')
    const title = screen.getByText('Alert Dialog Title')
    const description = screen.getByText('Alert Dialog Description')

    expect(title.getAttribute('id')).toBe(popup.getAttribute('aria-labelledby'))
    expect(description.getAttribute('id')).toBe(popup.getAttribute('aria-describedby'))
  })

  it('synchronizes trigger ARIA attributes in controlled mode', () => {
    render(TwoTriggers, { open: true, triggerId: 'trigger-2' })

    const trigger1 = screen.getByTestId('trigger-1')
    const trigger2 = screen.getByTestId('trigger-2')
    const popup = screen.getByRole('alertdialog')

    expect(trigger1).toHaveAttribute('aria-expanded', 'false')
    expect(trigger1).not.toHaveAttribute('aria-controls')
    expect(trigger2).toHaveAttribute('aria-expanded', 'true')
    expect(trigger2.getAttribute('aria-controls')).toBe(popup.getAttribute('id'))
  })

  it('synchronizes trigger ARIA attributes when initially open with a handle', () => {
    const handle = new AlertDialog.Handle()
    render(HandleInitialOpen, { handle })

    const trigger = screen.getByText('Open')
    const popup = screen.getByRole('alertdialog')

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger.getAttribute('aria-controls')).toBe(popup.getAttribute('id'))
  })

  it('renders a viewport', () => {
    render(ViewportAlertDialog)

    const viewport = screen.getByTestId('viewport')
    expect(viewport).toBeInTheDocument()
    expect(viewport).toContainElement(screen.getByRole('alertdialog'))
  })

  describe('prop: onOpenChange', () => {
    it('is called with true when dialog opens via trigger', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicAlertDialog, { onOpenChange })

      await user.click(screen.getByTestId('trigger'))

      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(onOpenChange.mock.calls[0][0]).toBe(true)
    })

    it('is called with false when dialog closes via Close button', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicAlertDialog, { open: true, onOpenChange })

      await user.click(screen.getByText('Close'))

      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(onOpenChange.mock.calls[0][0]).toBe(false)
    })

    it('is called with false when Escape is pressed', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicAlertDialog, { open: true, onOpenChange })

      await user.keyboard('{Escape}')

      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(onOpenChange.mock.calls[0][0]).toBe(false)
    })

    it('does not close when the backdrop is clicked', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicAlertDialog, { open: true, onOpenChange })

      const backdrop = screen.getByTestId('backdrop')
      await user.click(backdrop)

      expect(onOpenChange).not.toHaveBeenCalled()
      expect(screen.queryByRole('alertdialog')).not.toBe(null)
    })

    it('leaves the trigger and handle marked open when a controlled close is refused', async () => {
      const user = userEvent.setup()
      const handle = new AlertDialog.Handle()
      render(VetoClose, { handle })

      const trigger = screen.getByRole('button', { name: 'Open' })
      await user.click(trigger)

      await screen.findByRole('alertdialog')
      expect(trigger).toHaveAttribute('data-popup-open')
      expect(handle.isOpen).toBe(true)

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.getByRole('alertdialog')).toHaveAttribute('data-open')
      expect(trigger).toHaveAttribute('data-popup-open')
      expect(handle.isOpen).toBe(true)
    })
  })

  describe.skipIf(isJSDOM)('modality', () => {
    it('makes other interactive elements on the page inert when a modal dialog is open', () => {
      render(Conformance, { open: true })

      expect(screen.getByRole('presentation', { hidden: true })).not.toBe(null)
    })
  })

  describe.skipIf(isJSDOM)('multiple triggers within Root', () => {
    it('opens the alert dialog with any trigger', async () => {
      const user = userEvent.setup()
      render(ThreeTriggers)

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

    it('renders content from the payload of the trigger that opened it', async () => {
      const user = userEvent.setup()
      render(TwoTriggers)

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      await user.click(trigger1)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      await user.click(trigger2)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
    })

    it('reuses the popup DOM node when switching triggers', async () => {
      const user = userEvent.setup()
      render(TwoTriggers)

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      await user.click(trigger1)
      const popupElement = screen.getByTestId('alert-dialog-popup')

      await user.click(trigger2)
      expect(screen.getByTestId('alert-dialog-popup')).toBe(popupElement)
    })

    it('synchronizes ARIA attributes on the active trigger', async () => {
      const user = userEvent.setup()
      render(TwoTriggers)

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      expect(trigger2).toHaveAttribute('aria-expanded', 'false')

      await user.click(trigger1)

      const dialog = await screen.findByRole('alertdialog')
      const trigger1Controls = trigger1.getAttribute('aria-controls')
      expect(trigger1Controls).not.toBe(null)
      expect(dialog.getAttribute('id')).toBe(trigger1Controls)
      await waitFor(() => expect(trigger1).toHaveAttribute('aria-expanded', 'true'))
      expect(trigger2).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('imperative actions on the handle', () => {
    it('enforces alert dialog state on a handle-backed root', async () => {
      const user = userEvent.setup()
      const handle = new AlertDialog.Handle()
      render(DetachedHandleState, { handle })

      const state = screen.getByTestId('alert-dialog-state')
      expect(state).toHaveAttribute('data-modal', 'true')
      expect(state).toHaveAttribute('data-disable-pointer-dismissal', 'true')
      expect(state).toHaveAttribute('data-role', 'alertdialog')

      await user.click(screen.getByRole('button', { name: 'Open' }))

      expect(await screen.findByRole('alertdialog')).not.toBe(null)
      expect(handle.isOpen).toBe(true)

      await user.click(screen.getByRole('presentation', { hidden: true }))
      await tick()

      expect(screen.queryByRole('alertdialog')).not.toBe(null)
      expect(handle.isOpen).toBe(true)
    })

    it('keeps the alert dialog open when the backdrop is clicked', async () => {
      const user = userEvent.setup()
      const handle = new AlertDialog.Handle()
      render(DetachedTriggerAlertDialog, { handle })

      await user.click(screen.getByTestId('trigger'))
      expect(await screen.findByRole('alertdialog')).not.toBe(null)
      expect(handle.isOpen).toBe(true)

      await user.click(screen.getByTestId('backdrop'))

      expect(screen.queryByRole('alertdialog')).not.toBe(null)
      expect(handle.isOpen).toBe(true)
    })

    it('opens and closes the dialog', async () => {
      const handle = new AlertDialog.Handle()
      render(ImperativeSingle, { handle })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      expect(screen.queryByRole('alertdialog')).toBe(null)

      handle.open('trigger')
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBe(null))

      expect(screen.getByTestId('content').textContent).toBe('Content')
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      handle.close()
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBe(null))

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('sets the payload associated with the trigger', async () => {
      const handle = new AlertDialog.Handle<number>()
      render(TwoDetachedTriggers, { handle })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      expect(screen.queryByRole('alertdialog')).toBe(null)

      handle.open('trigger2')
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBe(null))

      expect(screen.getByTestId('content').textContent).toBe('2')
      expect(trigger2).toHaveAttribute('aria-expanded', 'true')
      expect(trigger1).not.toHaveAttribute('aria-expanded', 'true')

      handle.close()
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBe(null))

      expect(trigger2).toHaveAttribute('aria-expanded', 'false')
    })

    it('sets the payload programmatically', async () => {
      const handle = new AlertDialog.Handle<number>()
      render(TwoDetachedTriggers, { handle })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      expect(screen.queryByRole('alertdialog')).toBe(null)

      handle.openWithPayload(8)
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBe(null))

      expect(screen.getByTestId('content').textContent).toBe('8')
      expect(trigger1).not.toHaveAttribute('aria-expanded', 'true')
      expect(trigger2).not.toHaveAttribute('aria-expanded', 'true')

      handle.close()
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBe(null))
    })
  })

  describe.skipIf(isJSDOM)('prop: onOpenChangeComplete', () => {
    it('is called on close when there is no exit animation defined', async () => {
      const user = userEvent.setup()
      const onOpenChangeComplete = vi.fn()
      render(OpenChangeComplete, { open: true, onOpenChangeComplete })

      await user.click(screen.getByTestId('toggle'))

      await waitFor(() => expect(screen.queryByTestId('popup')).toBe(null))

      expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true)
      expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
    })

    it('is called on close when the exit animation finishes', async () => {
      const user = userEvent.setup()
      const onOpenChangeComplete = vi.fn()
      render(OpenChangeCompleteAnim, {
        open: true,
        mode: 'exit',
        onOpenChangeComplete
      })

      expect(screen.getByTestId('popup')).not.toBe(null)

      await waitFor(() => expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true))

      await user.click(screen.getByTestId('toggle'))

      await waitFor(() => expect(screen.queryByTestId('popup')).toBe(null))

      expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
    })

    it('is called on open when there is no enter animation defined', async () => {
      const user = userEvent.setup()
      const onOpenChangeComplete = vi.fn()
      render(OpenChangeComplete, { open: false, onOpenChangeComplete })

      await user.click(screen.getByTestId('toggle'))

      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBe(null))

      await waitFor(() => expect(onOpenChangeComplete).toHaveBeenCalled())
      expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true)
    })

    it('is called on open when the enter animation finishes', async () => {
      const user = userEvent.setup()
      const onOpenChangeComplete = vi.fn()
      render(OpenChangeCompleteAnim, {
        open: false,
        mode: 'enter',
        onOpenChangeComplete
      })

      await user.click(screen.getByTestId('toggle'))

      await waitFor(() => expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true))

      expect(screen.queryByTestId('popup')).not.toBe(null)
    })
  })
})
