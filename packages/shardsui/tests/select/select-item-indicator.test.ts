import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ItemIndicatorDeselect from './fixtures/item-indicator-deselect.svelte'

describe('<Select.ItemIndicator />', () => {
  it('settles out of its transition state after the item is deselected', async () => {
    const user = userEvent.setup()
    render(ItemIndicatorDeselect)

    const indicator = screen.getByTestId('indicator')
    expect(indicator).toHaveAttribute('data-selected')

    await user.click(screen.getByRole('option', { name: 'a' }))

    await waitFor(() => {
      expect(indicator).not.toHaveAttribute('data-selected')
    })

    await waitFor(() => {
      expect(indicator).not.toHaveAttribute('data-ending-style')
    })
  })
})
