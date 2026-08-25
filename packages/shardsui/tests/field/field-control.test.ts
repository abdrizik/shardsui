import { Field, type FieldValidator } from '$lib/components/field'
import { fireEvent, render, screen } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import PrefilledRequired from './fixtures/prefilled-required.svelte'
import PreventedChangeField from './fixtures/prevented-change-field.svelte'
import ValidatedField from './fixtures/validated-field.svelte'

describe('<Field.Control />', () => {
  it('renders a textarea element when as="textarea"', () => {
    render(Field.Control, { as: 'textarea' })
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
  })

  it('validates once when changed by the user', async () => {
    const validate = vi.fn<FieldValidator>(() => null)
    render(ValidatedField, { validate, validationMode: 'onChange' })

    await fireEvent.input(screen.getByTestId('control'), { target: { value: 'a' } })

    expect(validate).toHaveBeenCalledTimes(1)
    expect(validate.mock.lastCall?.[0]).toBe('a')
  })

  it('does not clear errors or validate when change is prevented', async () => {
    const validate = vi.fn(() => null)
    const onValueChange = vi.fn()
    render(PreventedChangeField, { validate, onValueChange })

    const control = screen.getByTestId('control')
    control.addEventListener('input', (event) => event.preventDefault(), {
      capture: true,
      once: true
    })

    await fireEvent.input(control, { cancelable: true, target: { value: 'a' } })

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(validate).not.toHaveBeenCalled()
    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('shows a required error when a prefilled value is cleared', async () => {
    render(PrefilledRequired)
    const control = screen.getByTestId('control')

    await fireEvent.input(control, { target: { value: '' } })

    expect(control).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Required')).toBeInTheDocument()
  })
})
