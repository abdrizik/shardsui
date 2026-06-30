import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicCombobox from './fixtures/basic-combobox.svelte'
import Chips from './fixtures/chips.svelte'
import ComboboxWithClear from './fixtures/combobox-with-clear.svelte'
import CompositionItemsCombobox from './fixtures/composition-items-combobox.svelte'
import ControlledInputValue from './fixtures/controlled-input-value.svelte'
import EscapeAnimationCombobox from './fixtures/escape-animation-combobox.svelte'
import FieldCombobox from './fixtures/field-combobox.svelte'
import FilteredCombobox from './fixtures/filtered-combobox.svelte'
import InlineCombobox from './fixtures/inline-combobox.svelte'
import InlineInputOnly from './fixtures/inline-input-only.svelte'
import InlineRemovableItems from './fixtures/inline-removable-items.svelte'
import ItemsCombobox from './fixtures/items-combobox.svelte'
import MultipleCombobox from './fixtures/multiple-combobox.svelte'
import NumberInputChips from './fixtures/number-input-chips.svelte'
import TabOutCombobox from './fixtures/tab-out-combobox.svelte'
import TriggerCombobox from './fixtures/trigger-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.Input />', () => {
  describe('prop: disabled', () => {
    it('renders disabled attribute when disabled', () => {
      render(BasicCombobox, { inputDisabled: true })
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('disabled')
    })

    it('inherits disabled state from Combobox.Root', () => {
      render(BasicCombobox, { disabled: true })
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('disabled')
    })

    it('inherits disabled state from Field.Root', () => {
      render(FieldCombobox, { disabled: true })
      expect(screen.getByTestId('input')).toHaveAttribute('disabled')
    })

    it('does not open the popup when disabled', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { disabled: true })
      const input = screen.getByRole('combobox')
      await user.click(input)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('prevents keyboard interactions when disabled', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { disabled: true })
      const input = screen.getByRole('combobox')
      await user.type(input, 'a')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('stays disabled when the input sets disabled and the root does not', () => {
      render(BasicCombobox, { disabled: false, inputDisabled: true })
      expect(screen.getByRole('combobox')).toHaveAttribute('disabled')
    })
  })

  describe('prop: readOnly', () => {
    it('renders aria-readonly and readonly attributes when readOnly', () => {
      render(BasicCombobox, { readOnly: true })
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('aria-readonly', 'true')
      expect(input).toHaveAttribute('readonly')
    })

    it('does not open the popup when readOnly via click', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { readOnly: true })
      const input = screen.getByRole('combobox')
      await user.click(input)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('prevents keyboard interactions when readOnly', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { readOnly: true })
      const input = screen.getByRole('combobox')
      await user.type(input, 'a')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('allows interactions when readOnly=false', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { readOnly: false })
      const input = screen.getByRole('combobox')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    })
  })

  describe('prop: required', () => {
    it('sets aria-required attribute when required', () => {
      render(BasicCombobox, { required: true })
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('interaction behavior', () => {
    it('typing in input opens the popup', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, {})
      const input = screen.getByRole('combobox')
      await user.type(input, 'a')
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    it('clicking the input opens the popup', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, {})
      const input = screen.getByRole('combobox')
      await user.click(input)
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    it('clears the selected value when the input text is cleared', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { value: 'apple' })
      const input = screen.getByRole('combobox') as HTMLInputElement

      expect(input.value).toBe('apple')

      await user.clear(input)
      expect(input.value).toBe('')

      await user.type(input, 'a')
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      for (const option of screen.getAllByRole('option')) {
        expect(option).not.toHaveAttribute('aria-selected', 'true')
      }
    })

    it('clears a closed multiple value on Escape and stops propagation', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      const handleOuterKeyDown = vi.fn()

      const { container } = render(MultipleCombobox, {
        value: ['apple'],
        onValueChange: handleValueChange
      })
      container.parentElement?.addEventListener('keydown', handleOuterKeyDown)

      screen.getByTestId('input').focus()
      await user.keyboard('{Escape}')

      expect(handleValueChange.mock.calls.length).toBe(1)
      expect(handleValueChange.mock.calls[0][0]).toEqual([])
      expect(handleOuterKeyDown.mock.calls.length).toBe(0)
    })

    it('lets Escape propagate when a closed multiple value is already empty', async () => {
      const user = userEvent.setup()
      const handleOuterKeyDown = vi.fn()

      const { container } = render(MultipleCombobox, { value: [] })
      container.parentElement?.addEventListener('keydown', handleOuterKeyDown)

      screen.getByTestId('input').focus()
      await user.keyboard('{Escape}')

      expect(handleOuterKeyDown.mock.calls.length).toBe(1)
    })

    it.skipIf(isJSDOM)(
      'does not clear the value on Escape while the popup is still mounted',
      async () => {
        const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

        try {
          const user = userEvent.setup()
          const handleValueChange = vi.fn()

          render(EscapeAnimationCombobox, { onValueChange: handleValueChange })

          screen.getByTestId('input').focus()
          await user.keyboard('{Escape}')

          const popup = screen.getByTestId('popup')
          await waitFor(() => expect(popup).toHaveAttribute('data-ending-style'))

          await user.keyboard('{Escape}')

          expect(handleValueChange.mock.calls.length).toBe(0)
        } finally {
          globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
        }
      }
    )

    it('pressing Home moves caret to start', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, {})
      const input = screen.getByRole('combobox') as HTMLInputElement

      input.focus()
      await user.type(input, 'banana')
      expect(input.value).toBe('banana')

      await user.keyboard('{Home}')

      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(0)
    })

    it('pressing End moves caret to end', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, {})
      const input = screen.getByRole('combobox') as HTMLInputElement

      input.focus()
      await user.type(input, 'apple')
      expect(input.value).toBe('apple')

      await user.keyboard('{End}')

      expect(input.selectionStart).toBe(input.value.length)
      expect(input.selectionEnd).toBe(input.value.length)
    })

    it('lets Escape propagate from a closed inline combobox', async () => {
      const user = userEvent.setup()
      const handleOuterKeyDown = vi.fn()

      const { container } = render(InlineInputOnly)
      container.parentElement?.addEventListener('keydown', handleOuterKeyDown)

      screen.getByTestId('input').focus()
      await user.keyboard('{Escape}')

      expect(handleOuterKeyDown.mock.calls.length).toBe(1)
    })

    it('keeps the popup open after modified keyboard navigation', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { open: true })

      const input = screen.getByTestId('input')
      input.focus()

      await user.keyboard('{Control>}{ArrowDown}{/Control}')

      expect(screen.getByRole('listbox')).not.toBeNull()
    })

    it('closes the popup when tabbing out', async () => {
      const user = userEvent.setup()
      render(TabOutCombobox, {})
      const input = screen.getByTestId('input')

      await user.click(input)
      await screen.findByRole('listbox')

      await user.tab()

      expect(screen.getByTestId('button')).toHaveFocus()
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    })
  })

  describe('aria attributes', () => {
    it('sets all aria attributes on the input when closed', () => {
      render(BasicCombobox, {})
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('role', 'combobox')
      expect(input).toHaveAttribute('aria-expanded', 'false')
      expect(input).toHaveAttribute('aria-autocomplete', 'list')
      expect(input).toHaveAttribute('aria-haspopup', 'listbox')
      expect(input).not.toHaveAttribute('aria-controls')
      expect(input).not.toHaveAttribute('aria-activedescendant')
    })

    it('sets all aria attributes on the input when open', () => {
      render(BasicCombobox, { open: true })
      const input = screen.getByRole('combobox')
      const listbox = screen.getByRole('listbox')
      expect(input).toHaveAttribute('role', 'combobox')
      expect(input).toHaveAttribute('aria-expanded', 'true')
      expect(input).toHaveAttribute('aria-autocomplete', 'list')
      expect(input).toHaveAttribute('aria-haspopup', 'listbox')
      expect(input).toHaveAttribute('aria-controls', listbox.id)
      expect(input).not.toHaveAttribute('aria-activedescendant')
    })

    it('sets aria-activedescendant when item is highlighted', async () => {
      render(BasicCombobox, {})
      const input = screen.getByRole('combobox')

      fireEvent.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      expect(input).not.toHaveAttribute('aria-activedescendant')

      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })

      await waitFor(() => {
        const first = screen.getByRole('option', { name: 'Apple' })
        expect(input).toHaveAttribute('aria-activedescendant', first.id)
      })
    })
  })

  describe('data state attributes', () => {
    it('toggles data-list-empty when the filtered list is empty', async () => {
      const user = userEvent.setup()
      render(FilteredCombobox, {})
      const input = screen.getByRole('combobox')
      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      await user.type(input, 'zzz')
      await waitFor(() => {
        expect(input).toHaveAttribute('data-list-empty')
      })
    })
  })

  describe('initial input value derivation', () => {
    it("input shows the selected value's label when value is set without inputValue", () => {
      render(BasicCombobox, { value: 'apple' })
      expect(screen.getByRole('combobox')).toHaveValue('apple')
    })

    it('inputValue sets initial input value', () => {
      render(BasicCombobox, { value: 'apple', inputValue: 'x' })
      expect(screen.getByRole('combobox')).toHaveValue('x')
    })

    it('multiple mode initial input remains empty', () => {
      render(MultipleCombobox, {})
      const inputs = screen.getAllByRole('combobox')
      const inputElement = inputs.find((el) => el.tagName === 'INPUT') as HTMLInputElement
      expect(inputElement).toBeTruthy()
      expect(inputElement!.value).toBe('')
    })

    it('derives the input from the value on first mount when items carry labels', () => {
      const items = [{ value: 'apple', label: 'Apple' }]
      render(ItemsCombobox, { items, value: items[0] })
      expect(screen.getByRole('combobox')).toHaveValue('Apple')
    })

    it('leaves the input empty for the input-inside-popup pattern', () => {
      render(TriggerCombobox, { open: true, inputInsidePopup: true, value: 'apple' })
      expect(screen.getByTestId('input')).toHaveValue('')
    })
  })

  describe('multiple selection with chips', () => {
    it('removes the last rendered chip when pressing Backspace in an empty input', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      render(Chips, {
        value: ['apple', 'banana', 'cherry'],
        chips: ['apple', 'banana'],
        onValueChange: handleValueChange
      })

      await user.click(screen.getByTestId('input'))
      await user.keyboard('{Backspace}')

      expect(handleValueChange.mock.calls.length).toBe(1)
      expect(handleValueChange.mock.calls[0][0]).toEqual(['apple', 'cherry'])
    })

    it('removes the last selected value when no chips are rendered', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      render(Chips, {
        value: ['apple', 'banana'],
        chips: [],
        onValueChange: handleValueChange
      })

      await user.click(screen.getByTestId('input'))
      await user.keyboard('{Backspace}')

      expect(handleValueChange.mock.calls.length).toBe(1)
      expect(handleValueChange.mock.calls[0][0]).toEqual(['apple'])
    })

    it('reflects disabled across input, chip and remove and blocks Backspace deletion', async () => {
      const user = userEvent.setup()
      render(Chips, {
        value: ['apple'],
        chips: ['apple'],
        disabled: true,
        withRemove: true
      })

      const input = screen.getByTestId('input')
      const chip = screen.getByTestId('chip-apple')
      const remove = screen.getByTestId('remove-apple')

      expect(input).toHaveAttribute('disabled')
      expect(chip).toHaveAttribute('aria-disabled', 'true')
      expect(remove).toHaveAttribute('aria-disabled', 'true')

      input.focus()
      await user.keyboard('{Backspace}')
      expect(screen.getByTestId('chip-apple')).not.toBeNull()
    })

    it('reflects aria-readonly across input and chip and blocks Backspace deletion', async () => {
      const user = userEvent.setup()
      render(Chips, {
        value: ['apple'],
        chips: ['apple'],
        readOnly: true,
        withRemove: true
      })

      const input = screen.getByTestId('input')
      const chip = screen.getByTestId('chip-apple')

      expect(input).toHaveAttribute('aria-readonly', 'true')
      expect(chip).toHaveAttribute('aria-readonly', 'true')

      input.focus()
      await user.keyboard('{Backspace}')
      expect(screen.getByTestId('chip-apple')).not.toBeNull()
    })

    it('navigates an existing chip highlight when focus returns to the input', async () => {
      const user = userEvent.setup()
      render(Chips, {
        value: ['apple', 'banana', 'cherry'],
        chips: ['apple', 'banana', 'cherry'],
        withPopup: false
      })

      const input = screen.getByTestId('input') as HTMLInputElement
      const apple = screen.getByTestId('chip-apple')
      const banana = screen.getByTestId('chip-banana')
      const cherry = screen.getByTestId('chip-cherry')

      input.focus()
      input.setSelectionRange(0, 0)
      await user.keyboard('{ArrowLeft}')
      expect(cherry).toHaveFocus()

      input.focus()
      await user.keyboard('{ArrowLeft}')
      expect(banana).toHaveFocus()

      input.focus()
      await user.keyboard('{ArrowRight}')
      expect(cherry).toHaveFocus()

      input.focus()
      await user.keyboard('{ArrowRight}')
      expect(input).toHaveFocus()

      input.setSelectionRange(0, 0)
      await user.keyboard('{ArrowLeft}')
      input.focus()
      await user.keyboard('{ArrowLeft}')
      input.focus()
      await user.keyboard('{ArrowLeft}')
      expect(apple).toHaveFocus()

      input.focus()
      await user.keyboard('{ArrowLeft}')
      expect(input).toHaveFocus()

      input.setSelectionRange(0, 0)
      await user.keyboard('{ArrowLeft}')
      input.focus()
      await user.keyboard('{Delete}')
      expect(banana).toHaveFocus()

      input.focus()
      await user.keyboard('{Backspace}')
      expect(banana).toHaveFocus()

      input.focus()
      await user.keyboard('x')
      expect(input).toHaveValue('x')
    })

    it('keeps focus on the input when navigating toward chips but none are rendered', async () => {
      const user = userEvent.setup()
      render(Chips, { value: ['apple'], chips: [], withPopup: false })

      const input = screen.getByTestId('input') as HTMLInputElement
      input.focus()
      input.setSelectionRange(0, 0)
      await user.keyboard('{ArrowLeft}')

      expect(input).toHaveFocus()
    })

    it('treats a null selectionStart as the beginning of a custom input', async () => {
      const user = userEvent.setup()
      render(NumberInputChips)

      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(input.selectionStart).toBe(null)

      input.focus()
      await user.keyboard('{ArrowLeft}')

      expect(screen.getByTestId('chip')).toHaveFocus()
    })
  })

  describe('Escape cycling with Clear present', () => {
    it('clears, restores selected value, then clears again on repeated Escape', async () => {
      const user = userEvent.setup()
      render(ComboboxWithClear, { value: 'apple' })
      const input = screen.getByTestId('input') as HTMLInputElement

      input.focus()
      await user.keyboard('{Escape}')
      await waitFor(() => expect(input.value).toBe(''))

      await user.type(input, 'a')
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())
      await user.click(screen.getByRole('option', { name: 'Apple' }))

      await user.type(input, 'a')
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.keyboard('{Escape}')
      await waitFor(() => expect(input.value).toBe('apple'))
      expect(screen.queryByRole('listbox')).toBeNull()

      await user.keyboard('{Escape}')
      await waitFor(() => expect(input.value).toBe(''))
    })
  })

  describe('controlled caret position', () => {
    it('preserves caret position when controlled and inserting in the middle', async () => {
      const user = userEvent.setup()
      render(ControlledInputValue)
      const input = screen.getByTestId('input') as HTMLInputElement

      await user.type(input, 'abcd')
      expect(input.value).toBe('abcd')

      await user.keyboard('{ArrowLeft}{ArrowLeft}')
      expect(input.selectionStart).toBe(2)

      await user.keyboard('xxx')
      expect(input.value).toBe('abxxxcd')
      expect(input.selectionStart).toBe(5)

      await user.keyboard('y')
      expect(input.value).toBe('abxxxycd')
      expect(input.selectionStart).toBe(6)
    })
  })

  describe('prop: as', () => {
    it('renders as a textarea without an invalid type attribute and stays editable', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { as: 'textarea' })

      const input = screen.getByTestId('input') as HTMLTextAreaElement
      expect(input.tagName).toBe('TEXTAREA')
      expect(input).not.toHaveAttribute('type')

      await user.type(input, 'app')
      expect(input.value).toBe('app')
    })
  })

  describe('Home/End on an overflowing input', () => {
    it.skipIf(isJSDOM)('scrolls the input to the start and to the end', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { inputStyle: 'width: 64px; font-size: 20px' })

      const input = screen.getByRole('combobox') as HTMLInputElement
      input.focus()

      await user.type(input, 'this is a very long combobox value')

      expect(input.scrollWidth).toBeGreaterThan(input.clientWidth)

      const expectedScroll = input.scrollWidth - input.clientWidth

      expect(expectedScroll).toBeGreaterThan(0)

      input.scrollLeft = expectedScroll
      input.setSelectionRange(input.value.length, input.value.length)

      await user.keyboard('{Home}')
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(0)
      expect(input.scrollLeft).toBe(0)

      await user.keyboard('{End}')
      expect(input.selectionStart).toBe(input.value.length)
      expect(input.selectionEnd).toBe(input.value.length)
      expect(Math.abs(input.scrollLeft - expectedScroll)).toBeLessThanOrEqual(2)
    })
  })

  describe('data-popup-side', () => {
    it.skipIf(isJSDOM)('reflects the resolved popup side only while open', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, { side: 'right' })

      const input = screen.getByRole('combobox')
      expect(input).not.toHaveAttribute('data-popup-side')

      await user.click(input)

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeNull())
      expect(input).toHaveAttribute('data-popup-side', 'right')

      await user.click(document.body)

      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
      expect(input).not.toHaveAttribute('data-popup-side')
    })
  })

  describe('input value synchronization', () => {
    it('updates the derived input when the value changes externally', async () => {
      const items = [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' }
      ]

      const { rerender } = render(ItemsCombobox, { items, value: items[0] })

      const input = screen.getByRole('combobox')
      expect(input).toHaveValue('Apple')

      await rerender({ items, value: items[1] })

      expect(input).toHaveValue('Banana')
    })

    it('re-derives the input when the items array changes', async () => {
      const initialItems = [
        { value: 'a', label: 'Apple' },
        { value: 'b', label: 'Banana' }
      ]

      const { rerender } = render(ItemsCombobox, { items: initialItems, value: initialItems[0] })

      const input = screen.getByRole('combobox')
      expect(input).toHaveValue('Apple')

      const nextItems = [
        { value: 'a', label: 'Apricot' },
        { value: 'b', label: 'Banana' },
        { value: 'c', label: 'Cherry' }
      ]

      await rerender({ items: nextItems, value: nextItems[0] })
      expect(input).toHaveValue('Apricot')

      const sameLengthDifferentItems = [
        { value: 'a', label: 'Ambrosia' },
        { value: 'b', label: 'Blue Java' },
        { value: 'c', label: 'Clementine' }
      ]

      await rerender({ items: sameLengthDifferentItems, value: sameLengthDifferentItems[0] })
      expect(input).toHaveValue('Ambrosia')
    })

    it('keeps the derived input while the items load asynchronously', async () => {
      const { rerender } = render(ItemsCombobox, { items: [], value: 'banana' })

      const input = screen.getByRole('combobox')
      expect(input).toHaveValue('banana')

      await rerender({ items: ['apple', 'banana', 'bread'], value: 'banana' })
      expect(input).toHaveValue('banana')

      await rerender({ items: ['banana'], value: 'banana' })
      expect(input).toHaveValue('banana')
    })
  })

  describe('IME composition', () => {
    it('returns virtual focus to the input when composition starts typing', async () => {
      const user = userEvent.setup()
      render(BasicCombobox, {})
      const input = screen.getByTestId('input') as HTMLInputElement

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'))

      await fireEvent.compositionStart(input)
      input.value = 'a'
      await fireEvent.input(input, { inputType: 'insertCompositionText' })

      await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'))
    })

    it('does not select an item for an IME keydown without a highlight', async () => {
      const onValueChange = vi.fn()
      render(BasicCombobox, { open: true, onValueChange })

      const input = screen.getByTestId('input')
      input.focus()
      await fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

      expect(onValueChange.mock.calls.length).toBe(0)
      expect(screen.getByTestId('popup')).toBeInTheDocument()
    })

    it('closes on an empty composition update when input clicks do not open the popup', async () => {
      render(CompositionItemsCombobox, {
        open: true,
        inputValue: 'x',
        openOnInputClick: false
      })

      const input = screen.getByTestId('input') as HTMLInputElement
      await fireEvent.compositionStart(input)
      input.value = ''
      await fireEvent.input(input)

      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    })

    it('clears the highlight on an empty composition update while staying open', async () => {
      const user = userEvent.setup()
      render(CompositionItemsCombobox, { open: true, inputValue: 'x' })

      const input = screen.getByTestId('input') as HTMLInputElement
      input.focus()
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'))

      await fireEvent.compositionStart(input)
      input.value = ''
      await fireEvent.input(input)

      expect(screen.getByRole('listbox')).not.toBeNull()
      await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'))
    })
  })

  describe('forwarded handlers', () => {
    it('calls oncompositionstart alongside the internal handler', async () => {
      const handleCompositionStart = vi.fn()
      render(BasicCombobox, { onInputCompositionStart: handleCompositionStart })

      await fireEvent.compositionStart(screen.getByTestId('input'))

      expect(handleCompositionStart.mock.calls.length).toBe(1)
    })
  })

  describe('inline', () => {
    it('sets aria-expanded on the input when rendered inline and open', async () => {
      render(InlineCombobox, { open: true })

      const input = screen.getByTestId('input')
      const listbox = screen.getByRole('listbox')

      expect(input).toHaveAttribute('role', 'combobox')
      expect(input).toHaveAttribute('aria-expanded', 'true')
      expect(input).toHaveAttribute('aria-controls', listbox.id)
      expect(input).toHaveAttribute('aria-haspopup', 'listbox')
      expect(input).toHaveAttribute('aria-autocomplete', 'list')
    })

    it('sets the popup type on the input when rendered inline as a grid', async () => {
      render(InlineCombobox, { open: true, grid: true })

      const input = screen.getByTestId('input')
      const grid = screen.getByRole('grid')

      expect(input).toHaveAttribute('aria-expanded', 'true')
      expect(input).toHaveAttribute('aria-haspopup', 'grid')
      expect(input).toHaveAttribute('aria-controls', grid.id)
    })

    it('keeps the input expanded when rendered inline without the open prop', async () => {
      const user = userEvent.setup()
      render(InlineCombobox, {})

      const input = screen.getByTestId('input')
      const listbox = screen.getByRole('listbox')

      expect(input).toHaveAttribute('aria-expanded', 'true')
      expect(input).toHaveAttribute('aria-controls', listbox.id)

      await user.click(input)

      expect(input).toHaveAttribute('aria-expanded', 'true')
      expect(input).toHaveAttribute('aria-controls', listbox.id)
    })

    it('does not restore an inline highlight after the highlighted slot is removed', async () => {
      const user = userEvent.setup()
      render(InlineRemovableItems)

      const input = screen.getByTestId('input')
      input.focus()
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'))

      await user.click(screen.getByRole('button', { name: 'remove items' }))
      await user.click(input)

      await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'))
    })
  })
})
