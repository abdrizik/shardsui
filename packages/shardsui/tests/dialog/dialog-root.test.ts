import { Dialog } from '$lib/components/dialog'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { popupConformanceTests } from '../popup-conformance'
import { createTouch, fireTouch, isGecko, isJSDOM, isWebKit } from '../test-utils'
import CloseConfirmation from './fixtures/close-confirmation.svelte'
import DialogConformance from './fixtures/conformance.svelte'
import ContainedPayload from './fixtures/contained-payload.svelte'
import ControlledTriggerId from './fixtures/controlled-trigger-id.svelte'
import DialogImperativeHandle from './fixtures/dialog-imperative-handle.svelte'
import DialogShapes from './fixtures/dialog-shapes.svelte'
import DialogWithNestedSelect from './fixtures/dialog-with-nested-select.svelte'
import DynamicLabels from './fixtures/dynamic-labels.svelte'
import ExternalScrollLock from './fixtures/external-scroll-lock.svelte'
import NestedMenu from './fixtures/nested-menu.svelte'
import NonModalLeak from './fixtures/non-modal-leak.svelte'
import OpenChangeCompleteDismiss from './fixtures/open-change-complete-dismiss.svelte'
import OpenChangeCompleteRestart from './fixtures/open-change-complete-restart.svelte'
import OpenChangeCompleteToggle from './fixtures/open-change-complete-toggle.svelte'
import OpenChangeComplete from './fixtures/open-change-complete.svelte'
import PointerdownRemoval from './fixtures/pointerdown-removal.svelte'
import ProgrammaticTriggerId from './fixtures/programmatic-trigger-id.svelte'
import ScrollAreaTrap from './fixtures/scroll-area-trap.svelte'
import SiblingDialogs from './fixtures/sibling-dialogs.svelte'
import ThreeContainedTriggers from './fixtures/three-contained-triggers.svelte'
import TouchOutsidePress from './fixtures/touch-outside-press.svelte'
import TriggerOwnership from './fixtures/trigger-ownership.svelte'
import VetoOpen from './fixtures/veto-open.svelte'

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isPageLocked() {
  const html = document.documentElement
  const { overflow, overflowX, overflowY } = getComputedStyle(html)
  const htmlScrolls = /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX)
  return /hidden|clip/.test(getComputedStyle(htmlScrolls ? html : document.body).overflowY)
}

function hasOwnScrollLock(doc: Document) {
  return doc.documentElement.style.overflowX === 'hidden'
}

