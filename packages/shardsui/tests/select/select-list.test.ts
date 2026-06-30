import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import SelectWithList from './fixtures/select-with-list.svelte'

describe('<Select.List />', () => {
  it('places aria attributes on Select.List instead if it is present', async () => {
    const user = userEvent.setup()
    render(SelectWithList)

    const trigger = screen.getByRole('combobox')

    expect(trigger).not.toHaveAttribute('aria-controls')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')

    await user.click(trigger)

    const popup = await screen.findByTestId('popup')
    const list = await screen.findByTestId('list')
    const listbox = await screen.findByRole('listbox')

    expect(list).toBe(listbox)
    expect(list).toHaveAttribute('aria-multiselectable')
    expect(popup).toHaveAttribute('role', 'presentation')
    expect(popup).not.toHaveAttribute('aria-multiselectable')
    expect(list.id).not.toBe('')
    expect(trigger).toHaveAttribute('aria-controls', list.id)
    expect(trigger.getAttribute('aria-controls')).not.toBe(popup.id)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})
