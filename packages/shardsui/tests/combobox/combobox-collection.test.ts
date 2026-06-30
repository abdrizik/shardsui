import { render, screen } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import CollectionCombobox from './fixtures/collection-combobox.svelte'
import CollectionEmptyGroup from './fixtures/collection-empty-group.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.Collection />', () => {
  it('renders one item per entry of the filtered list', () => {
    render(CollectionCombobox, { open: true, items: ['alpha', 'beta', 'alpine'] })

    expect(screen.getByTestId('item-alpha')).toBeInTheDocument()
    expect(screen.getByTestId('item-beta')).toBeInTheDocument()
    expect(screen.getByTestId('item-alpine')).toBeInTheDocument()
  })

  it('renders items that serialize identically', () => {
    render(CollectionCombobox, { open: true, items: ['alpha', 'alpha', 'beta'] })

    expect(screen.getAllByTestId('item-alpha')).toHaveLength(2)
    expect(screen.getByTestId('item-beta')).toBeInTheDocument()
  })

  it('renders nothing when a nested group does not provide items', () => {
    render(CollectionEmptyGroup)

    expect(screen.getByTestId('group').children).toHaveLength(0)
  })
})
