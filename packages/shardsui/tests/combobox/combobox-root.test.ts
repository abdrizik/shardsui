import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { popupConformanceTests } from '../popup-conformance'
import { isJSDOM } from '../test-utils'
import AnimatedMultipleCombobox from './fixtures/animated-multiple-combobox.svelte'
import AsyncDialogCombobox from './fixtures/async-dialog-combobox.svelte'
import AsyncItemsCombobox from './fixtures/async-items-combobox.svelte'
import AutoHighlightCombobox from './fixtures/auto-highlight-combobox.svelte'
import AutoHighlightGridCombobox from './fixtures/auto-highlight-grid-combobox.svelte'
import AutofillCombobox from './fixtures/autofill-combobox.svelte'
import AutofillObjectCombobox from './fixtures/autofill-object-combobox.svelte'
import BasicCombobox from './fixtures/basic-combobox.svelte'
import ComboboxCompareClear from './fixtures/combobox-compare-clear.svelte'
import ComboboxModalExtraControl from './fixtures/combobox-modal-extra-control.svelte'
import ComboboxNestedPopover from './fixtures/combobox-nested-popover.svelte'
import ComparatorCombobox from './fixtures/comparator-combobox.svelte'
import ComboboxConformance from './fixtures/conformance.svelte'
import ControlledOpenPopupCombobox from './fixtures/controlled-open-popup-combobox.svelte'
import DialogCombobox from './fixtures/dialog-combobox.svelte'
import DisabledMultipleForm from './fixtures/disabled-multiple-form.svelte'
import EmptyListPositioner from './fixtures/empty-list-positioner.svelte'
import ExternalValueCombobox from './fixtures/external-value-combobox.svelte'
import ExternalValueMultipleCombobox from './fixtures/external-value-multiple-combobox.svelte'
import FieldCombobox from './fixtures/field-combobox.svelte'
import FormCombobox from './fixtures/form-combobox.svelte'
import GridRowsCombobox from './fixtures/grid-rows-combobox.svelte'
import Grid from './fixtures/grid.svelte'
import HiddenControlFocus from './fixtures/hidden-control-focus.svelte'
import HighlightCombobox from './fixtures/highlight-combobox.svelte'
import IdCombobox from './fixtures/id-combobox.svelte'
import InertOutside from './fixtures/inert-outside.svelte'
import InlineCombobox from './fixtures/inline-combobox.svelte'
import InlineMultipleCombobox from './fixtures/inline-multiple-combobox.svelte'
import InputGroupCombobox from './fixtures/input-group-combobox.svelte'
import InputInsidePopupCombobox from './fixtures/input-inside-popup-combobox.svelte'
import ItemToStringCombobox from './fixtures/item-to-string-combobox.svelte'
import ItemsCombobox from './fixtures/items-combobox.svelte'
import KeptMountedClosedCombobox from './fixtures/kept-mounted-closed-combobox.svelte'
import LockedAutofillCombobox from './fixtures/locked-autofill-combobox.svelte'
import ModalInputInside from './fixtures/modal-input-inside.svelte'
import MultipleCombobox from './fixtures/multiple-combobox.svelte'
import PlainWrapper from './fixtures/plain-wrapper.svelte'
import R2AsyncCombobox from './fixtures/r2-async-combobox.svelte'
import R2ControlledOpenCombobox from './fixtures/r2-controlled-open-combobox.svelte'
import R2ExternalFilterCombobox from './fixtures/r2-external-filter-combobox.svelte'
import R2ExternalFormCombobox from './fixtures/r2-external-form-combobox.svelte'
import R2FieldItemsCombobox from './fixtures/r2-field-items-combobox.svelte'
import R2FieldPopupCombobox from './fixtures/r2-field-popup-combobox.svelte'
import R2FormTriggerCombobox from './fixtures/r2-form-trigger-combobox.svelte'
import R2GroupedItemsCombobox from './fixtures/r2-grouped-items-combobox.svelte'
import R2InlineItemsCombobox from './fixtures/r2-inline-items-combobox.svelte'
import R2LabelIdCombobox from './fixtures/r2-label-id-combobox.svelte'
import R2MultipleItemsCombobox from './fixtures/r2-multiple-items-combobox.svelte'
import R2ValidationFormCombobox from './fixtures/r2-validation-form-combobox.svelte'
import RecreatedValueCombobox from './fixtures/recreated-value-combobox.svelte'
import RejectedOpenCombobox from './fixtures/rejected-open-combobox.svelte'
import RestoreHighlightOutside from './fixtures/restore-highlight-outside.svelte'
import RestoreHighlightPopup from './fixtures/restore-highlight-popup.svelte'
import ScrollResetCombobox from './fixtures/scroll-reset-combobox.svelte'
import StringifierFilterCombobox from './fixtures/stringifier-filter-combobox.svelte'
import VirtualizedCombobox from './fixtures/virtualized-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

function isElementOrAncestorInert(element: HTMLElement) {
  let current: HTMLElement | null = element
  while (current) {
    if (
      current.getAttribute('aria-hidden') === 'true' ||
      current.hasAttribute('inert') ||
      current.hasAttribute('data-shards-ui-inert')
    ) {
      return true
    }
    current = current.parentElement
  }
  return false
}

function nextSiblingSkippingFocusGuards(element: Element) {
  let sibling = element.nextElementSibling
  while (sibling?.hasAttribute('data-shards-ui-focus-guard')) {
    sibling = sibling.nextElementSibling
  }
  return sibling
}

function hiddenInput(container: HTMLElement) {
  return container.querySelector('input[aria-hidden="true"]') as HTMLInputElement
}

