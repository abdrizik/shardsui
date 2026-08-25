import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import type { FieldValidator } from '$lib/components/field'
import { popupConformanceTests } from '../popup-conformance'
import { isJSDOM } from '../test-utils'
import AutofillCancel from './fixtures/autofill-cancel.svelte'
import AutofillField from './fixtures/autofill-field.svelte'
import AutofillObject from './fixtures/autofill-object.svelte'
import AutofillPrimitive from './fixtures/autofill-primitive.svelte'
import BasicSelect from './fixtures/basic-select.svelte'
import SelectConformance from './fixtures/conformance.svelte'
import ControlledSelect from './fixtures/controlled-select.svelte'
import DynamicItems from './fixtures/dynamic-items.svelte'
import MultipleAddItems from './fixtures/multiple-add-items.svelte'
import MultipleSelect from './fixtures/multiple-select.svelte'
import OpenChangeComplete from './fixtures/open-change-complete.svelte'
import ScrollArrowExitAnimation from './fixtures/scroll-arrow-exit-animation.svelte'
import ScrollLock from './fixtures/scroll-lock.svelte'
import SelectAnimatedOpenChangeComplete from './fixtures/select-animated-open-change-complete.svelte'
import SelectDynamicItems from './fixtures/select-dynamic-items.svelte'
import SelectFilterOnOpen from './fixtures/select-filter-on-open.svelte'
import SelectHoverHighlight from './fixtures/select-hover-highlight.svelte'
import SelectId from './fixtures/select-id.svelte'
import SelectInPopover from './fixtures/select-in-popover.svelte'
import SelectLockedAutofill from './fixtures/select-locked-autofill.svelte'
import SelectMultipleDynamic from './fixtures/select-multiple-dynamic.svelte'
import SelectObjectValues from './fixtures/select-object-values.svelte'
import SelectOpenVeto from './fixtures/select-open-veto.svelte'
import SelectPortalledPopupContent from './fixtures/select-portalled-popup-content.svelte'
import SelectProgrammaticValue from './fixtures/select-programmatic-value.svelte'
import SelectTouchReposition from './fixtures/select-touch-reposition.svelte'
import SelectWithItems from './fixtures/select-with-items.svelte'
import SelectWithModal from './fixtures/select-with-modal.svelte'
import TabOutSelect from './fixtures/tab-out-select.svelte'
import TouchExitArrows from './fixtures/touch-exit-arrows.svelte'
import TouchReopen from './fixtures/touch-reopen.svelte'

function hiddenInput(container: HTMLElement) {
  return container.querySelector('input[aria-hidden="true"]') as HTMLInputElement
}

