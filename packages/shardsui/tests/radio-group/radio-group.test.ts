import type { FieldValidator } from '$lib/components/field'
import { RadioGroup } from '$lib/components/radio-group'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import ArrowNavigation from './fixtures/arrow-navigation.svelte'
import BasicRadioGroup from './fixtures/basic-radio-group.svelte'
import CancelField from './fixtures/cancel-field.svelte'
import EnterKeyRadioGroup from './fixtures/enter-key-radio-group.svelte'
import ExternalFormValues from './fixtures/external-form-values.svelte'
import ExternalForm from './fixtures/external-form.svelte'
import FieldLabelExplicit from './fixtures/field-label-explicit.svelte'
import FieldLabelImplicit from './fixtures/field-label-implicit.svelte'
import FieldNameOverride from './fixtures/field-name-override.svelte'
import FormDisabled from './fixtures/form-disabled.svelte'
import GroupDescComposition from './fixtures/group-desc-composition.svelte'
import IndicatorHooks from './fixtures/indicator-hooks.svelte'
import LabelPrecedence from './fixtures/label-precedence.svelte'
import ModifierKeys from './fixtures/modifier-keys.svelte'
import NativeFieldsetForm from './fixtures/native-fieldset-form.svelte'
import NativeFieldsetRequiredForm from './fixtures/native-fieldset-required-form.svelte'
import NativeFormSubmit from './fixtures/native-form-submit.svelte'
import NativeForm from './fixtures/native-form.svelte'
import PortaledGroupForm from './fixtures/portaled-group-form.svelte'
import PortaledRadioForm from './fixtures/portaled-radio-form.svelte'
import RadioGroupAllDisabled from './fixtures/radio-group-all-disabled.svelte'
import RadioGroupErrorDescribedBy from './fixtures/radio-group-error-described-by.svelte'
import RadioGroupExternalErrors from './fixtures/radio-group-external-errors.svelte'
import RadioGroupExternalRevalidate from './fixtures/radio-group-external-revalidate.svelte'
import RadioGroupInField from './fixtures/radio-group-in-field.svelte'
import RadioGroupInFieldset from './fixtures/radio-group-in-fieldset.svelte'
import RadioGroupInForm from './fixtures/radio-group-in-form.svelte'
import RadioGroupNativeLabel from './fixtures/radio-group-native-label.svelte'
import RequiredDisabledSelected from './fixtures/required-disabled-selected.svelte'
import StyleHooks from './fixtures/style-hooks.svelte'
import UnmountAllRequired from './fixtures/unmount-all-required.svelte'
import UnmountAllValidate from './fixtures/unmount-all-validate.svelte'
import ValidationModeOnBlur from './fixtures/validation-mode-on-blur.svelte'

function getRadioItems() {
  return screen.getAllByRole('radio')
}

