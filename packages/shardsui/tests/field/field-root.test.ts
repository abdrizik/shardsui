import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import type { FieldValidator } from '$lib/components/field'
import AllFormValues from './fixtures/all-form-values.svelte'
import BasicField from './fixtures/basic-field.svelte'
import ClearNameGroup from './fixtures/clear-name-group.svelte'
import ControlNameChange from './fixtures/control-name-change.svelte'
import ControlNameSubmit from './fixtures/control-name-submit.svelte'
import ControlledField from './fixtures/controlled-field.svelte'
import DebounceCheckbox from './fixtures/debounce-checkbox.svelte'
import DebounceRadio from './fixtures/debounce-radio.svelte'
import DisabledFormErrorField from './fixtures/disabled-form-error-field.svelte'
import FieldAwareNameChange from './fixtures/field-aware-name-change.svelte'
import FullField from './fixtures/full-field.svelte'
import InitialValueElement from './fixtures/initial-value-element.svelte'
import NullBaselineRadioGroup from './fixtures/null-baseline-radio-group.svelte'
import NullBaselineSelect from './fixtures/null-baseline-select.svelte'
import RemountControlledControl from './fixtures/remount-controlled-control.svelte'
import RootNameRemoved from './fixtures/root-name-removed.svelte'
import SiblingStandaloneFields from './fixtures/sibling-standalone-fields.svelte'
import SwapFieldAware from './fixtures/swap-field-aware.svelte'
import SwapNullControl from './fixtures/swap-null-control.svelte'
import SwapTextControl from './fixtures/swap-text-control.svelte'
import TypeMismatchMissing from './fixtures/type-mismatch-missing.svelte'
import TypedValidatedField from './fixtures/typed-validated-field.svelte'
import UnmountedFields from './fixtures/unmounted-fields.svelte'
import ValidateAfterNative from './fixtures/validate-after-native.svelte'
import ValidatedField from './fixtures/validated-field.svelte'

// Fake timers deadlock @testing-library/svelte's render/flush pipeline in this jsdom harness.
const flush = () => new Promise<void>((resolve) => setTimeout(resolve))
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