describe('<Dialog.Root />', () => {
  popupConformanceTests({
    component: DialogConformance,
    triggerMouseAction: 'click',
    expectedPopupRole: 'dialog'
  })

  it('keeps trigger ownership when another trigger mounts while open', async () => {
    const user = userEvent.setup()
    render(TriggerOwnership)

    const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
    await user.click(trigger1)

    const popup = await screen.findByRole('dialog')
    const trigger1Controls = trigger1.getAttribute('aria-controls')
    expect(trigger1Controls).toBe(popup.getAttribute('id'))

    await user.click(screen.getByRole('button', { name: 'Mount trigger 2' }))

    const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
    expect(trigger1).toHaveAttribute('aria-expanded', 'true')
    expect(trigger1.getAttribute('aria-controls')).toBe(trigger1Controls)
    expect(trigger2).toHaveAttribute('aria-expanded', 'false')
    expect(trigger2).not.toHaveAttribute('aria-controls')
  })

  it('keeps accessible names and descriptions in sync when label parts change', async () => {
    const user = userEvent.setup()
    render(DynamicLabels)

    const popup = screen.getByRole('dialog')
    const firstTitleId = screen.getByText('Title 1').getAttribute('id')
    const firstDescriptionId = screen.getByText('Description 1').getAttribute('id')

    expect(popup.getAttribute('aria-labelledby')).toBe(firstTitleId)
    expect(popup.getAttribute('aria-describedby')).toBe(firstDescriptionId)

    await user.click(screen.getByRole('button', { name: 'Change labels' }))

    const secondTitleId = screen.getByText('Title 2').getAttribute('id')
    const secondDescriptionId = screen.getByText('Description 2').getAttribute('id')

    await waitFor(() => expect(popup.getAttribute('aria-labelledby')).toBe(secondTitleId))
    await waitFor(() => expect(popup.getAttribute('aria-describedby')).toBe(secondDescriptionId))
    expect(secondTitleId).not.toBe(firstTitleId)
    expect(secondDescriptionId).not.toBe(firstDescriptionId)

    await user.click(screen.getByRole('button', { name: 'Change labels' }))

    await waitFor(() => expect(popup).not.toHaveAttribute('aria-labelledby'))
    await waitFor(() => expect(popup).not.toHaveAttribute('aria-describedby'))
  })

  describe.for([
    { name: 'contained triggers', shape: 'contained' },
    { name: 'detached triggers', shape: 'detached' },
    { name: 'multiple detached triggers', shape: 'multiple-detached' }
  ] as const)('when using $name', ({ shape }) => {
    it('rewires dismiss interactions after closing and reopening', async () => {
      const user = userEvent.setup()
      render(DialogShapes, { shape, modal: false })

      const trigger = screen.getByTestId('trigger')

      await user.click(trigger)
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))

      await user.keyboard('[Escape]')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null))

      await user.click(trigger)
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))

      fireEvent.click(document.body)
      await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null))
    })

    it('links the popup to its Title and Description ids', async () => {
      render(DialogShapes, { shape, modal: false, open: true, includeBackdrop: true })

      const popup = screen.queryByRole('dialog')
      expect(popup).not.toBe(null)

      expect(screen.getByText('title text').getAttribute('id')).toBe(
        popup?.getAttribute('aria-labelledby')
      )
      expect(screen.getByText('description text').getAttribute('id')).toBe(
        popup?.getAttribute('aria-describedby')
      )
    })

    describe('prop: onOpenChange', () => {
      it('reports each open state change through onOpenChange', async () => {
        const user = userEvent.setup()
        const onOpenChange = vi.fn()
        render(DialogShapes, { shape, onOpenChange })

        expect(onOpenChange).toHaveBeenCalledTimes(0)

        await user.click(screen.getByText('Open'))

        expect(onOpenChange).toHaveBeenCalledTimes(1)
        expect(onOpenChange.mock.calls[0][0]).toBe(true)

        await user.click(screen.getByText('Close'))

        expect(onOpenChange).toHaveBeenCalledTimes(2)
        expect(onOpenChange.mock.calls[1][0]).toBe(false)
      })

      it('calls onOpenChange once on Escape close', async () => {
        const user = userEvent.setup()
        const onOpenChange = vi.fn()
        render(DialogShapes, { shape, open: true, onOpenChange })

        await user.keyboard('[Escape]')

        expect(onOpenChange).toHaveBeenCalledTimes(1)
      })

      it('calls onOpenChange once on backdrop click (modal)', async () => {
        const user = userEvent.setup()
        const onOpenChange = vi.fn()
        render(DialogShapes, { shape, open: true, onOpenChange })

        await user.click(screen.getByRole('presentation', { hidden: true }))

        expect(onOpenChange).toHaveBeenCalledTimes(1)
      })

      it('calls onOpenChange once on outside click (non-modal)', async () => {
        const user = userEvent.setup()
        const onOpenChange = vi.fn()
        render(DialogShapes, { shape, open: true, modal: false, onOpenChange })

        await user.click(document.body)

        expect(onOpenChange).toHaveBeenCalledTimes(1)
      })

      describe.skipIf(isJSDOM)('clicks on user backdrop', () => {
        it('detects clicks on user backdrop', async () => {
          const user = userEvent.setup()
          const onOpenChange = vi.fn()
          render(DialogShapes, { shape, open: true, onOpenChange, includeBackdrop: true })

          await user.click(screen.getByTestId('backdrop'))

          expect(onOpenChange).toHaveBeenCalledTimes(1)
        })

        it('does not change open state on non-main button clicks', async () => {
          const user = userEvent.setup()
          const onOpenChange = vi.fn()
          render(DialogShapes, { shape, open: true, onOpenChange, includeBackdrop: true })

          const backdrop = screen.getByTestId('backdrop')
          await user.pointer([{ target: backdrop }, { keys: '[MouseRight]', target: backdrop }])

          expect(onOpenChange).toHaveBeenCalledTimes(0)
        })
      })

      it('stays closed when the open binding refuses to open', async () => {
        const user = userEvent.setup()
        render(VetoOpen, { shape })

        await user.click(screen.getByRole('button', { name: 'Open' }))

        expect(screen.queryByRole('dialog')).toBeNull()
      })
    })

    describe('prop: modal', () => {
      it('makes other interactive elements on the page inert when a modal dialog is open', async () => {
        render(DialogShapes, { shape, open: true, modal: true })

        expect(screen.getByRole('presentation', { hidden: true })).not.toBe(null)
      })

      it('does not make other interactive elements on the page inert when a non-modal dialog is open', async () => {
        render(DialogShapes, { shape, open: true, modal: false })

        expect(screen.queryByRole('presentation')).toBeNull()
      })
    })

    describe('prop: disablePointerDismissal', () => {
      it('does not close when disablePointerDismissal=true', async () => {
        const onOpenChange = vi.fn()
        render(DialogShapes, {
          shape,
          open: true,
          onOpenChange,
          disablePointerDismissal: true,
          modal: false
        })

        fireEvent.mouseDown(document.body)
        fireEvent.click(document.body)
        expect(onOpenChange).not.toHaveBeenCalled()
        expect(screen.queryByRole('dialog')).toBeInTheDocument()
      })

      it('closes when disablePointerDismissal=false', async () => {
        const onOpenChange = vi.fn()
        render(DialogShapes, {
          shape,
          open: true,
          onOpenChange,
          disablePointerDismissal: false,
          modal: false
        })

        await fireEvent.mouseDown(document.body)
        await fireEvent.click(document.body)
        expect(onOpenChange).toHaveBeenCalledTimes(1)
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeNull()
        })
      })

      it('closes when disablePointerDismissal=undefined (default)', async () => {
        const onOpenChange = vi.fn()
        render(DialogShapes, {
          shape,
          open: true,
          onOpenChange,
          modal: false
        })

        await fireEvent.mouseDown(document.body)
        await fireEvent.click(document.body)
        expect(onOpenChange).toHaveBeenCalledTimes(1)
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeNull()
        })
      })
    })

    describe('outside press event with backdrops', () => {
      it('does not close on mousedown on backdrop — only on click (modal=true)', async () => {
        const onOpenChange = vi.fn()
        render(DialogShapes, {
          shape,
          open: true,
          modal: true,
          onOpenChange,
          includeBackdrop: true
        })

        const backdrop = screen.getByTestId('backdrop')

        await fireEvent.mouseDown(backdrop)
        expect(screen.queryByRole('dialog')).toBeInTheDocument()
        expect(onOpenChange).not.toHaveBeenCalled()

        await fireEvent.click(backdrop)
        expect(onOpenChange).toHaveBeenCalledTimes(1)
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeNull()
        })
      })

      it('internal backdrop closes on click but not on mousedown', async () => {
        const onOpenChange = vi.fn()
        render(DialogShapes, { shape, open: true, modal: true, onOpenChange })

        const internalBackdrop = screen.getByRole('presentation', { hidden: true })

        fireEvent.mouseDown(internalBackdrop)
        expect(screen.queryByRole('dialog')).toBeInTheDocument()
        expect(onOpenChange).not.toHaveBeenCalled()

        fireEvent.click(internalBackdrop)
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeNull()
        })
        expect(onOpenChange).toHaveBeenCalledTimes(1)
      })
    })

    describe('prop: modal, internal backdrop', () => {
      it('renders an internal backdrop when modal=true', async () => {
        const user = userEvent.setup()
        render(DialogShapes, { shape, modal: true })

        await user.click(screen.getByTestId('trigger'))
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))

        const popup = screen.getByRole('dialog')

        expect(popup.previousElementSibling?.previousElementSibling).toHaveAttribute(
          'role',
          'presentation'
        )
      })

      it('does not render an internal backdrop when modal=false', async () => {
        const user = userEvent.setup()
        render(DialogShapes, { shape, modal: false })

        await user.click(screen.getByTestId('trigger'))
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))

        const popup = screen.getByRole('dialog')

        expect(popup.previousElementSibling?.previousElementSibling ?? null).toBe(null)
      })
    })

    describe('multiple sibling dialogs — dismiss one by one', () => {
      it('does not dismiss previous modal dialog when opening a new modal dialog', async () => {
        render(SiblingDialogs, { shape })

        await fireEvent.click(screen.getByRole('button', { name: 'Open base' }))
        await fireEvent.click(screen.getByRole('button', { name: 'Open nested 1' }))
        await fireEvent.click(screen.getByRole('button', { name: 'Open nested 2' }))

        expect(screen.getByText('Final nested')).not.toBeNull()
      })

      it('dismisses non-nested (sibling) dialogs one by one via their backdrops', async () => {
        render(SiblingDialogs, { shape })

        await fireEvent.click(screen.getByRole('button', { name: 'Open base' }))
        await fireEvent.click(screen.getByRole('button', { name: 'Open nested 1' }))
        await fireEvent.click(screen.getByRole('button', { name: 'Open nested 2' }))

        const backdrops = Array.from(document.querySelectorAll('[role="presentation"]'))
        await fireEvent.click(backdrops[backdrops.length - 1])
        await waitFor(() => expect(screen.queryByTestId('level-3')).toBeNull())

        await fireEvent.click(backdrops[backdrops.length - 2])
        await waitFor(() => expect(screen.queryByTestId('level-2')).toBeNull())

        await fireEvent.click(backdrops[backdrops.length - 3])
        await waitFor(() => expect(screen.queryByTestId('level-1')).toBeNull())
      })
    })

    describe.skipIf(isJSDOM)('nested popups', () => {
      it('nested modal menu: dismissing outside the menu closes only the menu, not the dialog', async () => {
        const user = userEvent.setup()
        render(NestedMenu, { shape })

        await user.click(screen.getByRole('button', { name: 'Open' }))
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))

        await user.click(screen.getByRole('button', { name: 'Open menu' }))
        await waitFor(() => expect(screen.queryByRole('menu')).not.toBe(null))

        const menuPositioner = screen.getByTestId('menu-positioner')
        const menuInternalBackdrop = menuPositioner.previousElementSibling as HTMLElement
        await user.click(menuInternalBackdrop)

        await waitFor(() => expect(screen.queryByRole('menu')).toBe(null))
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))

        const dialogPopup = screen.getByTestId('dialog-popup')
        const dialogInternalBackdrop = dialogPopup.previousElementSibling
          ?.previousElementSibling as HTMLElement
        await user.click(dialogInternalBackdrop)

        await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null))
      })

      it('closes the nested select popup — then closes the dialog on the next outside press', async () => {
        const user = userEvent.setup()
        render(DialogWithNestedSelect, { shape })

        await user.click(screen.getByRole('button', { name: 'Open' }))
        await waitFor(() => expect(screen.queryByTestId('dialog-popup')).not.toBeNull())

        await user.click(screen.getByTestId('select-trigger'))
        await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeNull())

        const selectPositioner = screen.getByTestId('select-positioner')
        const selectInternalBackdrop = selectPositioner.previousElementSibling as HTMLElement
        await user.click(selectInternalBackdrop)

        await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
        await waitFor(() => expect(screen.queryByTestId('dialog-popup')).not.toBeNull())

        const dialogPopup = screen.getByTestId('dialog-popup')
        const dialogInternalBackdrop = dialogPopup.previousElementSibling
          ?.previousElementSibling as HTMLElement
        await user.click(dialogInternalBackdrop)

        await waitFor(() => expect(screen.queryByTestId('dialog-popup')).toBeNull())
      })
    })

    describe.skipIf(isJSDOM || isGecko || isWebKit)('pointerdown removal', () => {
      it('moves focus to popup when a focused child is removed on pointerdown, outside press still dismisses', async () => {
        const user = userEvent.setup()
        render(PointerdownRemoval, { shape })

        const removeButton = screen.getByTestId('remove')
        await waitFor(() => expect(removeButton).toHaveFocus())

        fireEvent.pointerDown(removeButton)

        const popup = screen.getByTestId('dialog-popup')
        await waitFor(() => expect(popup).toHaveFocus())

        await user.click(document.body)
        await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null))
      })
    })

    describe.skipIf(isJSDOM)('prop: onOpenChangeComplete', () => {
      it('is called on close/open when no animation is defined', async () => {
        const user = userEvent.setup()
        const onOpenChangeComplete = vi.fn()
        render(OpenChangeComplete, { shape, open: true, onOpenChangeComplete })

        await user.click(screen.getByText('Close externally'))
        await waitFor(() => expect(screen.queryByTestId('dialog-popup')).toBe(null))

        expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true)
        expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
      })

      it('is not called on mount when not open', async () => {
        const onOpenChangeComplete = vi.fn()
        render(OpenChangeComplete, { shape, open: false, onOpenChangeComplete })

        expect(onOpenChangeComplete).toHaveBeenCalledTimes(0)
      })

      it('is called on open when there is no enter animation', async () => {
        const user = userEvent.setup()
        const onOpenChangeComplete = vi.fn()
        render(OpenChangeCompleteToggle, {
          shape,
          open: false,
          mode: 'none',
          onOpenChangeComplete
        })

        await user.click(screen.getByTestId('toggle'))

        await waitFor(() => expect(screen.queryByTestId('dialog-popup')).not.toBe(null))
        await waitFor(() => expect(onOpenChangeComplete).toHaveBeenCalled())
        expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true)
      })

      it('is called on close once the exit animation finishes', async () => {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
        const user = userEvent.setup()
        const onOpenChangeComplete = vi.fn()
        render(OpenChangeCompleteToggle, {
          shape,
          open: true,
          mode: 'exit',
          onOpenChangeComplete
        })

        expect(screen.getByTestId('dialog-popup')).not.toBe(null)
        await waitFor(() => expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true))

        await user.click(screen.getByTestId('toggle'))

        await waitFor(() => expect(screen.queryByTestId('dialog-popup')).toBe(null))

        expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
      })

      it('is called on open once the enter animation finishes', async () => {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
        const user = userEvent.setup()
        const onOpenChangeComplete = vi.fn()
        render(OpenChangeCompleteToggle, {
          shape,
          open: false,
          mode: 'enter',
          onOpenChangeComplete
        })

        await user.click(screen.getByTestId('toggle'))
        await waitFor(() => expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true))

        expect(screen.queryByTestId('dialog-popup')).not.toBe(null)
      })

      it('waits for a restarted enter animation to finish', async () => {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
        const onOpenChangeComplete = vi.fn()
        render(OpenChangeCompleteRestart, { shape, onOpenChangeComplete })

        fireEvent.click(screen.getByText('Open externally'))

        const popup = await screen.findByTestId('dialog-popup')
        await waitFor(() => expect(popup.getAnimations().length).not.toBe(0))

        fireEvent.click(screen.getByText('Swap animation'))

        await Promise.resolve()
        expect(onOpenChangeComplete).toHaveBeenCalledTimes(0)

        await waitFor(() => {
          expect(onOpenChangeComplete).toHaveBeenCalledTimes(1)
          expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true)
        })
      })

      it('is not called on open when dismissed during the enter animation', async () => {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
        const onOpenChangeComplete = vi.fn()
        render(OpenChangeCompleteDismiss, { shape, onOpenChangeComplete })

        fireEvent.click(screen.getByText('Open externally'))

        await waitFor(() => expect(screen.queryByTestId('dialog-popup')).not.toBe(null))

        const popup = screen.getByTestId('dialog-popup')
        await waitFor(() => {
          const animations = popup.getAnimations()
          expect(animations.length).not.toBe(0)
          expect(animations.some((anim) => anim.playState !== 'finished')).toBe(true)
        })

        fireEvent.click(document.body)

        await waitFor(() => expect(screen.queryByTestId('dialog-popup')).toBe(null))

        expect(onOpenChangeComplete).toHaveBeenCalledTimes(1)
        expect(onOpenChangeComplete.mock.calls[0][0]).toBe(false)
      })
    })
  })

  it.skipIf(isJSDOM)(
    'keeps focus trapped when content contains a non-scrollable scroll area',
    async () => {
      const user = userEvent.setup()
      render(ScrollAreaTrap)

      const popup = screen.getByRole('dialog')
      const outsideBefore = screen.getByTestId('outside-before')
      const outsideAfter = screen.getByTestId('outside-after')

      await waitFor(() => expect(popup.contains(document.activeElement)).toBe(true))

      await user.keyboard('[Tab]')
      expect(popup.contains(document.activeElement)).toBe(true)

      await user.keyboard('[Tab]')
      expect(popup.contains(document.activeElement)).toBe(true)

      await user.keyboard('[ShiftLeft>][Tab][/ShiftLeft]')
      expect(popup.contains(document.activeElement)).toBe(true)

      expect(outsideBefore).not.toHaveFocus()
      expect(outsideAfter).not.toHaveFocus()
    }
  )

  it.skipIf(isJSDOM)(
    'returns focus into the dialog when a close-confirmation opened by outside press closes',
    async () => {
      const user = userEvent.setup()
      render(CloseConfirmation)

      await user.click(screen.getByTestId('trigger'))
      await screen.findByRole('dialog')

      const textarea = screen.getByTestId('textarea')
      await user.click(textarea)
      await user.keyboard('x')
      expect(textarea).toHaveFocus()

      await user.click(screen.getByTestId('backdrop'))

      const goBack = await screen.findByTestId('go-back')
      await waitFor(() => expect(goBack).toHaveFocus())

      await user.keyboard('[Enter]')

      await waitFor(() => expect(screen.queryByTestId('go-back')).toBe(null))
      await waitFor(() => expect(textarea).toHaveFocus())
    }
  )

  it.skipIf(isJSDOM)(
    'does not leak a non-modal popup field into an unrelated dialog return focus',
    async () => {
      const user = userEvent.setup()
      render(NonModalLeak)

      const field = screen.getByTestId('nonmodal-field')
      await user.click(field)
      expect(field).toHaveFocus()

      await user.click(screen.getByTestId('surface'))

      const goBack = await screen.findByTestId('go-back')
      await waitFor(() => expect(goBack).toHaveFocus())

      await user.keyboard('[Enter]')

      await waitFor(() => expect(screen.queryByTestId('go-back')).toBe(null))
      await Promise.resolve()
      expect(field).not.toHaveFocus()
    }
  )

  describe.skipIf(isJSDOM)('multiple triggers within Root', () => {
    it('opens the dialog with any of multiple contained triggers', async () => {
      const user = userEvent.setup()
      render(ThreeContainedTriggers)

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      const trigger3 = screen.getByRole('button', { name: 'Trigger 3' })

      expect(screen.queryByText('Dialog Content')).toBe(null)

      await user.click(trigger1)
      await waitFor(() => expect(screen.queryByText('Dialog Content')).not.toBe(null))
      await user.click(screen.getByText('Close'))
      await waitFor(() => expect(screen.queryByText('Dialog Content')).toBe(null))

      await user.click(trigger2)
      await waitFor(() => expect(screen.queryByText('Dialog Content')).not.toBe(null))
      await user.click(screen.getByText('Close'))
      await waitFor(() => expect(screen.queryByText('Dialog Content')).toBe(null))

      await user.click(trigger3)
      await waitFor(() => expect(screen.queryByText('Dialog Content')).not.toBe(null))
    })

    it('contained triggers: sets payload and renders content based on its value', async () => {
      const user = userEvent.setup()
      render(ContainedPayload)

      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      await user.click(trigger2)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
    })

    it('contained triggers: reuses the popup DOM node when switching triggers', async () => {
      const user = userEvent.setup()
      render(ContainedPayload)

      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))
      const popupElement = screen.getByTestId('dialog-popup')

      await user.click(trigger2)
      expect(screen.getByTestId('dialog-popup')).toBe(popupElement)
    })

    it('synchronizes ARIA attributes on the active trigger (multiple contained)', async () => {
      const user = userEvent.setup()
      render(ContainedPayload)

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      expect(trigger2).toHaveAttribute('aria-expanded', 'false')

      await user.click(trigger1)

      const dialog = await screen.findByRole('dialog')
      const trigger1Controls = trigger1.getAttribute('aria-controls')
      expect(trigger1Controls).not.toBe(null)
      expect(dialog.getAttribute('id')).toBe(trigger1Controls)
      await waitFor(() => expect(trigger1).toHaveAttribute('aria-expanded', 'true'))
      expect(trigger2).toHaveAttribute('aria-expanded', 'false')
    })

    it('synchronizes ARIA attributes with controlled open and triggerId', async () => {
      render(ControlledTriggerId)

      const trigger1 = screen.getByText('Trigger 1')
      const trigger2 = screen.getByText('Trigger 2')
      const dialog = await screen.findByRole('dialog')

      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      expect(trigger1).not.toHaveAttribute('aria-controls')
      expect(trigger2).toHaveAttribute('aria-expanded', 'true')
      expect(trigger2.getAttribute('aria-controls')).toBe(dialog.getAttribute('id'))
    })

    it('sets the payload when opening programmatically with a controlled triggerId', async () => {
      const user = userEvent.setup()
      render(ProgrammaticTriggerId)

      const openButton = screen.getByRole('button', { name: 'Open programmatically' })
      await user.click(openButton)

      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))

      await user.click(screen.getByRole('button', { name: 'Close' }))
      await waitFor(() => expect(screen.queryByTestId('content')).toBe(null))
      expect(openButton).toHaveFocus()
    })

    it('contained triggers: keeps the payload reactive', async () => {
      const user = userEvent.setup()
      render(ContainedPayload)

      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      await user.click(screen.getByRole('button', { name: 'Update payloads' }))
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('8'))
    })
  })

  describe('imperative handle actions', () => {
    it('opens and closes the dialog', async () => {
      const handle = new Dialog.Handle()
      render(DialogImperativeHandle, { handle })

      const trigger = screen.getByTestId('trigger-a')
      expect(screen.queryByRole('dialog')).toBe(null)

      handle.open('trigger-a')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      handle.close()
      await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null))
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('external scroll lock handoff', () => {
    beforeEach(async () => {
      await wait(0)
    })

    afterEach(() => {
      document.documentElement.removeAttribute('style')
      document.body.removeAttribute('style')
      document.body.removeAttribute('data-scroll-locked')
    })

    describe.skipIf(isJSDOM).for([
      {
        name: 'react-remove-scroll, via an attribute and a stylesheet',
        lock: () => {
          const style = document.createElement('style')
          style.textContent = 'body[data-scroll-locked]{overflow:hidden!important;}'
          document.head.appendChild(style)
          document.body.setAttribute('data-scroll-locked', '1')
          return () => {
            style.remove()
            document.body.removeAttribute('data-scroll-locked')
          }
        }
      },
      {
        name: 'silk-hq, via the <body> overflow shorthand',
        lock: () => {
          document.body.style.setProperty('overflow', 'hidden')
          return () => document.body.style.removeProperty('overflow')
        }
      },
      {
        name: 'Ariakit, via <html> overflow longhands',
        lock: () => {
          const { style } = document.documentElement
          style.setProperty('scrollbar-gutter', 'stable')
          style.setProperty('overflow-x', 'hidden')
          style.setProperty('overflow-y', 'hidden')
          return () => {
            style.removeProperty('scrollbar-gutter')
            style.removeProperty('overflow-x')
            style.removeProperty('overflow-y')
          }
        }
      }
    ])('when a third-party overlay is still unlocking: $name', ({ lock }) => {
      it('keeps the page locked until it takes over, and unlocks on close', async () => {
        render(ExternalScrollLock, { lock })
        expect(`initial: ${isPageLocked()}`).toBe('initial: false')

        await fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }))
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))

        for (const at of [0, 120, 260, 400]) {
          await wait(at === 0 ? 0 : 140)
          expect(`t${at}: ${isPageLocked()}`).toBe(`t${at}: true`)
        }

        await fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
        await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null))
        await waitFor(() => expect(`after close: ${isPageLocked()}`).toBe('after close: false'))
      })
    })

    it('locks immediately when an external <body> lock cannot affect the page', async () => {
      document.documentElement.style.overflowY = 'scroll'
      document.body.style.overflowY = 'hidden'

      render(ExternalScrollLock, { open: true })

      await wait(0)

      expect(hasOwnScrollLock(document)).toBe(true)

      await fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
      await waitFor(() => expect(hasOwnScrollLock(document)).toBe(false))
    })
  })

  it('does not close on a right-button outside press', async () => {
    const onOpenChange = vi.fn()
    render(TouchOutsidePress, { modal: 'trap-focus', onOpenChange })

    await fireEvent.pointerDown(screen.getByTestId('outside'), {
      bubbles: true,
      button: 2,
      pointerType: 'mouse'
    })

    expect(screen.getByRole('dialog')).not.toBe(null)
    expect(onOpenChange).toHaveBeenCalledTimes(0)
  })

  describe.skipIf(isJSDOM)('touch outside press', () => {
    async function tapOutside(element: HTMLElement) {
      const start = { clientX: 50, clientY: 50 }
      const end = { clientX: 50, clientY: 56 }

      fireTouch(element, 'touchstart', { touches: [createTouch(element, start)] })
      fireTouch(element, 'touchmove', { touches: [createTouch(element, end)] })
      fireTouch(element, 'touchend', {
        changedTouches: [createTouch(element, end)]
      })
    }

    async function expectClosesOnTouchTapOutside(modal: false | 'trap-focus') {
      const onOpenChange = vi.fn()
      render(TouchOutsidePress, { modal, onOpenChange })

      expect(screen.queryByRole('dialog')).not.toBe(null)

      await tapOutside(screen.getByTestId('outside'))

      await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null))
      expect(onOpenChange).toHaveBeenCalledWith(false)
    }

    it('closes a non-modal dialog without a backdrop', async () => {
      await expectClosesOnTouchTapOutside(false)
    })

    it('closes a trap-focus dialog without a backdrop', async () => {
      await expectClosesOnTouchTapOutside('trap-focus')
    })

    it('does not close when another touch is still active on touchend', async () => {
      const onOpenChange = vi.fn()
      render(TouchOutsidePress, { onOpenChange })

      const outside = screen.getByTestId('outside')
      const touch1Start = createTouch(outside, { clientX: 50, clientY: 50 })
      const touch2Start = createTouch(outside, { clientX: 70, clientY: 70 }, 2)
      const touch1End = createTouch(outside, { clientX: 50, clientY: 56 })

      fireTouch(outside, 'touchstart', { touches: [touch1Start, touch2Start] })
      fireTouch(outside, 'touchmove', { touches: [touch1End, touch2Start] })
      fireTouch(outside, 'touchend', {
        changedTouches: [touch1End],
        touches: [touch2Start]
      })

      expect(screen.queryByRole('dialog')).not.toBe(null)
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('does not close when two touches are lifted simultaneously on touchend', async () => {
      const onOpenChange = vi.fn()
      render(TouchOutsidePress, { onOpenChange })

      const outside = screen.getByTestId('outside')
      const touch1Start = createTouch(outside, { clientX: 50, clientY: 50 })
      const touch2Start = createTouch(outside, { clientX: 70, clientY: 70 }, 2)
      const touch1End = createTouch(outside, { clientX: 50, clientY: 56 })
      const touch2End = createTouch(outside, { clientX: 70, clientY: 76 }, 2)

      fireTouch(outside, 'touchstart', { touches: [touch1Start, touch2Start] })
      fireTouch(outside, 'touchmove', { touches: [touch1End, touch2End] })
      fireTouch(outside, 'touchend', {
        changedTouches: [touch1End, touch2End],
        touches: []
      })

      expect(screen.queryByRole('dialog')).not.toBe(null)
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('does not close when multiple touches move past the drag dismissal threshold', async () => {
      const onOpenChange = vi.fn()
      render(TouchOutsidePress, { onOpenChange })

      const outside = screen.getByTestId('outside')
      const touch1Start = createTouch(outside, { clientX: 50, clientY: 50 })
      const touch2Start = createTouch(outside, { clientX: 70, clientY: 70 }, 2)
      const touch1Move = createTouch(outside, { clientX: 50, clientY: 70 })
      const touch2Move = createTouch(outside, { clientX: 70, clientY: 90 }, 2)

      fireTouch(outside, 'touchstart', { touches: [touch1Start, touch2Start] })
      fireTouch(outside, 'touchmove', { touches: [touch1Move, touch2Move] })

      expect(screen.queryByRole('dialog')).not.toBe(null)
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('closes as soon as a single touch moves past the drag dismissal threshold', async () => {
      const onOpenChange = vi.fn()
      render(TouchOutsidePress, { onOpenChange })

      const outside = screen.getByTestId('outside')
      const touchStart = createTouch(outside, { clientX: 50, clientY: 50 })
      const touchMove = createTouch(outside, { clientX: 50, clientY: 70 })

      fireTouch(outside, 'touchstart', { touches: [touchStart] })
      fireTouch(outside, 'touchmove', { touches: [touchMove] })

      await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null))
      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
