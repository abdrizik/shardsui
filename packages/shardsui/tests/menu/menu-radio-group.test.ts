import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import MenuWithRadioItems from './fixtures/menu-with-radio-items.svelte'

describe('<Menu.RadioGroup />', () => {
  it('renders a div with the group role', async () => {
    const user = userEvent.setup()
    render(MenuWithRadioItems)
    await user.click(screen.getByRole('button', { name: 'Open' }))

    expect(screen.getByRole('group')).toBeInTheDocument()
  })
})
