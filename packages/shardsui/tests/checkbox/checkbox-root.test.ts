import { Checkbox } from '$lib/components/checkbox'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isGecko, isJSDOM, isWebKit } from '../test-utils'
import BasicCheckbox from './fixtures/basic-checkbox.svelte'
import ButtonCheckbox from './fixtures/button-checkbox.svelte'
import CheckboxExternalErrors from './fixtures/checkbox-external-errors.svelte'
import CheckboxGroupFilled from './fixtures/checkbox-group-filled.svelte'
import CheckboxImplicitFieldLabel from './fixtures/checkbox-implicit-field-label.svelte'
import CheckboxInField from './fixtures/checkbox-in-field.svelte'
import CheckboxIndicatorProps from './fixtures/checkbox-indicator-props.svelte'
import CheckboxNativeValidation from './fixtures/checkbox-native-validation.svelte'
import CheckboxRevalidateExternal from './fixtures/checkbox-revalidate-external.svelte'
import CheckboxSiblingLabel from './fixtures/checkbox-sibling-label.svelte'
import CheckboxValidation from './fixtures/checkbox-validation.svelte'
import CheckboxVeto from './fixtures/checkbox-veto.svelte'
import CheckboxWithFieldLabel from './fixtures/checkbox-with-field-label.svelte'
import ClickPropagationCheckbox from './fixtures/click-propagation-checkbox.svelte'
import ControlledCheckbox from './fixtures/controlled-checkbox.svelte'
import DescribedBy from './fixtures/described-by.svelte'
import EmptyIdCheckbox from './fixtures/empty-id-checkbox.svelte'
import ExternalForm from './fixtures/external-form.svelte'
import FormDisabledSubmit from './fixtures/form-disabled-submit.svelte'
import FormNoSubmit from './fixtures/form-no-submit.svelte'
import Form from './fixtures/form.svelte'
import LinkedLabelCheckbox from './fixtures/linked-label-checkbox.svelte'
import NativeForm from './fixtures/native-form.svelte'
import WrappingLabelCheckbox from './fixtures/wrapping-label-checkbox.svelte'

