import { Fieldset } from '$lib/components/fieldset'
import { fireEvent, render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import BasicFieldset from './fixtures/basic-fieldset.svelte'
import LegendAssociation from './fixtures/legend-association.svelte'

describe('<Fieldset.Legend />', () => {
  it('updates and clears the legend association', async () => {
    render(LegendAssociation)

    expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', 'legend-a')

    await fireEvent.click(screen.getByRole('button', { name: 'Change id' }))
    expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', 'legend-b')

    await fireEvent.click(screen.getByRole('button', { name: 'Remove legend' }))
    expect(screen.getByRole('group')).not.toHaveAttribute('aria-labelledby')
  })

  it('renders the element specified by the as prop', () => {
    render(BasicFieldset, { as: 'span', 'data-testid': 'legend' })
    expect(screen.getByTestId('legend').tagName).toBe('SPAN')
  })

  it('sets aria-labelledby on the fieldset pointing to the legend id', () => {
    render(BasicFieldset)
    const legendId = screen.getByText('My Legend').id
    expect(legendId).toBeTruthy()
    expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', legendId)
  })

  it('sets aria-labelledby with a custom legend id', () => {
    render(BasicFieldset, { id: 'legend-id' })
    expect(screen.getByText('My Legend')).toHaveAttribute('id', 'legend-id')
    expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', 'legend-id')
  })

  it('throws a descriptive error when rendered outside <Fieldset.Root>', () => {
    expect(() => render(Fieldset.Legend)).toThrow(
      'ShardsUI: this part must be rendered inside <Fieldset.Root>.'
    )
  })

  it('does not set `aria-labelledby` when legend is absent', () => {
    render(Fieldset.Root, { 'data-testid': 'fieldset' })
    expect(screen.getByTestId('fieldset')).not.toHaveAttribute('aria-labelledby')
  })
})
