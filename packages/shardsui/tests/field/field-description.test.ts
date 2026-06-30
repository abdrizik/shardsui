import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import DescribedBy from './fixtures/described-by.svelte'
import EmptyDescriptionId from './fixtures/empty-description-id.svelte'
import FullField from './fixtures/full-field.svelte'
import ItemParts from './fixtures/item-parts.svelte'

describe('<Field.Description />', () => {
  it('sets aria-describedby on the control automatically', () => {
    render(FullField, {})
    const control = screen.getByTestId('control')
    const describedBy = control.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(describedBy).toContain(screen.getByTestId('description').getAttribute('id'))
  })

  it('preserves user aria-describedby values on the control', () => {
    render(DescribedBy)
    const description = screen.getByText('Message')
    expect(screen.getByRole('textbox').getAttribute('aria-describedby')).toBe(
      `external-description ${description.id}`
    )
  })

  it('does not register an empty description id', () => {
    render(EmptyDescriptionId)

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'external-description')
  })

  it('reflects the disabled state from Field.Item', () => {
    render(ItemParts)
    expect(screen.getByTestId('description')).toHaveAttribute('data-disabled')
  })
})
