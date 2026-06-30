import { render, screen } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import ComboboxWithGroups from './fixtures/combobox-with-groups.svelte'
import GroupLabelOutsideGroup from './fixtures/group-label-outside-group.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.Group />', () => {
  it('renders the group with its label', () => {
    render(ComboboxWithGroups, { open: true })

    expect(screen.getByTestId('group-fruits')).toHaveAttribute('aria-labelledby')
    expect(screen.getByTestId('group-label-fruits')).toHaveTextContent('Fruits')
  })

  it('associates the label with the group', () => {
    render(ComboboxWithGroups, { open: true })

    const group = screen.getByTestId('group-fruits')
    const label = screen.getByTestId('group-label-fruits')

    expect(group).toHaveAttribute('aria-labelledby', label.id)
  })

  it('throws a descriptive error when a group part is rendered outside <Combobox.Group>', () => {
    expect(() => render(GroupLabelOutsideGroup)).toThrow(
      'ShardsUI: this part must be rendered inside <Combobox.Group>.'
    )
  })
})
