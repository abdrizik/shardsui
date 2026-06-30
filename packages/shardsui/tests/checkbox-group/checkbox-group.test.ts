import { CheckboxGroup } from '$lib/components/checkbox-group'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AllDisabledInvalidFocus from './fixtures/all-disabled-invalid-focus.svelte'
import BasicCheckboxGroup from './fixtures/basic-checkbox-group.svelte'
import CheckboxGroupErrorDescribedBy from './fixtures/checkbox-group-error-described-by.svelte'
import CheckboxGroupFormError from './fixtures/checkbox-group-form-error.svelte'
import CheckboxGroupFormSubmit from './fixtures/checkbox-group-form-submit.svelte'
import CheckboxGroupValidateSubmit from './fixtures/checkbox-group-validate-submit.svelte'
import ControlledCheckboxGroup from './fixtures/controlled-checkbox-group.svelte'
import DecliningPlainCheckboxGroup from './fixtures/declining-plain-checkbox-group.svelte'
import DisabledPrecedenceCheckboxGroup from './fixtures/disabled-precedence-checkbox-group.svelte'
import DisabledRepresentativeFocus from './fixtures/disabled-representative-focus.svelte'
import DuplicateRegistrationSubmit from './fixtures/duplicate-registration-submit.svelte'
import EmptyGroupValidate from './fixtures/empty-group-validate.svelte'
import EmptyValueCheckboxGroup from './fixtures/empty-value-checkbox-group.svelte'
import ExplicitLabelCheckboxGroup from './fixtures/explicit-label-checkbox-group.svelte'
import FieldCustomDisableToggle from './fixtures/field-custom-disable-toggle.svelte'
import FieldCustomToggle from './fixtures/field-custom-toggle.svelte'
import FieldLabelCheckboxGroup from './fixtures/field-label-checkbox-group.svelte'
import FieldRequiredDisabled from './fixtures/field-required-disabled.svelte'
import FieldRequiredMode from './fixtures/field-required-mode.svelte'
import FieldRequiredTwo from './fixtures/field-required-two.svelte'
import FieldRequiredUnmount from './fixtures/field-required-unmount.svelte'
import FieldValidationCheckboxGroup from './fixtures/field-validation-checkbox-group.svelte'
import FieldsetDisabledFocus from './fixtures/fieldset-disabled-focus.svelte'
import FormOwnerChange from './fixtures/form-owner-change.svelte'
import FormRequiredExternal from './fixtures/form-required-external.svelte'
import FormValuesDisabled from './fixtures/form-values-disabled.svelte'
import FormValuesExternal from './fixtures/form-values-external.svelte'
import FormValuesFieldset from './fixtures/form-values-fieldset.svelte'
import FormValuesImplicitName from './fixtures/form-values-implicit-name.svelte'
import FormValuesUnmount from './fixtures/form-values-unmount.svelte'
import GroupDescriptionCheckboxGroup from './fixtures/group-description-checkbox-group.svelte'
import IdCheckboxGroup from './fixtures/id-checkbox-group.svelte'
import InputlessCustomError from './fixtures/inputless-custom-error.svelte'
import InputlessInvalidFocus from './fixtures/inputless-invalid-focus.svelte'
import InputlessOnChange from './fixtures/inputless-on-change.svelte'
import InputlessValidationMode from './fixtures/inputless-validation-mode.svelte'
import InvalidCheckboxFocus from './fixtures/invalid-checkbox-focus.svelte'
import PortaledCheckboxFormAttr from './fixtures/portaled-checkbox-form-attr.svelte'
import PortaledCheckboxForm from './fixtures/portaled-checkbox-form.svelte'
import PortaledExternalFormCheckbox from './fixtures/portaled-external-form-checkbox.svelte'
import PortaledGroupForm from './fixtures/portaled-group-form.svelte'
import PortaledRequiredCheckbox from './fixtures/portaled-required-checkbox.svelte'
import RevalidateExternalCheckboxGroup from './fixtures/revalidate-external-checkbox-group.svelte'
import UndefinedValueCheckboxGroup from './fixtures/undefined-value-checkbox-group.svelte'
import UnmountAllRequired from './fixtures/unmount-all-required.svelte'
import UnmountAllValidate from './fixtures/unmount-all-validate.svelte'
import UnmountFirstFocus from './fixtures/unmount-first-focus.svelte'
import UnmountValidationMode from './fixtures/unmount-validation-mode.svelte'