describe('<Combobox.Root />', () => {
  popupConformanceTests({
    component: ComboboxConformance,
    triggerMouseAction: 'click',
    expectedPopupRole: 'listbox',
    combobox: true
  })

  describe('selection behavior', () => {
    it('pre-selects item when value is set (item shows as aria-selected)', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { value: 'banana' })
      const input = screen.getByRole('combobox')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })

    it('inputValue overrides derivation from value when provided', () => {
      render(BasicCombobox, { value: 'banana', inputValue: 'x' })
      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(input.value).toBe('x')
    })

    it('selects and closes, then reopens with selection marked', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { open: true })
      const input = screen.getByRole('combobox') as HTMLInputElement

      await user.click(screen.getByRole('option', { name: 'Banana' }))
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
      expect(input.value).toBe('banana')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })

    it('auto-closes the popup after selection when the open state is uncontrolled', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { withTrigger: true })
      const input = screen.getByRole('combobox')

      await user.click(screen.getByTestId('trigger'))
      expect(await screen.findByRole('listbox')).not.toBeNull()
      expect(input).toHaveAttribute('aria-expanded', 'true')

      await user.click(screen.getByRole('option', { name: 'Apple' }))

      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
      expect(input).toHaveAttribute('aria-expanded', 'false')
    })

    it('clears the typed input on Escape when nothing was selected', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { open: true })
      const input = screen.getByRole('combobox') as HTMLInputElement
      input.focus()
      await user.type(input, 'zz')
      await waitFor(() => expect(input.value).toBe('zz'))

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
      await waitFor(() => expect(input.value).toBe(''))
    })
  })

  describe('keyboard interaction', () => {
    it('opens, navigates with ArrowDown, and Enter selects', async () => {
      render(BasicCombobox, {})
      const input = screen.getByRole('combobox') as HTMLInputElement

      fireEvent.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('data-highlighted')
      )
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
        expect(input.value).toBe('apple')
      })
    })

    it('Escape closes popup without committing when nothing highlighted', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { open: true })
      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(screen.queryByRole('listbox')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(input.value).toBe('')
    })

    it('ArrowDown opens on the first item and ArrowUp opens on the last one', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, {})

      const input = screen.getByTestId('input')
      input.focus()

      await user.keyboard('{ArrowDown}')
      await waitFor(() => {
        const first = screen.getByRole('option', { name: 'Apple' })
        expect(input).toHaveAttribute('aria-activedescendant', first.id)
      })

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.keyboard('{ArrowUp}')
      await waitFor(() => {
        const last = screen.getByRole('option', { name: 'Cherry' })
        expect(input).toHaveAttribute('aria-activedescendant', last.id)
      })
    })

    it('selects the highlighted filtered item when items carry an explicit index', async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(VirtualizedCombobox, { count: 12, windowSize: 12, onValueChange })

      const input = screen.getByTestId('input')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.type(input, 'item-11')
      await waitFor(() => expect(screen.queryByRole('option', { name: 'item-0' })).toBeNull())

      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      await waitFor(() => expect(onValueChange).toHaveBeenCalledWith('item-11'))
    })

    it('bubbles Escape when the list is empty and the positioner is display:none', async () => {
      const user = userEvent.setup()
      const onOuterKeyDown = vi.fn()

      const { container } = render(EmptyListPositioner, { open: true, items: [] })
      const outer = container.parentElement as HTMLElement
      outer.addEventListener('keydown', (event) => {
        if ((event as KeyboardEvent).key === 'Escape') onOuterKeyDown()
      })

      const positioner = await screen.findByTestId('positioner')
      positioner.style.display = 'none'

      const input = screen.getByRole('combobox')
      await user.click(input)
      await user.keyboard('{Escape}')

      expect(onOuterKeyDown.mock.calls.length).toBe(1)
    })

    it('does not bubble Escape when a Combobox.Empty is rendered', async () => {
      const user = userEvent.setup()
      const onOuterKeyDown = vi.fn()

      const { container } = render(EmptyListPositioner, { open: true, items: [], withEmpty: true })
      const outer = container.parentElement as HTMLElement
      outer.addEventListener('keydown', (event) => {
        if ((event as KeyboardEvent).key === 'Escape') onOuterKeyDown()
      })

      const positioner = await screen.findByTestId('positioner')
      positioner.style.display = 'none'

      const input = screen.getByRole('combobox')
      await user.click(input)
      await user.keyboard('{Escape}')

      expect(onOuterKeyDown.mock.calls.length).toBe(0)
    })

    it('moves to the next match on the first ArrowDown after editing the selected text', async () => {
      const user = userEvent.setup()
      render(AutoHighlightCombobox, { items: ['Apple', 'Grape', 'Grapefruit'] })
      const input = screen.getByTestId('input')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
      await user.click(screen.getByRole('option', { name: 'Apple' }))
      await user.click(input)
      await user.clear(input)
      await user.type(input, 'Ape')
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      const grape = screen.getByRole('option', { name: 'Grape' })
      const grapefruit = screen.getByRole('option', { name: 'Grapefruit' })
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', grape.id))
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', grapefruit.id))
    })

    it('clicking on "listbox" keeps the focus on the input', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, {})

      const input = screen.getByRole('combobox') as HTMLInputElement

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.click(screen.getByRole('listbox'))
      expect(input).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      await waitFor(() => expect(input.value).toBe('apple'))
    })

    it('handles closing after a changed query is cleared', async () => {
      const user = userEvent.setup()
      render(ItemsCombobox, { items: ['apple'], open: true })
      const input = screen.getByRole('combobox')

      await user.type(input, 'a')
      await user.clear(input)
      await user.keyboard('{Escape}')

      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    })

    it('Enter selects with manual indices provided to items', async () => {
      const user = userEvent.setup()
      render(ItemsCombobox, { withIndex: true })
      const input = screen.getByTestId('input')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.type(input, 'c')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      await waitFor(() => expect(input).toHaveValue('cherry'))
    })
  })

  describe('dismissal', () => {
    it('dismisses the popup when clicking a plain wrapper around the input', async () => {
      const user = userEvent.setup()
      render(PlainWrapper, {})
      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(await screen.findByRole('listbox')).not.toBeNull()
      await user.click(screen.getByTestId('pad'))
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    })

    it('closes an initially open popup on an outside click', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { open: true })

      expect(screen.getByRole('listbox')).not.toBeNull()

      await user.click(document.body)

      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    })
  })

  it('does not dismiss when pressing content inside a nested popover', async () => {
    const user = userEvent.setup()
    render(ComboboxNestedPopover, { open: true })

    await user.click(screen.getByRole('button', { name: 'Open nested popover' }))
    await user.click(await screen.findByRole('button', { name: 'Nested focusable content' }))

    expect(screen.getByRole('listbox')).not.toBeNull()
  })

  it('wraps modal focus from popup controls back to the input', async () => {
    const user = userEvent.setup()
    render(ComboboxModalExtraControl, { open: true })

    const input = screen.getByRole('combobox')
    const extraControl = screen.getByRole('button', { name: 'Extra control' })

    input.focus()
    await user.tab()
    expect(extraControl).toHaveFocus()

    await user.tab()
    await waitFor(() => expect(input).toHaveFocus())
  })

  describe('internal dismiss buttons', () => {
    it('renders internal dismiss buttons before the input and after the popup', async () => {
      const user = userEvent.setup()
      render(ModalInputInside, { open: true })

      const popup = screen.getByTestId('popup')
      const input = screen.getByRole('combobox', { name: 'Combobox input' })
      const [startDismissButton, endDismissButton] = screen.getAllByRole('button', {
        name: 'Dismiss'
      })
      const outside = screen.getByTestId('outside')

      expect(input.previousElementSibling).toBe(startDismissButton)
      expect(nextSiblingSkippingFocusGuards(popup)).toBe(endDismissButton)
      expect(startDismissButton).not.toHaveAttribute('tabindex')
      expect(endDismissButton).not.toHaveAttribute('tabindex')

      await waitFor(() => expect(isElementOrAncestorInert(outside)).toBe(true))

      await user.click(endDismissButton)

      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    })

    it('renders an internal dismiss button for the input-outside-popup pattern', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, {})

      await user.click(screen.getByTestId('input'))

      const popup = await screen.findByTestId('popup')
      const input = screen.getByTestId('input')
      const [startDismissButton, endDismissButton] = screen.getAllByRole('button', {
        name: 'Dismiss'
      })

      expect(input.previousElementSibling).toBe(startDismissButton)
      expect(popup.nextElementSibling).toBe(endDismissButton)
      expect(startDismissButton).not.toHaveAttribute('tabindex')
      expect(endDismissButton).not.toHaveAttribute('tabindex')

      await user.click(startDismissButton)

      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    })

    it('does not render the start dismiss button while closed', () => {
      render(BasicCombobox, {})
      expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()
    })
  })

  describe('modality', () => {
    it('marks the surrounding content and the trigger inert once the popup opens', async () => {
      const user = userEvent.setup()
      render(InertOutside, {})

      await user.click(screen.getByTestId('input'))
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeNull())

      const outside = screen.getByTestId('outside')
      const trigger = screen.getByTestId('trigger')

      await waitFor(() => expect(isElementOrAncestorInert(outside)).toBe(true))
      expect(isElementOrAncestorInert(trigger)).toBe(true)
    })

    it('does not aria-hide the input group when the input is outside the popup', async () => {
      const user = userEvent.setup()
      render(InputGroupCombobox, {})
      const input = screen.getByTestId('input')
      const group = screen.getByTestId('group')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      expect(input).toHaveFocus()
      expect(group).not.toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('prop: id', () => {
    it('sets the id on the input when it is outside the popup', async () => {
      render(IdCombobox, { id: 'test-id' })
      const input = screen.getByRole('combobox')
      await waitFor(() => expect(input).toHaveAttribute('id', 'test-id'))
    })

    it('sets the id on the trigger when the input is inside the popup', () => {
      render(IdCombobox, { id: 'test-id', open: true, inputInsidePopup: true })
      const trigger = screen.getByTestId('trigger')
      const input = screen.getByTestId('input')
      expect(trigger).toHaveAttribute('id', 'test-id')
      expect(input).not.toHaveAttribute('id', 'test-id')
    })
  })

  describe('prop: value', () => {
    it('does not highlight a removed value after all multiple selections are cleared from outside', async () => {
      const user = userEvent.setup()
      render(ExternalValueCombobox, {
        multiple: true,
        value: ['apple', 'banana'],
        nextValue: []
      })

      const input = screen.getByTestId('input')

      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.click(screen.getByTestId('external-set'))

      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()

      expect(screen.getByRole('option', { name: 'banana' })).not.toHaveAttribute('data-highlighted')
    })

    it('clears the highlight when the value is cleared externally while closed', async () => {
      const user = userEvent.setup()
      render(ExternalValueCombobox, { value: 'banana', nextValue: null })

      const input = screen.getByTestId('input')

      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.click(screen.getByTestId('external-set'))

      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()

      expect(screen.getByRole('option', { name: 'banana' })).not.toHaveAttribute('data-highlighted')
      expect(input).not.toHaveAttribute('aria-activedescendant')
    })

    it('clears the highlight when the value is set to an unmatched value while closed', async () => {
      const user = userEvent.setup()
      render(ExternalValueCombobox, { value: 'banana', nextValue: 'dragonfruit' })

      const input = screen.getByTestId('input')

      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.click(screen.getByTestId('external-set'))

      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()

      expect(screen.getByRole('option', { name: 'banana' })).not.toHaveAttribute('data-highlighted')
      expect(input).not.toHaveAttribute('aria-activedescendant')
    })

    it('highlights the new selection, never the previous one, after an external change while open', async () => {
      const onItemHighlighted = vi.fn()
      const user = userEvent.setup()
      render(ExternalValueCombobox, { value: 'banana', nextValue: 'cherry', onItemHighlighted })

      const input = screen.getByTestId('input')

      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()

      fireEvent.click(screen.getByTestId('external-set'))
      expect(screen.getByRole('listbox')).not.toBeNull()

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      onItemHighlighted.mockClear()
      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()

      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'cherry' })).toHaveAttribute('data-highlighted')
      )
      expect(screen.getByRole('option', { name: 'banana' })).not.toHaveAttribute('data-highlighted')
      expect(
        onItemHighlighted.mock.calls.some(([highlightedValue]) => highlightedValue === 'banana')
      ).toBe(false)
    })
  })

  describe('prop: items', () => {
    it('does not crash when items becomes undefined', async () => {
      const { rerender } = render(ItemsCombobox, { items: [], open: true })
      await rerender({ items: undefined, open: true })
      expect(screen.getByTestId('input')).toBeInTheDocument()
    })

    it('keeps the selection marked when the items prop shrinks to the selected item', async () => {
      const user = userEvent.setup()
      render(AsyncItemsCombobox, {})

      const input = screen.getByTestId('input')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.click(screen.getByRole('option', { name: 'Cherry' }))
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('data-selected', '')
    })
  })

  describe('prop: open', () => {
    it('only opens and closes from the controlled open prop', async () => {
      const user = userEvent.setup()
      const { rerender } = render(R2ControlledOpenCombobox, { open: false })

      const input = screen.getByRole('combobox')

      await user.click(input)
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await rerender({ open: true })
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.click(document.body)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
    })

    it('allows an attempted open to be canceled', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(RejectedOpenCombobox, { onOpenChange })

      await user.click(screen.getByRole('combobox'))

      expect(onOpenChange).toHaveBeenCalledWith(true)
      expect(screen.queryByRole('listbox')).toBeNull()
    })
  })

  describe('prop: onOpenChange', () => {
    it('fires with true when popup opens', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()
      render(BasicCombobox, { onOpenChange: handleOpenChange })
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => screen.getByRole('listbox'))
      expect(handleOpenChange).toHaveBeenCalled()
      expect(handleOpenChange.mock.calls[0][0]).toBe(true)
    })

    it('fires with false when popup closes via Escape', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()
      render(BasicCombobox, { onOpenChange: handleOpenChange })
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => screen.getByRole('listbox'))
      handleOpenChange.mockClear()
      await user.keyboard('{Escape}')
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
      expect(handleOpenChange).toHaveBeenCalled()
      expect(handleOpenChange.mock.calls[0][0]).toBe(false)
    })

    it('fires exactly once with false when item selected by mouse click', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicCombobox, { onOpenChange })
      const input = screen.getByRole('combobox')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      onOpenChange.mockClear()
      await user.click(screen.getByRole('option', { name: 'Apple' }))

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())

      expect(onOpenChange.mock.calls.length).toBe(1)
      expect(onOpenChange.mock.calls[0][0]).toBe(false)
    })

    it('fires exactly once with false when item selected by Enter key', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicCombobox, { onOpenChange })
      const input = screen.getByRole('combobox')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.keyboard('{ArrowDown}')

      onOpenChange.mockClear()
      await user.keyboard('{Enter}')

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())

      expect(onOpenChange.mock.calls.length).toBe(1)
      expect(onOpenChange.mock.calls[0][0]).toBe(false)
    })
  })

  describe('prop: disabled', () => {
    it('sets disabled attribute on hidden input when name is provided', () => {
      const { container } = render(BasicCombobox, { disabled: true, name: 'test' })
      const hiddenInput = container.querySelector('input[name="test"][aria-hidden]')
      expect(hiddenInput).toBeInTheDocument()
      expect(hiddenInput).toHaveAttribute('disabled')
    })
  })

  describe('prop: required', () => {
    it('does not mark the hidden input as required when selection exists in multiple mode', () => {
      render(MultipleCombobox, {
        value: ['apple'],
        required: true,
        name: 'languages'
      })
      const hiddenInput = screen.getByRole('textbox', { hidden: true })
      expect(hiddenInput).not.toBe(null)
      expect(hiddenInput).not.toHaveAttribute('required')
    })

    it('keeps the hidden input required when no selection exists in multiple mode', () => {
      render(MultipleCombobox, {
        value: [],
        required: true,
        name: 'languages'
      })
      const hiddenInput = screen.getByRole('textbox', { hidden: true })
      expect(hiddenInput).not.toBe(null)
      expect(hiddenInput).toHaveAttribute('required')
    })
  })

  describe('prop: readOnly', () => {
    it('sets readOnly attribute on hidden input', () => {
      const { container } = render(BasicCombobox, { readOnly: true, name: 'test' })
      const hiddenInput = container.querySelector('input[name="test"][aria-hidden]')
      expect(hiddenInput).toBeInTheDocument()
      expect(hiddenInput).toHaveAttribute('readonly')
    })

    it('prevents value changes when readOnly (clicking item does not fire onValueChange)', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      render(BasicCombobox, { readOnly: true, onValueChange: handleValueChange, open: true })

      const item = screen.getByRole('option', { name: 'Apple' })
      await user.click(item)

      expect(handleValueChange.mock.calls.length).toBe(0)
    })
  })

  describe('prop: name', () => {
    it('does not set name on the visible input; routes it to the hidden input', () => {
      const { container } = render(BasicCombobox, { name: 'fruit' })
      const input = screen.getByRole('combobox')
      expect(input).not.toHaveAttribute('name')
      const hidden = container.querySelector('input[name="fruit"][aria-hidden]')
      expect(hidden).toBeInTheDocument()
    })
  })

  describe('prop: autoComplete', () => {
    it('keeps autocomplete=off on the visible input when a form hint is set', () => {
      render(ItemsCombobox, { name: 'country', autoComplete: 'country' })
      expect(screen.getByRole('combobox')).toHaveAttribute('autocomplete', 'off')
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list')
    })

    it('forwards autoComplete to the hidden input autocomplete attribute', () => {
      const { container } = render(ItemsCombobox, { name: 'country', autoComplete: 'country' })
      const hidden = container.querySelector('input[name="country"][aria-hidden]')
      expect(hidden).toHaveAttribute('autocomplete', 'country')
    })
  })

  describe('prop: itemToStringLabel / itemToStringValue', () => {
    it('uses itemToStringLabel to set input value on selection', async () => {
      const user = userEvent.setup()
      render(ItemToStringCombobox, { open: true })
      const input = screen.getByRole('combobox')

      await user.click(screen.getByText('Canada'))
      expect(input).toHaveValue('Canada')
    })

    it('uses itemToStringValue for form submission', () => {
      const { container } = render(ItemToStringCombobox, {
        value: { country: 'United States', code: 'US' },
        name: 'country'
      })
      const hiddenInput = container.querySelector('input[name="country"][aria-hidden]')
      expect(hiddenInput).toBeInTheDocument()
      expect((hiddenInput as HTMLInputElement).value).toBe('US')
    })

    it('uses itemToStringValue for multiple selection form submission', () => {
      const values = [
        { country: 'United States', code: 'US' },
        { country: 'Canada', code: 'CA' }
      ]
      const { container } = render(ItemToStringCombobox, {
        multiple: true,
        value: values,
        name: 'countries'
      })
      const inputs = container.querySelectorAll('input[type="hidden"][name="countries"]')
      expect(inputs.length).toBe(2)
      const vals = Array.from(inputs).map((i) => (i as HTMLInputElement).value)
      expect(vals).toContain('US')
      expect(vals).toContain('CA')
    })

    it('shows the label for a controlled object value that is not one of the items', () => {
      render(ItemToStringCombobox, { value: { country: 'Japan', code: 'JP' } })
      expect(screen.getByRole('combobox')).toHaveValue('Japan')
    })
  })

  describe('prop: multiple', () => {
    it('handles multiple selection', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      render(MultipleCombobox, { onValueChange: handleValueChange })

      await user.click(screen.getByRole('combobox'))
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      const optionA = screen.getByRole('option', { name: 'Apple' })
      await user.click(optionA)

      expect(handleValueChange.mock.calls.length).toBe(1)
      expect(handleValueChange.mock.calls[0][0]).toEqual(['apple'])

      const optionB = screen.getByRole('option', { name: 'Banana' })
      await user.click(optionB)

      expect(handleValueChange.mock.calls.length).toBe(2)
      expect(handleValueChange.mock.calls[1][0]).toEqual(['apple', 'banana'])
    })

    it('clears uncontrolled input after select in multiple mode while filtering', async () => {
      const user = userEvent.setup()
      render(MultipleCombobox, {})
      const input = screen.getByRole('combobox') as HTMLInputElement

      await user.type(input, 'app')
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: 'Apple' }))

      await waitFor(() => expect(input.value).toBe(''))
    })

    it('does not close the popup when filtering with the input inside the popup', async () => {
      const user = userEvent.setup()
      render(RestoreHighlightPopup, { multiple: true, items: ['apple', 'apricot', 'banana'] })

      await user.click(screen.getByTestId('trigger'))

      const input = await screen.findByTestId('input')
      await user.type(input, 'app')
      await user.click(screen.getByRole('option', { name: 'apple' }))

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeNull())
      expect(input).toHaveValue('')
    })

    it('keeps the popup input focused through keyboard selection and restores the last selection', async () => {
      const user = userEvent.setup()
      render(RestoreHighlightPopup, { multiple: true, items: ['apple', 'apricot', 'banana'] })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)

      const input = await screen.findByTestId('input')
      await user.type(input, 'ban')
      await user.keyboard('{ArrowDown}{Enter}')

      expect(screen.getByRole('dialog')).not.toBeNull()
      expect(input).toHaveFocus()
      expect(input).toHaveValue('')
      expect(trigger).toHaveTextContent('banana')
      expect(screen.getByRole('option', { name: 'banana' })).toHaveAttribute(
        'aria-selected',
        'true'
      )

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(trigger).toHaveFocus()

      await user.click(trigger)

      const selectedOption = await screen.findByRole('option', { name: 'banana' })
      expect(screen.getByTestId('input')).toHaveValue('')
      expect(selectedOption).toHaveAttribute('aria-selected', 'true')
      await waitFor(() => expect(selectedOption).toHaveAttribute('data-highlighted'))
    })

    it('normalizes a controlled null value when selecting in multiple mode', async () => {
      const onValueChange = vi.fn()
      render(MultipleCombobox, { value: null, open: true, onValueChange })

      fireEvent.click(screen.getByRole('option', { name: 'Apple' }))

      await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(['apple']))
    })

    it('clears the typed input on Escape close when no selection was made', async () => {
      const user = userEvent.setup()
      render(MultipleCombobox, { open: true })

      const input = screen.getByRole('combobox') as HTMLInputElement
      input.focus()
      await user.type(input, 'app')
      await waitFor(() => expect(input.value).toBe('app'))

      await user.keyboard('{Escape}')

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
      await waitFor(() => expect(input.value).toBe(''))
    })

    it.skipIf(isJSDOM)(
      'keeps the filtered content stable through the close animation',
      async () => {
        const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

        try {
          const user = userEvent.setup()
          render(AnimatedMultipleCombobox, {})

          const trigger = screen.getByTestId('trigger')
          await user.click(trigger)

          const input = await screen.findByTestId('input')
          await user.type(input, 'zz')

          await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No matches'))
          expect(screen.queryByText('apple')).toBeNull()

          await user.keyboard('{Escape}')

          const popup = screen.getByTestId('popup')
          await waitFor(() => expect(popup).toHaveAttribute('data-ending-style'))

          expect(screen.getByRole('status')).toHaveTextContent('No matches')
          expect(screen.queryByText('apple')).toBeNull()

          await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

          await user.click(trigger)

          const reopenedInput = await screen.findByTestId('input')
          expect(reopenedInput).toHaveValue('')
          expect(screen.getByText('apple')).not.toBeNull()
        } finally {
          globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
        }
      }
    )

    it.skipIf(isJSDOM)('clears the deferred popup input when reopening mid-close', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        const user = userEvent.setup()
        render(AnimatedMultipleCombobox, {})

        const trigger = screen.getByTestId('trigger')
        await user.click(trigger)

        const input = await screen.findByTestId('input')
        await user.type(input, 'zz')

        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No matches'))

        await user.keyboard('{Escape}')

        const popup = screen.getByTestId('popup')
        await waitFor(() => expect(popup).toHaveAttribute('data-ending-style'))

        await user.click(trigger)

        await waitFor(() => expect(popup).not.toHaveAttribute('data-ending-style'))

        expect(screen.getByTestId('input')).toHaveValue('')
        expect(screen.getByText('apple')).not.toBeNull()
        expect(screen.getByText('banana')).not.toBeNull()
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })

    it('keeps the clicked item highlighted after deselecting every other value', async () => {
      const user = userEvent.setup()
      render(R2MultipleItemsCombobox, {})

      const input = screen.getByTestId('input')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.click(screen.getByRole('option', { name: 'JavaScript' }))
      await user.click(screen.getByRole('option', { name: 'TypeScript' }))

      await user.type(input, 'pyth')
      await user.click(screen.getByRole('option', { name: 'Python' }))

      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      input.focus()
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.hover(screen.getByRole('option', { name: 'JavaScript' }))
      await user.click(screen.getByRole('option', { name: 'JavaScript' }))
      await user.hover(screen.getByRole('option', { name: 'TypeScript' }))
      await user.click(screen.getByRole('option', { name: 'TypeScript' }))

      const python = screen.getByRole('option', { name: 'Python' })
      await user.hover(python)
      await user.click(python)

      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', python.id))

      await user.keyboard('{ArrowDown}')
      const ruby = screen.getByRole('option', { name: 'Ruby' })
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', ruby.id))
    })

    it('leaves the highlight on the item that Enter just deselected', async () => {
      const user = userEvent.setup()
      const languages = [
        { id: 'js', value: 'JavaScript' },
        { id: 'ts', value: 'TypeScript' },
        { id: 'py', value: 'Python' }
      ]
      render(R2MultipleItemsCombobox, { languages, value: [languages[0], languages[1]] })

      const input = screen.getByTestId('input')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      const typeScript = screen.getByRole('option', { name: 'TypeScript' })
      await user.hover(typeScript)
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', typeScript.id))

      await user.keyboard('{Enter}')

      await waitFor(() => expect(typeScript).toHaveAttribute('aria-selected', 'false'))
      expect(input).toHaveAttribute('aria-activedescendant', typeScript.id)
    })

    it('continues ArrowDown from the item Enter just selected', async () => {
      const user = userEvent.setup()
      const languages = [
        { id: 'js', value: 'JavaScript' },
        { id: 'ts', value: 'TypeScript' },
        { id: 'py', value: 'Python' }
      ]
      render(R2MultipleItemsCombobox, { languages })

      const input = screen.getByTestId('input')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      const typeScript = screen.getByRole('option', { name: 'TypeScript' })
      await user.hover(typeScript)
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', typeScript.id))

      await user.keyboard('{Enter}')
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', typeScript.id))

      await user.keyboard('{ArrowDown}')

      const python = screen.getByRole('option', { name: 'Python' })
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', python.id))
    })
  })

  describe('prop: grid', () => {
    it('arrow keys navigate across rows and columns in grid mode', async () => {
      const onItemHighlighted = vi.fn()
      const user = userEvent.setup()
      render(Grid, { open: true, onItemHighlighted })
      const input = screen.getByTestId('input')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('grid')).not.toBeNull())

      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('1'))
      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('2'))
      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('3'))
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('6'))
      await user.keyboard('{ArrowLeft}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('5'))
      await user.keyboard('{ArrowUp}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('2'))
    })

    it('moves the input caret on ArrowLeft when no item is highlighted', async () => {
      const onItemHighlighted = vi.fn()
      const user = userEvent.setup()
      render(Grid, { open: true, onItemHighlighted, rows: [['1', '2']] })
      const input = screen.getByTestId('input') as HTMLInputElement
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('grid')).not.toBeNull())

      await user.type(input, 'abc')
      expect(input.value).toBe('abc')
      expect(input.selectionStart).toBe(3)

      await user.keyboard('{ArrowLeft}')
      expect(input.selectionStart).toBe(2)
      expect(input.selectionEnd).toBe(2)
      expect(onItemHighlighted).not.toHaveBeenCalled()
    })

    it('moves the input caret on ArrowRight when no item is highlighted', async () => {
      const onItemHighlighted = vi.fn()
      const user = userEvent.setup()
      render(Grid, { open: true, onItemHighlighted, rows: [['1', '2']] })
      const input = screen.getByTestId('input') as HTMLInputElement
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('grid')).not.toBeNull())

      await user.type(input, 'abc')
      input.setSelectionRange(1, 1)
      expect(input.selectionStart).toBe(1)

      await user.keyboard('{ArrowRight}')
      expect(input.selectionStart).toBe(2)
      expect(input.selectionEnd).toBe(2)
      expect(onItemHighlighted).not.toHaveBeenCalled()
    })

    it('keeps grid navigation when autoHighlight surfaces an item before typing arrow keys', async () => {
      const onItemHighlighted = vi.fn()
      const user = userEvent.setup()
      render(Grid, { open: true, onItemHighlighted, autoHighlight: true, rows: [['1', '2']] })
      const input = screen.getByTestId('input') as HTMLInputElement
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('grid')).not.toBeNull())

      await user.type(input, 'a')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('1'))

      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('2'))
    })

    it('mirrors horizontal grid navigation in RTL mode', async () => {
      const onItemHighlighted = vi.fn()
      const user = userEvent.setup()
      render(Grid, {
        open: true,
        onItemHighlighted,
        direction: 'rtl',
        rows: [
          ['1', '2', '3'],
          ['4', '5', '6']
        ]
      })
      const input = screen.getByTestId('input')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('grid')).not.toBeNull())

      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('1'))
      await user.keyboard('{ArrowLeft}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('2'))
      await user.keyboard('{ArrowLeft}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('3'))
      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('2'))
    })

    it('supports uneven rows navigation', async () => {
      const onItemHighlighted = vi.fn()
      const user = userEvent.setup()
      render(Grid, {
        open: true,
        onItemHighlighted,
        rows: [
          ['1', '2', '3'],
          ['4', '5'],
          ['6', '7', '8', '9', '10']
        ]
      })
      const input = screen.getByTestId('input')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('grid')).not.toBeNull())

      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('1'))
      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('2'))
      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('3'))
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('5'))
      await user.keyboard('{ArrowUp}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('2'))
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('5'))
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('7'))
      await user.keyboard('{ArrowLeft}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('6'))
      await user.keyboard('{ArrowUp}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('4'))
    })

    it('sets grid roles when grid is enabled and rows are used', async () => {
      render(GridRowsCombobox, { open: true })
      await waitFor(() => expect(screen.getByRole('grid')).toBeInTheDocument())
      expect(screen.getAllByRole('gridcell')).toHaveLength(6)
      expect(screen.getAllByRole('row')).toHaveLength(2)
    })

    it('supports uneven rows navigation when each row sits in its own group', async () => {
      const onItemHighlighted = vi.fn()
      const user = userEvent.setup()
      render(Grid, {
        open: true,
        grouped: true,
        onItemHighlighted,
        rows: [
          ['1', '2', '3'],
          ['4', '5'],
          ['6', '7', '8', '9', '10']
        ]
      })

      const input = screen.getByTestId('input')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('grid')).not.toBeNull())

      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('1'))
      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('2'))
      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('3'))
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('5'))
      await user.keyboard('{ArrowUp}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('2'))
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('5'))
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[0]).toBe('7'))
    })
  })

  describe('prop: inline', () => {
    it('keeps input value on Enter when no item is highlighted', async () => {
      const user = userEvent.setup()
      render(InlineCombobox, {})
      const input = screen.getByTestId('input') as HTMLInputElement

      await user.click(input)
      await user.type(input, 'Ba')
      expect(input).not.toHaveAttribute('aria-activedescendant')
      expect(input.value).toBe('Ba')

      await user.keyboard('{Enter}')
      expect(input.value).toBe('Ba')
    })

    it('bubbles Escape key when rendered inline (no stopPropagation)', async () => {
      const user = userEvent.setup()
      const escaped = vi.fn()

      const { container } = render(InlineCombobox, { open: true })
      const outer = container.parentElement as HTMLElement
      outer.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Escape') escaped()
      })

      const input = screen.getByTestId('input')
      input.focus()
      await user.keyboard('{Escape}')

      expect(escaped).toHaveBeenCalledTimes(1)
    })

    it('keeps filtering after a selection when inline and open stays true', async () => {
      const user = userEvent.setup()
      render(R2InlineItemsCombobox, { open: true })
      const input = screen.getByTestId('input')

      await user.type(input, 'ap')

      await waitFor(() => expect(screen.queryByRole('option', { name: 'Banana' })).toBeNull())

      await user.click(screen.getByRole('option', { name: 'Apple' }))

      await user.clear(input)
      await user.type(input, 'ba')

      await waitFor(() => expect(screen.getByRole('option', { name: 'Banana' })).not.toBeNull())
    })

    it('clears a multiple inline query on close', async () => {
      const user = userEvent.setup()
      render(InlineMultipleCombobox, {})
      const input = screen.getByTestId('inline-input') as HTMLInputElement

      await user.type(input, 'a')
      await user.click(screen.getByText('Toggle'))

      expect(input.value).toBe('')
    })

    it('does not seed an initial highlight for an unmatched inline value', () => {
      render(InlineCombobox, { open: true, value: 'missing' })
      for (const option of screen.getAllByRole('option')) {
        expect(option).not.toHaveAttribute('data-highlighted')
      }
    })

    it('seeds the initial highlight for a matched inline value', () => {
      render(InlineCombobox, { open: true, value: 'apple' })
      expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('data-highlighted')
    })
  })

  describe('prop: filter', () => {
    it('shows all items when query is empty', () => {
      render(ItemsCombobox, { open: true })
      expect(screen.getByText('apple')).toBeInTheDocument()
      expect(screen.getByText('banana')).toBeInTheDocument()
      expect(screen.getByText('cherry')).toBeInTheDocument()
    })

    it('shows all items when query matches current selection (reopened after select)', async () => {
      const user = userEvent.setup()
      render(ItemsCombobox, { value: 'apple' })
      const input = screen.getByTestId('input') as HTMLInputElement

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: 'apple' }))
      await waitFor(() => expect(input.value).toBe('apple'))

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      expect(screen.getByText('apple')).toBeInTheDocument()
      expect(screen.getByText('banana')).toBeInTheDocument()
      expect(screen.getByText('cherry')).toBeInTheDocument()
    })

    it('resets input value to selected value when popup closes without selection', async () => {
      const user = userEvent.setup()
      const onInputValueChange = vi.fn()
      render(BasicCombobox, { value: 'apple', onInputValueChange })
      const input = screen.getByRole('combobox') as HTMLInputElement

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: 'Apple' }))
      await waitFor(() => expect(input.value).toBe('apple'))

      await user.click(input)
      await user.type(input, 'xyz')
      await waitFor(() => expect(input.value).toBe('applexyz'))

      await user.click(document.body)

      await waitFor(() => expect(input.value).toBe('apple'))
      expect(onInputValueChange.mock.lastCall?.[0]).toBe('apple')
    })

    it('does not open on programmatic (non-user) input events', async () => {
      render(BasicCombobox, {})
      const input = screen.getByRole('combobox')
      fireEvent.change(input, { target: { value: 'Apple' } })
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('opens on paste input events', async () => {
      render(BasicCombobox, {})
      const input = screen.getByRole('combobox')
      fireEvent.input(input, {
        target: { value: 'Apple' },
        inputType: 'insertFromPaste'
      })

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    it('uses a custom filter to narrow results', async () => {
      const user = userEvent.setup()
      const items = ['alpha', 'beta', 'alphabet', 'alpine']
      render(ItemsCombobox, {
        items,
        filter: (item: unknown, q: string) => String(item).toLowerCase().startsWith(q)
      })

      const input = screen.getByTestId('input')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.type(input, 'alp')

      await waitFor(() => {
        expect(screen.queryByText('beta')).not.toBeInTheDocument()
      })
      expect(screen.getByText('alpha')).toBeInTheDocument()
      expect(screen.getByText('alphabet')).toBeInTheDocument()
      expect(screen.getByText('alpine')).toBeInTheDocument()
    })

    it('shows the full list again after selecting through a custom stringifier', async () => {
      const user = userEvent.setup()
      render(StringifierFilterCombobox, {})

      const input = screen.getByRole('combobox')

      await user.click(input)
      await screen.findByRole('listbox')

      await user.type(input, 'tonari')

      await waitFor(() =>
        expect(screen.queryByRole('option', { name: 'Spirited Away' })).toBeNull()
      )

      await user.click(screen.getByRole('option', { name: 'My Neighbor Totoro' }))

      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.click(input)
      await screen.findByRole('listbox')

      await waitFor(() =>
        expect(screen.queryByRole('option', { name: 'Spirited Away' })).not.toBeNull()
      )
    })
  })

  describe('prop: filteredItems', () => {
    it('shows every item again when reopening after a selection narrowed the external list', async () => {
      const user = userEvent.setup()
      render(R2ExternalFilterCombobox, { mode: 'contains' })
      const input = screen.getByRole('combobox')

      await user.click(input)
      await user.type(input, 'one')

      await waitFor(() => expect(screen.queryByRole('option', { name: 'orange' })).toBeNull())

      await user.click(screen.getByRole('option', { name: 'apple' }))
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.click(input)

      await waitFor(() => expect(screen.queryByRole('option', { name: 'orange' })).not.toBeNull())
    })

    it('renders from filteredItems when no items prop is given', async () => {
      const user = userEvent.setup()
      render(ItemsCombobox, {
        items: undefined,
        filteredItems: ['Apple', 'Banana', 'Cherry']
      })
      const input = screen.getByTestId('input')

      await user.click(input)
      await screen.findByRole('listbox')
      await user.click(screen.getByRole('option', { name: 'Apple' }))

      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.click(input)
      await screen.findByRole('listbox')

      await waitFor(() => expect(screen.queryByRole('option', { name: 'Banana' })).not.toBeNull())
    })
  })

  describe('prop: limit', () => {
    it('limits the number of items displayed', async () => {
      render(ItemsCombobox, {
        open: true,
        items: ['a', 'b', 'c', 'd', 'e'],
        limit: 3
      })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })

    it('omits groups with no matching items', async () => {
      const user = userEvent.setup()
      render(R2GroupedItemsCombobox, {
        open: true,
        groups: [
          { value: 'fruit', items: ['apple'] },
          { value: 'vegetables', items: ['broccoli'] }
        ]
      })

      await user.type(screen.getByTestId('input'), 'app')

      await waitFor(() => expect(screen.queryByText('vegetables')).toBeNull())
      expect(screen.getByText('fruit')).not.toBeNull()
    })

    it('stops filtering grouped items once the limit is reached', async () => {
      const user = userEvent.setup()
      const filter = vi.fn((item: unknown, query: string) => String(item).startsWith(query))

      render(R2GroupedItemsCombobox, {
        open: true,
        limit: 2,
        filter,
        groups: [
          { value: 'groupA', items: ['banana', 'apple', 'apricot', 'avocado'] },
          { value: 'groupB', items: ['artichoke', 'banana', 'blueberry'] }
        ]
      })

      filter.mockClear()

      await user.type(screen.getByTestId('input'), 'a')

      const filtered = filter.mock.calls.map(([item]) => item)
      expect(filtered).not.toContain('avocado')
      expect(filtered).not.toContain('artichoke')
      expect(screen.getByRole('option', { name: 'apple' })).not.toBeNull()
      expect(screen.getByRole('option', { name: 'apricot' })).not.toBeNull()
      expect(screen.queryByRole('option', { name: 'avocado' })).toBeNull()
      expect(screen.queryByRole('option', { name: 'artichoke' })).toBeNull()
    })

    it('shows all items when limit is -1 (default)', async () => {
      render(ItemsCombobox, { open: true, items: ['a', 'b', 'c', 'd', 'e'], limit: -1 })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      expect(screen.getAllByRole('option')).toHaveLength(5)
    })

    it('handles a limit of 0 gracefully (no items)', async () => {
      render(ItemsCombobox, { open: true, items: ['a', 'b', 'c'], limit: 0 })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      expect(screen.queryAllByRole('option')).toHaveLength(0)
    })

    it('respects limit while filtering', async () => {
      const user = userEvent.setup()
      render(ItemsCombobox, {
        items: ['apple', 'apricot', 'avocado', 'banana'],
        limit: 2
      })
      const input = screen.getByTestId('input')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.type(input, 'a')
      await waitFor(() => {
        expect(screen.getAllByRole('option').length).toBe(2)
      })
    })

    it('limits the number of items displayed when groups are used', async () => {
      render(R2GroupedItemsCombobox, { open: true, limit: 4 })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      expect(screen.getAllByRole('option')).toHaveLength(4)
      expect(screen.getByRole('option', { name: 'strawberry' })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: 'blueberry' })).toBeNull()
      expect(screen.getByText('citrus')).toBeInTheDocument()
      expect(screen.getByText('berries')).toBeInTheDocument()
    })

    it('preserves order of items when applying limit across groups', async () => {
      render(R2GroupedItemsCombobox, {
        open: true,
        limit: 3,
        groups: [
          { value: 'groupA', items: ['A1', 'A2'] },
          { value: 'groupB', items: ['B1', 'B2', 'B3'] }
        ]
      })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      expect(screen.getByRole('option', { name: 'A1' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'A2' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'B1' })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: 'B2' })).toBeNull()
      expect(screen.queryByRole('option', { name: 'B3' })).toBeNull()
    })

    it('ignores the limit for a static list rendered without the items prop', async () => {
      render(R2GroupedItemsCombobox, {
        open: true,
        limit: 2,
        staticItems: ['apple', 'banana', 'cherry', 'date', 'elderberry']
      })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      expect(screen.getAllByRole('option')).toHaveLength(5)
    })

    it('re-renders more items when the limit is raised', async () => {
      const items = ['apple', 'banana', 'cherry', 'date']
      const { rerender } = render(ItemsCombobox, { open: true, items, limit: 2 })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      expect(screen.getAllByRole('option')).toHaveLength(2)

      await rerender({ open: true, items, limit: 3 })

      await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(3))
      expect(screen.queryByRole('option', { name: 'date' })).toBeNull()
    })
  })

  describe('prop: openOnInputClick', () => {
    it('does not open on input click when false, but opens on typing', async () => {
      const user = userEvent.setup()
      render(ItemsCombobox, { openOnInputClick: false })
      const input = screen.getByTestId('input')

      await user.click(input)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

      await user.type(input, 'a')
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    })

    it('keeps the popup open when the input is clicked a second time', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, {})
      const input = screen.getByTestId('input')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
    })
  })

  describe('prop: autoHighlight', () => {
    it('does not auto-highlight on initial open when no selection', async () => {
      render(AutoHighlightCombobox, { open: true })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      const input = screen.getByRole('combobox')
      expect(input).not.toHaveAttribute('aria-activedescendant')
    })

    it('shows the selected item as selected on initial open (no active highlight)', async () => {
      render(AutoHighlightCombobox, { open: true, value: 'banana' })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      const input = screen.getByRole('combobox')
      const banana = screen.getByRole('option', { name: 'banana' })
      expect(banana).toHaveAttribute('aria-selected', 'true')
      expect(input).not.toHaveAttribute('aria-activedescendant')
    })

    it('highlights the first matching item after typing (single mode)', async () => {
      const user = userEvent.setup()
      render(AutoHighlightCombobox, {})
      const input = screen.getByRole('combobox')
      await user.type(input, 'ch')

      const cherry = await screen.findByRole('option', { name: 'cherry' })
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', cherry.id))
    })

    it('highlights the first matching item after typing (multiple mode)', async () => {
      const user = userEvent.setup()
      render(AutoHighlightCombobox, { multiple: true })
      const input = screen.getByRole('combobox')

      await user.type(input, 'ba')
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument())

      await waitFor(() => {
        const activeId = input.getAttribute('aria-activedescendant')
        expect(activeId).not.toBeNull()
        expect(document.getElementById(activeId!)?.textContent).toBe('banana')
      })
    })

    it('highlights the first matching item after IME composition', async () => {
      render(AutoHighlightCombobox, { openOnInputClick: false })
      const input = screen.getByRole('combobox')

      fireEvent.compositionStart(input)
      fireEvent.input(input, { target: { value: 'ch' } })
      fireEvent.compositionEnd(input, { data: 'ch' })

      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      const cherry = await screen.findByRole('option', { name: 'cherry' })
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', cherry.id))
    })

    it('highlights the first matching item for a static list without the items prop', async () => {
      const user = userEvent.setup()
      render(AutoHighlightCombobox, { useItemsProp: false })
      const input = screen.getByRole('combobox')
      await user.type(input, 'al')

      const alpha = screen.getByRole('option', { name: 'alpha' })
      await waitFor(() => expect(alpha).toHaveAttribute('data-highlighted'))
      expect(input).toHaveAttribute('aria-activedescendant', alpha.id)

      await user.type(input, ' ')
      expect(alpha).toHaveAttribute('data-highlighted')
      expect(input).toHaveAttribute('aria-activedescendant', alpha.id)
    })

    it('retains highlight when the query is cleared back to empty', async () => {
      const user = userEvent.setup()
      render(AutoHighlightCombobox, {})
      const input = screen.getByRole('combobox')

      await user.type(input, 'a')
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument())
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'))

      await user.clear(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'))
    })

    it('retains highlight when clearing the query with input-change behavior', async () => {
      const user = userEvent.setup()
      render(AutoHighlightCombobox, {})
      const input = screen.getByRole('combobox')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      await user.type(input, 'ban')
      await screen.findByRole('option', { name: 'banana' })
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'))
      expect(input.getAttribute('aria-activedescendant')).not.toBeNull()

      await user.clear(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'))
    })

    it('keeps gridcell typeahead active across Space in row mode without selecting', async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(AutoHighlightGridCombobox, { onValueChange })
      const input = screen.getByRole('combobox')

      await user.type(input, 'new')

      const newYork = screen.getByRole('gridcell', { name: 'new york' })
      await waitFor(() => expect(newYork).toHaveAttribute('data-highlighted'))
      expect(input).toHaveAttribute('aria-activedescendant', newYork.id)

      await user.type(input, ' ')
      expect(newYork).toHaveAttribute('data-highlighted')
      expect(input).toHaveAttribute('aria-activedescendant', newYork.id)
      expect(input).toHaveValue('new ')
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('auto-highlights the first item of the reordered external list', async () => {
      const user = userEvent.setup()
      const onItemHighlighted = vi.fn()
      render(R2ExternalFilterCombobox, { mode: 'reverse', autoHighlight: true, onItemHighlighted })
      const input = screen.getByTestId('input')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      onItemHighlighted.mockClear()

      await user.type(input, 'a')

      await waitFor(() => expect(onItemHighlighted.mock.calls.length).toBeGreaterThan(0))
      expect(onItemHighlighted.mock.lastCall?.[0]).toBe('Zucchini')
    })

    it('highlights the sole remaining match after Backspace narrows the query', async () => {
      const user = userEvent.setup()
      render(AutoHighlightCombobox, { items: ['alpha', 'beta', 'gamma', 'delta', 'epsilon'] })
      const input = screen.getByRole('combobox')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
      await user.click(screen.getByRole('option', { name: 'epsilon' }))
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
      await user.keyboard('{Backspace}')
      const epsilon = await screen.findByRole('option', { name: 'epsilon' })
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', epsilon.id))
    })
  })

  describe('prop: highlightItemOnHover', () => {
    it('highlights item on pointer hover by default (highlightItemOnHover=true)', async () => {
      render(HighlightCombobox, { open: true })
      const input = screen.getByRole('combobox')
      const banana = screen.getByRole('option', { name: 'Banana' })
      fireEvent.mouseMove(banana)
      await waitFor(() => expect(banana).toHaveAttribute('data-highlighted'))
      expect(input).toHaveAttribute('aria-activedescendant', banana.id)
    })

    it('does not highlight item on pointer hover when highlightItemOnHover=false', async () => {
      render(HighlightCombobox, { open: true, highlightItemOnHover: false })
      const input = screen.getByRole('combobox')
      const banana = screen.getByRole('option', { name: 'Banana' })
      fireEvent.mouseMove(banana)
      await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'))
      expect(banana).not.toHaveAttribute('data-highlighted')
    })
  })

  describe('prop: onItemHighlighted', () => {
    it('reports the clearing highlight with reason "none" after keyboard navigation', async () => {
      const user = userEvent.setup()
      const onItemHighlighted = vi.fn()
      render(HighlightCombobox, { open: true, onItemHighlighted })

      const input = screen.getByRole('combobox')
      input.focus()
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(onItemHighlighted.mock.lastCall?.[1]).toBe('keyboard'))

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      expect(onItemHighlighted.mock.lastCall).toEqual([undefined, 'none', -1])
    })

    it('fires a single clearing highlight on Enter selection', async () => {
      const user = userEvent.setup()
      const onItemHighlighted = vi.fn()
      render(ItemsCombobox, {
        items: ['Apple', 'Apricot', 'Banana'],
        autoHighlight: true,
        onItemHighlighted
      })
      const input = screen.getByRole('combobox')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.type(input, 'app')

      onItemHighlighted.mockClear()
      await user.keyboard('{Enter}')

      await waitFor(() => {
        const clearing = onItemHighlighted.mock.calls.filter((call) => call[0] === undefined)
        expect(clearing.length).toBe(1)
      })
      const calls = onItemHighlighted.mock.calls
      const firstClearing = calls.findIndex((call) => call[0] === undefined)
      expect(calls.slice(firstClearing + 1).every((call) => call[0] === undefined)).toBe(true)
    })

    it('fires with item value when navigating by keyboard', async () => {
      const onItemHighlighted = vi.fn()
      render(HighlightCombobox, { open: true, onItemHighlighted })

      const input = screen.getByRole('combobox')
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })

      await waitFor(() => {
        expect(onItemHighlighted).toHaveBeenCalled()
        const [value, reason, index] =
          onItemHighlighted.mock.calls[onItemHighlighted.mock.calls.length - 1]
        expect(value).toBe('apple')
        expect(reason).toBe('keyboard')
        expect(index).toBe(0)
      })
    })

    it('reports the newly filtered first item through onItemHighlighted', async () => {
      const user = userEvent.setup()
      const onItemHighlighted = vi.fn()
      render(AutoHighlightCombobox, {
        open: true,
        items: ['banana', 'apple', 'apricot'],
        onItemHighlighted
      })

      const input = screen.getByRole('combobox')

      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
      await user.click(input)
      await user.keyboard('{ArrowDown}')

      await waitFor(() => expect(onItemHighlighted.mock.calls.length).toBeGreaterThan(0))
      expect(onItemHighlighted.mock.lastCall?.[0]).toBe('banana')

      onItemHighlighted.mockClear()

      await user.type(input, 'ap')

      await waitFor(() => expect(onItemHighlighted.mock.calls.length).toBeGreaterThan(0))
      expect(onItemHighlighted.mock.lastCall?.[0]).toBe('apple')
      expect(onItemHighlighted.mock.lastCall?.[1]).toBe('none')
      expect(onItemHighlighted.mock.lastCall?.[2]).toBe(0)
    })
  })

  describe('prop: loopFocus', () => {
    async function openAndHighlightFirst() {
      const input = screen.getByRole('combobox')
      fireEvent.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      await waitFor(() => {
        expect(screen.getAllByRole('option')[0]).toHaveAttribute('data-highlighted')
      })
      return input
    }

    it('loops focus from last through the input back to the first item with ArrowDown', async () => {
      render(BasicCombobox, {})
      const input = await openAndHighlightFirst()
      const options = screen.getAllByRole('option')

      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' })
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' })
      await waitFor(() => {
        expect(options[2]).toHaveAttribute('data-highlighted')
      })

      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      await waitFor(() => {
        expect(options[2]).not.toHaveAttribute('data-highlighted')
      })
      expect(input).not.toHaveAttribute('aria-activedescendant')

      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      await waitFor(() => {
        expect(options[0]).toHaveAttribute('data-highlighted')
      })
    })

    it('loops focus from first through the input back to the last item with ArrowUp', async () => {
      render(BasicCombobox, {})
      const input = await openAndHighlightFirst()
      const options = screen.getAllByRole('option')

      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' })
      await waitFor(() => {
        expect(options[0]).not.toHaveAttribute('data-highlighted')
      })
      expect(input).not.toHaveAttribute('aria-activedescendant')

      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' })
      await waitFor(() => {
        expect(options[2]).toHaveAttribute('data-highlighted')
      })
    })

    it('does not loop from last to first with ArrowDown when loopFocus={false}', async () => {
      render(BasicCombobox, { loopFocus: false })
      const input = await openAndHighlightFirst()
      const options = screen.getAllByRole('option')

      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      await waitFor(() => {
        expect(options[1]).toHaveAttribute('data-highlighted')
      })
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      await waitFor(() => {
        expect(options[2]).toHaveAttribute('data-highlighted')
      })
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      await waitFor(() => {
        expect(options[2]).toHaveAttribute('data-highlighted')
      })
    })

    it('does not loop from first to last with ArrowUp when loopFocus={false}', async () => {
      render(BasicCombobox, { loopFocus: false })
      const input = await openAndHighlightFirst()
      const options = screen.getAllByRole('option')

      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' })
      await waitFor(() => {
        expect(options[0]).toHaveAttribute('data-highlighted')
      })
    })
  })

  describe('prop: isItemEqualToValue', () => {
    it('matches object values using the provided comparator', () => {
      render(ComparatorCombobox, { value: { id: 2, name: 'Bob' } })
      expect(screen.getByTestId('value')).toHaveTextContent('Bob')
      expect(screen.getByRole('option', { name: 'Bob' })).toHaveAttribute('aria-selected', 'true')
    })

    it('properly deselects object values using the provided comparator (multiple)', async () => {
      render(ComparatorCombobox, { multiple: true, value: [{ id: 2, name: 'Bob' }] })
      const option = screen.getByRole('option', { name: 'Bob' })
      expect(option).toHaveAttribute('aria-selected', 'true')
      fireEvent.click(option)
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Bob' })).toHaveAttribute(
          'aria-selected',
          'false'
        )
      })
    })

    it('passes item as the first comparator argument in multiple mode', async () => {
      render(ComparatorCombobox, {
        multiple: true,
        value: [{ id: 2, name: 'Bob', source: 'selected' }],
        users: [
          { id: 1, name: 'Alice', source: 'item' },
          { id: 2, name: 'Bob', source: 'item' }
        ],
        isItemEqualToValue: (
          item: { id: number; source?: string },
          v: { id: number; source?: string }
        ) => item.id === v.id && item.source === 'item' && v.source === 'selected'
      })
      const option = screen.getByRole('option', { name: 'Bob' })
      expect(option).toHaveAttribute('aria-selected', 'true')
      fireEvent.click(option)
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Bob' })).toHaveAttribute(
          'aria-selected',
          'false'
        )
      })
    })

    it('does not call comparator with null when clearing the value', async () => {
      const compare = vi.fn((item: unknown, value: unknown) => {
        if (value == null) {
          throw new Error('Compared against null')
        }
        return (item as { id: number }).id === (value as { id: number }).id
      })

      render(ComboboxCompareClear, { isItemEqualToValue: compare })

      await fireEvent.click(screen.getByTestId('clear'))

      await waitFor(() => {
        const hidden = document.querySelector<HTMLInputElement>('input[type="hidden"][name="user"]')
        expect(hidden?.value ?? '').toBe('')
      })

      expect(compare.mock.calls.length).toBeGreaterThan(0)
      for (const call of compare.mock.calls) {
        expect(call[1]).not.toBe(null)
      }
    })

    it('never calls the comparator with a nullish argument when items arrive after opening', async () => {
      const user = userEvent.setup()
      const loadedItems = [
        { code: 'ca', label: 'Canada' },
        { code: 'us', label: 'United States' }
      ]
      const compare = vi.fn((item: { code: string }, value: { code: string }) => {
        if (item == null || value == null) {
          throw new Error('Compared against undefined')
        }
        return item.code === value.code
      })

      const { rerender } = render(R2AsyncCombobox, {
        countries: undefined,
        initialValue: loadedItems[0],
        isItemEqualToValue: compare
      })

      await user.click(screen.getByRole('combobox'))

      await rerender({
        countries: loadedItems,
        initialValue: loadedItems[0],
        isItemEqualToValue: compare
      })

      const canada = await screen.findByRole('option', { name: 'Canada' })
      fireEvent.mouseMove(canada, { pointerType: 'mouse' })
      await waitFor(() => expect(canada).toHaveAttribute('data-highlighted'))
      await user.keyboard('{ArrowDown}')

      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'United States' })).toHaveAttribute(
          'data-highlighted'
        )
      )

      expect(compare.mock.calls.length).toBeGreaterThan(0)
      for (const call of compare.mock.calls) {
        expect(call[0]).not.toBeNull()
        expect(call[0]).not.toBeUndefined()
        expect(call[1]).not.toBeNull()
        expect(call[1]).not.toBeUndefined()
      }
    })
  })

  describe('dialog pattern', () => {
    it('multiple: clears input after filtering and removes filter and highlight', async () => {
      const user = userEvent.setup()
      render(DialogCombobox, { multiple: true })
      const input = await screen.findByTestId('dialog-input')

      await user.type(input, 'ap')
      await waitFor(() => expect(screen.queryByRole('option', { name: 'Banana' })).toBeNull())
      expect(screen.getByRole('option', { name: 'Apple' })).not.toBeNull()
      expect(screen.getByRole('option', { name: 'Apricot' })).not.toBeNull()

      await user.click(screen.getByRole('option', { name: 'Apple' }))
      expect(input).toHaveValue('')
      await waitFor(() => expect(screen.queryByRole('option', { name: 'Banana' })).not.toBeNull())
      expect(input).toHaveAttribute('aria-activedescendant')
    })

    it('single: closes the dialog after selecting an item and updates the trigger value', async () => {
      const user = userEvent.setup()
      render(DialogCombobox, { initialOpen: false })
      const trigger = screen.getByTestId('dialog-trigger')
      await user.click(trigger)

      await screen.findByRole('dialog', { name: 'Fruit chooser' })
      const input = await screen.findByTestId('dialog-input')

      await user.type(input, 'ap')
      await user.click(screen.getByRole('option', { name: 'Apple' }))

      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: 'Fruit chooser' })).toBeNull()
      )
      await waitFor(() => expect(trigger).toHaveTextContent('Apple'))
    })

    it('single: clears the filter input when re-opening after a selection', async () => {
      const user = userEvent.setup()
      render(DialogCombobox, { initialOpen: false })
      const trigger = screen.getByTestId('dialog-trigger')
      await user.click(trigger)

      await screen.findByRole('dialog', { name: 'Fruit chooser' })
      let input = await screen.findByTestId('dialog-input')
      await user.type(input, 'ap')
      await user.click(screen.getByRole('option', { name: 'Apple' }))
      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: 'Fruit chooser' })).toBeNull()
      )

      await user.click(trigger)
      await screen.findByRole('dialog', { name: 'Fruit chooser' })
      input = await screen.findByTestId('dialog-input')
      expect(input).toHaveValue('')
      await screen.findByRole('option', { name: 'Banana' })
    })

    it('multiple: still filters after an item has been selected', async () => {
      const user = userEvent.setup()
      render(DialogCombobox, { multiple: true })
      const input = await screen.findByTestId('dialog-input')

      await user.type(input, 'ap')
      await waitFor(() => expect(screen.queryByRole('option', { name: 'Banana' })).toBeNull())

      await user.click(screen.getByRole('option', { name: 'Apple' }))

      expect(input).toHaveValue('')
      await waitFor(() => expect(screen.queryByRole('option', { name: 'Banana' })).not.toBeNull())

      await user.type(input, 'ap')

      await waitFor(() => expect(screen.queryByRole('option', { name: 'Banana' })).toBeNull())
    })

    it('multiple: keeps the highlight on the item Enter just selected', async () => {
      const user = userEvent.setup()
      render(DialogCombobox, { multiple: true })
      const input = await screen.findByTestId('dialog-input')

      input.focus()

      await user.keyboard('{ArrowDown}')
      await waitFor(() => {
        const apple = screen.getByRole('option', { name: 'Apple' })
        expect(input).toHaveAttribute('aria-activedescendant', apple.id)
      })

      await user.keyboard('{Enter}')

      await waitFor(() => {
        const apple = screen.getByRole('option', { name: 'Apple' })
        expect(input).toHaveAttribute('aria-activedescendant', apple.id)
      })
    })

    it('single: restores the highlight when the input regains focus', async () => {
      const user = userEvent.setup()
      render(DialogCombobox, {})
      const input = await screen.findByTestId('dialog-input')

      input.focus()

      await user.keyboard('{ArrowDown}')

      const apple = screen.getByRole('option', { name: 'Apple' })

      await waitFor(() => expect(apple).toHaveAttribute('data-highlighted'))
      expect(input).toHaveAttribute('aria-activedescendant', apple.id)

      const done = screen.getByRole('button', { name: 'Done' })
      fireEvent.blur(input, { relatedTarget: done })
      fireEvent.focus(done)

      await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'))
      expect(apple).not.toHaveAttribute('data-highlighted')

      fireEvent.blur(done, { relatedTarget: input })
      fireEvent.focus(input)

      await waitFor(() => expect(apple).toHaveAttribute('data-highlighted'))
      expect(input).toHaveAttribute('aria-activedescendant', apple.id)
    })

    it('keeps focus on the input when the pending dialog initial-focus frame runs', async () => {
      const frameCallbacks = new Map<number, FrameRequestCallback>()
      let frameId = 0
      const requestAnimationFrameSpy = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((callback) => {
          frameId += 1
          frameCallbacks.set(frameId, callback)
          return frameId
        })
      const cancelAnimationFrameSpy = vi
        .spyOn(window, 'cancelAnimationFrame')
        .mockImplementation((id) => {
          frameCallbacks.delete(id)
        })

      try {
        const user = userEvent.setup()
        render(AsyncDialogCombobox)

        const input = screen.getByLabelText('Fruit')
        await waitFor(() => expect(input).toBeEnabled())
        await user.click(input)

        expect(await screen.findByRole('listbox')).toBeVisible()

        const callbacks = Array.from(frameCallbacks.values())
        frameCallbacks.clear()
        for (const callback of callbacks) callback(performance.now())

        await waitFor(() => expect(input).toHaveFocus())
        expect(screen.getByRole('listbox')).toBeVisible()
      } finally {
        requestAnimationFrameSpy.mockRestore()
        cancelAnimationFrameSpy.mockRestore()
      }
    })
  })

  describe('input inside the popup', () => {
    it('returns focus to the trigger rather than the input when the popup closes', async () => {
      const user = userEvent.setup()
      render(InputInsidePopupCombobox, { items: ['One', 'Two', 'Three'] })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)

      expect(await screen.findByRole('listbox')).not.toBeNull()

      const input = screen.getByTestId('input')
      await waitFor(() => expect(input).toHaveFocus())

      await user.click(trigger)
      await waitFor(() => expect(trigger).toHaveFocus())
    })

    it('keeps the popup open and clears the input after a selection', async () => {
      const user = userEvent.setup()
      render(InputInsidePopupCombobox, { multiple: true })

      await user.click(screen.getByTestId('trigger'))
      const input = await screen.findByTestId('input')
      await screen.findByRole('option', { name: 'apple' })

      await user.type(input, 'app')
      await user.click(screen.getByRole('option', { name: 'apple' }))

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeNull())
      expect(input).toHaveValue('')
    })

    it('keeps listing the async-loaded items after a selection when the input is inside the popup', async () => {
      const user = userEvent.setup()
      const loadedItems = [
        { code: 'ca', label: 'Canada' },
        { code: 'us', label: 'United States' }
      ]

      const { rerender } = render(R2AsyncCombobox, { countries: undefined, inputInsidePopup: true })

      const trigger = screen.getByTestId('trigger')

      await user.click(trigger)
      await rerender({ countries: loadedItems, inputInsidePopup: true })

      const canada = await screen.findByRole('option', { name: 'Canada' })
      fireEvent.mouseMove(canada, { pointerType: 'mouse' })
      await waitFor(() => expect(canada).toHaveAttribute('data-highlighted'))

      await user.click(canada)
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.click(trigger)

      await waitFor(() => expect(screen.getByRole('option', { name: 'Canada' })).not.toBeNull())
      expect(screen.getByRole('option', { name: 'United States' })).not.toBeNull()
    })
  })

  describe('Form', () => {
    const countries = [
      { code: 'US', label: 'United States' },
      { code: 'CA', label: 'Canada' }
    ]

    it('submits stringified value to onFormSubmit when itemToStringValue is provided', async () => {
      const handleFormSubmit = vi.fn()
      const user = userEvent.setup()
      render(FormCombobox, {
        onFormSubmit: handleFormSubmit,
        name: 'country',
        value: countries[0],
        items: countries,
        itemToStringLabel: (item: unknown) => (item as { label: string }).label,
        itemToStringValue: (item: unknown) => (item as { code: string }).code
      })
      await user.click(screen.getByText('Submit'))
      expect(handleFormSubmit.mock.calls.length).toBe(1)
      expect(handleFormSubmit.mock.calls[0][0]).toEqual({ country: 'US' })
    })

    it('serializes the value with itemToStringValue into the hidden input', () => {
      render(FormCombobox, {
        name: 'country',
        value: countries[1],
        items: countries,
        itemToStringLabel: (item: unknown) => (item as { label: string }).label,
        itemToStringValue: (item: unknown) => (item as { code: string }).code
      })
      const hiddenInput = document.querySelector('input[name="country"]') as HTMLInputElement | null
      expect(hiddenInput).not.toBeNull()
      expect(hiddenInput!.value).toBe('CA')
    })

    it('serializes {value,label} objects using their value field into a hidden input', () => {
      const items = [
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' }
      ]
      render(ItemsCombobox, { name: 'country', value: items[1], items })
      const hiddenInput = document.querySelector('input[name="country"]') as HTMLInputElement | null
      expect(hiddenInput).not.toBeNull()
      expect(hiddenInput!.value).toBe('CA')
    })

    it('triggers native HTML validation on submit', async () => {
      const user = userEvent.setup()
      render(FormCombobox, { name: 'test', required: true, withError: true })
      expect(screen.queryByTestId('error')).toBeNull()
      await user.click(screen.getByText('Submit'))
      expect(screen.getByTestId('error')).toHaveTextContent('required')
    })

    it('clears external errors on change', async () => {
      const user = userEvent.setup()
      render(FormCombobox, { name: 'combobox', errors: { combobox: 'test' } })
      expect(screen.getByTestId('error')).toHaveTextContent('test')
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-invalid', 'true')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
      await user.click(screen.getByRole('option', { name: 'b' }))

      expect(screen.queryByTestId('error')).toBeNull()
      expect(input).not.toHaveAttribute('aria-invalid')
    })

    it('submits on Enter when no item is highlighted (does not prevent)', async () => {
      const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
      const user = userEvent.setup()
      render(FormCombobox, {
        name: 'q',
        items: ['apple', 'banana'],
        openOnInputClick: true,
        onsubmit
      })
      const input = screen.getByRole('combobox')
      await user.click(input)
      await user.keyboard('{Enter}')
      expect(onsubmit).toHaveBeenCalledTimes(1)
    })

    it('prevents submit on Enter when an item is highlighted', async () => {
      const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
      const user = userEvent.setup()
      render(FormCombobox, {
        name: 'q',
        items: ['alpha', 'beta'],
        openOnInputClick: true,
        onsubmit
      })
      const input = screen.getByRole('combobox')
      await user.click(input)
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')
      expect(onsubmit).not.toHaveBeenCalled()
    })

    it('creates multiple hidden inputs for form submission', () => {
      const { container } = render(MultipleCombobox, { value: ['apple', 'banana'], name: 'fruits' })
      const inputs = container.querySelectorAll('input[type="hidden"][name="fruits"]')
      expect(inputs.length).toBe(2)
      const values = Array.from(inputs).map((i) => (i as HTMLInputElement).value)
      expect(values).toContain('apple')
      expect(values).toContain('banana')
    })

    it('submits no values when the root is disabled', () => {
      render(DisabledMultipleForm, { value: ['a'], disabled: true, name: 'x' })

      const form = screen.getByTestId('form') as HTMLFormElement

      expect(new FormData(form).getAll('x')).toEqual([])
    })

    it.skipIf(isJSDOM)('submits to the external form named by the form prop', async () => {
      const onsubmit = vi.fn((event: SubmitEvent) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget as HTMLFormElement)
        return data.get('country')
      })

      const items = [
        { code: 'US', label: 'United States' },
        { code: 'CA', label: 'Canada' }
      ]
      render(R2ExternalFormCombobox, { items, value: items[0], onsubmit })

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

      expect(onsubmit).toHaveBeenCalledTimes(1)
      expect(onsubmit.mock.results.at(-1)?.value).toBe('US')
    })

    it.skipIf(isJSDOM)('submits every selected value to the external form', async () => {
      const onsubmit = vi.fn((event: SubmitEvent) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget as HTMLFormElement)
        return data.getAll('countries')
      })

      const items = [
        { code: 'US', label: 'United States' },
        { code: 'CA', label: 'Canada' },
        { code: 'AU', label: 'Australia' }
      ]
      render(R2ExternalFormCombobox, {
        multiple: true,
        name: 'countries',
        items,
        value: [items[0], items[2]],
        onsubmit
      })

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

      expect(onsubmit).toHaveBeenCalledTimes(1)
      expect(onsubmit.mock.results.at(-1)?.value).toEqual(['US', 'AU'])
    })

    it('serializes every selected {value,label} object into its own hidden input', () => {
      const items = [
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' },
        { value: 'AU', label: 'Australia' }
      ]
      const selected = [items[0], items[2]]
      const { container } = render(ItemsCombobox, {
        name: 'countries',
        multiple: true,
        items,
        value: selected,
        label: (item: unknown) => (item as { label: string }).label
      })

      const hiddenInputs = container.querySelectorAll('input[name="countries"]')
      expect(hiddenInputs).toHaveLength(selected.length)
      selected.forEach((item, index) => {
        expect(hiddenInputs[index]).toHaveValue(item.value)
      })
    })
  })

  describe('Field', () => {
    it('receives disabled prop from Field.Root (input and trigger)', () => {
      render(FieldCombobox, { disabled: true })
      expect(screen.getByTestId('input')).toHaveAttribute('disabled')
      expect(screen.getByTestId('trigger')).toHaveAttribute('disabled')
    })

    it('receives name prop from Field.Root', () => {
      render(FieldCombobox, { name: 'field-combobox' })
      const hiddenInput = document.querySelector('input[name="field-combobox"]')
      expect(hiddenInput).not.toBeNull()
    })

    it('[data-invalid]', () => {
      render(FieldCombobox, { invalid: true })
      expect(screen.getByTestId('input')).toHaveAttribute('data-invalid', '')
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-invalid', '')
    })

    it('[data-touched]', async () => {
      render(FieldCombobox, {})
      const input = screen.getByTestId('input')
      const trigger = screen.getByTestId('trigger')
      expect(input).not.toHaveAttribute('data-touched')

      fireEvent.focus(input)
      fireEvent.blur(input)
      await waitFor(() => expect(input).toHaveAttribute('data-touched', ''))
      expect(trigger).toHaveAttribute('data-touched', '')
    })

    it('[data-focused]', async () => {
      render(FieldCombobox, {})
      const input = screen.getByTestId('input')
      const trigger = screen.getByTestId('trigger')
      expect(input).not.toHaveAttribute('data-focused')

      await fireEvent.focus(input)
      expect(input).toHaveAttribute('data-focused', '')
      expect(trigger).toHaveAttribute('data-focused', '')

      await fireEvent.blur(input)
      expect(input).not.toHaveAttribute('data-focused')
      expect(trigger).not.toHaveAttribute('data-focused')
    })

    it('[data-dirty] after selecting an option', async () => {
      const user = userEvent.setup()
      render(FieldCombobox, {})
      const input = screen.getByTestId('input')
      const trigger = screen.getByTestId('trigger')
      expect(input).not.toHaveAttribute('data-dirty')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      await user.click(screen.getByRole('option', { name: 'a' }))

      await waitFor(() => expect(input).toHaveAttribute('data-dirty', ''))
      expect(trigger).toHaveAttribute('data-dirty', '')
    })

    it('[data-filled] when already filled', () => {
      render(FieldCombobox, { value: 'a' })
      expect(screen.getByTestId('input')).toHaveAttribute('data-filled')
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-filled')
    })

    it('prop: validate runs on blur', async () => {
      render(FieldCombobox, { validationMode: 'onBlur', validate: () => 'error' })
      const input = screen.getByTestId('input')
      expect(input).not.toHaveAttribute('aria-invalid')
      fireEvent.focus(input)
      fireEvent.blur(input)
      await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
    })

    it('does not apply validation ARIA/state attributes to input inside popup', async () => {
      const user = userEvent.setup()
      render(FieldCombobox, { invalid: true, inputInsidePopup: true, withError: true })
      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('aria-invalid', 'true')

      await user.click(trigger)
      const input = await screen.findByTestId('input')
      expect(input).not.toHaveAttribute('aria-invalid')
      expect(input).not.toHaveAttribute('data-invalid')
      expect(input).not.toHaveAttribute('data-touched')
      expect(input).not.toHaveAttribute('data-focused')
    })

    it('Combobox.Label links to Combobox.Trigger when input is inside popup and trigger has an explicit id', async () => {
      render(FieldCombobox, {
        useComboboxLabel: true,
        inputInsidePopup: true,
        triggerId: 'x-id'
      })
      const label = screen.getByTestId('label')
      const trigger = screen.getByTestId('trigger')
      await waitFor(() => expect(trigger).toHaveAttribute('id', 'x-id'))
      expect(trigger).toHaveAttribute('aria-labelledby', label.id)
    })

    it('moves focus to the trigger and surfaces the error when the input lives in the popup', async () => {
      const user = userEvent.setup()
      const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
      render(R2FormTriggerCombobox, { onsubmit })

      expect(screen.queryByTestId('error')).toBeNull()

      await user.click(screen.getByText('Submit'))

      expect(onsubmit).not.toHaveBeenCalled()

      const trigger = screen.getByTestId('trigger')

      await waitFor(() => expect(trigger).toHaveFocus())
      expect(trigger).toHaveAttribute('data-invalid', '')
      expect(screen.getByTestId('error')).toHaveTextContent('required')

      await user.click(trigger)

      const input = await screen.findByTestId('input')
      expect(input).not.toHaveAttribute('data-invalid')
    })

    it('Field.Label links to Combobox.Trigger when the input is inside the popup', async () => {
      render(FieldCombobox, { withLabel: true, inputInsidePopup: true, triggerId: 'x-id' })

      const label = screen.getByTestId('label')
      const trigger = screen.getByTestId('trigger')

      await waitFor(() => expect(trigger).toHaveAttribute('id', 'x-id'))
      expect(trigger).toHaveAttribute('aria-labelledby', label.id)
    })

    it('Combobox.Label focuses the trigger without opening the popup', async () => {
      const user = userEvent.setup()
      render(FieldCombobox, { useComboboxLabel: true, inputInsidePopup: true })

      await user.click(screen.getByTestId('label'))

      expect(screen.getByTestId('trigger')).toHaveFocus()
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('drops [data-dirty] in multiple mode once the initial value is restored', async () => {
      const user = userEvent.setup()
      render(FieldCombobox, { multiple: true, open: true, value: ['a'] })

      const input = screen.getByTestId('input')
      const trigger = screen.getByTestId('trigger')
      const optionB = screen.getByRole('option', { name: 'b' })

      expect(input).not.toHaveAttribute('data-dirty')
      expect(trigger).not.toHaveAttribute('data-dirty')

      await user.click(optionB)

      await waitFor(() => expect(input).toHaveAttribute('data-dirty', ''))
      expect(trigger).toHaveAttribute('data-dirty', '')

      await user.click(optionB)

      await waitFor(() => expect(input).not.toHaveAttribute('data-dirty'))
      expect(trigger).not.toHaveAttribute('data-dirty')
    })

    it('drops [data-dirty] when an equal object value is reselected by a different reference', async () => {
      const user = userEvent.setup()
      const options = [
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' }
      ]
      render(R2FieldItemsCombobox, {
        multiple: true,
        open: true,
        options,
        value: [{ id: 'a', label: 'a' }]
      })

      const trigger = screen.getByTestId('trigger')

      expect(trigger).not.toHaveAttribute('data-dirty')

      await user.click(screen.getByRole('option', { name: 'a' }))

      await waitFor(() => expect(trigger).toHaveAttribute('data-dirty', ''))

      await user.click(screen.getByRole('option', { name: 'a' }))

      await waitFor(() => expect(trigger).not.toHaveAttribute('data-dirty'))
    })

    it('keeps [data-dirty] when the same values come back in a different order', async () => {
      const user = userEvent.setup()
      render(FieldCombobox, { multiple: true, open: true, value: ['a', 'b'] })

      const trigger = screen.getByTestId('trigger')

      expect(trigger).not.toHaveAttribute('data-dirty')

      await user.click(screen.getByRole('option', { name: 'a' }))
      await waitFor(() => expect(trigger).toHaveAttribute('data-dirty', ''))

      await user.click(screen.getByRole('option', { name: 'a' }))
      expect(trigger).toHaveAttribute('data-dirty', '')
    })

    it('[data-filled] after selecting an option', async () => {
      const user = userEvent.setup()
      render(FieldCombobox, {})

      const input = screen.getByTestId('input')
      const trigger = screen.getByTestId('trigger')

      expect(input).not.toHaveAttribute('data-filled')
      expect(trigger).not.toHaveAttribute('data-filled')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
      await user.keyboard('{ArrowDown}')
      await user.click(screen.getByRole('option', { name: 'a' }))

      await waitFor(() => expect(input).toHaveAttribute('data-filled', ''))
      expect(trigger).toHaveAttribute('data-filled', '')

      await user.click(input)

      const listbox = await screen.findByRole('listbox')
      expect(listbox).not.toHaveAttribute('data-filled')
    })

    it('does not mark the field touched when focus moves into the popup', async () => {
      const validate = vi.fn(() => 'error')
      render(R2FieldPopupCombobox, { validate })

      const trigger = screen.getByTestId('trigger')

      fireEvent.focus(trigger)
      fireEvent.click(trigger)

      const popup = await screen.findByRole('dialog')

      fireEvent.blur(trigger, { relatedTarget: popup })
      fireEvent.focus(popup)

      await waitFor(() => expect(trigger).toHaveAttribute('data-focused', ''))
      expect(validate).not.toHaveBeenCalled()
      expect(trigger).not.toHaveAttribute('data-touched')
      expect(trigger).not.toHaveAttribute('aria-invalid')
    })

    it('validates once focus leaves the popup for an outside element', async () => {
      const validate = vi.fn(() => 'error')
      render(R2FieldPopupCombobox, { validate })

      const trigger = screen.getByTestId('trigger')
      const outside = screen.getByTestId('outside')

      fireEvent.focus(trigger)
      fireEvent.click(trigger)

      const popup = await screen.findByRole('dialog')

      fireEvent.focusOut(trigger, { relatedTarget: popup })
      fireEvent.focus(popup)

      fireEvent.focusOut(popup, { relatedTarget: outside })
      fireEvent.focus(outside)

      await waitFor(() => expect(validate).toHaveBeenCalledTimes(1))

      expect(trigger).toHaveAttribute('data-touched', '')
      expect(trigger).not.toHaveAttribute('data-focused')
      expect(trigger).toHaveAttribute('aria-invalid', 'true')
    })

    it('[data-valid] after a required value is selected and committed on blur', async () => {
      const user = userEvent.setup()
      render(FieldCombobox, { validationMode: 'onBlur', required: true })

      const input = screen.getByTestId('input')
      const trigger = screen.getByTestId('trigger')

      expect(input).not.toHaveAttribute('data-valid')
      expect(input).not.toHaveAttribute('data-invalid')
      expect(trigger).not.toHaveAttribute('data-valid')
      expect(trigger).not.toHaveAttribute('data-invalid')

      fireEvent.focus(input)
      await user.click(input)
      await user.click(await screen.findByRole('option', { name: 'a' }))
      fireEvent.blur(input)

      await waitFor(() => expect(input).toHaveAttribute('data-valid', ''))
      expect(trigger).toHaveAttribute('data-valid', '')
      expect(input).not.toHaveAttribute('data-invalid')
      expect(trigger).not.toHaveAttribute('data-invalid')
    })

    it('passes the raw item to validate even when itemToStringValue is set', async () => {
      const options = [
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' }
      ]
      const validate = vi.fn((value: unknown) => {
        expect(value).toBe(options[0])
        return 'error'
      })
      render(R2FieldItemsCombobox, {
        validationMode: 'onBlur',
        validate,
        withInput: true,
        options,
        value: options[0]
      })

      const input = screen.getByTestId('input')

      fireEvent.focus(input)
      fireEvent.blur(input)

      await waitFor(() => expect(validate).toHaveBeenCalledTimes(1))
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('validationMode=onSubmit revalidates on submit, on selection and on blur after clearing', async () => {
      const user = userEvent.setup()
      render(R2ValidationFormCombobox, {})

      const input = screen.getByTestId('input')
      expect(input).not.toHaveAttribute('aria-invalid')

      await user.click(screen.getByText('submit'))
      expect(input).toHaveAttribute('aria-invalid', 'true')

      await user.click(input)

      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      expect(input).not.toHaveAttribute('aria-invalid')

      await user.click(screen.getByTestId('clear'))

      expect(document.activeElement).toBe(input)
      await user.keyboard('{Tab}')

      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it.skipIf(!isJSDOM)(
      'validationMode=onChange marks the field invalid as soon as the value changes',
      async () => {
        const user = userEvent.setup()
        render(FieldCombobox, {
          validationMode: 'onChange',
          validate: (value: unknown) => (value === 'a' ? 'error' : null)
        })

        const input = screen.getByTestId('input')

        expect(input).not.toHaveAttribute('aria-invalid')

        await user.click(input)
        await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

        await user.keyboard('{ArrowDown}')
        await user.keyboard('{ArrowDown}')
        await user.keyboard('{Enter}')

        await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
      }
    )

    it.skipIf(!isJSDOM)('validationMode=onBlur defers the invalid state until blur', async () => {
      const user = userEvent.setup()
      render(FieldCombobox, {
        validationMode: 'onBlur',
        withError: true,
        validate: (value: unknown) => (value === 'a' ? 'error' : null)
      })

      const input = screen.getByTestId('input')

      expect(input).not.toHaveAttribute('aria-invalid')

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      fireEvent.blur(input)

      await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
    })

    it('Field.Label labels the input through aria-labelledby', () => {
      render(R2FieldItemsCombobox, { withSpanLabel: true, withInput: true })

      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-labelledby',
        screen.getByTestId('label').id
      )
    })

    it('Combobox.Label does not label Combobox.Input when the input is the form control', () => {
      render(FieldCombobox, { useComboboxLabel: true })

      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-labelledby')
    })

    it('does not set a fallback aria-labelledby when no label is rendered', async () => {
      render(BasicCombobox, {})

      await waitFor(() =>
        expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-labelledby')
      )
    })

    it('keeps the Combobox.Label linkage after the root id changes', async () => {
      const { rerender } = render(R2LabelIdCombobox, { id: 'first' })

      await rerender({ id: 'second' })

      const label = screen.getByTestId('label')
      const trigger = screen.getByTestId('trigger')
      await waitFor(() => expect(trigger).toHaveAttribute('id', 'second'))
      expect(trigger).toHaveAttribute('aria-labelledby', label.id)
    })

    it('Field.Description is referenced by the input aria-describedby', () => {
      render(FieldCombobox, { withError: true })

      const describedBy = screen.getByTestId('input').getAttribute('aria-describedby')
      expect(describedBy).toContain(screen.getByTestId('description').id)
    })
  })

  describe('browser autofill', () => {
    it('does not auto-close during browser autofill', async () => {
      const { container } = render(ItemsCombobox, { name: 'test', open: true })

      expect(screen.getByRole('listbox')).not.toBe(null)

      await fireEvent.change(hiddenInput(container), { target: { value: 'apple' } })

      expect(screen.getByRole('listbox')).not.toBe(null)
    })

    it('handles browser autofill', async () => {
      const user = userEvent.setup()
      const onInputValueChange = vi.fn()
      const { container } = render(AutofillCombobox, { onInputValueChange })

      await fireEvent.change(hiddenInput(container), { target: { value: 'b' } })

      await waitFor(() => expect(onInputValueChange).toHaveBeenLastCalledWith('b'))

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'b' })).toHaveAttribute('aria-selected', 'true')
      })
    })

    it.each([
      { lockState: 'readOnly', label: 'inside Field', withField: true },
      { lockState: 'disabled', label: 'inside Field', withField: true },
      { lockState: 'readOnly', label: 'outside Field', withField: false },
      { lockState: 'disabled', label: 'outside Field', withField: false }
    ] as const)(
      'ignores hidden-input autofill when $lockState $label',
      async ({ lockState, withField }) => {
        const onValueChange = vi.fn()
        const onInputValueChange = vi.fn()
        const { container } = render(LockedAutofillCombobox, {
          withField,
          readOnly: lockState === 'readOnly',
          disabled: lockState === 'disabled',
          onValueChange,
          onInputValueChange
        })

        const visibleInput = screen.getByTestId<HTMLInputElement>('input')
        const hidden = hiddenInput(container)
        expect(hidden).toHaveAttribute('name', 'test')

        if (withField) {
          expect(screen.getByTestId('error')).toHaveTextContent('test')
        }

        await fireEvent.change(hidden, { target: { value: 'b' } })

        expect(onValueChange).not.toHaveBeenCalled()
        expect(onInputValueChange).not.toHaveBeenCalled()
        expect(visibleInput.value).toBe('')
        expect(hidden.value).toBe('')

        if (withField) {
          expect(screen.getByTestId('error')).toHaveTextContent('test')
        }
      }
    )

    it('shows all items when opening after browser autofill', async () => {
      const user = userEvent.setup()
      const { container } = render(ItemsCombobox, { name: 'test', items: ['a', 'b', 'c'] })

      await fireEvent.change(hiddenInput(container), { target: { value: 'b' } })

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => expect(screen.getByRole('listbox')).not.toBe(null))
      expect(screen.getByRole('option', { name: 'a' })).not.toBe(null)
      expect(screen.getByRole('option', { name: 'b' })).not.toBe(null)
      expect(screen.getByRole('option', { name: 'c' })).not.toBe(null)
    })

    it('shows all items when opening after browser autofill with insertReplacementText', async () => {
      const user = userEvent.setup()
      const { container } = render(ItemsCombobox, { name: 'test', items: ['a', 'b', 'c'] })

      await fireEvent.input(hiddenInput(container), {
        target: { value: 'b' },
        inputType: 'insertReplacementText'
      })

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => expect(screen.getByRole('listbox')).not.toBe(null))
      expect(screen.getByRole('option', { name: 'a' })).not.toBe(null)
      expect(screen.getByRole('option', { name: 'b' })).not.toBe(null)
      expect(screen.getByRole('option', { name: 'c' })).not.toBe(null)
    })

    it('handles browser autofill with object values', async () => {
      const { container } = render(AutofillObjectCombobox)

      await fireEvent.change(hiddenInput(container), { target: { value: 'CA' } })

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toHaveAttribute(
          'aria-selected',
          'true'
        )
      })
    })

    it('handles browser autofill with object values when autofill uses the label', async () => {
      const onValueChange = vi.fn()
      const { container } = render(AutofillObjectCombobox, { onValueChange })

      await fireEvent.change(hiddenInput(container), { target: { value: 'Canada' } })

      await waitFor(() =>
        expect(onValueChange).toHaveBeenCalledWith({ country: 'Canada', code: 'CA' })
      )

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toHaveAttribute(
          'aria-selected',
          'true'
        )
      })
    })

    it('matches browser autofill against an item rendered label for primitive values regardless of case', async () => {
      const user = userEvent.setup()
      const { container } = render(AutofillCombobox, {
        name: 'country',
        options: [
          { value: 'US', label: 'United States' },
          { value: 'CA', label: 'Canada' }
        ]
      })

      await fireEvent.change(hiddenInput(container), { target: { value: 'canada' } })

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toHaveAttribute(
          'aria-selected',
          'true'
        )
      })
    })

    it('matches browser autofill by serialized value before an earlier rendered label', async () => {
      const user = userEvent.setup()
      const { container } = render(AutofillCombobox, {
        name: 'country',
        options: [
          { value: 'CA', label: 'US' },
          { value: 'US', label: 'United States' }
        ]
      })

      await fireEvent.change(hiddenInput(container), { target: { value: 'US' } })

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'United States' })).toHaveAttribute(
          'aria-selected',
          'true'
        )
      })
      expect(screen.getByRole('option', { name: 'US' })).toHaveAttribute('aria-selected', 'false')
    })

    it('matches browser autofill when an earlier item has no rendered label', async () => {
      const user = userEvent.setup()
      const { container } = render(AutofillCombobox, {
        name: 'country',
        options: [
          { value: 'US', label: null },
          { value: 'CA', label: 'Canada' }
        ]
      })

      await fireEvent.change(hiddenInput(container), { target: { value: 'Canada' } })

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toHaveAttribute(
          'aria-selected',
          'true'
        )
      })
    })

    it('matches browser autofill against an item rendered label when using the items prop', async () => {
      const user = userEvent.setup()
      const countryNames: Record<string, string> = { US: 'United States', CA: 'Canada' }
      const { container } = render(ItemsCombobox, {
        name: 'country',
        items: ['US', 'CA'],
        label: (code: unknown) => countryNames[code as string]
      })

      await fireEvent.change(hiddenInput(container), { target: { value: 'Canada' } })

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toHaveAttribute(
          'aria-selected',
          'true'
        )
      })
    })

    it('marks the field dirty and validates after successful autofill', async () => {
      const validate = vi.fn((value: unknown) => (value === 'b' ? null : 'error'))
      const { container } = render(FieldCombobox, {
        name: 'country',
        validationMode: 'onChange',
        validate
      })

      const input = screen.getByTestId('input')

      expect(input).not.toHaveAttribute('data-dirty')

      await fireEvent.change(hiddenInput(container), { target: { value: 'b' } })

      await waitFor(() => expect(validate).toHaveBeenCalled())
      expect(validate.mock.lastCall?.[0]).toBe('b')
      expect(input).toHaveAttribute('data-dirty', '')
    })

    it('does not force-mount the list when autofill matches a serialized value with the items prop', async () => {
      const user = userEvent.setup()
      render(ItemsCombobox, { name: 'country', items: ['US', 'CA'] })

      const input = screen.getByRole('combobox')
      const hidden = document.querySelector('input[name="country"]') as HTMLInputElement
      fireEvent.change(hidden, { target: { value: 'CA' } })

      await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())

      await user.click(input)

      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'CA' })).toHaveAttribute('aria-selected', 'true')
      )
    })

    it('ignores scalar browser autofill in multiple mode', async () => {
      const onValueChange = vi.fn()
      const { container } = render(ItemsCombobox, { multiple: true, onValueChange })

      await fireEvent.change(hiddenInput(container), { target: { value: 'apple' } })
      await Promise.resolve()

      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('ignores unmatched browser autofill in single mode', async () => {
      const onValueChange = vi.fn()
      const { container } = render(ItemsCombobox, {
        name: 'fruit',
        items: ['apple'],
        onValueChange
      })

      const hidden = hiddenInput(container)
      await fireEvent.change(hidden, { target: { value: 'orange' } })
      await Promise.resolve()

      expect(onValueChange).not.toHaveBeenCalled()
      expect(hidden.value).toBe('')
    })
  })

  describe('hidden control focus', () => {
    it('moves focus from the hidden control to an external input', async () => {
      const { container } = render(HiddenControlFocus, { variant: 'input' })

      await fireEvent.focus(hiddenInput(container))

      expect(screen.getByTestId('visible-input')).toHaveFocus()
    })

    it('falls back to the trigger when the hidden control is focused', async () => {
      const { container } = render(HiddenControlFocus, { variant: 'trigger' })

      await fireEvent.focus(hiddenInput(container))

      expect(screen.getByTestId('trigger')).toHaveFocus()
    })

    it('falls back to the trigger after an external input unmounts', async () => {
      const { container, rerender } = render(HiddenControlFocus, { variant: 'input' })

      await rerender({ variant: 'trigger' })

      await fireEvent.focus(hiddenInput(container))

      expect(screen.getByTestId('trigger')).toHaveFocus()
    })

    it('moves hidden-control focus to the trigger when the input is inside the popup', async () => {
      const { container } = render(HiddenControlFocus, { variant: 'popup-input' })
      await waitFor(() => expect(screen.getByTestId('popup-input')).toHaveFocus())

      await fireEvent.focus(hiddenInput(container))

      expect(screen.getByTestId('trigger')).toHaveFocus()
    })

    it('safely handles hidden-control focus without a visible control', async () => {
      const { container } = render(HiddenControlFocus, { variant: 'none' })

      await fireEvent.focus(hiddenInput(container))

      expect(document.body).toHaveFocus()
    })
  })

  describe('highlight restoration when clearing the query', () => {
    it('returns the highlight to the selected item when the input is cleared', async () => {
      const user = userEvent.setup()
      render(RestoreHighlightPopup, { items: ['apple', 'banana', 'cherry'], value: 'cherry' })

      await user.click(screen.getByTestId('trigger'))
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
      const input = screen.getByTestId('input') as HTMLInputElement

      await user.type(input, 'ap')
      await screen.findByRole('option', { name: 'apple' })

      await user.clear(input)
      await screen.findByRole('option', { name: 'cherry' })

      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'))
      const activeId = input.getAttribute('aria-activedescendant')
      expect(document.getElementById(activeId as string)).toHaveTextContent('cherry')
    })

    it('returns the highlight to the selected item without the items prop', async () => {
      const user = userEvent.setup()
      render(RestoreHighlightPopup, {
        staticItems: ['apple', 'banana', 'cherry'],
        value: 'cherry'
      })

      await user.click(screen.getByTestId('trigger'))
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
      const input = screen.getByTestId('input') as HTMLInputElement

      await user.type(input, 'ap')
      await user.clear(input)

      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'))
      const activeId = input.getAttribute('aria-activedescendant')
      expect(document.getElementById(activeId as string)).toHaveTextContent('cherry')
    })

    it('restores an array-valued single selection when the query is cleared', async () => {
      const user = userEvent.setup()
      const items = [
        [1, 2],
        [3, 4],
        [5, 6]
      ]
      render(RestoreHighlightPopup, {
        items,
        value: items[1],
        itemToStringLabel: (item: unknown) => (item as number[]).join('-')
      })

      await user.click(screen.getByTestId('trigger'))
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
      const input = screen.getByTestId('input') as HTMLInputElement

      const selected = screen.getByRole('option', { name: '3-4' })
      await waitFor(() => expect(selected).toHaveAttribute('data-highlighted'))

      await user.type(input, '1')
      await screen.findByRole('option', { name: '1-2' })

      await user.clear(input)
      const restored = await screen.findByRole('option', { name: '3-4' })
      await waitFor(() => expect(restored).toHaveAttribute('data-highlighted'))
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', restored.id))
    })

    it('does not highlight anything when there is no selected item', async () => {
      const user = userEvent.setup()
      render(RestoreHighlightOutside, {})

      const input = screen.getByTestId('input') as HTMLInputElement
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.type(input, 'ap')
      await screen.findByRole('option', { name: 'apple' })

      await user.clear(input)
      await screen.findByRole('option', { name: 'cherry' })

      expect(input).not.toHaveAttribute('aria-activedescendant')
    })

    it('restores the selected item instead of the first item when clearing with autoHighlight', async () => {
      const user = userEvent.setup()
      render(RestoreHighlightPopup, {
        items: ['apple', 'banana', 'cherry'],
        value: 'banana',
        autoHighlight: true
      })

      await user.click(screen.getByTestId('trigger'))
      const input = await screen.findByTestId('input')

      await user.type(input, 'a')
      const apple = await screen.findByRole('option', { name: 'apple' })
      await waitFor(() => expect(apple).toHaveAttribute('data-highlighted'))

      await user.clear(input)

      const banana = await screen.findByRole('option', { name: 'banana' })
      await waitFor(() => expect(banana).toHaveAttribute('data-highlighted'))
      expect(screen.getByRole('option', { name: 'apple' })).not.toHaveAttribute('data-highlighted')
    })

    it('emits onItemHighlighted for the selected item when the query is cleared', async () => {
      const user = userEvent.setup()
      const onItemHighlighted = vi.fn()
      render(RestoreHighlightPopup, {
        items: ['apple', 'banana', 'cherry'],
        value: 'banana',
        onItemHighlighted
      })

      await user.click(screen.getByTestId('trigger'))
      const input = await screen.findByTestId('input')

      await user.type(input, 'cherry')
      onItemHighlighted.mockClear()

      await user.clear(input)

      await waitFor(() => {
        expect(onItemHighlighted).toHaveBeenCalledWith('banana', 'none', 1)
      })
      expect(onItemHighlighted).toHaveBeenCalledTimes(1)
    })

    it('opens with an empty input and highlights the last selected item', async () => {
      const user = userEvent.setup()
      const onItemHighlighted = vi.fn()
      render(RestoreHighlightPopup, {
        items: ['apple', 'banana', 'cherry'],
        value: ['apple', 'banana'],
        multiple: true,
        onItemHighlighted
      })

      await user.click(screen.getByTestId('trigger'))
      const input = await screen.findByTestId('input')
      const apple = screen.getByRole('option', { name: 'apple' })
      const banana = screen.getByRole('option', { name: 'banana' })

      expect(input).toHaveValue('')
      expect(apple).toHaveAttribute('aria-selected', 'true')
      expect(banana).toHaveAttribute('aria-selected', 'true')
      await waitFor(() => expect(banana).toHaveAttribute('data-highlighted'))
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', banana.id))
      await waitFor(() => expect(onItemHighlighted).toHaveBeenCalledWith('banana', 'none', 1))
    })

    it('restores the highlight when clearing with the input outside the popup', async () => {
      const user = userEvent.setup()
      render(RestoreHighlightOutside, { multiple: true, value: ['apple', 'banana'] })

      const input = screen.getByTestId('input')
      await user.click(input)
      await user.type(input, 'apple')
      await waitFor(() => expect(screen.queryByRole('option', { name: 'banana' })).toBeNull())

      await user.clear(input)
      const banana = await screen.findByRole('option', { name: 'banana' })
      await waitFor(() => expect(banana).toHaveAttribute('data-highlighted'))
      expect(input).toHaveAttribute('aria-activedescendant', banana.id)
    })

    it('restores the selected item with the input outside the popup', async () => {
      const user = userEvent.setup()
      render(RestoreHighlightOutside, { value: 'banana', open: true, controlled: true })

      const input = screen.getByTestId('input') as HTMLInputElement
      await user.type(input, 'cherry')
      await waitFor(() => expect(screen.queryByRole('option', { name: 'banana' })).toBeNull())

      await user.clear(input)

      const banana = await screen.findByRole('option', { name: 'banana' })
      await waitFor(() => expect(banana).toHaveAttribute('data-highlighted'))
      expect(input).toHaveAttribute('aria-activedescendant', banana.id)
    })

    it('restores the highlight to the last selected item when clearing (input inside popup)', async () => {
      const user = userEvent.setup()
      render(RestoreHighlightPopup, {
        items: ['apple', 'banana', 'cherry'],
        value: ['apple', 'cherry'],
        multiple: true
      })

      await user.click(screen.getByTestId('trigger'))
      const input = await screen.findByTestId('input')

      await user.type(input, 'ba')
      await screen.findByRole('option', { name: 'banana' })

      await user.clear(input)

      const cherry = await screen.findByRole('option', { name: 'cherry' })
      await waitFor(() => expect(cherry).toHaveAttribute('data-highlighted'))
    })

    it.skipIf(isJSDOM)(
      'scrolls the last selected item into view when clearing',
      async ({ onTestFinished }) => {
        const scrollIntoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView')
        onTestFinished(() => scrollIntoView.mockRestore())

        const user = userEvent.setup()
        render(RestoreHighlightPopup, {
          items: Array.from({ length: 100 }, (_, index) => `item ${index}`),
          value: ['item 1', 'item 80'],
          multiple: true
        })

        await user.click(screen.getByTestId('trigger'))
        const input = await screen.findByTestId('input')
        await user.type(input, 'item 0')
        await waitFor(() => expect(screen.queryByRole('option', { name: 'item 80' })).toBeNull())

        scrollIntoView.mockClear()
        await user.clear(input)

        const selected = await screen.findByRole('option', { name: 'item 80' })
        await waitFor(() => expect(selected).toHaveAttribute('data-highlighted'))
        await waitFor(() => expect(scrollIntoView.mock.contexts).toEqual([selected]))
        expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' })
      }
    )

    it('re-highlights the selection on reopen when the value object is recreated with equal contents', async () => {
      const user = userEvent.setup()
      const onItemHighlighted = vi.fn()
      render(RecreatedValueCombobox, { onItemHighlighted })

      const input = screen.getByTestId('input')
      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()
      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'banana' })).toHaveAttribute('data-highlighted')
      )

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await fireEvent.click(screen.getByTestId('force'))

      onItemHighlighted.mockClear()
      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()
      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'banana' })).toHaveAttribute('data-highlighted')
      )
      expect(
        onItemHighlighted.mock.calls.some(([value]) => {
          const id = (value as { id?: number } | undefined)?.id
          return id !== undefined && id !== 2
        })
      ).toBe(false)
    })

    it('drops the restored highlight when all selections are cleared while open', async () => {
      const user = userEvent.setup()
      render(ExternalValueMultipleCombobox, {
        items: ['apple', 'banana', 'cherry'],
        initialValue: ['apple', 'banana']
      })

      const input = screen.getByTestId('input')
      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()
      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'banana' })).toHaveAttribute('data-highlighted')
      )

      await user.click(screen.getByTestId('clear'))
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()
      expect(
        screen.getAllByRole('option').some((item) => item.hasAttribute('data-highlighted'))
      ).toBe(false)
    })

    it('restores an externally set selection on reopen', async () => {
      const user = userEvent.setup()
      render(ExternalValueMultipleCombobox, {
        items: ['apple', 'banana', 'cherry'],
        initialValue: ['apple'],
        externalValue: ['cherry']
      })

      const input = screen.getByTestId('input')
      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()
      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'apple' })).toHaveAttribute('data-highlighted')
      )

      await user.click(screen.getByTestId('set-external'))
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()
      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'cherry' })).toHaveAttribute('data-highlighted')
      )
    })

    it('drops the restored highlight when all values are removed externally while closed', async () => {
      const user = userEvent.setup()
      render(ExternalValueMultipleCombobox, {
        staticItems: ['apple', 'banana', 'cherry'],
        initialValue: ['apple', 'banana']
      })

      const input = screen.getByTestId('input')
      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()
      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'banana' })).toHaveAttribute('data-highlighted')
      )

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      await user.click(screen.getByTestId('clear'))

      await user.click(input)
      expect(await screen.findByRole('listbox')).not.toBeNull()
      expect(screen.getByRole('option', { name: 'banana' })).not.toHaveAttribute('data-highlighted')
    })

    it('keeps the popup open and highlights the newly selected item after clearing its query', async () => {
      const user = userEvent.setup()
      const onItemHighlighted = vi.fn()
      render(RestoreHighlightPopup, {
        items: ['apple', 'banana', 'cherry'],
        value: ['apple'],
        multiple: true,
        onItemHighlighted
      })

      await user.click(screen.getByTestId('trigger'))
      const input = await screen.findByTestId('input')
      await user.type(input, 'cherry')
      const cherry = await screen.findByRole('option', { name: 'cherry' })

      onItemHighlighted.mockClear()
      await user.click(cherry)

      await waitFor(() => expect(input).toHaveValue(''))
      expect(screen.getByRole('listbox')).not.toBeNull()
      expect(screen.getByRole('option', { name: 'apple' })).toHaveAttribute('aria-selected', 'true')
      await waitFor(() => expect(cherry).toHaveAttribute('aria-selected', 'true'))
      await waitFor(() => expect(cherry).toHaveAttribute('data-highlighted'))
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', cherry.id))
      await waitFor(() => expect(onItemHighlighted).toHaveBeenCalledWith('cherry', 'none', 2))
    })

    it('keeps the toggled item highlighted when deselecting the last selected item', async () => {
      const user = userEvent.setup()
      render(RestoreHighlightPopup, {
        items: ['apple', 'banana', 'cherry'],
        value: ['apple', 'banana'],
        multiple: true
      })

      await user.click(screen.getByTestId('trigger'))
      const input = await screen.findByTestId('input')
      const apple = screen.getByRole('option', { name: 'apple' })
      const banana = screen.getByRole('option', { name: 'banana' })

      await waitFor(() => expect(banana).toHaveAttribute('data-highlighted'))
      await user.click(banana)

      await waitFor(() => expect(banana).toHaveAttribute('aria-selected', 'false'))
      expect(screen.getByRole('listbox')).not.toBeNull()
      expect(apple).toHaveAttribute('aria-selected', 'true')
      expect(apple).not.toHaveAttribute('data-highlighted')
      expect(banana).toHaveAttribute('data-highlighted')
      expect(input).toHaveAttribute('aria-activedescendant', banana.id)
    })

    it('clears the highlight when filtering deselects the only selected item', async () => {
      const user = userEvent.setup()
      render(RestoreHighlightPopup, {
        items: ['apple', 'banana', 'cherry'],
        value: ['banana'],
        multiple: true
      })

      await user.click(screen.getByTestId('trigger'))
      const input = await screen.findByTestId('input')
      await user.type(input, 'banana')
      const banana = await screen.findByRole('option', { name: 'banana' })

      await user.click(banana)

      await waitFor(() => expect(input).toHaveValue(''))
      await waitFor(() => expect(banana).toHaveAttribute('aria-selected', 'false'))
      expect(input).not.toHaveAttribute('aria-activedescendant')
      expect(
        screen.getAllByRole('option').some((item) => item.hasAttribute('data-highlighted'))
      ).toBe(false)
    })

    it('clears a closing query and restores the last selected item on reopen', async () => {
      const user = userEvent.setup()
      const onItemHighlighted = vi.fn()
      render(RestoreHighlightPopup, {
        items: ['apple', 'banana', 'cherry'],
        value: ['apple', 'banana'],
        multiple: true,
        onItemHighlighted
      })

      await user.click(screen.getByTestId('trigger'))
      const input = await screen.findByTestId('input')
      await user.type(input, 'cherry')
      await waitFor(() => expect(screen.queryByRole('option', { name: 'banana' })).toBeNull())

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())

      onItemHighlighted.mockClear()
      await user.click(screen.getByTestId('trigger'))

      const reopenedInput = await screen.findByTestId('input')
      const banana = await screen.findByRole('option', { name: 'banana' })
      expect(reopenedInput).toHaveValue('')
      await waitFor(() => expect(banana).toHaveAttribute('data-highlighted'))
      await waitFor(() => expect(reopenedInput).toHaveAttribute('aria-activedescendant', banana.id))
      await waitFor(() => expect(onItemHighlighted).toHaveBeenCalledWith('banana', 'none', 1))
    })

    it('does not navigate kept-mounted items while controlled closed', async () => {
      const user = userEvent.setup()
      render(KeptMountedClosedCombobox, {})

      const input = screen.getByTestId('input')
      await user.type(input, 'banana')

      expect(input).not.toHaveAttribute('aria-activedescendant')
    })
  })

  describe('input inside popup composition', () => {
    it('selects with the keyboard, restores focus, and resets the query on reopen', async () => {
      const user = userEvent.setup()
      render(InputInsidePopupCombobox, { items: ['Apple', 'Banana', 'Cherry'] })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)

      const input = await screen.findByTestId('input')
      await waitFor(() => expect(input).toHaveFocus())

      await user.type(input, 'ban')
      await user.keyboard('{ArrowDown}{Enter}')

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      await waitFor(() => expect(trigger).toHaveFocus())
      expect(trigger).toHaveTextContent('Banana')

      await user.click(trigger)

      const reopenedInput = await screen.findByTestId('input')
      expect(reopenedInput).toHaveValue('')

      const banana = await screen.findByRole('option', { name: 'Banana' })
      expect(banana).toHaveAttribute('aria-selected', 'true')
      await waitFor(() => expect(banana).toHaveAttribute('data-highlighted'))
    })

    it('discards an uncommitted query on Escape and preserves the selection', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(InputInsidePopupCombobox, {
        items: ['Apple', 'Banana', 'Cherry'],
        value: 'Apple',
        onValueChange
      })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)
      await user.type(await screen.findByTestId('input'), 'ban')
      await user.keyboard('{Escape}')

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      await waitFor(() => expect(trigger).toHaveFocus())
      expect(trigger).toHaveTextContent('Apple')
      expect(onValueChange).not.toHaveBeenCalled()

      await user.click(trigger)

      expect(await screen.findByTestId('input')).toHaveValue('')
      expect(await screen.findByRole('option', { name: 'Apple' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
      expect(await screen.findByRole('option', { name: 'Banana' })).not.toBeNull()
    })

    it.skipIf(isJSDOM)(
      'clears a single-select query when reopening during the close animation',
      async () => {
        const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

        try {
          const user = userEvent.setup()
          render(AnimatedMultipleCombobox, { multiple: false })

          const trigger = screen.getByTestId('trigger')
          await user.click(trigger)
          await user.type(await screen.findByTestId('input'), 'zz')
          await user.keyboard('{Escape}')

          const popup = screen.getByTestId('popup')
          await waitFor(() => expect(popup).toHaveAttribute('data-ending-style'))

          await user.click(trigger)

          await waitFor(() => expect(popup).not.toHaveAttribute('data-ending-style'))
          expect(screen.getByTestId('input')).toHaveValue('')
          expect(screen.getByRole('option', { name: 'apple' })).not.toBeNull()
          expect(screen.getByRole('option', { name: 'banana' })).not.toBeNull()
        } finally {
          globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
        }
      }
    )

    it.skipIf(isJSDOM)(
      'preserves a typed query when the input reopens the popup during the close animation',
      async () => {
        const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

        try {
          const user = userEvent.setup()
          render(AnimatedMultipleCombobox, { multiple: false })

          await user.click(screen.getByTestId('trigger'))
          const input = await screen.findByTestId('input')
          await user.type(input, 'ap')
          await user.keyboard('{Escape}')

          const popup = screen.getByTestId('popup')
          await waitFor(() => expect(popup).toHaveAttribute('data-ending-style'))

          input.focus()
          await user.type(input, 'b', { skipClick: true })

          await waitFor(() => expect(popup).not.toHaveAttribute('data-ending-style'))
          expect(input).toHaveValue('apb')
          expect(screen.getByRole('status')).toHaveTextContent('No matches')
          expect(screen.queryByRole('option')).toBeNull()
        } finally {
          globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
        }
      }
    )

    it('releases filtering when a controlled popup ignores a close request', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(ControlledOpenPopupCombobox, { onOpenChange })

      const input = screen.getByTestId('input')

      await user.type(input, 'ap')
      await waitFor(() => expect(screen.queryByRole('option', { name: 'Banana' })).toBeNull())

      await user.click(screen.getByRole('option', { name: 'Apple' }))

      expect(onOpenChange.mock.lastCall?.[0]).toBe(false)
      expect(screen.getByRole('dialog')).not.toBeNull()

      await user.clear(input)
      await user.type(input, 'ba')

      expect(input).toHaveValue('ba')
      await waitFor(() => expect(screen.getByRole('option', { name: 'Banana' })).not.toBeNull())
      expect(screen.queryByRole('option', { name: 'Apple' })).toBeNull()
    })
  })

  describe('scroll reset on input value change', () => {
    it.skipIf(isJSDOM)(
      'resets the list scroll position to the top when the query changes',
      async () => {
        const user = userEvent.setup()
        render(ScrollResetCombobox, { variant: 'list' })

        const input = screen.getByTestId('input')
        await user.click(input)

        const list = screen.getByRole('listbox')
        list.scrollTop = 40
        expect(list.scrollTop).toBeGreaterThan(0)

        await user.type(input, 'item-1')

        await waitFor(() => expect(list.scrollTop).toBe(0))
      }
    )

    it.skipIf(isJSDOM)(
      'resets the scroll position of a scrollable wrapper around the list',
      async () => {
        const user = userEvent.setup()
        render(ScrollResetCombobox, { variant: 'wrapper' })

        const input = screen.getByTestId('input')
        await user.click(input)

        const viewport = screen.getByTestId('viewport')
        viewport.scrollTop = 40
        expect(viewport.scrollTop).toBeGreaterThan(0)

        await user.type(input, 'item-1')

        await waitFor(() => expect(viewport.scrollTop).toBe(0))
      }
    )

    it.skipIf(isJSDOM)('skips clipping ancestors when finding the scroll container', async () => {
      const user = userEvent.setup()
      render(ScrollResetCombobox, { variant: 'clip' })

      const input = screen.getByTestId('input')
      await user.click(input)

      const viewport = screen.getByTestId('viewport')
      viewport.scrollTop = 40
      expect(viewport.scrollTop).toBeGreaterThan(0)

      await user.type(input, 'item-1')

      await waitFor(() => expect(viewport.scrollTop).toBe(0))
    })

    it.skipIf(isJSDOM)(
      'resets only the nearest scrollable wrapper when composed in a scrollable dialog',
      async () => {
        const user = userEvent.setup()
        render(ScrollResetCombobox, { variant: 'inline-dialog' })

        const input = screen.getByTestId('input')
        const dialog = screen.getByTestId('dialog')
        const viewport = screen.getByTestId('viewport')
        await user.click(input)
        dialog.scrollTop = 60
        viewport.scrollTop = 40
        const dialogScrollTop = dialog.scrollTop
        expect(dialogScrollTop).toBeGreaterThan(0)
        expect(viewport.scrollTop).toBeGreaterThan(0)

        await user.keyboard('item-1')

        await waitFor(() => expect(viewport.scrollTop).toBe(0))
        expect(dialog.scrollTop).toBe(dialogScrollTop)
      }
    )

    it.skipIf(isJSDOM)(
      'keeps the auto-highlighted first item in view after the query changes',
      async () => {
        const user = userEvent.setup()
        render(AutoHighlightCombobox, {
          items: Array.from({ length: 50 }, (_, index) => `item-${index}`)
        })

        const input = screen.getByTestId('input')
        await user.click(input)

        const list = screen.getByRole('listbox')
        list.style.maxHeight = '100px'
        list.style.overflowY = 'auto'
        list.scrollTop = 40

        await user.type(input, 'item-1')

        await waitFor(() => expect(list.scrollTop).toBe(0))
      }
    )

    it.skipIf(isJSDOM)(
      'resets the scroll container when filtering reorders retained items',
      async () => {
        const user = userEvent.setup()
        render(R2ExternalFilterCombobox, {
          mode: 'reverse',
          fruits: Array.from({ length: 10 }, (_, index) => `item-${index}`)
        })

        const input = screen.getByTestId('input')
        await user.click(input)

        const list = screen.getByRole('listbox')
        list.style.maxHeight = '60px'
        list.style.overflowY = 'auto'
        list.scrollTop = 40
        expect(list.scrollTop).toBeGreaterThan(0)

        await user.type(input, 'x')

        await waitFor(() => expect(screen.getAllByRole('option')[0]).toHaveTextContent('item-9'))
        await waitFor(() => expect(list.scrollTop).toBe(0))
      }
    )

    it.skipIf(isJSDOM)('does not reset a surrounding dialog', async () => {
      const user = userEvent.setup()
      render(ScrollResetCombobox, { variant: 'dialog' })

      const input = screen.getByTestId('input')
      const dialog = screen.getByTestId('dialog')
      await user.click(input)
      dialog.scrollTop = dialog.scrollHeight
      const dialogScrollTop = dialog.scrollTop
      expect(dialogScrollTop).toBeGreaterThan(0)

      await user.keyboard('item-1')

      expect(dialog.scrollTop).toBe(dialogScrollTop)
    })
  })
})
