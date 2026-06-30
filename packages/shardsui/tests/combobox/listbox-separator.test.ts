import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import ListboxSeparators from './fixtures/listbox-separators.svelte'

describe('listbox separator', () => {
  it.each(['Autocomplete.Separator', 'Combobox.Separator', 'Select.Separator'])(
    '%s exposes the listbox separator behavior',
    async (testid) => {
      render(ListboxSeparators)

      const separator = screen.getByTestId(testid)
      expect(separator).toHaveAttribute('role', 'presentation')
      expect(separator).toHaveAttribute('data-orientation', 'horizontal')
      expect(separator).not.toHaveAttribute('aria-orientation')
    }
  )

  it.each(['horizontal', 'vertical'] as const)('reflects the %s orientation', (orientation) => {
    render(ListboxSeparators, { orientation })

    const separator = screen.getByTestId('Combobox.Separator')
    expect(separator).toHaveAttribute('data-orientation', orientation)
    expect(separator).not.toHaveAttribute('aria-orientation')
  })
})
