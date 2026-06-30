import { Dialog } from '$lib/components/dialog'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AlertParentNested from './fixtures/alert-parent-nested.svelte'
import DialogFinalFocusFn from './fixtures/dialog-final-focus-fn.svelte'
import DialogInitialFocusFn from './fixtures/dialog-initial-focus-fn.svelte'
import DialogWithInitialFocus from './fixtures/dialog-with-initial-focus.svelte'
import DisplayContentsFocus from './fixtures/display-contents-focus.svelte'
import DisplayContentsTrap from './fixtures/display-contents-trap.svelte'
import ExitTransition from './fixtures/exit-transition.svelte'
import FinalFocusByType from './fixtures/final-focus-by-type.svelte'
import FinalFocusFnElement from './fixtures/final-focus-fn-element.svelte'
import FocusOutside from './fixtures/focus-outside.svelte'
import NestedAlert from './fixtures/nested-alert.svelte'
import NestedCountClosedToggle from './fixtures/nested-count-closed-toggle.svelte'
import NestedCountSiblingMount from './fixtures/nested-count-sibling-mount.svelte'
import NestedCountToggle from './fixtures/nested-count-toggle.svelte'
import NestedCount from './fixtures/nested-count.svelte'
import NestedDialog from './fixtures/nested-dialog.svelte'

function nestedDialogs(element: HTMLElement): string {
  return getComputedStyle(element).getPropertyValue('--nested-dialogs')
}

