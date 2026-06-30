import { Fieldset } from '$lib/components/fieldset'
import { fireEvent, render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import BasicFieldset from './fixtures/basic-fieldset.svelte'
import NestedDisabledPrecedence from './fixtures/nested-disabled-precedence.svelte'
import NestedFieldsets from './fixtures/nested-fieldsets.svelte'

describe('<Fieldset.Root />', () => {
  it('updates nested disabled precedence in both directions', async () => {
    render(NestedDisabledPrecedence)

    expect(screen.getByTestId('control')).toBeDisabled()
    expect(screen.getByTestId('root')).toHaveAttribute('data-disabled')

    await fireEvent.click(screen.getByRole('button', { name: 'Disable outer' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Enable inner' }))
    expect(screen.getByTestId('control')).toBeDisabled()
    expect(screen.getByTestId('root')).toHaveAttribute('data-disabled')

    await fireEvent.click(screen.getByRole('button', { name: 'Enable outer' }))
    expect(screen.getByTestId('control')).not.toBeDisabled()
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-disabled')
  })

  it('renders the element specified by the as prop', () => {
    render(Fieldset.Root, { as: 'div', 'data-testid': 'fs' })
    expect(screen.getByTestId('fs').tagName).toBe('DIV')
  })

  it('sets the native disabled attribute', () => {
    render(BasicFieldset, { disabled: true })
    expect(screen.getByRole('group')).toHaveAttribute('disabled')
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('keeps nested fieldsets disabled when an ancestor fieldset is disabled', () => {
    render(NestedFieldsets)
    expect(screen.getByTestId('control')).toHaveAttribute('disabled')
  })
})