describe('<Field.Root />', () => {
  describe('prop: disabled', () => {
    it('adds the data-disabled style hook to all components', () => {
      render(FullField, { disabled: true })

      expect(screen.getByTestId('root')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('control')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('label')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('description')).toHaveAttribute('data-disabled')
    })

    it('keeps an explicitly invalid field marked invalid while disabled', () => {
      render(FullField, { disabled: true, invalid: true })

      expect(screen.getByTestId('root')).toHaveAttribute('data-invalid')
      expect(screen.getByTestId('control')).toHaveAttribute('data-invalid')
      expect(screen.getByTestId('label')).toHaveAttribute('data-invalid')
      expect(screen.getByTestId('description')).toHaveAttribute('data-invalid')

      expect(screen.getByTestId('control')).not.toHaveAttribute('aria-invalid')
    })

    it('keeps a disabled field with form errors marked invalid', () => {
      render(DisabledFormErrorField)

      const control = screen.getByTestId('control')
      expect(control).toHaveAttribute('data-invalid')
      expect(control).not.toHaveAttribute('aria-invalid')
    })
  })

  describe('prop: validate', () => {
    it('when not in <Form> the function does not run by default', async () => {
      const validateSpy = vi.fn(() => 'error')
      render(BasicField, { validate: validateSpy })

      const control = screen.getByRole('textbox')

      expect(screen.queryByText('error')).not.toBeInTheDocument()

      fireEvent.focus(control)
      fireEvent.change(control, { target: { value: 'abc' } })
      expect(validateSpy).not.toHaveBeenCalled()

      fireEvent.blur(control)
      expect(validateSpy).not.toHaveBeenCalled()
    })

    it('runs after native validations', async () => {
      render(ValidateAfterNative)

      expect(screen.queryByText('value missing')).not.toBeInTheDocument()
      expect(screen.queryByText('custom error')).not.toBeInTheDocument()

      const input = screen.getByRole('textbox')

      await fireEvent.click(screen.getByText('submit'))
      expect(screen.queryByText('value missing')).toBeInTheDocument()
      expect(screen.queryByText('custom error')).not.toBeInTheDocument()

      await fireEvent.focus(input)
      await fireEvent.input(input, { target: { value: 'ab' } })
      expect(screen.queryByText('value missing')).not.toBeInTheDocument()
      expect(screen.queryByText('custom error')).toBeInTheDocument()

      await fireEvent.input(input, { target: { value: '' } })
      expect(screen.queryByText('value missing')).toBeInTheDocument()
    })

    it('applies aria-invalid to the control once validation finishes', async () => {
      render(TypedValidatedField, {
        validate: () => 'error',
        validationMode: 'onSubmit',
        useForm: true
      })

      const control = screen.getByTestId('control')
      expect(control).not.toHaveAttribute('aria-invalid')

      await fireEvent.click(screen.getByTestId('submit'))

      await waitFor(() => expect(control).toHaveAttribute('aria-invalid', 'true'))
    })

    it('receives all form values as the 2nd argument', async () => {
      const validateSpy = vi.fn<FieldValidator>(() => null)
      render(AllFormValues, { validateSpy })

      await fireEvent.click(screen.getByText('submit'))

      expect(validateSpy).toHaveBeenCalledTimes(1)
      expect(validateSpy.mock.calls[0][1]).toEqual({
        checkbox: true,
        'checkbox-group': ['apple', 'banana'],
        input: 'https://example.com',
        'radio-group': 'cats',
        select: 'sans',
        slider: 12,
        'range-slider': [25, 70],
        switch: false
      })
    })

    it('unmounted fields are excluded from the validate fn', async () => {
      const validateSpy = vi.fn<FieldValidator>(() => null)
      render(UnmountedFields, { validateSpy })

      await fireEvent.click(screen.getByText('submit'))

      expect(validateSpy).toHaveBeenCalledTimes(1)
      expect(validateSpy.mock.calls[0][1]).toEqual({
        input1: 'one',
        input2: 'two'
      })

      await fireEvent.click(screen.getByTestId('toggle'))
      await fireEvent.click(screen.getByText('submit'))

      expect(validateSpy).toHaveBeenCalledTimes(2)
      expect(validateSpy.mock.lastCall?.[1]).toEqual({ input2: 'two' })
    })

    it('does not leak a sibling standalone field into formValues', async () => {
      const validate = vi.fn<FieldValidator>(() => null)
      render(SiblingStandaloneFields, { validate })

      await fireEvent.input(screen.getByTestId('first'), { target: { value: 'typed' } })

      await waitFor(() => expect(validate).toHaveBeenCalled())
      expect(validate.mock.lastCall?.[1]).toEqual({ first: 'typed' })
    })

    it('submits the replacement control value when swapping field-aware controls', async () => {
      const handleSubmit = vi.fn()
      render(SwapFieldAware, { onFormSubmit: handleSubmit })

      await fireEvent.click(screen.getByText('submit'))
      expect(handleSubmit).toHaveBeenCalledTimes(1)
      expect(handleSubmit.mock.lastCall?.[0]).toEqual({ value: 'sans' })

      await fireEvent.click(screen.getByText('Toggle'))
      await fireEvent.click(screen.getByText('submit'))

      expect(handleSubmit).toHaveBeenCalledTimes(2)
      expect(handleSubmit.mock.lastCall?.[0]).toEqual({ value: 12 })
    })

    it('excludes registration-gated controls from onFormSubmit when their field name is removed', async () => {
      const handleSubmit = vi.fn()
      render(ClearNameGroup, { onFormSubmit: handleSubmit })

      await fireEvent.click(screen.getByText('submit'))
      expect(handleSubmit).toHaveBeenCalledTimes(1)
      expect(handleSubmit.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] })

      await fireEvent.click(screen.getByText('Clear name'))
      await fireEvent.click(screen.getByText('submit'))
      expect(handleSubmit).toHaveBeenCalledTimes(2)
      expect(handleSubmit.mock.lastCall?.[0]).toEqual({})
    })

    it('uses the Field.Control name for form submission and form validation values', async () => {
      const handleSubmit = vi.fn()
      const validate = vi.fn<FieldValidator>(() => null)
      render(ControlNameSubmit, { onFormSubmit: handleSubmit, validate })

      await fireEvent.click(screen.getByText('submit'))

      expect(validate.mock.lastCall?.[1]).toEqual({
        email: 'one@example.com',
        confirmEmail: 'one@example.com'
      })
      expect(handleSubmit.mock.lastCall?.[0]).toEqual({
        email: 'one@example.com',
        confirmEmail: 'one@example.com'
      })
    })

    it('updates the Field.Control name fallback when the name changes', async () => {
      const handleSubmit = vi.fn()
      render(ControlNameChange, { onFormSubmit: handleSubmit })

      await fireEvent.click(screen.getByText('submit'))
      expect(handleSubmit.mock.lastCall?.[0]).toEqual({ email: 'one@example.com' })

      await fireEvent.click(screen.getByText('Change name'))
      await fireEvent.click(screen.getByText('submit'))
      expect(handleSubmit.mock.lastCall?.[0]).toEqual({ alternateEmail: 'one@example.com' })

      await fireEvent.click(screen.getByText('Clear name'))
      await fireEvent.click(screen.getByText('submit'))
      expect(handleSubmit.mock.lastCall?.[0]).toEqual({})
    })

    it('updates field-aware control name fallbacks when the name changes', async () => {
      const handleSubmit = vi.fn()
      render(FieldAwareNameChange, { onFormSubmit: handleSubmit })

      await fireEvent.click(screen.getByText('submit'))
      expect(handleSubmit.mock.lastCall?.[0]).toEqual({ quantity: 'sans' })

      await fireEvent.click(screen.getByText('Change name'))
      await fireEvent.click(screen.getByText('submit'))
      expect(handleSubmit.mock.lastCall?.[0]).toEqual({ amount: 'sans' })

      await fireEvent.click(screen.getByText('Clear name'))
      await fireEvent.click(screen.getByText('submit'))
      expect(handleSubmit.mock.lastCall?.[0]).toEqual({})
    })

    it('uses the Field.Control name fallback when the Field.Root name is removed', async () => {
      render(RootNameRemoved)

      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByTestId('default-error')).not.toBeInTheDocument()

      await fireEvent.click(screen.getByText('Clear root name'))

      await waitFor(() =>
        expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
      )
      expect(screen.getByTestId('default-error')).toHaveTextContent('Email is already taken')
    })
  })

  describe('prop: validationMode', () => {
    describe('onSubmit', () => {
      it('validates the field on submit', async () => {
        render(TypedValidatedField, {
          validate: () => 'submit error',
          validationMode: 'onSubmit',
          useForm: true
        })

        expect(screen.queryByTestId('error')).not.toBeInTheDocument()

        fireEvent.click(screen.getByTestId('submit'))

        await waitFor(() => {
          expect(screen.queryByTestId('error')).toBeInTheDocument()
        })
      })

      it('revalidates on change', async () => {
        render(TypedValidatedField, {
          validationMode: 'onSubmit',
          required: true,
          useForm: true
        })

        const control = screen.getByTestId('control')
        const submit = screen.getByTestId('submit')

        expect(screen.queryByTestId('error')).not.toBeInTheDocument()

        fireEvent.click(submit)
        await waitFor(() => expect(screen.queryByTestId('error')).toBeInTheDocument())

        fireEvent.input(control, { target: { value: 'http://example.com' } })
        await waitFor(() => expect(screen.queryByTestId('error')).not.toBeInTheDocument())
      })
    })

    describe('onChange', () => {
      it('validates the field on change', async () => {
        render(ValidatedField, {
          validate: (val) => (String(val).length < 3 ? 'error' : null),
          validationMode: 'onChange'
        })

        const control = screen.getByTestId('control')

        expect(control).not.toHaveAttribute('aria-invalid')

        await fireEvent.input(control, { target: { value: 't' } })

        expect(control).toHaveAttribute('data-invalid')
        expect(control).toHaveAttribute('aria-invalid', 'true')
      })

      it('ignores stale async validation results', async () => {
        const resolvers: Record<string, (value: string | null) => void> = {}
        const validate: FieldValidator = (value) =>
          new Promise<string | null>((resolve) => {
            resolvers[String(value)] = resolve
          })

        render(ValidatedField, { validate, validationMode: 'onChange' })
        const control = screen.getByTestId('control')

        await fireEvent.input(control, { target: { value: 'old' } })
        await fireEvent.input(control, { target: { value: 'new' } })

        resolvers.new(null)
        await flush()

        expect(screen.queryByText('old error')).not.toBeInTheDocument()
        expect(control).not.toHaveAttribute('aria-invalid')

        resolvers.old('old error')
        await flush()

        expect(screen.queryByText('old error')).not.toBeInTheDocument()
        expect(control).not.toHaveAttribute('aria-invalid')
      })
    })

    describe('onBlur', () => {
      it('validates the field on blur', async () => {
        render(ValidatedField, {
          validate: (val) => (String(val).length < 3 ? 'error' : null),
          validationMode: 'onBlur'
        })

        const control = screen.getByTestId('control')

        expect(screen.queryByTestId('error')).not.toBeInTheDocument()

        await fireEvent.change(control, { target: { value: 't' } })
        expect(control).not.toHaveAttribute('data-invalid')

        await fireEvent.focus(control)
        await fireEvent.blur(control)

        expect(control).toHaveAttribute('data-invalid')
        expect(control).toHaveAttribute('aria-invalid', 'true')
      })

      it('does not mark invalid if `valueMissing` is the only error and not yet dirtied', () => {
        render(ValidatedField, { validationMode: 'onBlur' })
        const control = screen.getByTestId('control')
        // @ts-expect-error required not on type but valid HTML attr
        control.required = true

        fireEvent.focus(control)
        fireEvent.blur(control)

        expect(control).not.toHaveAttribute('data-invalid')
        expect(control).not.toHaveAttribute('aria-invalid')
      })

      it('marks invalid if `valueMissing` is the only error and dirtied', async () => {
        render(TypedValidatedField, { validationMode: 'onBlur', required: true })
        const control = screen.getByTestId('control')

        await fireEvent.focus(control)
        await fireEvent.input(control, { target: { value: 'a' } })
        await fireEvent.input(control, { target: { value: '' } })
        await fireEvent.blur(control)

        expect(control).toHaveAttribute('data-invalid')
        expect(control).toHaveAttribute('aria-invalid', 'true')
      })

      it('supports async validation', async () => {
        render(TypedValidatedField, {
          validationMode: 'onBlur',
          validate: () => Promise.resolve('async error')
        })
        const control = screen.getByTestId('control')

        fireEvent.focus(control)
        fireEvent.blur(control)

        await waitFor(() => {
          expect(screen.queryByTestId('error')).toBeInTheDocument()
        })

        expect(control).toHaveAttribute('aria-invalid', 'true')
      })

      it('applies [data-valid]/[data-invalid] style hooks to field components', async () => {
        render(TypedValidatedField, { validationMode: 'onBlur', required: true })

        const control = screen.getByTestId('control')
        const label = screen.getByTestId('label')
        const description = screen.getByTestId('description')

        expect(control).not.toHaveAttribute('data-valid')
        expect(label).not.toHaveAttribute('data-valid')
        expect(description).not.toHaveAttribute('data-valid')
        expect(screen.queryByTestId('error')).not.toBeInTheDocument()

        await fireEvent.focus(control)
        await fireEvent.input(control, { target: { value: 'a' } })
        await fireEvent.input(control, { target: { value: '' } })
        await fireEvent.blur(control)

        const error = screen.getByTestId('error')
        expect(control).toHaveAttribute('data-invalid')
        expect(label).toHaveAttribute('data-invalid')
        expect(description).toHaveAttribute('data-invalid')
        expect(error).toHaveAttribute('data-invalid')

        await fireEvent.focus(control)
        await fireEvent.input(control, { target: { value: 'value' } })
        await fireEvent.blur(control)

        expect(control).toHaveAttribute('data-valid')
        expect(label).toHaveAttribute('data-valid')
        expect(description).toHaveAttribute('data-valid')
        expect(screen.queryByTestId('error')).not.toBeInTheDocument()
      })

      describe('revalidation', () => {
        it('revalidates on change for `valueMissing`', async () => {
          render(TypedValidatedField, { validationMode: 'onBlur', required: true })
          const control = screen.getByTestId('control')

          await fireEvent.focus(control)
          await fireEvent.input(control, { target: { value: 't' } })
          await fireEvent.blur(control)
          expect(control).not.toHaveAttribute('aria-invalid', 'true')

          await fireEvent.focus(control)
          await fireEvent.input(control, { target: { value: '' } })
          await fireEvent.blur(control)
          expect(control).toHaveAttribute('aria-invalid')
        })

        it('handles both `required` and `typeMismatch`', async () => {
          render(TypedValidatedField, {
            validationMode: 'onBlur',
            type: 'email',
            required: true
          })
          const control = screen.getByTestId('control')

          await fireEvent.focus(control)
          await fireEvent.blur(control)
          expect(control).not.toHaveAttribute('aria-invalid')

          await fireEvent.focus(control)
          await fireEvent.input(control, { target: { value: 'tt' } })
          await fireEvent.blur(control)
          expect(control).toHaveAttribute('aria-invalid', 'true')

          await fireEvent.focus(control)
          await fireEvent.input(control, { target: { value: '' } })
          await fireEvent.blur(control)
          expect(control).toHaveAttribute('aria-invalid', 'true')

          await fireEvent.focus(control)
          await fireEvent.input(control, { target: { value: 'email@example.com' } })
          await fireEvent.blur(control)
          expect(control).not.toHaveAttribute('aria-invalid')
        })

        it('revalidates on change when clearing a type mismatch leaves only `valueMissing`', async () => {
          render(TypeMismatchMissing)
          const control = screen.getByTestId('control')

          await fireEvent.focus(control)
          await fireEvent.input(control, { target: { value: 'invalid' } })
          await fireEvent.blur(control)

          expect(screen.getByTestId('type-error')).toBeInTheDocument()
          expect(screen.queryByTestId('required-error')).not.toBeInTheDocument()

          await fireEvent.focus(control)
          await fireEvent.input(control, { target: { value: '' } })

          expect(screen.queryByTestId('type-error')).not.toBeInTheDocument()
          expect(screen.getByTestId('required-error')).toBeInTheDocument()
        })

        it('clears valueMissing on change but defers other native errors like typeMismatch until blur when both are active', async () => {
          render(TypedValidatedField, {
            validationMode: 'onBlur',
            type: 'email',
            required: true
          })
          const control = screen.getByTestId('control')

          await fireEvent.focus(control)
          await fireEvent.blur(control)
          expect(control).not.toHaveAttribute('aria-invalid', 'true')
          expect(screen.queryByTestId('error')).not.toBeInTheDocument()

          await fireEvent.focus(control)
          await fireEvent.input(control, { target: { value: 'a' } })
          await fireEvent.input(control, { target: { value: '' } })
          await fireEvent.blur(control)

          expect(control).toHaveAttribute('aria-invalid', 'true')
          expect(screen.getByTestId('error')).toBeInTheDocument()

          await fireEvent.focus(control)
          await fireEvent.input(control, { target: { value: 't' } })

          expect(control).not.toHaveAttribute('aria-invalid', 'true')
          expect(screen.queryByTestId('error')).not.toBeInTheDocument()

          await fireEvent.blur(control)

          expect(control).toHaveAttribute('aria-invalid', 'true')
          expect(screen.getByTestId('error')).toBeInTheDocument()
          expect(screen.getByTestId('error').textContent).not.toBe('')

          await fireEvent.focus(control)
          await fireEvent.input(control, { target: { value: 'test@example.com' } })

          expect(control).not.toHaveAttribute('aria-invalid', 'true')
          expect(screen.queryByTestId('error')).not.toBeInTheDocument()

          await fireEvent.blur(control)

          expect(control).not.toHaveAttribute('aria-invalid', 'true')
          expect(screen.queryByTestId('error')).not.toBeInTheDocument()
        })
      })

      describe('computed validity state', () => {
        it('does not mark the field invalid for valueMissing if not dirty', () => {
          render(TypedValidatedField, { validationMode: 'onBlur', required: true })
          const control = screen.getByTestId('control')

          fireEvent.focus(control)
          fireEvent.blur(control)

          expect(control).not.toHaveAttribute('data-invalid')
          expect(control).not.toHaveAttribute('aria-invalid')
        })

        it('marks the field invalid for valueMissing if dirty', async () => {
          render(TypedValidatedField, { validationMode: 'onBlur', required: true })
          const control = screen.getByTestId('control')

          await fireEvent.focus(control)
          await fireEvent.input(control, { target: { value: 'a' } })
          await fireEvent.input(control, { target: { value: '' } })
          await fireEvent.blur(control)

          expect(control).toHaveAttribute('data-invalid')
          expect(control).toHaveAttribute('aria-invalid', 'true')
        })

        it('marks the field invalid for other errors (e.g. typeMismatch) even if not dirty', async () => {
          render(TypedValidatedField, {
            validationMode: 'onBlur',
            type: 'email',
            value: 'not_an_email@'
          })
          const control = screen.getByTestId('control')

          await fireEvent.focus(control)
          await fireEvent.blur(control)

          expect(control).toHaveAttribute('data-invalid')
          expect(control).toHaveAttribute('aria-invalid', 'true')
        })
      })
    })
  })

  describe('prop: validationDebounceTime', () => {
    it('debounces validation', async () => {
      const validate = vi.fn<FieldValidator>((val) => (String(val).length < 3 ? 'error' : null))

      render(ValidatedField, {
        validate,
        validationMode: 'onChange',
        validationDebounceTime: 50
      })

      const control = screen.getByTestId('control')

      fireEvent.input(control, { target: { value: 't' } })
      expect(validate).not.toHaveBeenCalled()
      expect(control).not.toHaveAttribute('aria-invalid')

      await wait(60)

      expect(validate).toHaveBeenCalled()
      expect(control).toHaveAttribute('aria-invalid', 'true')
    })

    it('debounces validation for field-aware controls', async () => {
      const validate = vi.fn<FieldValidator>((value) => (value ? 'error' : null))
      render(DebounceCheckbox, { validate })

      const control = screen.getByRole('checkbox')

      await fireEvent.click(control)

      expect(validate).not.toHaveBeenCalled()
      expect(control).not.toHaveAttribute('aria-invalid')

      await wait(150)
      expect(validate).toHaveBeenCalledTimes(1)
      expect(control).toHaveAttribute('aria-invalid', 'true')
    })

    it('debounces validation for radio groups', async () => {
      const validate = vi.fn<FieldValidator>((value) => (value === 'b' ? 'error' : null))
      render(DebounceRadio, { validate })

      const control = screen.getByRole('radiogroup')

      await fireEvent.click(screen.getByTestId('item-b'))

      expect(validate).not.toHaveBeenCalled()
      expect(control).not.toHaveAttribute('aria-invalid')

      await wait(150)
      expect(validate).toHaveBeenCalledTimes(1)
      expect(validate.mock.lastCall?.[0]).toBe('b')
      expect(control).toHaveAttribute('aria-invalid', 'true')
    })

    it('ignores async validation results superseded during debounce', async () => {
      const resolvers: Record<string, (value: string | null) => void> = {}
      const validate = vi.fn<FieldValidator>(
        (value) =>
          new Promise<string | null>((resolve) => {
            resolvers[String(value)] = resolve
          })
      )

      render(ValidatedField, {
        validate,
        validationMode: 'onChange',
        validationDebounceTime: 100
      })

      const control = screen.getByTestId('control')

      await fireEvent.input(control, { target: { value: 'old' } })
      await wait(150)

      expect(validate.mock.lastCall?.[0]).toBe('old')

      await fireEvent.input(control, { target: { value: 'new' } })

      resolvers.old('old error')
      await flush()

      expect(screen.queryByText('old error')).not.toBeInTheDocument()
      expect(control).not.toHaveAttribute('aria-invalid')

      await wait(150)

      resolvers.new(null)
      await flush()

      expect(validate.mock.lastCall?.[0]).toBe('new')
      expect(screen.queryByText('old error')).not.toBeInTheDocument()
      expect(control).not.toHaveAttribute('aria-invalid')
    })
  })

  describe('style hooks', () => {
    describe('touched', () => {
      it('applies [data-touched] to all components when touched', async () => {
        render(FullField, {})

        const root = screen.getByTestId('root')
        const control = screen.getByTestId('control')
        const label = screen.getByTestId('label')
        const description = screen.getByTestId('description')

        expect(root).not.toHaveAttribute('data-touched')
        expect(control).not.toHaveAttribute('data-touched')
        expect(label).not.toHaveAttribute('data-touched')
        expect(description).not.toHaveAttribute('data-touched')

        await fireEvent.focus(control)
        await fireEvent.blur(control)

        expect(root).toHaveAttribute('data-touched')
        expect(control).toHaveAttribute('data-touched')
        expect(label).toHaveAttribute('data-touched')
        expect(description).toHaveAttribute('data-touched')
      })
    })

    describe('dirty', () => {
      it('applies [data-dirty] to all components when dirty', async () => {
        render(FullField, {})

        const root = screen.getByTestId('root')
        const control = screen.getByTestId('control')
        const label = screen.getByTestId('label')
        const description = screen.getByTestId('description')

        expect(root).not.toHaveAttribute('data-dirty')
        expect(control).not.toHaveAttribute('data-dirty')

        await fireEvent.input(control, { target: { value: 'value' } })

        expect(root).toHaveAttribute('data-dirty')
        expect(control).toHaveAttribute('data-dirty')
        expect(label).toHaveAttribute('data-dirty')
        expect(description).toHaveAttribute('data-dirty')

        await fireEvent.input(control, { target: { value: '' } })

        expect(root).not.toHaveAttribute('data-dirty')
        expect(control).not.toHaveAttribute('data-dirty')
        expect(label).not.toHaveAttribute('data-dirty')
        expect(description).not.toHaveAttribute('data-dirty')
      })

      it('clears [data-dirty] when a Select returns to its null initial value', async () => {
        render(NullBaselineSelect)
        const root = screen.getByTestId('root')

        expect(root).not.toHaveAttribute('data-dirty')

        await fireEvent.click(screen.getByText('set'))
        await waitFor(() => expect(root).toHaveAttribute('data-dirty'))

        await fireEvent.click(screen.getByText('clear'))
        await waitFor(() => expect(root).not.toHaveAttribute('data-dirty'))
      })

      it('keeps [data-dirty] on a RadioGroup when returning to the first picked value', async () => {
        render(NullBaselineRadioGroup)
        const root = screen.getByTestId('root')

        expect(root).not.toHaveAttribute('data-dirty')

        await fireEvent.click(screen.getByText('a'))
        await waitFor(() => expect(root).toHaveAttribute('data-dirty'))

        await fireEvent.click(screen.getByText('b'))
        await fireEvent.click(screen.getByText('a'))

        await waitFor(() => expect(root).toHaveAttribute('data-dirty'))
      })
    })

    describe('control remount', () => {
      it('clears dirty after a text control returns to empty following a null-valued control', async () => {
        render(SwapNullControl)
        const root = screen.getByTestId('root')

        await fireEvent.click(screen.getByText('swap'))
        const control = screen.getByTestId('control')
        expect(root).not.toHaveAttribute('data-dirty')

        await fireEvent.input(control, { target: { value: 'y' } })
        expect(root).toHaveAttribute('data-dirty')

        await fireEvent.input(control, { target: { value: '' } })
        expect(root).not.toHaveAttribute('data-dirty')
      })

      it('keeps the original baseline when a controlled control remounts', async () => {
        render(RemountControlledControl)
        const root = screen.getByTestId('root')

        await fireEvent.input(screen.getByTestId('control'), { target: { value: 'b' } })
        await waitFor(() => expect(root).toHaveAttribute('data-dirty'))

        await fireEvent.click(screen.getByText('toggle'))
        await fireEvent.click(screen.getByText('toggle'))

        expect(root).toHaveAttribute('data-dirty')

        await fireEvent.input(screen.getByTestId('control'), { target: { value: 'a' } })
        await waitFor(() => expect(root).not.toHaveAttribute('data-dirty'))
      })

      it('keeps the field baseline when the control is swapped', async () => {
        render(SwapTextControl)
        const root = screen.getByTestId('root')

        await fireEvent.click(screen.getByText('swap'))
        const control = screen.getByTestId('control')

        await fireEvent.input(control, { target: { value: 'y' } })
        await waitFor(() => expect(root).toHaveAttribute('data-dirty'))

        await fireEvent.input(control, { target: { value: 'a' } })
        await waitFor(() => expect(root).not.toHaveAttribute('data-dirty'))
      })
    })

    describe('filled', () => {
      it('applies [data-filled] to all components when filled', async () => {
        render(FullField, {})

        const root = screen.getByTestId('root')
        const control = screen.getByTestId('control')
        const label = screen.getByTestId('label')
        const description = screen.getByTestId('description')

        expect(root).not.toHaveAttribute('data-filled')
        expect(control).not.toHaveAttribute('data-filled')

        await fireEvent.input(control, { target: { value: 'value' } })

        expect(root).toHaveAttribute('data-filled')
        expect(control).toHaveAttribute('data-filled')
        expect(label).toHaveAttribute('data-filled')
        expect(description).toHaveAttribute('data-filled')

        await fireEvent.input(control, { target: { value: '' } })

        expect(root).not.toHaveAttribute('data-filled')
        expect(control).not.toHaveAttribute('data-filled')
        expect(label).not.toHaveAttribute('data-filled')
        expect(description).not.toHaveAttribute('data-filled')
      })

      it('changes [data-filled] when the value is changed externally', async () => {
        render(ControlledField)
        const control = screen.getByTestId('control')

        expect(control).not.toHaveAttribute('data-filled')

        fireEvent.click(screen.getByTestId('change-btn'))
        await waitFor(() => expect(control).toHaveAttribute('data-filled'))

        fireEvent.click(screen.getByTestId('reset-btn'))
        await waitFor(() => expect(control).not.toHaveAttribute('data-filled'))
      })
    })

    describe('focused', () => {
      it('applies [data-focused] to all components when focused', async () => {
        render(FullField, {})

        const root = screen.getByTestId('root')
        const control = screen.getByTestId('control')
        const label = screen.getByTestId('label')
        const description = screen.getByTestId('description')

        expect(root).not.toHaveAttribute('data-focused')
        expect(control).not.toHaveAttribute('data-focused')

        await fireEvent.focus(control)

        expect(root).toHaveAttribute('data-focused')
        expect(control).toHaveAttribute('data-focused')
        expect(label).toHaveAttribute('data-focused')
        expect(description).toHaveAttribute('data-focused')

        await fireEvent.blur(control)

        expect(root).not.toHaveAttribute('data-focused')
        expect(control).not.toHaveAttribute('data-focused')
        expect(label).not.toHaveAttribute('data-focused')
        expect(description).not.toHaveAttribute('data-focused')
      })
    })
  })

  describe('initial value behavior', () => {
    it('does not reset to the initial value when the value is programmatically changed to empty and then focused', async () => {
      let input: HTMLInputElement | null = null
      render(InitialValueElement, { onElement: (element: HTMLInputElement) => (input = element) })

      const el = screen.getByTestId('input') as HTMLInputElement
      expect(el.value).toBe('foo')

      input!.value = ''
      expect(el.value).toBe('')

      await fireEvent.focus(el)
      expect(el.value).toBe('')
    })

    it('does not reset to the initial value when the value is programmatically changed to non-empty and then focused', async () => {
      let input: HTMLInputElement | null = null
      render(InitialValueElement, { onElement: (element: HTMLInputElement) => (input = element) })

      const el = screen.getByTestId('input') as HTMLInputElement
      expect(el.value).toBe('foo')

      input!.value = 'abc'
      expect(el.value).toBe('abc')

      await fireEvent.focus(el)
      expect(el.value).toBe('abc')
    })
  })

  describe('prop: dirty', () => {
    it('controls the dirty state', () => {
      render(FullField, { dirty: true })

      expect(screen.getByTestId('root')).toHaveAttribute('data-dirty')
      expect(screen.getByTestId('control')).toHaveAttribute('data-dirty')
      expect(screen.getByTestId('label')).toHaveAttribute('data-dirty')
      expect(screen.getByTestId('description')).toHaveAttribute('data-dirty')
    })

    it('uses the controlled dirty state for required validation', async () => {
      render(FullField, { dirty: true, required: true, validationMode: 'onBlur' })

      const control = screen.getByTestId('control')

      await fireEvent.focus(control)
      await fireEvent.blur(control)

      expect(control).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('error')).toBeInTheDocument()
    })

    it('does not update the controlled dirty state from user input', async () => {
      render(FullField, { dirty: false })

      await fireEvent.input(screen.getByTestId('control'), { target: { value: 'changed' } })

      expect(screen.getByTestId('root')).not.toHaveAttribute('data-dirty')
    })
  })

  describe('prop: touched', () => {
    it('controls the touched state', () => {
      render(FullField, { touched: true })

      expect(screen.getByTestId('root')).toHaveAttribute('data-touched')
      expect(screen.getByTestId('control')).toHaveAttribute('data-touched')
      expect(screen.getByTestId('label')).toHaveAttribute('data-touched')
      expect(screen.getByTestId('description')).toHaveAttribute('data-touched')
    })

    it('does not update the controlled touched state on blur', async () => {
      render(FullField, { touched: false })

      const control = screen.getByTestId('control')
      await fireEvent.focus(control)
      await fireEvent.blur(control)

      expect(screen.getByTestId('root')).not.toHaveAttribute('data-touched')
    })
  })
})
