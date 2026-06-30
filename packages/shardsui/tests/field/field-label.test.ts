import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import BasicField from './fixtures/basic-field.svelte'
import DynamicIdField from './fixtures/dynamic-id-field.svelte'
import FieldControlSwap from './fixtures/field-control-swap.svelte'
import ItemParts from './fixtures/item-parts.svelte'
import RemoveControlId from './fixtures/remove-control-id.svelte'
import SpanLabelField from './fixtures/span-label-field.svelte'

describe('<Field.Label />', () => {
  it('sets `for` referencing the control automatically', () => {
    render(BasicField, {})
    const labelFor = screen.getByText('My Label').getAttribute('for')
    expect(labelFor).toBeTruthy()
    expect(labelFor).toBe(screen.getByRole('textbox').getAttribute('id'))
  })

  it('updates `for` when the control id changes', async () => {
    const { rerender } = render(DynamicIdField, { controlId: 'control-a' })
    const label = screen.getByTestId('label')
    expect(label).toHaveAttribute('for', 'control-a')

    await rerender({ controlId: 'control-b' })

    await waitFor(() => {
      expect(label).toHaveAttribute('for', 'control-b')
    })
  })

  it('updates `for` when one control replaces another', async () => {
    const { rerender } = render(FieldControlSwap, { which: 'a' })
    expect(screen.getByTestId('label')).toHaveAttribute('for', 'control-a')

    await rerender({ which: 'b' })
    expect(screen.getByTestId('label')).toHaveAttribute('for', 'control-b')
  })

  it('falls back to a generated id when the control id is removed', async () => {
    render(RemoveControlId)
    const label = screen.getByTestId('label')
    const control = screen.getByTestId('control')

    expect(label).toHaveAttribute('for', 'control-a')
    expect(control).toHaveAttribute('id', 'control-a')

    await fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

    await waitFor(() => {
      const updatedId = screen.getByTestId('control').getAttribute('id') ?? ''
      expect(updatedId).not.toBe('control-a')
    })
    const updatedId = screen.getByTestId('control').getAttribute('id') ?? ''
    expect(updatedId).not.toBe('')
    expect(label).toHaveAttribute('for', updatedId)
  })

  it('when as="span", clicking focuses the associated control', async () => {
    const user = userEvent.setup()
    render(SpanLabelField)

    await user.click(screen.getByTestId('label'))
    expect(screen.getByTestId('control')).toHaveFocus()
  })

  it('reflects the disabled state from Field.Item', () => {
    render(ItemParts)
    expect(screen.getByTestId('label')).toHaveAttribute('data-disabled')
  })
})