describe('<Select.Root />', () => {
  popupConformanceTests({
    component: SelectConformance,
    triggerMouseAction: 'click',
    expectedPopupRole: 'listbox',
    alwaysMounted: 'only-after-open'
  })

  describe('ARIA attributes', () => {
    it('trigger has role=combobox and aria-haspopup=listbox', () => {
      render(BasicSelect)
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('trigger has aria-expanded reflecting the open state', async () => {
      const user = userEvent.setup()
      render(BasicSelect)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('open/close', () => {
    it('does not show listbox initially', () => {
      render(BasicSelect)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('opens the listbox when the trigger is clicked', async () => {
      const user = userEvent.setup()
      render(BasicSelect)

      await user.click(screen.getByRole('combobox'))

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('closes after selecting an item', async () => {
      const user = userEvent.setup()
      render(BasicSelect)

      await user.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()

      const optionA = screen.getByRole('option', { name: 'Option A' })
      await user.pointer({ target: optionA })
      await user.click(optionA)

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('prop: value', () => {
    it('selects the item specified by the value prop', async () => {
      const user = userEvent.setup()
      render(ControlledSelect, { value: 'b' })

      await user.click(screen.getByRole('combobox'))

      expect(screen.getByRole('option', { name: 'b' })).toHaveAttribute('data-selected', '')
    })

    it('selects the controlled value when the popup is mounted on the initial render', () => {
      render(BasicSelect, { open: true, value: 'b' })

      expect(screen.getByRole('option', { name: 'Option B' })).toHaveAttribute('data-selected', '')
      expect(screen.getByRole('option', { name: 'Option A' })).not.toHaveAttribute('data-selected')
    })

    it('updates the selected item when the value prop changes', async () => {
      const user = userEvent.setup()
      const { rerender } = render(ControlledSelect, { value: 'a' })

      await user.click(screen.getByRole('combobox'))
      expect(screen.getByRole('option', { name: 'a' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('option', { name: 'b' })).toHaveAttribute('aria-selected', 'false')

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())

      await rerender({ value: 'b' })

      await user.click(screen.getByRole('combobox'))
      expect(screen.getByRole('option', { name: 'b' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('option', { name: 'a' })).toHaveAttribute('aria-selected', 'false')
    })

    it('does not update the internal value if the controlled value prop does not change', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(ControlledSelect, { value: 'a', onValueChange })

      await user.click(screen.getByRole('combobox'))

      const optionB = screen.getByRole('option', { name: 'b' })
      await user.pointer({ target: optionB })
      await user.click(optionB)

      expect(onValueChange).toHaveBeenCalledTimes(1)
    })

    it('updates <Select.Value /> label when the value prop changes before the popup opens', async () => {
      const { rerender } = render(ControlledSelect, { value: 'b' })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveTextContent('b')

      await rerender({ value: 'a' })

      expect(trigger).toHaveTextContent('a')
    })

    it('resets selected index when value is set to null without a null item', async () => {
      const user = userEvent.setup()
      render(ControlledSelect, { value: null })

      await user.click(screen.getByRole('combobox'))

      const options = screen.getAllByRole('option')
      options.forEach((opt) => {
        expect(opt).not.toHaveAttribute('data-selected', '')
      })
    })
  })

  describe('prop: itemToStringLabel', () => {
    type Country = { country: string; code: string }
    const countries: Country[] = [
      { country: 'United States', code: 'US' },
      { country: 'Canada', code: 'CA' },
      { country: 'Australia', code: 'AU' }
    ]

    it('uses itemToStringLabel for trigger text when value is object', async () => {
      render(BasicSelect, {
        value: countries[1],
        itemToStringLabel: (item: Country) => item.country,
        itemToStringValue: (item: Country) => item.code
      })

      expect(screen.getByRole('combobox')).toHaveTextContent('Canada')
    })

    it('updates trigger text with itemToStringLabel after selecting object item', async () => {
      const user = userEvent.setup()
      render(BasicSelect, {
        open: true,
        itemToStringLabel: (item: Country) => item.country,
        itemToStringValue: (item: Country) => item.code,
        items: countries
      })

      await user.click(screen.getByRole('option', { name: 'Canada' }))
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())

      expect(screen.getByRole('combobox')).toHaveTextContent('Canada')
    })
  })

  describe('prop: itemToStringValue', () => {
    it('does not invoke itemToStringValue with the value array in multiple mode', () => {
      const items = [
        { country: 'United States', code: 'US' },
        { country: 'Canada', code: 'CA' }
      ]
      const { container } = render(SelectWithItems, {
        name: 'countries',
        multiple: true,
        value: [items[0], items[1]],
        items,
        itemToStringLabel: (item: (typeof items)[number]) => item.country,
        itemToStringValue: (item: (typeof items)[number]) => item.code.toUpperCase()
      })

      const hiddenInputs = container.querySelectorAll('input[name="countries"]')
      expect(hiddenInputs).toHaveLength(2)
      expect((hiddenInputs[0] as HTMLInputElement).value).toBe('US')
      expect((hiddenInputs[1] as HTMLInputElement).value).toBe('CA')
    })
  })

  describe('prop: onValueChange', () => {
    it('calls onValueChange when an item is selected', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(BasicSelect, { onValueChange })

      await user.click(screen.getByRole('combobox'))
      const optionC = screen.getByRole('option', { name: 'Option C' })
      await user.pointer({ target: optionC })
      await user.click(optionC)

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange).toHaveBeenCalledWith('c')
    })

    it('is not called twice on select', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      render(BasicSelect, { onValueChange: handleValueChange })

      await user.click(screen.getByRole('combobox'))
      const optionB = screen.getByRole('option', { name: 'Option B' })
      await user.pointer({ target: optionB })
      await user.click(optionB)

      expect(handleValueChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('prop: open', () => {
    it('opens the select by default', () => {
      render(BasicSelect, { open: true })
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('selects an item and closes when clicked while opened by default', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(BasicSelect, { open: true, onValueChange })

      expect(screen.getByRole('listbox')).toBeInTheDocument()

      const optionB = screen.getByRole('option', { name: 'Option B' })
      await fireEvent.mouseMove(optionB)
      await user.click(optionB)

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toBe('b')

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBe(null)
      })
    })

    it('stays closed when the open binding drops the write', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(SelectOpenVeto, { onOpenChange })

      await user.click(screen.getByTestId('trigger'))

      expect(onOpenChange).toHaveBeenCalledWith(true)
      expect(screen.queryByRole('listbox')).toBe(null)
      expect(screen.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('prop: onOpenChange', () => {
    it('calls onOpenChange when the select is opened or closed', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicSelect, { onOpenChange })

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledTimes(1)
      })
      expect(onOpenChange.mock.calls[0][0]).toBe(true)

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(onOpenChange.mock.lastCall?.[0]).toBe(false)
      })
    })

    it('does not dismiss when pressing portalled content inside the popup but outside the list', async () => {
      const user = userEvent.setup()
      render(SelectPortalledPopupContent)

      await user.click(screen.getByText('Portalled content'))

      expect(screen.getByRole('listbox')).not.toBe(null)
    })
  })

  describe('keyboard navigation', () => {
    it('ArrowDown moves highlight to next item', async () => {
      const user = userEvent.setup()
      render(BasicSelect)

      await user.click(screen.getByRole('combobox'))

      const options = screen.getAllByRole('option')
      await waitFor(() => {
        expect(options[0]).toHaveAttribute('data-highlighted')
      })

      await fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })

      await waitFor(() => {
        expect(options[1]).toHaveAttribute('data-highlighted')
      })
    })

    it('Enter key selects highlighted item and closes', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(BasicSelect, { onValueChange })

      await user.click(screen.getByRole('combobox'))

      const options = screen.getAllByRole('option')
      await waitFor(() => {
        expect(options[0]).toHaveAttribute('data-highlighted')
      })

      await fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })
      await waitFor(() => {
        expect(options[1]).toHaveAttribute('data-highlighted')
      })

      await fireEvent.keyDown(options[1], { key: 'Enter' })

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('prop: disabled', () => {
    it('sets the disabled state', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicSelect, { value: 'b', disabled: true, onOpenChange })

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('disabled')
      expect(trigger).toHaveAttribute('data-disabled')

      await user.keyboard('{Tab}')
      expect(document.activeElement).not.toBe(trigger)

      await user.click(trigger)
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('updates the disabled state when the disabled prop changes', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      const { rerender } = render(BasicSelect, { value: 'b', disabled: true, onOpenChange })

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('disabled')
      expect(trigger).toHaveAttribute('data-disabled')

      await user.keyboard('{Tab}')
      expect(document.activeElement).not.toBe(trigger)

      await user.click(trigger)
      expect(onOpenChange).not.toHaveBeenCalled()

      await rerender({ value: 'b', disabled: false, onOpenChange })

      expect(trigger).not.toHaveAttribute('disabled')
      expect(trigger).not.toHaveAttribute('data-disabled')

      await user.keyboard('{Tab}')
      expect(trigger).toHaveFocus()

      await user.click(trigger)
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('prop: readOnly', () => {
    it('sets the readOnly state', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicSelect, { value: 'b', readOnly: true, onOpenChange })

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-readonly', 'true')
      expect(trigger).toHaveAttribute('data-readonly')

      await user.keyboard('{Tab}')
      expect(trigger).toHaveFocus()

      await user.click(trigger)
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('does not open the select when clicked', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicSelect, { readOnly: true, onOpenChange })

      await user.click(screen.getByRole('combobox'))

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('does not open the select when using keyboard', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicSelect, { readOnly: true, onOpenChange })

      const trigger = screen.getByRole('combobox')
      trigger.focus()

      await user.keyboard('{ArrowDown}')
      expect(screen.queryByRole('listbox')).toBe(null)

      await user.keyboard('{Enter}')
      expect(screen.queryByRole('listbox')).toBe(null)

      await user.keyboard('{ }')
      expect(screen.queryByRole('listbox')).toBe(null)

      expect(onOpenChange).not.toHaveBeenCalled()
    })
  })

  describe('prop: disabled / readOnly', () => {
    it.each([
      { lockState: 'readOnly', label: 'inside Field', withField: true },
      { lockState: 'disabled', label: 'inside Field', withField: true },
      { lockState: 'readOnly', label: 'outside Field', withField: false },
      { lockState: 'disabled', label: 'outside Field', withField: false }
    ] as const)(
      'ignores hidden-input autofill when $lockState $label',
      async ({ lockState, withField }) => {
        const onValueChange = vi.fn()
        const { container } = render(SelectLockedAutofill, {
          withField,
          readOnly: lockState === 'readOnly',
          disabled: lockState === 'disabled',
          onValueChange
        })

        const selectInput = container.querySelector('input[aria-hidden="true"]') as HTMLInputElement
        expect(selectInput).toHaveAttribute('name', 'select')

        if (withField) {
          expect(screen.getByTestId('error')).toHaveTextContent('test')
        }

        await fireEvent.change(selectInput, { target: { value: 'b' } })

        expect(onValueChange).not.toHaveBeenCalled()
        expect(selectInput.value).toBe('')

        if (withField) {
          expect(screen.getByTestId('error')).toHaveTextContent('test')
        }
      }
    )

    it.each(['disabled', 'readOnly'] as const)(
      'does not commit item selection when root is %s and forced open',
      async (lockState) => {
        const user = userEvent.setup()
        const onValueChange = vi.fn()
        render(BasicSelect, {
          open: true,
          onValueChange,
          disabled: lockState === 'disabled',
          readOnly: lockState === 'readOnly'
        })

        await user.click(screen.getByRole('option', { name: 'Option B' }))

        expect(onValueChange).not.toHaveBeenCalled()
        expect(screen.getByRole('option', { name: 'Option B' })).not.toHaveAttribute(
          'data-selected'
        )
      }
    )
  })

  describe('prop: multiple', () => {
    it('allows multiple selections when multiple is true', async () => {
      const user = userEvent.setup()
      render(MultipleSelect)

      await user.click(screen.getByRole('combobox'))
      const optionA = screen.getByRole('option', { name: 'Option A' })
      await user.pointer({ target: optionA })
      await user.click(optionA)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('deselects items when clicked again in multiple mode', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(MultipleSelect, { value: ['a', 'b'], onValueChange })

      await user.click(screen.getByRole('combobox'))
      const optionA = screen.getByRole('option', { name: 'Option A' })
      await user.pointer({ target: optionA })
      await user.click(optionA)

      expect(onValueChange).toHaveBeenCalledWith(['b'])
    })

    it('does not close the popup when selecting items in multiple mode', async () => {
      const user = userEvent.setup()
      render(MultipleSelect)

      await user.click(screen.getByRole('combobox'))
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      const optionA = screen.getByRole('option', { name: 'Option A' })
      await user.pointer({ target: optionA })
      await user.click(optionA)

      expect(screen.getByRole('listbox')).toBeInTheDocument()

      const optionB = screen.getByRole('option', { name: 'Option B' })
      await user.pointer({ target: optionB })
      await user.click(optionB)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('updates selected items when the value prop changes while open', async () => {
      const user = userEvent.setup()
      const { rerender } = render(MultipleSelect, { value: ['a'] })

      await user.click(screen.getByRole('combobox'))

      expect(screen.getByRole('option', { name: 'Option A' })).toHaveAttribute('data-selected', '')
      expect(screen.getByRole('option', { name: 'Option B' })).not.toHaveAttribute('data-selected')

      await rerender({ value: ['a', 'b', 'c'] })

      expect(screen.getByRole('option', { name: 'Option A' })).toHaveAttribute('data-selected', '')
      expect(screen.getByRole('option', { name: 'Option B' })).toHaveAttribute('data-selected', '')
      expect(screen.getByRole('option', { name: 'Option C' })).toHaveAttribute('data-selected', '')
    })

    it('clears deselected items when the value prop changes while open', async () => {
      const user = userEvent.setup()
      const { rerender } = render(MultipleSelect, { value: ['a', 'b'] })

      await user.click(screen.getByRole('combobox'))

      expect(screen.getByRole('option', { name: 'Option A' })).toHaveAttribute('data-selected', '')
      expect(screen.getByRole('option', { name: 'Option B' })).toHaveAttribute('data-selected', '')

      await rerender({ value: ['b'] })

      expect(screen.getByRole('option', { name: 'Option B' })).toHaveAttribute('data-selected', '')
      expect(screen.getByRole('option', { name: 'Option A' })).not.toHaveAttribute('data-selected')
    })

    it('handles an array value in multiple mode', async () => {
      const user = userEvent.setup()
      render(MultipleSelect, { value: ['a', 'c'] })

      await user.click(screen.getByRole('combobox'))

      expect(screen.getByRole('option', { name: 'Option A' })).toHaveAttribute('data-selected', '')
      expect(screen.getByRole('option', { name: 'Option B' })).not.toHaveAttribute('data-selected')
      expect(screen.getByRole('option', { name: 'Option C' })).toHaveAttribute('data-selected', '')
    })

    it('serializes multiple values for form submission', () => {
      const { container } = render(MultipleSelect, {
        name: 'select',
        value: ['a', 'c']
      })

      const hiddenInputs = container.querySelectorAll<HTMLInputElement>('input[name="select"]')
      expect(hiddenInputs).toHaveLength(2)
      expect(Array.from(hiddenInputs).map((i) => i.value)).toEqual(['a', 'c'])
    })

    it('serializes an empty array as an empty string in multiple mode', () => {
      const { container } = render(MultipleSelect, {
        name: 'select',
        value: []
      })

      expect(container.querySelectorAll('input[name="select"]')).toHaveLength(0)

      const mainInput = hiddenInput(container)
      expect(mainInput).not.toBe(null)
      expect(mainInput.value).toBe('')
    })

    it('keeps the selection when items are added and none of the selected ones are removed', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(MultipleAddItems, { onValueChange })

      expect(await screen.findByRole('option', { name: 'a' })).toHaveAttribute('data-selected', '')

      await user.click(screen.getByTestId('add'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'c' })).not.toBe(null)
      })

      expect(onValueChange).not.toHaveBeenCalled()
      expect(screen.getByRole('option', { name: 'a' })).toHaveAttribute('data-selected', '')
    })

    it('removes selections that no longer exist', async () => {
      const user = userEvent.setup()
      render(SelectMultipleDynamic, { value: ['a', 'c'] })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'a' })).toHaveAttribute('data-selected', '')
      })
      expect(screen.getByRole('option', { name: 'c' })).toHaveAttribute('data-selected', '')

      await fireEvent.click(screen.getByTestId('remove-c'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'a' })).toHaveAttribute('data-selected', '')
      })
      expect(screen.queryByRole('option', { name: 'c' })).toBe(null)

      await fireEvent.click(screen.getByTestId('remove-a'))

      await waitFor(() => {
        const options = screen.getAllByRole('option')
        options.forEach((opt) => {
          expect(opt).not.toHaveAttribute('data-selected')
        })
      })
    })

    it('keeps the active index on a deselected item in multiple mode', async () => {
      const user = userEvent.setup()
      render(MultipleSelect, { value: ['a'] })

      await user.click(screen.getByRole('combobox'))

      const optionB = screen.getByRole('option', { name: 'Option B' })

      await user.pointer({ target: optionB })
      await user.click(optionB)

      await waitFor(() => {
        expect(optionB).toHaveAttribute('data-highlighted')
      })

      await user.pointer({ target: optionB })
      await user.click(optionB)

      await waitFor(() => {
        expect(optionB).toHaveAttribute('data-highlighted')
      })
    })
  })

  describe('prop: isItemEqualToValue', () => {
    it('matches object values using the provided comparator', async () => {
      const user = userEvent.setup()
      render(SelectObjectValues, {
        value: { id: 2, name: 'Bob' },
        isItemEqualToValue: (item, val) => item.id === val.id
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveTextContent('Bob')

      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Bob' })).toHaveAttribute('data-selected', '')
      })
    })

    it('matches object values when the popup is mounted on the initial render', () => {
      render(SelectObjectValues, {
        open: true,
        value: { id: 2, name: 'Bob' },
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' }
        ],
        isItemEqualToValue: (item, value) => item.id === value.id
      })

      expect(screen.getByRole('option', { name: 'Bob' })).toHaveAttribute('data-selected', '')
      expect(screen.getByRole('option', { name: 'Alice' })).not.toHaveAttribute('data-selected')
    })

    it('passes item as the first comparator argument in multiple mode', async () => {
      render(SelectObjectValues, {
        multiple: true,
        open: true,
        value: [{ id: 2, name: 'Bob', source: 'selected' }],
        isItemEqualToValue: (item, val) =>
          item.id === val.id && item.source === 'item' && val.source === 'selected'
      })

      const option = screen.getByRole('option', { name: 'Bob' })
      expect(option).toHaveAttribute('data-selected', '')

      await fireEvent.pointerDown(option, { pointerType: 'mouse' })
      await fireEvent.mouseDown(option)
      await fireEvent.mouseUp(option)
      await fireEvent.click(option, { detail: 1 })

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Bob' })).not.toHaveAttribute('data-selected')
      })
    })
  })

  describe('prop: isItemEqualToValue in multiple mode', () => {
    it('does not invoke isItemEqualToValue with the value array when empty', async () => {
      const isItemEqualToValue = vi.fn((item: { id: number }, value: { id: number }) => {
        if (Array.isArray(value)) throw new Error('isItemEqualToValue received the value array')
        return item.id === value.id
      })

      render(SelectObjectValues, {
        multiple: true,
        open: true,
        value: [],
        isItemEqualToValue
      })

      expect(await screen.findAllByRole('option')).toHaveLength(2)
      expect(isItemEqualToValue).not.toHaveBeenCalledWith(expect.anything(), expect.any(Array))
    })
  })

  describe('prop: highlightItemOnHover', () => {
    it('highlights an item on mouse move by default', async () => {
      const user = userEvent.setup()
      render(SelectHoverHighlight, { open: true })

      const optionB = screen.getByRole('option', { name: 'b' })
      await user.hover(optionB)

      await waitFor(() => {
        expect(optionB).toHaveAttribute('data-highlighted')
      })
    })

    it('does not highlight items from mouse movement when disabled', async () => {
      const user = userEvent.setup()
      render(SelectHoverHighlight, { open: true, highlightItemOnHover: false })

      const optionB = screen.getByRole('option', { name: 'b' })
      await user.hover(optionB)

      expect(optionB).not.toHaveAttribute('data-highlighted')
    })

    it('does not remove highlight when mousing out of popup when disabled', async () => {
      const user = userEvent.setup()
      render(SelectHoverHighlight, { open: true, highlightItemOnHover: false })

      const optionA = screen.getByRole('option', { name: 'a' })
      await user.hover(optionA)

      await fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })

      await waitFor(() => {
        expect(optionA).toHaveAttribute('data-highlighted')
      })

      const popup = screen.getByRole('listbox')
      await user.unhover(popup)

      await waitFor(() => {
        expect(optionA).toHaveAttribute('data-highlighted')
      })
    })
  })

  describe('prop: modal', () => {
    it('renders an internal backdrop when true', async () => {
      const user = userEvent.setup()
      render(SelectWithModal, { modal: true })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeInTheDocument()
      })

      const positioner = screen.getByTestId('positioner')
      expect(positioner.previousElementSibling).toHaveAttribute('role', 'presentation')
    })

    it('does not render an internal backdrop when false', async () => {
      const user = userEvent.setup()
      render(SelectWithModal, { modal: false })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeInTheDocument()
      })

      const positioner = screen.getByTestId('positioner')
      expect(positioner.previousElementSibling).toBeNull()
    })
  })

  describe('prop: id', () => {
    it('sets the id on the trigger', () => {
      render(SelectId, { id: 'test-id' })
      expect(screen.getByRole('combobox')).toHaveAttribute('id', 'test-id')
    })

    it('sets a hidden input id when name is not provided', () => {
      const { container } = render(SelectId, { id: 'test-id' })
      const input = hiddenInput(container)
      expect(input).toHaveAttribute('id', 'test-id-hidden-input')
      expect(input).not.toHaveAttribute('name')
    })

    it('does not set a hidden input id when name is provided', () => {
      const { container } = render(SelectId, { id: 'test-id', name: 'country' })
      const input = hiddenInput(container)
      expect(input).toHaveAttribute('name', 'country')
      expect(input).not.toHaveAttribute('id')
    })
  })

  describe('prop: autoComplete', () => {
    it('passes autoComplete to the hidden input', () => {
      const { container } = render(SelectWithItems, {
        name: 'country',
        autoComplete: 'country'
      })
      const input = container.querySelector('input[name="country"]')
      expect(input).toBeTruthy()
      expect(input!.getAttribute('autocomplete')).toBe('country')
    })
  })

  describe.skipIf(isJSDOM)('prop: onOpenChangeComplete', () => {
    it('is called on close when there is no exit animation defined', async () => {
      const user = userEvent.setup()
      const onOpenChangeComplete = vi.fn()
      render(OpenChangeComplete, { open: true, onOpenChangeComplete })

      await user.click(screen.getByRole('button', { name: 'Close' }))

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBe(null)
      })

      expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true)
      expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
    })

    it('is called on open when there is no enter animation defined', async () => {
      const user = userEvent.setup()
      const onOpenChangeComplete = vi.fn()
      render(OpenChangeComplete, { open: false, onOpenChangeComplete })

      await user.click(screen.getByRole('button', { name: 'Open' }))

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBe(null)
      })

      expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true)
    })

    it('does not get called on mount when not open', () => {
      const onOpenChangeComplete = vi.fn()
      render(OpenChangeComplete, { open: false, onOpenChangeComplete })
      expect(onOpenChangeComplete).not.toHaveBeenCalled()
    })

    describe('with a real animation', () => {
      beforeEach(() => {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      })

      it('is called on open when the enter animation finishes', async () => {
        const user = userEvent.setup()
        const onOpenChangeComplete = vi.fn()
        render(SelectAnimatedOpenChangeComplete, { open: false, onOpenChangeComplete })

        await user.click(screen.getByTestId('open-external'))

        await waitFor(() => expect(onOpenChangeComplete.mock.calls[0]?.[0]).toBe(true))
        expect(screen.queryByRole('listbox')).not.toBe(null)
      })

      it('is called on close when the exit animation finishes', async () => {
        const user = userEvent.setup()
        const onOpenChangeComplete = vi.fn()
        render(SelectAnimatedOpenChangeComplete, { open: true, onOpenChangeComplete })

        await waitFor(() => expect(onOpenChangeComplete.mock.calls[0]?.[0]).toBe(true))

        await user.click(screen.getByTestId('close-external'))

        await waitFor(() => expect(screen.queryByRole('listbox')).toBe(null))
        expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
      })

      it('keeps a scroll arrow mounted while its exit animation runs', async () => {
        let scrollTop = 0

        render(ScrollArrowExitAnimation)

        const list = screen.getByRole('listbox')
        Object.defineProperty(list, 'scrollTop', {
          configurable: true,
          get: () => scrollTop,
          set: (value: number) => {
            scrollTop = value
          }
        })
        Object.defineProperty(list, 'scrollHeight', { value: 100, configurable: true })
        Object.defineProperty(list, 'clientHeight', { value: 60, configurable: true })

        await fireEvent.scroll(list)

        await waitFor(() => {
          expect(screen.getByTestId('scroll-arrow')).toHaveAttribute('data-visible')
        })

        scrollTop = 40
        await fireEvent.scroll(list)

        await waitFor(() => {
          expect(screen.getByTestId('scroll-arrow')).toHaveAttribute('data-ending-style')
        })

        await waitFor(() => {
          expect(screen.queryByTestId('scroll-arrow')).toBe(null)
        })
      })
    })
  })

  describe('dynamic items', () => {
    it('skips null items when navigating', async () => {
      render(SelectFilterOnOpen)

      const trigger = screen.getByText('Toggle')
      trigger.focus()
      await fireEvent.keyDown(trigger, { key: 'ArrowDown' })

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBe(null)
      })

      const listbox = screen.getByRole('listbox')
      await waitFor(() => {
        expect(screen.queryByRole('option', { name: 'Add to Playlist' })).toBe(null)
      })

      await fireEvent.keyDown(listbox, { key: 'End' })

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Share' })).toHaveAttribute('data-highlighted')
      })
    })

    it('unselects the selected item if removed', async () => {
      const user = userEvent.setup()
      render(SelectDynamicItems, { value: 'a' })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)

      expect(screen.getByRole('option', { name: 'a' })).toHaveAttribute('data-selected')

      await fireEvent.click(screen.getByTestId('remove-a'))

      await waitFor(() => {
        expect(screen.getByTestId('value')).not.toHaveTextContent('a')
      })
    })

    it('resets to default when the selected item is removed from the list', async () => {
      const user = userEvent.setup()
      render(SelectDynamicItems, { value: 'b' })

      const trigger = screen.getByTestId('trigger')

      await user.click(trigger)
      const optionC = screen.getByRole('option', { name: 'c' })
      await user.pointer({ target: optionC })
      await user.click(optionC)
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())

      await user.click(screen.getByTestId('remove-c'))

      await waitFor(() => {
        expect(trigger).toHaveTextContent('b')
      })

      await user.click(trigger)
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'b' })).toHaveAttribute('data-selected', '')
      })
    })

    it('resets via onValueChange and does not break in controlled mode when the selected item is removed', async () => {
      const user = userEvent.setup()
      render(DynamicItems, { initialValue: 'c' })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveTextContent('c')

      await user.click(screen.getByTestId('remove-c'))

      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeVisible()
      })

      const options = await screen.findAllByRole('option')
      options.forEach((opt) => {
        expect(opt).not.toHaveAttribute('data-selected')
      })
    })

    it('falls back to null when both selected and initial default are removed (uncontrolled)', async () => {
      const user = userEvent.setup()
      render(DynamicItems, { initialValue: 'b' })

      const trigger = screen.getByTestId('trigger')

      await user.click(trigger)
      await user.click(screen.getByRole('option', { name: 'c' }))
      await waitFor(() => expect(screen.queryByRole('listbox')).toBe(null))

      await user.click(screen.getByTestId('remove-b'))
      await user.click(screen.getByTestId('remove-c'))

      await waitFor(() => {
        expect(screen.getByTestId('value')).toHaveTextContent('')
      })

      await user.click(trigger)
      const options = await screen.findAllByRole('option')
      options.forEach((opt) => {
        expect(opt).not.toHaveAttribute('data-selected')
      })
    })

    it('falls back to null when both selected and initial default are removed (controlled)', async () => {
      const user = userEvent.setup()
      render(DynamicItems, { initialValue: 'c' })

      await user.click(screen.getByTestId('remove-b'))
      await user.click(screen.getByTestId('remove-c'))

      await user.click(screen.getByTestId('trigger'))
      const options = await screen.findAllByRole('option')
      options.forEach((opt) => {
        expect(opt).not.toHaveAttribute('data-selected')
      })
    })
  })

  describe('browser autofill', () => {
    it('redirects focus to the trigger when the hidden input is focused', async () => {
      const { container } = render(AutofillPrimitive, { name: 'select' })

      const trigger = screen.getByTestId('trigger')
      hiddenInput(container).focus()

      await waitFor(() => {
        expect(trigger).toHaveFocus()
      })
    })

    it('handles browser autofill', async () => {
      const user = userEvent.setup()
      const { container } = render(AutofillPrimitive, { name: 'select' })

      const input = hiddenInput(container)
      expect(input).toHaveAttribute('name', 'select')
      await fireEvent.change(input, { target: { value: 'b' } })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'b' })).toHaveAttribute('data-selected', '')
      })
    })

    it('ignores browser autofill in multiple mode', async () => {
      const onValueChange = vi.fn()
      const { container } = render(AutofillPrimitive, {
        name: 'select',
        multiple: true,
        onValueChange
      })

      const input = hiddenInput(container)
      await fireEvent.change(input, { target: { value: 'b' } })

      expect(onValueChange).not.toHaveBeenCalled()
      expect(input.value).toBe('')
    })

    it('leaves the value untouched when autofill matches no item', async () => {
      const onValueChange = vi.fn()
      const { container } = render(AutofillPrimitive, { name: 'select', onValueChange })

      const input = hiddenInput(container)
      await fireEvent.change(input, { target: { value: 'nope' } })

      await waitFor(() => expect(input.value).toBe(''))
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('handles browser autofill with object values', async () => {
      const user = userEvent.setup()
      const { container } = render(AutofillObject, { name: 'country' })

      const input = hiddenInput(container)
      await fireEvent.change(input, { target: { value: 'CA' } })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toHaveAttribute('data-selected', '')
      })
    })

    it('handles browser autofill with object values when autofill uses the label', async () => {
      const user = userEvent.setup()
      const { container } = render(AutofillObject, { name: 'country' })

      const input = hiddenInput(container)
      await fireEvent.change(input, { target: { value: 'Canada' } })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toHaveAttribute('data-selected', '')
      })
    })

    it('matches browser autofill against a rendered label for primitive values regardless of case', async () => {
      const user = userEvent.setup()
      const { container } = render(AutofillPrimitive, {
        name: 'country',
        options: [
          { value: 'US', label: 'United States' },
          { value: 'CA', label: 'Canada' }
        ]
      })

      const input = hiddenInput(container)
      await fireEvent.change(input, { target: { value: 'canada' } })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toHaveAttribute('data-selected', '')
      })
    })

    it('matches browser autofill by serialized value before an earlier rendered label', async () => {
      const user = userEvent.setup()
      const { container } = render(AutofillPrimitive, {
        name: 'country',
        options: [
          { value: 'CA', label: 'US' },
          { value: 'US', label: 'United States' }
        ]
      })

      const input = hiddenInput(container)
      await fireEvent.change(input, { target: { value: 'US' } })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'United States' })).toHaveAttribute(
          'data-selected',
          ''
        )
      })
      expect(screen.getByRole('option', { name: 'US' })).not.toHaveAttribute('data-selected')
    })

    it('matches browser autofill when an earlier item has no rendered label', async () => {
      const user = userEvent.setup()
      const { container } = render(AutofillPrimitive, {
        name: 'country',
        options: [
          { value: 'US', label: null },
          { value: 'CA', label: 'Canada' }
        ]
      })

      const input = hiddenInput(container)
      await fireEvent.change(input, { target: { value: 'Canada' } })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toHaveAttribute('data-selected', '')
      })
    })

    it('marks the field dirty and validates after successful autofill', async () => {
      const validateSpy = vi.fn<FieldValidator>((value) => (value === 'CA' ? null : 'error'))
      const { container } = render(AutofillField, { validate: validateSpy })

      const trigger = screen.getByTestId('trigger')
      const input = hiddenInput(container)

      expect(trigger).not.toHaveAttribute('data-dirty')

      await fireEvent.change(input, { target: { value: 'CA' } })

      await waitFor(() => {
        expect(validateSpy).toHaveBeenCalled()
      })
      expect(validateSpy.mock.lastCall?.[0]).toBe('CA')
      expect(trigger).toHaveAttribute('data-dirty', '')
    })

    it('does not update field state when autofill is canceled', async () => {
      const { container } = render(AutofillCancel)

      const trigger = screen.getByTestId('trigger')
      const input = hiddenInput(container)

      expect(trigger).not.toHaveAttribute('data-dirty')
      expect(screen.getByTestId('error')).toHaveTextContent('server error')

      await fireEvent.change(input, { target: { value: 'CA' } })

      expect(trigger).not.toHaveAttribute('data-dirty')
      expect(screen.getByTestId('error')).toHaveTextContent('server error')
    })
  })

  describe('select inside popover', () => {
    it('does not bubble Escape from a non-modal select to the popover', async () => {
      const user = userEvent.setup()
      render(SelectInPopover, { selectModal: false })

      await user.click(screen.getByTestId('select-trigger'))
      await screen.findByRole('listbox')

      await user.keyboard('{Escape}')

      await waitFor(() => expect(screen.queryByRole('listbox')).toBe(null))
      expect(screen.queryByTestId('popover-popup')).not.toBe(null)
    })

    it('returns focus to the opener when a select is opened programmatically inside a popover', async () => {
      const user = userEvent.setup()
      render(SelectInPopover, { programmatic: true })

      const selectOpener = screen.getByRole('button', { name: 'Open select programmatically' })
      await user.click(selectOpener)

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBe(null))

      await user.click(screen.getByRole('option', { name: 'Two' }))

      await waitFor(() => expect(screen.queryByRole('listbox')).toBe(null))
      expect(selectOpener).toHaveFocus()
      expect(screen.queryByTestId('popover-popup')).not.toBe(null)
    })
  })

  describe('tabbing out', () => {
    it('does not leave a tabbable option after tabbing out', async () => {
      const user = userEvent.setup()
      render(TabOutSelect)

      await user.click(screen.getByRole('combobox'))

      const option = await screen.findByRole('option', { name: '1' })
      option.focus()
      await waitFor(() => expect(option).toHaveFocus())
      expect(option).toHaveAttribute('tabindex', '0')

      await user.tab()

      await waitFor(() => expect(screen.getByTestId('after')).toHaveFocus())
      expect(screen.getByTestId('popup')).not.toHaveAttribute('data-open')
      expect(option).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('programmatic value change', () => {
    it('does not force-mount the popup when the value is set programmatically', async () => {
      const user = userEvent.setup()
      render(SelectProgrammaticValue)

      expect(screen.queryAllByRole('listbox', { hidden: true })).toHaveLength(0)

      await user.click(screen.getByRole('button', { name: 'set' }))

      expect(screen.queryAllByRole('listbox', { hidden: true })).toHaveLength(0)
      expect(screen.getByTestId('items-value')).toHaveTextContent('Banana')
      expect(screen.getByTestId('plain-value')).toHaveTextContent('b')
    })
  })

  describe.skipIf(isJSDOM)('interaction type tracking', () => {
    it('keeps touch interaction type when reopening quickly after close', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      let nextFrameId = 0
      const frameCallbacks = new Map<number, FrameRequestCallback>()

      const requestAnimationFrameSpy = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((callback: FrameRequestCallback) => {
          nextFrameId += 1
          frameCallbacks.set(nextFrameId, callback)
          return nextFrameId
        })
      const cancelAnimationFrameSpy = vi
        .spyOn(window, 'cancelAnimationFrame')
        .mockImplementation((id: number) => {
          frameCallbacks.delete(id)
        })

      onTestFinished(() => {
        requestAnimationFrameSpy.mockRestore()
        cancelAnimationFrameSpy.mockRestore()
      })

      render(TouchReopen)

      const trigger = screen.getByRole('combobox')

      const isScrollLocked = () =>
        trigger.ownerDocument.documentElement.style.overflow === 'hidden' ||
        trigger.ownerDocument.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
        trigger.ownerDocument.body.style.overflow === 'hidden'

      function fireTouchPress() {
        fireEvent.pointerDown(trigger, { pointerType: 'touch' })
        fireEvent.mouseDown(trigger)
        fireEvent.click(trigger, { detail: 1 })
      }

      function flushAnimationFrames() {
        let iterations = 0
        while (frameCallbacks.size > 0) {
          if (iterations > 20) {
            throw new Error('Exceeded maximum animation frame flush iterations.')
          }

          const pending = Array.from(frameCallbacks.values())
          frameCallbacks.clear()
          pending.forEach((callback) => {
            callback(0)
          })
          iterations += 1
        }
      }

      fireTouchPress()
      flushAnimationFrames()

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBe(null)
      })

      fireTouchPress()
      flushAnimationFrames()

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
      })

      fireTouchPress()
      flushAnimationFrames()

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBe(null)
      })

      await new Promise((resolve) => setTimeout(resolve, 30))

      expect(isScrollLocked()).toBe(false)
    })

    it('keeps the touch open method through the close transition', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      onTestFinished(() => {})

      render(TouchExitArrows)

      const trigger = screen.getByTestId('trigger')

      function firePress(pointerType: 'mouse' | 'touch') {
        fireEvent.pointerDown(trigger, { pointerType })
        fireEvent.mouseDown(trigger)
        fireEvent.click(trigger, { detail: 1 })
      }

      firePress('mouse')
      await waitFor(() => {
        expect(screen.getByTestId('down-arrow')).toHaveAttribute('data-visible')
      })

      firePress('mouse')
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
      })

      firePress('touch')
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBe(null)
      })
      expect(screen.getByTestId('down-arrow')).not.toHaveAttribute('data-visible')

      firePress('touch')

      const popup = screen.getByTestId('down-arrow').parentElement as HTMLElement
      await waitFor(() => {
        expect(popup).toHaveAttribute('data-ending-style')
      })
      expect(screen.getByTestId('down-arrow')).not.toHaveAttribute('data-visible')
    })

    it('keeps the selected item highlighted when reopening after a touch-driven mouseleave', async () => {
      render(BasicSelect)

      const trigger = screen.getByRole('combobox')

      function fireTouchPress(element: HTMLElement) {
        fireEvent.pointerDown(element, { pointerType: 'touch' })
        fireEvent.mouseDown(element)
        fireEvent.click(element, { detail: 1 })
      }

      fireTouchPress(trigger)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })

      const optionB = screen.getByRole('option', { name: 'Option B' })
      fireEvent.pointerDown(optionB, { pointerType: 'touch' })
      fireEvent.click(optionB)
      fireEvent.mouseLeave(optionB, { clientX: -1, clientY: -1 })

      fireTouchPress(trigger)

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Option B' })).toHaveAttribute('data-highlighted')
      })
    })

    it('recomputes positioning before the popup becomes visible again after touch dismiss', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      onTestFinished(() => {})

      const onOpenChangeComplete = vi.fn()
      render(SelectTouchReposition, { onOpenChangeComplete })

      const trigger = screen.getByRole('combobox')
      const outside = screen.getByTestId('outside')

      await waitFor(() => {
        const gap = document.documentElement.clientHeight - trigger.getBoundingClientRect().bottom
        expect(Math.abs(gap - 100)).toBeLessThanOrEqual(1)
      })

      function fireTouchPress(element: HTMLElement) {
        fireEvent.pointerDown(element, { pointerType: 'touch' })
        fireEvent.mouseDown(element)
        fireEvent.click(element, { detail: 1 })
      }

      fireTouchPress(trigger)

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBe(null)
      })
      await waitFor(() => {
        expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'top')
      })

      fireEvent.pointerDown(outside, { pointerType: 'touch' })
      fireEvent.mouseDown(outside)

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(onOpenChangeComplete.mock.calls.some(([value]) => value === false)).toBe(true)
        expect(screen.getByTestId('positioner').style.opacity).toBe('0')
      })

      fireTouchPress(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('positioner').style.opacity).not.toBe('0')
      })

      expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'top')
      expect(screen.getByRole('listbox').getBoundingClientRect().height).toBeGreaterThan(200)
    })
  })

  describe.skipIf(isJSDOM)('touch scroll lock', () => {
    beforeEach(async () => {
      await waitFor(() => {
        const isScrollLocked =
          document.documentElement.style.overflow === 'hidden' ||
          document.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
          document.body.style.overflow === 'hidden'
        expect(isScrollLocked).toBe(false)
      })
    })

    it('applies scroll lock when a touch-opened popup covers the viewport width', async () => {
      render(ScrollLock, { wide: true })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.mouseDown(trigger)
      fireEvent.click(trigger, { detail: 1 })

      const popup = await screen.findByRole('listbox')
      const doc = popup.ownerDocument

      await waitFor(() => {
        const isScrollLocked =
          doc.documentElement.style.overflow === 'hidden' ||
          doc.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
          doc.body.style.overflow === 'hidden'
        expect(isScrollLocked).toBe(true)
      })
    })

    it('does not apply scroll lock when a touch-opened popup is narrower than the viewport', async () => {
      render(ScrollLock, { wide: false })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.mouseDown(trigger)
      fireEvent.click(trigger, { detail: 1 })

      const popup = await screen.findByRole('listbox')
      const doc = popup.ownerDocument

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

      const isScrollLocked =
        doc.documentElement.style.overflow === 'hidden' ||
        doc.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
        doc.body.style.overflow === 'hidden'
      expect(isScrollLocked).toBe(false)
    })
  })
})
