import { Form } from '$lib/components/form'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import AsyncErrorsForm from './fixtures/async-errors-form.svelte'
import BasicForm from './fixtures/basic-form.svelte'
import ControlTakeoverForm from './fixtures/control-takeover-form.svelte'
import DisabledControlToggleForm from './fixtures/disabled-control-toggle-form.svelte'
import DisabledFieldsetForm from './fixtures/disabled-fieldset-form.svelte'
import DisabledFieldsetToggleForm from './fixtures/disabled-fieldset-toggle-form.svelte'
import InvalidPropForm from './fixtures/invalid-prop-form.svelte'
import MixedValidationForm from './fixtures/mixed-validation-form.svelte'
import OnFormSubmitInvalidForm from './fixtures/on-form-submit-invalid-form.svelte'
import PendingValidatorForm from './fixtures/pending-validator-form.svelte'
import ReorderedFieldsForm from './fixtures/reordered-fields-form.svelte'
import RequiredCheckboxesForm from './fixtures/required-checkboxes-form.svelte'
import RequiredForm from './fixtures/required-form.svelte'
import SameNameSwitchForm from './fixtures/same-name-switch-form.svelte'
import ServerErrorsForm from './fixtures/server-errors-form.svelte'
import StaleErrorsForm from './fixtures/stale-errors-form.svelte'
import SubmitForm from './fixtures/submit-form.svelte'
import UnmountFieldForm from './fixtures/unmount-field-form.svelte'
import UnnamedSwitchForm from './fixtures/unnamed-switch-form.svelte'
import ValidateAfterFormErrorForm from './fixtures/validate-after-form-error-form.svelte'
import ValidateForm from './fixtures/validate-form.svelte'
import ValidateTargetForm from './fixtures/validate-target-form.svelte'

