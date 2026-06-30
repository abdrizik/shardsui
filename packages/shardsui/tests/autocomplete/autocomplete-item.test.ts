import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import BasicAutocomplete from './fixtures/basic-autocomplete.svelte'
import ItemOnClick from './fixtures/item-on-click.svelte'

describe('<Autocomplete.Item />', () => {
  describe('prop: onClick', () => {
    it('calls onClick when clicked with a pointer', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(ItemOnClick, { items: ['apple', 'banana'], onItemClick: handleClick })

      const input = screen.getByTestId('input')
      await user.click(input)

      const option = screen.getByRole('option', { name: 'banana' })
      await user.click(option)

      expect(handleClick.mock.calls.length).toBe(1)
    })

    it('calls onClick when selected with Enter key (via root interaction)', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(ItemOnClick, { items: ['one', 'two'], onItemClick: handleClick })

      const input = screen.getByTestId('input')
      await user.click(input)
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeNull())

      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      expect(handleClick.mock.calls.length).toBe(1)
    })
  })

  it('does not expose data-selected when reopening after a value is chosen', async () => {
    const user = userEvent.setup()
    render(BasicAutocomplete, { openOnInputClick: true })

    const input = screen.getByRole<HTMLInputElement>('combobox')

    await user.click(input)
    await user.click(screen.getByRole('option', { name: 'Banana' }))
    await user.click(input)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Banana' })).not.toHaveAttribute('data-selected')
    })
  })
})