describe('<RadioGroup />', () => {
  describe('prop: as', () => {
    it.each(['div', 'section'] as const)('renders a <%s>', (as) => {
      render(RadioGroup, { as, 'data-testid': 'group' })

      expect(screen.getByTestId('group').tagName.toLowerCase()).toBe(as)
    })
  })

  describe('extra props', () => {
    it('can override the built-in attributes', () => {
      render(RadioGroup, { role: 'switch' })
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })
  })

  describe('prop: id', () => {
    it('is forwarded to the root element', () => {
      render(RadioGroup, { id: 'group-id' })
      expect(screen.getByRole('radiogroup')).toHaveAttribute('id', 'group-id')
    })
  })

  describe('prop: value', () => {
    it('does not forward the value prop as an HTML attribute', () => {
      render(RadioGroup, { value: 'test', 'data-testid': 'radio-group' })
      expect(screen.getByTestId('radio-group')).not.toHaveAttribute('value')
    })
  })

  describe('prop: onValueChange', () => {
    it('calls onValueChange when an item is clicked', () => {
      const onValueChange = vi.fn()
      render(BasicRadioGroup, { onValueChange })
      const [radioA] = getRadioItems()

      fireEvent.click(radioA)

      expect(onValueChange.mock.calls.length).toBe(1)
      expect(onValueChange.mock.calls[0][0]).toBe('a')
    })

    it('selects an item with Space on keyup', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(BasicRadioGroup, { onValueChange })

      screen.getByTestId('radio-a').focus()

      await user.keyboard('[Space>]')
      expect(onValueChange).not.toHaveBeenCalled()

      await user.keyboard('[/Space]')
      expect(onValueChange).toHaveBeenCalledOnce()
      expect(onValueChange).toHaveBeenLastCalledWith('a')
    })

    it('does not change state when the value setter rejects a root click', async () => {
      const user = userEvent.setup()
      render(CancelField)

      const group = screen.getByRole('radiogroup')
      const item = screen.getByTestId('a')
      const input = item.nextElementSibling as HTMLInputElement

      await user.click(item)

      expect(item).toHaveAttribute('aria-checked', 'false')
      expect(input.checked).toBe(false)
      expect(group).not.toHaveAttribute('data-touched')
      expect(group).not.toHaveAttribute('data-dirty')
      expect(group).not.toHaveAttribute('data-filled')
    })

    it('does not change state when the value setter rejects a hidden input click', async () => {
      const user = userEvent.setup()
      render(CancelField)

      const group = screen.getByRole('radiogroup')
      const item = screen.getByTestId('a')
      const input = document.querySelector<HTMLInputElement>('input[type="radio"]')

      expect(input).not.toBe(null)

      await user.click(input!)

      expect(item).toHaveAttribute('aria-checked', 'false')
      expect(input!.checked).toBe(false)
      expect(group).not.toHaveAttribute('data-touched')
      expect(group).not.toHaveAttribute('data-dirty')
      expect(group).not.toHaveAttribute('data-filled')
    })

    it('does not change state when the value setter rejects arrow key navigation', async () => {
      const user = userEvent.setup()
      render(CancelField)

      const group = screen.getByRole('radiogroup')
      const a = screen.getByTestId('a')
      const b = screen.getByTestId('b')

      a.focus()
      await user.keyboard('{ArrowDown}')

      expect(b).toHaveFocus()
      expect(a).toHaveAttribute('aria-checked', 'false')
      expect(b).toHaveAttribute('aria-checked', 'false')
      expect((a.nextElementSibling as HTMLInputElement).checked).toBe(false)
      expect((b.nextElementSibling as HTMLInputElement).checked).toBe(false)
      expect(group).not.toHaveAttribute('data-touched')
      expect(group).not.toHaveAttribute('data-dirty')
      expect(group).not.toHaveAttribute('data-filled')
    })
  })

  describe('prop: disabled', () => {
    it('has the aria-disabled attribute', () => {
      render(BasicRadioGroup, { disabled: true })

      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true')
      getRadioItems().forEach((item) => {
        expect(item).toHaveAttribute('aria-disabled', 'true')
        expect(item).toHaveAttribute('data-disabled')
      })
      document.querySelectorAll('input[type="radio"]').forEach((input) => {
        expect(input).toHaveAttribute('disabled')
      })
    })

    it('does not have the aria attribute when disabled is not set', () => {
      render(BasicRadioGroup)
      expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-disabled')
    })

    it('does not change its state when clicked', () => {
      render(BasicRadioGroup, { disabled: true })
      const [radioA] = getRadioItems()

      expect(radioA).toHaveAttribute('aria-checked', 'false')

      fireEvent.click(radioA)

      expect(radioA).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: readOnly', () => {
    it('has the aria-readonly attribute', () => {
      render(BasicRadioGroup, { readOnly: true })
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-readonly', 'true')
    })

    it('does not have the aria attribute when readOnly is not set', () => {
      render(BasicRadioGroup)
      expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-readonly')
    })

    it('does not change its state when clicked', () => {
      render(BasicRadioGroup, { readOnly: true })
      const [radioA] = getRadioItems()

      expect(radioA).toHaveAttribute('aria-checked', 'false')

      fireEvent.click(radioA)

      expect(radioA).toHaveAttribute('aria-checked', 'false')
    })
  })

  it('updates its state if the underlying input is toggled', async () => {
    render(BasicRadioGroup)
    const [radioA] = getRadioItems()
    const input = document.querySelector<HTMLInputElement>('input[type="radio"]')

    await fireEvent.click(input!)

    expect(radioA).toHaveAttribute('aria-checked', 'true')
  })

  it('places the style hooks on the root and subcomponents', () => {
    render(StyleHooks)

    const root = screen.getByRole('radiogroup')
    const item = screen.getByTestId('item')
    const indicator = screen.getByTestId('indicator')

    expect(root).toHaveAttribute('data-disabled', '')
    expect(root).toHaveAttribute('data-readonly', '')
    expect(root).toHaveAttribute('data-required', '')

    expect(item).toHaveAttribute('data-checked', '')
    expect(item).toHaveAttribute('data-disabled', '')
    expect(item).toHaveAttribute('data-readonly', '')
    expect(item).toHaveAttribute('data-required', '')

    expect(indicator).toHaveAttribute('data-checked', '')
    expect(indicator).toHaveAttribute('data-disabled', '')
    expect(indicator).toHaveAttribute('data-readonly', '')
    expect(indicator).toHaveAttribute('data-required', '')
  })

  it('sets the name and value attributes on each radio input', () => {
    render(BasicRadioGroup, { name: 'radio-group' })

    const inputs = document.querySelectorAll<HTMLInputElement>('input[type="radio"]')

    expect([...inputs].map((input) => input.getAttribute('value'))).toEqual(['a', 'b', 'c'])
    inputs.forEach((input) => {
      expect(input).toHaveAttribute('name', 'radio-group')
    })
  })

  it('automatically selects a radio upon navigation', async () => {
    const user = userEvent.setup()
    render(RadioGroupInField)

    const group = screen.getByTestId('radio-group')
    const a = screen.getByTestId('radio-a')
    const b = screen.getByTestId('radio-b')

    a.focus()

    expect(group).not.toHaveAttribute('data-touched')
    expect(a).toHaveAttribute('aria-checked', 'false')

    await user.keyboard('{ArrowDown}')

    expect(a).toHaveAttribute('aria-checked', 'false')
    expect(b).toHaveFocus()
    expect(b).toHaveAttribute('aria-checked', 'true')
    expect(group).toHaveAttribute('data-touched', '')
  })

  describe('manages arrow key navigation', () => {
    const directions = [
      ['ltr', 'ArrowRight', 'ArrowLeft'],
      ['rtl', 'ArrowLeft', 'ArrowRight']
    ] as const

    directions.forEach(([direction, horizontalNextKey, horizontalPrevKey]) => {
      describe.skipIf(isJSDOM && direction === 'rtl')(direction, () => {
        it('moves focus with the arrow keys and keeps a roving tab stop', async () => {
          const user = userEvent.setup()
          render(ArrowNavigation, { direction })

          const a = screen.getByTestId('a')
          const b = screen.getByTestId('b')
          const c = screen.getByTestId('c')
          const after = screen.getByTestId('after')

          a.focus()
          expect(a).toHaveFocus()

          await user.keyboard('{ArrowDown}')
          expect(b).toHaveFocus()

          await user.keyboard('{ArrowDown}')
          expect(c).toHaveFocus()

          await user.keyboard('{ArrowDown}')
          expect(a).toHaveFocus()

          await user.keyboard('{ArrowUp}')
          expect(c).toHaveFocus()

          await user.keyboard('{ArrowUp}')
          expect(b).toHaveFocus()

          await user.keyboard('{ArrowUp}')
          expect(a).toHaveFocus()

          await user.keyboard(`{${horizontalPrevKey}}`)
          expect(c).toHaveFocus()

          await user.keyboard(`{${horizontalNextKey}}`)
          expect(a).toHaveFocus()

          await user.tab()
          expect(after).toHaveFocus()

          await user.tab({ shift: true })
          expect(a).toHaveFocus()

          await user.keyboard(`{${horizontalPrevKey}}`)
          expect(c).toHaveFocus()

          await user.tab({ shift: true })
          await user.tab()
          expect(c).toHaveFocus()
        })

        describe('modifier keys', () => {
          it('when Shift is pressed arrow keys move focus normally', async () => {
            const user = userEvent.setup()
            render(ModifierKeys, { direction })

            const a = screen.getByTestId('a')
            const b = screen.getByTestId('b')
            const c = screen.getByTestId('c')

            await user.keyboard('{Tab}')
            expect(a).toHaveFocus()

            await user.keyboard(`{Shift>}{${horizontalNextKey}}`)
            expect(b).toHaveFocus()

            await user.keyboard('{Shift>}{ArrowDown}')
            expect(c).toHaveFocus()
          })
        })
      })
    })
  })

  describe('style hooks', () => {
    it('applies data-checked and data-unchecked to radio root and indicator', async () => {
      render(IndicatorHooks)

      const a = screen.getByTestId('a')
      const b = screen.getByTestId('b')
      const indicatorA = screen.getByTestId('indicator-a')
      const indicatorB = screen.getByTestId('indicator-b')

      expect(a).toHaveAttribute('data-unchecked', '')
      expect(indicatorA).toHaveAttribute('data-unchecked', '')
      expect(b).toHaveAttribute('data-unchecked', '')
      expect(indicatorB).toHaveAttribute('data-unchecked', '')

      await fireEvent.click(a)

      expect(a).toHaveAttribute('data-checked', '')
      expect(indicatorA).toHaveAttribute('data-checked', '')
      expect(b).toHaveAttribute('data-unchecked', '')
      expect(indicatorB).toHaveAttribute('data-unchecked', '')

      await fireEvent.click(b)

      expect(a).toHaveAttribute('data-unchecked', '')
      expect(indicatorA).toHaveAttribute('data-unchecked', '')
      expect(b).toHaveAttribute('data-checked', '')
      expect(indicatorB).toHaveAttribute('data-checked', '')

      await fireEvent.click(a)

      expect(a).toHaveAttribute('data-checked', '')
      expect(indicatorA).toHaveAttribute('data-checked', '')
      expect(b).toHaveAttribute('data-unchecked', '')
      expect(indicatorB).toHaveAttribute('data-unchecked', '')
    })
  })

  it('sets tabIndex=0 to the correct element initially', () => {
    render(BasicRadioGroup, { value: 'b' })
    const [radioA, radioB] = getRadioItems()

    expect(radioA).not.toHaveAttribute('tabindex', '0')
    expect(radioB).toHaveAttribute('tabindex', '0')
  })

  describe('with native <label>', () => {
    it('associates implicitly', async () => {
      const changeSpy = vi.fn()
      render(RadioGroupNativeLabel, { onValueChange: changeSpy })

      const [label1, label2] = screen.getAllByTestId('label')

      await fireEvent.click(label1)
      expect(changeSpy.mock.calls.length).toBe(1)
      expect(changeSpy.mock.lastCall?.[0]).toBe('apple')

      await fireEvent.click(label2)
      expect(changeSpy.mock.calls.length).toBe(2)
      expect(changeSpy.mock.lastCall?.[0]).toBe('banana')
    })

    it('associates explicitly', async () => {
      const changeSpy = vi.fn()
      render(RadioGroupNativeLabel, { explicit: true, onValueChange: changeSpy })

      const [label1, label2] = screen.getAllByTestId('label')

      await fireEvent.click(label1)
      expect(changeSpy.mock.calls.length).toBe(1)
      expect(changeSpy.mock.lastCall?.[0]).toBe('apple')

      await fireEvent.click(label2)
      expect(changeSpy.mock.calls.length).toBe(2)
      expect(changeSpy.mock.lastCall?.[0]).toBe('banana')
    })
  })

  describe('Field', () => {
    it('prefers the Field.Root name over the RadioGroup name on the radio input', () => {
      render(FieldNameOverride)

      const input = screen.getByTestId('item').nextElementSibling as HTMLInputElement

      expect(input).toHaveAttribute('name', 'test')
    })

    it('passes the name prop to the radio inputs', () => {
      render(RadioGroupInField, { name: 'field-radio' })
      const inputs = document.querySelectorAll<HTMLInputElement>('input[type="radio"]')
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('name', 'field-radio')
      })
    })

    describe('Field.Root', () => {
      it('receives the disabled prop from Field.Root', () => {
        render(RadioGroupInField, { disabled: true })
        const radioGroup = screen.getByRole('radiogroup')
        const [radio] = getRadioItems()

        expect(radioGroup).toHaveAttribute('aria-disabled', 'true')
        expect(radioGroup).toHaveAttribute('data-disabled')
        expect(radio).toHaveAttribute('aria-disabled', 'true')
        expect(radio).toHaveAttribute('data-disabled')
      })

      it('revalidates when the controlled value changes externally', async () => {
        const validateSpy = vi.fn<FieldValidator>((value) => (value === 'b' ? 'error' : null))
        render(RadioGroupExternalRevalidate, { validate: validateSpy })

        const radioGroup = screen.getByRole('radiogroup')
        const toggle = screen.getByText('Select externally')

        expect(radioGroup).not.toHaveAttribute('aria-invalid')
        const initialCallCount = validateSpy.mock.calls.length

        await fireEvent.click(toggle)

        expect(validateSpy.mock.calls.length).toBe(initialCallCount + 1)
        expect(validateSpy.mock.lastCall?.[0]).toBe('b')
        expect(radioGroup).toHaveAttribute('aria-invalid', 'true')
      })
    })

    describe('Field.Label', () => {
      it('associates implicitly', async () => {
        const changeSpy = vi.fn()
        render(FieldLabelImplicit, { onValueChange: changeSpy })

        const labels = screen.getAllByTestId('label')
        expect(labels.length).toBe(2)
        labels.forEach((label) => {
          expect(label).toHaveAttribute('for')
        })

        await fireEvent.click(screen.getByText('Apple'))
        expect(changeSpy.mock.calls.length).toBe(1)
        expect(changeSpy.mock.calls.at(-1)?.[0]).toBe('apple')
      })

      it('associates explicitly', async () => {
        const changeSpy = vi.fn()
        render(FieldLabelExplicit, { onValueChange: changeSpy })

        const radios = getRadioItems()
        const labels = screen.getAllByTestId('label')
        const descriptions = screen.getAllByTestId('description')
        const inputs = document.querySelectorAll('input[type="radio"]')

        radios.forEach((radio, index) => {
          const label = labels[index]
          const description = descriptions[index]
          const input = inputs[index]

          expect(label.getAttribute('for')).not.toBe(null)
          expect(label.getAttribute('for')).toBe(input?.getAttribute('id'))
          expect(description.getAttribute('id')).not.toBe(null)
          expect(description.getAttribute('id')).toBe(radio.getAttribute('aria-describedby'))
        })

        await fireEvent.click(screen.getByText('Banana'))
        expect(changeSpy.mock.calls.at(-1)?.[0]).toBe('banana')
      })
    })

    describe('Field.Description', () => {
      it('links the group and individual radios', () => {
        render(GroupDescComposition)

        const groupDescription = screen.getByTestId('group-description')
        const groupDescriptionId = groupDescription.getAttribute('id')
        expect(groupDescriptionId).not.toBe(null)

        expect(screen.getByRole('radio')).toHaveAttribute(
          'aria-describedby',
          `radio-description ${groupDescriptionId}`
        )
        expect(screen.getByRole('radiogroup')).toHaveAttribute(
          'aria-describedby',
          `external-description ${groupDescriptionId}`
        )
      })
    })

    describe('prop: validationMode', () => {
      it('onSubmit defers validation to submit, then revalidates on change', async () => {
        render(RadioGroupInForm, {
          validate: (value) => (value === 'a' || value === 'c' ? 'custom error' : null)
        })
        const group = screen.getByTestId('group')

        expect(group).not.toHaveAttribute('aria-invalid')

        await fireEvent.click(screen.getByTestId('item-a'))
        expect(screen.getByTestId('item-a')).toHaveAttribute('data-checked', '')
        expect(group).not.toHaveAttribute('aria-invalid')

        await fireEvent.click(screen.getByTestId('item-c'))
        expect(screen.getByTestId('item-c')).toHaveAttribute('data-checked', '')
        expect(group).not.toHaveAttribute('aria-invalid')

        await fireEvent.click(screen.getByTestId('submit'))
        expect(group).toHaveAttribute('aria-invalid', 'true')

        await fireEvent.click(screen.getByTestId('item-b'))
        expect(screen.getByTestId('item-b')).toHaveAttribute('data-checked', '')
        expect(group).not.toHaveAttribute('aria-invalid', 'true')
      })

      it('onBlur validates only when focus leaves the group', async () => {
        const validate = vi.fn<FieldValidator>((value) => (value === 'a' ? 'error' : null))
        render(ValidationModeOnBlur, { validate })

        const group = screen.getByRole('radiogroup')
        const radioA = screen.getByTestId('radio-a')
        const radioB = screen.getByTestId('radio-b')

        await fireEvent.focusIn(radioA)
        await fireEvent.focusOut(group, { relatedTarget: radioB })

        expect(validate).not.toHaveBeenCalled()

        await fireEvent.focusOut(group, { relatedTarget: screen.getByText('Outside') })

        await waitFor(() => expect(validate).toHaveBeenCalledTimes(1))
        expect(validate.mock.calls[0][0]).toBe('a')
        await waitFor(() => expect(group).toHaveAttribute('aria-invalid', 'true'))
      })
    })
  })

  describe('Fieldset', () => {
    it('updates label precedence without retaining replaced or unmounted IDs', async () => {
      const user = userEvent.setup()
      render(LabelPrecedence)

      const radioGroup = screen.getByRole('radiogroup')

      expect(radioGroup).toHaveAttribute('aria-labelledby', 'explicit-label')

      await user.click(screen.getByRole('button', { name: 'remove explicit' }))
      expect(radioGroup).toHaveAttribute('aria-labelledby', 'field-label-a')

      await user.click(screen.getByRole('button', { name: 'remove field label' }))
      expect(radioGroup).toHaveAttribute('aria-labelledby', 'legend-a')

      await user.click(screen.getByRole('button', { name: 'mount field replacement' }))
      expect(radioGroup).toHaveAttribute('aria-labelledby', 'field-label-b')

      await user.click(screen.getByRole('button', { name: 'remove field label' }))
      expect(radioGroup).toHaveAttribute('aria-labelledby', 'legend-a')

      await user.click(screen.getByRole('button', { name: 'remove legend' }))
      expect(radioGroup).not.toHaveAttribute('aria-labelledby')

      await user.click(screen.getByRole('button', { name: 'mount legend replacement' }))
      expect(radioGroup).toHaveAttribute('aria-labelledby', 'legend-b')

      await user.click(screen.getByRole('button', { name: 'remove legend' }))
      expect(radioGroup).not.toHaveAttribute('aria-labelledby')
    })

    it('labels the radio group from the fieldset legend', () => {
      render(RadioGroupInFieldset)

      const legend = screen.getByText('Legend')
      const radioGroup = screen.getByRole('radiogroup')

      expect(radioGroup.getAttribute('aria-labelledby')).toBe(legend.getAttribute('id'))
    })
  })

  it('does not select an item with Enter', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(EnterKeyRadioGroup, { onValueChange })

    const item = screen.getByTestId('item')
    item.focus()

    await user.keyboard('[Enter]')

    expect(onValueChange).not.toHaveBeenCalled()
    expect(item).toHaveAttribute('aria-checked', 'false')
  })

  describe('Form', () => {
    it('unblocks submission after every radio in the group unmounts', async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      render(UnmountAllRequired, { onFormSubmit })

      await user.click(screen.getByText('Submit'))
      expect(onFormSubmit).not.toHaveBeenCalled()

      await user.click(screen.getByText('Remove'))
      await user.click(screen.getByText('Submit'))

      expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ choice: null })
    })

    it('runs the custom validator after every radio in the group unmounts', async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      const validate = vi.fn(() => 'always invalid')
      render(UnmountAllValidate, { onFormSubmit, validate })

      await user.click(screen.getByText('Remove'))
      await user.click(screen.getByText('Submit'))

      expect(onFormSubmit).not.toHaveBeenCalled()
      expect(screen.getByTestId('error')).toHaveTextContent('always invalid')
    })

    it.skipIf(isJSDOM)('omits a radio associated to another form via the form prop', async () => {
      const onFormSubmit = vi.fn()
      render(ExternalFormValues, { onFormSubmit })

      const form = screen.getByTestId('form') as HTMLFormElement
      expect(new FormData(form).getAll('choice')).toEqual([])

      await fireEvent.click(screen.getByText('Submit'))

      expect(onFormSubmit.mock.calls[0][0]).toEqual({ choice: null })
    })

    it('submits null to onFormSubmit when no radio is selected', () => {
      const onFormSubmit = vi.fn()
      render(RadioGroupInForm, { onFormSubmit, name: 'test' })

      fireEvent.click(screen.getByTestId('submit'))

      expect(onFormSubmit).toHaveBeenCalledTimes(1)
      expect(onFormSubmit.mock.calls[0][0]).toEqual({ test: null })
    })

    it('triggers native HTML validation on submit', async () => {
      render(RadioGroupInForm, { required: true })

      expect(screen.queryByTestId('error')).toBeNull()

      fireEvent.click(screen.getByTestId('submit'))

      await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('required'))
      expect(screen.getByTestId('group')).toHaveAttribute('aria-invalid', 'true')
    })

    it('clears required validation when a value is selected', async () => {
      render(RadioGroupInForm, { required: true })

      fireEvent.click(screen.getByTestId('submit'))
      await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('required'))
      expect(screen.getByTestId('item-a')).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('item-b')).toHaveAttribute('aria-invalid', 'true')

      fireEvent.click(screen.getByTestId('item-b'))

      await waitFor(() => expect(screen.queryByTestId('error')).toBeNull())
      expect(screen.getByTestId('group')).not.toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('item-a')).not.toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('item-b')).not.toHaveAttribute('aria-invalid', 'true')
    })

    it('focuses the first enabled radio when all radios start disabled', async () => {
      render(RadioGroupAllDisabled)

      await fireEvent.click(screen.getByText('Enable'))

      const radioA = screen.getByTestId('item-a')

      await fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => {
        expect(radioA).toHaveFocus()
      })
    })

    it('clears external errors on change', async () => {
      render(RadioGroupExternalErrors)

      const itemA = screen.getByTestId('item-a')
      const radioGroup = screen.getByTestId('radio-group')

      expect(screen.queryByTestId('error')).toHaveTextContent('test')

      await fireEvent.click(itemA)

      expect(screen.queryByTestId('error')).toBeNull()
      expect(radioGroup).not.toHaveAttribute('aria-invalid', 'true')
    })

    it('appends the error and description ids to aria-describedby of individual radios', async () => {
      render(RadioGroupErrorDescribedBy)

      expect(screen.queryByTestId('error')).toBeNull()

      await fireEvent.click(screen.getByText('Submit'))

      const error = screen.getByTestId('error')
      const radio = screen.getByRole('radio')
      const description = screen.getByText('description')

      await waitFor(() =>
        expect(radio.getAttribute('aria-describedby')).toContain(error.getAttribute('id'))
      )
      expect(radio.getAttribute('aria-describedby')).toContain(description.getAttribute('id'))
    })

    it('excludes a disabled selected radio from onFormSubmit', async () => {
      const handleSubmit = vi.fn()
      render(FormDisabled, { onFormSubmit: handleSubmit })

      await fireEvent.click(screen.getByTestId('toggle'))

      const form = screen.getByTestId('form') as HTMLFormElement
      expect(new FormData(form).get('test')).toBe(null)

      await fireEvent.click(screen.getByTestId('submit'))

      await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
      expect(handleSubmit.mock.calls[0][0]).toEqual({ test: null })
    })

    it('includes a selected radio again when it is re-enabled before submission', async () => {
      const handleSubmit = vi.fn()
      render(FormDisabled, { onFormSubmit: handleSubmit })

      const form = screen.getByTestId('form') as HTMLFormElement

      await fireEvent.click(screen.getByTestId('toggle'))
      expect(new FormData(form).get('test')).toBe(null)

      await fireEvent.click(screen.getByTestId('toggle'))
      expect(new FormData(form).get('test')).toBe('a')

      await fireEvent.click(screen.getByTestId('submit'))

      await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
      expect(handleSubmit.mock.calls[0][0]).toEqual({ test: 'a' })
    })

    it('excludes an initially disabled selected radio from onFormSubmit', async () => {
      const handleSubmit = vi.fn()
      render(FormDisabled, { onFormSubmit: handleSubmit, initialDisabled: true })

      const form = screen.getByTestId('form') as HTMLFormElement
      expect(new FormData(form).get('test')).toBe(null)

      await fireEvent.click(screen.getByTestId('submit'))

      await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
      expect(handleSubmit.mock.calls[0][0]).toEqual({ test: null })
    })

    it.skipIf(isJSDOM)(
      'projects an enabled selected radio, matching native form data',
      async () => {
        const handleSubmit = vi.fn()
        render(FormDisabled, { onFormSubmit: handleSubmit })

        const form = screen.getByTestId('form') as HTMLFormElement
        expect(new FormData(form).getAll('test')).toEqual(['a'])

        await fireEvent.click(screen.getByTestId('submit'))

        await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
        expect(handleSubmit.mock.calls[0][0]).toEqual({ test: 'a' })
      }
    )

    it.skipIf(isJSDOM)(
      'excludes a radio disabled through an ancestor <fieldset disabled> from onFormSubmit',
      async () => {
        const handleSubmit = vi.fn()
        render(NativeFieldsetForm, { onFormSubmit: handleSubmit })

        const form = screen.getByTestId('form') as HTMLFormElement
        expect(new FormData(form).getAll('choice')).toEqual([])

        await fireEvent.click(screen.getByText('Submit'))

        await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
        expect(handleSubmit.mock.calls[0][0]).toEqual({ choice: null })
      }
    )

    it.skipIf(isJSDOM)(
      'includes a selected radio after its ancestor fieldset is enabled',
      async () => {
        const handleSubmit = vi.fn()
        render(NativeFieldsetForm, { onFormSubmit: handleSubmit })

        const form = screen.getByTestId('form') as HTMLFormElement
        expect(new FormData(form).getAll('choice')).toEqual([])

        await fireEvent.click(screen.getByText('Enable'))
        expect(new FormData(form).getAll('choice')).toEqual(['a'])

        await fireEvent.click(screen.getByText('Submit'))

        await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
        expect(handleSubmit.mock.calls[0][0]).toEqual({ choice: 'a' })
      }
    )

    it.skipIf(isJSDOM)(
      'includes a portaled radio without native form association in onFormSubmit',
      async () => {
        const handleSubmit = vi.fn()
        render(PortaledRadioForm, { onFormSubmit: handleSubmit })

        const form = screen.getByTestId('form') as HTMLFormElement
        expect(new FormData(form).getAll('choice')).toEqual([])

        await fireEvent.click(screen.getByText('Submit'))

        await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
        expect(handleSubmit.mock.calls[0][0]).toEqual({ choice: 'a' })
      }
    )

    it('includes a group fully portaled outside the form element in onFormSubmit', async () => {
      const handleSubmit = vi.fn()
      render(PortaledGroupForm, { onFormSubmit: handleSubmit })

      await fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
      expect(handleSubmit.mock.calls[0][0]).toEqual({ choice: 'a' })
    })

    it.skipIf(isJSDOM)(
      'submits null when the selected radio in a required group is disabled',
      async () => {
        const handleSubmit = vi.fn()
        render(RequiredDisabledSelected, { onFormSubmit: handleSubmit })

        const form = screen.getByTestId('form') as HTMLFormElement
        expect(new FormData(form).getAll('choice')).toEqual([])

        await fireEvent.click(screen.getByText('Submit'))

        await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
        expect(screen.queryByTestId('error')).toBeNull()
        expect(handleSubmit.mock.calls[0][0]).toEqual({ choice: null })
      }
    )

    it.skipIf(isJSDOM)(
      'validates and focuses the first radio after its ancestor fieldset is enabled',
      async () => {
        render(NativeFieldsetRequiredForm)

        await fireEvent.click(screen.getByText('Enable'))
        await fireEvent.click(screen.getByText('Submit'))

        await waitFor(() => expect(screen.getByText('required')).toBeVisible())
        expect(screen.getByTestId('item-a')).toHaveFocus()
      }
    )

    it.skipIf(isJSDOM)('submits to an external form via the form prop', () => {
      const submitSpy = vi.fn((event: SubmitEvent) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        return formData.get('group')
      })

      render(ExternalForm, { onSubmit: submitSpy })

      fireEvent.click(screen.getByRole('button'))

      expect(submitSpy.mock.calls.length).toBe(1)
      expect(submitSpy.mock.results.at(-1)?.value).toBe('b')
    })

    it.skipIf(isJSDOM)(
      'returns null when no radio is selected (matching native behavior)',
      async () => {
        const submitSpy = vi.fn((event: SubmitEvent) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget as HTMLFormElement)
          return formData.get('test-group')
        })

        render(NativeFormSubmit, { onSubmit: submitSpy })

        await fireEvent.click(screen.getByRole('button'))

        expect(submitSpy).toHaveBeenCalledOnce()
        expect(submitSpy.mock.results.at(-1)?.value).toBe(null)
      }
    )

    it.skipIf(isJSDOM)('returns null in native FormData when no radio is selected', () => {
      render(NativeForm)

      const form = screen.getByTestId('form') as HTMLFormElement
      expect(new FormData(form).get('group')).toBe(null)
    })

    it.skipIf(isJSDOM)('includes the selected radio value in native FormData', async () => {
      render(NativeForm)

      const radio = screen.getByTestId('radio-a')
      const form = screen.getByTestId('form') as HTMLFormElement

      await fireEvent.click(radio)

      expect(new FormData(form).get('group')).toBe('a')
    })
  })
})