describe('<Dialog.Popup />', () => {
  it('throws a descriptive error when rendered outside <Dialog.Root>', () => {
    expect(() => render(Dialog.Popup)).toThrow(
      'ShardsUI: this part must be rendered inside <Dialog.Root>.'
    )
  })

  describe('prop: initialFocus', () => {
    it('focuses the first focusable element by default when initialFocus is undefined', async () => {
      const user = userEvent.setup()
      render(DialogWithInitialFocus, { open: false })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByTestId('first-input'))
      })
    })

    it('focuses a specific element when initialFocus points to that element', async () => {
      const user = userEvent.setup()
      render(DialogWithInitialFocus, { open: false, initialFocus: 'second-input' })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByTestId('second-input'))
      })
    })

    it('does not move focus into popup when initialFocus=false', async () => {
      const user = userEvent.setup()
      render(DialogWithInitialFocus, { open: false, initialFocus: 'false' })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)

      await waitFor(() => {
        const popup = screen.getByTestId('popup')
        expect(popup).not.toContain(document.activeElement)
      })
    })

    it('uses default focus behavior when initialFocus returns null', async () => {
      const user = userEvent.setup()
      render(DialogInitialFocusFn, { initialFocus: () => null })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByTestId('input-1'))
      })
    })

    it('uses default focus behavior when initialFocus returns true', async () => {
      const user = userEvent.setup()
      render(DialogInitialFocusFn, { initialFocus: () => true })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByTestId('input-1'))
      })
    })

    it('does not call initialFocus function when closing the dialog', async () => {
      const user = userEvent.setup()
      const spy = vi.fn(() => screen.queryByTestId('input-2'))
      render(DialogInitialFocusFn, { initialFocus: spy })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.queryByTestId('input-2')).toBe(document.activeElement)
      })

      expect(spy).toHaveBeenCalledTimes(1)

      await user.click(screen.getByTestId('close'))

      await waitFor(() => {
        expect(screen.getByTestId('trigger')).toBe(document.activeElement)
      })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('supports an element-returning function with a no-op via false/void by interaction type', async () => {
      const user = userEvent.setup()
      const elementFor = (type: string) =>
        type === 'keyboard' ? (screen.getByTestId('input-2') as HTMLElement) : undefined
      render(DialogInitialFocusFn, { initialFocus: elementFor })

      const trigger = screen.getByTestId('trigger')

      await user.click(trigger)
      await waitFor(() => expect(trigger).toHaveFocus())

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null))

      trigger.focus()
      await user.keyboard('{Enter}')
      await waitFor(() => expect(screen.getByTestId('input-2')).toHaveFocus())
    })

    it('passes the latest interaction type after reopening', async () => {
      const user = userEvent.setup()
      const initialFocus = vi.fn(() => false)
      render(DialogInitialFocusFn, { initialFocus })

      const trigger = screen.getByTestId('trigger')
      trigger.focus()
      await user.keyboard('[Enter]')

      await waitFor(() => expect(initialFocus).toHaveBeenLastCalledWith('keyboard'))

      await user.keyboard('[Escape]')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null))

      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.click(trigger, { detail: 1 })

      await waitFor(() => expect(initialFocus).toHaveBeenLastCalledWith('touch'))
    })

    it('focuses the popup itself rather than inner content when opened by touch', async () => {
      render(DialogInitialFocusFn)

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.click(trigger, { detail: 1 })

      await waitFor(() => expect(screen.getByTestId('dialog')).toHaveFocus())
      expect(screen.getByTestId('input-1')).not.toHaveFocus()
    })
  })

  describe('prop: finalFocus', () => {
    it('returns focus to trigger by default when finalFocus is undefined', async () => {
      const user = userEvent.setup()
      render(DialogWithInitialFocus, { open: false })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)
      await user.click(screen.getByTestId('close'))

      await waitFor(() => {
        expect(document.activeElement).toBe(trigger)
      })
    })

    it('focuses a specific element on close when finalFocus points to that element', async () => {
      const user = userEvent.setup()
      render(DialogWithInitialFocus, { open: false, finalFocus: 'alt-focus' })

      await user.click(screen.getByTestId('trigger'))
      await user.click(screen.getByTestId('close'))

      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByTestId('alt-focus-target'))
      })
    })

    it('does not move focus on close when finalFocus=false', async () => {
      const user = userEvent.setup()
      render(DialogWithInitialFocus, { open: false, finalFocus: 'false' })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)

      screen.getByTestId('second-input').focus()
      await user.click(screen.getByTestId('close'))

      await waitFor(() => {
        expect(document.activeElement).not.toBe(trigger)
      })
    })

    it('focuses the trigger by default when finalFocus returns null', async () => {
      const user = userEvent.setup()
      render(DialogFinalFocusFn, { finalFocus: () => null })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)
      await user.click(screen.getByTestId('close'))

      await waitFor(() => {
        expect(document.activeElement).toBe(trigger)
      })
    })

    it('moves focus to the trigger when finalFocus returns true', async () => {
      const user = userEvent.setup()
      render(DialogFinalFocusFn, { finalFocus: () => true })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)
      await user.click(screen.getByTestId('close'))

      await waitFor(() => {
        expect(document.activeElement).toBe(trigger)
      })
    })

    it('supports a function returning an element to focus on close', async () => {
      const user = userEvent.setup()
      render(FinalFocusFnElement)

      await user.click(screen.getByText('Open'))
      await user.click(screen.getByText('Close'))

      await waitFor(() => expect(screen.getByTestId('input-to-focus')).toHaveFocus())
    })

    it('supports an element-returning function with default(true)/no-op(void) by close type', async () => {
      const user = userEvent.setup()
      render(FinalFocusByType)

      const trigger = screen.getByText('Open')

      await user.click(trigger)
      await user.click(screen.getByText('Close'))
      await waitFor(() => expect(trigger).toHaveFocus())

      await user.click(trigger)
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))
      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.getByTestId('final-input')).toHaveFocus())
    })

    it('reports the close type of a Close press after an earlier Escape close', async () => {
      const user = userEvent.setup()
      render(FinalFocusByType, { keepMounted: true })

      const trigger = screen.getByText('Open')

      await user.click(trigger)
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))
      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.getByTestId('final-input')).toHaveFocus())

      await user.click(trigger)
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))
      await user.click(screen.getByText('Close'))
      await waitFor(() => expect(trigger).toHaveFocus())
    })

    it('respects finalFocus when initialFocus points outside the popup', async () => {
      const user = userEvent.setup()
      render(FocusOutside, { withFinalFocus: true })

      await user.click(screen.getByText('Open'))
      await waitFor(() => expect(screen.getByTestId('initial-outside')).toHaveFocus())

      await user.click(screen.getByText('Close'))
      await waitFor(() => expect(screen.getByTestId('final-outside')).toHaveFocus())
    })

    it('moves final focus to trigger if initialFocus points outside and finalFocus unset', async () => {
      const user = userEvent.setup()
      render(FocusOutside, { withFinalFocus: false })

      await user.click(screen.getByText('Open'))
      await waitFor(() => expect(screen.getByTestId('initial-outside')).toHaveFocus())

      await user.click(screen.getByText('Close'))
      await waitFor(() => expect(screen.getByTestId('final-outside')).not.toHaveFocus())
    })
  })

  describe.skipIf(isJSDOM)('nested dialog count', () => {
    it('reaches 2 across three levels and decrements back', async () => {
      const user = userEvent.setup()
      render(NestedCount)

      await user.click(screen.getByRole('button', { name: 'Trigger 0' }))
      await waitFor(() => expect(screen.queryByTestId('popup0')).not.toBe(null))

      const popup0 = screen.getByTestId('popup0')
      expect(nestedDialogs(popup0)).toBe('0')

      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))
      await waitFor(() => expect(screen.queryByTestId('popup1')).not.toBe(null))
      await waitFor(() => expect(nestedDialogs(screen.getByTestId('popup0'))).toBe('1'))

      await user.click(screen.getByRole('button', { name: 'Trigger 2' }))
      await waitFor(() => expect(screen.queryByTestId('popup2')).not.toBe(null))
      await waitFor(() => expect(nestedDialogs(screen.getByTestId('popup0'))).toBe('2'))

      await user.click(screen.getByRole('button', { name: 'Close 2' }))
      await waitFor(() => expect(nestedDialogs(screen.getByTestId('popup0'))).toBe('1'))

      await user.click(screen.getByRole('button', { name: 'Close 1' }))
      await waitFor(() => expect(nestedDialogs(screen.getByTestId('popup0'))).toBe('0'))
    })

    it('decrements when an open nested dialog is unmounted', async () => {
      const user = userEvent.setup()
      render(NestedCountToggle)

      const toggle = screen.getByRole('button', { name: 'toggle' })
      await user.click(screen.getByRole('button', { name: 'Trigger 0' }))
      await waitFor(() => expect(screen.queryByTestId('popup0')).not.toBe(null))

      expect(nestedDialogs(screen.getByTestId('popup0'))).toBe('0')

      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))
      await waitFor(() => expect(screen.queryByTestId('popup1')).not.toBe(null))
      await waitFor(() => expect(nestedDialogs(screen.getByTestId('popup0'))).toBe('1'))

      await user.click(toggle)
      await waitFor(() => expect(nestedDialogs(screen.getByTestId('popup0'))).toBe('0'))
    })

    it('is unchanged when a closed sibling nested dialog mounts', async () => {
      const user = userEvent.setup()
      render(NestedCountSiblingMount)

      await user.click(screen.getByRole('button', { name: 'Trigger 0' }))
      await waitFor(() => expect(screen.queryByTestId('popup0')).not.toBe(null))

      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))
      await waitFor(() => expect(screen.queryByTestId('popup1')).not.toBe(null))
      await waitFor(() => expect(nestedDialogs(screen.getByTestId('popup0'))).toBe('1'))

      await user.click(screen.getByText('mount sibling'))
      await waitFor(() => expect(nestedDialogs(screen.getByTestId('popup0'))).toBe('1'))
    })

    it('is unchanged when a closed nested dialog is unmounted', async () => {
      const user = userEvent.setup()
      render(NestedCountClosedToggle)

      await user.click(screen.getByRole('button', { name: 'Trigger 0' }))
      await waitFor(() => expect(screen.queryByTestId('popup0')).not.toBe(null))

      expect(nestedDialogs(screen.getByTestId('popup0'))).toBe('0')

      await user.click(screen.getByRole('button', { name: 'toggle' }))
      expect(nestedDialogs(screen.getByTestId('popup0'))).toBe('0')
    })

    it('increments for a nested AlertDialog (cross-type)', async () => {
      const user = userEvent.setup()
      render(NestedAlert)

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }))
      await waitFor(() => expect(screen.queryByTestId('parent-dialog')).not.toBe(null))

      const parent = screen.getByTestId('parent-dialog')
      expect(nestedDialogs(parent)).toBe('0')

      await user.click(screen.getByRole('button', { name: 'Open Alert' }))
      await waitFor(() => expect(screen.queryByTestId('nested-alert')).not.toBe(null))
      await waitFor(() => expect(nestedDialogs(screen.getByTestId('parent-dialog'))).toBe('1'))

      await user.click(screen.getByRole('button', { name: 'Close Alert' }))
      await waitFor(() => expect(nestedDialogs(screen.getByTestId('parent-dialog'))).toBe('0'))
    })
  })

  describe('style hooks', () => {
    it('adds data-nested and data-nested-dialog-open when a dialog has a parent dialog', async () => {
      render(NestedDialog)

      await fireEvent.click(screen.getByText('Open'))
      await waitFor(() => expect(screen.getByTestId('dialog-popup')).toBeInTheDocument())
      await fireEvent.click(screen.getByText('Open nested'))
      await waitFor(() => expect(screen.getByTestId('nested-dialog-popup')).toBeInTheDocument())

      const parentPopup = screen.getByTestId('dialog-popup')
      const nestedPopup = screen.getByTestId('nested-dialog-popup')

      expect(parentPopup).not.toHaveAttribute('data-nested')
      expect(nestedPopup).toHaveAttribute('data-nested')

      expect(parentPopup).toHaveAttribute('data-nested-dialog-open')
      expect(nestedPopup).not.toHaveAttribute('data-nested-dialog-open')
    })

    it('adds data-nested and data-nested-dialog-open when a dialog has a parent alert dialog', async () => {
      render(AlertParentNested)

      const parentDialog = screen.getByTestId('parent-dialog')
      const nestedDialog = screen.getByTestId('nested-dialog')

      expect(parentDialog).not.toHaveAttribute('data-nested')
      expect(nestedDialog).toHaveAttribute('data-nested')

      expect(parentDialog).toHaveAttribute('data-nested-dialog-open')
      expect(nestedDialog).not.toHaveAttribute('data-nested-dialog-open')
    })
  })

  it.skipIf(isJSDOM)('stays mounted until the exit transition finishes', async () => {
    const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
    globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
    try {
      const ontransitionend = vi.fn()
      const { rerender } = render(ExitTransition, { open: true, ontransitionend })

      await new Promise((resolve) => requestAnimationFrame(resolve))

      await rerender({ open: false, ontransitionend })
      expect(screen.queryByRole('dialog')).not.toBe(null)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBe(null)
      })

      await waitFor(() => {
        expect(ontransitionend).toHaveBeenCalledTimes(1)
      })
    } finally {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
    }
  })

  describe.skipIf(isJSDOM)('display: contents ancestors', () => {
    it('still moves initial focus into a popup wrapped by a display: contents ancestor', async () => {
      const user = userEvent.setup()
      render(DisplayContentsFocus)

      await user.click(screen.getByText('Open'))

      await waitFor(() => {
        expect(screen.getByTestId('dialog-input')).toHaveFocus()
      })
    })

    it('keeps Tab cycling inside a popup wrapped by a display: contents ancestor', async () => {
      const user = userEvent.setup()
      render(DisplayContentsTrap)

      const popup = screen.getByTestId('dialog-popup')

      await waitFor(() => {
        expect(screen.getByTestId('first-input')).toHaveFocus()
      })

      await user.keyboard('[Tab]')
      expect(screen.getByTestId('second-button')).toHaveFocus()

      await user.keyboard('[Tab]')
      await waitFor(() => {
        expect(screen.getByTestId('first-input')).toHaveFocus()
      })
      expect(screen.getByTestId('outside-before')).not.toHaveFocus()
      expect(screen.getByTestId('outside-after')).not.toHaveFocus()

      await user.keyboard('[ShiftLeft>][Tab][/ShiftLeft]')
      await waitFor(() => {
        expect(screen.getByTestId('second-button')).toHaveFocus()
      })
      expect(popup.contains(document.activeElement)).toBe(true)
    })
  })
})
