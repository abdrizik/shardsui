import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicCombobox from './fixtures/basic-combobox.svelte'
import FieldCombobox from './fixtures/field-combobox.svelte'
import IdCombobox from './fixtures/id-combobox.svelte'
import StaticItemsTriggerCombobox from './fixtures/static-items-trigger-combobox.svelte'
import TriggerCancelOpen from './fixtures/trigger-cancel-open.svelte'
import TriggerCombobox from './fixtures/trigger-combobox.svelte'
import TriggerTextareaCombobox from './fixtures/trigger-textarea-combobox.svelte'
import ValueDisplayCombobox from './fixtures/value-display-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.Trigger />', () => {
  describe('prop: disabled', () => {
    it('renders disabled attribute when disabled', () => {
      render(TriggerCombobox, { disabled: true })
      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('disabled')
    })

    it('does not open the popup when disabled', async () => {
      const user = userEvent.setup()
      render(TriggerCombobox, { disabled: true })
      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('inherits disabled state from Field.Root', () => {
      render(FieldCombobox, { disabled: true })
      expect(screen.getByTestId('trigger')).toHaveAttribute('disabled')
    })

    it('stays disabled when the trigger sets disabled and the root does not', () => {
      render(TriggerCombobox, { disabled: false, triggerDisabled: true })
      expect(screen.getByTestId('trigger')).toHaveAttribute('disabled')
    })

    it('ignores keydown events on a disabled trigger rendered as a div', async () => {
      const handleOpenChange = vi.fn()
      render(TriggerCombobox, {
        triggerAs: 'div',
        triggerDisabled: true,
        inputInsidePopup: true,
        onOpenChange: handleOpenChange
      })

      const trigger = screen.getByTestId('trigger')
      await fireEvent.keyDown(trigger, { key: 'ArrowDown', code: 'ArrowDown' })

      expect(handleOpenChange.mock.calls.length).toBe(0)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('prop: readOnly', () => {
    it('opens popup when readOnly=false', async () => {
      const user = userEvent.setup()
      render(TriggerCombobox, { readOnly: false })
      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)
      expect(await screen.findByRole('listbox')).toBeInTheDocument()
    })

    it('does not open the popup when readOnly', async () => {
      const user = userEvent.setup()
      render(TriggerCombobox, { readOnly: true })
      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it.each(['ArrowDown', 'ArrowUp'])('does not open on %s when readOnly', async (key) => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()
      render(TriggerCombobox, {
        readOnly: true,
        inputInsidePopup: true,
        onOpenChange: handleOpenChange
      })

      const trigger = screen.getByTestId('trigger')
      trigger.focus()
      await user.keyboard(`{${key}}`)

      expect(handleOpenChange.mock.calls.length).toBe(0)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('validates the selected value when the trigger is blurred', () => {
    const validate = vi.fn()
    render(FieldCombobox, {
      inputInsidePopup: true,
      validationMode: 'onBlur',
      value: 'a',
      validate
    })

    const trigger = screen.getByTestId('trigger')
    fireEvent.focus(trigger)
    fireEvent.blur(trigger)

    expect(validate.mock.calls.length).toBe(1)
    expect(validate.mock.calls[0][0]).toBe('a')
  })

  describe('interaction behavior', () => {
    it('toggles the popup when enabled', async () => {
      const user = userEvent.setup()
      render(TriggerCombobox, {})
      const trigger = screen.getByTestId('trigger')

      await user.click(trigger)
      expect(await screen.findByRole('listbox')).toBeInTheDocument()

      await user.click(trigger)
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })

    it('calls onOpenChange when toggling', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()
      render(TriggerCombobox, { onOpenChange: handleOpenChange })
      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)
      await waitFor(() => {
        expect(handleOpenChange.mock.calls.length).toBeGreaterThan(0)
      })
      expect(handleOpenChange.mock.calls[0][0]).toBe(true)
    })

    it('does not open on ArrowDown/ArrowUp when reference is a textarea', async () => {
      const user = userEvent.setup()
      render(TriggerTextareaCombobox)

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      await user.keyboard('{ArrowDown}')
      expect(screen.queryByRole('listbox')).toBeNull()
      await user.keyboard('{ArrowUp}')
      expect(screen.queryByRole('listbox')).toBeNull()
    })
  })

  describe('cancel-open', () => {
    it('closes the popup when mouseup occurs outside the trigger bounds', async () => {
      render(TriggerCancelOpen)

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseDown(trigger, { button: 0 })
      fireEvent.click(trigger, { button: 0 })

      await screen.findByRole('listbox')

      fireEvent.mouseUp(document.body, { button: 0, clientX: 999, clientY: 999 })

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull()
      })
    })

    it('keeps the popup open when mouseup remains near the trigger bounds', async () => {
      render(TriggerCancelOpen)

      const trigger = screen.getByTestId('trigger')
      trigger.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          right: 100,
          bottom: 40,
          width: 100,
          height: 40,
          x: 0,
          y: 0,
          toJSON() {
            return {}
          }
        }) as DOMRect

      fireEvent.pointerDown(trigger, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseDown(trigger, { button: 0 })
      fireEvent.click(trigger, { button: 0 })

      const listbox = await screen.findByRole('listbox')

      fireEvent.mouseUp(document.body, { button: 0, clientX: 1, clientY: 1 })

      expect(listbox.isConnected).toBe(true)
    })

    it('closes the popup when the release is more than 5px outside the trigger bounds', async () => {
      render(TriggerCancelOpen)

      const trigger = screen.getByTestId('trigger')
      trigger.getBoundingClientRect = () =>
        DOMRect.fromRect({ x: 100, y: 100, width: 100, height: 40 })

      fireEvent.pointerDown(trigger, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseDown(trigger, { button: 0 })
      fireEvent.click(trigger, { button: 0 })

      await screen.findByRole('listbox')

      fireEvent.mouseUp(document.body, { button: 0, clientX: 94, clientY: 120 })

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull()
      })
    })

    it('ignores a pending mouseup after the trigger unmounts', async () => {
      const handleOpenChange = vi.fn()
      const { rerender } = render(TriggerCancelOpen, { onOpenChange: handleOpenChange })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseDown(trigger, { button: 0 })
      fireEvent.click(trigger, { button: 0 })

      await screen.findByRole('listbox')
      expect(handleOpenChange.mock.calls[0][0]).toBe(true)
      handleOpenChange.mockClear()

      await rerender({ showTrigger: false })

      fireEvent.mouseUp(document.body, { button: 0, clientX: 999, clientY: 999 })

      expect(handleOpenChange.mock.calls.length).toBe(0)
    })
  })

  describe('aria attributes', () => {
    it('sets tabIndex to -1 when input is outside popup (not main anchor)', () => {
      render(TriggerCombobox, {})
      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('tabindex', '-1')
    })

    it('sets aria-required when required and the input is inside the popup', async () => {
      render(TriggerCombobox, { inputInsidePopup: true, required: true, open: true })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      expect(screen.getByTestId('trigger')).toHaveAttribute('aria-required', 'true')
    })

    it('does not set aria-required when the input is outside the popup', () => {
      render(TriggerCombobox, { required: true })
      expect(screen.getByTestId('trigger')).not.toHaveAttribute('aria-required')
    })

    it('sets tabindex, aria-expanded and aria-haspopup when closed', () => {
      render(TriggerCombobox, { inputInsidePopup: true })
      const trigger = screen.getByTestId('trigger')

      expect(trigger).toHaveAttribute('tabindex', '0')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
      expect(trigger).not.toHaveAttribute('aria-controls')
    })

    it('points aria-controls at the dialog popup when open', async () => {
      const user = userEvent.setup()
      render(TriggerCombobox, { inputInsidePopup: true })
      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)

      await screen.findByRole('listbox')
      const popup = screen.getByRole('dialog')

      expect(trigger).toHaveAttribute('tabindex', '0')
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
      expect(popup.id).not.toBe('')
      expect(trigger).toHaveAttribute('aria-controls', popup.id)
    })
  })

  describe('data state attributes', () => {
    it('has data-placeholder when no value is selected', () => {
      render(TriggerCombobox, { inputInsidePopup: true })
      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('data-placeholder')
    })

    it('does not have data-placeholder when value is selected', () => {
      render(TriggerCombobox, { value: 'apple', inputInsidePopup: true })
      const trigger = screen.getByTestId('trigger')
      expect(trigger).not.toHaveAttribute('data-placeholder')
    })

    it('has data-placeholder when multiple mode has empty array', () => {
      render(TriggerCombobox, { multiple: true, inputInsidePopup: true, value: [] })
      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('data-placeholder')
    })

    it('does not have data-placeholder when multiple mode has a default value', () => {
      render(TriggerCombobox, { multiple: true, inputInsidePopup: true, value: ['apple'] })
      const trigger = screen.getByTestId('trigger')
      expect(trigger).not.toHaveAttribute('data-placeholder')
    })
  })

  describe('drag selection', () => {
    it('commits selection when mouseup occurs over highlighted item after mousemove', async () => {
      const handleValueChange = vi.fn()
      render(TriggerCombobox, { onValueChange: handleValueChange })
      const trigger = screen.getByTestId('trigger')

      fireEvent.click(trigger)
      await screen.findByRole('listbox')

      const option = screen.getByRole('option', { name: 'Banana' })

      const input = screen.getByTestId('input')
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      await waitFor(() => expect(option).toHaveAttribute('data-highlighted'))

      fireEvent.mouseUp(option, { button: 0 })

      await waitFor(() => {
        expect(handleValueChange.mock.calls.length).toBe(1)
        expect(handleValueChange.mock.calls[0][0]).toBe('banana')
      })
    })

    it('does not commit selection if the pointer never hovers the item', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      render(TriggerCombobox, { onValueChange: handleValueChange })
      const trigger = screen.getByTestId('trigger')

      await user.click(trigger)
      await screen.findByRole('listbox')
      const option = screen.getByRole('option', { name: 'Banana' })

      fireEvent.mouseUp(option, { button: 0 })

      await waitFor(() => {
        expect(handleValueChange.mock.calls.length).toBe(0)
      })
    })

    it('commits the selection when the pointer is released over a highlighted item', async () => {
      const handleValueChange = vi.fn()
      render(TriggerCombobox, { inputInsidePopup: true, onValueChange: handleValueChange })
      const trigger = screen.getByTestId('trigger')

      fireEvent.click(trigger)

      await screen.findByRole('listbox')
      const option = await screen.findByRole('option', { name: 'Banana' })

      fireEvent.mouseMove(option, { pointerType: 'mouse' })
      await waitFor(() => expect(option).toHaveAttribute('data-highlighted'))

      fireEvent.mouseUp(option, { button: 0 })

      await waitFor(() => expect(handleValueChange.mock.calls.length).toBe(1))
      expect(handleValueChange.mock.calls[0][0]).toBe('banana')
    })
  })

  describe('keyboard', () => {
    it('opens the popup when pressing ArrowDown', async () => {
      render(TriggerCombobox, { inputInsidePopup: true })
      const trigger = screen.getByTestId('trigger')
      trigger.focus()
      fireEvent.keyDown(trigger, { key: 'ArrowDown', code: 'ArrowDown' })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    })

    it.each(['ArrowDown', 'ArrowUp'])(
      'moves focus to the input outside the popup when opening with %s',
      async (key) => {
        const user = userEvent.setup()
        render(TriggerCombobox, {})
        const trigger = screen.getByTestId('trigger')
        trigger.focus()

        await user.keyboard(`{${key}}`)

        await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
        expect(screen.getByTestId('input')).toHaveFocus()
      }
    )

    it('opens the popup when pressing ArrowUp', async () => {
      render(TriggerCombobox, { inputInsidePopup: true })
      const trigger = screen.getByTestId('trigger')
      trigger.focus()
      fireEvent.keyDown(trigger, { key: 'ArrowUp', code: 'ArrowUp' })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    })
  })

  describe('typeahead while closed with an items prop', () => {
    it('selects an item when typing on the focused trigger', async () => {
      const user = userEvent.setup()
      render(ValueDisplayCombobox, { items: ['apple', 'banana', 'cherry'] })

      const trigger = screen.getByTestId('value')
      expect(trigger).not.toHaveTextContent('apple')

      trigger.focus()
      await user.keyboard('a')

      expect(trigger).toHaveTextContent('apple')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('selects an item when typing after the popup has been opened and closed', async () => {
      const user = userEvent.setup()
      render(ValueDisplayCombobox, { items: ['apple', 'banana', 'cherry'] })

      const trigger = screen.getByTestId('value')

      await user.click(trigger)
      await screen.findByRole('listbox')
      await user.keyboard('{Escape}')
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
      await waitFor(() => {
        expect(trigger).toHaveFocus()
      })

      await user.keyboard('b')

      await waitFor(() => {
        expect(trigger).toHaveTextContent('banana')
      })
    })
  })

  describe('typeahead while closed without an items prop', () => {
    it.each([false, true])(
      'cycles to the next matching item when typing after open/close (keepMounted %s)',
      async (keepMounted) => {
        const user = userEvent.setup()
        render(StaticItemsTriggerCombobox, { value: 'apple', keepMounted })

        const trigger = screen.getByTestId('trigger')

        await user.click(trigger)
        await screen.findByRole('listbox')
        await user.keyboard('{Escape}')
        await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
        await waitFor(() => expect(trigger).toHaveFocus())

        await user.keyboard('a')

        await waitFor(() => expect(trigger).toHaveTextContent('apricot'))
      }
    )

    it('cycles from the selected item after reordering items while closed', async () => {
      const user = userEvent.setup()
      const { rerender } = render(StaticItemsTriggerCombobox, { value: 'apple' })

      const trigger = screen.getByTestId('trigger')

      await user.click(trigger)
      await screen.findByRole('listbox')
      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
      await waitFor(() => expect(trigger).toHaveFocus())

      await rerender({ items: ['apricot', 'apple', 'banana'] })

      await user.keyboard('a')

      await waitFor(() => expect(trigger).toHaveTextContent('apricot'))
    })

    it('only matches mounted item labels when typing on the focused trigger', async () => {
      const user = userEvent.setup()
      const { rerender } = render(StaticItemsTriggerCombobox, {
        items: ['apple', 'banana', 'blueberry']
      })

      const trigger = screen.getByTestId('trigger')

      await user.click(trigger)
      await screen.findByRole('listbox')

      await rerender({ items: ['apple', 'blueberry'] })
      await waitFor(() => expect(screen.queryByRole('option', { name: 'banana' })).toBeNull())

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
      await waitFor(() => expect(trigger).toHaveFocus())

      await user.keyboard('b')

      await waitFor(() => expect(trigger).toHaveTextContent('blueberry'))
    })
  })

  describe('data-list-empty', () => {
    it('sets data-list-empty on the trigger when the list has no items', async () => {
      const user = userEvent.setup()
      render(TriggerCombobox, { inputInsidePopup: true, items: [] })
      const trigger = screen.getByTestId('trigger')

      await user.click(trigger)

      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      expect(trigger).toHaveAttribute('data-list-empty')
    })

    it.skipIf(isJSDOM)('reflects the resolved popup side on the trigger while open', async () => {
      const user = userEvent.setup()
      render(TriggerCombobox, { inputInsidePopup: true, items: ['apple'], side: 'right' })
      const trigger = screen.getByTestId('trigger')
      expect(trigger).not.toHaveAttribute('data-popup-side')

      await user.click(trigger)

      await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument())
      expect(trigger).toHaveAttribute('data-popup-side', 'right')

      await user.click(document.body)

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
      expect(trigger).not.toHaveAttribute('data-popup-side')
    })
  })

  describe('custom popup id', () => {
    it('points aria-controls at an explicit popup id', () => {
      render(IdCombobox, { open: true, inputInsidePopup: true, popupId: 'custom-popup-id' })

      const trigger = screen.getByTestId('trigger')
      const popup = screen.getByRole('dialog')

      expect(popup.id).toBe('custom-popup-id')
      expect(trigger).toHaveAttribute('aria-controls', 'custom-popup-id')
    })
  })

  describe('forwarded handlers', () => {
    it('calls onpointerdown alongside the internal handler', async () => {
      const handlePointerDown = vi.fn()
      render(BasicCombobox, { withTrigger: true, onTriggerPointerDown: handlePointerDown })

      await fireEvent.pointerDown(screen.getByTestId('trigger'))

      expect(handlePointerDown.mock.calls.length).toBe(1)
    })
  })
})