describe('<Checkbox.Root />', () => {
  describe('prop: id', () => {
    it('falls back to a generated id when id is empty', async () => {
      const user = userEvent.setup()
      render(EmptyIdCheckbox)

      const label = screen.getByText('Label')
      const input = document.querySelector<HTMLInputElement>('input[type="checkbox"]')!
      const checkbox = screen.getByRole('checkbox')

      expect(input.id).not.toBe('')
      expect(label).toHaveAttribute('for', input.id)

      await user.click(label)
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('prop: onclick', () => {
    it.each(['span', 'button'] as const)(
      'propagates a single click to ancestors (%s)',
      async (as) => {
        const onParentClick = vi.fn()
        render(ClickPropagationCheckbox, { as, onParentClick })

        await fireEvent.click(screen.getByTestId('checkbox'))

        expect(onParentClick).toHaveBeenCalledTimes(1)
        expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-checked', 'true')
      }
    )

    it.each(['span', 'button'] as const)(
      'does not propagate to ancestors when stopPropagation() is called (%s)',
      async (as) => {
        const onParentClick = vi.fn()
        render(ClickPropagationCheckbox, {
          as,
          onParentClick,
          onclick: (event: MouseEvent) => event.stopPropagation()
        })

        await fireEvent.click(screen.getByTestId('checkbox'))

        expect(onParentClick).toHaveBeenCalledTimes(0)
        expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-checked', 'true')
      }
    )
  })

  describe('ARIA attributes', () => {
    it('sets aria-checked to false by default', () => {
      render(BasicCheckbox)
      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it('puts the checkbox role on the rendered element, not the hidden input', () => {
      render(BasicCheckbox)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.tagName.toLowerCase()).toBe('span')
    })

    it('sets aria-required when required', async () => {
      const { rerender } = render(BasicCheckbox, { required: false })
      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).not.toHaveAttribute('aria-required')

      await rerender({ required: true })
      expect(checkbox).toHaveAttribute('aria-required', 'true')
    })

    it('role can be overridden by a consumer prop', () => {
      render(Checkbox.Root, { role: 'switch' })
      expect(screen.getByRole('switch')).toBeInTheDocument()
      expect(screen.queryByRole('checkbox')).toBeNull()
    })
  })

  describe('interactions', () => {
    it('change its state when clicked', async () => {
      render(BasicCheckbox)
      const [checkbox] = screen.getAllByRole('checkbox')
      const [, input] = screen.getAllByRole<HTMLInputElement>('checkbox', { hidden: true })

      expect(checkbox).toHaveAttribute('aria-checked', 'false')
      expect(input.checked).toBe(false)

      await fireEvent.click(checkbox)

      expect(checkbox).toHaveAttribute('aria-checked', 'true')
      expect(input.checked).toBe(true)

      await fireEvent.click(checkbox)

      expect(checkbox).toHaveAttribute('aria-checked', 'false')
      expect(input.checked).toBe(false)
    })

    it('updates state when the underlying input is toggled', async () => {
      render(BasicCheckbox)
      const [checkbox] = screen.getAllByRole('checkbox')
      const [, input] = screen.getAllByRole<HTMLInputElement>('checkbox', { hidden: true })

      await fireEvent.click(input)

      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('does not activate with Enter key', async () => {
      const user = userEvent.setup()
      render(BasicCheckbox)

      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await user.keyboard('[Tab]')
      expect(checkbox).toHaveFocus()

      await user.keyboard('[Enter]')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it('can be activated with Space key', async () => {
      const user = userEvent.setup()
      render(BasicCheckbox)

      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await user.keyboard('[Tab]')
      expect(checkbox).toHaveFocus()

      await user.keyboard('[Space]')
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('call onCheckedChange when clicked', async () => {
      const handleChange = vi.fn()
      render(BasicCheckbox, { onCheckedChange: handleChange })
      const [checkbox] = screen.getAllByRole('checkbox')

      await fireEvent.click(checkbox)

      expect(handleChange.mock.calls.length).toBe(1)
      expect(handleChange.mock.calls[0][0]).toBe(true)
    })

    it('does not change state when the event is canceled', async () => {
      const handleChange = vi.fn()
      render(CheckboxVeto, { onCheckedChange: handleChange })
      const [checkbox, input] = screen.getAllByRole<HTMLInputElement>('checkbox', { hidden: true })

      await fireEvent.click(checkbox)

      expect(handleChange).toHaveBeenCalledOnce()
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
      expect(input.checked).toBe(false)
    })

    it('updates state when changed from outside in controlled mode', async () => {
      render(ControlledCheckbox)
      const [checkbox] = screen.getAllByRole('checkbox')
      const toggleBtn = screen.getByTestId('toggle')

      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(toggleBtn)
      expect(checkbox).toHaveAttribute('aria-checked', 'true')

      await fireEvent.click(toggleBtn)
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: disabled', () => {
    it('uses aria-disabled instead of HTML disabled', () => {
      render(BasicCheckbox, { disabled: true })
      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).not.toHaveAttribute('disabled')
      expect(checkbox).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not change state when clicked', async () => {
      render(BasicCheckbox, { disabled: true })
      const [checkbox] = screen.getAllByRole('checkbox')

      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(checkbox)

      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: readOnly', () => {
    it('have the aria-readonly attribute', () => {
      render(BasicCheckbox, { readOnly: true })
      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-readonly', 'true')
    })

    it('does not have aria-readonly when readOnly is not set', () => {
      render(BasicCheckbox)
      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).not.toHaveAttribute('aria-readonly')
    })

    it('does not change state when clicked', async () => {
      render(BasicCheckbox, { readOnly: true })
      const [checkbox] = screen.getAllByRole('checkbox')

      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(checkbox)

      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it('does not change state when its label is clicked', async () => {
      render(WrappingLabelCheckbox, { readOnly: true })
      const [checkbox] = screen.getAllByRole('checkbox')

      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(screen.getByTestId('label'))

      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: indeterminate', () => {
    it('sets aria-checked to "mixed" when indeterminate', () => {
      render(BasicCheckbox, { indeterminate: true })
      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('does not change state when clicked while indeterminate', async () => {
      render(BasicCheckbox, { indeterminate: true })
      const [checkbox] = screen.getAllByRole('checkbox')

      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')

      await fireEvent.click(checkbox)

      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('does not set aria-checked to "mixed" when indeterminate is not set', () => {
      render(BasicCheckbox)
      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).not.toHaveAttribute('aria-checked', 'mixed')
    })

    it('is not overridden by checked prop', () => {
      render(BasicCheckbox, { indeterminate: true, checked: true })
      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('sets the native input state when indeterminate', () => {
      render(BasicCheckbox, { indeterminate: true })
      const [, input] = screen.getAllByRole<HTMLInputElement>('checkbox', { hidden: true })
      expect(input.indeterminate).toBe(true)
    })

    it('sets indeterminate style hooks on the root and indicator', () => {
      render(CheckboxIndicatorProps, { indeterminate: true })
      expect(screen.getByRole('checkbox')).toHaveAttribute('data-indeterminate', '')
      expect(screen.getByTestId('indicator')).toHaveAttribute('data-indeterminate', '')
    })
  })

  describe('style hooks', () => {
    it('places data-checked on root when checked', () => {
      render(BasicCheckbox, { checked: true })
      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-checked', '')
      expect(checkbox).not.toHaveAttribute('data-unchecked')
    })

    it('places data-disabled, data-readonly and data-required on the root and the indicator', () => {
      render(BasicCheckbox, { checked: true, disabled: true, readOnly: true, required: true })
      const [checkbox] = screen.getAllByRole('checkbox')
      const indicator = checkbox.querySelector('span')

      for (const element of [checkbox, indicator]) {
        expect(element).toHaveAttribute('data-checked', '')
        expect(element).not.toHaveAttribute('data-unchecked')
        expect(element).toHaveAttribute('data-disabled', '')
        expect(element).toHaveAttribute('data-readonly', '')
        expect(element).toHaveAttribute('data-required', '')
      }
    })

    it('transitions from data-checked to data-unchecked after disabling is removed', async () => {
      const { rerender } = render(BasicCheckbox, {
        checked: true,
        disabled: true,
        readOnly: true
      })
      const [checkbox] = screen.getAllByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-checked', '')

      await rerender({ disabled: false, readOnly: false })
      await fireEvent.click(checkbox)

      expect(checkbox).toHaveAttribute('data-unchecked', '')
      expect(checkbox).not.toHaveAttribute('data-checked')
    })
  })

  describe('name attribute on hidden input', () => {
    it('sets the name attribute only on the input — not the root', () => {
      render(BasicCheckbox, { name: 'checkbox-name' })
      const [checkbox] = screen.getAllByRole('checkbox')
      const [, input] = screen.getAllByRole<HTMLInputElement>('checkbox', { hidden: true })

      expect(input).toHaveAttribute('name', 'checkbox-name')
      expect(checkbox).not.toHaveAttribute('name')
    })
  })

  describe('with native <label>', () => {
    it('toggles when a wrapping <label> is clicked', async () => {
      render(WrappingLabelCheckbox)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(screen.getByTestId('label'))
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('toggles when an explicitly linked <label> is clicked', async () => {
      render(LinkedLabelCheckbox)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(screen.getByTestId('label'))
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('change state when clicking the checkbox if it has a wrapping label', async () => {
      render(WrappingLabelCheckbox)
      const [checkbox] = screen.getAllByRole('checkbox')

      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(checkbox)
      expect(checkbox).toHaveAttribute('aria-checked', 'true')

      await fireEvent.click(checkbox)
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('Field integration', () => {
    it('receive disabled prop from Field.Root', () => {
      render(CheckboxInField, { disabled: true })
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('aria-disabled', 'true')
    })

    it('receives name from Field.Root', () => {
      render(CheckboxInField, { name: 'field-checkbox' })
      const [, input] = screen.getAllByRole<HTMLInputElement>('checkbox', { hidden: true })
      expect(input).toHaveAttribute('name', 'field-checkbox')
    })

    it('[data-touched] after focus and blur', async () => {
      render(CheckboxInField)
      const checkbox = screen.getByTestId('checkbox')

      await fireEvent.focus(checkbox)
      await fireEvent.blur(checkbox)

      expect(checkbox).toHaveAttribute('data-touched', '')
    })

    it('[data-dirty] after clicking', async () => {
      render(CheckboxInField)
      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).not.toHaveAttribute('data-dirty')

      await fireEvent.click(checkbox)

      expect(checkbox).toHaveAttribute('data-dirty', '')
    })

    it('[data-filled] is added when checkbox is checked', async () => {
      render(CheckboxInField)
      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).not.toHaveAttribute('data-filled')

      await fireEvent.click(checkbox)

      expect(checkbox).toHaveAttribute('data-filled', '')

      await fireEvent.click(checkbox)

      expect(checkbox).not.toHaveAttribute('data-filled')
    })

    it('[data-filled] is present when checked is initially true', async () => {
      render(CheckboxInField, { checked: true })
      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).toHaveAttribute('data-filled')

      await fireEvent.click(checkbox)

      expect(checkbox).not.toHaveAttribute('data-filled')
    })

    it('Field.Label implicit association sets `for` to the hidden input and toggles on label click', async () => {
      render(CheckboxImplicitFieldLabel)
      const label = screen.getByTestId('label')
      const input = document.querySelector('input[type="checkbox"]')

      expect(label.getAttribute('for')).not.toBe(null)
      expect(label.getAttribute('for')).toBe(input?.getAttribute('id'))

      const checkbox = screen.getByRole('checkbox')
      expect(label.getAttribute('id')).not.toBe(null)
      expect(checkbox.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))

      expect(checkbox).toHaveAttribute('aria-checked', 'false')
      await fireEvent.click(screen.getByText('OK'))
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('[data-focused] is added on focus and removed on blur', async () => {
      render(CheckboxInField)
      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).not.toHaveAttribute('data-focused')

      await fireEvent.focus(checkbox)

      expect(checkbox).toHaveAttribute('data-focused', '')

      await fireEvent.blur(checkbox)

      expect(checkbox).not.toHaveAttribute('data-focused')
    })

    it('does not set [data-focused] when disabled', async () => {
      render(CheckboxInField, { disabled: true })
      const checkbox = screen.getByTestId('checkbox')

      await fireEvent.focus(checkbox)

      expect(checkbox).not.toHaveAttribute('data-focused')
    })

    it('validates once when changed by the user', async () => {
      const user = userEvent.setup()
      const validate = vi.fn()
      render(CheckboxValidation, { validationMode: 'onChange', validate })

      await user.click(screen.getByTestId('checkbox'))

      expect(validate).toHaveBeenCalledTimes(1)
      expect(validate.mock.lastCall?.[0]).toBe(true)
    })

    it('Field.Label explicit association wires `for`/`aria-labelledby` on siblings', () => {
      render(CheckboxWithFieldLabel)
      const label = screen.getByText('Label')
      expect(label.getAttribute('id')).not.toBe(null)

      const input = document.querySelector('input[type="checkbox"]')
      expect(label.getAttribute('for')).toBe(input?.getAttribute('id'))

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
    })

    it('Field.Label explicit association toggles the checkbox when clicked', async () => {
      render(CheckboxWithFieldLabel)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(screen.getByText('Label'))
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('Field.Description merges external aria-describedby with the description id', () => {
      render(DescribedBy)
      const checkbox = screen.getByRole('checkbox')
      const description = screen.getByTestId('description')

      expect(checkbox).toHaveAttribute('aria-describedby', `external-description ${description.id}`)
    })

    it('adds [data-filled] when any checkbox is filled inside a group', async () => {
      render(CheckboxGroupFilled)
      const checkbox1 = screen.getByTestId('checkbox-1')
      const checkbox2 = screen.getByTestId('checkbox-2')

      expect(checkbox1).toHaveAttribute('data-filled')
      expect(checkbox2).toHaveAttribute('data-filled')

      await fireEvent.click(checkbox1)

      expect(checkbox1).toHaveAttribute('data-filled')
      expect(checkbox2).toHaveAttribute('data-filled')

      await fireEvent.click(checkbox2)

      expect(checkbox1).not.toHaveAttribute('data-filled')
      expect(checkbox2).not.toHaveAttribute('data-filled')
    })

    it('revalidates when the controlled value changes externally', async () => {
      const validate = vi.fn((value: unknown) => ((value as boolean) ? 'error' : null))
      render(CheckboxRevalidateExternal, { validate })

      const checkbox = screen.getByTestId('checkbox')
      const toggle = screen.getByText('Toggle externally')

      expect(checkbox).not.toHaveAttribute('aria-invalid')
      const initialCallCount = validate.mock.calls.length

      await fireEvent.click(toggle)

      expect(validate.mock.calls.length).toBe(initialCallCount + 1)
      expect(validate.mock.lastCall?.[0]).toBe(true)
      expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    })

    it('commits validity against the flushed input when the controlled value changes externally', async () => {
      render(CheckboxRevalidateExternal, { required: true })

      const checkbox = screen.getByTestId('checkbox')
      const toggle = screen.getByText('Toggle externally')

      expect(checkbox).not.toHaveAttribute('aria-invalid')

      await fireEvent.click(toggle)

      expect(checkbox).not.toHaveAttribute('aria-invalid')
      expect(checkbox).not.toHaveAttribute('data-invalid')
    })

    it('[data-invalid] when Field.Root invalid=true', () => {
      render(CheckboxValidation, { invalid: true })
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('data-invalid', '')
    })

    it('[data-valid] after clicking + focus + blur with required checkbox', async () => {
      render(CheckboxValidation, { validationMode: 'onBlur', required: true })
      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).not.toHaveAttribute('data-valid')
      expect(checkbox).not.toHaveAttribute('data-invalid')

      await fireEvent.click(checkbox)
      await fireEvent.focus(checkbox)
      await fireEvent.blur(checkbox)

      expect(checkbox).toHaveAttribute('data-valid', '')
      expect(checkbox).not.toHaveAttribute('data-invalid')
    })
  })

  describe('as="button"', () => {
    it('renders a <button> element with role checkbox', () => {
      render(ButtonCheckbox)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.tagName.toLowerCase()).toBe('button')
    })

    it('places id on the button element — not the hidden input', () => {
      render(ButtonCheckbox, { id: 'my-checkbox' })
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('id', 'my-checkbox')

      const hiddenInputs = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      const hiddenInput = Array.from(hiddenInputs).find((el) => el !== checkbox)
      expect(hiddenInput).not.toBe(undefined)
      expect(hiddenInput).not.toHaveAttribute('id', 'my-checkbox')
    })

    it('does not activate with Enter, activates with Space and toggles on click', async () => {
      const user = userEvent.setup()
      render(ButtonCheckbox)
      const checkbox = screen.getByRole('checkbox')

      await user.keyboard('[Tab]')
      expect(checkbox).toHaveFocus()

      await user.keyboard('[Enter]')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await user.keyboard('[Space]')
      expect(checkbox).toHaveAttribute('aria-checked', 'true')

      await user.click(checkbox)
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it('toggles when a <label> linked to the button id is clicked', async () => {
      render(ButtonCheckbox, { id: 'my-checkbox' })
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(screen.getByTestId('label'))
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('validationMode=onChange', () => {
    it('marks aria-invalid immediately when validate returns error on change', async () => {
      const validate = vi.fn((value: unknown) => ((value as boolean) ? 'error' : null))
      render(CheckboxValidation, { validationMode: 'onChange', validate })
      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).not.toHaveAttribute('aria-invalid')

      await fireEvent.click(checkbox)

      expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('validationMode=onBlur', () => {
    it('marks aria-invalid only after blur when validate returns error', async () => {
      const validate = vi.fn((value: unknown) => ((value as boolean) ? 'error' : null))
      render(CheckboxValidation, { validationMode: 'onBlur', validate })
      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).not.toHaveAttribute('aria-invalid')

      await fireEvent.click(checkbox)
      expect(checkbox).not.toHaveAttribute('aria-invalid')

      await fireEvent.blur(checkbox)
      expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('validationMode=onSubmit', () => {
    it('does not mark invalid before submit — marks invalid after submit with required unchecked', async () => {
      render(CheckboxValidation, { validationMode: 'onSubmit', required: true, useForm: true })
      const checkbox = screen.getByTestId('checkbox')
      const submit = screen.getByTestId('submit')

      expect(checkbox).not.toHaveAttribute('aria-invalid')

      await fireEvent.click(checkbox)
      await fireEvent.click(checkbox)
      expect(checkbox).not.toHaveAttribute('aria-invalid')

      await fireEvent.click(submit)
      await waitFor(() => expect(checkbox).toHaveAttribute('aria-invalid', 'true'))

      await fireEvent.click(checkbox)
      await waitFor(() => expect(checkbox).not.toHaveAttribute('aria-invalid'))
    })

    it('revalidates on every toggle once a submit has been attempted', async () => {
      render(CheckboxValidation, { validationMode: 'onSubmit', required: true, useForm: true })
      const checkbox = screen.getByTestId('checkbox')
      const submit = screen.getByTestId('submit')

      await fireEvent.click(submit)
      await waitFor(() => expect(checkbox).toHaveAttribute('aria-invalid', 'true'))

      await fireEvent.click(checkbox)
      expect(checkbox).toHaveAttribute('data-checked', '')
      await waitFor(() => expect(checkbox).not.toHaveAttribute('aria-invalid'))

      await fireEvent.click(checkbox)
      expect(checkbox).toHaveAttribute('data-unchecked', '')
      await waitFor(() => expect(checkbox).toHaveAttribute('aria-invalid'))

      await fireEvent.click(checkbox)
      expect(checkbox).toHaveAttribute('data-checked', '')
      await waitFor(() => expect(checkbox).not.toHaveAttribute('aria-invalid'))
    })
  })

  describe('Form', () => {
    it('triggers native HTML validation on submit', async () => {
      const user = userEvent.setup()
      render(CheckboxNativeValidation)

      expect(screen.queryByTestId('error')).toBeNull()

      await user.click(screen.getByText('Submit'))

      await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('required'))
    })

    it('clears external errors on change', async () => {
      render(CheckboxExternalErrors)
      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('error')).toHaveTextContent('test')

      await fireEvent.click(checkbox)

      expect(checkbox).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByTestId('error')).toBeNull()
    })

    it.skipIf(isJSDOM)(
      'includes the checkbox value in form submission (default `on`)',
      async () => {
        const submitSpy = vi.fn((event: SubmitEvent) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget as HTMLFormElement)
          return formData.get('test-checkbox')
        })
        render(Form, { onsubmit: submitSpy })

        const checkbox = screen.getByRole('checkbox')
        const submitButton = screen.getByRole('button')

        submitButton.click()
        expect(submitSpy.mock.calls.length).toBe(1)
        expect(submitSpy.mock.results.at(-1)?.value).toBe(null)

        checkbox.click()
        submitButton.click()
        expect(submitSpy.mock.calls.length).toBe(2)
        expect(submitSpy.mock.results.at(-1)?.value).toBe('on')
      }
    )

    it.skipIf(isJSDOM)('submits the form when Enter is pressed while focused', async () => {
      const user = userEvent.setup()
      const submitSpy = vi.fn((event: SubmitEvent) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        return {
          value: formData.get('test-checkbox'),
          submitter: event.submitter
        }
      })
      const submitClickSpy = vi.fn()
      render(Form, { onsubmit: submitSpy, onSubmitClick: submitClickSpy })

      const checkbox = screen.getByRole('checkbox')

      await user.keyboard('[Tab]')
      expect(checkbox).toHaveFocus()

      await user.keyboard('[Enter]')

      expect(submitSpy.mock.calls.length).toBe(1)
      expect(submitSpy.mock.results.at(-1)?.value.value).toBe(null)
      expect(submitSpy.mock.results.at(-1)?.value.submitter).toBe(
        screen.getByRole('button', { name: 'Submit' })
      )
      expect(submitClickSpy.mock.calls.length).toBe(1)
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it.skipIf(isJSDOM)(
      'does not submit with Enter when the consumer prevents default',
      async () => {
        const user = userEvent.setup()
        const submitSpy = vi.fn((event: SubmitEvent) => event.preventDefault())
        render(Form, {
          onsubmit: submitSpy,
          onkeydown: (event: KeyboardEvent) => event.preventDefault()
        })

        const checkbox = screen.getByRole('checkbox')

        await user.keyboard('[Tab]')
        expect(checkbox).toHaveFocus()

        await user.keyboard('[Enter]')

        expect(submitSpy.mock.calls.length).toBe(0)
        expect(checkbox).toHaveAttribute('aria-checked', 'false')
      }
    )

    it.skipIf(isJSDOM)('does not submit with Enter when an ancestor prevents default', async () => {
      const user = userEvent.setup()
      const submitSpy = vi.fn((event: SubmitEvent) => event.preventDefault())
      render(Form, {
        onsubmit: submitSpy,
        onFormKeydown: (event: KeyboardEvent) => event.preventDefault()
      })

      const checkbox = screen.getByRole('checkbox')

      await user.keyboard('[Tab]')
      expect(checkbox).toHaveFocus()

      await user.keyboard('[Enter]')

      expect(submitSpy.mock.calls.length).toBe(0)
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it.skipIf(isJSDOM)('submits the form with Enter when readOnly', async () => {
      const user = userEvent.setup()
      const submitSpy = vi.fn((event: SubmitEvent) => {
        event.preventDefault()
        return event.submitter
      })
      render(Form, { onsubmit: submitSpy, readOnly: true })

      const checkbox = screen.getByRole('checkbox')

      await user.keyboard('[Tab]')
      expect(checkbox).toHaveFocus()

      await user.keyboard('[Enter]')

      expect(submitSpy.mock.calls.length).toBe(1)
      expect(submitSpy.mock.results.at(-1)?.value).toBe(
        screen.getByRole('button', { name: 'Submit' })
      )
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it.skipIf(isJSDOM)(
      'submits the form once with Enter when rendered as a native button',
      async () => {
        const user = userEvent.setup()
        const submitSpy = vi.fn((event: SubmitEvent) => {
          event.preventDefault()
          return event.submitter
        })
        const submitClickSpy = vi.fn()
        render(Form, { onsubmit: submitSpy, as: 'button', onSubmitClick: submitClickSpy })

        const checkbox = screen.getByRole('checkbox')

        await user.keyboard('[Tab]')
        expect(checkbox).toHaveFocus()

        await user.keyboard('[Enter]')

        expect(submitSpy.mock.calls.length).toBe(1)
        expect(submitSpy.mock.results.at(-1)?.value).toBe(
          screen.getByRole('button', { name: 'Submit' })
        )
        expect(submitClickSpy.mock.calls.length).toBe(1)
        expect(checkbox).toHaveAttribute('aria-checked', 'false')
      }
    )

    it.skipIf(isJSDOM)(
      'does not submit with Enter when the default submit button is disabled',
      async () => {
        const user = userEvent.setup()
        const submitSpy = vi.fn((event: SubmitEvent) => event.preventDefault())
        render(FormDisabledSubmit, { onsubmit: submitSpy })

        const checkbox = screen.getByRole('checkbox')

        await user.keyboard('[Tab]')
        expect(checkbox).toHaveFocus()

        await user.keyboard('[Enter]')

        expect(submitSpy.mock.calls.length).toBe(0)
        expect(checkbox).toHaveAttribute('aria-checked', 'false')
      }
    )

    it.skipIf(isJSDOM)('does not submit with Enter when there is no submit button', async () => {
      const user = userEvent.setup()
      const submitSpy = vi.fn((event: SubmitEvent) => event.preventDefault())
      render(FormNoSubmit, { onsubmit: submitSpy })

      const checkbox = screen.getByRole('checkbox')

      await user.keyboard('[Tab]')
      expect(checkbox).toHaveFocus()

      await user.keyboard('[Enter]')

      expect(submitSpy.mock.calls.length).toBe(0)
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it.skipIf(isJSDOM)('submits to an external form when `form` is provided (click)', async () => {
      const user = userEvent.setup()
      const submitSpy = vi.fn((event: SubmitEvent) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        return formData.get('test-checkbox')
      })
      render(ExternalForm, { onsubmit: submitSpy })

      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button'))

      expect(submitSpy.mock.calls.length).toBe(1)
      expect(submitSpy.mock.results.at(-1)?.value).toBe('on')
    })

    it.skipIf(isJSDOM)(
      'submits to an external form with Enter when `form` is provided',
      async () => {
        const user = userEvent.setup()
        const submitSpy = vi.fn((event: SubmitEvent) => {
          event.preventDefault()
          return event.submitter
        })
        render(ExternalForm, { onsubmit: submitSpy, checkboxFirst: true })

        const checkbox = screen.getByRole('checkbox')

        await user.keyboard('[Tab]')
        expect(checkbox).toHaveFocus()

        await user.keyboard('[Enter]')

        expect(submitSpy.mock.calls.length).toBe(1)
        expect(submitSpy.mock.results.at(-1)?.value).toBe(screen.getByRole('button'))
        expect(checkbox).toHaveAttribute('aria-checked', 'false')
      }
    )

    it.skipIf(isJSDOM)('submits custom value in form submission', async () => {
      const submitSpy = vi.fn((event: SubmitEvent) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        return formData.get('test-checkbox')
      })
      render(Form, { onsubmit: submitSpy, value: 'test-value' })

      const checkbox = screen.getByRole('checkbox')
      const submitButton = screen.getByRole('button')

      submitButton.click()
      expect(submitSpy.mock.results.at(-1)?.value).toBe(null)

      checkbox.click()
      submitButton.click()
      expect(submitSpy.mock.results.at(-1)?.value).toBe('test-value')
    })

    it.skipIf(isJSDOM)('matches native checkbox form submission behavior', async () => {
      const nativeSubmitSpy = vi.fn((event: SubmitEvent) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        return { get: formData.get('native'), getAll: formData.getAll('native') }
      })
      const customSubmitSpy = vi.fn((event: SubmitEvent) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        return { get: formData.get('test-checkbox'), getAll: formData.getAll('test-checkbox') }
      })

      render(NativeForm, { onsubmit: nativeSubmitSpy })
      const nativeCheckbox = screen.getByRole('checkbox')
      const nativeSubmitButton = screen.getByRole('button')

      nativeSubmitButton.click()
      expect(nativeSubmitSpy.mock.results.at(-1)?.value.get).toBe(null)
      expect(nativeSubmitSpy.mock.results.at(-1)?.value.getAll).toEqual([])

      nativeCheckbox.click()
      nativeSubmitButton.click()
      expect(nativeSubmitSpy.mock.results.at(-1)?.value.get).toBe('on')

      cleanup()

      render(Form, { onsubmit: customSubmitSpy })
      const customCheckbox = screen.getByRole('checkbox')
      const customSubmitButton = screen.getByRole('button')

      customSubmitButton.click()
      expect(customSubmitSpy.mock.results.at(-1)?.value.get).toBe(null)
      expect(customSubmitSpy.mock.results.at(-1)?.value.getAll).toEqual([])

      customCheckbox.click()
      customSubmitButton.click()
      expect(customSubmitSpy.mock.results.at(-1)?.value.get).toBe('on')
    })
  })

  describe('fallback aria-labelledby', () => {
    it('sets `aria-labelledby` from a sibling label associated with the hidden input', () => {
      render(CheckboxSiblingLabel)
      const label = screen.getByText('Label A')
      expect(label.id).not.toBe('')
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-labelledby', label.id)
    })

    it.skipIf(isGecko || isWebKit)(
      'updates fallback `aria-labelledby` when the hidden input id changes',
      async () => {
        const { rerender } = render(CheckboxSiblingLabel, { id: 'checkbox-input-a' })

        const checkbox = screen.getByRole('checkbox')
        const labelA = screen.getByText('Label A')

        expect(labelA.id).not.toBe('')
        expect(checkbox).toHaveAttribute('aria-labelledby', labelA.id)

        await rerender({ id: 'checkbox-input-b' })

        await waitFor(() => {
          const labelB = screen.getByText('Label B')
          expect(labelB.id).not.toBe('')
          expect(labelA.id).not.toBe(labelB.id)
          expect(checkbox).toHaveAttribute('aria-labelledby', labelB.id)
        })
      }
    )
  })
})
