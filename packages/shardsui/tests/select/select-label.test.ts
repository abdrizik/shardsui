import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import BasicSelect from './fixtures/basic-select.svelte'
import SelectWithLabel from './fixtures/select-with-label.svelte'

describe('<Select.Label />', () => {
  it('labels the trigger', () => {
    render(SelectWithLabel)
    const label = screen.getByTestId('label')
    expect(label.id).not.toBe('')
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-labelledby', label.id)
  })

  it('does not set fallback aria-labelledby when no label is rendered', () => {
    render(BasicSelect)
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-labelledby')
  })

  it('focuses the trigger without opening', async () => {
    const user = userEvent.setup()
    render(SelectWithLabel)

    await user.click(screen.getByTestId('label'))

    expect(screen.getByTestId('trigger')).toHaveFocus()
    expect(screen.queryByRole('listbox')).toBe(null)
  })
})
