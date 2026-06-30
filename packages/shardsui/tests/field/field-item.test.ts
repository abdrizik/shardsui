import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import FieldItemCheckbox from './fixtures/field-item-checkbox.svelte'
import FieldItemRadio from './fixtures/field-item-radio.svelte'
import ItemParts from './fixtures/item-parts.svelte'

describe('<Field.Item />', () => {
  describe('prop: disabled', () => {
    it('reflects disabled state on the item', () => {
      render(ItemParts)
      expect(screen.getByTestId('item')).toHaveAttribute('data-disabled')
    })

    it('disables a wrapped checkbox', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(FieldItemCheckbox, { onValueChange })

      const [checkbox1, checkbox2] = screen.getAllByRole('checkbox')
      await user.click(checkbox1)
      expect(onValueChange.mock.calls.length).toBe(0)
      await user.click(checkbox2)
      expect(onValueChange.mock.calls.length).toBe(1)
    })

    it('disables a wrapped radio', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(FieldItemRadio, { onValueChange })

      const [radio1, radio2] = screen.getAllByRole('radio')
      await user.click(radio1)
      expect(onValueChange.mock.calls.length).toBe(0)
      await user.click(radio2)
      expect(onValueChange.mock.calls.length).toBe(1)
    })
  })
})