describe('<CheckboxGroup />', () => {
  describe('prop: initial value', () => {
    it('pre-checks checkboxes matching initial value', () => {
      render(BasicCheckboxGroup, { value: ['red'] })
      expect(screen.getByTestId('red')).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByTestId('green')).toHaveAttribute('aria-checked', 'false')
      expect(screen.getByTestId('blue')).toHaveAttribute('aria-checked', 'false')
    })

    it('treats omitted value as empty array', async () => {
      const handleValueChange = vi.fn()
      render(BasicCheckboxGroup, { onValueChange: handleValueChange })

      const red = screen.getByTestId('red')
      const green = screen.getByTestId('green')

      await fireEvent.click(red)
      expect(handleValueChange.mock.calls[0][0]).toEqual(['red'])

      await fireEvent.click(green)
      expect(handleValueChange.mock.calls[1][0]).toEqual(['red', 'green'])

      await fireEvent.click(red)
      expect(handleValueChange.mock.calls[2][0]).toEqual(['green'])
    })

    it('allows toggling checkboxes after initial value', async () => {
      const user = userEvent.setup()
      render(BasicCheckboxGroup, { value: ['red'] })
      const green = screen.getByTestId('green')
      await user.click(green)
      expect(screen.getByTestId('red')).toHaveAttribute('aria-checked', 'true')
      expect(green).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByTestId('blue')).toHaveAttribute('aria-checked', 'false')
    })

    it('supports an empty string item value', async () => {
      render(EmptyValueCheckboxGroup)

      const empty = screen.getByTestId('empty')
      const other = screen.getByTestId('other')

      expect(empty).toHaveAttribute('aria-checked', 'true')
      expect(other).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(empty)

      expect(empty).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('controlled value', () => {
    it('reflects controlled value in aria-checked', () => {
      render(BasicCheckboxGroup, { value: ['green'] })
      expect(screen.getByTestId('red')).toHaveAttribute('aria-checked', 'false')
      expect(screen.getByTestId('green')).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByTestId('blue')).toHaveAttribute('aria-checked', 'false')
    })

    it('clicking green updates value through onValueChange', async () => {
      const setValue = vi.fn()
      render(BasicCheckboxGroup, { value: ['red'], onValueChange: setValue })
      await fireEvent.click(screen.getByTestId('green'))
      expect(setValue.mock.calls.length).toBe(1)
      expect(setValue.mock.calls[0][0]).toEqual(['red', 'green'])
    })

    it('clicking a checked checkbox removes it from the controlled value', async () => {
      const setValue = vi.fn()
      render(BasicCheckboxGroup, { value: ['red', 'green'], onValueChange: setValue })
      await fireEvent.click(screen.getByTestId('green'))
      expect(setValue.mock.calls.length).toBe(1)
      expect(setValue.mock.calls[0][0]).toEqual(['red'])
    })

    it('reflects every step of a live controlled value in the DOM', async () => {
      render(ControlledCheckboxGroup)

      const red = screen.getByTestId('red')
      const green = screen.getByTestId('green')
      const blue = screen.getByTestId('blue')

      await fireEvent.click(green)
      expect(red).toHaveAttribute('aria-checked', 'false')
      expect(green).toHaveAttribute('aria-checked', 'true')
      expect(blue).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(blue)
      expect(red).toHaveAttribute('aria-checked', 'false')
      expect(green).toHaveAttribute('aria-checked', 'true')
      expect(blue).toHaveAttribute('aria-checked', 'true')

      await fireEvent.click(green)
      expect(red).toHaveAttribute('aria-checked', 'false')
      expect(green).toHaveAttribute('aria-checked', 'false')
      expect(blue).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('prop: value', () => {
    it('treats a controlled value that becomes undefined as an empty array', async () => {
      render(UndefinedValueCheckboxGroup)

      expect(screen.getByTestId('red')).toHaveAttribute('aria-checked', 'true')

      await fireEvent.click(screen.getByText('Clear'))

      expect(screen.getByTestId('red')).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: onValueChange', () => {
    it('fires with updated array when a checkbox is checked', async () => {
      const handleValueChange = vi.fn()
      const user = userEvent.setup()
      render(BasicCheckboxGroup, { value: [], onValueChange: handleValueChange })

      await user.click(screen.getByTestId('red'))
      expect(handleValueChange.mock.calls.length).toBe(1)
      expect(handleValueChange.mock.calls[0][0]).toEqual(['red'])

      await user.click(screen.getByTestId('green'))
      expect(handleValueChange.mock.calls.length).toBe(2)
      expect(handleValueChange.mock.calls[1][0]).toEqual(['red', 'green'])

      await user.click(screen.getByTestId('blue'))
      expect(handleValueChange.mock.calls.length).toBe(3)
      expect(handleValueChange.mock.calls[2][0]).toEqual(['red', 'green', 'blue'])
    })
  })

  describe('prop: disabled', () => {
    it('disables all checkboxes when group is disabled', () => {
      render(BasicCheckboxGroup, { disabled: true })
      expect(screen.getByTestId('red')).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByTestId('green')).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByTestId('blue')).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not disable checkboxes when group disabled is false', () => {
      render(BasicCheckboxGroup, { disabled: false })
      expect(screen.getByTestId('red')).not.toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByTestId('green')).not.toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByTestId('blue')).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('takes precedence over individual checkboxes', () => {
      render(DisabledPrecedenceCheckboxGroup)
      expect(screen.getByTestId('red')).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByTestId('green')).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByTestId('blue')).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('declining value binding', () => {
    it('does not update a group without a parent when a child change is declined', async () => {
      const handleValueChange = vi.fn()
      render(DecliningPlainCheckboxGroup, { onValueChange: handleValueChange })

      const red = screen.getByTestId('red')
      const green = screen.getByTestId('green')

      await fireEvent.click(red)

      expect(handleValueChange.mock.calls.length).toBe(1)
      expect(handleValueChange.mock.calls[0][0]).toEqual(['red'])
      expect(red).toHaveAttribute('aria-checked', 'false')
      expect(green).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('Field', () => {
    it('prop: validationMode=onChange — validates on every change', async () => {
      const validateSpy = vi.fn((value: unknown) => {
        const v = value as string[]
        return v.includes('one') ? 'error' : null
      })

      render(FieldValidationCheckboxGroup, {
        validate: validateSpy,
        validationMode: 'onChange',
        value: ['one']
      })

      const checkboxes = screen.getAllByTestId('checkbox')
      const [checkbox1, checkbox2, checkbox3] = checkboxes
      checkboxes.forEach((cb) => expect(cb).not.toHaveAttribute('aria-invalid'))

      await fireEvent.click(checkbox1)
      checkboxes.forEach((cb) => expect(cb).not.toHaveAttribute('aria-invalid'))
      expect(validateSpy.mock.calls.length).toBe(1)
      expect(validateSpy.mock.lastCall?.[0]).toEqual([])

      await fireEvent.click(checkbox2)
      checkboxes.forEach((cb) => expect(cb).not.toHaveAttribute('aria-invalid'))
      expect(validateSpy.mock.calls.length).toBe(2)
      expect(validateSpy.mock.lastCall?.[0]).toEqual(['two'])

      await fireEvent.click(checkbox1)
      checkboxes.forEach((cb) => expect(cb).toHaveAttribute('aria-invalid', 'true'))
      expect(validateSpy.mock.calls.length).toBe(3)
      expect(validateSpy.mock.lastCall?.[0]).toEqual(['two', 'one'])

      await fireEvent.click(checkbox3)
      checkboxes.forEach((cb) => expect(cb).toHaveAttribute('aria-invalid', 'true'))
    })

    it('prop: validationMode=onBlur — validates on blur', async () => {
      const validateSpy = vi.fn((value: unknown) => {
        const v = value as string[]
        return v.includes('one') ? 'error' : null
      })

      render(FieldValidationCheckboxGroup, {
        validate: validateSpy,
        validationMode: 'onBlur',
        value: ['one']
      })

      const checkboxes = screen.getAllByTestId('checkbox')
      const [checkbox1, , checkbox3] = checkboxes

      checkboxes.forEach((cb) => expect(cb).not.toHaveAttribute('aria-invalid'))

      await fireEvent.click(checkbox1)
      expect(validateSpy.mock.calls.length).toBe(0)
      await fireEvent.blur(checkbox1)
      expect(validateSpy.mock.calls.length).toBe(1)
      expect(validateSpy.mock.lastCall?.[0]).toEqual([])

      checkboxes.forEach((cb) => expect(cb).not.toHaveAttribute('aria-invalid'))

      await fireEvent.click(checkbox3)
      expect(validateSpy.mock.calls.length).toBe(1)
      await fireEvent.blur(checkbox3)
      expect(validateSpy.mock.calls.length).toBe(2)
      expect(validateSpy.mock.lastCall?.[0]).toEqual(['three'])

      checkboxes.forEach((cb) => expect(cb).not.toHaveAttribute('aria-invalid'))

      await fireEvent.click(checkbox1)
      expect(validateSpy.mock.calls.length).toBe(2)
      await fireEvent.blur(checkbox1)
      expect(validateSpy.mock.calls.length).toBe(3)
      expect(validateSpy.mock.lastCall?.[0]).toEqual(['three', 'one'])

      checkboxes.forEach((cb) => expect(cb).toHaveAttribute('aria-invalid', 'true'))
    })

    it('keeps a required error while another required checkbox in the group is unchecked', async () => {
      const user = userEvent.setup()
      render(FieldRequiredTwo)

      const checkboxes = screen.getAllByTestId('checkbox')

      await user.click(screen.getByText('submit'))
      expect(screen.getByTestId('error')).toHaveTextContent('required')

      await user.click(checkboxes[1])
      await user.click(screen.getByText('submit'))
      expect(screen.getByTestId('error')).toHaveTextContent('required')

      await user.click(checkboxes[0])
      await user.click(screen.getByText('submit'))
      expect(screen.queryByTestId('error')).toBe(null)
    })

    it('ignores a disabled required checkbox when validating the group', async () => {
      const user = userEvent.setup()
      render(FieldRequiredDisabled)

      await user.click(screen.getByText('submit'))
      expect(screen.getByTestId('error')).toHaveTextContent('required')

      // A disabled checkbox is barred from constraint validation.
      await user.click(screen.getByTestId('cb-enabled'))
      await user.click(screen.getByText('submit'))
      expect(screen.queryByTestId('error')).toBe(null)
    })

    it('keeps validating the remaining required checkbox after a checked sibling unmounts', async () => {
      const user = userEvent.setup()
      render(FieldRequiredUnmount)

      await user.click(screen.getByText('submit'))
      expect(screen.getByTestId('error')).toHaveTextContent('required')

      await user.click(screen.getByTestId('checkbox-https'))
      await user.click(screen.getByText('remove'))
      await user.click(screen.getByText('submit'))
      expect(screen.getByTestId('error')).toHaveTextContent('required')

      await user.click(screen.getByTestId('checkbox-http'))
      await user.click(screen.getByText('submit'))
      expect(screen.queryByTestId('error')).toBe(null)
    })

    it('validationMode=onChange keeps the error until every required checkbox is ticked', async () => {
      const user = userEvent.setup()
      render(FieldRequiredMode, { validationMode: 'onChange' })

      expect(screen.queryByTestId('error')).toBe(null)

      await user.click(screen.getByTestId('cb-https'))
      expect(screen.getByTestId('error')).toHaveTextContent('required')

      await user.click(screen.getByTestId('cb-http'))
      expect(screen.queryByTestId('error')).toBe(null)
    })

    it('validationMode=onBlur keeps the error until every required checkbox is ticked', async () => {
      const user = userEvent.setup()
      render(FieldRequiredMode, { validationMode: 'onBlur' })

      await user.click(screen.getByTestId('cb-https'))
      expect(screen.queryByTestId('error')).toBe(null)

      await fireEvent.blur(screen.getByTestId('cb-https'))
      expect(screen.getByTestId('error')).toHaveTextContent('required')

      await user.click(screen.getByTestId('cb-http'))
      expect(screen.queryByTestId('error')).toBe(null)
    })

    it('does not leave a stale custom error when toggling checkboxes in a group', async () => {
      const validateSpy = vi.fn((value: unknown) =>
        (value as string[]).length < 2 ? 'pick two' : null
      )
      render(FieldCustomToggle, { validate: validateSpy })

      const http = screen.getByTestId('cb-http')
      const https = screen.getByTestId('cb-https')

      await fireEvent.click(http)
      expect(http).toHaveAttribute('aria-invalid', 'true')

      await fireEvent.click(https)
      expect(http).not.toHaveAttribute('aria-invalid')
      expect(https).not.toHaveAttribute('aria-invalid')

      await fireEvent.click(http)
      expect(https).toHaveAttribute('aria-invalid', 'true')
    })

    it('clears custom validity from disabled registered inputs when the group becomes valid', async () => {
      const user = userEvent.setup()
      render(FieldCustomDisableToggle)

      await user.click(screen.getByTestId('cb-http'))

      const httpInput = document.querySelector<HTMLInputElement>(
        'input[type="checkbox"][value="http"]'
      )
      expect(httpInput?.validity.customError).toBe(true)

      await user.click(screen.getByText('disable'))
      await user.click(screen.getByTestId('cb-https'))

      expect(httpInput?.validity.customError).toBe(false)
    })

    it('prop: validationMode=onSubmit, continues revalidating after the first submit', async () => {
      const validateSpy = vi.fn((value: unknown) => {
        const v = value as string[]
        if (v.length === 0) return 'custom error 1'
        if (v.length < 2) return 'custom error 2'
        if (v.includes('two')) return 'custom error 3'
        return null
      })
      const user = userEvent.setup()
      render(FieldValidationCheckboxGroup, { validate: validateSpy, value: [] })

      const checkboxes = screen.getAllByTestId('checkbox')
      const [checkbox1, checkbox2, checkbox3] = checkboxes
      checkboxes.forEach((cb) => expect(cb).not.toHaveAttribute('aria-invalid'))

      await user.click(checkbox2)
      checkboxes.forEach((cb) => expect(cb).not.toHaveAttribute('aria-invalid'))

      await user.click(screen.getByText('submit'))
      checkboxes.forEach((cb) => expect(cb).toHaveAttribute('aria-invalid'))

      await user.click(checkbox1)
      expect(validateSpy.mock.lastCall?.[0]).toEqual(['two', 'one'])
      checkboxes.forEach((cb) => expect(cb).toHaveAttribute('aria-invalid'))

      await user.click(checkbox2)
      await user.click(checkbox3)
      expect(validateSpy.mock.lastCall?.[0]).toEqual(['one', 'three'])
      checkboxes.forEach((cb) => expect(cb).not.toHaveAttribute('aria-invalid'))
    })
  })

  describe('Field.Label', () => {
    it('implicit association — label wraps checkbox', async () => {
      const changeSpy = vi.fn()
      render(FieldLabelCheckboxGroup, { onCheckedChangeGrannySmith: changeSpy })

      const checkboxes = screen.getAllByRole('checkbox')
      const labels = screen.getAllByTestId('label')
      const inputs = document.querySelectorAll('input[type="checkbox"]')

      checkboxes.forEach((checkbox, index) => {
        const label = labels[index]
        const input = inputs[index]
        expect(label.getAttribute('for')).not.toBeNull()
        expect(label.getAttribute('for')).toBe(input.getAttribute('id'))
        expect(label.getAttribute('id')).not.toBeNull()
        expect(label.getAttribute('id')).toBe(checkbox.getAttribute('aria-labelledby'))
      })

      await fireEvent.click(labels[2])
      expect(changeSpy.mock.calls.length).toBe(1)
    })

    it('explicit association — Field.Label and Field.Description link to each checkbox', async () => {
      const spy = vi.fn()
      render(ExplicitLabelCheckboxGroup, { onCheckedChangeGala: spy })

      const checkboxes = screen.getAllByRole('checkbox')
      const labels = screen.getAllByTestId('label')
      const descriptions = screen.getAllByTestId('description')
      const inputs = document.querySelectorAll('input[type="checkbox"]')

      checkboxes.forEach((checkbox, index) => {
        const label = labels[index]
        const description = descriptions[index]
        const input = inputs[index]

        expect(label.getAttribute('for')).not.toBeNull()
        expect(label.getAttribute('for')).toBe(input.getAttribute('id'))
        expect(label.getAttribute('id')).not.toBeNull()
        expect(label.getAttribute('id')).toBe(checkbox.getAttribute('aria-labelledby'))
        expect(description.getAttribute('id')).not.toBeNull()
        expect(description.getAttribute('id')).toBe(checkbox.getAttribute('aria-describedby'))
      })

      await fireEvent.click(screen.getByText('Gala'))
      expect(spy.mock.calls.length).toBe(1)
    })
  })

  describe('Field.Description', () => {
    it('links the group and individual checkboxes', () => {
      render(GroupDescriptionCheckboxGroup)

      const groupDescription = screen.getByTestId('group-description')
      const groupDescriptionId = groupDescription.getAttribute('id')
      expect(groupDescriptionId).not.toBeNull()
      expect(screen.getByRole('group').getAttribute('aria-describedby')).toContain(
        groupDescriptionId
      )
      expect(screen.getByRole('checkbox').getAttribute('aria-describedby')).toContain(
        groupDescriptionId
      )
      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-describedby',
        `checkbox-description ${groupDescriptionId}`
      )
      expect(screen.getByRole('group')).toHaveAttribute(
        'aria-describedby',
        `external-description ${groupDescriptionId}`
      )
    })
  })

  describe('Form values', () => {
    it('projects selected enabled checkboxes while preserving the logical validation value', async () => {
      const onFormSubmit = vi.fn()
      const validateGroup = vi.fn((_value: unknown, _values: Record<string, unknown>) => null)
      const validateOther = vi.fn((_value: unknown, _values: Record<string, unknown>) => null)
      render(FormValuesDisabled, { onFormSubmit, validateGroup, validateOther })

      await fireEvent.click(screen.getByText('Submit'))

      expect(validateGroup).toHaveBeenLastCalledWith(['apple', 'banana'], {
        fruits: ['apple'],
        other: 'value'
      })
      expect(validateOther.mock.lastCall?.[1]?.fruits).toEqual(['apple'])
      expect(onFormSubmit.mock.lastCall?.[0].fruits).toEqual(['apple'])

      await fireEvent.click(screen.getByText('Enable'))
      await fireEvent.click(screen.getByText('Submit'))

      expect(validateGroup).toHaveBeenLastCalledWith(['apple', 'banana'], {
        fruits: ['apple', 'banana'],
        other: 'value'
      })
      expect(validateOther.mock.lastCall?.[1]?.fruits).toEqual(['apple', 'banana'])
      expect(onFormSubmit.mock.lastCall?.[0].fruits).toEqual(['apple', 'banana'])
    })

    it('omits selected unmounted checkboxes while retaining group state across remounts', async () => {
      const onFormSubmit = vi.fn()
      render(FormValuesUnmount, { onFormSubmit })

      await fireEvent.click(screen.getByText('Toggle'))
      await fireEvent.click(screen.getByText('Submit'))
      expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] })

      await fireEvent.click(screen.getByText('Toggle'))
      expect(screen.getByTestId('banana')).toHaveAttribute('aria-checked', 'true')

      await fireEvent.click(screen.getByText('Submit'))
      expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ fruits: ['apple', 'banana'] })
    })

    it('preserves the logical field-name value when Checkbox.Root has no value prop', async () => {
      const onFormSubmit = vi.fn()
      render(FormValuesImplicitName, { onFormSubmit })

      await fireEvent.click(screen.getByText('Submit'))

      expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ fruits: ['fruits'] })
    })

    it('updates duplicate-value registrations before a parent layout effect submits', async () => {
      const onFormSubmit = vi.fn()
      render(DuplicateRegistrationSubmit, { onFormSubmit })

      await fireEvent.click(screen.getByText('Trim'))

      await waitFor(() => expect(onFormSubmit).toHaveBeenCalled())
      expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ items: ['two'] })
    })

    it('omits selected checkboxes associated with another form', async () => {
      const onFormSubmit = vi.fn()
      render(FormValuesExternal, { onFormSubmit })

      await fireEvent.click(screen.getByText('Submit'))

      expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] })
    })

    it('includes a context-portaled checkbox without native form association', async () => {
      const onFormSubmit = vi.fn()
      render(PortaledCheckboxForm, { onFormSubmit })

      await fireEvent.click(screen.getByText('Submit'))

      expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] })
    })

    it('includes a group fully portaled outside the form element', async () => {
      const onFormSubmit = vi.fn()
      render(PortaledGroupForm, { onFormSubmit })

      await fireEvent.click(screen.getByText('Submit'))

      expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] })
    })

    it('includes a portaled checkbox explicitly associated with the Form', async () => {
      const onFormSubmit = vi.fn()
      render(PortaledCheckboxFormAttr, { onFormSubmit })

      await fireEvent.click(screen.getByText('Submit'))

      expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] })
    })

    it('omits checkboxes disabled by a fieldset', async () => {
      const onFormSubmit = vi.fn()
      const validate = vi.fn((_value: unknown, _values: Record<string, unknown>) => null)
      render(FormValuesFieldset, { onFormSubmit, validate })

      await fireEvent.click(screen.getByText('Submit'))

      expect(validate.mock.lastCall?.[1]?.fruits).toEqual(['apple'])
      expect(onFormSubmit.mock.lastCall?.[0].fruits).toEqual(['apple'])
    })
  })

  describe.skipIf(isJSDOM)('Form', () => {
    it('focuses the invalid checkbox when a later checkbox in the group fails validation', async () => {
      const user = userEvent.setup()
      render(InvalidCheckboxFocus)

      const checkboxes = screen.getAllByTestId('checkbox')

      await user.click(screen.getByText('Submit'))

      expect(screen.getByTestId('error')).toHaveTextContent('required')
      expect(checkboxes[1]).toHaveFocus()
    })

    it('ignores required checkboxes associated with a different form', async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      render(FormRequiredExternal, { onFormSubmit })

      await user.click(screen.getByText('Submit'))

      expect(onFormSubmit).toHaveBeenCalledOnce()
    })

    it('stops validating a checkbox after it changes form owner', async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      render(FormOwnerChange, { onFormSubmit })

      await user.click(screen.getByText('Submit'))
      expect(onFormSubmit).not.toHaveBeenCalled()

      await user.click(screen.getByText('Move'))
      await user.click(screen.getByText('Submit'))

      expect(onFormSubmit).toHaveBeenCalledOnce()
    })

    it('validates and focuses required portaled checkboxes within the form', async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      render(PortaledRequiredCheckbox, { onFormSubmit })

      await user.click(screen.getByText('Submit'))

      expect(onFormSubmit).not.toHaveBeenCalled()
      expect(screen.getByTestId('portaled')).toHaveFocus()

      await user.click(screen.getByTestId('portaled'))
      await user.click(screen.getByText('Submit'))

      expect(onFormSubmit).toHaveBeenCalledOnce()
    })

    it('ignores a checkbox portaled into another form without a form attribute', async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      render(PortaledExternalFormCheckbox, { onFormSubmit })

      await user.click(screen.getByText('Submit'))

      expect(onFormSubmit).toHaveBeenCalledOnce()
    })

    it('skips a checkbox disabled by a fieldset when focusing Form errors', async () => {
      const user = userEvent.setup()
      render(FieldsetDisabledFocus)

      await user.click(screen.getByText('Submit'))

      expect(screen.getByTestId('enabled')).toHaveFocus()
      expect(screen.getByTestId('disabled')).not.toHaveFocus()
    })

    it('focuses a remaining checkbox when Form errors unmount the first checkbox', async () => {
      const user = userEvent.setup()
      render(UnmountFirstFocus)

      await user.click(screen.getByText('Submit'))

      expect(screen.queryByTestId('first')).toBe(null)
      expect(screen.getByTestId('second')).toHaveFocus()
    })

    it('skips a disabled representative checkbox on a later focus attempt', async () => {
      const user = userEvent.setup()
      render(DisabledRepresentativeFocus)

      await user.click(screen.getByText('Submit'))
      expect(screen.getByTestId('first')).toHaveFocus()

      await user.click(screen.getByText('Disable first'))
      await user.click(screen.getByText('Submit'))

      expect(screen.getByTestId('second')).toHaveFocus()
    })

    it('focuses a later invalid field when an inputless group is invalid without a control', async () => {
      const user = userEvent.setup()
      render(InputlessInvalidFocus)

      await user.click(screen.getByText('Submit'))

      expect(screen.getByTestId('email')).toHaveFocus()
    })

    it('focuses a later invalid field when every checkbox in an invalid group is disabled', async () => {
      const user = userEvent.setup()
      render(AllDisabledInvalidFocus)

      await user.click(screen.getByText('Submit'))

      expect(screen.getByTestId('email')).toHaveFocus()
    })

    it('clears a custom error when an inputless group becomes valid after submission', async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      const validate = vi.fn((value: unknown) =>
        (value as string[]).length > 0 ? null : 'required'
      )
      render(InputlessCustomError, { onFormSubmit, validate })

      await user.click(screen.getByText('Submit'))
      expect(screen.getByText('required')).not.toBe(null)

      await user.click(screen.getByText('Remove'))
      await user.click(screen.getByText('Select'))

      expect(screen.queryByText('required')).toBe(null)

      await user.click(screen.getByText('Submit'))
      expect(onFormSubmit).toHaveBeenCalledOnce()
    })

    it.each(['onSubmit', 'onBlur'] as const)(
      'does not validate on change with validationMode=%s after the final checkbox unmounts',
      async (validationMode) => {
        const user = userEvent.setup()
        const validate = vi.fn(() => 'invalid')
        render(UnmountValidationMode, { validationMode, validate })

        await user.click(screen.getByText('Remove'))
        validate.mockClear()
        await user.click(screen.getByText('Select'))

        expect(validate).not.toHaveBeenCalled()

        await user.click(screen.getByText('Submit'))

        expect(validate).toHaveBeenCalledOnce()
        expect(validate).toHaveBeenCalledWith(['one'], { group: [] })
      }
    )

    it.each(['onSubmit', 'onBlur'] as const)(
      'respects validationMode=%s when a controlled group starts without inputs',
      async (validationMode) => {
        const user = userEvent.setup()
        const validate = vi.fn(() => 'invalid')
        render(InputlessValidationMode, { validationMode, validate })

        validate.mockClear()
        await user.click(screen.getByText('Select one'))

        expect(validate).not.toHaveBeenCalled()

        await user.click(screen.getByText('Submit'))

        expect(validate).toHaveBeenCalledOnce()
        expect(validate).toHaveBeenCalledWith(['one'], { group: [] })

        await user.click(screen.getByText('Select two'))

        expect(validate).toHaveBeenCalledTimes(validationMode === 'onSubmit' ? 2 : 1)
      }
    )

    it('validates an inputless controlled group on change with validationMode=onChange', async () => {
      const user = userEvent.setup()
      const validate = vi.fn(() => null)
      render(InputlessOnChange, { validate })

      validate.mockClear()
      await user.click(screen.getByText('Select'))

      expect(validate).toHaveBeenCalledOnce()
      expect(validate).toHaveBeenCalledWith(['one'], { group: ['one'] })
    })

    it('validates an initially empty group through the imperative action', async () => {
      const user = userEvent.setup()
      const validate = vi.fn(() => 'invalid')
      render(EmptyGroupValidate, { validate })

      validate.mockClear()
      await user.click(screen.getByText('Validate'))

      expect(validate).toHaveBeenCalledOnce()
      expect(validate).toHaveBeenCalledWith([], { group: [] })
    })

    it('unblocks submission after every checkbox in the group unmounts', async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      render(UnmountAllRequired, { onFormSubmit })

      await user.click(screen.getByText('Submit'))
      expect(onFormSubmit).not.toHaveBeenCalled()

      await user.click(screen.getByText('Remove'))
      await user.click(screen.getByText('Submit'))

      expect(onFormSubmit).toHaveBeenCalledOnce()
    })

    it('still runs custom validation after every checkbox in the group unmounts', async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      const validate = vi.fn((value: unknown) =>
        (value as string[]).length > 0 ? null : 'required'
      )
      render(UnmountAllValidate, { onFormSubmit, validate })

      await user.click(screen.getByText('Remove'))

      validate.mockClear()
      await user.click(screen.getByText('Submit'))

      expect(validate).toHaveBeenCalled()
      expect(onFormSubmit).not.toHaveBeenCalled()
    })

    it('is validated as a group upon form submission', async () => {
      const validateSpy = vi.fn()
      render(CheckboxGroupValidateSubmit, { validate: validateSpy })

      await fireEvent.click(screen.getByText('Submit'))

      expect(validateSpy.mock.calls.length).toBe(1)
      expect(validateSpy.mock.calls[0][0]).toEqual(['fuji-apple', 'gala-apple'])
    })

    it('appends the id attribute of the error to aria-describedby of individual checkboxes', () => {
      render(CheckboxGroupErrorDescribedBy)

      const error = screen.getByTestId('error')
      expect(error).not.toBe(null)

      const [checkbox1] = screen.getAllByRole('checkbox')
      expect(checkbox1.getAttribute('aria-describedby')).toContain(error.getAttribute('id'))
      expect(checkbox1.getAttribute('aria-describedby')).toContain(
        screen.getByText('Description').getAttribute('id')
      )
    })

    it('includes the checkbox group value in form submission', async () => {
      const captured: { data: FormData | null } = { data: null }
      render(CheckboxGroupFormSubmit, { onData: (d: FormData) => (captured.data = d) })

      await fireEvent.click(screen.getByText('Submit'))

      expect(captured.data?.getAll('apple')).toEqual(['fuji-apple', 'gala-apple'])
    })

    it('focuses the first checkbox when the field receives an error from Form', async () => {
      render(CheckboxGroupFormError)

      expect(screen.queryByTestId('error')).toBe(null)

      await fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => {
        expect(screen.getByTestId('checkbox-one')).toHaveFocus()
      })

      expect(screen.getByTestId('checkbox-one')).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('error')).toHaveTextContent('server error')
    })
  })

  describe('revalidates on external controlled change', () => {
    it('revalidates when the controlled value changes externally', async () => {
      const validate = vi.fn((value: unknown) =>
        (value as string[]).includes('one') ? 'error' : null
      )
      render(RevalidateExternalCheckboxGroup, { validate })

      const checkboxes = screen.getAllByTestId('checkbox')
      const toggle = screen.getByText('Select externally')

      checkboxes.forEach((cb) => expect(cb).not.toHaveAttribute('aria-invalid'))
      const initialCallCount = validate.mock.calls.length

      await fireEvent.click(toggle)

      expect(validate.mock.calls.length).toBe(initialCallCount + 1)
      expect(validate.mock.lastCall?.[0]).toEqual(['one'])
      checkboxes.forEach((cb) => expect(cb).toHaveAttribute('aria-invalid', 'true'))
    })
  })

  describe('prop: id', () => {
    it('is forwarded to the root element', () => {
      render(IdCheckboxGroup, { id: 'group-id' })
      expect(screen.getByRole('group')).toHaveAttribute('id', 'group-id')
    })
  })

  describe('prop: as', () => {
    it('renders the element it is given, keeping the group role', () => {
      const { container } = render(CheckboxGroup, { as: 'fieldset' })
      const root = container.firstElementChild
      expect(root?.tagName.toLowerCase()).toBe('fieldset')
      expect(root).toHaveAttribute('role', 'group')
    })
  })
})
