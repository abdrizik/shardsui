import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicSelect from './fixtures/basic-select.svelte'
import ControlledSelect from './fixtures/controlled-select.svelte'
import MultipleSelect from './fixtures/multiple-select.svelte'
import SelectPositionerSide from './fixtures/select-positioner-side.svelte'
import SelectTriggerTabindex from './fixtures/select-trigger-tabindex.svelte'
import SelectValuePlaceholder from './fixtures/select-value-placeholder.svelte'
import ToolbarSelectTabindex from './fixtures/toolbar-select-tabindex.svelte'
import TriggerOutsideRoot from './fixtures/trigger-outside-root.svelte'

describe('<Select.Trigger />', () => {
  it('throws a descriptive error when rendered outside <Select.Root>', () => {
    expect(() => render(TriggerOutsideRoot)).toThrow(/Select\.Root/)
  })

  it('keeps a non-aligned popup open when focus lands on the trigger', async () => {
    const onOpenChange = vi.fn()
    render(BasicSelect, { open: true, onOpenChange })

    const trigger = screen.getByRole('combobox')

    await fireEvent.focus(trigger)

    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  describe('disabled state', () => {
    it('cannot be focused when disabled', async () => {
      const user = userEvent.setup()
      render(BasicSelect, { value: 'b', disabled: true })

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('data-disabled')

      await user.keyboard('{Tab}')

      expect(document.activeElement).not.toBe(trigger)
    })

    it('does not toggle the popup when disabled', async () => {
      const onOpenChange = vi.fn()
      render(BasicSelect, { value: 'b', disabled: true, onOpenChange })

      const trigger = screen.getByRole('combobox')
      await fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBe(null)
      })
      expect(onOpenChange).not.toHaveBeenCalled()
    })
  })

  describe('placeholder state', () => {
    it('has data-placeholder when the value is null', () => {
      render(ControlledSelect, { value: null })
      expect(screen.getByRole('combobox')).toHaveAttribute('data-placeholder')
      expect(screen.getByTestId('value')).toHaveAttribute('data-placeholder')
    })

    it('has data-placeholder when a custom value serializes to empty via itemToStringValue', () => {
      render(SelectValuePlaceholder, {
        value: { id: '', name: 'Default' },
        itemToStringValue: (item: { id: string }) => item.id,
        itemToStringLabel: (item: { name: string }) => item.name
      } as unknown as Record<string, unknown>)

      const trigger = screen.getByTestId('trigger')
      const value = screen.getByTestId('value')
      expect(trigger).toHaveAttribute('data-placeholder')
      expect(value).toHaveAttribute('data-placeholder')
    })

    it('has data-placeholder and shows the null-item label for items with { value: null }', () => {
      const fonts = [{ label: 'Select font', value: null }]
      render(SelectValuePlaceholder, { items: fonts, placeholder: undefined })

      const trigger = screen.getByTestId('trigger')
      const value = screen.getByTestId('value')
      expect(trigger).toHaveAttribute('data-placeholder')
      expect(value).toHaveAttribute('data-placeholder')
      expect(value.textContent).toBe('Select font')
    })

    it('does not have data-placeholder when a non-empty value is provided', () => {
      render(SelectValuePlaceholder, { value: 'a' })
      const trigger = screen.getByTestId('trigger')
      const value = screen.getByTestId('value')
      expect(trigger).not.toHaveAttribute('data-placeholder')
      expect(value).not.toHaveAttribute('data-placeholder')
    })

    it('does not have data-placeholder when multiple mode has a default value', () => {
      render(MultipleSelect, { value: ['a'] })
      expect(screen.getByTestId('trigger')).not.toHaveAttribute('data-placeholder')
      expect(screen.getByTestId('value')).not.toHaveAttribute('data-placeholder')
    })
  })

  describe('style hooks', () => {
    it.skipIf(isJSDOM)('sets data-popup-side to the current popup side', async () => {
      const user = userEvent.setup()
      render(SelectPositionerSide, { side: 'right' })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).not.toHaveAttribute('data-popup-side')

      await user.click(trigger)

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBe(null))
      expect(trigger).toHaveAttribute('data-popup-side', 'right')

      await user.click(document.body)

      await waitFor(() => expect(screen.queryByRole('listbox')).toBe(null))
      expect(trigger).not.toHaveAttribute('data-popup-side')
    })

    it('has the data-popup-open and data-pressed attributes when open', async () => {
      const user = userEvent.setup()
      render(BasicSelect)

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-popup-open')
      })
      expect(trigger).toHaveAttribute('data-pressed')
    })
  })

  describe('prop: required', () => {
    it('sets aria-required when required', () => {
      render(BasicSelect, { required: true })
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('prop: tabindex', () => {
    it('respects a user `tabindex` outside a toolbar', async () => {
      render(SelectTriggerTabindex)

      const trigger = screen.getByTestId('trigger')
      await waitFor(() => {
        expect(trigger).toHaveAttribute('tabindex', '-1')
      })
      expect(trigger.tabIndex).toBe(-1)
    })

    it('lets the toolbar composite own the roving `tabindex`', async () => {
      const user = userEvent.setup()
      render(ToolbarSelectTabindex)

      const trigger = screen.getByTestId('trigger')
      await waitFor(() => {
        expect(trigger).toHaveAttribute('tabindex', '-1')
      })
      expect(screen.getByTestId('btn-before')).toHaveAttribute('tabindex', '0')

      await user.tab()
      await user.keyboard('{ArrowRight}')

      await waitFor(() => {
        expect(trigger).toHaveAttribute('tabindex', '0')
      })
      expect(screen.getByTestId('btn-before')).toHaveAttribute('tabindex', '-1')
    })
  })
})
