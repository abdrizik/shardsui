import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import MenuWithGroups from './fixtures/menu-with-groups.svelte'

describe('<Menu.Group />', () => {
  it('renders a div with the group role', async () => {
    const user = userEvent.setup()
    render(MenuWithGroups)
    await user.click(screen.getByRole('button', { name: 'Open' }))

    expect(screen.getByTestId('group-1')).toHaveAttribute('role', 'group')
  })
})