describe('<Form />', () => {
  it('blocks submit and focuses the first invalid field across custom and native validation', async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    const select = vi.spyOn(HTMLInputElement.prototype, 'select')

    try {
      render(MixedValidationForm, { onFormSubmit })

      await user.click(screen.getByRole('button', { name: 'Submit' }))

      expect(onFormSubmit).not.toHaveBeenCalled()
      expect(screen.getByTestId('custom')).toHaveFocus()
      expect(select).toHaveBeenCalledTimes(1)
    } finally {
      select.mockRestore()
    }
  })

  it('keeps focusing the first invalid field after a control value changes', async () => {
    const user = userEvent.setup()
    render(RequiredCheckboxesForm)

    const checkboxA = screen.getByTestId('a')
    const submit = screen.getByRole('button', { name: 'Submit' })

    await user.click(submit)
    expect(checkboxA).toHaveFocus()

    await user.click(checkboxA)
    await user.click(checkboxA)

    await user.click(submit)
    expect(checkboxA).toHaveFocus()
  })

  it('focuses the first invalid field in document order when keyed fields are reordered', async () => {
    const user = userEvent.setup()
    render(ReorderedFieldsForm)

    await user.click(screen.getByRole('button', { name: 'Reorder' }))
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByTestId('b')).toHaveFocus()
  })

  it('prop: as renders a custom element', () => {
    const { container } = render(Form, { as: 'section' })
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('section')
  })

  it('does not submit if there are errors', async () => {
    const user = userEvent.setup()
    const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    render(RequiredForm, { onsubmit })

    await user.click(screen.getByRole('button'))

    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(onsubmit).not.toHaveBeenCalled()
  })

  it('submits when a valid async validator is pending', async () => {
    const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    const validate = vi.fn(() => new Promise<null>(() => {}))
    render(PendingValidatorForm, { validate, onsubmit })

    await fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(validate).toHaveBeenCalledTimes(1)
    expect(onsubmit).toHaveBeenCalledTimes(1)
  })

  it('does not submit if an unnamed registered field control is invalid', async () => {
    const user = userEvent.setup()
    const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    render(UnnamedSwitchForm, { onsubmit })

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onsubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByTestId('error')).toBeInTheDocument()
  })

  it('clears invalid state for an unnamed registered field control on change', async () => {
    const user = userEvent.setup()
    const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    render(UnnamedSwitchForm, { onsubmit })

    const submit = screen.getByRole('button', { name: 'Submit' })
    const switchControl = screen.getByRole('switch')

    await user.click(submit)

    expect(onsubmit).not.toHaveBeenCalled()
    expect(switchControl).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByTestId('error')).toBeInTheDocument()

    await user.click(switchControl)

    expect(switchControl).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByTestId('error')).toBe(null)

    await user.click(submit)

    expect(onsubmit).toHaveBeenCalledTimes(1)
  })

  it('keeps same-name field validity scoped on submit', async () => {
    const user = userEvent.setup()
    const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    render(SameNameSwitchForm, { onsubmit })

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onsubmit).not.toHaveBeenCalled()
    expect(screen.getByTestId('first')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByTestId('first-error')).toBeInTheDocument()
    expect(screen.getByTestId('second')).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByTestId('second-error')).toBe(null)
  })

  it('removes the previous registered field id when another control takes over', async () => {
    const user = userEvent.setup()
    const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    render(ControlTakeoverForm, { onsubmit })

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onsubmit).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('error')).toBe(null)
    expect(screen.getByTestId('first')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByTestId('second')).not.toHaveAttribute('aria-invalid')
  })

  it('removes unmounted fields from the form', async () => {
    const user = userEvent.setup()
    const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    render(UnmountFieldForm, { onsubmit })

    const submit = screen.getByText('Submit')

    await user.click(submit)
    expect(onsubmit).not.toHaveBeenCalled()
    expect(screen.getByTestId('email')).toHaveAttribute('aria-invalid', 'true')

    await user.click(screen.getByRole('checkbox'))
    await user.click(submit)
    expect(onsubmit).toHaveBeenCalledTimes(1)
  })

  it('excludes disabled fieldset fields from validation and onFormSubmit values', async () => {
    const onFormSubmit = vi.fn()
    render(DisabledFieldsetForm, { onFormSubmit })

    await fireEvent.click(screen.getByTestId('submit'))

    expect(onFormSubmit).toHaveBeenCalledTimes(1)
    expect(onFormSubmit.mock.calls[0][0]).toEqual({ enabled: 'sent' })
    expect(screen.getByTestId('disabled')).not.toHaveAttribute('aria-invalid')
  })

  it('clears invalid UI when a fieldset field becomes disabled', async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(DisabledFieldsetToggleForm, { onFormSubmit })

    await user.click(screen.getByTestId('submit'))

    expect(onFormSubmit).not.toHaveBeenCalled()
    expect(screen.getByTestId('control')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByTestId('error')).toBeInTheDocument()

    await user.click(screen.getByTestId('disable'))

    expect(screen.getByTestId('control')).toBeDisabled()
    expect(screen.getByTestId('control')).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByTestId('error')).toBeNull()

    await user.click(screen.getByTestId('submit'))

    expect(onFormSubmit).toHaveBeenCalledTimes(1)
    expect(onFormSubmit.mock.calls[0][0]).toEqual({})
  })

  it('clears invalid attributes when a field control becomes disabled', async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(DisabledControlToggleForm, { onFormSubmit })

    await user.click(screen.getByTestId('submit'))

    expect(screen.getByTestId('control')).toHaveAttribute('aria-invalid', 'true')

    await user.click(screen.getByTestId('disable'))

    expect(screen.getByTestId('control')).toBeDisabled()
    expect(screen.getByTestId('control')).not.toHaveAttribute('aria-invalid')

    await user.click(screen.getByTestId('submit'))

    expect(onFormSubmit).toHaveBeenCalledTimes(1)
    expect(onFormSubmit.mock.calls[0][0]).toEqual({})
  })

  it('re-registers field controls when they become enabled again', async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(DisabledControlToggleForm, { onFormSubmit })

    const submit = screen.getByTestId('submit')

    await user.click(submit)

    expect(onFormSubmit).not.toHaveBeenCalled()
    expect(screen.getByTestId('control')).toHaveAttribute('aria-invalid', 'true')

    await user.click(screen.getByTestId('disable'))
    await user.click(submit)

    expect(onFormSubmit).toHaveBeenCalledTimes(1)
    expect(onFormSubmit.mock.calls[0][0]).toEqual({})

    await user.click(screen.getByTestId('enable'))
    await user.click(submit)

    expect(onFormSubmit).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('control')).toHaveAttribute('aria-invalid', 'true')

    await user.type(screen.getByTestId('control'), 'sent')
    await user.click(submit)

    expect(onFormSubmit).toHaveBeenCalledTimes(2)
    expect(onFormSubmit.mock.calls[1][0]).toEqual({ control: 'sent' })
  })

  it('does not submit when invalid prop remains true even if validate returns null', async () => {
    const user = userEvent.setup()
    const onsubmit = vi.fn()
    const validate = vi.fn(() => null)
    render(InvalidPropForm, { validate, validationMode: 'onChange', onsubmit })

    const input = screen.getByTestId('name')
    await user.click(input)
    await user.keyboard('o')

    expect(validate.mock.calls.length).toBe(1)

    await user.click(screen.getByText('submit'))

    expect(onsubmit).not.toHaveBeenCalled()
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  describe('prop: errors', () => {
    it('marks Field.Control as invalid and populates Field.Error', () => {
      render(BasicForm, { errors: { name: 'Name is required' } })

      expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required')
      expect(screen.getByTestId('name')).toHaveAttribute('aria-invalid', 'true')
    })

    it('does not mark Field.Control as invalid when no error is provided', () => {
      render(BasicForm)

      expect(screen.queryByTestId('name-error')).toBe(null)
      expect(screen.getByTestId('name')).not.toHaveAttribute('aria-invalid')
    })

    it('focuses asynchronously replaced external errors and clears only the changed own property', async () => {
      const user = userEvent.setup()
      render(AsyncErrorsForm)

      await user.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => expect(screen.getByTestId('first')).toHaveFocus())
      expect(screen.getByTestId('first-error')).toHaveTextContent('First error')
      expect(screen.getByTestId('second-error')).toHaveTextContent('Second error')

      await user.type(screen.getByTestId('first'), 'a')

      expect(screen.queryByTestId('first-error')).toBe(null)
      expect(screen.getByTestId('second-error')).toHaveTextContent('Second error')
    })

    it('focuses the first invalid field only on submit', async () => {
      const user = userEvent.setup()
      render(ServerErrorsForm)

      const submit = screen.getByRole('button')
      const name = screen.getByTestId('name')
      const age = screen.getByTestId('age')

      await user.click(submit)
      await waitFor(() => expect(name).toHaveFocus())

      fireEvent.input(name, { target: { value: 'John' } })
      expect(age).not.toHaveFocus()

      await user.click(submit)
      await waitFor(() => expect(age).toHaveFocus())

      fireEvent.input(age, { target: { value: '42' } })

      await user.click(submit)
      expect(age).not.toHaveFocus()
    })

    it('does not swap focus immediately on change after two submissions', async () => {
      const user = userEvent.setup()
      render(ServerErrorsForm)

      const submit = screen.getByRole('button')
      const name = screen.getByTestId('name')
      const age = screen.getByTestId('age')

      await user.click(submit)
      await waitFor(() => expect(name).toHaveFocus())

      await user.click(submit)

      fireEvent.input(name, { target: { value: 'John' } })
      expect(age).not.toHaveFocus()
    })

    it('removes errors upon change', async () => {
      render(ServerErrorsForm)

      const name = screen.getByTestId('name')
      const age = screen.getByTestId('age')

      await fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => expect(screen.queryByTestId('name-error')).toBeInTheDocument())
      await waitFor(() => expect(screen.queryByTestId('age-error')).toBeInTheDocument())

      await fireEvent.input(name, { target: { value: 'John' } })
      await fireEvent.input(age, { target: { value: '42' } })
      await waitFor(() => expect(screen.queryByTestId('name-error')).not.toBeInTheDocument())
      await waitFor(() => expect(screen.queryByTestId('age-error')).not.toBeInTheDocument())
    })

    it('keeps a cleared error cleared when an unrelated Form prop changes', async () => {
      const errors = { name: 'Server error' }
      const { rerender } = render(StaleErrorsForm, { errors, onFormSubmit: () => {} })

      const name = screen.getByTestId('name')
      expect(screen.getByTestId('name-error')).toHaveTextContent('Server error')

      await fireEvent.input(name, { target: { value: 'John' } })
      await waitFor(() => expect(screen.queryByTestId('name-error')).not.toBeInTheDocument())

      await rerender({ errors, onFormSubmit: () => {} })

      expect(screen.queryByTestId('name-error')).not.toBeInTheDocument()
      expect(name).not.toHaveAttribute('aria-invalid')
    })

    it('runs field validation on first change after Form error is set', async () => {
      const user = userEvent.setup()
      const validate = vi.fn((value: unknown) => (value === 'abcd' ? 'field error' : null))
      render(ValidateAfterFormErrorForm, { validate })

      const input = screen.getByTestId('name')
      await user.click(input)
      await user.keyboard('abcde')
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      expect(screen.getByTestId('name-error')).toHaveTextContent('submit error')

      validate.mockClear()

      await user.click(input)
      await user.keyboard('{Backspace}')
      expect(validate.mock.calls.length).toBe(1)
      expect(screen.getByTestId('name-error')).toHaveTextContent('field error')
    })

    it('runs field validation on change when invalid prop is true and validationMode is onChange', async () => {
      const user = userEvent.setup()
      const validate = vi.fn(() => 'field error')
      render(InvalidPropForm, { validate, validationMode: 'onChange' })

      const input = screen.getByTestId('name')
      expect(screen.getByTestId('name-error')).toHaveTextContent('server error')

      await user.click(input)
      await user.keyboard('a')

      expect(validate.mock.calls.length).toBe(1)
      expect(screen.getByTestId('name-error')).toHaveTextContent('field error')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('does not run field validation on change for onBlur mode when invalid prop is true', async () => {
      const user = userEvent.setup()
      const validate = vi.fn(() => 'field error')
      render(InvalidPropForm, { validate, validationMode: 'onBlur' })

      const input = screen.getByTestId('name')
      expect(screen.getByTestId('name-error')).toHaveTextContent('server error')

      await user.click(input)
      await user.keyboard('a')
      expect(validate.mock.calls.length).toBe(0)
      expect(screen.queryByTestId('name-error')).not.toBeInTheDocument()

      await user.tab()
      expect(validate.mock.calls.length).toBe(1)
      expect(screen.getByTestId('name-error')).toHaveTextContent('field error')
    })
  })

  describe('prop: onFormSubmit', () => {
    it('runs when the form is submitted', async () => {
      const onFormSubmit = vi.fn()
      let defaultPrevented: boolean | undefined
      const listener = (event: Event) => {
        defaultPrevented = event.defaultPrevented
      }
      document.addEventListener('submit', listener)

      try {
        render(SubmitForm, { onFormSubmit })

        await fireEvent.click(screen.getByTestId('submit'))

        expect(onFormSubmit).toHaveBeenCalledTimes(1)
        expect(onFormSubmit.mock.calls[0][0]).toEqual({ username: 'alice', subscribe: true })
        expect(defaultPrevented).toBe(true)
      } finally {
        document.removeEventListener('submit', listener)
      }
    })

    it('does not run when the form is invalid', async () => {
      const onFormSubmit = vi.fn()
      render(OnFormSubmitInvalidForm, { onFormSubmit })

      expect(screen.queryByTestId('error')).not.toBeInTheDocument()
      await fireEvent.click(screen.getByText('submit'))
      expect(onFormSubmit).not.toHaveBeenCalled()
      await waitFor(() => expect(screen.queryByTestId('error')).toBeInTheDocument())
    })
  })

  describe('prop: novalidate', () => {
    it('disables native validation by default', () => {
      render(Form, { 'data-testid': 'form' })
      expect(screen.getByTestId('form')).toHaveAttribute('novalidate')
    })

    it('enables native validation when set to false', () => {
      render(Form, { 'data-testid': 'form', novalidate: false })
      expect(screen.getByTestId('form')).not.toHaveAttribute('novalidate')
    })
  })

  describe('method: validate', () => {
    it('validates the form when the validate method is called', async () => {
      render(ValidateForm)

      expect(screen.queryByTestId('username-error')).not.toBeInTheDocument()
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument()

      await fireEvent.click(screen.getByTestId('validate-all'))

      await waitFor(() => {
        expect(screen.queryByTestId('username-error')).toBeInTheDocument()
      })
      await waitFor(() => {
        expect(screen.queryByTestId('email-error')).toBeInTheDocument()
      })
    })

    it('validates a field when the validate method is called with the field name', async () => {
      render(ValidateForm)

      await fireEvent.click(screen.getByTestId('validate-email'))

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email')
      })
      expect(screen.queryByTestId('username-error')).not.toBeInTheDocument()
    })

    it('targets only the current registration after name, id, and control replacement', async () => {
      const user = userEvent.setup()
      const initialValidate = vi.fn(() => null)
      const renamedValidate = vi.fn(() => null)
      const replacementValidate = vi.fn(() => null)

      render(ValidateTargetForm, { initialValidate, renamedValidate, replacementValidate })

      await user.click(screen.getByRole('button', { name: 'Rename' }))
      await user.click(screen.getByRole('button', { name: 'Validate initial' }))
      await user.click(screen.getByRole('button', { name: 'Validate current' }))

      expect(initialValidate).not.toHaveBeenCalled()
      expect(renamedValidate).toHaveBeenCalledTimes(1)

      await user.click(screen.getByRole('button', { name: 'Unmount' }))
      await user.click(screen.getByRole('button', { name: 'Validate current' }))
      expect(renamedValidate).toHaveBeenCalledTimes(1)

      await user.click(screen.getByRole('button', { name: 'Replace' }))
      await user.click(screen.getByRole('button', { name: 'Validate current' }))

      expect(replacementValidate).toHaveBeenCalledTimes(1)
    })
  })
})
