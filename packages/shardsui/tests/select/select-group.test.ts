import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import SelectWithGroups from './fixtures/select-with-groups.svelte'

describe('<Select.Group />', () => {
  it('renders groups with their labels', async () => {
    const user = userEvent.setup()
    render(SelectWithGroups)

    await user.click(screen.getByRole('combobox'))

    const groups = screen.getAllByRole('group')
    expect(groups).toHaveLength(2)
    expect(groups[0]).toHaveAccessibleName('Fruits')
    expect(groups[1]).toHaveAccessibleName('Vegetables')
  })

  it('associates each label with its group', async () => {
    const user = userEvent.setup()
    render(SelectWithGroups)

    await user.click(screen.getByRole('combobox'))

    const groups = screen.getAllByRole('group')
    expect(groups[0]).toHaveAttribute('aria-labelledby', screen.getByText('Fruits').id)
    expect(groups[1]).toHaveAttribute('aria-labelledby', screen.getByText('Vegetables').id)
  })
})
