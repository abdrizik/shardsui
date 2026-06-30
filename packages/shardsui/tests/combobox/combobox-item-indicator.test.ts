import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import ItemIndicatorCombobox from './fixtures/item-indicator-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.ItemIndicator />', () => {
  it('updates a mounted indicator when its item becomes unselected', async () => {
    const user = userEvent.setup()
    render(ItemIndicatorCombobox)

    expect(screen.getByTestId('apple-indicator')).toHaveAttribute('data-selected')

    await user.click(screen.getByRole('option', { name: 'banana' }))

    await waitFor(() =>
      expect(screen.getByTestId('apple-indicator')).not.toHaveAttribute('data-selected')
    )
  })
})
